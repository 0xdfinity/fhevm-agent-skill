# Confidential Voting Example

Pattern: encrypted choice, encrypted tally, public final reveal.

Use this when a user asks for polls, elections, governance snapshots, preference voting, or private yes/no/multi-choice voting where individual votes must stay private and final aggregate results may become public.

Agent rules:

- Keep candidate metadata public.
- Encrypt only the voter choice.
- Never branch with Solidity `if` on the encrypted choice.
- Update every candidate tally with `FHE.select`.
- Call `FHE.allowThis` on every updated encrypted tally.
- Use public decryption only after voting is closed.
- Return tally handles only as handles; the frontend decrypts or public-decrypts them.

Files:

- `contracts/ConfidentialVoting.sol`
- `test/ConfidentialVoting.ts`
- `deploy/deploy.ts`
- `frontend/confidentialVotingClient.ts`

