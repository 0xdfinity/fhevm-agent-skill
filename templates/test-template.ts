import { FhevmType } from "@fhevm/hardhat-plugin";
import { expect } from "chai";
import { ethers, fhevm } from "hardhat";

describe("StarterConfidentialContract", function () {
  it("stores and decrypts a user-authorized euint32", async function () {
    if (!fhevm.isMock) this.skip();

    const [, alice] = await ethers.getSigners();
    const factory = await ethers.getContractFactory("StarterConfidentialContract");
    const contract = await factory.deploy();
    const contractAddress = await contract.getAddress();

    const encrypted = await fhevm.createEncryptedInput(contractAddress, alice.address).add32(42).encrypt();
    await (await contract.connect(alice).setPrivateValue(encrypted.handles[0], encrypted.inputProof)).wait();

    const handle = await contract.privateValueHandle();
    const clear = await fhevm.userDecryptEuint(FhevmType.euint32, handle, contractAddress, alice);

    expect(clear).to.equal(42n);
  });
});
