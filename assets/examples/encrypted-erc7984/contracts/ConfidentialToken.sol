// SPDX-License-Identifier: MIT
pragma solidity ^0.8.27;

import {FHE, euint64, externalEuint64} from "@fhevm/solidity/lib/FHE.sol";
import {ZamaEthereumConfig} from "@fhevm/solidity/config/ZamaConfig.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {ERC20} from "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import {IERC20} from "@openzeppelin/contracts/interfaces/IERC20.sol";
import {ERC7984} from "@openzeppelin/confidential-contracts/token/ERC7984/ERC7984.sol";
import {ERC7984ERC20Wrapper} from "@openzeppelin/confidential-contracts/token/ERC7984/extensions/ERC7984ERC20Wrapper.sol";

/// @notice Mintable ERC-7984 token for private balances and private transfers.
contract ConfidentialToken is ERC7984, Ownable, ZamaEthereumConfig {
    constructor(address owner) ERC7984("Confidential Token", "cTOK", "ipfs://confidential-token") Ownable(owner) {}

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

    /// @notice Returns a balance handle, not a plaintext balance.
    function balanceHandle(address account) external view returns (euint64) {
        return confidentialBalanceOf(account);
    }
}

/// @notice ERC-20 used by tests and local demos. Decimals are 6 to match ERC-7984's recommended scale.
contract MockERC20ForWrapping is ERC20 {
    constructor() ERC20("Mock USD", "mUSD") {}

    function decimals() public pure override returns (uint8) {
        return 6;
    }

    function mint(address to, uint256 amount) external {
        _mint(to, amount);
    }
}

/// @notice Public ERC-20 in, confidential ERC-7984 out; confidential burn request, public ERC-20 finalization out.
contract ConfidentialERC20Wrapper is ERC7984ERC20Wrapper, ZamaEthereumConfig {
    constructor(IERC20 underlying)
        ERC7984("Wrapped Confidential USD", "wcUSD", "ipfs://wrapped-confidential-usd")
        ERC7984ERC20Wrapper(underlying)
    {}
}
