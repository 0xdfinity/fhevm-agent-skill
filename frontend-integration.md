# Frontend Integration

FHEVM frontend code has three jobs:

1. Encrypt user inputs before sending transactions.
2. Read ciphertext handles from contracts.
3. Decrypt handles through user decryption or public decryption.

Do not build a frontend that treats handles as plaintext.

## Library Choices

Use low-level SDK when you need direct control:

```ts
import { createInstance, SepoliaConfig } from "@zama-fhe/relayer-sdk";
```

For static browser demos that use the Zama CDN UMD bundle, do not use named ESM imports from the `.umd.cjs` URL. Load the script first and read the global export:

```html
<script
  src="https://cdn.zama.org/relayer-sdk-js/0.4.1/relayer-sdk-js.umd.cjs"
  type="text/javascript"
></script>
<script type="module" src="./app.js"></script>
```

```js
const { initSDK, createInstance, SepoliaConfig } = globalThis.relayerSDK || {};

if (!initSDK || !createInstance || !SepoliaConfig) {
  throw new Error("Zama Relayer SDK did not load.");
}
```

Wrong pattern:

```js
import { initSDK, createInstance } from "https://cdn.zama.org/relayer-sdk-js/0.4.1/relayer-sdk-js.umd.cjs";
```

That URL is a UMD/CJS browser bundle. Named-importing it as ESM can stop the whole module before wallet buttons bind.

Use React SDK when building a React app:

```ts
import { useEncrypt, useUserDecrypt, useAllow, useIsAllowed } from "@zama-fhe/react-sdk";
```

Use the official React template patterns for provider wiring:

- local mock/cleartext mode for localhost
- real relayer mode for Sepolia
- EIP-712 credentials cached in browser storage

## Encrypting Inputs

Rule: encrypted input is bound to the target contract and the submitting user.

```ts
const input = instance.createEncryptedInput(contractAddress, userAddress);
input.add64(100n);
const encrypted = await input.encrypt();

await contract.submit(encrypted.handles[0], encrypted.inputProof);
```

For multiple inputs:

```ts
const input = instance.createEncryptedInput(contractAddress, userAddress);
input.addBool(true);
input.add64(25n);
const encrypted = await input.encrypt();

await contract.castVote(encrypted.handles[0], encrypted.handles[1], encrypted.inputProof);
```

## Wagmi/Viem Encoding

When the SDK returns byte arrays and the contract expects `bytes32` and `bytes`, convert with `bytesToHex`.

```ts
await writeContractAsync({
  address: contractAddress,
  abi,
  functionName: "submitBid",
  args: [bytesToHex(encrypted.handles[0]!), bytesToHex(encrypted.inputProof)],
  gas: 15_000_000n,
});
```

## User Decryption

Use when only the authorized user should see the plaintext.

Contract requirement:

```solidity
FHE.allowThis(value);
FHE.allow(value, user);
```

Frontend flow:

1. Read handle from contract.
2. Create or retrieve keypair.
3. Build EIP-712 request.
4. User signs typed data.
5. Call `instance.userDecrypt`.
6. Display plaintext locally.

```ts
const keypair = instance.generateKeypair();
const startTimeStamp = Math.floor(Date.now() / 1000).toString();
const durationDays = "10";
const eip712 = instance.createEIP712(keypair.publicKey, [contractAddress], startTimeStamp, durationDays);
const signature = await signer.signTypedData(
  eip712.domain,
  { UserDecryptRequestVerification: eip712.types.UserDecryptRequestVerification },
  eip712.message,
);

const result = await instance.userDecrypt(
  [{ handle, contractAddress }],
  keypair.privateKey,
  keypair.publicKey,
  signature.replace("0x", ""),
  [contractAddress],
  signer.address,
  startTimeStamp,
  durationDays,
);
```

## Public Decryption

Use when the protocol intentionally reveals a final result.

Contract requirement:

```solidity
FHE.makePubliclyDecryptable(result);
```

Frontend/script:

```ts
const results = await instance.publicDecrypt([handle]);
const clear = results.clearValues[handle];
```

Onchain verification:

```solidity
bytes32[] memory handles = new bytes32[](1);
handles[0] = euint64.unwrap(amount);
FHE.checkSignatures(handles, abi.encode(clearAmount), decryptionProof);
```

## UI State Rules

- Label handle values as "encrypted handle" only in developer/debug views.
- Show "Authorize decryption" before EIP-712 signing.
- Show "Decrypt" only when wallet is connected and a nonzero handle exists.
- Show public results only after contract lifecycle says reveal is requested.
- Never cache plaintext private values in shared server logs.

## Frontend Failure Checklist

If encryption fails:

- contract address mismatch
- user address mismatch
- non-checksummed address
- wrong encrypted type
- missing relayer configuration

If user decryption fails:

- missing `FHE.allow(value, user)`
- wrong contract address in handle pair
- expired EIP-712 authorization
- wrong signer
- bit-length batch too large

If public decryption fails:

- contract never called `FHE.makePubliclyDecryptable`
- wrong handle
- using a local node mode that does not support the requested operation
- trying to public decrypt a value that should be user-decrypted
