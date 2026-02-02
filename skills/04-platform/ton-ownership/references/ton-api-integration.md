# TON API Integration Patterns

## API Providers

| Provider   | URL                     | Best For                |
| ---------- | ----------------------- | ----------------------- |
| TON Center | toncenter.com           | Basic RPC               |
| TON API    | tonapi.io               | NFT indexing, rich data |
| TON Access | orbs-network/ton-access | Load balancing          |
| TON Hub    | tonhub.com              | Wallet integration      |
| GetBlock   | getblock.io             | Enterprise              |

## TON API (tonapi.io)

### Setup

```typescript
// src/lib/ton/api.ts
const TON_API_KEY = process.env.TON_API_KEY;
const TON_API_BASE = "https://tonapi.io/v2";

async function tonApiRequest<T>(endpoint: string): Promise<T> {
  const response = await fetch(`${TON_API_BASE}${endpoint}`, {
    headers: {
      Authorization: `Bearer ${TON_API_KEY}`,
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    throw new Error(`TON API Error: ${response.statusText}`);
  }

  return response.json();
}
```

### Get Account NFTs

```typescript
interface NftItem {
  address: string;
  index: number;
  owner: { address: string };
  collection: { address: string; name: string };
  metadata: Record<string, any>;
  previews: Array<{ resolution: string; url: string }>;
}

interface NftsResponse {
  nft_items: NftItem[];
}

export async function getAccountNfts(
  accountAddress: string,
  collectionAddress?: string,
): Promise<NftItem[]> {
  let endpoint = `/accounts/${accountAddress}/nfts`;

  if (collectionAddress) {
    endpoint += `?collection=${collectionAddress}`;
  }

  const data = await tonApiRequest<NftsResponse>(endpoint);
  return data.nft_items || [];
}
```

### Get NFT Details

```typescript
interface NftDetails {
  address: string;
  index: number;
  collection: {
    address: string;
    name: string;
    description: string;
  };
  owner: {
    address: string;
    name?: string;
    is_wallet: boolean;
  };
  metadata: {
    name: string;
    description: string;
    image: string;
    attributes: Array<{ trait_type: string; value: string }>;
  };
  sale?: {
    address: string;
    market: { name: string };
    price: { value: string; token_name: string };
  };
}

export async function getNftDetails(nftAddress: string): Promise<NftDetails> {
  return tonApiRequest<NftDetails>(`/nfts/${nftAddress}`);
}
```

### Get Collection NFTs

```typescript
interface CollectionNftsResponse {
  nft_items: NftItem[];
  next_from?: string;
}

export async function getCollectionNfts(
  collectionAddress: string,
  limit = 100,
  offset?: string,
): Promise<CollectionNftsResponse> {
  let endpoint = `/nfts/collections/${collectionAddress}/items?limit=${limit}`;

  if (offset) {
    endpoint += `&offset=${offset}`;
  }

  return tonApiRequest<CollectionNftsResponse>(endpoint);
}

// Paginate through all NFTs
export async function* getAllCollectionNfts(
  collectionAddress: string,
): AsyncGenerator<NftItem> {
  let offset: string | undefined;

  while (true) {
    const response = await getCollectionNfts(collectionAddress, 100, offset);

    for (const nft of response.nft_items) {
      yield nft;
    }

    if (!response.next_from) break;
    offset = response.next_from;
  }
}
```

### Get NFT Transfer History

```typescript
interface NftTransfer {
  query_id: string;
  nft: { address: string };
  sender: { address: string };
  recipient: { address: string };
  transaction: {
    hash: string;
    lt: string;
    utime: number;
  };
}

interface NftHistoryResponse {
  events: NftTransfer[];
}

export async function getNftHistory(
  nftAddress: string,
  limit = 50,
): Promise<NftTransfer[]> {
  const data = await tonApiRequest<NftHistoryResponse>(
    `/nfts/${nftAddress}/history?limit=${limit}`,
  );
  return data.events || [];
}
```

### Verify NFT Ownership

```typescript
export async function verifyNftOwnership(
  nftAddress: string,
  expectedOwner: string,
): Promise<boolean> {
  try {
    const nft = await getNftDetails(nftAddress);
    return nft.owner.address.toLowerCase() === expectedOwner.toLowerCase();
  } catch {
    return false;
  }
}

// Check if user owns any NFT from collection
export async function ownsCollectionNft(
  userAddress: string,
  collectionAddress: string,
): Promise<boolean> {
  const nfts = await getAccountNfts(userAddress, collectionAddress);
  return nfts.length > 0;
}
```

## TON Center API

### Basic RPC Calls

