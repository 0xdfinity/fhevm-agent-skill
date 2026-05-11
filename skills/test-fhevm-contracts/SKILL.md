---
name: test-fhevm-contracts
description: Write or fix Hardhat tests for Zama FHEVM confidential contracts, including encrypted input creation, ACL checks, user decryption, public decryption, proof validation, and negative tests.
---

# Test FHEVM Contracts

Use this skill for Hardhat tests, mock encrypted workflows, proof validation, ACL failures, and regression coverage.

## Workflow

1. Use `fhevm.createEncryptedInput(contractAddress, userAddress)`.
2. Match input builder methods to Solidity encrypted types: `addBool`, `add8`, `add16`, `add32`, `add64`, `addAddress`.
3. Pass `encrypted.handles[i]` and `encrypted.inputProof` to contract calls.
4. Decrypt with the matching `FhevmType`.
5. Test failure modes: missing ACL, double actions, closed lifecycle, unauthorized owner actions, wrong signer, wrong type.
6. Test public decryption only after the contract marks values publicly decryptable.
7. Keep tests focused on encrypted workflow semantics, not just public state.

## References

- `../use-fhevm/references/testing-guide.md`
- `../use-fhevm/references/anti-patterns.md`
- `../use-fhevm/references/troubleshooting.md`

## Assets

- `../../assets/templates/test-template.ts`
- `../../assets/examples/*/test/`
