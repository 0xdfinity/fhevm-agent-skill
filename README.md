# FHEVM Skills Plugin

Skills for building Zama FHEVM confidential applications with encrypted smart contracts, private frontend flows, tests, deployments, and ERC-7984 tokens.

## Included

- `skills/`: FHEVM development skills.
- `assets/examples/`: reference contracts, tests, deploy scripts, and frontend snippets used by the skills.
- `assets/templates/`: reusable implementation templates.
- `scripts/`: scaffold, adapter install, and validation utilities.
- `.mcp.json`: MCP server configuration placeholder.

## Skills

### use-fhevm

Primary routing skill for Zama FHEVM work. Use for confidential smart contracts, encrypted state, input proofs, ACL, user/public decryption, frontend integration, testing, deployment, ERC-7984, or selecting the right architecture.

### build-fhevm-contracts

Build or modify FHEVM Solidity contracts using encrypted types, proof validation, FHE operations, `FHE.allow`, `FHE.allowThis`, `FHE.allowTransient`, and secure decryption boundaries.

### integrate-fhevm-frontend

Build or fix FHEVM frontend integration with the Zama Relayer SDK, browser encryption, wallet connection, EIP-712 user decryption, public decryption, and deployed UI validation.

### test-fhevm-contracts

Write Hardhat tests for encrypted workflows, input proof handling, ACL permissions, user decryption, public decryption, and negative confidential-contract cases.

### deploy-fhevm-dapp

Deploy FHEVM dApps to localhost or Sepolia and publish generated frontends, with environment handling, deployment metadata, Vercel flow guidance, and browser validation.

### use-erc7984

Build ERC-7984 confidential tokens with encrypted balances, private transfers, wrapping/unwrapping, ERC-20 interoperability, OpenZeppelin Confidential Contracts, tests, and frontend flows.

### scaffold-fhevm-dapp

Generate a target FHEVM dApp from a recipe, including contracts, tests, deploy scripts, frontend snippets, and agent adapters for Codex, Claude Code, Cursor, Windsurf, Cline, and Copilot.

## Usage

Install the full skill payload into another repository:

```powershell
powershell -ExecutionPolicy Bypass -File .\scripts\install-agent-adapters.ps1 -TargetPath C:\path\to\your\dapp
```

or on macOS/Linux:

```bash
bash scripts/install-agent-adapters.sh /path/to/your/dapp
```

Scaffold a target app outside this repository:

```bash
node scripts/fhevm-agent-os.mjs list-recipes
node scripts/fhevm-agent-os.mjs scaffold confidential-voting ../my-confidential-voting-app
```

Generated dApps, `.env`, `.vercel`, and deployment artifacts belong in the target project, not in this plugin repository.

## Validation

```bash
npm install
npm run compile
npm test
npm run agent:smoke
npm run os:doctor
```

## Research Anchors

- [Zama Solidity quick start](https://docs.zama.org/protocol/solidity-guides/getting-started/quick-start-tutorial)
- [Zama supported encrypted types](https://docs.zama.org/protocol/solidity-guides/smart-contract/types)
- [Zama encrypted operations](https://docs.zama.org/protocol/solidity-guides/smart-contract/operations)
- [Zama encrypted inputs](https://docs.zama.org/protocol/solidity-guides/smart-contract/inputs)
- [Zama ACL guide](https://docs.zama.org/protocol/solidity-guides/smart-contract/acl)
- [Zama user decryption](https://docs.zama.org/protocol/relayer-sdk-guides/fhevm-relayer/decryption/user-decryption)
- [Zama public decryption](https://docs.zama.org/protocol/relayer-sdk-guides/fhevm-relayer/decryption/public-decryption)
- [OpenZeppelin Confidential Contracts](https://docs.openzeppelin.com/confidential-contracts)
