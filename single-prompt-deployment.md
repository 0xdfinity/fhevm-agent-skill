# Single-Prompt Deployment

This is the end-to-end automation lane for the video demo.

## Goal

A developer gives an AI agent one natural-language prompt:

```text
Use the FHEVM Agent Skill. Build, test, deploy the confidential voting contract to Sepolia, deploy the frontend to Vercel, and return the live URL.
```

The agent should interpret that prompt as permission to execute the end-to-end workflow. The developer should not have to run commands manually. Internally, the agent runs:

```bash
npm run deploy:demo
```

## Required Local Secrets

Copy `.env.example` to `.env`, then fill:

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

## What The Command Does

1. Runs `npm run compile`.
2. Runs `npm test`.
3. Deploys `ConfidentialVoting` to Sepolia.
4. Generates `deployments/sepolia/confidential-voting.json`.
5. Generates `frontend/confidential-voting-app/deployment.json`.
6. Deploys `frontend/confidential-voting-app` to Vercel.
7. Loads the deployed frontend and verifies the wallet/action buttons bind.
8. Prints the contract address and Vercel URL.

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

- Never commit `.env`.
- Never expose `MNEMONIC`, `INFURA_API_KEY`, or `VERCEL_TOKEN` in logs.
- Never prefix secrets with `NEXT_PUBLIC_`.
- Use preview deployment by default.
- Switch `DEPLOY_FRONTEND_PROD=true` only when the preview is validated.
