---
name: scaffold-fhevm-dapp
description: Generate a new target Zama FHEVM dApp from this skill package, including contracts, tests, deploy scripts, frontend snippets, and agent adapters for Codex, Claude Code, Cursor, Windsurf, Cline, and Copilot.
---

# Scaffold FHEVM DApp

Use this skill when the user asks to create a new confidential voting app, payroll app, auction, DAO, marketplace, ERC-7984 token, or other target project from a natural-language prompt.

## Workflow

1. Select the closest recipe with `node scripts/fhevm-agent-os.mjs list-recipes`.
2. Scaffold into a target project outside this skill repo:

```bash
node scripts/fhevm-agent-os.mjs scaffold <recipe> <target>
```

3. Install dependencies in the target project.
4. Run compile and tests in the target project.
5. Continue with `../deploy-fhevm-dapp/SKILL.md` when deployment is requested.

## Recipes

- `confidential-voting`
- `encrypted-erc7984`
- `confidential-payroll`
- `sealed-bid-auction`
- `confidential-dao`
- `confidential-marketplace`

## Rules

- Generated apps belong outside this skill package.
- Do not commit target-project `.env`, `.vercel`, `deployments/`, build outputs, or node modules.
- If the target already has agent instructions, write sidecars unless the user approves overwrite.

## Assets

- `../../assets/examples/`
- `../../assets/templates/`
- `../../scripts/fhevm-agent-os.mjs`
