# Lyrixir NFT Licensing Implementation

## Complete Integration Flow

```
┌──────────────────────────────────────────────────────────────────┐
│                     Lyrixir NFT License Flow                      │
├──────────────────────────────────────────────────────────────────┤
│                                                                   │
│  1. PURCHASE (Stars)              2. MINT (TON)                   │
│  ┌─────────────────────┐         ┌─────────────────────┐         │
│  │ User buys license   │         │ User connects wallet│         │
│  │ with Telegram Stars │ ──────► │ and mints NFT       │         │
│  │ (existing flow)     │         │ (0.1 TON gas)       │         │
│  └─────────────────────┘         └─────────────────────┘         │
│           │                               │                       │
│           ▼                               ▼                       │
│  ┌─────────────────────┐         ┌─────────────────────┐         │
│  │ tg_licenses record  │         │ NFT on TON chain    │         │
│  │ created in Supabase │         │ with metadata URI   │         │
│  └─────────────────────┘         └─────────────────────┘         │
│                                                                   │
│  3. VERIFY                        4. TRADE                        │
│  ┌─────────────────────┐         ┌─────────────────────┐         │
│  │ Check ownership     │         │ List on GetGems     │         │
│  │ via TON API or      │         │ or transfer P2P     │         │
│  │ contract call       │         │ Royalty auto-paid   │         │
│  └─────────────────────┘         └─────────────────────┘         │
│                                                                   │
└──────────────────────────────────────────────────────────────────┘
```

## Database Schema Updates

```sql
-- Add NFT fields to existing tg_licenses table
ALTER TABLE tg_licenses
ADD COLUMN IF NOT EXISTS nft_status TEXT DEFAULT 'unminted'
  CHECK (nft_status IN ('unminted', 'minting', 'minted', 'failed'));

ALTER TABLE tg_licenses
ADD COLUMN IF NOT EXISTS nft_item_index BIGINT;

ALTER TABLE tg_licenses
ADD COLUMN IF NOT EXISTS nft_address TEXT;

ALTER TABLE tg_licenses
ADD COLUMN IF NOT EXISTS nft_tx_hash TEXT;

ALTER TABLE tg_licenses
ADD COLUMN IF NOT EXISTS nft_minted_at TIMESTAMPTZ;

ALTER TABLE tg_licenses
ADD COLUMN IF NOT EXISTS nft_owner_address TEXT;

CREATE INDEX IF NOT EXISTS idx_tg_licenses_nft_status ON tg_licenses(nft_status);
CREATE INDEX IF NOT EXISTS idx_tg_licenses_nft_address ON tg_licenses(nft_address);
CREATE INDEX IF NOT EXISTS idx_tg_licenses_nft_owner ON tg_licenses(nft_owner_address);

-- Wallet linking table
CREATE TABLE IF NOT EXISTS tg_ton_wallets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  telegram_user_id BIGINT NOT NULL REFERENCES tg_users(telegram_id),
  wallet_address TEXT NOT NULL,
  wallet_type TEXT, -- 'tonkeeper', 'tonhub', etc.
  is_primary BOOLEAN DEFAULT FALSE,
  verified_at TIMESTAMPTZ,
  linked_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(telegram_user_id, wallet_address)
);

CREATE INDEX IF NOT EXISTS idx_ton_wallets_user ON tg_ton_wallets(telegram_user_id);
CREATE INDEX IF NOT EXISTS idx_ton_wallets_address ON tg_ton_wallets(wallet_address);

-- NFT transfer tracking
CREATE TABLE IF NOT EXISTS tg_nft_transfers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  license_id UUID REFERENCES tg_licenses(id),
  nft_address TEXT NOT NULL,
  from_address TEXT NOT NULL,
  to_address TEXT NOT NULL,
  tx_hash TEXT NOT NULL,
  sale_price_ton DECIMAL(20, 9),
  royalty_amount_ton DECIMAL(20, 9),
  transferred_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_nft_transfers_license ON tg_nft_transfers(license_id);
CREATE INDEX IF NOT EXISTS idx_nft_transfers_nft ON tg_nft_transfers(nft_address);

-- Royalty tracking
CREATE TABLE IF NOT EXISTS tg_royalty_payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  transfer_id UUID REFERENCES tg_nft_transfers(id),
  track_id UUID REFERENCES tracks(id),
  artist_id UUID REFERENCES artists(id),
  amount_ton DECIMAL(20, 9) NOT NULL,
  tx_hash TEXT NOT NULL,
  paid_at TIMESTAMPTZ DEFAULT NOW()
);
```

