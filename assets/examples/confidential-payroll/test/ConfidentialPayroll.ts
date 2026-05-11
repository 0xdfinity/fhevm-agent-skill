import { FhevmType } from "@fhevm/hardhat-plugin";
import { expect } from "chai";
import { ethers, fhevm } from "hardhat";

describe("ConfidentialPayroll", function () {
  it("stores salary privately and lets the employee decrypt only authorized handles", async function () {
    if (!fhevm.isMock) this.skip();

    const [owner, alice] = await ethers.getSigners();
    const factory = await ethers.getContractFactory("ConfidentialPayroll");
    const payroll = await factory.deploy(owner.address);
    const payrollAddress = await payroll.getAddress();

    const salary = await fhevm.createEncryptedInput(payrollAddress, owner.address).add64(7_500).encrypt();
    await (await payroll.connect(owner).setSalary(alice.address, salary.handles[0], salary.inputProof)).wait();

    const salaryHandle = await payroll.salaryHandle(alice.address);
    const clearSalary = await fhevm.userDecryptEuint(FhevmType.euint64, salaryHandle, payrollAddress, alice);
    expect(clearSalary).to.equal(7_500n);
  });

  it("accrues encrypted payroll and reveals only aggregate totals when requested", async function () {
    if (!fhevm.isMock) this.skip();

    const [owner, alice, bob] = await ethers.getSigners();
    const factory = await ethers.getContractFactory("ConfidentialPayroll");
    const payroll = await factory.deploy(owner.address);
    const payrollAddress = await payroll.getAddress();

    const aliceSalary = await fhevm.createEncryptedInput(payrollAddress, owner.address).add64(7_500).encrypt();
    const bobSalary = await fhevm.createEncryptedInput(payrollAddress, owner.address).add64(12_000).encrypt();
    await (await payroll.setSalary(alice.address, aliceSalary.handles[0], aliceSalary.inputProof)).wait();
    await (await payroll.setSalary(bob.address, bobSalary.handles[0], bobSalary.inputProof)).wait();

    await (await payroll.accruePayroll(alice.address)).wait();
    await (await payroll.accruePayroll(bob.address)).wait();
    await (await payroll.requestAggregateReveal()).wait();

    const aliceAccruedHandle = await payroll.accruedHandle(alice.address);
    const aliceAccrued = await fhevm.userDecryptEuint(FhevmType.euint64, aliceAccruedHandle, payrollAddress, alice);
    const aggregateHandle = await payroll.aggregateAccruedHandle();
    const aggregate = await fhevm.publicDecryptEuint(FhevmType.euint64, aggregateHandle);

    expect(aliceAccrued).to.equal(7_500n);
    expect(aggregate).to.equal(19_500n);
  });
});
