import { DeployFunction } from "hardhat-deploy/types";
import { HardhatRuntimeEnvironment } from "hardhat/types";

const deploy: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deployer } = await hre.getNamedAccounts();
  const deployment = await hre.deployments.deploy("SealedBidAuction", {
    from: deployer,
    args: [deployer],
    log: true,
  });

  console.log(`SealedBidAuction deployed at ${deployment.address}`);
};

export default deploy;
deploy.id = "deploy_sealed_bid_auction";
deploy.tags = ["SealedBidAuction"];
