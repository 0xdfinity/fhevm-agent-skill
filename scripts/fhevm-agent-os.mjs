#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

const recipes = {
  "confidential-voting": {
    title: "Confidential Voting",
    source: "assets/examples/confidential-voting",
    prompt: "Build a confidential voting dApp",
    contract: "ConfidentialVoting",
  },
  "encrypted-erc7984": {
    title: "ERC-7984 Confidential Token",
    source: "assets/examples/encrypted-erc7984",
    prompt: "Build an ERC-7984 confidential token",
    contract: "ConfidentialToken",
  },
  "confidential-payroll": {
    title: "Confidential Payroll",
    source: "assets/examples/confidential-payroll",
    prompt: "Build confidential payroll",
    contract: "ConfidentialPayroll",
  },
  "sealed-bid-auction": {
    title: "Sealed-Bid Auction",
    source: "assets/examples/sealed-bid-auction",
    prompt: "Build a sealed-bid auction",
    contract: "SealedBidAuction",
  },
  "confidential-dao": {
    title: "Confidential DAO Voting",
    source: "assets/examples/confidential-dao",
    prompt: "Build private DAO voting",
    contract: "ConfidentialDAO",
  },
  "confidential-marketplace": {
    title: "Confidential Marketplace",
    source: "assets/examples/confidential-marketplace",
    prompt: "Build a confidential marketplace",
    contract: "ConfidentialMarketplace",
  },
};

const excludedPayloadDirs = new Set([
  ".env",
  ".env.local",
  ".vercel",
  "deployments",
  "node_modules",
  "artifacts",
  "cache",
  "types",
  "fhevmTemp",
  ".git",
]);

function rel(...parts) {
  return path.join(root, ...parts);
}

function usage(exitCode = 0) {
  console.log(`FHEVM Agent OS

Usage:
  node scripts/fhevm-agent-os.mjs doctor
  node scripts/fhevm-agent-os.mjs list-recipes
  node scripts/fhevm-agent-os.mjs install-adapters <target> [--force]
  node scripts/fhevm-agent-os.mjs scaffold <recipe> <target> [--force]

Recipes:
  ${Object.keys(recipes).join("\n  ")}
`);
  process.exit(exitCode);
}

function ensureDir(dir) {
  fs.mkdirSync(dir, { recursive: true });
}

function exists(relativePath) {
  return fs.existsSync(rel(relativePath));
}

function copyTree(source, destination, options = {}) {
  ensureDir(destination);
  for (const entry of fs.readdirSync(source, { withFileTypes: true })) {
    if (options.exclude?.has(entry.name)) continue;
    if (entry.name.startsWith(".env") && entry.name !== ".env.example") continue;
    const sourcePath = path.join(source, entry.name);
    const destinationPath = path.join(destination, entry.name);
    if (entry.isDirectory()) {
      copyTree(sourcePath, destinationPath, options);
    } else {
      ensureDir(path.dirname(destinationPath));
      fs.copyFileSync(sourcePath, destinationPath);
    }
  }
}

function writeFile(targetRoot, relativePath, content, force = false) {
  const filePath = path.join(targetRoot, relativePath);
  ensureDir(path.dirname(filePath));
  if (fs.existsSync(filePath) && !force) {
    const sidecar = `${filePath}.fhevm-agent-skill`;
    fs.writeFileSync(sidecar, content);
    return { path: sidecar, sidecar: true };
  }
  fs.writeFileSync(filePath, content);
  return { path: filePath, sidecar: false };
}

function doctor() {
  const required = [
    "skills/use-fhevm/SKILL.md",
    "skills/build-fhevm-contracts/SKILL.md",
    "skills/integrate-fhevm-frontend/SKILL.md",
    "skills/test-fhevm-contracts/SKILL.md",
    "skills/deploy-fhevm-dapp/SKILL.md",
    "skills/use-erc7984/SKILL.md",
    "skills/scaffold-fhevm-dapp/SKILL.md",
    "AGENTS.md",
    "CLAUDE.md",
    "fhevm-agent-skill.manifest.json",
    ".codex-plugin/plugin.json",
    ".claude-plugin/plugin.json",
    ".cursor-plugin/plugin.json",
    ".mcp.json",
    ".env.example",
    "scripts/deploy-confidential-voting.ts",
    ".cursor/rules/fhevm-agent-skill.mdc",
    ".windsurf/rules/fhevm-agent-skill.md",
    ".clinerules/fhevm-agent-skill.md",
    ".github/copilot-instructions.md",
  ];

  const failures = [];
  for (const file of required) {
    if (!exists(file)) failures.push(`missing ${file}`);
  }
  for (const [recipe, info] of Object.entries(recipes)) {
    for (const child of ["contracts", "test", "deploy", "frontend"]) {
      if (!exists(path.join(info.source, child))) failures.push(`missing ${recipe}/${child}`);
    }
  }

  if (failures.length) {
    console.error("FHEVM Agent OS doctor failed:");
    for (const failure of failures) console.error(`- ${failure}`);
    process.exit(1);
  }

  console.log("FHEVM Agent OS doctor passed.");
  console.log(`Recipes: ${Object.keys(recipes).length}`);
  console.log("Adapters: AGENTS.md, CLAUDE.md, Cursor, Windsurf, Cline, Copilot, plugin metadata");
}

