#!/usr/bin/env node
import { spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

function loadEnvFile(file) {
  const fullPath = path.join(root, file);
  if (!fs.existsSync(fullPath)) return;
  for (const line of fs.readFileSync(fullPath, "utf8").split(/\r?\n/)) {
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
  if (!process.env[name]) throw new Error(`Missing required environment variable: ${name}`);
  return process.env[name];
}

function parseDeploymentUrl(output) {
  return output
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => /^https:\/\/[^\s]+$/.test(line))
    .at(-1);
}

function readVercelProjectName(frontendDir) {
  const projectPath = path.join(frontendDir, ".vercel", "project.json");
  if (!fs.existsSync(projectPath)) return undefined;

  try {
    return JSON.parse(fs.readFileSync(projectPath, "utf8")).projectName;
  } catch {
    return undefined;
  }
}

async function resolvePublicFrontendUrl({ frontendDir, production, deploymentUrl }) {
  if (!production) return deploymentUrl;

  const projectName = readVercelProjectName(frontendDir);
  if (!projectName) return deploymentUrl;

  const candidate = `https://${projectName}.vercel.app`;
  try {
    const response = await fetch(candidate, { method: "HEAD", redirect: "follow" });
    return response.ok ? candidate : deploymentUrl;
  } catch {
    return deploymentUrl;
  }
}

loadEnvFile(".env");
loadEnvFile(".env.local");

required("VERCEL_TOKEN");

const network = process.env.CONTRACT_NETWORK || "sepolia";
const prod = String(process.env.DEPLOY_FRONTEND_PROD || "false").toLowerCase() === "true";
const frontendDir = path.join(root, "frontend", "confidential-voting-app");
const deploymentPath = path.join(root, "deployments", network, "confidential-voting.json");

if (!fs.existsSync(deploymentPath)) {
  throw new Error(`Missing contract deployment artifact: ${deploymentPath}`);
}

const args = ["vercel", "deploy", "--yes", "--token", process.env.VERCEL_TOKEN];
if (prod) args.push("--prod");

console.log(`\n> npx vercel deploy --yes --token [redacted]${prod ? " --prod" : ""}`);
const result = spawnSync("npx", args, {
  cwd: frontendDir,
  env: process.env,
  encoding: "utf8",
  shell: process.platform === "win32",
  stdio: ["ignore", "pipe", "pipe"],
});

if (result.stdout) process.stdout.write(result.stdout);
if (result.stderr) process.stderr.write(result.stderr);

if (result.status !== 0) {
  throw new Error(`npx vercel deploy --yes --token [redacted]${prod ? " --prod" : ""} failed`);
}

const url = parseDeploymentUrl(result.stdout ?? "");
if (!url) throw new Error("Vercel deploy completed but no deployment URL was detected.");
const publicUrl = await resolvePublicFrontendUrl({ frontendDir, production: prod, deploymentUrl: url });

const frontendDeployment = {
  app: "confidential-voting",
  network,
  production: prod,
  url: publicUrl,
  deploymentUrl: url,
  contractDeployment: JSON.parse(fs.readFileSync(deploymentPath, "utf8")),
  deployedAt: new Date().toISOString(),
};

const outDir = path.join(root, "deployments", network);
fs.mkdirSync(outDir, { recursive: true });
fs.writeFileSync(path.join(outDir, "confidential-voting-frontend.json"), `${JSON.stringify(frontendDeployment, null, 2)}\n`);

console.log("\nFHEVM voting frontend deployment complete.");
console.log(`Frontend: ${publicUrl}`);
if (publicUrl !== url) console.log(`Vercel deployment: ${url}`);
