import { FhevmType } from "@fhevm/hardhat-plugin";
import { expect } from "chai";
import { ethers, fhevm } from "hardhat";

describe("ConfidentialMarketplace", function () {
  it("accepts encrypted offers and reveals only the winning offer", async function () {
    if (!fhevm.isMock) this.skip();

    const [, seller, alice, bob] = await ethers.getSigners();
    const factory = await ethers.getContractFactory("ConfidentialMarketplace");
    const marketplace = await factory.deploy();
    const marketplaceAddress = await marketplace.getAddress();

    const reserve = await fhevm.createEncryptedInput(marketplaceAddress, seller.address).add64(50).encrypt();
    await (
      await marketplace.connect(seller).createListing("ipfs://listing-1", reserve.handles[0], reserve.inputProof)
    ).wait();

    const lowOffer = await fhevm.createEncryptedInput(marketplaceAddress, alice.address).add64(45).encrypt();
    await (await marketplace.connect(alice).submitOffer(0, lowOffer.handles[0], lowOffer.inputProof)).wait();

    const winningOffer = await fhevm.createEncryptedInput(marketplaceAddress, bob.address).add64(75).encrypt();
    await (await marketplace.connect(bob).submitOffer(0, winningOffer.handles[0], winningOffer.inputProof)).wait();

    const aliceOfferHandle = await marketplace.offerHandle(0, alice.address);
    const aliceOffer = await fhevm.userDecryptEuint(FhevmType.euint64, aliceOfferHandle, marketplaceAddress, alice);
    expect(aliceOffer).to.equal(45n);

    await (await marketplace.connect(seller).closeAndRequestReveal(0)).wait();
    const [bestOfferHandle, bestBuyerHandle] = await marketplace.bestOfferHandles(0);
    const bestOffer = await fhevm.publicDecryptEuint(FhevmType.euint64, bestOfferHandle);
    const bestBuyer = await fhevm.publicDecryptEaddress(bestBuyerHandle);

    expect(bestOffer).to.equal(75n);
    expect(bestBuyer.toLowerCase()).to.equal(bob.address.toLowerCase());
  });
});
