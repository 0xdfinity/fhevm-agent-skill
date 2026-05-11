import { createInstance, SepoliaConfig } from "@zama-fhe/relayer-sdk/node";
import type { Contract, Signer } from "ethers";

export async function encryptSalary(payrollAddress: string, payrollAdmin: string, amount: bigint) {
  const instance = await createInstance({
    ...SepoliaConfig,
    network: "https://ethereum-sepolia-rpc.publicnode.com",
  });

  const input = instance.createEncryptedInput(payrollAddress, payrollAdmin);
  input.add64(amount);
  const encrypted = await input.encrypt();

  return {
    encryptedSalary: encrypted.handles[0],
    inputProof: encrypted.inputProof,
  };
}

export async function setEmployeeSalary(
  payroll: Contract,
  payrollAddress: string,
  adminAddress: string,
  employee: string,
  amount: bigint,
) {
  const encrypted = await encryptSalary(payrollAddress, adminAddress, amount);
  return payroll.setSalary(employee, encrypted.encryptedSalary, encrypted.inputProof);
}

export async function decryptOwnSalary(
  instance: Awaited<ReturnType<typeof createInstance>>,
  payroll: Contract,
  signer: Signer & { address: string },
  payrollAddress: string,
  employee: string,
) {
  const handle = await payroll.salaryHandle(employee);
  const keypair = instance.generateKeypair();
  const startTimeStamp = Math.floor(Date.now() / 1000).toString();
  const durationDays = "10";
  const eip712 = instance.createEIP712(keypair.publicKey, [payrollAddress], startTimeStamp, durationDays);
  const signature = await signer.signTypedData(
    eip712.domain,
    { UserDecryptRequestVerification: eip712.types.UserDecryptRequestVerification },
    eip712.message,
  );

  return instance.userDecrypt(
    [{ handle, contractAddress: payrollAddress }],
    keypair.privateKey,
    keypair.publicKey,
    signature.replace("0x", ""),
    [payrollAddress],
    signer.address,
    startTimeStamp,
    durationDays,
  );
}