## Backend Services

### Wallet Link Service

```typescript
// bot/services/tonWallet.ts
import { supabase } from "./supabase";

export async function linkWallet(
  telegramUserId: number,
  walletAddress: string,
  walletType?: string,
): Promise<boolean> {
  const { error } = await supabase.from("tg_ton_wallets").upsert(
    {
      telegram_user_id: telegramUserId,
      wallet_address: walletAddress,
      wallet_type: walletType,
      linked_at: new Date().toISOString(),
    },
    {
      onConflict: "telegram_user_id,wallet_address",
    },
  );

  if (error) {
    console.error("Error linking wallet:", error);
    return false;
  }

  return true;
}

export async function getLinkedWallets(telegramUserId: number) {
  const { data, error } = await supabase
    .from("tg_ton_wallets")
    .select("*")
    .eq("telegram_user_id", telegramUserId)
    .order("is_primary", { ascending: false });

  if (error) {
    console.error("Error getting wallets:", error);
    return [];
  }

  return data;
}

export async function getPrimaryWallet(
  telegramUserId: number,
): Promise<string | null> {
  const { data, error } = await supabase
    .from("tg_ton_wallets")
    .select("wallet_address")
    .eq("telegram_user_id", telegramUserId)
    .eq("is_primary", true)
    .single();

  if (error || !data) return null;
  return data.wallet_address;
}

export async function getUserByWallet(
  walletAddress: string,
): Promise<number | null> {
  const { data, error } = await supabase
    .from("tg_ton_wallets")
    .select("telegram_user_id")
    .eq("wallet_address", walletAddress)
    .single();

  if (error || !data) return null;
  return data.telegram_user_id;
}
```

### NFT Mint Service

