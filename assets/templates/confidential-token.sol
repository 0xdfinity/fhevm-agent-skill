// SPDX-License-Identifier: MIT
pragma solidity ^0.8.27;

import {FHE, euint64, externalEuint64} from "@fhevm/solidity/lib/FHE.sol";
import {ZamaEthereumConfig} from "@fhevm/solidity/config/ZamaConfig.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {ERC7984} from "@openzeppelin/confidential-contracts/token/ERC7984/ERC7984.sol";

/// @notice ERC-7984 starter with encrypted balances and encrypted transfers.
contract ConfidentialTokenTemplate is ERC7984, Ownable, ZamaEthereumConfig {
    constructor(address owner)
        ERC7984("Confidential Token Template", "cTT", "ipfs://fhevm-agent-skill/confidential-token-template")
        Ownable(owner)
    {}

    function mint(address to, externalEuint64 encryptedAmount, bytes calldata inputProof)
        external
        onlyOwner
        returns (euint64 transferred)
    {
        transferred = _mint(to, FHE.fromExternal(encryptedAmount, inputProof));
    }

    function burn(address from, externalEuint64 encryptedAmount, bytes calldata inputProof)
        external
        onlyOwner
        returns (euint64 transferred)
    {
        transferred = _burn(from, FHE.fromExternal(encryptedAmount, inputProof));
    }

    /// @notice Returns an encrypted balance handle. Decrypt client-side with proper ACL.
    function balanceHandle(address account) external view returns (euint64) {
        return confidentialBalanceOf(account);
    }
}
