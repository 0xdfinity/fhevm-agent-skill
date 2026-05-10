import { FhevmType } from "@fhevm/hardhat-plugin";
import { expect } from "chai";
import { ethers, fhevm } from "hardhat";

describe("ConfidentialVoting", function () {
  it("counts encrypted votes and reveals only final public tallies", async function () {
    if (!fhevm.isMock) this.skip();

    const [owner, alice, bob, carol] = await ethers.getSigners();
    const factory = await ethers.getContractFactory("ConfidentialVoting");
    const voting = await factory.deploy(owner.address, 3);
    const votingAddress = await voting.getAddress();

    for (const [signer, choice] of [
      [alice, 1],
      [bob, 1],
      [carol, 2],
    ] as const) {
      const encrypted = await fhevm.createEncryptedInput(votingAddress, signer.address).add8(choice).encrypt();
      await (await voting.connect(signer).castVote(encrypted.handles[0], encrypted.inputProof)).wait();
    }

    await (await voting.connect(owner).requestTallyReveal()).wait();

    const candidate1 = await voting.tallyHandle(1);
    const candidate2 = await voting.tallyHandle(2);
    const clear1 = await fhevm.publicDecryptEuint(FhevmType.euint32, candidate1);
    const clear2 = await fhevm.publicDecryptEuint(FhevmType.euint32, candidate2);

    expect(clear1).to.equal(2n);
    expect(clear2).to.equal(1n);
  });

  it("prevents public double voting outside encrypted logic", async function () {
    if (!fhevm.isMock) this.skip();

    const [owner, alice] = await ethers.getSigners();
    const factory = await ethers.getContractFactory("ConfidentialVoting");
    const voting = await factory.deploy(owner.address, 2);
    const votingAddress = await voting.getAddress();

    const encrypted = await fhevm.createEncryptedInput(votingAddress, alice.address).add8(0).encrypt();
    await (await voting.connect(alice).castVote(encrypted.handles[0], encrypted.inputProof)).wait();

    await expect(voting.connect(alice).castVote(encrypted.handles[0], encrypted.inputProof)).to.be.revertedWithCustomError(
      voting,
      "AlreadyVoted",
    );
  });
});
