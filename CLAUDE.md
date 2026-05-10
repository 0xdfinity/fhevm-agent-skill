# Claude Code Memory

Use this workspace as the FHEVM Agent Skill.

Load the operating instructions:

- @./SKILL.md
- @./agent-rules.md
- @./decision-frameworks.md
- @./anti-patterns.md

When the user asks to build confidential apps, generate contracts, tests, deploy scripts, and frontend integration together. Validate with:

```bash
npm run compile
npm test
npm run agent:smoke
```

For natural-language requests such as "build a confidential voting dApp and deploy it", fill/check `.env` from `.env.example`, then run internally:

```bash
npm run deploy:demo
```
