---
trigger: model_decision
description: Use for Zama FHEVM confidential app development, encrypted Solidity, ERC-7984, fhevmjs, input proofs, ACL, user decryption, public decryption, Hardhat tests, and deployment.
---

# FHEVM Agent Skill

When a task involves FHEVM, confidential smart contracts, encrypted balances, private transfers, or fhevmjs:

- Read `SKILL.md` first.
- Apply `agent-rules.md`.
- Consult `decision-frameworks.md` before choosing decryption or ACL patterns.
- Use `anti-patterns.md` as a preflight checklist.
- Prefer runnable examples in `examples/` and reusable code in `templates/`.

Run:

```bash
npm run compile
npm test
npm run agent:smoke
```

