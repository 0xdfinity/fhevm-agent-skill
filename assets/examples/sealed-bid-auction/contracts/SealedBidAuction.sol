// SPDX-License-Identifier: MIT
pragma solidity ^0.8.27;

import {FHE, eaddress, ebool, euint64, externalEuint64} from "@fhevm/solidity/lib/FHE.sol";
import {ZamaEthereumConfig} from "@fhevm/solidity/config/ZamaConfig.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";

/// @notice Sealed-bid auction that keeps bids private until final public reveal.
contract SealedBidAuction is Ownable, ZamaEthereumConfig {
    bool public closed;
    uint256 public bidCount;

    mapping(address bidder => euint64 bid) private _bids;
    euint64 private _highestBid;
    eaddress private _winner;

    event BidSubmitted(address indexed bidder);
    event RevealRequested();

    error AuctionClosed();
    error NoBids();

    constructor(address owner) Ownable(owner) {}

    function submitBid(externalEuint64 encryptedBid, bytes calldata inputProof) external {
        if (closed) revert AuctionClosed();

        euint64 bid = FHE.fromExternal(encryptedBid, inputProof);
        _bids[msg.sender] = bid;
        FHE.allowThis(bid);
        FHE.allow(bid, msg.sender);

        eaddress bidder = FHE.asEaddress(msg.sender);

        if (bidCount == 0) {
            _highestBid = bid;
            _winner = bidder;
        } else {
            ebool beatsCurrent = FHE.gt(bid, _highestBid);
            _highestBid = FHE.select(beatsCurrent, bid, _highestBid);
            _winner = FHE.select(beatsCurrent, bidder, _winner);
        }

        FHE.allowThis(_highestBid);
        FHE.allowThis(_winner);

        bidCount++;
        emit BidSubmitted(msg.sender);
    }

    function closeAndRequestReveal() external onlyOwner {
        if (bidCount == 0) revert NoBids();
        closed = true;
        FHE.makePubliclyDecryptable(_highestBid);
        FHE.makePubliclyDecryptable(_winner);
        emit RevealRequested();
    }

    function bidHandle(address bidder) external view returns (euint64) {
        return _bids[bidder];
    }

    function highestBidHandle() external view returns (euint64) {
        return _highestBid;
    }

    function winnerHandle() external view returns (eaddress) {
        return _winner;
    }
}
