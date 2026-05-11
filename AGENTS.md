# AGENTS.md

Use the FHEVM skills in `skills/` for Zama FHEVM confidential app work.

Start with `skills/use-fhevm/SKILL.md`, then route to the specific skill:

- `skills/build-fhevm-contracts/SKILL.md`
- `skills/integrate-fhevm-frontend/SKILL.md`
- `skills/test-fhevm-contracts/SKILL.md`
- `skills/deploy-fhevm-dapp/SKILL.md`
- `skills/use-erc7984/SKILL.md`
- `skills/scaffold-fhevm-dapp/SKILL.md`

Use `assets/examples/` and `assets/templates/` as implementation sources. Generated dApps and deployment artifacts belong in the target project, not this skill package.

Validate this package with:

```bash
npm run compile
npm test
npm run agent:smoke
```
