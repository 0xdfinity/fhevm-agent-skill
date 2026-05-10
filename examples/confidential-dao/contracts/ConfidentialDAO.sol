// SPDX-License-Identifier: MIT
pragma solidity ^0.8.27;

import {FHE, euint64, externalEbool, externalEuint64} from "@fhevm/solidity/lib/FHE.sol";
import {ZamaEthereumConfig} from "@fhevm/solidity/config/ZamaConfig.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";

/// @notice Confidential yes/no DAO vote with encrypted vote direction and weight.
contract ConfidentialDAO is Ownable, ZamaEthereumConfig {
    struct Proposal {
        string metadataURI;
        bool closed;
        euint64 yesVotes;
        euint64 noVotes;
    }

    Proposal[] private _proposals;
    mapping(uint256 proposalId => mapping(address voter => bool voted)) public hasVoted;

    event ProposalCreated(uint256 indexed proposalId, string metadataURI);
    event VoteCast(uint256 indexed proposalId, address indexed voter);
    event ProposalRevealRequested(uint256 indexed proposalId);

    error InvalidProposal(uint256 proposalId);
    error ProposalClosed(uint256 proposalId);
    error AlreadyVoted(uint256 proposalId, address voter);

    constructor(address owner) Ownable(owner) {}

    function createProposal(string calldata metadataURI) external onlyOwner returns (uint256 proposalId) {
        proposalId = _proposals.length;
        _proposals.push();
        _proposals[proposalId].metadataURI = metadataURI;
        emit ProposalCreated(proposalId, metadataURI);
    }

    function castVote(
        uint256 proposalId,
        externalEbool encryptedSupport,
        externalEuint64 encryptedWeight,
        bytes calldata inputProof
    ) external {
        if (proposalId >= _proposals.length) revert InvalidProposal(proposalId);
        if (_proposals[proposalId].closed) revert ProposalClosed(proposalId);
        if (hasVoted[proposalId][msg.sender]) revert AlreadyVoted(proposalId, msg.sender);

        Proposal storage proposal = _proposals[proposalId];
        euint64 weight = FHE.fromExternal(encryptedWeight, inputProof);
        euint64 zero = FHE.asEuint64(0);

        proposal.yesVotes = FHE.add(proposal.yesVotes, FHE.select(FHE.fromExternal(encryptedSupport, inputProof), weight, zero));
        proposal.noVotes = FHE.add(proposal.noVotes, FHE.select(FHE.fromExternal(encryptedSupport, inputProof), zero, weight));

        FHE.allowThis(proposal.yesVotes);
        FHE.allowThis(proposal.noVotes);

        hasVoted[proposalId][msg.sender] = true;
        emit VoteCast(proposalId, msg.sender);
    }

    function closeAndRequestReveal(uint256 proposalId) external onlyOwner {
        if (proposalId >= _proposals.length) revert InvalidProposal(proposalId);
        Proposal storage proposal = _proposals[proposalId];
        proposal.closed = true;
        FHE.makePubliclyDecryptable(proposal.yesVotes);
        FHE.makePubliclyDecryptable(proposal.noVotes);
        emit ProposalRevealRequested(proposalId);
    }

    function proposalCount() external view returns (uint256) {
        return _proposals.length;
    }

    function proposalMetadataURI(uint256 proposalId) external view returns (string memory) {
        if (proposalId >= _proposals.length) revert InvalidProposal(proposalId);
        return _proposals[proposalId].metadataURI;
    }

    function voteTotalHandles(uint256 proposalId) external view returns (euint64 yesVotes, euint64 noVotes) {
        if (proposalId >= _proposals.length) revert InvalidProposal(proposalId);
        Proposal storage proposal = _proposals[proposalId];
        return (proposal.yesVotes, proposal.noVotes);
    }
}
