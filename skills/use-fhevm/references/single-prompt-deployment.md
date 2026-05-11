# Single-Prompt Deployment

This is the end-to-end automation protocol for agents using this skill inside a generated or target dApp project.

## Goal

A developer gives an AI agent one natural-language prompt:

```text
Use the FHEVM Agent Skill. Build, test, deploy the confidential voting contract to Sepolia, deploy the frontend to Vercel, and return the live URL.
```

The agent should interpret that prompt as permission to execute the end-to-end workflow in the target project. The developer should not have to run commands manually.

## Required Local Secrets

Copy the target project's `.env.example` to `.env`, then fill:

```bash
MNEMONIC=
INFURA_API_KEY=
VERCEL_TOKEN=
```

Optional:

```bash
CONTRACT_NETWORK=sepolia
CONFIDENTIAL_VOTING_CANDIDATE_COUNT=3
DEPLOY_FRONTEND_PROD=false
```

## What The Agent Does

1. Creates or updates the target dApp project from the selected recipe.
2. Generates contracts, tests, deploy scripts, frontend integration, and frontend app code.
3. Runs compile checks.
4. Runs confidential workflow tests.
5. Deploys the contract to Sepolia.
6. Writes deployment metadata inside the target project only.
7. Deploys the target frontend to Vercel or the requested host.
8. Loads the deployed frontend and verifies wallet/action buttons bind.
9. Returns the contract address, frontend URL, and validation summary.

## Expected Final Agent Output

```text
FHEVM demo deployed.

Contract: 0x...
Frontend: https://...

Validation:
- compile passed
- tests passed
- Sepolia contract deployed
- Vercel frontend deployed
- frontend buttons verified on the deployed URL
```

## Safety Rules

- Generated dApps belong in the user's target project, not in this skill repository.
- Never commit `.env`.
- Never expose `MNEMONIC`, `INFURA_API_KEY`, or `VERCEL_TOKEN` in logs.
- Never prefix secrets with `NEXT_PUBLIC_`.
- Use preview deployment by default.
- Switch `DEPLOY_FRONTEND_PROD=true` only when the preview is validated.
