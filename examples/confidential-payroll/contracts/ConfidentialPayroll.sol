// SPDX-License-Identifier: MIT
pragma solidity ^0.8.27;

import {FHE, euint64, externalEuint64} from "@fhevm/solidity/lib/FHE.sol";
import {ZamaEthereumConfig} from "@fhevm/solidity/config/ZamaConfig.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";

/// @notice Confidential payroll ledger with employee-authorized decryption.
contract ConfidentialPayroll is Ownable, ZamaEthereumConfig {
    mapping(address employee => euint64 salary) private _salary;
    mapping(address employee => euint64 accrued) private _accrued;

    event SalaryUpdated(address indexed employee);
    event PayrollAccrued(address indexed employee);
    event AggregateRevealRequested();

    euint64 private _aggregateAccrued;

    constructor(address owner) Ownable(owner) {}

    function setSalary(address employee, externalEuint64 encryptedSalary, bytes calldata inputProof) external onlyOwner {
        euint64 salary = FHE.fromExternal(encryptedSalary, inputProof);
        _salary[employee] = salary;

        FHE.allowThis(salary);
        FHE.allow(salary, employee);
        FHE.allow(salary, owner());

        emit SalaryUpdated(employee);
    }

    function accruePayroll(address employee) external onlyOwner {
        euint64 salary = _salary[employee];

        euint64 nextAccrued = FHE.add(_accrued[employee], salary);
        _accrued[employee] = nextAccrued;
        FHE.allowThis(nextAccrued);
        FHE.allow(nextAccrued, employee);
        FHE.allow(nextAccrued, owner());

        _aggregateAccrued = FHE.add(_aggregateAccrued, salary);
        FHE.allowThis(_aggregateAccrued);

        emit PayrollAccrued(employee);
    }

    function requestAggregateReveal() external onlyOwner {
        FHE.makePubliclyDecryptable(_aggregateAccrued);
        emit AggregateRevealRequested();
    }

    function salaryHandle(address employee) external view returns (euint64) {
        return _salary[employee];
    }

    function accruedHandle(address employee) external view returns (euint64) {
        return _accrued[employee];
    }

    function aggregateAccruedHandle() external view returns (euint64) {
        return _aggregateAccrued;
    }
}