function listRecipes() {
  for (const [id, info] of Object.entries(recipes)) {
    console.log(`${id}`);
    console.log(`  ${info.title}`);
    console.log(`  Trigger prompt: "${info.prompt}"`);
    console.log(`  Source: ${info.source}`);
  }
}

function installAdapters(targetRoot, force = false) {
  ensureDir(targetRoot);
  const payloadTarget = path.join(targetRoot, ".agent-skills", "fhevm-agent-skill");
  copyTree(root, payloadTarget, { exclude: excludedPayloadDirs });

  const writes = [
    writeFile(
      targetRoot,
      "AGENTS.md",
      `# AGENTS.md

Use the installed FHEVM Agent Skill for any Zama FHEVM confidential app work.

Read \`.agent-skills/fhevm-agent-skill/skills/use-fhevm/SKILL.md\` before coding, then route to the relevant \`.agent-skills/fhevm-agent-skill/skills/*/SKILL.md\` file.
`,
      force,
    ),
    writeFile(
      targetRoot,
      "CLAUDE.md",
      `# Claude Code Memory

Use @./.agent-skills/fhevm-agent-skill/skills/use-fhevm/SKILL.md for Zama FHEVM work. Route to the relevant skill under @./.agent-skills/fhevm-agent-skill/skills/.
`,
      force,
    ),
    writeFile(
      targetRoot,
      ".cursor/rules/fhevm-agent-skill.mdc",
      `---
description: Use the installed FHEVM Agent Skill for Zama FHEVM confidential app development, ERC-7984, input proofs, ACL, decryption, tests, and frontend integration.
alwaysApply: true
---

Read \`.agent-skills/fhevm-agent-skill/skills/use-fhevm/SKILL.md\` before FHEVM work. Route to the relevant installed skill.
`,
      force,
    ),
    writeFile(
      targetRoot,
      ".windsurf/rules/fhevm-agent-skill.md",
      `---
trigger: model_decision
description: Use for Zama FHEVM confidential app development, ERC-7984, fhevmjs, ACL, proofs, decryption, tests, and deployment.
---

Read \`.agent-skills/fhevm-agent-skill/skills/use-fhevm/SKILL.md\` before FHEVM work. Route to the relevant installed skill.
`,
      force,
    ),
    writeFile(
      targetRoot,
      ".clinerules/fhevm-agent-skill.md",
      `# FHEVM Agent Skill

For Zama FHEVM work, read \`.agent-skills/fhevm-agent-skill/skills/use-fhevm/SKILL.md\`, then route to the relevant skill under \`.agent-skills/fhevm-agent-skill/skills/\`.
`,
      force,
    ),
    writeFile(
      targetRoot,
      ".github/copilot-instructions.md",
      `# FHEVM Agent Skill

For Zama FHEVM confidential app work, follow \`.agent-skills/fhevm-agent-skill/skills/use-fhevm/SKILL.md\` and the relevant skill under \`.agent-skills/fhevm-agent-skill/skills/\`.
`,
      force,
    ),
  ];

  console.log(`Installed payload: ${payloadTarget}`);
  for (const write of writes) {
    console.log(`${write.sidecar ? "Wrote sidecar" : "Installed"}: ${write.path}`);
  }
}

