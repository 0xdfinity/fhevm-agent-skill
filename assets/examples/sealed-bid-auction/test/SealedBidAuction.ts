import { FhevmType } from "@fhevm/hardhat-plugin";
import { expect } from "chai";
import { ethers, fhevm } from "hardhat";

describe("SealedBidAuction", function () {
  it("keeps bids private and publicly reveals the winning bid and bidder after close", async function () {
    if (!fhevm.isMock) this.skip();

    const [owner, alice, bob, carol] = await ethers.getSigners();
    const factory = await ethers.getContractFactory("SealedBidAuction");
    const auction = await factory.deploy(owner.address);
    const auctionAddress = await auction.getAddress();

    for (const [signer, amount] of [
      [alice, 41],
      [bob, 77],
      [carol, 55],
    ] as const) {
      const encrypted = await fhevm.createEncryptedInput(auctionAddress, signer.address).add64(amount).encrypt();
      await (await auction.connect(signer).submitBid(encrypted.handles[0], encrypted.inputProof)).wait();
    }

    const aliceBidHandle = await auction.bidHandle(alice.address);
    const aliceBid = await fhevm.userDecryptEuint(FhevmType.euint64, aliceBidHandle, auctionAddress, alice);
    expect(aliceBid).to.equal(41n);

    await (await auction.connect(owner).closeAndRequestReveal()).wait();

    const highestHandle = await auction.highestBidHandle();
    const winnerHandle = await auction.winnerHandle();
    const highestBid = await fhevm.publicDecryptEuint(FhevmType.euint64, highestHandle);
    const winner = await fhevm.publicDecryptEaddress(winnerHandle);

    expect(highestBid).to.equal(77n);
    expect(winner.toLowerCase()).to.equal(bob.address.toLowerCase());
  });
});
