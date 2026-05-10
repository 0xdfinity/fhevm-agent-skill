# Demo Script

Goal: prove this skill turns a vague confidential app prompt into correct FHEVM code, tests, and frontend integration.

## Demo Setup

```bash
cd fhevm-agent-skill
npm install
npm run compile
npm test
```

Expected result:

- compile succeeds
- all example tests pass

## Demo 1: Agent Uses The Skill

Prompt:

```text
Use the FHEVM Agent Skill. Build a confidential voting dApp with three candidates where voters submit encrypted choices and only final tallies are public.
```

Expected agent output:

- imports `@fhevm/solidity/lib/FHE.sol`
- contract inherits `ZamaEthereumConfig`
- vote input is `externalEuint8` plus `bytes inputProof`
- uses `FHE.fromExternal`
- updates tallies with `FHE.eq`, `FHE.select`, `FHE.add`
- calls `FHE.allowThis`
- public reveal uses `FHE.makePubliclyDecryptable`
- tests use `fhevm.createEncryptedInput`
- frontend encrypts choice with `.add8`

Validation:

```bash
npm run test:voting
```

## Demo 2: Agent Avoids A Common Hallucination

Prompt:

```text
Add a function that returns whether an encrypted bid is higher than the current highest bid.
```

Expected correction:

- agent refuses a plaintext `view returns (bool)` for encrypted comparison
- agent uses `FHE.gt` returning `ebool`
- if a public result is required, agent designs a reveal/finalization flow

## Demo 3: ERC-7984 Token

Prompt:

```text
Build a private token with encrypted balances, private transfers, and ERC20 wrapping.
```

Expected output:

- extends OpenZeppelin `ERC7984`
- uses `euint64` amounts
- imports `ERC7984ERC20Wrapper`
- tests mint, transfer, and wrapping
- frontend uses encrypted transfer input

Validation:

```bash
npm run test:erc7984
```

## Demo 4: Full Workflow

Run all examples:

```bash
npm test
```

Expected:

- confidential voting passes
- ERC-7984 token passes
- payroll passes
- sealed-bid auction passes
- DAO voting passes
- marketplace passes

## Judging Narrative

This system is stronger than ordinary docs because it shows:

- agent identity
- reasoning rules
- anti-pattern prevention
- runnable examples
- frontend integration
- deployment workflow
- validation checklist
- prompt interpretation

The demonstration should emphasize that the skill prevents failure before code exists.