```typescript
// bot/services/nftMint.ts
import { supabase } from "./supabase";
import { buildMintTransaction, verifyOwnership } from "../../lib/ton/mint";
import type { TgLicense } from "../types";

const COLLECTION_ADDRESS = process.env.COLLECTION_ADDRESS!;
const MINT_QUEUE_INTERVAL = 5000; // 5 seconds

export interface MintRequest {
  licenseId: string;
  ownerAddress: string;
}

// Queue for processing mints
const mintQueue: MintRequest[] = [];

export function queueMint(request: MintRequest) {
  mintQueue.push(request);
}

// Get mint-ready licenses for a user
export async function getMintableLicenses(telegramUserId: number) {
  const { data, error } = await supabase
    .from("tg_licenses")
    .select(
      `
      *,
      track:tracks(*),
      license_tier:license_tiers(*)
    `,
    )
    .eq("telegram_user_id", telegramUserId)
    .eq("nft_status", "unminted");

  if (error) {
    console.error("Error getting mintable licenses:", error);
    return [];
  }

  return data;
}

// Prepare mint transaction for user to sign
export async function prepareMintTransaction(
  licenseId: string,
  ownerAddress: string,
) {
  // Get license details
  const { data: license, error } = await supabase
    .from("tg_licenses")
    .select(
      `
      *,
      track:tracks(*, artist:artists(*)),
      license_tier:license_tiers(*)
    `,
    )
    .eq("id", licenseId)
    .single();

  if (error || !license) {
    throw new Error("License not found");
  }

  if (license.nft_status !== "unminted") {
    throw new Error("License already minted or minting");
  }

  // Mark as minting
  await supabase
    .from("tg_licenses")
    .update({ nft_status: "minting" })
    .eq("id", licenseId);

  // Build transaction
  const tx = await buildMintTransaction({
    trackId: license.track_id,
    trackTitle: license.track.title,
    artistName: license.track.artist.stage_name,
    licenseTier: license.license_tier.name,
    ownerAddress,
    expiresAt: license.expires_at ? new Date(license.expires_at) : undefined,
    territory: license.license_tier.territory,
    mediaTypes: license.license_tier.media_types,
    isExclusive: license.license_tier.is_exclusive,
  });

  return {
    ...tx,
    licenseId,
  };
}

// Confirm mint after user signs
export async function confirmMint(
  licenseId: string,
  txHash: string,
  itemIndex: string,
) {
  // Calculate NFT address from collection + index
  const nftAddress = await calculateNftAddress(
    COLLECTION_ADDRESS,
    BigInt(itemIndex),
  );

  const { error } = await supabase
    .from("tg_licenses")
    .update({
      nft_status: "minted",
      nft_item_index: parseInt(itemIndex),
      nft_address: nftAddress,
      nft_tx_hash: txHash,
      nft_minted_at: new Date().toISOString(),
    })
    .eq("id", licenseId);

  if (error) {
    console.error("Error confirming mint:", error);
    throw error;
  }

  return { nftAddress };
}

// Handle mint failure
export async function failMint(licenseId: string, reason: string) {
  await supabase
    .from("tg_licenses")
    .update({
      nft_status: "unminted", // Reset to allow retry
    })
    .eq("id", licenseId);

  console.error(`Mint failed for ${licenseId}: ${reason}`);
}

// Calculate NFT address from collection and index
async function calculateNftAddress(
  collectionAddress: string,
  itemIndex: bigint,
): Promise<string> {
  // This would use the same logic as the contract
  // For now, we'll verify after mint via API
  return ""; // Filled in after verification
}
```

### Transfer Tracking Service

```typescript
// bot/services/nftTransfers.ts
import { supabase } from "./supabase";
import { getNftHistory, getNftDetails } from "../../lib/ton/api";

// Sync transfer history for all minted licenses
export async function syncTransferHistory() {
  // Get all minted licenses
  const { data: licenses, error } = await supabase
    .from("tg_licenses")
    .select("id, nft_address")
    .eq("nft_status", "minted")
    .not("nft_address", "is", null);

  if (error || !licenses) return;

  for (const license of licenses) {
    await syncLicenseTransfers(license.id, license.nft_address);
  }
}

async function syncLicenseTransfers(licenseId: string, nftAddress: string) {
  try {
    // Get transfer history from TON API
    const transfers = await getNftHistory(nftAddress, 100);

    for (const transfer of transfers) {
      // Check if we already have this transfer
      const { data: existing } = await supabase
        .from("tg_nft_transfers")
        .select("id")
        .eq("tx_hash", transfer.transaction.hash)
        .single();

      if (existing) continue;

      // Record new transfer
      await supabase.from("tg_nft_transfers").insert({
        license_id: licenseId,
        nft_address: nftAddress,
        from_address: transfer.sender.address,
        to_address: transfer.recipient.address,
        tx_hash: transfer.transaction.hash,
        transferred_at: new Date(
          transfer.transaction.utime * 1000,
        ).toISOString(),
      });

      // Update current owner
      await supabase
        .from("tg_licenses")
        .update({ nft_owner_address: transfer.recipient.address })
        .eq("id", licenseId);
    }
  } catch (error) {
    console.error(`Error syncing transfers for ${nftAddress}:`, error);
  }
}

// Get current NFT owner (with cache)
export async function getCurrentOwner(
  licenseId: string,
): Promise<string | null> {
  // First check database
  const { data: license } = await supabase
    .from("tg_licenses")
    .select("nft_address, nft_owner_address")
    .eq("id", licenseId)
    .single();

  if (!license?.nft_address) return null;

  // Verify on-chain
  try {
    const nft = await getNftDetails(license.nft_address);
    const currentOwner = nft.owner.address;

    // Update if changed
    if (currentOwner !== license.nft_owner_address) {
      await supabase
        .from("tg_licenses")
        .update({ nft_owner_address: currentOwner })
        .eq("id", licenseId);
    }

    return currentOwner;
  } catch {
    return license.nft_owner_address;
  }
}
```

