---
name: ton-ownership
description: TON blockchain integration for NFT-based music licensing. Use when building ownership verification, NFT minting, wallet connection, smart contracts, royalty distribution, or secondary market features in Telegram Mini Apps.
version: 1.0.0
---

# TON Ownership Skill

Blockchain-based music licensing using TON (The Open Network) for verifiable ownership, automated royalties, and secondary market trading.

## When to Use

- Connecting TON wallets in Telegram Mini Apps
- Minting NFT licenses for music tracks
- Verifying ownership on-chain
- Implementing royalty distribution
- Building secondary market features
- Creating exclusive content gating
- Token-gated access to premium features

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                    Lyrixir TON Architecture                  │
├─────────────────────────────────────────────────────────────┤
│  Telegram Mini App                                           │
│  ├── TON Connect UI (wallet connection)                      │
│  ├── NFT Gallery (owned licenses)                            │
│  ├── Mint Flow (purchase → mint)                             │
│  └── Transfer/List (secondary market)                        │
├─────────────────────────────────────────────────────────────┤
│  Smart Contracts (FunC)                                      │
│  ├── LyrixirCollection (NFT collection manager)              │
│  ├── LyrixirLicense (individual NFT license)                 │
│  ├── LyrixirRoyalty (royalty splitter)                       │
│  └── LyrixirMarket (P2P marketplace)                         │
├─────────────────────────────────────────────────────────────┤
│  Backend Services                                            │
│  ├── Mint Queue (Stars payment → NFT mint)                   │
│  ├── Metadata Server (NFT metadata API)                      │
│  ├── Indexer (ownership cache)                               │
│  └── Royalty Tracker (on-chain events)                       │
├─────────────────────────────────────────────────────────────┤
│  TON Blockchain                                              │
│  ├── Mainnet / Testnet                                       │
│  ├── NFT Collections (TEP-62)                                │
│  ├── NFT Items (TEP-64)                                      │
│  └── Jettons (optional token payments)                       │
└─────────────────────────────────────────────────────────────┘
```

## Core Concepts

### TON NFT Standards

| Standard | Purpose                 |
| -------- | ----------------------- |
| TEP-62   | NFT Collection standard |
| TEP-64   | NFT Item standard       |
| TEP-66   | NFT Royalty standard    |
| TEP-74   | Jetton (fungible token) |

### License NFT Metadata

```json
{
  "name": "Velvet Dreams - Commercial License",
  "description": "Commercial advertising license for 'Velvet Dreams' by Melody Morgan",
  "image": "https://lyrixir.com/nft/velvet-dreams.png",
  "content_url": "https://lyrixir.com/nft/velvet-dreams.json",
  "attributes": [
    { "trait_type": "Track", "value": "Velvet Dreams" },
    { "trait_type": "Artist", "value": "Melody Morgan" },
    { "trait_type": "License Tier", "value": "Commercial Advertisement" },
    { "trait_type": "Territory", "value": "Worldwide" },
    { "trait_type": "Duration", "value": "365 days" },
    { "trait_type": "Media Types", "value": "broadcast, advertising, digital" },
    { "trait_type": "Exclusive", "value": "false" },
    { "trait_type": "Minted", "value": "2026-01-29" },
    { "trait_type": "Expires", "value": "2027-01-29" }
  ],
  "external_url": "https://lyrixir.com/track/velvet-dreams",
  "animation_url": "https://cdn.lyrixir.com/previews/velvet-dreams.mp3"
}
```

---

## TON Connect Integration

### Installation

```bash
npm install @tonconnect/ui-react @tonconnect/sdk
```

### Manifest File

Create `public/tonconnect-manifest.json`:

```json
{
  "url": "https://lyrixir.com",
  "name": "Lyrixir",
  "iconUrl": "https://lyrixir.com/icon-512.png",
  "termsOfUseUrl": "https://lyrixir.com/terms",
  "privacyPolicyUrl": "https://lyrixir.com/privacy"
}
```

### Provider Setup

```tsx
// src/providers/TonProvider.tsx
import { TonConnectUIProvider } from "@tonconnect/ui-react";

const manifestUrl = "https://lyrixir.com/tonconnect-manifest.json";

