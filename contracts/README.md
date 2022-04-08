## Deploy the `Membership` contract
```bash
env $(cat .env) GNOSIS_SAFE_CONTRACT_ADDRESS=0xa73a87911B766fC1240cFD58f82E60e2434dBf3c npx hardhat run --network rinkeby scripts/deploy-membership-contract.ts
```

## Retrieve token power
```bash
env $(cat .env) OWNER_ADDRESS=0x3409cE549D0FD4d973F0b5D304ce7deaee6cc092 npx hardhat run --network rinkeby scripts/get-token-power.ts
```