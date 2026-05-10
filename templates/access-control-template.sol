// SPDX-License-Identifier: MIT
pragma solidity ^0.8.27;

import {FHE, euint64, externalEuint64} from "@fhevm/solidity/lib/FHE.sol";
import {ZamaEthereumConfig} from "@fhevm/solidity/config/ZamaConfig.sol";

/// @notice Copy this ACL shape whenever encrypted state must survive a transaction.
contract AccessControlTemplate is ZamaEthereumConfig {
    mapping(address account => euint64 value) private _values;

    function storeForUser(address user, externalEuint64 encryptedValue, bytes calldata inputProof) external {
        euint64 value = FHE.fromExternal(encryptedValue, inputProof);
        _values[user] = value;

        FHE.allowThis(value);
        FHE.allow(value, user);
    }

    function forwardOnce(address target, euint64 value) external {
        require(FHE.isSenderAllowed(value), "sender lacks ciphertext access");
        FHE.allowTransient(value, target);
    }

    function valueHandle(address user) external view returns (euint64) {
        return _values[user];
    }
}
