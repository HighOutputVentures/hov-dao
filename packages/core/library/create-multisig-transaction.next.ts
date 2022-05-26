import Safe from '@gnosis.pm/safe-core-sdk';
import EthersAdapter from '@gnosis.pm/safe-ethers-lib';
import SafeServiceClient from '@gnosis.pm/safe-service-client';
import assert from 'assert';
import { readFile } from 'fs/promises';
import path from 'path';
import hardhat from 'hardhat';

const { ethers } = hardhat;

const { GNOSIS_SAFE_CONTRACT_ADDRESS, MEMBERSHIP_CONTRACT_ADDRESS } =
  process.env;

assert(
  GNOSIS_SAFE_CONTRACT_ADDRESS,
  'Gnosis Safe contract address is not supplied'
);

assert(
  MEMBERSHIP_CONTRACT_ADDRESS,
  'Membership contract address is not supplied'
);

type MetaTransactionData = {
  fragment: string;
  values: any;
};

export async function createMultisigTransaction(
  args: MetaTransactionData | MetaTransactionData[]
) {
  const ethAdapter = new EthersAdapter({
    ethers,
    signer: ethers.provider.getSigner(),
  });

  const safe = await Safe.create({
    ethAdapter,
    safeAddress: GNOSIS_SAFE_CONTRACT_ADDRESS!,
  });

  const inter = new ethers.utils.Interface(
    JSON.parse(
      await readFile(path.resolve(__dirname, '../data/abi/Membership.json'), {
        encoding: 'utf8',
      })
    )
  );

  const transactionData = (args instanceof Array ? args : [args]).map(
    ({ fragment, values }) => ({
      to: MEMBERSHIP_CONTRACT_ADDRESS!,
      value: '0',
      data: inter.encodeFunctionData(fragment, values),
    })
  );

  const transaction = await safe.createTransaction(transactionData);

  await safe.signTransaction(transaction);

  let txServiceUrl = 'https://safe-transaction.rinkeby.gnosis.io/';

  if (hardhat.network.name === 'mainnet') {
    txServiceUrl = 'https://safe-transaction.gnosis.io/';
  }

  const service = new SafeServiceClient({
    txServiceUrl,
    ethAdapter,
  });

  await service.proposeTransaction({
    safeAddress: GNOSIS_SAFE_CONTRACT_ADDRESS!,
    senderAddress: await ethers.provider.getSigner().getAddress(),
    safeTransaction: transaction,
    safeTxHash: await safe.getTransactionHash(transaction),
  });
}
