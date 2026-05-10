# Troubleshooting

## Compile: Unknown FHE Function

Cause:

- Hallucinated API.
- Old FHEVM version.
- Wrong import.

Fix:

- Import `FHE` from `@fhevm/solidity/lib/FHE.sol`.
- Use supported functions: `fromExternal`, `add`, `sub`, `mul`, `eq`, `ne`, `gt`, `ge`, `lt`, `le`, `select`, `allow`, `allowThis`, `allowTransient`, `makePubliclyDecryptable`, `checkSignatures`.

## Compile: Encrypted Type Cannot Be Used With Operator

Cause:

- Solidity operator used on encrypted values.

Fix:

- Replace `+` with `FHE.add`.
- Replace `>` with `FHE.gt`.
- Replace `if` branching with `FHE.select`.

## Transaction Reverts On Encrypted Input

Cause:

- `createEncryptedInput` used wrong contract address.
- `createEncryptedInput` used wrong user address.
- Wrong handle index.
- Wrong `inputProof`.

Fix:

- Bind encrypted input to the exact target contract and transaction signer.
- Keep the handle order aligned with function arguments.

## User Decryption Fails

Cause:

- Missing `FHE.allow(value, user)`.
- Wrong contract address in handle pair.
- Wrong signer.
- EIP-712 authorization expired.

Fix:

- Add `FHE.allow(value, user)` after storing user-readable state.
- Read the handle from the same contract address used in the decrypt request.
- Re-sign EIP-712 authorization.

## Contract Cannot Reuse Stored Encrypted Value

Cause:

- Missing `FHE.allowThis`.

Fix:

```solidity
stateValue = computedValue;
FHE.allowThis(stateValue);
```

## Public Decryption Fails

Cause:

- Value was not made publicly decryptable.
- Wrong handle.
- Attempted reveal before lifecycle finalization.

Fix:

```solidity
FHE.makePubliclyDecryptable(finalResult);
```

Then call public decrypt through the relayer.

## ERC-7984 Transfer Fails

Cause:

- Caller used the `euint64` overload without ACL permission.
- Operator not set for `confidentialTransferFrom`.
- Amount exceeds encrypted balance.

Fix:

- Use the `externalEuint64` plus proof overload for fresh user-submitted amounts.
- Use `setOperator` for delegated transfers.
- In tests, decrypt balances to verify setup.

## Frontend Shows A Huge Hex String Instead Of Value

Cause:

- UI is rendering the ciphertext handle.

Fix:

- Run user decryption or public decryption before displaying plaintext.
- Label handles as developer/debug data only.

## Sepolia Works Differently From Localhost

Cause:

- Local mock mode is fast and cleartext-backed.
- Sepolia uses real FHEVM relayer/KMS flows.

Fix:

- Expect slower encryption/decryption.
- Verify relayer config.
- Use compatibility check.
- Keep gas limits generous for FHE operations.