```typescript
const TON_CENTER_URL = "https://toncenter.com/api/v2/jsonRPC";
const TON_CENTER_KEY = process.env.TON_CENTER_API_KEY;

async function tonCenterRpc<T>(method: string, params: any): Promise<T> {
  const response = await fetch(TON_CENTER_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-API-Key": TON_CENTER_KEY || "",
    },
    body: JSON.stringify({
      id: Date.now(),
      jsonrpc: "2.0",
      method,
      params,
    }),
  });

  const data = await response.json();

  if (data.error) {
    throw new Error(data.error.message);
  }

  return data.result;
}
```

### Get Account State

```typescript
interface AccountState {
  balance: string;
  code: string | null;
  data: string | null;
  last_transaction_id: {
    lt: string;
    hash: string;
  };
  state: "active" | "uninitialized" | "frozen";
}

export async function getAccountState(address: string): Promise<AccountState> {
  return tonCenterRpc<AccountState>("getAddressInformation", { address });
}
```

### Run Get Method

```typescript
interface RunMethodResult {
  gas_used: number;
  exit_code: number;
  stack: Array<[string, string]>;
}

export async function runGetMethod(
  address: string,
  method: string,
  stack: any[] = [],
): Promise<RunMethodResult> {
  return tonCenterRpc<RunMethodResult>("runGetMethod", {
    address,
    method,
    stack,
  });
}

// Example: Get NFT owner
export async function getNftOwnerViaRpc(nftAddress: string): Promise<string> {
  const result = await runGetMethod(nftAddress, "get_nft_data");

  // Stack: [init, index, collection, owner, content]
  const ownerStack = result.stack[3];

  if (ownerStack[0] === "cell") {
    // Parse address from cell
    const cell = Cell.fromBoc(Buffer.from(ownerStack[1], "base64"))[0];
    return cell.beginParse().loadAddress().toString();
  }

  throw new Error("Invalid owner data");
}
```

### Send Transaction

```typescript
interface SendResult {
  hash: string;
}

export async function sendBoc(boc: string): Promise<SendResult> {
  return tonCenterRpc<SendResult>("sendBoc", { boc });
}
```

## Webhook / Event Streaming

### TON API SSE Stream

```typescript
// Stream NFT events in real-time
export function streamNftEvents(
  collectionAddress: string,
  onEvent: (event: NftTransfer) => void,
): () => void {
  const eventSource = new EventSource(
    `https://tonapi.io/v2/sse/nfts?collections=${collectionAddress}`,
    {
      headers: {
        Authorization: `Bearer ${TON_API_KEY}`,
      },
    } as any,
  );

  eventSource.onmessage = (event) => {
    const data = JSON.parse(event.data);
    onEvent(data);
  };

  eventSource.onerror = (error) => {
    console.error("SSE Error:", error);
  };

  // Return cleanup function
  return () => eventSource.close();
}
```

### Polling Pattern

```typescript
// For environments without SSE support
export class NftEventPoller {
  private lastLt: string = "0";
  private intervalId: NodeJS.Timeout | null = null;

  constructor(
    private collectionAddress: string,
    private onEvent: (event: NftTransfer) => void,
    private pollInterval = 10000,
  ) {}

  start() {
    this.poll();
    this.intervalId = setInterval(() => this.poll(), this.pollInterval);
  }

  stop() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }

  private async poll() {
    try {
      const events = await this.fetchNewEvents();

      for (const event of events) {
        this.onEvent(event);

        // Update cursor
        if (BigInt(event.transaction.lt) > BigInt(this.lastLt)) {
          this.lastLt = event.transaction.lt;
        }
      }
    } catch (error) {
      console.error("Polling error:", error);
    }
  }

  private async fetchNewEvents(): Promise<NftTransfer[]> {
    const response = await tonApiRequest<{ events: NftTransfer[] }>(
      `/nfts/collections/${this.collectionAddress}/history?start_lt=${this.lastLt}`,
    );
    return response.events || [];
  }
}
```

## Caching Patterns

### Redis Cache for NFT Data

```typescript
import { Redis } from "@upstash/redis";

const redis = Redis.fromEnv();
const CACHE_TTL = 300; // 5 minutes

export async function getCachedNftOwnership(
  userAddress: string,
  collectionAddress: string,
): Promise<boolean> {
  const cacheKey = `nft:owns:${userAddress}:${collectionAddress}`;

  // Check cache
  const cached = await redis.get(cacheKey);
  if (cached !== null) {
    return cached === "true";
  }

  // Fetch from API
  const owns = await ownsCollectionNft(userAddress, collectionAddress);

  // Cache result
  await redis.setex(cacheKey, CACHE_TTL, owns.toString());

  return owns;
}

