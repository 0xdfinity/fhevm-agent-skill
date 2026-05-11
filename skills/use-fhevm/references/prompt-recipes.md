# Prompt Recipes

This file teaches agents how to turn common developer requests into correct FHEVM architectures.

## Recipe 1: "Build a confidential voting dApp"

Recommended architecture:

- Public candidates and voting window.
- Encrypted `euint8` candidate choice.
- Encrypted `euint32` tally per candidate.
- Public double-vote guard.
- Public decryption after close.

Contract:

- `castVote(externalEuint8 choice, bytes inputProof)`
- loop candidates
- `FHE.eq(choice, i)`
- `FHE.select`
- `FHE.add`
- `FHE.allowThis`

Frontend:

- encrypt choice with `.add8(choice)`
- submit handle and proof
- after close, public decrypt tally handles

Tests:

- multiple voters
- final tally reveal
- double vote rejection

Pitfalls:

- do not branch with `if (choice == i)`
- do not reveal current tally during voting

Example:

- `assets/examples/confidential-voting`

If the user also asks to deploy, publish, give a Vercel link, or build end-to-end, the agent should run the hosted deployment lane itself after implementation and validation. Use `.env` for `MNEMONIC`, `INFURA_API_KEY`, and `VERCEL_TOKEN`, then return the contract address and Vercel URL.

## Recipe 2: "Build an ERC-7984 token"

Recommended architecture:

- Extend OpenZeppelin `ERC7984`.
- Use `euint64` amounts.
- Add owner mint/burn only if needed.
- Use `ConfidentialERC20Wrapper` if ERC-20 interoperability is requested.

Contract:

- `mint(address to, externalEuint64 amount, bytes proof)`
- `confidentialTransfer` inherited
- `confidentialBalanceOf` inherited

Frontend:

- encrypt amount with `.add64(amount)`
- call `confidentialTransfer(address,bytes32,bytes)`
- user-decrypt balance handle

Tests:

- mint
- private transfer
- balance decrypt by owner
- wrap ERC-20 if wrapper exists

Pitfalls:

- do not implement `balanceOf` as plaintext
- do not use ERC-20 `transfer` semantics for confidential transfers

Example:

- `assets/examples/encrypted-erc7984`

## Recipe 3: "Build confidential payroll"

Recommended architecture:

- Public employee address.
- Encrypted salary `euint64`.
- Encrypted accrued amount `euint64`.
- Employee user-decrypts own values.
- Optional aggregate public reveal.

Contract:

- owner sets encrypted salary
- owner accrues payroll
- handle getters for employee
- aggregate reveal with `makePubliclyDecryptable`

Frontend:

- admin encrypts salary
- employee authorizes EIP-712 decryption

Tests:

- employee decrypts salary
- aggregate public decrypt after reveal

Pitfalls:

- never emit salary
- never store decrypted salary onchain

Example:

- `assets/examples/confidential-payroll`

## Recipe 4: "Build a sealed-bid auction"

Recommended architecture:

- Public auction metadata.
- Encrypted bids `euint64`.
- Encrypted highest bid.
- Encrypted winner `eaddress`.
- Public reveal after close.

Contract:

- `submitBid(externalEuint64 bid, bytes proof)`
- compare with `FHE.gt`
- update with `FHE.select`
- reveal with public decryption

Frontend:

- encrypt bid with `.add64`
- submit
- after close, public decrypt highest bid and winner

Tests:

- losing bids remain private
- highest bid/winner reveal correctly

Pitfalls:

- do not reveal leading bid while open
- do not compare with plaintext operators

Example:

- `assets/examples/sealed-bid-auction`

## Recipe 5: "Build private DAO voting"

Recommended architecture:

- Public proposal metadata.
- Encrypted support `ebool`.
- Encrypted voting weight `euint64`.
- Encrypted yes/no totals.
- Public reveal after close.

Contract:

- `castVote(proposalId, externalEbool support, externalEuint64 weight, proof)`
- route weight with `FHE.select`

Tests:

- yes/no totals
- double vote guard
- public reveal

Production note:

- Do not trust user-supplied encrypted weight unless the app has a valid membership or balance proof. Prefer ERC-7984 snapshot/votes integration when available.

Example:

- `assets/examples/confidential-dao`

## Recipe 6: "Build a confidential marketplace"

Recommended architecture:

- Public listing metadata.
- Encrypted reserve/minimum price.
- Encrypted offers.
- Encrypted best offer and buyer.
- Public reveal after close.

Contract:

- seller creates listing with encrypted reserve
- buyer submits encrypted offer
- use `FHE.ge` and `FHE.gt`
- select best offer and buyer

Frontend:

- encrypt reserve/offer with `.add64`
- reveal final result after close

Pitfalls:

- losing offers should remain private
- settlement should be separate and use ERC-7984 if private value transfer is required

Example:

- `assets/examples/confidential-marketplace`

## Recipe 7: "Build a confidential leaderboard"

Recommended architecture:

- Encrypted score submissions.
- Encrypted best score and best player.
- Optional public reveal at round end.

Use:

- `euint32` or `euint64` for score
- `eaddress` for private leader
- `FHE.gt` and `FHE.select`

Tests:

- several encrypted scores
- final public decrypt

Pitfalls:

- do not reveal current leader if the game requires sealed competition

## Recipe 8: "Build private credit or risk scoring"

Recommended architecture:

- User submits encrypted attributes.
- Contract computes encrypted score.
- User decrypts their own score.
- Public thresholds only if business rules require them.

Use:

- `euint16` or `euint32` for score
- `FHE.add`, `FHE.mul` with scalar weights
- `FHE.allow(score, user)`

Pitfalls:

- do not publish score
- do not use plaintext comparisons to approve/deny unless the approval result is intended public

## Recipe 9: "Build confidential donations"

Recommended architecture:

- Public donor address optional.
- Encrypted donation amount.
- Encrypted campaign total.
- Donor user-decrypts receipt.
- Campaign total public-decrypts at milestones or close.

Use:

- `euint64` amount
- `FHE.add` total
- user ACL for donor receipt
- public decryption for aggregate

Pitfalls:

- decide whether donor identity is public before implementation

## Recipe 10: "Build private escrow"

Recommended architecture:

- Public parties and escrow lifecycle.
- Encrypted escrow amount.
- User decryption for participants.
- Public decryption only if settlement requires public asset release.

Use:

- ERC-7984 if funds are confidential tokens
- public ERC-20 wrapper only with public-decryption finalization
- `allowTransient` for same-transaction settlement adapters

Pitfalls:

- do not release public ERC-20 based on an unverified decrypted amount
- verify decryption proof with `FHE.checkSignatures`

## Recipe 11: "Add FHEVM to an existing Solidity contract"

Migration sequence:

1. Identify private fields.
2. Replace private scalar types with encrypted types.
3. Replace direct setters with `externalE*` plus proof.
4. Replace arithmetic with `FHE.*`.
5. Replace branch logic with encrypted comparisons and `FHE.select`.
6. Add ACL after every stored encrypted result.
7. Add handle getters.
8. Add Hardhat FHEVM tests.
9. Add frontend encryption/decryption.

Pitfalls:

- do not encrypt everything
- do not preserve old `view returns (uint*)` APIs for private values
