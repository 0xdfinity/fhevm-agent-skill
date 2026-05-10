# FHEVM Agent Skill

The operating system for AI-native confidential app development on Zama FHEVM.

This package is a production-ready skill system for coding agents such as Claude Code, Cursor, Windsurf, Cline, Copilot-style agents, and custom AI developer tools. It teaches agents how to design, implement, test, deploy, and integrate confidential smart contracts with Zama FHEVM while avoiding the failures that usually come from treating encrypted values like normal Solidity values.

## What This Is

It is a protocol for agent behavior.

The skill gives an AI agent:

- A strict FHEVM reasoning model.
- Operational rules for encrypted state, ACL, input proofs, and decryption.
- Working contract, test, deploy, and frontend patterns.
- Anti-pattern detection before code is emitted.
- Decision frameworks for choosing public decryption, user decryption, transient permissions, ERC-7984, and frontend flows.
- Prompt recipes that map vague product requests to correct confidential architectures.

## Verified Surface

The included Hardhat project has been verified locally:

- `npm run compile`: compiles 38 Solidity files.
- `npm test`: runs 9 passing confidential workflow tests.

## Quick Start

```bash
cd fhevm-agent-skill
npm install
npm run compile
npm test
npm run agent:smoke
npm run os:doctor
```

For the hosted demo lane, fill `.env` from `.env.example` with `MNEMONIC`, `INFURA_API_KEY`, and `VERCEL_TOKEN`. The agent can then run the full deployment lane internally:

```bash
npm run deploy:demo
```

This compiles, tests, deploys the confidential voting contract to Sepolia, writes frontend config, deploys the static frontend to Vercel, and prints the live URL. In normal use, the developer does not need to type this command; the coding agent runs it after a natural-language prompt such as "Build a confidential voting dApp and deploy it."

## Import Into Agents

This package can be used in two modes.

Mode 1: native skill.

- Claude Code: copy this folder to `~/.claude/skills/fhevm-agent-skill` or `.claude/skills/fhevm-agent-skill`.
- Codex and AGENTS-compatible tools: keep `AGENTS.md` at the project root.
- Any SKILL.md-compatible agent: use `SKILL.md` as the skill entrypoint.

Mode 2: universal project adapter.

Install the skill payload and agent bootloaders into another repository:

```powershell
powershell -ExecutionPolicy Bypass -File .\scripts\install-agent-adapters.ps1 -TargetPath C:\path\to\your\dapp
```

or on macOS/Linux:

```bash
bash scripts/install-agent-adapters.sh /path/to/your/dapp
```

The installer writes:

- `.agent-skills/fhevm-agent-skill/`: the full skill payload
- `AGENTS.md`: Codex, Cline, Windsurf, Cursor-compatible generic entrypoint
- `CLAUDE.md`: Claude Code project memory bootloader
- `.cursor/rules/fhevm-agent-skill.mdc`: Cursor rule
- `.windsurf/rules/fhevm-agent-skill.md`: Windsurf rule
- `.clinerules/fhevm-agent-skill.md`: Cline rule
- `.github/copilot-instructions.md`: GitHub Copilot instructions

If a target instruction file already exists, the installer writes a sidecar file instead of overwriting unless `-Force` or `FORCE=1` is used.

## Generate A Starter DApp

This repository also ships a small runtime CLI. It turns recipes into runnable project scaffolds:

```bash
npm run os:recipes
node scripts/fhevm-agent-os.mjs scaffold confidential-voting ../my-confidential-voting-app
```

Generated apps include:

- selected contract, test, deploy script, and frontend integration snippet
- Hardhat config
- package scripts
- `.agent-skills/fhevm-agent-skill/`
- bootloaders for Codex, Claude Code, Cursor, Windsurf, Cline, and Copilot
- `FHEVM_AGENT_BOOT.md` with the correct prompt and validation workflow

## Why This Is An Agent OS

The structure is intentionally system-like:

