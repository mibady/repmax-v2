# TON Smart Contract Patterns for NFT Licensing

## Contract Architecture

```
┌─────────────────────────────────────────────────────────┐
│                  Contract Hierarchy                      │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  LyrixirMaster (Admin)                                   │
│  ├── Controls collection deployment                      │
│  ├── Manages royalty destinations                        │
│  └── Upgrades and migrations                             │
│                                                          │
│  LyrixirCollection (TEP-62)                              │
│  ├── Manages NFT items                                   │
│  ├── Handles minting                                     │
│  ├── Stores royalty params                               │
│  └── Batch operations                                    │
│                                                          │
│  LyrixirLicense (TEP-64)                                 │
│  ├── Individual NFT                                      │
│  ├── Ownership tracking                                  │
│  ├── Transfer with royalty                               │
│  └── Metadata pointer                                    │
│                                                          │
│  LyrixirMarket (Optional)                                │
│  ├── P2P listings                                        │
│  ├── Escrow                                              │
│  ├── Royalty enforcement                                 │
│  └── Fee collection                                      │
│                                                          │
│  LyrixirRoyalty (TEP-66)                                 │
│  ├── Split payments                                      │
│  ├── Artist shares                                       │
│  └── Platform fees                                       │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

## TEP-62: NFT Collection Standard

### Required Methods

```func
;; Get collection data
(int, cell, slice) get_collection_data() method_id;
;; Returns: (next_item_index, collection_content, owner_address)

;; Get NFT address by index
slice get_nft_address_by_index(int index) method_id;
;; Returns: nft_item_address

;; Get NFT content (individual or full)
cell get_nft_content(int index, cell individual_content) method_id;
;; Returns: full_content
```

### Collection Content Format

```
collection_content#_
  collection_content:^Cell  ;; on-chain or off-chain
  common_content:^Cell      ;; shared NFT content prefix
= CollectionContent;

;; Off-chain example:
;; 0x01 + "https://lyrixir.com/collection.json"

;; On-chain example:
;; 0x00 + name:Text + description:Text + image:Text
```

## TEP-64: NFT Item Standard

### Required Methods

```func
;; Get NFT data
(int, int, slice, slice, cell) get_nft_data() method_id;
;; Returns: (init?, index, collection_address, owner_address, individual_content)
```

### Transfer Operation

```func
transfer#5fcc3d14
  query_id:uint64
  new_owner:MsgAddress
  response_destination:MsgAddress
  custom_payload:(Maybe ^Cell)
  forward_amount:(VarUInteger 16)
  forward_payload:(Either Cell ^Cell)
= InternalMsgBody;
```

### Ownership Assigned Notification

```func
ownership_assigned#05138d91
  query_id:uint64
  prev_owner:MsgAddress
  forward_payload:(Either Cell ^Cell)
= InternalMsgBody;
```

## TEP-66: Royalty Standard

### Royalty Params Method

```func
;; Get royalty parameters
(int, int, slice) royalty_params() method_id;
;; Returns: (numerator, denominator, destination)
;; Example: (5, 100, artist_address) = 5% royalty
```

### Royalty Calculation

```typescript
// TypeScript implementation
function calculateRoyalty(
  salePrice: bigint,
  numerator: number,
  denominator: number,
): bigint {
  return (salePrice * BigInt(numerator)) / BigInt(denominator);
}

// Example: 5% royalty on 10 TON sale
const royalty = calculateRoyalty(toNano("10"), 5, 100);
// Result: 0.5 TON
```

## Batch Minting Pattern

### Contract Implementation

```func
;; Batch mint up to 250 NFTs per transaction
() batch_mint(slice sender, int msg_value, slice in_msg_body) impure {
    throw_unless(401, equal_slices(sender, owner_address));

    int count = in_msg_body~load_uint(16);
    throw_unless(402, count <= 250);

    int i = 0;
    while (i < count) {
        slice nft_owner = in_msg_body~load_msg_addr();
        cell nft_content = in_msg_body~load_ref();

        deploy_nft_item(next_item_index, nft_content, nft_owner);
        next_item_index += 1;
        i += 1;
    }

    save_data();
}
```

### TypeScript Batch Builder

```typescript
export function buildBatchMintMessage(
  items: Array<{ owner: Address; content: Cell }>,
): Cell {
  let builder = beginCell()
    .storeUint(2, 32) // op::batch_mint
    .storeUint(0, 64) // query_id
    .storeUint(items.length, 16); // count

  for (const item of items) {
    builder = builder.storeAddress(item.owner).storeRef(item.content);
  }

  return builder.endCell();
}
```

## Soulbound NFT Pattern

For non-transferable licenses:

```func
;; Soulbound - transfer disabled
() transfer(slice sender, int msg_value, slice in_msg_body) impure {
    ;; Check if soulbound flag is set
    if (is_soulbound) {
        throw(403); ;; Transfer not allowed
    }

    ;; Normal transfer logic...
}

;; Only collection can revoke/burn
() burn(slice sender) impure {
    throw_unless(401, equal_slices(sender, collection_address));

    ;; Return remaining balance to owner
    var msg = begin_cell()
        .store_uint(0x10, 6)
        .store_slice(owner_address)
        .store_coins(0)
        .store_uint(0, 1 + 4 + 4 + 64 + 32 + 1 + 1);
    send_raw_message(msg.end_cell(), 128 + 32); ;; destroy contract
}
```

## Time-Limited License Pattern

```func
;; License with expiration
global int expires_at;