// Invalidate on transfer events
export async function invalidateOwnershipCache(
  fromAddress: string,
  toAddress: string,
  collectionAddress: string,
) {
  await redis.del(`nft:owns:${fromAddress}:${collectionAddress}`);
  await redis.del(`nft:owns:${toAddress}:${collectionAddress}`);
}
```

### In-Memory Ownership Index

```typescript
// For high-performance ownership checks
export class OwnershipIndex {
  private ownerToNfts = new Map<string, Set<string>>();
  private nftToOwner = new Map<string, string>();

  async initialize(collectionAddress: string) {
    for await (const nft of getAllCollectionNfts(collectionAddress)) {
      this.addOwnership(nft.owner.address, nft.address);
    }
  }

  addOwnership(owner: string, nftAddress: string) {
    // Remove from previous owner
    const prevOwner = this.nftToOwner.get(nftAddress);
    if (prevOwner) {
      this.ownerToNfts.get(prevOwner)?.delete(nftAddress);
    }

    // Add to new owner
    if (!this.ownerToNfts.has(owner)) {
      this.ownerToNfts.set(owner, new Set());
    }
    this.ownerToNfts.get(owner)!.add(nftAddress);
    this.nftToOwner.set(nftAddress, owner);
  }

  getOwner(nftAddress: string): string | undefined {
    return this.nftToOwner.get(nftAddress);
  }

  getOwnedNfts(owner: string): string[] {
    return Array.from(this.ownerToNfts.get(owner) || []);
  }

  ownsAny(owner: string): boolean {
    const nfts = this.ownerToNfts.get(owner);
    return nfts !== undefined && nfts.size > 0;
  }
}
```

## Rate Limiting

```typescript
import Bottleneck from "bottleneck";

// TON API: 10 requests/second
const tonApiLimiter = new Bottleneck({
  maxConcurrent: 5,
  minTime: 100, // 10 req/sec
});

// TON Center: 1 request/second without API key
const tonCenterLimiter = new Bottleneck({
  maxConcurrent: 1,
  minTime: TON_CENTER_KEY ? 100 : 1000,
});

// Wrap API calls
export const rateLimitedTonApi = <T>(fn: () => Promise<T>) =>
  tonApiLimiter.schedule(fn);

export const rateLimitedTonCenter = <T>(fn: () => Promise<T>) =>
  tonCenterLimiter.schedule(fn);
```

## Error Handling

```typescript
export class TonApiError extends Error {
  constructor(
    message: string,
    public statusCode: number,
    public response?: any,
  ) {
    super(message);
    this.name = "TonApiError";
  }
}

export async function safeTonApiRequest<T>(
  endpoint: string,
  retries = 3,
): Promise<T | null> {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      return await tonApiRequest<T>(endpoint);
    } catch (error: any) {
      console.error(`TON API error (attempt ${attempt}):`, error.message);

      // Don't retry on 4xx errors
      if (error.statusCode >= 400 && error.statusCode < 500) {
        return null;
      }

      // Exponential backoff
      if (attempt < retries) {
        await new Promise((r) => setTimeout(r, 1000 * Math.pow(2, attempt)));
      }
    }
  }

  return null;
}
```

## Environment Configuration

```typescript
// src/lib/ton/config.ts
export const TON_CONFIG = {
  network: process.env.VITE_TON_NETWORK || "mainnet",

  api: {
    tonApi: {
      baseUrl: "https://tonapi.io/v2",
      key: process.env.TON_API_KEY,
    },
    tonCenter: {
      baseUrl:
        process.env.VITE_TON_NETWORK === "testnet"
          ? "https://testnet.toncenter.com/api/v2"
          : "https://toncenter.com/api/v2",
      key: process.env.TON_CENTER_API_KEY,
    },
  },

  contracts: {
    collection: process.env.VITE_COLLECTION_ADDRESS!,
    marketplace: process.env.VITE_MARKETPLACE_ADDRESS,
  },

  cache: {
    ttl: 300, // 5 minutes
    ownershipTtl: 60, // 1 minute for ownership checks
  },
};
```

## Testing API Integration

```typescript
// tests/ton-api.test.ts
import { describe, it, expect, vi } from "vitest";
import { getAccountNfts, verifyNftOwnership } from "../src/lib/ton/api";

describe("TON API Integration", () => {
  it("should fetch account NFTs", async () => {
    const nfts = await getAccountNfts(
      "EQCxE6mUtQJKFnGfaROTKOt1lZbDiiX1kCixRv7Nw2Id_sDs",
    );

    expect(Array.isArray(nfts)).toBe(true);
  });

  it("should verify NFT ownership", async () => {
    const isOwner = await verifyNftOwnership(
      "EQTest...", // NFT address
      "EQOwner...", // Expected owner
    );

    expect(typeof isOwner).toBe("boolean");
  });

  it("should handle API errors gracefully", async () => {
    const result = await safeTonApiRequest("/invalid-endpoint");
    expect(result).toBeNull();
  });
});
```