### Royalty Tracking Service

```typescript
// bot/services/royalties.ts
import { supabase } from "./supabase";

// Track royalty payments from marketplace sales
export async function recordRoyaltyPayment(
  transferId: string,
  trackId: string,
  artistId: string,
  amountTon: number,
  txHash: string,
) {
  const { error } = await supabase.from("tg_royalty_payments").insert({
    transfer_id: transferId,
    track_id: trackId,
    artist_id: artistId,
    amount_ton: amountTon,
    tx_hash: txHash,
  });

  if (error) {
    console.error("Error recording royalty:", error);
  }
}

// Get total royalties earned by artist
export async function getArtistRoyalties(artistId: string) {
  const { data, error } = await supabase
    .from("tg_royalty_payments")
    .select("amount_ton")
    .eq("artist_id", artistId);

  if (error) return { total: 0, count: 0 };

  const total = data.reduce((sum, r) => sum + parseFloat(r.amount_ton), 0);
  return { total, count: data.length };
}

// Get royalties for a specific track
export async function getTrackRoyalties(trackId: string) {
  const { data, error } = await supabase
    .from("tg_royalty_payments")
    .select("amount_ton, paid_at")
    .eq("track_id", trackId)
    .order("paid_at", { ascending: false });

  if (error) return [];
  return data;
}
```

## API Endpoints

### Mint Preparation Endpoint

```typescript
// api/ton/prepare-mint/route.ts
import { prepareMintTransaction } from "../../../bot/services/nftMint";

export async function POST(req: Request) {
  try {
    const { licenseId, ownerAddress, telegramUserId } = await req.json();

    if (!licenseId || !ownerAddress) {
      return Response.json(
        { error: "Missing required fields" },
        { status: 400 },
      );
    }

    // Verify license belongs to user
    const { data: license, error } = await supabase
      .from("tg_licenses")
      .select("telegram_user_id")
      .eq("id", licenseId)
      .single();

    if (error || !license) {
      return Response.json({ error: "License not found" }, { status: 404 });
    }

    if (license.telegram_user_id !== telegramUserId) {
      return Response.json({ error: "Unauthorized" }, { status: 403 });
    }

    const tx = await prepareMintTransaction(licenseId, ownerAddress);

    return Response.json(tx);
  } catch (error: any) {
    console.error("Prepare mint error:", error);
    return Response.json({ error: error.message }, { status: 500 });
  }
}
```

### Mint Confirmation Endpoint

```typescript
// api/ton/confirm-mint/route.ts
import { confirmMint, failMint } from "../../../bot/services/nftMint";

export async function POST(req: Request) {
  try {
    const {
      licenseId,
      txHash,
      itemIndex,
      success,
      error: mintError,
    } = await req.json();

    if (!licenseId) {
      return Response.json({ error: "Missing licenseId" }, { status: 400 });
    }

    if (!success) {
      await failMint(licenseId, mintError || "Unknown error");
      return Response.json({ success: false });
    }

    if (!txHash || !itemIndex) {
      return Response.json(
        { error: "Missing txHash or itemIndex" },
        { status: 400 },
      );
    }

    const result = await confirmMint(licenseId, txHash, itemIndex);

    return Response.json({ success: true, ...result });
  } catch (error: any) {
    console.error("Confirm mint error:", error);
    return Response.json({ error: error.message }, { status: 500 });
  }
}
```

### Ownership Verification Endpoint

