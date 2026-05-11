import fs from "fs";
import path from "path";
import { artifacts, ethers, network } from "hardhat";

async function main() {
  const [deployer] = await ethers.getSigners();
  const candidateCount = Number(process.env.CONFIDENTIAL_VOTING_CANDIDATE_COUNT ?? "3");

  if (!Number.isInteger(candidateCount) || candidateCount < 2 || candidateCount > 255) {
    throw new Error("CONFIDENTIAL_VOTING_CANDIDATE_COUNT must be an integer from 2 to 255");
  }

  const factory = await ethers.getContractFactory("ConfidentialVoting");
  const contract = await factory.deploy(deployer.address, candidateCount);
  await contract.waitForDeployment();

  const address = await contract.getAddress();
  const chain = await ethers.provider.getNetwork();
  const artifact = await artifacts.readArtifact("ConfidentialVoting");

  const deployment = {
    app: "confidential-voting",
    contractName: "ConfidentialVoting",
    address,
    owner: deployer.address,
    candidateCount,
    network: network.name,
    chainId: Number(chain.chainId),
    abi: artifact.abi,
    deployedAt: new Date().toISOString(),
  };

  const root = process.cwd();
  const deploymentDir = path.join(root, "deployments", network.name);
  fs.mkdirSync(deploymentDir, { recursive: true });
  fs.writeFileSync(path.join(deploymentDir, "confidential-voting.json"), `${JSON.stringify(deployment, null, 2)}\n`);

  console.log(`ConfidentialVoting deployed to ${network.name}`);
  console.log(`Address: ${address}`);
  console.log(`Owner: ${deployer.address}`);
  console.log(`Deployment config: ${path.join(deploymentDir, "confidential-voting.json")}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
