import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

const requiredFiles = [
  "AGENTS.md",
  "CLAUDE.md",
  "README.md",
  ".mcp.json",
  ".codex-plugin/plugin.json",
  ".claude-plugin/plugin.json",
  ".cursor-plugin/plugin.json",
  "assets/logo.svg",
  "assets/logo-square.svg",
  "fhevm-agent-skill.manifest.json",
  ".cursor/rules/fhevm-agent-skill.mdc",
  ".windsurf/rules/fhevm-agent-skill.md",
  ".clinerules/fhevm-agent-skill.md",
  ".github/copilot-instructions.md",
  ".env.example",
  "scripts/deploy-confidential-voting.ts",
];

const skillDirs = [
  "skills/use-fhevm",
  "skills/build-fhevm-contracts",
  "skills/integrate-fhevm-frontend",
  "skills/test-fhevm-contracts",
  "skills/deploy-fhevm-dapp",
  "skills/use-erc7984",
  "skills/scaffold-fhevm-dapp",
];

const exampleDirs = [
  "assets/examples/confidential-voting",
  "assets/examples/encrypted-erc7984",
  "assets/examples/confidential-payroll",
  "assets/examples/sealed-bid-auction",
  "assets/examples/confidential-dao",
  "assets/examples/confidential-marketplace",
];

const templateFiles = [
  "assets/templates/starter-contract.sol",
  "assets/templates/confidential-token.sol",
  "assets/templates/deployment-script.ts",
  "assets/templates/fhevm-client.ts",
  "assets/templates/frontend-hooks.ts",
  "assets/templates/test-template.ts",
  "assets/templates/access-control-template.sol",
];

const failures = [];

function exists(relativePath) {
  return fs.existsSync(path.join(root, relativePath));
}

for (const file of requiredFiles) {
  if (!exists(file)) failures.push(`missing required file: ${file}`);
}

for (const dir of skillDirs) {
  const skillPath = path.join(dir, "SKILL.md");
  if (!exists(skillPath)) failures.push(`missing skill entrypoint: ${skillPath}`);
}

for (const dir of exampleDirs) {
  for (const child of ["contracts", "test", "deploy", "frontend"]) {
    if (!exists(path.join(dir, child))) failures.push(`missing example component: ${dir}/${child}`);
  }
}

for (const file of templateFiles) {
  if (!exists(file)) failures.push(`missing template: ${file}`);
}

for (const dir of skillDirs) {
  const skill = fs.readFileSync(path.join(root, dir, "SKILL.md"), "utf8");
  if (!/^---\r?\n/.test(skill)) failures.push(`${dir}/SKILL.md must start with YAML frontmatter`);
  if (!/^name:\s+/m.test(skill)) failures.push(`${dir}/SKILL.md frontmatter must include name`);
  if (!/^description:\s+/m.test(skill)) failures.push(`${dir}/SKILL.md frontmatter must include description`);
}

const manifest = JSON.parse(fs.readFileSync(path.join(root, "fhevm-agent-skill.manifest.json"), "utf8"));
for (const skillDir of manifest.skills) {
  if (!exists(path.join(skillDir, "SKILL.md"))) failures.push(`manifest skill path does not exist: ${skillDir}`);
}
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
console.log(`Skills: ${skillDirs.length}`);
console.log(`Examples: ${exampleDirs.length}`);
