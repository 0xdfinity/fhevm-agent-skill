# Testing Guide

FHEVM tests must validate workflows, not just function calls.

## Core Test Shape

```ts
const encrypted = await fhevm
  .createEncryptedInput(contractAddress, alice.address)
  .add64(100)
  .encrypt();

await contract.connect(alice).submit(encrypted.handles[0], encrypted.inputProof);
```

Then decrypt:

```ts
const handle = await contract.valueHandle(alice.address);
const clear = await fhevm.userDecryptEuint(FhevmType.euint64, handle, contractAddress, alice);
expect(clear).to.equal(100n);
```

## What To Test

Input proof validation:

- encrypted inputs are created with the target contract address
- encrypted inputs are created with the transaction signer address
- wrong signer or wrong contract should fail

ACL:

- contract can reuse stored ciphertext after `FHE.allowThis`
- authorized user can decrypt
- unauthorized user cannot decrypt when relevant

Encrypted math:

- `FHE.add`, `FHE.sub`, `FHE.mul`
- overflow-sensitive cases
- zero or uninitialized state behavior

Encrypted comparisons:

- greater than
- less than
- equality
- encrypted conditionals with `FHE.select`

Public decryption:

- fails or is not attempted before reveal
- succeeds after `FHE.makePubliclyDecryptable`
- returns the expected value and type

ERC-7984:

- mint
- confidential transfer
- confidential transfer from
- operator behavior
- wrap ERC-20 into ERC-7984
- unwrap request and public-decryption finalization when implemented

## Type Table

Use the exact matching decryption helper:

| Solidity type | Hardhat decrypt |
| --- | --- |
| `ebool` | `fhevm.userDecryptEbool` |
| `euint8` | `fhevm.userDecryptEuint(FhevmType.euint8, ...)` |
| `euint16` | `fhevm.userDecryptEuint(FhevmType.euint16, ...)` |
| `euint32` | `fhevm.userDecryptEuint(FhevmType.euint32, ...)` |
| `euint64` | `fhevm.userDecryptEuint(FhevmType.euint64, ...)` |
| `eaddress` | `fhevm.userDecryptEaddress` |

Public decrypt uses the corresponding public helpers.

## Example Test Commands

```bash
npm run compile
npm test
npm run test:voting
npm run test:erc7984
npm run test:payroll
npm run test:auction
npm run test:dao
npm run test:marketplace
```

## CI Gate

A generated app is not accepted until:

- contracts compile
- all workflow tests pass
- at least one encrypted input proof path is tested
- at least one user decryption path is tested for user-private state
- at least one public decryption path is tested for public outcomes
- ACL assumptions are explicit