export function TonProvider({ children }: { children: React.ReactNode }) {
  return (
    <TonConnectUIProvider
      manifestUrl={manifestUrl}
      actionsConfiguration={{
        twaReturnUrl: "https://t.me/LyrixirBot/app",
      }}
    >
      {children}
    </TonConnectUIProvider>
  );
}
```

### Wallet Connection Hook

```tsx
// src/hooks/useTonWallet.ts
import {
  useTonConnectUI,
  useTonWallet,
  useTonAddress,
} from "@tonconnect/ui-react";
import { Address } from "@ton/core";

export function useTonWalletConnection() {
  const [tonConnectUI] = useTonConnectUI();
  const wallet = useTonWallet();
  const address = useTonAddress();
  const rawAddress = useTonAddress(false);

  const connect = async () => {
    await tonConnectUI.openModal();
  };

  const disconnect = async () => {
    await tonConnectUI.disconnect();
  };

  const isConnected = !!wallet;

  return {
    wallet,
    address, // User-friendly: EQ...
    rawAddress, // Raw: 0:abc...
    isConnected,
    connect,
    disconnect,
    tonConnectUI,
  };
}
```

### Connect Button Component

```tsx
// src/components/ton/ConnectWallet.tsx
import { TonConnectButton } from "@tonconnect/ui-react";
import { useTonWalletConnection } from "../../hooks/useTonWallet";

export function ConnectWallet() {
  const { isConnected, address } = useTonWalletConnection();

  return (
    <div className="wallet-connect">
      <TonConnectButton />
      {isConnected && (
        <p className="wallet-address">
          Connected: {address?.slice(0, 6)}...{address?.slice(-4)}
        </p>
      )}
    </div>
  );
}
```

### Telegram-Specific Connection

```tsx
// For Telegram Mini App environment
import { useTonConnectUI } from "@tonconnect/ui-react";

export function TelegramWalletConnect() {
  const [tonConnectUI] = useTonConnectUI();

  const connectTonkeeper = async () => {
    // Prioritize Tonkeeper for Telegram users
    const wallets = await tonConnectUI.getWallets();
    const tonkeeper = wallets.find((w) => w.appName === "tonkeeper");

    if (tonkeeper) {
      await tonConnectUI.openSingleWalletModal("tonkeeper");
    } else {
      await tonConnectUI.openModal();
    }
  };

  return (
    <button onClick={connectTonkeeper} className="tonkeeper-btn">
      <img src="/tonkeeper-icon.svg" alt="" />
      Connect Tonkeeper
    </button>
  );
}
```

---

## Smart Contracts

### Collection Contract (FunC)

```func
;; contracts/lyrixir_collection.fc
;; NFT Collection for Lyrixir Music Licenses

#include "imports/stdlib.fc";
#include "imports/params.fc";
#include "imports/op-codes.fc";

;; Storage
;; owner_address - collection owner (Lyrixir)
;; next_item_index - auto-incrementing NFT index
;; content - collection metadata
;; nft_item_code - code for individual NFTs
;; royalty_params - royalty configuration

global slice owner_address;
global int next_item_index;
global cell content;
global cell nft_item_code;
global cell royalty_params;

() load_data() impure {
    slice ds = get_data().begin_parse();
    owner_address = ds~load_msg_addr();
    next_item_index = ds~load_uint(64);
    content = ds~load_ref();
    nft_item_code = ds~load_ref();
    royalty_params = ds~load_ref();
}

() save_data() impure {
    set_data(begin_cell()
        .store_slice(owner_address)
        .store_uint(next_item_index, 64)
        .store_ref(content)
        .store_ref(nft_item_code)
        .store_ref(royalty_params)
    .end_cell());
}

;; Deploy new NFT license
() deploy_nft_item(int item_index, cell nft_content, slice owner) impure {
    cell state_init = begin_cell()
        .store_uint(0, 2) ;; split_depth, special
        .store_dict(nft_item_code)
        .store_dict(begin_cell()
            .store_uint(item_index, 64)
            .store_slice(my_address())
        .end_cell())
        .store_uint(0, 1) ;; library
    .end_cell();

    slice nft_address = begin_cell()
        .store_uint(4, 3)
        .store_int(workchain(), 8)
        .store_uint(cell_hash(state_init), 256)
    .end_cell().begin_parse();

    var msg = begin_cell()
        .store_uint(0x18, 6)
        .store_slice(nft_address)
        .store_coins(50000000) ;; 0.05 TON for deployment
        .store_uint(4 + 2 + 1, 1 + 4 + 4 + 64 + 32 + 1 + 1 + 1)
        .store_ref(state_init)
        .store_ref(begin_cell()
            .store_slice(owner)
            .store_ref(nft_content)
        .end_cell());

    send_raw_message(msg.end_cell(), 1);
}

