# FHEVM Agent Skill

Use this rule for Zama FHEVM confidential app development.

Before coding:

- Read `SKILL.md`.
- Apply `agent-rules.md`.
- Use `decision-frameworks.md` to choose user decryption, public decryption, transient permissions, encrypted conditionals, or ERC-7984.
- Check `anti-patterns.md` before final output.
- Prefer `templates/` and `examples/` over invented APIs.

Validation:

```bash
npm run compile
npm test
npm run agent:smoke
```

Hard rules:

- Fresh encrypted input must be `externalE*` plus `bytes inputProof`.
- Always call `FHE.fromExternal`.
- Always call `FHE.allowThis` after persistent encrypted state updates.
- Grant `FHE.allow(value, user)` for user decryption.
- Use `FHE.allowTransient` for same-transaction handoffs.
- Use `FHE.select` for encrypted conditionals.
- Use OpenZeppelin ERC-7984 for confidential fungible tokens.

