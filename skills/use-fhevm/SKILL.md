---
name: use-fhevm
description: Use for any Zama FHEVM confidential dApp work, including encrypted Solidity contracts, ACL, input proofs, encrypted operations, user/public decryption, frontend integration, testing, deployment, ERC-7984, or selecting the right FHEVM architecture.
---

# Use FHEVM

This is the primary routing skill for Zama FHEVM work. Use it when the user asks to build, fix, review, test, or deploy confidential smart contracts or dApps.

## Routing

- Contract logic, encrypted types, ACL, proofs, and Solidity patterns: use `../build-fhevm-contracts/SKILL.md`.
- Frontend encryption, wallet UX, relayer SDK, user decryption, and public decryption: use `../integrate-fhevm-frontend/SKILL.md`.
- Hardhat tests and mock encrypted workflows: use `../test-fhevm-contracts/SKILL.md`.
- Sepolia, frontend hosting, Vercel, and demo validation: use `../deploy-fhevm-dapp/SKILL.md`.
- ERC-7984, confidential balances, private transfers, wrapping, and ERC-20 interoperability: use `../use-erc7984/SKILL.md`.
- New project generation from a prompt or recipe: use `../scaffold-fhevm-dapp/SKILL.md`.

## Core Rules

- Treat encrypted values as permissioned handles, not normal integers.
- Fresh encrypted user input must be `externalE*` plus `bytes inputProof`, imported with `FHE.fromExternal`.
- Persistent encrypted state must receive `FHE.allowThis`.
- User-decryptable state must receive `FHE.allow(value, user)`.
- Same-transaction downstream contract access must use `FHE.allowTransient`.
- Encrypted comparisons and conditionals must use FHE operations such as `FHE.eq`, `FHE.gt`, and `FHE.select`.
- Never expose decrypted private values onchain.
- Never return encrypted handles from view functions as if they are plaintext.
- Frontends must separate encrypted contract state from wallet-connected encryption/decryption UX.
- Generated dApps, `.env`, `.vercel`, and deployment artifacts belong in the target project, not this skill repository.

## Reference Files

Load only what the task needs:

- `references/core-operating-protocol.md`: full operating protocol and validation checklist.
- `references/agent-rules.md`: enforceable FHEVM coding rules.
- `references/anti-patterns.md`: wrong/correct examples for common failures.
- `references/architecture-patterns.md`: app architecture patterns.
- `references/decision-frameworks.md`: pattern selection guidance.
- `references/prompt-recipes.md`: mapping natural-language product requests to architectures.
- `references/frontend-integration.md`: relayer SDK, React SDK, wallet, encryption, and decryption patterns.
- `references/testing-guide.md`: confidential Hardhat test strategy.
- `references/deployment-guide.md`: local, Sepolia, and frontend deployment workflow.
- `references/troubleshooting.md`: failure diagnosis.

## Assets

- `../../assets/examples/`: copyable reference apps.
- `../../assets/templates/`: reusable contract, test, deployment, and frontend snippets.
