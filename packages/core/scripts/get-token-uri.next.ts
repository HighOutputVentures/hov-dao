import assert from 'assert';
import { program } from 'commander';
import { readFile } from 'fs/promises';
import hardhat from 'hardhat';
import path from 'path';

const { ethers } = hardhat;

const { MEMBERSHIP_CONTRACT_ADDRESS } = process.env;

assert(
  MEMBERSHIP_CONTRACT_ADDRESS,
  'Membership contract address is not supplied'
);

program
  .requiredOption('-t, --token <token>', 'token id')
  .action(async ({ token }: { token: string }) => {
    const abi = JSON.parse(
      await readFile(path.resolve(__dirname, '../abi.json'), {
        encoding: 'utf8',
      })
    );

    const contract = new ethers.Contract(
      MEMBERSHIP_CONTRACT_ADDRESS,
      abi,
      ethers.provider
    );

    console.log(await contract.tokenURI(parseInt(token)));
  });

program.parseAsync();
