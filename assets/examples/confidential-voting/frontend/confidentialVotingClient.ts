import { createInstance, SepoliaConfig } from "@zama-fhe/relayer-sdk/node";
import type { Contract } from "ethers";

export async function createVotingInput(contractAddress: string, voterAddress: string, choice: number) {
  const instance = await createInstance({
    ...SepoliaConfig,
    network: "https://ethereum-sepolia-rpc.publicnode.com",
  });

  const input = instance.createEncryptedInput(contractAddress, voterAddress);
  input.add8(choice);
  const encrypted = await input.encrypt();

  return {
    encryptedChoice: encrypted.handles[0],
    inputProof: encrypted.inputProof,
  };
}

export async function castEncryptedVote(
  voting: Contract,
  contractAddress: string,
  voterAddress: string,
  choice: number,
) {
  const encrypted = await createVotingInput(contractAddress, voterAddress, choice);
  return voting.castVote(encrypted.encryptedChoice, encrypted.inputProof);
}

export async function readPublicTallies(contract: Contract, candidateCount: number) {
  const instance = await createInstance({
    ...SepoliaConfig,
    network: "https://ethereum-sepolia-rpc.publicnode.com",
  });

  const handles: string[] = [];
  for (let i = 0; i < candidateCount; i++) {
    handles.push(await contract.tallyHandle(i));
  }

  return instance.publicDecrypt(handles);
}
