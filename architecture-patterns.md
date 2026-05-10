# Architecture Patterns

Use this file to select a known-good architecture before writing code.

## Pattern 1: Private Input, Public Final Result

Use for voting, auctions, marketplaces, games, sealed scoring, and aggregate analytics.

Shape:

- Public metadata.
- Encrypted user input.
- Encrypted aggregate state.
- Public reveal at the end.

Contract flow:

1. Accept `externalE*` and `inputProof`.
2. Convert with `FHE.fromExternal`.
3. Update encrypted aggregate using `FHE.*`.
4. Call `FHE.allowThis` on aggregate.
5. On finalization, call `FHE.makePubliclyDecryptable`.

Examples:

- `examples/confidential-voting`
- `examples/sealed-bid-auction`
- `examples/confidential-marketplace`
- `examples/confidential-dao`

## Pattern 2: Private User State

Use for balances, salaries, health scores, private counters, identity attributes, and personal limits.

Shape:

- Public account address.
- Encrypted per-user value.
- User-only decryption.

Contract flow:

1. Store encrypted value.
2. Call `FHE.allowThis(value)`.
3. Call `FHE.allow(value, user)`.
4. Expose `valueHandle(user)`.
5. Frontend performs EIP-712 user decryption.

Examples:

- `examples/confidential-payroll`
- `examples/encrypted-erc7984`

## Pattern 3: Confidential Token

Use when balances and transfer amounts must be private.

Use OpenZeppelin `ERC7984`.

Shape:

- Public token metadata.
- Encrypted balances.
- Encrypted transfer amounts.
- Optional operators.
- Optional ERC-20 wrapper.

Contract flow:

1. Extend `ERC7984`.
2. Use `euint64` amounts.
3. Use `confidentialTransfer` methods.
4. Use wrapper extension for ERC-20 interoperability.
5. Use public-decryption finalization for unwraps.

Example:

- `examples/encrypted-erc7984`

## Pattern 4: Encrypted Conditional Update

Use when a private condition chooses one encrypted outcome.

Wrong mental model:

```solidity
if (encryptedBid > highestBid) {
    highestBid = encryptedBid;
}
```

Correct mental model:

```solidity
ebool beats = FHE.gt(encryptedBid, highestBid);
highestBid = FHE.select(beats, encryptedBid, highestBid);
FHE.allowThis(highestBid);
```

## Pattern 5: Encrypted Multi-Choice Routing

Use for private candidate choice, private category selection, or hidden routing.

Contract flow:

1. Convert encrypted choice.
2. Iterate public choices.
3. For each choice, compute `isSelected = FHE.eq(choice, i)`.
4. Select encrypted increment.
5. Update each encrypted bucket.

Used by:

- `ConfidentialVoting`

## Pattern 6: Public Metadata, Confidential Amount

Use for marketplaces, payroll, bids, transfers, donations, and RFQs.

Public:

- participant address
- listing/proposal ID
- metadata URI
- lifecycle status

Encrypted:

- amount
- private choice
- score
- reserve
- winner until reveal

## Pattern 7: Public-Decryption Finalization

Use when an encrypted result must become an onchain public value.

Flow:

1. Contract marks ciphertext with `FHE.makePubliclyDecryptable`.
2. Off-chain relayer returns clear value and decryption proof.
3. Contract verifies with `FHE.checkSignatures`.
4. Contract finalizes public action.

Common use:

- ERC-7984 unwrap into ERC-20
- auction settlement
- marketplace settlement
- public final scores

## Pattern 8: Transient Ciphertext Handoff

Use when another contract needs a ciphertext only in the current transaction.

Flow:

```solidity
FHE.allowTransient(amount, address(otherContract));
otherContract.consume(amount);
```

Use for:

- ERC-7984 callbacks
- routers
- wrappers
- swaps
- one-step adapters

Do not use transient allowance for values needed in future transactions.

