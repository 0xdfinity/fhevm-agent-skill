import { DeployFunction } from "hardhat-deploy/types";
import { HardhatRuntimeEnvironment } from "hardhat/types";

const deploy: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deployer } = await hre.getNamedAccounts();
  const deployment = await hre.deployments.deploy("ConfidentialVoting", {
    from: deployer,
    args: [deployer, 3],
    log: true,
  });

  console.log(`ConfidentialVoting deployed at ${deployment.address}`);
};

export default deploy;
deploy.id = "deploy_confidential_voting";
deploy.tags = ["ConfidentialVoting"];