- Kernel: `SKILL.md`
- Bootloaders: `AGENTS.md`, `CLAUDE.md`, Cursor/Windsurf/Cline/Copilot adapters
- Drivers: `templates/`
- Reference programs: `examples/`
- Policy engine: `agent-rules.md` and `anti-patterns.md`
- Scheduler/router: `prompt-recipes.md` and `decision-frameworks.md`
- Health checks: `npm run compile`, `npm test`, `npm run agent:smoke`
- Manifest: `fhevm-agent-skill.manifest.json`

That is the difference between documentation and infrastructure: another agent can discover it, load it, follow it, generate code from it, and verify the result.

## Project Map

- `SKILL.md`: primary AI agent operating system.
- `agent-rules.md`: enforceable FHEVM development rules.
- `architecture-patterns.md`: reusable confidential app architecture patterns.
- `anti-patterns.md`: wrong/correct examples for common failures.
- `frontend-integration.md`: fhevmjs/relayer SDK and React SDK patterns.
- `deployment-guide.md`: local, localhost, and Sepolia deployment workflow.
- `testing-guide.md`: Hardhat FHEVM test strategy.
- `prompt-recipes.md`: 10+ recipes for interpreting developer prompts.
- `decision-frameworks.md`: pattern selection matrices.
- `examples/`: six complete app examples.
- `templates/`: reusable contract, test, frontend, and deploy templates.
- `demo/`: bounty/demo walkthrough and validation checklist.
- `fhevm-agent-skill.manifest.json`: machine-readable adapter and capability map.
- `scripts/install-agent-adapters.*`: installers for mounting the skill into other projects.
- `scripts/agent-smoke-test.mjs`: structural validation for the agent packaging layer.
- `scripts/deploy-full-demo.mjs`: one-command Sepolia + Vercel demo deployment.
- `frontend/confidential-voting-app`: Vercel-ready confidential voting frontend.
- `single-prompt-deployment.md`: exact end-to-end deployment protocol for agents.

## Included Examples

- Confidential Voting
- ERC-7984 Confidential Token and ERC-20 Wrapper
- Confidential Payroll
- Sealed-Bid Auction
- Confidential DAO Voting
- Confidential Marketplace

Each example includes a contract, test, deployment script, frontend integration snippet, encryption/decryption flow, and anti-pattern warnings.

## Research Anchors

This skill is aligned with current Zama and OpenZeppelin references:

- [Zama Solidity quick start](https://docs.zama.org/protocol/solidity-guides/getting-started/quick-start-tutorial)
- [Zama supported encrypted types](https://docs.zama.org/protocol/solidity-guides/smart-contract/types)
- [Zama encrypted operations](https://docs.zama.org/protocol/solidity-guides/smart-contract/operations)
- [Zama encrypted inputs](https://docs.zama.org/protocol/solidity-guides/smart-contract/inputs)
- [Zama ACL guide](https://docs.zama.org/protocol/solidity-guides/smart-contract/acl)
- [Zama Hardhat plugin guide](https://docs.zama.org/protocol/solidity-guides/development-guide/hardhat)
- [Zama user decryption](https://docs.zama.org/protocol/relayer-sdk-guides/fhevm-relayer/decryption/user-decryption)
- [Zama public decryption](https://docs.zama.org/protocol/relayer-sdk-guides/fhevm-relayer/decryption/public-decryption)
- [OpenZeppelin Confidential Contracts](https://docs.openzeppelin.com/confidential-contracts)
- [OpenZeppelin ERC-7984 docs](https://docs.openzeppelin.com/confidential-contracts/token)
- [fhevm-hardhat-template](https://github.com/zama-ai/fhevm-hardhat-template)
- [fhevm-react-template](https://github.com/zama-ai/fhevm-react-template)

## Positioning

This project is ecosystem infrastructure for AI-powered confidential smart contract development. Its job is to make the agent slower to hallucinate, faster to validate, and much more likely to ship working FHEVM code.
