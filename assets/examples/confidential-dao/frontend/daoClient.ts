import { createInstance, SepoliaConfig } from "@zama-fhe/relayer-sdk/node";
import type { Contract } from "ethers";

export async function encryptDaoVote(daoAddress: string, voterAddress: string, support: boolean, weight: bigint) {
  const instance = await createInstance({
    ...SepoliaConfig,
    network: "https://ethereum-sepolia-rpc.publicnode.com",
  });

  const input = instance.createEncryptedInput(daoAddress, voterAddress);
  input.addBool(support);
  input.add64(weight);
  const encrypted = await input.encrypt();

  return {
    encryptedSupport: encrypted.handles[0],
    encryptedWeight: encrypted.handles[1],
    inputProof: encrypted.inputProof,
  };
}

export async function castPrivateDaoVote(
  dao: Contract,
  daoAddress: string,
  voterAddress: string,
  proposalId: bigint,
  support: boolean,
  weight: bigint,
) {
  const encrypted = await encryptDaoVote(daoAddress, voterAddress, support, weight);
  return dao.castVote(proposalId, encrypted.encryptedSupport, encrypted.encryptedWeight, encrypted.inputProof);
}

export async function readRevealedDaoTotals(dao: Contract, proposalId: bigint) {
  const instance = await createInstance({
    ...SepoliaConfig,
    network: "https://ethereum-sepolia-rpc.publicnode.com",
  });

  const [yesHandle, noHandle] = await dao.voteTotalHandles(proposalId);
  const result = await instance.publicDecrypt([yesHandle, noHandle]);

  return {
    yes: result.clearValues[yesHandle],
    no: result.clearValues[noHandle],
    proof: result.decryptionProof,
  };
}