```typescript
// api/ton/verify-ownership/route.ts
import { getCurrentOwner } from "../../../bot/services/nftTransfers";
import { getLinkedWallets } from "../../../bot/services/tonWallet";

export async function POST(req: Request) {
  try {
    const { licenseId, telegramUserId } = await req.json();

    // Get license
    const { data: license, error } = await supabase
      .from("tg_licenses")
      .select("nft_address, nft_status")
      .eq("id", licenseId)
      .single();

    if (error || !license) {
      return Response.json({ error: "License not found" }, { status: 404 });
    }

    // Not minted yet - check DB ownership
    if (license.nft_status !== "minted") {
      const { data: dbLicense } = await supabase
        .from("tg_licenses")
        .select("telegram_user_id")
        .eq("id", licenseId)
        .single();

      return Response.json({
        owned: dbLicense?.telegram_user_id === telegramUserId,
        type: "database",
      });
    }

    // Minted - check blockchain ownership
    const currentOwner = await getCurrentOwner(licenseId);
    const userWallets = await getLinkedWallets(telegramUserId);
    const userAddresses = userWallets.map((w) =>
      w.wallet_address.toLowerCase(),
    );

    const owned = currentOwner
      ? userAddresses.includes(currentOwner.toLowerCase())
      : false;

    return Response.json({
      owned,
      type: "blockchain",
      currentOwner,
      userWallets: userAddresses,
    });
  } catch (error: any) {
    console.error("Verify ownership error:", error);
    return Response.json({ error: error.message }, { status: 500 });
  }
}
```

## Mini App Components

### Complete Mint Flow