() load_data() impure {
    slice ds = get_data().begin_parse();
    ;; ... other fields
    expires_at = ds~load_uint(64);
}

() transfer(slice sender, int msg_value, slice in_msg_body) impure {
    ;; Check expiration
    throw_if(410, now() > expires_at); ;; License expired

    ;; Normal transfer logic...
}

;; Check if license is valid
int is_valid() method_id {
    load_data();
    return now() <= expires_at;
}
```

## Royalty Splitter Contract

```func
;; Split royalties between multiple recipients
;; Storage: recipients (dict: address -> share_bps)

global cell recipients; ;; Dictionary of recipients

() distribute_royalty(int total_amount) impure {
    slice ds = recipients.begin_parse();

    int remaining = total_amount;

    ;; Iterate through recipients
    while (ds.slice_refs_empty?() == 0) {
        slice recipient = ds~load_msg_addr();
        int share_bps = ds~load_uint(16); ;; Basis points (1/10000)

        int amount = (total_amount * share_bps) / 10000;
        remaining -= amount;

        ;; Send share
        var msg = begin_cell()
            .store_uint(0x10, 6)
            .store_slice(recipient)
            .store_coins(amount)
            .store_uint(0, 1 + 4 + 4 + 64 + 32 + 1 + 1);
        send_raw_message(msg.end_cell(), 1);
    }
}
```

## Marketplace Integration Pattern

```func
;; List NFT for sale
;; Message to marketplace contract

list_for_sale#12345678
  nft_address:MsgAddress
  price:Coins
  royalty_address:MsgAddress
  royalty_amount:Coins
= InternalMsgBody;

;; Buy listed NFT
buy#87654321
  nft_address:MsgAddress
= InternalMsgBody;

;; Marketplace executes:
;; 1. Receive payment from buyer
;; 2. Send royalty to artist
;; 3. Send proceeds to seller
;; 4. Transfer NFT to buyer
```

## Gas Optimization Tips

### 1. Minimize Storage Operations

```func
;; Bad: Multiple save_data calls
() bad_example() impure {
    field1 = 1;
    save_data();
    field2 = 2;
    save_data(); ;; Unnecessary
}

;; Good: Single save_data at end
() good_example() impure {
    field1 = 1;
    field2 = 2;
    save_data();
}
```

### 2. Use Refs for Large Data

```func
;; Bad: Inline large content
cell bad_content = begin_cell()
    .store_slice(very_long_string)
.end_cell();

;; Good: Store as reference
cell good_content = begin_cell()
    .store_ref(begin_cell()
        .store_slice(very_long_string)
    .end_cell())
.end_cell();
```

### 3. Batch Operations

```func
;; Process multiple items in one transaction
;; Saves gas on transaction overhead
() batch_process(slice items) impure {
    while (items.slice_refs_empty?() == 0) {
        cell item = items~load_ref();
        process_item(item);
    }
}
```

## Testing Contracts

### Blueprint Test Setup

```typescript
// tests/LyrixirCollection.spec.ts
import { Blockchain, SandboxContract } from '@ton/sandbox'
import { LyrixirCollection } from '../wrappers/LyrixirCollection'

describe('LyrixirCollection', () => {
  let blockchain: Blockchain
  let collection: SandboxContract<LyrixirCollection>

  beforeEach(async () => {
    blockchain = await Blockchain.create()

    collection = blockchain.openContract(
      await LyrixirCollection.createFromConfig({
        owner: deployer.address,
        nextItemIndex: 0n,
        content: buildCollectionContent(),
        nftItemCode: NFT_ITEM_CODE,
        royaltyParams: buildRoyaltyParams(5, 100, artist.address)
      }, COLLECTION_CODE)
    )

    await collection.sendDeploy(deployer.getSender(), toNano('0.5'))
  })

  it('should mint NFT', async () => {
    const result = await collection.sendMint(owner.getSender(), {
      itemIndex: 0n,
      itemOwner: buyer.address,
      itemContent: buildNftContent('Test NFT'),
      value: toNano('0.1')
    })

    expect(result.transactions).toHaveTransaction({
      from: collection.address,
      success: true
    })
  })

  it('should enforce royalty on transfer', async () => {
    // Mint NFT
    await collection.sendMint(...)

    // Get NFT address
    const nftAddress = await collection.getNftAddressByIndex(0n)
    const nft = blockchain.openContract(
      LyrixirLicense.createFromAddress(nftAddress)
    )

    // Transfer NFT
    const transferResult = await nft.sendTransfer(seller.getSender(), {
      newOwner: buyer.address,
      responseDestination: seller.address,
      forwardAmount: toNano('1') // Sale price
    })

    // Verify royalty payment
    expect(transferResult.transactions).toHaveTransaction({
      from: nft.address,
      to: artist.address,
      value: toNano('0.05') // 5% royalty
    })
  })
})
```

## Deployment Checklist

- [ ] Compile contracts with `npx blueprint build`
- [ ] Run tests with `npx blueprint test`
- [ ] Deploy to testnet first
- [ ] Verify on tonscan.org
- [ ] Test all operations on testnet
- [ ] Security audit
- [ ] Deploy to mainnet
- [ ] Update collection metadata
- [ ] Verify mainnet deployment