;; Mint new license NFT
() mint(slice sender, int msg_value, slice in_msg_body) impure {
    ;; Only owner can mint
    throw_unless(401, equal_slices(sender, owner_address));

    slice nft_owner = in_msg_body~load_msg_addr();
    cell nft_content = in_msg_body~load_ref();

    deploy_nft_item(next_item_index, nft_content, nft_owner);
    next_item_index += 1;
    save_data();
}

;; Get collection data (TEP-62)
(int, cell, slice) get_collection_data() method_id {
    load_data();
    return (next_item_index, content, owner_address);
}

;; Get NFT address by index
slice get_nft_address_by_index(int index) method_id {
    load_data();
    cell state_init = begin_cell()
        .store_uint(0, 2)
        .store_dict(nft_item_code)
        .store_dict(begin_cell()
            .store_uint(index, 64)
            .store_slice(my_address())
        .end_cell())
        .store_uint(0, 1)
    .end_cell();

    return begin_cell()
        .store_uint(4, 3)
        .store_int(workchain(), 8)
        .store_uint(cell_hash(state_init), 256)
    .end_cell().begin_parse();
}

;; Get royalty params (TEP-66)
(int, int, slice) royalty_params() method_id {
    load_data();
    slice rs = royalty_params.begin_parse();
    return (rs~load_uint(16), rs~load_uint(16), rs~load_msg_addr());
}

() recv_internal(int my_balance, int msg_value, cell in_msg_full, slice in_msg_body) impure {
    slice cs = in_msg_full.begin_parse();
    int flags = cs~load_uint(4);
    if (flags & 1) { return (); } ;; bounced

    slice sender = cs~load_msg_addr();
    load_data();

    int op = in_msg_body~load_uint(32);

    if (op == op::mint()) {
        mint(sender, msg_value, in_msg_body);
        return ();
    }

    throw(0xffff);
}
```

### NFT Item Contract (FunC)

```func
;; contracts/lyrixir_license.fc
;; Individual License NFT (TEP-64 compliant)

#include "imports/stdlib.fc";
#include "imports/params.fc";

global int item_index;
global slice collection_address;
global slice owner_address;
global cell content;

() load_data() impure {
    slice ds = get_data().begin_parse();
    item_index = ds~load_uint(64);
    collection_address = ds~load_msg_addr();
    owner_address = ds~load_msg_addr();
    content = ds~load_ref();
}

() save_data() impure {
    set_data(begin_cell()
        .store_uint(item_index, 64)
        .store_slice(collection_address)
        .store_slice(owner_address)
        .store_ref(content)
    .end_cell());
}

;; Transfer ownership (with royalty)
() transfer(slice sender, int msg_value, slice in_msg_body) impure {
    throw_unless(401, equal_slices(sender, owner_address));

    slice new_owner = in_msg_body~load_msg_addr();
    slice response_destination = in_msg_body~load_msg_addr();
    in_msg_body~load_int(1); ;; custom_payload flag
    int forward_amount = in_msg_body~load_coins();

    ;; Query royalty from collection
    ;; In production, implement royalty payment here

    owner_address = new_owner;
    save_data();

    ;; Notify new owner
    if (forward_amount > 0) {
        var msg = begin_cell()
            .store_uint(0x10, 6)
            .store_slice(new_owner)
            .store_coins(forward_amount)
            .store_uint(0, 1 + 4 + 4 + 64 + 32 + 1 + 1)
            .store_uint(op::ownership_assigned(), 32)
            .store_uint(0, 64) ;; query_id
            .store_slice(sender);
        send_raw_message(msg.end_cell(), 1);
    }
}

;; Get NFT data (TEP-64)
(int, int, slice, slice, cell) get_nft_data() method_id {
    load_data();
    return (
        -1, ;; init = true
        item_index,
        collection_address,
        owner_address,
        content
    );
}