```tsx
// src/pages/MintLicense.tsx
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useTonConnectUI } from "@tonconnect/ui-react";
import { useTonWalletConnection } from "../hooks/useTonWallet";
import { useTelegram } from "../hooks/useTelegram";
import {
  Section,
  Cell,
  Button,
  Spinner,
  Placeholder,
} from "@telegram-apps/telegram-ui";

export function MintLicense() {
  const { licenseId } = useParams();
  const navigate = useNavigate();
  const [tonConnectUI] = useTonConnectUI();
  const { address, isConnected, connect } = useTonWalletConnection();
  const { user, haptic } = useTelegram();

  const [license, setLicense] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [minting, setMinting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    loadLicense();
  }, [licenseId]);

  const loadLicense = async () => {
    try {
      const response = await fetch(`/api/licenses/${licenseId}`);
      const data = await response.json();
      setLicense(data);
    } catch (err) {
      setError("Failed to load license");
    } finally {
      setLoading(false);
    }
  };

  const handleMint = async () => {
    if (!address || !user?.id) return;

    setMinting(true);
    setError(null);
    haptic?.impactOccurred("medium");

    try {
      // 1. Prepare transaction
      const prepareRes = await fetch("/api/ton/prepare-mint", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          licenseId,
          ownerAddress: address,
          telegramUserId: user.id,
        }),
      });

      if (!prepareRes.ok) {
        throw new Error("Failed to prepare mint");
      }

      const tx = await prepareRes.json();

      // 2. Send transaction via TON Connect
      const result = await tonConnectUI.sendTransaction({
        validUntil: Math.floor(Date.now() / 1000) + 300,
        messages: [
          {
            address: tx.to,
            amount: tx.value,
            payload: tx.body,
          },
        ],
      });

      // 3. Confirm mint
      const confirmRes = await fetch("/api/ton/confirm-mint", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          licenseId,
          txHash: result.boc,
          itemIndex: tx.itemIndex,
          success: true,
        }),
      });

      if (!confirmRes.ok) {
        throw new Error("Failed to confirm mint");
      }

      haptic?.notificationOccurred("success");
      setSuccess(true);
    } catch (err: any) {
      console.error("Mint error:", err);
      haptic?.notificationOccurred("error");
      setError(err.message || "Mint failed");

      // Report failure
      await fetch("/api/ton/confirm-mint", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          licenseId,
          success: false,
          error: err.message,
        }),
      });
    } finally {
      setMinting(false);
    }
  };

  if (loading) return <Spinner size="l" />;

  if (!license) {
    return (
      <Placeholder
        header="License Not Found"
        description="This license doesn't exist or you don't have access"
      />
    );
  }

  if (license.nft_status === "minted") {
    return (
      <div className="mint-complete">
        <h2>✅ Already Minted</h2>
        <p>This license is already an NFT</p>
        <a
          href={`https://getgems.io/nft/${license.nft_address}`}
          target="_blank"
          rel="noopener noreferrer"
        >
          View on GetGems →
        </a>
        <Button onClick={() => navigate("/licenses")}>Back to Licenses</Button>
      </div>
    );
  }

  if (success) {
    return (
      <div className="mint-success">
        <h2>🎉 NFT Minted!</h2>
        <p>Your license is now on the TON blockchain</p>
        <ul>
          <li>✓ Verifiable ownership</li>
          <li>✓ Tradeable on marketplaces</li>
          <li>✓ Automatic artist royalties</li>
        </ul>
        <Button onClick={() => navigate("/licenses")}>View My Licenses</Button>
      </div>
    );
  }

  return (
    <div className="mint-page">
      <Section header="License Details">
        <Cell subtitle={license.track.artist.stage_name}>
          {license.track.title}
        </Cell>
        <Cell subtitle="License Type">{license.license_tier.name}</Cell>
        {license.expires_at && (
          <Cell subtitle="Expires">
            {new Date(license.expires_at).toLocaleDateString()}
          </Cell>
        )}
      </Section>

      <Section header="Mint as NFT">
        <div className="mint-benefits">
          <p>Converting your license to an NFT provides:</p>
          <ul>
            <li>🔐 Blockchain-verified ownership proof</li>
            <li>💰 Ability to resell on TON marketplaces</li>
            <li>🎨 Automatic 5% royalty to artists on resales</li>
            <li>🌍 Permanent, decentralized record</li>
          </ul>
        </div>

        {!isConnected ? (
          <Button size="l" stretched onClick={connect}>
            Connect TON Wallet
          </Button>
        ) : (
          <>
            <Cell subtitle="Connected Wallet">
              {address?.slice(0, 8)}...{address?.slice(-6)}
            </Cell>

            {error && <p className="error">{error}</p>}

            <Button size="l" stretched onClick={handleMint} loading={minting}>
              {minting ? "Minting..." : "Mint NFT (0.1 TON)"}
            </Button>

            <p className="mint-note">
              Gas fee: ~0.1 TON for blockchain transaction
            </p>
          </>
        )}
      </Section>
    </div>
  );
}
```

## Deployment Checklist

### Smart Contracts

- [ ] Deploy collection to testnet
- [ ] Test minting on testnet
- [ ] Test transfers on testnet
- [ ] Verify royalty payments work
- [ ] Security review
- [ ] Deploy to mainnet
- [ ] Set correct royalty params (5%, Lyrixir wallet)

### Backend

- [ ] Add NFT columns to tg_licenses
- [ ] Create tg_ton_wallets table
- [ ] Create tg_nft_transfers table
- [ ] Create tg_royalty_payments table
- [ ] Deploy mint service
- [ ] Deploy transfer sync job
- [ ] Set up TON API key

### Mini App

- [ ] Install @tonconnect/ui-react
- [ ] Create tonconnect-manifest.json
- [ ] Add TonProvider
- [ ] Build wallet connection UI
- [ ] Build mint flow
- [ ] Build NFT gallery
- [ ] Test end-to-end

### Environment Variables

```env
# Add to existing .env
VITE_TON_NETWORK=mainnet
VITE_COLLECTION_ADDRESS=EQ...
TON_API_KEY=your_tonapi_key
COLLECTION_OWNER_MNEMONIC=word1 word2 ... (for minting)
```
