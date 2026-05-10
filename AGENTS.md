# AGENTS.md

This repository contains the FHEVM Agent Skill: an AI-native operating system for confidential app development on Zama FHEVM.

Before generating or editing FHEVM code:

1. Read [SKILL.md](SKILL.md).
2. Apply [agent-rules.md](agent-rules.md).
3. Check [anti-patterns.md](anti-patterns.md) before finalizing.
4. Use [decision-frameworks.md](decision-frameworks.md) to select user decryption, public decryption, ACL, transient permissions, or ERC-7984.
5. Use [templates](templates) and [examples](examples) as implementation sources, not decorative docs.

Required validation:

```bash
npm run compile
npm test
npm run agent:smoke
```

For natural-language requests such as "build a confidential voting dApp and deploy it", use local secrets from `.env` and run the hosted demo lane internally:

```bash
npm run deploy:demo
```

This compiles, tests, deploys `ConfidentialVoting` to Sepolia, writes frontend deployment config, and deploys the static frontend to Vercel.

Never emit FHEVM code that:

- accepts fresh encrypted user input without `externalE*` plus `inputProof`
- omits `FHE.fromExternal`
- stores encrypted state without `FHE.allowThis`
- lets a user decrypt without `FHE.allow(value, user)`
- compares encrypted values with Solidity operators
- exposes decrypted private values onchain
- implements confidential fungible tokens without considering OpenZeppelin ERC-7984