() recv_internal(int my_balance, int msg_value, cell in_msg_full, slice in_msg_body) impure {
    slice cs = in_msg_full.begin_parse();
    int flags = cs~load_uint(4);
    if (flags & 1) { return (); }

    slice sender = cs~load_msg_addr();
    load_data();

    int op = in_msg_body~load_uint(32);
    int query_id = in_msg_body~load_uint(64);

    if (op == op::transfer()) {
        transfer(sender, msg_value, in_msg_body);
        return ();
    }

    if (op == op::get_static_data()) {
        var msg = begin_cell()
            .store_uint(0x10, 6)
            .store_slice(sender)
            .store_coins(0)
            .store_uint(0, 1 + 4 + 4 + 64 + 32 + 1 + 1)
            .store_uint(op::report_static_data(), 32)
            .store_uint(query_id, 64)
            .store_uint(item_index, 256)
            .store_slice(collection_address);
        send_raw_message(msg.end_cell(), 64);
        return ();
    }

    throw(0xffff);
}
```

### Op Codes

```func
;; contracts/imports/op-codes.fc

int op::transfer() asm "0x5fcc3d14 PUSHINT";
int op::ownership_assigned() asm "0x05138d91 PUSHINT";
int op::get_static_data() asm "0x2fcb26a2 PUSHINT";
int op::report_static_data() asm "0x8b771735 PUSHINT";
int op::mint() asm "0x1 PUSHINT";
int op::batch_mint() asm "0x2 PUSHINT";
```

---

## TypeScript SDK Integration

### Installation

```bash
npm install @ton/ton @ton/core @ton/crypto
```

### TON Client Setup

```typescript
// src/lib/ton/client.ts
import { TonClient, TonClient4 } from "@ton/ton";
import { getHttpEndpoint } from "@orbs-network/ton-access";

const IS_TESTNET = process.env.VITE_TON_NETWORK === "testnet";

export async function getTonClient(): Promise<TonClient> {
  const endpoint = await getHttpEndpoint({
    network: IS_TESTNET ? "testnet" : "mainnet",
  });

  return new TonClient({ endpoint });
}

// For higher throughput (uses TON API v4)
export async function getTonClient4(): Promise<TonClient4> {
  const endpoint = IS_TESTNET
    ? "https://testnet-v4.tonhubapi.com"
    : "https://mainnet-v4.tonhubapi.com";

  return new TonClient4({ endpoint });
}
```

### Collection Wrapper

```typescript
// src/lib/ton/LyrixirCollection.ts
import {
  Address,
  beginCell,
  Cell,
  Contract,
  ContractProvider,
  Sender,
  toNano,
} from "@ton/core";

export interface CollectionData {
  nextItemIndex: bigint;
  content: Cell;
  owner: Address;
}

export interface RoyaltyParams {
  numerator: number;
  denominator: number;
  destination: Address;
}

export class LyrixirCollection implements Contract {
  constructor(
    readonly address: Address,
    readonly init?: { code: Cell; data: Cell },
  ) {}

  static createFromAddress(address: Address): LyrixirCollection {
    return new LyrixirCollection(address);
  }

  // Get collection data
  async getCollectionData(provider: ContractProvider): Promise<CollectionData> {
    const result = await provider.get("get_collection_data", []);
    return {
      nextItemIndex: result.stack.readBigNumber(),
      content: result.stack.readCell(),
      owner: result.stack.readAddress(),
    };
  }

  // Get NFT address by index
  async getNftAddressByIndex(
    provider: ContractProvider,
    index: bigint,
  ): Promise<Address> {
    const result = await provider.get("get_nft_address_by_index", [
      { type: "int", value: index },
    ]);
    return result.stack.readAddress();
  }

  // Get royalty params
  async getRoyaltyParams(provider: ContractProvider): Promise<RoyaltyParams> {
    const result = await provider.get("royalty_params", []);
    return {
      numerator: result.stack.readNumber(),
      denominator: result.stack.readNumber(),
      destination: result.stack.readAddress(),
    };
  }

  // Mint new license NFT
  async sendMint(
    provider: ContractProvider,
    via: Sender,
    opts: {
      itemIndex: bigint;
      itemOwner: Address;
      itemContent: Cell;
      value: bigint;
    },
  ) {
    const mintBody = beginCell()
      .storeUint(1, 32) // op::mint
      .storeUint(0, 64) // query_id
      .storeAddress(opts.itemOwner)
      .storeRef(opts.itemContent)
      .endCell();

    await provider.internal(via, {
      value: opts.value,
      body: mintBody,
    });
  }
}
```

### License NFT Wrapper

```typescript
// src/lib/ton/LyrixirLicense.ts
import {
  Address,
  beginCell,
  Cell,
  Contract,
  ContractProvider,
  Sender,
  toNano,
} from "@ton/core";

