---
name: deploy-fhevm-dapp
description: Deploy Zama FHEVM dApps to localhost or Sepolia and deploy generated frontends, including environment handling, deployment metadata, Vercel flows, FHEVM compatibility checks, and live URL validation.
---

# Deploy FHEVM DApp

Use this skill when the user asks to deploy a confidential contract, publish a frontend, produce a live URL, or record an end-to-end demo.

## Workflow

1. Work in the generated or target dApp repository, not this skill repository.
2. Verify `.env` exists in the target project and includes only required local secrets.
3. Run compile and tests before Sepolia deployment.
4. Deploy contracts using the target deploy script.
5. Write deployment metadata inside the target project only.
6. Build and deploy the target frontend.
7. Validate the hosted frontend in a browser: page loads, module imports succeed, wallet/action buttons bind, SDK is present, no console/runtime errors.
8. Return contract address, frontend URL, network, and validation summary.

## Safety Rules

- Never commit `.env`, `.vercel`, generated `deployments/`, or private keys.
- Never print tokens, mnemonics, private keys, or provider keys.
- Do not pass `VERCEL_TOKEN` or wallet secrets to frontend/public env variables.
- Default to testnets unless the user explicitly confirms mainnet.

## References

- `../use-fhevm/references/deployment-guide.md`
- `../use-fhevm/references/single-prompt-deployment.md`
- `../use-fhevm/references/troubleshooting.md`
- `references/demo-script.md`
- `references/example-prompts.md`
- `references/validation-checklist.md`

## Assets

- `../../assets/examples/*/deploy/`
- `../../assets/templates/deployment-script.ts`
