import assert from 'assert';
import { readFile } from 'fs/promises';
import { ethers } from 'hardhat';
import path from 'path';

async function main() {
  const { MEMBERSHIP_CONTRACT_ADDRESS, OWNER_ADDRESS } = process.env;

  assert(
    MEMBERSHIP_CONTRACT_ADDRESS,
    'Membership contract address is not supplied'
  );

  assert(OWNER_ADDRESS, 'Owner address is not supplied');

  const abi = JSON.parse(
    await readFile(path.resolve(__dirname, '../abi.json'), { encoding: 'utf8' })
  );

  const contract = new ethers.Contract(
    MEMBERSHIP_CONTRACT_ADDRESS,
    abi,
    ethers.provider
  );

  console.log(await contract.tokenPower(OWNER_ADDRESS));
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
