# Decision Frameworks

Use these frameworks before writing code.

## Privacy Classification

Ask for every value:

| Question | If yes | Pattern |
| --- | --- | --- |
| Should everyone know it immediately? | Public | Plain Solidity state |
| Should only the owner/user know it? | Private user state | User decryption |
| Should it become public later? | Final public outcome | Public decryption |
| Should another contract use it this transaction only? | Temporary handoff | `FHE.allowTransient` |
| Is it a fungible token balance or transfer amount? | Confidential token | ERC-7984 |

## When To Use User Decryption

Use user decryption for:

- account balances
- salaries
- private counters
- personal limits
- bid receipts
- private order status

Do not use user decryption for:

- final public vote totals
- final auction winner
- public settlement amount
- data another contract needs synchronously

Checklist:

- value has `FHE.allowThis`
- value has `FHE.allow(value, user)`
- frontend performs EIP-712 signature flow
- UI never displays handle as plaintext

## When To Use Public Decryption

Use public decryption for:

- final tallies
- winning bid
- final marketplace accepted price
- aggregate payroll spend
- public random outcome

Do not use public decryption for:

- private balances
- individual salaries
- losing bids
- voter choices
- private offers before close

Checklist:

- lifecycle has a clear reveal point
- contract calls `FHE.makePubliclyDecryptable`
- frontend/script calls public decrypt
- onchain finalization verifies with `FHE.checkSignatures` if public value drives contract state

## When To Use `FHE.allow`

Use permanent allowance when an address must decrypt or reuse the ciphertext after the current transaction.

Examples:

- user can decrypt balance
- employee can decrypt salary
- contract can reuse stored aggregate
- owner can decrypt administrative private value

Do not grant permanent allowance to broad audiences.

## When To Use `FHE.allowTransient`

Use transient allowance when access is needed only in the current transaction.

Examples:

- ERC-7984 transfer callback
- wrapper calling token
- router forwarding encrypted amount
- marketplace settlement adapter

Do not use transient allowance for stored state.

## When To Use Encrypted Comparisons

Use encrypted comparisons when the compared value is private:

- bid > highest bid
- offer >= reserve
- salary > threshold
- vote choice == candidate index

Remember:

- comparison returns `ebool`
- `ebool` cannot be used in Solidity `if`
- route with `FHE.select`

## When To Use Encrypted Conditionals

Use `FHE.select(condition, ifTrue, ifFalse)` when either branch result is private.

Examples:

- update highest bid
- route yes/no vote weight
- increment selected candidate tally
- accept offer only if above reserve

Do not use encrypted conditionals to hide public lifecycle decisions. Public booleans like `closed` can use normal `require`.

## When Not To Use Encrypted Storage

Do not encrypt:

- candidate names
- proposal metadata
- listing IDs
- public lifecycle status
- owner address
- timestamps
- non-sensitive counts

Encrypting public data adds cost and complexity without privacy benefit.

## ERC-7984 Decision

Use ERC-7984 if:

- balances are private
- transfer amounts are private
- fungible token semantics are needed
- ERC-20 interoperability matters

Do not use ERC-7984 if:

- only a single private value is needed
- no transfer/balance model exists
- public ERC-20 is sufficient

## Type Selection

| Data | Type |
| --- | --- |
| boolean support flag | `ebool` |
| vote choice among fewer than 256 options | `euint8` |
| small bounded counter | `euint16` |
| vote total/counter | `euint32` |
| amount, salary, bid, offer, token balance | `euint64` |
| private winner/recipient/account | `eaddress` |

Choose the smallest type that fits.

