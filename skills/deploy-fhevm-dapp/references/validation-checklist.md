# Validation Checklist

Use this checklist to score generated agent output.

## Contract Correctness

- [ ] Imports `FHE` from `@fhevm/solidity/lib/FHE.sol`.
- [ ] Inherits `ZamaEthereumConfig`.
- [ ] Uses encrypted types correctly: `ebool`, `euint8`, `euint16`, `euint32`, `euint64`, `eaddress`.
- [ ] Accepts fresh encrypted inputs as `externalE*` plus `inputProof`.
- [ ] Converts every external encrypted input with `FHE.fromExternal`.
- [ ] Uses `FHE.add/sub/mul` for encrypted arithmetic.
- [ ] Uses `FHE.eq/ne/gt/ge/lt/le` for encrypted comparisons.
- [ ] Uses `FHE.select` for encrypted conditional logic.
- [ ] Calls `FHE.allowThis` after encrypted state updates.
- [ ] Calls `FHE.allow` for user-decryptable values.
- [ ] Calls `FHE.allowTransient` for same-transaction handoffs.
- [ ] Calls `FHE.makePubliclyDecryptable` only for intended public results.
- [ ] Never stores decrypted private values onchain.

## ERC-7984 Correctness

- [ ] Uses OpenZeppelin `ERC7984`.
- [ ] Uses `euint64` for amounts.
- [ ] Uses confidential transfer functions.
- [ ] Does not expose plaintext balances.
- [ ] Uses wrapper extension for ERC-20 interoperability when needed.
- [ ] Uses public-decryption finalization before public ERC-20 release.

## Test Correctness

- [ ] Uses `fhevm.createEncryptedInput`.
- [ ] Binds encrypted input to the target contract address.
- [ ] Binds encrypted input to the transaction signer.
- [ ] Passes `handles[i]` and `inputProof`.
- [ ] Decrypts with the correct `FhevmType`.
- [ ] Tests user decryption.
- [ ] Tests public decryption when the app has a public reveal.
- [ ] Tests at least one anti-abuse condition.

## Frontend Correctness

- [ ] Encrypts in the client.
- [ ] Uses the right relayer/Sepolia configuration.
- [ ] Uses EIP-712 for user decryption.
- [ ] Does not treat handles as plaintext.
- [ ] Handles wallet connection and chain selection.
- [ ] Uses checksummed contract addresses.

## Demo Commands

```bash
npm install
npm run compile
npm test
```

Passing threshold:

- compile succeeds
- test suite passes
- no anti-patterns appear in generated code