export interface NftData {
  init: boolean;
  index: bigint;
  collection: Address;
  owner: Address;
  content: Cell;
}

export class LyrixirLicense implements Contract {
  constructor(
    readonly address: Address,
    readonly init?: { code: Cell; data: Cell },
  ) {}

  static createFromAddress(address: Address): LyrixirLicense {
    return new LyrixirLicense(address);
  }

  // Get NFT data (TEP-64)
  async getNftData(provider: ContractProvider): Promise<NftData> {
    const result = await provider.get("get_nft_data", []);
    return {
      init: result.stack.readBoolean(),
      index: result.stack.readBigNumber(),
      collection: result.stack.readAddress(),
      owner: result.stack.readAddress(),
      content: result.stack.readCell(),
    };
  }

  // Transfer NFT
  async sendTransfer(
    provider: ContractProvider,
    via: Sender,
    opts: {
      newOwner: Address;
      responseDestination: Address;
      forwardAmount?: bigint;
      forwardPayload?: Cell;
    },
  ) {
    const transferBody = beginCell()
      .storeUint(0x5fcc3d14, 32) // op::transfer
      .storeUint(0, 64) // query_id
      .storeAddress(opts.newOwner)
      .storeAddress(opts.responseDestination)
      .storeBit(false) // no custom payload
      .storeCoins(opts.forwardAmount || 0)
      .storeBit(false) // no forward payload
      .endCell();

    await provider.internal(via, {
      value: toNano("0.05"),
      body: transferBody,
    });
  }
}
```

### Minting Service

```typescript
// src/lib/ton/mint.ts
import { Address, beginCell, Cell, toNano } from "@ton/core";
import { getTonClient } from "./client";
import { LyrixirCollection } from "./LyrixirCollection";

const COLLECTION_ADDRESS = process.env.VITE_COLLECTION_ADDRESS!;
const MINT_FEE = toNano("0.1"); // 0.1 TON for gas

export interface MintLicenseParams {
  trackId: string;
  trackTitle: string;
  artistName: string;
  licenseTier: string;
  ownerAddress: string;
  expiresAt?: Date;
  territory: string[];
  mediaTypes: string[];
  isExclusive: boolean;
}

export async function buildMintTransaction(params: MintLicenseParams) {
  const client = await getTonClient();
  const collection = client.open(
    LyrixirCollection.createFromAddress(Address.parse(COLLECTION_ADDRESS)),
  );

  // Get next item index
  const collectionData = await collection.getCollectionData();
  const itemIndex = collectionData.nextItemIndex;

  // Build NFT content cell
  const contentCell = buildLicenseContent(params, itemIndex);

  // Build mint message
  const mintBody = beginCell()
    .storeUint(1, 32) // op::mint
    .storeUint(0, 64) // query_id
    .storeAddress(Address.parse(params.ownerAddress))
    .storeRef(contentCell)
    .endCell();

  return {
    to: COLLECTION_ADDRESS,
    value: MINT_FEE.toString(),
    body: mintBody.toBoc().toString("base64"),
    itemIndex: itemIndex.toString(),
  };
}

function buildLicenseContent(params: MintLicenseParams, index: bigint): Cell {
  // On-chain content (minimal)
  const onchainContent = beginCell()
    .storeUint(0x00, 8) // off-chain marker
    .storeStringTail(`https://lyrixir.com/api/nft/${index}`)
    .endCell();

  return onchainContent;
}

// Verify NFT ownership
export async function verifyOwnership(
  nftAddress: string,
  expectedOwner: string,
): Promise<boolean> {
  const client = await getTonClient();
  const nft = client.open(
    LyrixirLicense.createFromAddress(Address.parse(nftAddress)),
  );

  try {
    const data = await nft.getNftData();
    return data.owner.equals(Address.parse(expectedOwner));
  } catch {
    return false;
  }
}

