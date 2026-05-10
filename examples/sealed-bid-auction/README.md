# Sealed-Bid Auction Example

Pattern: encrypted bids, encrypted max comparison, public final reveal.

Use this when a user asks for blind auctions, sealed bids, private price discovery, hidden reserve matching, or winner selection without exposing losing bids.

Agent rules:

- Store every bid as an encrypted handle only if bidders need later user decryption.
- Use `FHE.gt` to compare encrypted bids.
- Use `FHE.select` to update encrypted winner state.
- Do not reveal the current highest bid while bidding is open.
- Publicly decrypt only after the auction closes.
- Do not use plaintext `if (bid > highestBid)`; encrypted comparisons produce `ebool`.

Files:

- `contracts/SealedBidAuction.sol`
- `test/SealedBidAuction.ts`
- `deploy/deploy.ts`
- `frontend/auctionClient.ts`

