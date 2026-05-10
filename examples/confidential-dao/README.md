# Confidential DAO Voting Example

Pattern: encrypted support bit, encrypted voting weight, encrypted yes/no totals, public final reveal.

Use this when a user asks for private DAO voting, token-weighted confidential governance, private conviction voting, or hidden delegation outcomes.

Agent rules:

- Keep proposal metadata public.
- Encrypt support and weight when the vote itself or voting power is sensitive.
- Prevent double voting with a public nullifier or membership proof; do not attempt to decrypt vote state onchain.
- Use `FHE.select` to route encrypted weight into yes/no totals.
- Reveal only aggregate totals after voting ends.
- For production token-weighted voting, derive weight from an ERC-7984 balance or snapshot module instead of trusting a user-supplied encrypted weight.

Files:

- `contracts/ConfidentialDAO.sol`
- `test/ConfidentialDAO.ts`
- `deploy/deploy.ts`
- `frontend/daoClient.ts`