// Get all NFTs owned by address
export async function getOwnedLicenses(
  ownerAddress: string,
): Promise<string[]> {
  // Use TON API indexer for efficient lookup
  const response = await fetch(
    `https://tonapi.io/v2/accounts/${ownerAddress}/nfts?collection=${COLLECTION_ADDRESS}`,
  );

  const data = await response.json();
  return data.nft_items?.map((nft: any) => nft.address) || [];
}
```

---

## Mini App Integration

### NFT Gallery Component

```tsx
// src/components/ton/NFTGallery.tsx
import { useState, useEffect } from "react";
import { useTonWalletConnection } from "../../hooks/useTonWallet";
import { getOwnedLicenses } from "../../lib/ton/mint";
import { Cell, Spinner, Placeholder } from "@telegram-apps/telegram-ui";

interface LicenseNFT {
  address: string;
  metadata: {
    name: string;
    image: string;
    attributes: Array<{ trait_type: string; value: string }>;
  };
}

export function NFTGallery() {
  const { address, isConnected } = useTonWalletConnection();
  const [licenses, setLicenses] = useState<LicenseNFT[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isConnected || !address) return;

    setLoading(true);
    loadLicenses(address)
      .then(setLicenses)
      .finally(() => setLoading(false));
  }, [address, isConnected]);

  if (!isConnected) {
    return (
      <Placeholder
        header="Connect Wallet"
        description="Connect your TON wallet to view owned licenses"
      />
    );
  }

  if (loading) return <Spinner size="l" />;

  if (licenses.length === 0) {
    return (
      <Placeholder
        header="No NFT Licenses"
        description="Purchase a license to mint it as an NFT"
      />
    );
  }

  return (
    <div className="nft-gallery">
      {licenses.map((license) => (
        <NFTCard key={license.address} license={license} />
      ))}
    </div>
  );
}

function NFTCard({ license }: { license: LicenseNFT }) {
  const track = license.metadata.attributes.find(
    (a) => a.trait_type === "Track",
  )?.value;
  const tier = license.metadata.attributes.find(
    (a) => a.trait_type === "License Tier",
  )?.value;
  const expires = license.metadata.attributes.find(
    (a) => a.trait_type === "Expires",
  )?.value;

  return (
    <div className="nft-card">
      <img src={license.metadata.image} alt={license.metadata.name} />
      <div className="nft-info">
        <h3>{track}</h3>
        <p className="tier">{tier}</p>
        {expires && <p className="expires">Expires: {expires}</p>}
        <p className="address">{license.address.slice(0, 8)}...</p>
      </div>
    </div>
  );
}

async function loadLicenses(ownerAddress: string): Promise<LicenseNFT[]> {
  const addresses = await getOwnedLicenses(ownerAddress);

  const licenses = await Promise.all(
    addresses.map(async (addr) => {
      const metadataUrl = `https://lyrixir.com/api/nft/${addr}`;
      const metadata = await fetch(metadataUrl).then((r) => r.json());
      return { address: addr, metadata };
    }),
  );

  return licenses;
}
```

### Mint Flow Component

```tsx
// src/components/ton/MintLicense.tsx
import { useState } from "react";
import { useTonConnectUI } from "@tonconnect/ui-react";
import { useTonWalletConnection } from "../../hooks/useTonWallet";
import { buildMintTransaction } from "../../lib/ton/mint";
import { Button, Spinner } from "@telegram-apps/telegram-ui";

interface MintLicenseProps {
  orderId: string;
  trackId: string;
  trackTitle: string;
  artistName: string;
  licenseTier: string;
}

