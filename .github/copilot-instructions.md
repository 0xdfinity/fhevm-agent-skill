# FHEVM Agent Skill Instructions

This repository is an AI-native skill system for Zama FHEVM development.

When generating or reviewing code:

- Follow `SKILL.md`.
- Enforce `agent-rules.md`.
- Check `anti-patterns.md`.
- Use `decision-frameworks.md` for architecture choices.
- Use `examples/` and `templates/` as implementation references.

Required commands before claiming success:

```bash
npm run compile
npm test
npm run agent:smoke
```

Never expose decrypted confidential values onchain. Never compare encrypted values with Solidity operators. Never accept fresh encrypted user input without proof validation.

