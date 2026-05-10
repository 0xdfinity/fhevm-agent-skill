import { DeployFunction } from "hardhat-deploy/types";
import { HardhatRuntimeEnvironment } from "hardhat/types";

const deploy: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deployer } = await hre.getNamedAccounts();
  const { deploy } = hre.deployments;

  const deployment = await deploy("StarterConfidentialContract", {
    from: deployer,
    log: true,
  });

  console.log(`StarterConfidentialContract deployed at ${deployment.address}`);
};

export default deploy;
deploy.id = "deploy_starter_confidential_contract";
deploy.tags = ["StarterConfidentialContract"];
