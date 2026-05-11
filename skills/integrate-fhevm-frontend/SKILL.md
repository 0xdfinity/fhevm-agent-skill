---
name: integrate-fhevm-frontend
description: Build or fix FHEVM frontend integration with fhevmjs or the Zama Relayer SDK, including browser encryption, wallet connection, EIP-712 user decryption, public decryption, and Vercel/runtime validation.
---

# Integrate FHEVM Frontend

Use this skill when the user asks for UI, wallet connection, encryption, decryption, relayer SDK setup, or broken frontend buttons/actions.

## Workflow

1. Load the contract address, ABI, chain ID, and relayer configuration from target-project config.
2. Connect wallet before encryption or user decryption.
3. Create encrypted inputs with the exact contract address and connected user address.
4. Send encrypted handles plus `inputProof` to contract functions.
5. For user decryption, require contract ACL via `FHE.allow(value, user)`, then use EIP-712 signing.
6. For public decryption, require the contract lifecycle to call `FHE.makePubliclyDecryptable`.
7. Keep plaintext private values out of logs, URLs, server actions, analytics, and public storage.
8. Browser-validate the deployed frontend: no module errors, buttons bind, wallet prompt or clear no-wallet message appears.

## CDN Rule

For static browser demos using Zama's CDN UMD bundle, do not named-import the `.umd.cjs` URL as ESM. Load it with a normal script tag and read `globalThis.relayerSDK`. This prevents top-level module failure that makes all buttons inert.

## References

- `../use-fhevm/references/frontend-integration.md`
- `../use-fhevm/references/troubleshooting.md`
- `../use-fhevm/references/anti-patterns.md`

## Assets

- `../../assets/templates/fhevm-client.ts`
- `../../assets/templates/frontend-hooks.ts`
- `../../assets/examples/*/frontend/`