export function MintLicense({
  orderId,
  trackId,
  trackTitle,
  artistName,
  licenseTier,
}: MintLicenseProps) {
  const [tonConnectUI] = useTonConnectUI();
  const { address, isConnected, connect } = useTonWalletConnection();
  const [minting, setMinting] = useState(false);
  const [txHash, setTxHash] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleMint = async () => {
    if (!address) return;

    setMinting(true);
    setError(null);

    try {
      // Build transaction
      const tx = await buildMintTransaction({
        trackId,
        trackTitle,
        artistName,
        licenseTier,
        ownerAddress: address,
        territory: ["worldwide"],
        mediaTypes: ["all"],
        isExclusive: false,
      });

      // Send via TON Connect
      const result = await tonConnectUI.sendTransaction({
        validUntil: Math.floor(Date.now() / 1000) + 300, // 5 min
        messages: [
          {
            address: tx.to,
            amount: tx.value,
            payload: tx.body,
          },
        ],
      });

      setTxHash(result.boc);

      // Update backend
      await fetch("/api/ton/mint-complete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderId,
          txHash: result.boc,
          itemIndex: tx.itemIndex,
        }),
      });
    } catch (err: any) {
      console.error("Mint error:", err);
      setError(err.message || "Failed to mint NFT");
    } finally {
      setMinting(false);
    }
  };

  if (!isConnected) {
    return (
      <Button onClick={connect} size="l" stretched>
        Connect Wallet to Mint NFT
      </Button>
    );
  }

  if (txHash) {
    return (
      <div className="mint-success">
        <p>✅ NFT Minted Successfully!</p>
        <a
          href={`https://tonviewer.com/transaction/${txHash}`}
          target="_blank"
          rel="noopener noreferrer"
        >
          View on Explorer →
        </a>
      </div>
    );
  }

  return (
    <div className="mint-license">
      <p>Mint your license as an NFT on TON blockchain</p>
      <ul>
        <li>Verifiable ownership proof</li>
        <li>Tradeable on secondary markets</li>
        <li>Automatic royalties to artists</li>
      </ul>

      {error && <p className="error">{error}</p>}

      <Button onClick={handleMint} size="l" stretched loading={minting}>
        {minting ? "Minting..." : "Mint NFT License (0.1 TON)"}
      </Button>
    </div>
  );
}
```

---

## Backend API

### NFT Metadata Endpoint

```typescript
// api/nft/[id]/route.ts
import { supabase } from "../../../bot/services/supabase";

export async function GET(
  req: Request,
  { params }: { params: { id: string } },
) {
  const nftId = params.id;

  // Could be NFT address or item index
  const { data: license, error } = await supabase
    .from("tg_licenses")
    .select(
      `
      *,
      track:tracks(*),
      license_tier:license_tiers(*)
    `,
    )
    .eq("nft_item_index", nftId)
    .single();

  if (error || !license) {
    return Response.json({ error: "NFT not found" }, { status: 404 });
  }

  const metadata = {
    name: `${license.track.title} - ${license.license_tier.name}`,
    description: `${license.license_tier.name} license for "${license.track.title}"`,
    image: `https://lyrixir.com/nft-images/${license.track.slug}.png`,
    external_url: `https://lyrixir.com/track/${license.track.slug}`,
    animation_url: license.track.preview_url,
    attributes: [
      { trait_type: "Track", value: license.track.title },
      { trait_type: "Artist", value: license.track.artist?.stage_name },
      { trait_type: "License Tier", value: license.license_tier.name },
      {
        trait_type: "Territory",
        value: license.license_tier.territory.join(", "),
      },
      {
        trait_type: "Duration",
        value: `${license.license_tier.duration_days} days`,
      },
      {
        trait_type: "Media Types",
        value: license.license_tier.media_types.join(", "),
      },
      {
        trait_type: "Exclusive",
        value: license.license_tier.is_exclusive ? "Yes" : "No",
      },
      { trait_type: "Minted", value: license.created_at },
      { trait_type: "Expires", value: license.expires_at },
    ],
  };

  return Response.json(metadata, {
    headers: {
      "Cache-Control": "public, max-age=3600",
    },
  });
}
```

### Mint Completion Webhook

```typescript
// api/ton/mint-complete/route.ts
import { supabase } from "../../../bot/services/supabase";
import { verifyOwnership } from "../../../lib/ton/mint";

export async function POST(req: Request) {
  const { orderId, txHash, itemIndex, nftAddress } = await req.json();

  // Get order
  const { data: order, error } = await supabase
    .from("tg_orders")
    .select("*, licenses:tg_licenses(*)")
    .eq("id", orderId)
    .single();

  if (error || !order) {
    return Response.json({ error: "Order not found" }, { status: 404 });
  }

  // Update license with NFT info
  for (const license of order.licenses) {
    await supabase
      .from("tg_licenses")
      .update({
        nft_item_index: itemIndex,
        nft_address: nftAddress,
        nft_tx_hash: txHash,
        nft_minted_at: new Date().toISOString(),
      })
      .eq("id", license.id);
  }

  return Response.json({ success: true });
}
```

---

## Database Schema Additions

```sql
-- Add NFT fields to tg_licenses
ALTER TABLE tg_licenses ADD COLUMN IF NOT EXISTS nft_item_index BIGINT;
ALTER TABLE tg_licenses ADD COLUMN IF NOT EXISTS nft_address TEXT;
ALTER TABLE tg_licenses ADD COLUMN IF NOT EXISTS nft_tx_hash TEXT;
ALTER TABLE tg_licenses ADD COLUMN IF NOT EXISTS nft_minted_at TIMESTAMPTZ;

