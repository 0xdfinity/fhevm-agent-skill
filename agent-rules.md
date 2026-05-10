# Agent Rules

These rules are enforceable. Apply them before generating code and again before finalizing code.

## Reliability Rules

1. Start with a privacy inventory: identify which values are public, encrypted, user-decrypted, or publicly decrypted.
2. Never write a contract before selecting encrypted types and ACL ownership.
3. Prefer the official Hardhat template stack: `@fhevm/solidity`, `@fhevm/hardhat-plugin`, Hardhat tests.
4. Prefer OpenZeppelin Confidential Contracts for ERC-7984 tokens.
5. Do not invent FHEVM APIs. Use `FHE.fromExternal`, `FHE.add`, `FHE.sub`, `FHE.mul`, `FHE.eq`, `FHE.gt`, `FHE.select`, `FHE.allow`, `FHE.allowThis`, `FHE.allowTransient`, `FHE.makePubliclyDecryptable`, `FHE.checkSignatures`.
6. If an operation is not listed in the official FHE library, stop and verify before emitting code.

## Contract Rules

1. Import from `@fhevm/solidity/lib/FHE.sol`.
2. Inherit `ZamaEthereumConfig` on FHEVM contracts.
3. Accept encrypted user inputs as `externalE*` plus `bytes calldata inputProof`.
4. Convert external encrypted inputs with `FHE.fromExternal`.
5. Use `FHE.select` instead of plaintext branching on encrypted conditions.
6. Use plaintext `require` only for public conditions.
7. Grant `FHE.allowThis` for every encrypted value that is stored.
8. Grant `FHE.allow(value, user)` for every value the user must decrypt.
9. Grant `FHE.allowTransient` for values used by another contract in the same transaction.
10. Do not emit plaintext private values.

## Testing Rules

1. Use `fhevm.createEncryptedInput(contractAddress, userAddress)`.
2. The `contractAddress` and `userAddress` must match the target contract and transaction signer.
3. Use `.addBool`, `.add8`, `.add16`, `.add32`, `.add64`, `.addAddress` according to the Solidity type.
4. Pass `encrypted.handles[i]` and `encrypted.inputProof`.
5. Decrypt with the matching `FhevmType`.
6. Test ACL failure modes when the workflow depends on permissions.
7. Test public-decryption flows only after `FHE.makePubliclyDecryptable`.

## Frontend Rules

1. Never ask users to enter plaintext private values into a backend form unless the backend is explicitly trusted.
2. Encrypt in the browser or wallet-connected client.
3. Keep encrypted input generation bound to the exact contract and user.
4. Use EIP-712 user-decryption authorization for private reads.
5. Treat returned encrypted values as handles.
6. Handle zero/uninitialized handles in the UI.
7. For localhost, use cleartext/mock relayer mode where applicable; for Sepolia, use the real relayer config.
8. For static CDN demos, load `relayer-sdk-js.umd.cjs` with a normal script tag and read `globalThis.relayerSDK`; named ESM imports from that URL can kill button binding.
9. Verify wallet/action buttons on the deployed URL, not only in source code.

## Refusal Rules

Do not generate:

- Plaintext balance mirrors for confidential tokens.
- Onchain decrypted salary, bid, vote, or balance storage.
- Contracts that compare `euint*` values with Solidity operators.
- Contracts that omit `inputProof` for fresh encrypted user input.
- Frontends that call decrypt before verifying ACL and wallet authorization.
- ERC-7984 implementations that ignore OpenZeppelin's base contracts without a strong reason.
