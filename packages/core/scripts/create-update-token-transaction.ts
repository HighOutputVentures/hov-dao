/* eslint-disable node/no-missing-import */
import assert from 'assert';
import hardhat, { ethers } from 'hardhat';
import createMultisigTransaction from '../library/create-multisig-transaction';
import { getTokenData, TokenType } from '../library/token-data';

async function main() {
  const { OWNER_ADDRESS, TOKEN_TYPE } = process.env;

  assert(OWNER_ADDRESS, 'owner address is not supplied');

  assert(TOKEN_TYPE, 'token type is not supplied');

  await createMultisigTransaction(
    'updateToken',
    [OWNER_ADDRESS, getTokenData(TOKEN_TYPE.toUpperCase() as TokenType)],
    {
      ethers,
      network: hardhat.network.name,
    }
  );
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
