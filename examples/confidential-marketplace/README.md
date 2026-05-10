# Confidential Marketplace Example

Pattern: public listing, encrypted minimum acceptable price, encrypted offers, public winning offer after close.

Use this when a user asks for private offers, confidential RFQs, private marketplace negotiation, hidden reserve prices, or encrypted order books.

Agent rules:

- Keep item metadata public unless the product itself is sensitive.
- Encrypt reserve/minimum accepted price if sellers need confidentiality.
- Encrypt offers and compare with `FHE.ge`/`FHE.gt`.
- Never expose losing offers.
- Reveal only the accepted offer and winner after the listing closes.
- Integrate settlement separately with ERC-7984 if value transfer must also be private.

Files:

- `contracts/ConfidentialMarketplace.sol`
- `test/ConfidentialMarketplace.ts`
- `deploy/deploy.ts`
- `frontend/marketplaceClient.ts`

