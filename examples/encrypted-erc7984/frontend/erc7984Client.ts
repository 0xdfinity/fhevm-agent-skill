import { createInstance, SepoliaConfig } from "@zama-fhe/relayer-sdk/node";
import type { Contract } from "ethers";

export async function encryptTransferAmount(contractAddress: string, senderAddress: string, amount: bigint) {
  const instance = await createInstance({
    ...SepoliaConfig,
    network: "https://ethereum-sepolia-rpc.publicnode.com",
  });

  const input = instance.createEncryptedInput(contractAddress, senderAddress);
  input.add64(amount);
  const encrypted = await input.encrypt();

  return {
    encryptedAmount: encrypted.handles[0],
    inputProof: encrypted.inputProof,
  };
}

export async function confidentialTransfer(
  token: Contract,
  tokenAddress: string,
  senderAddress: string,
  recipient: string,
  amount: bigint,
) {
  const encrypted = await encryptTransferAmount(tokenAddress, senderAddress, amount);
  return token["confidentialTransfer(address,bytes32,bytes)"](
    recipient,
    encrypted.encryptedAmount,
    encrypted.inputProof,
  );
}

export async function requestUnwrap(wrapper: Contract, wrapperAddress: string, holder: string, to: string, amount: bigint) {
  const encrypted = await encryptTransferAmount(wrapperAddress, holder, amount);
  return wrapper["unwrap(address,address,bytes32,bytes)"](holder, to, encrypted.encryptedAmount, encrypted.inputProof);
}

export async function finalizeUnwrap(wrapper: Contract, unwrapRequestId: string) {
  const instance = await createInstance({
    ...SepoliaConfig,
    network: "https://ethereum-sepolia-rpc.publicnode.com",
  });
  const results = await instance.publicDecrypt([unwrapRequestId]);
  const clearAmount = results.clearValues[unwrapRequestId];

  return wrapper.finalizeUnwrap(unwrapRequestId, clearAmount, results.decryptionProof);
}
