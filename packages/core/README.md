## Deploy the `Membership` contract
```bash
env $(cat .env.secret) env $(cat .env) npx hardhat run --network rinkeby scripts/deploy-membership-contract.ts
```

## Retrieve token power
```bash
env $(cat .env.secret) env $(cat .env) OWNER_ADDRESS=0x3409cE549D0FD4d973F0b5D304ce7deaee6cc092 npx hardhat run --network rinkeby scripts/get-token-power.ts
```

## Retrieve token URI
```bash
env $(cat .env.secret) env $(cat .env) TOKEN_ID=1 npx hardhat run --network rinkeby scripts/get-token-uri.ts
```


## Create `mint` transaction
```bash
env $(cat .env.secret) env $(cat .env) OWNER_ADDRESS=0x3409cE549D0FD4d973F0b5D304ce7deaee6cc092 TOKEN_TYPE=gold npx hardhat run --network rinkeby scripts/create-mint-transaction.ts
```

## Create `updateToken` transaction
```bash
env $(cat .env.secret) env $(cat .env) OWNER_ADDRESS=0x1fc95137c0849d5d91cfc9d18a376111aa7c9e6f TOKEN_TYPE=copper npx hardhat run --network rinkeby scripts/create-update-token-transaction.ts
```
