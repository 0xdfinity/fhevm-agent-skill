import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

const requiredFiles = [
  "SKILL.md",
  "AGENTS.md",
  "CLAUDE.md",
  "agent-rules.md",
  "anti-patterns.md",
  "architecture-patterns.md",
  "decision-frameworks.md",
  "frontend-integration.md",
  "deployment-guide.md",
  "testing-guide.md",
  "prompt-recipes.md",
  "troubleshooting.md",
  "fhevm-agent-skill.manifest.json",
  ".cursor/rules/fhevm-agent-skill.mdc",
  ".windsurf/rules/fhevm-agent-skill.md",
  ".clinerules/fhevm-agent-skill.md",
  ".github/copilot-instructions.md",
  ".env.example",
  "scripts/deploy-confidential-voting.ts",
  "scripts/deploy-full-demo.mjs",
  "scripts/deploy-voting-frontend.mjs",
  "frontend/confidential-voting-app/index.html",
  "frontend/confidential-voting-app/app.js",
  "frontend/confidential-voting-app/deployment.json",
];

const exampleDirs = [
  "examples/confidential-voting",
  "examples/encrypted-erc7984",
  "examples/confidential-payroll",
  "examples/sealed-bid-auction",
  "examples/confidential-dao",
  "examples/confidential-marketplace",
];

const templateFiles = [
  "templates/starter-contract.sol",
  "templates/confidential-token.sol",
  "templates/deployment-script.ts",
  "templates/fhevm-client.ts",
  "templates/frontend-hooks.ts",
  "templates/test-template.ts",
  "templates/access-control-template.sol",
];

const failures = [];

function exists(relativePath) {
  return fs.existsSync(path.join(root, relativePath));
}

for (const file of requiredFiles) {
  if (!exists(file)) failures.push(`missing required file: ${file}`);
}

for (const dir of exampleDirs) {
  for (const child of ["README.md", "contracts", "test", "deploy", "frontend"]) {
    if (!exists(path.join(dir, child))) failures.push(`missing example component: ${dir}/${child}`);
  }
}

for (const file of templateFiles) {
  if (!exists(file)) failures.push(`missing template: ${file}`);
}

const skill = fs.readFileSync(path.join(root, "SKILL.md"), "utf8");
if (!skill.startsWith("---\n")) failures.push("SKILL.md must start with YAML frontmatter");
if (!/^name:\s*fhevm-agent-skill/m.test(skill)) failures.push("SKILL.md frontmatter must include name");
if (!/^description:\s+/m.test(skill)) failures.push("SKILL.md frontmatter must include description");

const staticVotingIndex = fs.readFileSync(path.join(root, "frontend/confidential-voting-app/index.html"), "utf8");
const staticVotingApp = fs.readFileSync(path.join(root, "frontend/confidential-voting-app/app.js"), "utf8");
if (!staticVotingIndex.includes("relayer-sdk-js/0.4.1/relayer-sdk-js.umd.cjs")) {
  failures.push("confidential voting frontend must load the Zama Relayer SDK browser bundle");
}
if (staticVotingApp.includes('from "https://cdn.zama.org/relayer-sdk-js')) {
  failures.push("confidential voting frontend must not named-import the Zama UMD/CJS browser bundle");
}
if (!staticVotingApp.includes("globalThis.relayerSDK")) {
  failures.push("confidential voting frontend must read the Zama SDK from globalThis.relayerSDK");
}

const manifest = JSON.parse(fs.readFileSync(path.join(root, "fhevm-agent-skill.manifest.json"), "utf8"));
for (const adapter of Object.values(manifest.agentAdapters)) {
  if (!exists(adapter)) failures.push(`manifest adapter path does not exist: ${adapter}`);
}

if (failures.length > 0) {
  console.error("FHEVM Agent Skill smoke test failed:");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log("FHEVM Agent Skill smoke test passed.");
console.log(`Adapters: ${Object.keys(manifest.agentAdapters).join(", ")}`);
console.log(`Examples: ${exampleDirs.length}`);
