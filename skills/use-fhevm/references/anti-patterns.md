# Anti-Patterns

This file is designed for agents. Read it before emitting FHEVM code.

## Missing `FHE.allowThis`

❌ WRONG

```solidity
balances[msg.sender] = FHE.add(balances[msg.sender], amount);
```

The contract stores a new ciphertext but does not grant itself permission to use that ciphertext later.

✅ CORRECT

```solidity
balances[msg.sender] = FHE.add(balances[msg.sender], amount);
FHE.allowThis(balances[msg.sender]);
FHE.allow(balances[msg.sender], msg.sender);
```

## Invalid Encrypted Comparison

❌ WRONG

```solidity
if (encryptedBid > highestBid) {
    highestBid = encryptedBid;
}
```

Encrypted values cannot be compared with Solidity operators.

✅ CORRECT

```solidity
ebool beats = FHE.gt(encryptedBid, highestBid);
highestBid = FHE.select(beats, encryptedBid, highestBid);
FHE.allowThis(highestBid);
```

## Plaintext Leakage

❌ WRONG

```solidity
mapping(address => uint64) public decryptedBalances;
```

This turns a confidential balance into a public balance.

✅ CORRECT

```solidity
mapping(address => euint64) private balances;

function balanceHandle(address account) external view returns (euint64) {
    return balances[account];
}
```

The frontend performs authorized user decryption.

## Improper Frontend Decryption

❌ WRONG

```ts
const balance = Number(await token.balanceHandle(user));
```

The returned value is a handle, not a balance.

✅ CORRECT

```ts
const handle = await token.balanceHandle(user);
const result = await instance.userDecrypt(
  [{ handle, contractAddress }],
  keypair.privateKey,
  keypair.publicKey,
  signature.replace("0x", ""),
  [contractAddress],
  userAddress,
  startTimeStamp,
  durationDays,
);
```

## Invalid View Logic

❌ WRONG

```solidity
function hasEnough(address user, uint64 amount) external view returns (bool) {
    return balances[user] >= amount;
}
```

Encrypted values cannot produce plaintext booleans in view functions.

✅ CORRECT

```solidity
function balanceHandle(address user) external view returns (euint64) {
    return balances[user];
}
```

If the protocol needs a public outcome, request public decryption in a finalization step.

## Insecure Access Pattern

❌ WRONG

```solidity
FHE.allow(secretSalary, address(0));
```

Do not grant meaningless or overly broad access to private values.

✅ CORRECT

```solidity
FHE.allowThis(secretSalary);
FHE.allow(secretSalary, employee);
FHE.allow(secretSalary, owner());
```

Grant only the addresses that need decryption or reuse.

## Broken Proof Handling

❌ WRONG

```solidity
function deposit(euint64 amount) external {
    balances[msg.sender] = FHE.add(balances[msg.sender], amount);
}
```

Fresh user input must arrive as `externalEuint64` with a proof. An `euint64` parameter is valid only when the caller already has ACL access to an existing ciphertext.

✅ CORRECT

```solidity
function deposit(externalEuint64 encryptedAmount, bytes calldata inputProof) external {
    euint64 amount = FHE.fromExternal(encryptedAmount, inputProof);
    balances[msg.sender] = FHE.add(balances[msg.sender], amount);
    FHE.allowThis(balances[msg.sender]);
    FHE.allow(balances[msg.sender], msg.sender);
}
```

## Frontend Encryption Mistake

❌ WRONG

```ts
const input = instance.createEncryptedInput(otherContract, alice);
await target.submit(input.handles[0], input.inputProof);
```

Encrypted input is bound to the wrong contract.

✅ CORRECT

```ts
const input = instance.createEncryptedInput(targetContractAddress, alice);
input.add64(amount);
const encrypted = await input.encrypt();
await target.submit(encrypted.handles[0], encrypted.inputProof);
```

## Incorrect ERC-7984 Integration

❌ WRONG

```solidity
mapping(address => uint256) public balanceOf;
```

This is ERC-20 thinking, not ERC-7984.

✅ CORRECT

```solidity
import {ERC7984} from "@openzeppelin/confidential-contracts/token/ERC7984/ERC7984.sol";

contract Token is ERC7984 {
    function confidentialBalanceOf(address account) public view override returns (euint64) {
        return super.confidentialBalanceOf(account);
    }
}
```

Use OpenZeppelin's ERC-7984 base unless you have a carefully audited reason not to.

## Testing Mistake: Decrypting With Wrong Type

❌ WRONG

```ts
await fhevm.userDecryptEuint(FhevmType.euint32, euint64Handle, contractAddress, alice);
```

The decryption type must match the Solidity encrypted type.

✅ CORRECT

```ts
await fhevm.userDecryptEuint(FhevmType.euint64, euint64Handle, contractAddress, alice);
```

## Testing Mistake: Missing ACL

❌ WRONG

```solidity
total = FHE.add(total, amount);
FHE.allowThis(total);
```

Then the test tries to decrypt as Alice.

✅ CORRECT

```solidity
total = FHE.add(total, amount);
FHE.allowThis(total);
FHE.allow(total, alice);
```

Only grant user ACL when the user should decrypt. For public aggregate results, use public decryption instead.

## Public Decryption Too Early

❌ WRONG

```solidity
FHE.makePubliclyDecryptable(currentHighestBid);
```

Calling this while an auction is open leaks the current price discovery process.

✅ CORRECT

```solidity
function closeAndRequestReveal() external onlyOwner {
    closed = true;
    FHE.makePubliclyDecryptable(finalHighestBid);
}
```

Public decryption is a lifecycle decision, not a debugging shortcut.

## Dead Static Frontend From Wrong SDK Import

WRONG

```js
import { initSDK, createInstance } from "https://cdn.zama.org/relayer-sdk-js/0.4.1/relayer-sdk-js.umd.cjs";
```

The CDN `.umd.cjs` file publishes a browser global. Treating it as named ESM can prevent the app module from evaluating, so wallet buttons and action buttons never receive click handlers.

CORRECT

```html
<script
  src="https://cdn.zama.org/relayer-sdk-js/0.4.1/relayer-sdk-js.umd.cjs"
  type="text/javascript"
></script>
<script type="module" src="./app.js"></script>
```

```js
const { initSDK, createInstance, SepoliaConfig } = globalThis.relayerSDK || {};
```

Always verify the deployed frontend can click Connect Wallet and produce either a wallet prompt or a clear "No injected wallet found" message.
