## Deploy the `Membership` contract
```bash
env $(cat .env.secret) env $(cat .env) npx hardhat run --network rinkeby scripts/deploy-membership-contract.ts
```

## Retrieve token power
```bash
env $(cat .env.secret) env $(cat .env) OWNER_ADDRESS=0x3409cE549D0FD4d973F0b5D304ce7deaee6cc092 npx hardhat run --network rinkeby scripts/get-token-power.ts
```

## Create `mint` transaction
```bash
env $(cat .env.secret) env $(cat .env) OWNER_ADDRESS=0x04820dbFde040AeD112D4D1028E018219C5203ba TOKEN_TYPE=gold npx hardhat run --network rinkeby scripts/create-mint-transaction.ts
```
