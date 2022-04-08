## Deploy the `Membership` contract
```bash
env $(cat .env.secret) env $(cat .env) npx hardhat run --network rinkeby scripts/deploy-membership-contract.ts
```

## Retrieve token power
```bash
env $(cat .env.secret) env $(cat .env) OWNER_ADDRESS=0x3409cE549D0FD4d973F0b5D304ce7deaee6cc092 npx hardhat run --network rinkeby scripts/get-token-power.ts
```
