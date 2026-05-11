---
name: use-erc7984
description: Build ERC-7984 confidential tokens with encrypted balances, private transfers, wrapping/unwrapping, ERC-20 interoperability, OpenZeppelin Confidential Contracts, ACL permissions, and frontend/test flows.
---

# Use ERC-7984

Use this skill when the user asks for encrypted balances, confidential token transfers, private payroll/token payouts, ERC-20 wrapping, or OpenZeppelin Confidential Contracts.

## Workflow

1. Prefer OpenZeppelin Confidential Contracts unless the user has a clear audited reason not to.
2. Model balances as encrypted balances; never mirror private balances in plaintext.
3. Use fresh transfer amounts as `externalEuint64` plus `inputProof`.
4. Grant `FHE.allowThis` to stored balances.
5. Grant `FHE.allow(balance, account)` only for account-owner decryption.
6. Use wrapping for ERC-20 interoperability.
7. For unwrapping, reveal only the amount required by the public ERC-20 transfer flow.
8. Test private transfer success, ACL failures, encrypted balance decryption, wrapping, and public interop.

## Hard Stops

- Do not expose decrypted balances onchain.
- Do not implement ERC-7984 as a normal ERC-20 with `mapping(address => uint256)`.
- Do not allow arbitrary users to decrypt another account's balance.
- Do not skip OpenZeppelin's base contracts without justification.

## References

- `../use-fhevm/references/agent-rules.md`
- `../use-fhevm/references/anti-patterns.md`
- `../use-fhevm/references/decision-frameworks.md`

## Assets

- `../../assets/templates/confidential-token.sol`
- `../../assets/examples/encrypted-erc7984/`
