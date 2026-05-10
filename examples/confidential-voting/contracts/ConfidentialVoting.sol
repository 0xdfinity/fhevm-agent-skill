// SPDX-License-Identifier: MIT
pragma solidity ^0.8.27;

import {FHE, ebool, euint8, euint32, externalEuint8} from "@fhevm/solidity/lib/FHE.sol";
import {ZamaEthereumConfig} from "@fhevm/solidity/config/ZamaConfig.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";

/// @notice Private-choice voting with encrypted per-candidate tallies.
contract ConfidentialVoting is Ownable, ZamaEthereumConfig {
    uint8 public immutable candidateCount;
    bool public closed;

    mapping(address voter => bool voted) public hasVoted;
    mapping(uint8 candidate => euint32 tally) private _tallies;

    event VoteCast(address indexed voter);
    event TallyRevealRequested();

    error VotingClosed();
    error AlreadyVoted();
    error InvalidCandidate(uint8 candidate);

    constructor(address owner, uint8 candidateCount_) Ownable(owner) {
        require(candidateCount_ > 1, "need at least two candidates");
        candidateCount = candidateCount_;
    }

    function castVote(externalEuint8 encryptedChoice, bytes calldata inputProof) external {
        if (closed) revert VotingClosed();
        if (hasVoted[msg.sender]) revert AlreadyVoted();

        euint8 choice = FHE.fromExternal(encryptedChoice, inputProof);
        euint32 one = FHE.asEuint32(1);
        euint32 zero = FHE.asEuint32(0);

        for (uint8 i = 0; i < candidateCount; i++) {
            ebool isSelected = FHE.eq(choice, i);
            euint32 increment = FHE.select(isSelected, one, zero);
            euint32 nextTally = FHE.add(_tallies[i], increment);
            _tallies[i] = nextTally;
            FHE.allowThis(nextTally);
        }

        hasVoted[msg.sender] = true;
        emit VoteCast(msg.sender);
    }

    function requestTallyReveal() external onlyOwner {
        closed = true;
        for (uint8 i = 0; i < candidateCount; i++) {
            FHE.makePubliclyDecryptable(_tallies[i]);
        }
        emit TallyRevealRequested();
    }

    /// @notice Returns a tally ciphertext handle, not plaintext.
    function tallyHandle(uint8 candidate) external view returns (euint32) {
        if (candidate >= candidateCount) revert InvalidCandidate(candidate);
        return _tallies[candidate];
    }
}
