#!/usr/bin/env node
import { spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

function loadEnvFile(file) {
  const fullPath = path.join(root, file);
  if (!fs.existsSync(fullPath)) return;

  const lines = fs.readFileSync(fullPath, "utf8").split(/\r?\n/);
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    let value = trimmed.slice(eq + 1).trim();
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    }
    if (!(key in process.env)) process.env[key] = value;
  }
}

function required(name) {
  const value = process.env[name];
  if (!value) throw new Error(`Missing required environment variable: ${name}`);
  return value;
}

function run(command, args, options = {}) {
  const printableArgs = args.map((arg, index) => {
    if (args[index - 1] === "--token") return "[redacted]";
    if (/token/i.test(arg) && arg.includes("=")) return arg.replace(/=.*/, "=[redacted]");
    return arg;
  });
  console.log(`\n> ${command} ${printableArgs.map((arg) => (arg.includes(" ") ? `"${arg}"` : arg)).join(" ")}`);
  const result = spawnSync(command, args, {
    cwd: options.cwd ?? root,
    env: options.env ?? process.env,
    encoding: "utf8",
    shell: process.platform === "win32",
    stdio: options.capture ? ["ignore", "pipe", "pipe"] : "inherit",
  });

  if (options.capture) {
    if (result.stdout) process.stdout.write(result.stdout);
    if (result.stderr) process.stderr.write(result.stderr);
  }

  if (result.status !== 0) {
    throw new Error(`${command} ${printableArgs.join(" ")} failed with exit code ${result.status}`);
  }

  return result.stdout ?? "";
}

function runWithRetry(command, args, options = {}) {
  const attempts = options.attempts ?? 3;
  let lastError;

  for (let attempt = 1; attempt <= attempts; attempt++) {
    try {
      if (attempt > 1) console.log(`Retry ${attempt}/${attempts}...`);
      return run(command, args, options);
    } catch (error) {
      lastError = error;
      if (attempt === attempts) break;
      const waitMs = options.waitMs ?? 5000;
      console.log(`Attempt ${attempt}/${attempts} failed. Waiting ${waitMs / 1000}s before retry.`);
      Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, waitMs);
    }
  }

  throw lastError;
}

function parseDeploymentUrl(output) {
  const urls = output
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => /^https:\/\/[^\s]+$/.test(line));
  return urls.at(-1);
}

loadEnvFile(".env");
loadEnvFile(".env.local");

const network = process.env.CONTRACT_NETWORK || "sepolia";
const prod = String(process.env.DEPLOY_FRONTEND_PROD || "false").toLowerCase() === "true";

required("MNEMONIC");
required("INFURA_API_KEY");
required("VERCEL_TOKEN");

run("npm", ["run", "compile"]);
run("npm", ["test"]);
runWithRetry("npx", ["hardhat", "run", "scripts/deploy-confidential-voting.ts", "--network", network], {
  attempts: 3,
  waitMs: 8000,
});

const deploymentPath = path.join(root, "deployments", network, "confidential-voting.json");
if (!fs.existsSync(deploymentPath)) {
  throw new Error(`Missing deployment artifact: ${deploymentPath}`);
}

const frontendDir = path.join(root, "frontend", "confidential-voting-app");

const vercelArgs = ["vercel", "deploy", "--yes", "--token", process.env.VERCEL_TOKEN];
if (prod) vercelArgs.push("--prod");

const output = run("npx", vercelArgs, { cwd: frontendDir, capture: true });
const url = parseDeploymentUrl(output);

if (!url) {
  throw new Error("Vercel deploy completed but no deployment URL was detected in output.");
}

const frontendDeployment = {
  app: "confidential-voting",
  network,
  production: prod,
  url,
  contractDeployment: JSON.parse(fs.readFileSync(deploymentPath, "utf8")),
  deployedAt: new Date().toISOString(),
};

const outDir = path.join(root, "deployments", network);
fs.mkdirSync(outDir, { recursive: true });
fs.writeFileSync(path.join(outDir, "confidential-voting-frontend.json"), `${JSON.stringify(frontendDeployment, null, 2)}\n`);

console.log("\nFHEVM Agent OS demo deployment complete.");
console.log(`Contract: ${frontendDeployment.contractDeployment.address}`);
console.log(`Frontend: ${url}`);
