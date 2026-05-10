# FHEVM Agent Skill

Reusable AI skill package for Zama FHEVM confidential app development.

This repository contains agent instructions, adapters, examples, templates, and validation checks for coding agents such as Claude Code, Cursor, Windsurf, Cline, Copilot-style agents, Codex, and custom AI developer tools. It is meant to be imported into another project so an agent can build that project's own FHEVM dApp from a natural-language prompt.

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

This repository does not commit generated dApps. Use the skill in a target project, then prompt your coding agent to build, test, and deploy that project's app.

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

## Structure

The package is organized so agents can load instructions, select patterns, generate code, and validate outputs:

- `SKILL.md`: primary agent instructions.
- `AGENTS.md`, `CLAUDE.md`, Cursor/Windsurf/Cline/Copilot adapters: agent bootloaders.
- `templates/`: reusable code templates.
- `examples/`: reference app patterns.
- `agent-rules.md` and `anti-patterns.md`: validation and failure-prevention rules.
- `prompt-recipes.md` and `decision-frameworks.md`: prompt routing and architecture selection.
- `scripts/`: packaging, scaffold, and adapter-install tooling.

## Project Map

- `SKILL.md`: primary agent instruction file.
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
- `single-prompt-deployment.md`: generic end-to-end deployment protocol for agents working inside a target dApp.

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
