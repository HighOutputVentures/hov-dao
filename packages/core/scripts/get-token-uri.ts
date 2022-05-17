import assert from 'assert';
import { readFile } from 'fs/promises';
import { ethers } from 'hardhat';
import path from 'path';

async function main() {
  const { MEMBERSHIP_CONTRACT_ADDRESS, TOKEN_ID } = process.env;

  assert(
    MEMBERSHIP_CONTRACT_ADDRESS,
    'Membership contract address is not supplied'
  );

  assert(TOKEN_ID, 'token ID is not supplied');

  const abi = JSON.parse(
    await readFile(path.resolve(__dirname, '../abi.json'), { encoding: 'utf8' })
  );

  const contract = new ethers.Contract(
    MEMBERSHIP_CONTRACT_ADDRESS,
    abi,
    ethers.provider
  );

  console.log(await contract.tokenURI(parseInt(TOKEN_ID)));
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
