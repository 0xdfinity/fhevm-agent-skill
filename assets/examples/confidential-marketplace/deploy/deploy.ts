import { DeployFunction } from "hardhat-deploy/types";
import { HardhatRuntimeEnvironment } from "hardhat/types";

const deploy: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deployer } = await hre.getNamedAccounts();
  const deployment = await hre.deployments.deploy("ConfidentialMarketplace", {
    from: deployer,
    log: true,
  });

  console.log(`ConfidentialMarketplace deployed at ${deployment.address}`);
};

export default deploy;
deploy.id = "deploy_confidential_marketplace";
deploy.tags = ["ConfidentialMarketplace"];
