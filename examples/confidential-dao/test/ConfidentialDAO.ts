import { FhevmType } from "@fhevm/hardhat-plugin";
import { expect } from "chai";
import { ethers, fhevm } from "hardhat";

describe("ConfidentialDAO", function () {
  it("routes encrypted weights into encrypted yes/no totals and reveals aggregates", async function () {
    if (!fhevm.isMock) this.skip();

    const [owner, alice, bob, carol] = await ethers.getSigners();
    const factory = await ethers.getContractFactory("ConfidentialDAO");
    const dao = await factory.deploy(owner.address);
    const daoAddress = await dao.getAddress();

    await (await dao.createProposal("ipfs://proposal-1")).wait();

    for (const [signer, support, weight] of [
      [alice, true, 10],
      [bob, false, 4],
      [carol, true, 6],
    ] as const) {
      const encrypted = await fhevm
        .createEncryptedInput(daoAddress, signer.address)
        .addBool(support)
        .add64(weight)
        .encrypt();
      await (await dao.connect(signer).castVote(0, encrypted.handles[0], encrypted.handles[1], encrypted.inputProof)).wait();
    }

    await (await dao.connect(owner).closeAndRequestReveal(0)).wait();
    const [yesHandle, noHandle] = await dao.voteTotalHandles(0);
    const yes = await fhevm.publicDecryptEuint(FhevmType.euint64, yesHandle);
    const no = await fhevm.publicDecryptEuint(FhevmType.euint64, noHandle);

    expect(yes).to.equal(16n);
    expect(no).to.equal(4n);
  });
});
