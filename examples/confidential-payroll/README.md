# Confidential Payroll Example

Pattern: encrypted per-employee compensation and encrypted accruals.

Use this when a user asks for private salaries, confidential compensation bands, bonus plans, vesting accruals, or HR finance systems.

Agent rules:

- Keep employee addresses and payroll events public unless the user explicitly designs a private registry.
- Store salary and accrued amount as `euint64`.
- Give each employee ACL access to their own salary and accrued handles.
- Give the payroll contract `FHE.allowThis` on every persistent encrypted value.
- Do not emit salary amounts, decrypted amounts, or encrypted handles as events unless the user wants indexable handles.
- Use public decryption only for aggregate disclosures, never individual salary disclosure.

Files:

- `contracts/ConfidentialPayroll.sol`
- `test/ConfidentialPayroll.ts`
- `deploy/deploy.ts`
- `frontend/payrollClient.ts`

