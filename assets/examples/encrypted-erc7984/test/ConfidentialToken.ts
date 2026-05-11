import { FhevmType } from "@fhevm/hardhat-plugin";
import { expect } from "chai";
import { ethers, fhevm } from "hardhat";

describe("ERC7984 confidential token", function () {
  it("mints encrypted balances and transfers encrypted amounts", async function () {
    if (!fhevm.isMock) this.skip();

    const [owner, alice, bob] = await ethers.getSigners();
    const factory = await ethers.getContractFactory("ConfidentialToken");
    const token = await factory.deploy(owner.address);
    const tokenAddress = await token.getAddress();

    const mintInput = await fhevm.createEncryptedInput(tokenAddress, owner.address).add64(100).encrypt();
    await (await token.connect(owner).mint(alice.address, mintInput.handles[0], mintInput.inputProof)).wait();

    const aliceMintedHandle = await token.balanceHandle(alice.address);
    const aliceMinted = await fhevm.userDecryptEuint(FhevmType.euint64, aliceMintedHandle, tokenAddress, alice);
    expect(aliceMinted).to.equal(100n);

    const transferInput = await fhevm.createEncryptedInput(tokenAddress, alice.address).add64(25).encrypt();
    await (
      await (token.connect(alice) as any)["confidentialTransfer(address,bytes32,bytes)"](
        bob.address,
        transferInput.handles[0],
        transferInput.inputProof,
      )
    ).wait();

    const bobHandle = await token.balanceHandle(bob.address);
    const bobBalance = await fhevm.userDecryptEuint(FhevmType.euint64, bobHandle, tokenAddress, bob);
    expect(bobBalance).to.equal(25n);
  });

  it("wraps public ERC20 into an encrypted ERC7984 balance", async function () {
    if (!fhevm.isMock) this.skip();

    const [, alice, bob] = await ethers.getSigners();
    const erc20Factory = await ethers.getContractFactory("MockERC20ForWrapping");
    const underlying = await erc20Factory.deploy();
    const wrapperFactory = await ethers.getContractFactory("ConfidentialERC20Wrapper");
    const wrapper = await wrapperFactory.deploy(await underlying.getAddress());
    const wrapperAddress = await wrapper.getAddress();

    await (await underlying.mint(alice.address, 1_000_000)).wait();
    await (await underlying.connect(alice).approve(wrapperAddress, 500_000)).wait();
    await (await wrapper.connect(alice).wrap(bob.address, 500_000)).wait();

    const bobHandle = await wrapper.confidentialBalanceOf(bob.address);
    const bobWrapped = await fhevm.userDecryptEuint(FhevmType.euint64, bobHandle, wrapperAddress, bob);

    expect(bobWrapped).to.equal(500_000n);
  });
});
