import { createInstance, SepoliaConfig, type FhevmInstance } from "@zama-fhe/relayer-sdk/node";
import type { Signer } from "ethers";

export async function createSepoliaFhevmInstance(rpcUrl: string): Promise<FhevmInstance> {
  return createInstance({
    ...SepoliaConfig,
    network: rpcUrl,
  });
}

export async function encryptUint64ForContract(
  instance: FhevmInstance,
  contractAddress: string,
  userAddress: string,
  value: bigint,
) {
  const input = instance.createEncryptedInput(contractAddress, userAddress);
  input.add64(value);
  const encrypted = await input.encrypt();

  return {
    handle: encrypted.handles[0],
    inputProof: encrypted.inputProof,
  };
}

export async function userDecryptHandle(
  instance: FhevmInstance,
  signer: Signer & { address: string },
  contractAddress: string,
  handle: string,
) {
  const keypair = instance.generateKeypair();
  const startTimeStamp = Math.floor(Date.now() / 1000).toString();
  const durationDays = "10";
  const contractAddresses = [contractAddress];
  const eip712 = instance.createEIP712(keypair.publicKey, contractAddresses, startTimeStamp, durationDays);

  const signature = await signer.signTypedData(
    eip712.domain,
    { UserDecryptRequestVerification: eip712.types.UserDecryptRequestVerification },
    eip712.message,
  );

  return instance.userDecrypt(
    [{ handle, contractAddress }],
    keypair.privateKey,
    keypair.publicKey,
    signature.replace("0x", ""),
    contractAddresses,
    signer.address,
    startTimeStamp,
    durationDays,
  );
}
