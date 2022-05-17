/* eslint-disable node/no-missing-import */
import assert from 'assert';
import hardhat, { ethers } from 'hardhat';
import createMultisigTransaction from '../library/create-multisig-transaction';

async function main() {
  const { TOKEN_ID } = process.env;

  assert(TOKEN_ID, 'token id is not supplied');

  await createMultisigTransaction('burn', [parseInt(TOKEN_ID)], {
    ethers,
    network: hardhat.network.name,
  });
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
