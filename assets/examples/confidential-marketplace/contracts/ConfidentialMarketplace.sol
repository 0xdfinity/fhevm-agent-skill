// SPDX-License-Identifier: MIT
pragma solidity ^0.8.27;

import {FHE, eaddress, ebool, euint64, externalEuint64} from "@fhevm/solidity/lib/FHE.sol";
import {ZamaEthereumConfig} from "@fhevm/solidity/config/ZamaConfig.sol";

/// @notice Confidential offer marketplace with encrypted reserve and encrypted offers.
contract ConfidentialMarketplace is ZamaEthereumConfig {
    struct Listing {
        address seller;
        string metadataURI;
        bool closed;
        euint64 minAccepted;
        euint64 bestOffer;
        eaddress bestBuyer;
    }

    Listing[] private _listings;
    mapping(uint256 listingId => uint256 offerCount) public offerCount;
    mapping(uint256 listingId => mapping(address buyer => euint64 offer)) private _offers;

    event ListingCreated(uint256 indexed listingId, address indexed seller, string metadataURI);
    event OfferSubmitted(uint256 indexed listingId, address indexed buyer);
    event ListingRevealRequested(uint256 indexed listingId);

    error InvalidListing(uint256 listingId);
    error ListingClosed(uint256 listingId);
    error OnlySeller(uint256 listingId);

    function createListing(string calldata metadataURI, externalEuint64 encryptedMinAccepted, bytes calldata inputProof)
        external
        returns (uint256 listingId)
    {
        euint64 minAccepted = FHE.fromExternal(encryptedMinAccepted, inputProof);
        listingId = _listings.length;
        _listings.push();

        Listing storage listing = _listings[listingId];
        listing.seller = msg.sender;
        listing.metadataURI = metadataURI;
        listing.minAccepted = minAccepted;
        listing.bestOffer = FHE.asEuint64(0);
        listing.bestBuyer = FHE.asEaddress(address(0));

        FHE.allowThis(listing.minAccepted);
        FHE.allow(listing.minAccepted, msg.sender);
        FHE.allowThis(listing.bestOffer);
        FHE.allowThis(listing.bestBuyer);

        emit ListingCreated(listingId, msg.sender, metadataURI);
    }

    function submitOffer(uint256 listingId, externalEuint64 encryptedOffer, bytes calldata inputProof) external {
        if (listingId >= _listings.length) revert InvalidListing(listingId);
        Listing storage listing = _listings[listingId];
        if (listing.closed) revert ListingClosed(listingId);

        euint64 offer = FHE.fromExternal(encryptedOffer, inputProof);
        _offers[listingId][msg.sender] = offer;
        FHE.allowThis(offer);
        FHE.allow(offer, msg.sender);
        FHE.allow(offer, listing.seller);

        ebool meetsMinimum = FHE.ge(offer, listing.minAccepted);
        eaddress buyer = FHE.asEaddress(msg.sender);

        if (offerCount[listingId] == 0) {
            listing.bestOffer = FHE.select(meetsMinimum, offer, FHE.asEuint64(0));
            listing.bestBuyer = FHE.select(meetsMinimum, buyer, FHE.asEaddress(address(0)));
        } else {
            ebool beatsCurrent = FHE.gt(offer, listing.bestOffer);
            ebool accepted = FHE.and(meetsMinimum, beatsCurrent);
            listing.bestOffer = FHE.select(accepted, offer, listing.bestOffer);
            listing.bestBuyer = FHE.select(accepted, buyer, listing.bestBuyer);
        }

        FHE.allowThis(listing.bestOffer);
        FHE.allowThis(listing.bestBuyer);

        offerCount[listingId]++;
        emit OfferSubmitted(listingId, msg.sender);
    }

    function closeAndRequestReveal(uint256 listingId) external {
        if (listingId >= _listings.length) revert InvalidListing(listingId);
        Listing storage listing = _listings[listingId];
        if (msg.sender != listing.seller) revert OnlySeller(listingId);

        listing.closed = true;
        FHE.makePubliclyDecryptable(listing.bestOffer);
        FHE.makePubliclyDecryptable(listing.bestBuyer);
        emit ListingRevealRequested(listingId);
    }

    function listingCount() external view returns (uint256) {
        return _listings.length;
    }

    function listingMetadataURI(uint256 listingId) external view returns (string memory) {
        if (listingId >= _listings.length) revert InvalidListing(listingId);
        return _listings[listingId].metadataURI;
    }

    function offerHandle(uint256 listingId, address buyer) external view returns (euint64) {
        if (listingId >= _listings.length) revert InvalidListing(listingId);
        return _offers[listingId][buyer];
    }

    function bestOfferHandles(uint256 listingId) external view returns (euint64 bestOffer, eaddress bestBuyer) {
        if (listingId >= _listings.length) revert InvalidListing(listingId);
        Listing storage listing = _listings[listingId];
        return (listing.bestOffer, listing.bestBuyer);
    }
}
