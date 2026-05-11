// SPDX-License-Identifier: MIT
pragma solidity ^0.8.27;

import {FHE, euint32, externalEuint32} from "@fhevm/solidity/lib/FHE.sol";
import {ZamaEthereumConfig} from "@fhevm/solidity/config/ZamaConfig.sol";

/// @notice Minimal confidential state pattern for AI-generated FHEVM contracts.
contract StarterConfidentialContract is ZamaEthereumConfig {
    euint32 private _privateValue;

    event PrivateValueUpdated(address indexed account);

    function setPrivateValue(externalEuint32 encryptedValue, bytes calldata inputProof) external {
        euint32 value = FHE.fromExternal(encryptedValue, inputProof);
        _privateValue = value;

        FHE.allowThis(_privateValue);
        FHE.allow(_privateValue, msg.sender);

        emit PrivateValueUpdated(msg.sender);
    }

    /// @notice Returns a ciphertext handle, not plaintext.
    function privateValueHandle() external view returns (euint32) {
        return _privateValue;
    }
}
