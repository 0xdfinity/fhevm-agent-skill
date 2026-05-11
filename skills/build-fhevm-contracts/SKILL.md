---
name: build-fhevm-contracts
description: Build or modify Zama FHEVM Solidity contracts using encrypted types, input proofs, FHE operations, ACL permissions, encrypted conditionals, and secure handle/decryption boundaries.
---

# Build FHEVM Contracts

Use this skill for Solidity contract work involving `ebool`, `euint8`, `euint16`, `euint32`, `euint64`, `eaddress`, encrypted inputs, FHE operations, or permissioned encrypted state.

## Workflow

1. Identify public values, encrypted values, user-decrypted values, and publicly decrypted values.
2. Choose the smallest encrypted type that fits the domain.
3. Accept fresh encrypted inputs as `externalE* value, bytes calldata inputProof`.
4. Convert with `FHE.fromExternal(value, inputProof)` before use.
5. Use FHE operations for arithmetic, comparison, and selection.
6. Grant `FHE.allowThis` to every encrypted value stored in contract state.
7. Grant `FHE.allow(value, user)` only when that user should decrypt.
8. Grant `FHE.allowTransient` for encrypted values used by another contract in the same transaction.
9. Expose handle getters only for values that the frontend/test will decrypt through the correct flow.
10. Run compile and focused tests before final output.

## Hard Stops

- Do not compare encrypted values with Solidity operators.
- Do not branch on encrypted booleans with `if`.
- Do not store decrypted private values onchain.
- Do not omit input proofs for fresh encrypted user inputs.
- Do not use events as a debugging mechanism for encrypted values.
- Do not invent FHEVM APIs.

## References

- `../use-fhevm/references/agent-rules.md`
- `../use-fhevm/references/anti-patterns.md`
- `../use-fhevm/references/architecture-patterns.md`
- `../use-fhevm/references/decision-frameworks.md`

## Assets

- `../../assets/templates/starter-contract.sol`
- `../../assets/templates/access-control-template.sol`
- `../../assets/examples/confidential-voting/contracts/`
- `../../assets/examples/confidential-payroll/contracts/`
- `../../assets/examples/sealed-bid-auction/contracts/`
- `../../assets/examples/confidential-dao/contracts/`
- `../../assets/examples/confidential-marketplace/contracts/`