CREATE INDEX IF NOT EXISTS idx_tg_licenses_nft ON tg_licenses(nft_address);

-- TON wallet links
CREATE TABLE IF NOT EXISTS tg_ton_wallets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  telegram_user_id BIGINT NOT NULL REFERENCES tg_users(telegram_id),
  wallet_address TEXT NOT NULL,
  wallet_name TEXT,
  linked_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(telegram_user_id, wallet_address)
);

-- NFT transfer history
CREATE TABLE IF NOT EXISTS tg_nft_transfers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  license_id UUID REFERENCES tg_licenses(id),
  from_address TEXT NOT NULL,
  to_address TEXT NOT NULL,
  tx_hash TEXT NOT NULL,
  transferred_at TIMESTAMPTZ DEFAULT NOW()
);
```

---

## Security Considerations

### Wallet Verification

```typescript
// Verify wallet ownership via signed message
export async function verifyWalletOwnership(
  telegramUserId: number,
  walletAddress: string,
  signature: string,
  message: string,
): Promise<boolean> {
  // Message should include telegram user ID and timestamp
  const expectedMessage = `Lyrixir: Link wallet to Telegram user ${telegramUserId}`;

  if (message !== expectedMessage) return false;

  // Verify signature using wallet's public key
  // Implementation depends on wallet type
  return true;
}
```

### Transaction Validation

```typescript
// Validate mint transaction before processing
export async function validateMintTransaction(
  txHash: string,
  expectedOwner: string,
  expectedCollection: string,
): Promise<boolean> {
  const client = await getTonClient();

  // Fetch transaction
  const tx = await client.getTransaction(/* ... */);

  // Verify:
  // 1. Transaction succeeded
  // 2. Destination is collection contract
  // 3. Minted to expected owner

  return true;
}
```

---

## Deployment

### Contract Deployment

```typescript
// scripts/deploy-collection.ts
import { TonClient, WalletContractV4, internal } from "@ton/ton";
import { mnemonicToPrivateKey } from "@ton/crypto";

async function deployCollection() {
  const client = new TonClient({
    endpoint: "https://testnet.toncenter.com/api/v2/jsonRPC",
  });

  const mnemonic = process.env.DEPLOY_MNEMONIC!.split(" ");
  const keyPair = await mnemonicToPrivateKey(mnemonic);

  const wallet = WalletContractV4.create({
    workchain: 0,
    publicKey: keyPair.publicKey,
  });

  // Deploy collection contract
  // ... implementation
}
```

### Environment Variables

```env
# TON Network
VITE_TON_NETWORK=testnet  # or mainnet
VITE_COLLECTION_ADDRESS=EQC...

# Backend
TON_API_KEY=your_tonapi_key
DEPLOY_MNEMONIC=word1 word2 ... word24
```

---

## Checklist

### Setup

- [ ] Install TON Connect packages
- [ ] Create tonconnect-manifest.json
- [ ] Configure TonProvider
- [ ] Test wallet connection

### Smart Contracts

- [ ] Write collection contract (FunC)
- [ ] Write NFT item contract (FunC)
- [ ] Compile contracts
- [ ] Deploy to testnet
- [ ] Test minting flow
- [ ] Deploy to mainnet

### Mini App

- [ ] Wallet connection UI
- [ ] NFT gallery component
- [ ] Mint flow component
- [ ] Transfer/list component
- [ ] Ownership verification

### Backend

- [ ] NFT metadata API
- [ ] Mint completion webhook
- [ ] Ownership indexer
- [ ] Transfer tracker

### Security

- [ ] Wallet ownership verification
- [ ] Transaction validation
- [ ] Rate limiting
- [ ] Error handling

### Testing

- [ ] Testnet end-to-end
- [ ] Mainnet dry run
- [ ] Load testing
- [ ] Security audit