function scaffold(recipeId, targetRoot, force = false) {
  const recipe = recipes[recipeId];
  if (!recipe) {
    console.error(`Unknown recipe: ${recipeId}`);
    listRecipes();
    process.exit(1);
  }

  if (fs.existsSync(targetRoot) && fs.readdirSync(targetRoot).length > 0 && !force) {
    console.error(`Target is not empty: ${targetRoot}`);
    console.error("Use --force to write into a non-empty target.");
    process.exit(1);
  }

  ensureDir(targetRoot);
  const sourceRoot = rel(recipe.source);

  const packageJson = JSON.parse(fs.readFileSync(rel("package.json"), "utf8"));
  packageJson.name = `fhevm-${recipeId}-app`;
  packageJson.scripts = {
    compile: "cross-env TS_NODE_TRANSPILE_ONLY=true hardhat compile",
    test: "cross-env TS_NODE_TRANSPILE_ONLY=true hardhat test",
    "agent:doctor": "node .agent-skills/fhevm-agent-skill/scripts/fhevm-agent-os.mjs doctor",
  };
  delete packageJson.private;

  fs.writeFileSync(path.join(targetRoot, "package.json"), `${JSON.stringify(packageJson, null, 2)}\n`);
  fs.copyFileSync(rel("tsconfig.json"), path.join(targetRoot, "tsconfig.json"));
  fs.copyFileSync(rel(".gitignore"), path.join(targetRoot, ".gitignore"));

  fs.writeFileSync(
    path.join(targetRoot, "hardhat.config.ts"),
    `import "@fhevm/hardhat-plugin";
import "@nomicfoundation/hardhat-chai-matchers";
import "@nomicfoundation/hardhat-ethers";
import "@typechain/hardhat";
import "hardhat-deploy";

import type { HardhatUserConfig } from "hardhat/config";

const SEPOLIA_MNEMONIC = process.env.MNEMONIC;
const INFURA_API_KEY = process.env.INFURA_API_KEY ?? "zzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzz";

const config: HardhatUserConfig = {
  defaultNetwork: "hardhat",
  namedAccounts: { deployer: 0 },
  networks: {
    hardhat: { chainId: 31337 },
    localhost: { url: "http://127.0.0.1:8545", chainId: 31337 },
    sepolia: {
      accounts: SEPOLIA_MNEMONIC
        ? { mnemonic: SEPOLIA_MNEMONIC, path: "m/44'/60'/0'/0/", count: 10 }
        : [],
      chainId: 11155111,
      url: \`https://sepolia.infura.io/v3/\${INFURA_API_KEY}\`,
    },
  },
  paths: {
    artifacts: "./artifacts",
    cache: "./cache",
    sources: "./contracts",
    tests: "./test",
  },
  solidity: {
    version: "0.8.27",
    settings: {
      metadata: { bytecodeHash: "none" },
      optimizer: { enabled: true, runs: 800 },
      evmVersion: "cancun",
    },
  },
  typechain: { outDir: "types", target: "ethers-v6" },
};

export default config;
`,
  );

  copyTree(path.join(sourceRoot, "contracts"), path.join(targetRoot, "contracts"));
  copyTree(path.join(sourceRoot, "test"), path.join(targetRoot, "test"));
  copyTree(path.join(sourceRoot, "deploy"), path.join(targetRoot, "deploy"));
  copyTree(path.join(sourceRoot, "frontend"), path.join(targetRoot, "frontend"));
  fs.writeFileSync(
    path.join(targetRoot, "README.md"),
    `# ${recipe.title}

Generated from the FHEVM skills package.

## Agent Boot

Read \`.agent-skills/fhevm-agent-skill/skills/use-fhevm/SKILL.md\`, then route to the specific skill for contract, frontend, test, deployment, or ERC-7984 work.

## Validate

\`\`\`bash
npm install
npm run compile
npm test
\`\`\`
`,
  );

  installAdapters(targetRoot, true);

  fs.writeFileSync(
    path.join(targetRoot, "FHEVM_AGENT_BOOT.md"),
    `# FHEVM Agent Boot

Recipe: ${recipe.title}
Trigger prompt: "${recipe.prompt}"
Primary contract: ${recipe.contract}

Agent startup:

1. Read \`.agent-skills/fhevm-agent-skill/skills/use-fhevm/SKILL.md\`.
2. Read this generated app's \`README.md\`.
3. Compile with \`npm run compile\`.
4. Test with \`npm test\`.

Developer prompt:

\`\`\`text
Use the FHEVM Agent Skill. Extend this ${recipe.title} app with production-ready contracts, tests, deployment, and frontend integration. Follow all ACL, input proof, user decryption, and public decryption rules.
\`\`\`
`,
  );

  console.log(`Scaffolded ${recipe.title} at ${targetRoot}`);
  console.log("Next:");
  console.log("  npm install");
  console.log("  npm run compile");
  console.log("  npm test");
}

const [command, first, second, ...rest] = process.argv.slice(2);
const force = rest.includes("--force") || process.argv.includes("--force");

if (!command || command === "help" || command === "--help") usage();
if (command === "doctor") doctor();
else if (command === "list-recipes") listRecipes();
else if (command === "install-adapters") {
  if (!first) usage(1);
  installAdapters(path.resolve(first), force);
} else if (command === "scaffold") {
  if (!first || !second) usage(1);
  scaffold(first, path.resolve(second), force);
} else {
  usage(1);
}
