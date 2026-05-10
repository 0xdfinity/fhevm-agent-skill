# ERC-7984 Confidential Token Example

Pattern: encrypted balances, private transfers, operator-aware transfer-from, and ERC-20 wrapping.

Use this when a user asks for confidential fungible tokens, private balances, private payment rails, token wrapping, or ERC-20 interoperability.

Agent rules:

- Use OpenZeppelin `ERC7984` for confidential fungible tokens.
- Use `euint64` for token amounts.
- Use the overload with `externalEuint64` plus `inputProof` when the caller submits a fresh encrypted amount.
- Use the overload with `euint64` only when the caller already has ACL access to that ciphertext.
- Never mirror encrypted balances into plaintext balances.
- For ERC-20 wrapping, keep the ERC-20 transfer public and mint/burn the ERC-7984 amount encrypted.
- For unwrapping, use the public-decryption finalization flow before releasing public ERC-20 amounts.

Files:

- `contracts/ConfidentialToken.sol`
- `test/ConfidentialToken.ts`
- `deploy/deploy.ts`
- `frontend/erc7984Client.ts`

