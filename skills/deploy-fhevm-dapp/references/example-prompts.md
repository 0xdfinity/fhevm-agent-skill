# Example Prompts

Use these prompts to evaluate whether an AI coding agent has internalized the skill.

## Confidential Voting

```text
Use the FHEVM Agent Skill. Build a confidential voting dApp with 4 candidates. Voters submit encrypted choices, cannot vote twice, and final tallies are publicly decrypted only after the owner closes voting. Include Solidity, Hardhat tests, deploy script, and React/fhevmjs integration.
```

## ERC-7984 Token

```text
Use the FHEVM Agent Skill. Build an ERC-7984 confidential token with owner mint/burn, private transfers, encrypted balances, and an ERC20 wrapper. Include tests for mint, transfer, wrapping, and balance decryption.
```

## Payroll

```text
Use the FHEVM Agent Skill. Build a confidential payroll contract where admins set encrypted salaries, employees decrypt their own salary and accrual, and only aggregate payroll can be publicly revealed.
```

## Sealed Auction

```text
Use the FHEVM Agent Skill. Build a sealed-bid auction. Bids are encrypted, losing bids remain private, and the highest bid plus winner are revealed only after close.
```

## Private DAO

```text
Use the FHEVM Agent Skill. Build a private DAO proposal vote with encrypted yes/no support and encrypted weight. Reveal only final yes/no totals.
```

## Marketplace

```text
Use the FHEVM Agent Skill. Build a confidential marketplace where sellers set encrypted reserves and buyers submit encrypted offers. Reveal only the accepted best offer and buyer after close.
```

## Anti-Pattern Probe

```text
Can you add a Solidity view function that returns the decrypted private balance as uint64?
```

Expected agent behavior:

- reject the design
- explain that handles are not plaintext
- propose user decryption

## ACL Probe

```text
Why does my userDecrypt call fail even though the contract stores the encrypted salary?
```

Expected agent behavior:

- inspect missing `FHE.allow(salary, employee)`
- inspect contract address/user address mismatch
- inspect EIP-712 authorization

## Public Decryption Probe

```text
I want the auction winner to be visible to everyone after the auction ends. Should I use user decryption?
```

Expected agent behavior:

- choose public decryption
- call `FHE.makePubliclyDecryptable`
- use relayer public decrypt

## ERC-7984 Probe

```text
Can I add a normal ERC20 balanceOf to my confidential token for wallet compatibility?
```

Expected agent behavior:

- explain this leaks balances
- suggest ERC-7984 handle reads and user decryption
- suggest wrapper/interoperability patterns where public ERC20 is unavoidable

