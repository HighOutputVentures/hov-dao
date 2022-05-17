import Safe from '@gnosis.pm/safe-core-sdk';
import EthersAdapter from '@gnosis.pm/safe-ethers-lib';
import SafeServiceClient from '@gnosis.pm/safe-service-client';
import assert from 'assert';
import { readFile } from 'fs/promises';
import path from 'path';

const GNOSIS_SAFE_TRANSACTION_SERVICE_API_BASE_URLS: Record<string, string> = {
  rinkeby: 'https://safe-transaction.rinkeby.gnosis.io/',
};

export default async function (
  functionFragment: string,
  values: any[],
  dependencies: {
    ethers: any;
    network: string;
  }
) {
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

  const ethAdapter = new EthersAdapter({
    ethers: dependencies.ethers,
    signer: dependencies.ethers.provider.getSigner(),
  });

  const safe = await Safe.create({
    ethAdapter,
    safeAddress: GNOSIS_SAFE_CONTRACT_ADDRESS,
  });

  const inter = new dependencies.ethers.utils.Interface(
    JSON.parse(
      await readFile(path.resolve(__dirname, '../data/abi/Membership.json'), {
        encoding: 'utf8',
      })
    )
  );

  const transaction = await safe.createTransaction([
    {
      to: MEMBERSHIP_CONTRACT_ADDRESS,
      value: '0',
      data: inter.encodeFunctionData(functionFragment, values),
    },
  ]);

  await safe.signTransaction(transaction);

  const service = new SafeServiceClient({
    txServiceUrl:
      GNOSIS_SAFE_TRANSACTION_SERVICE_API_BASE_URLS[dependencies.network],
    ethAdapter,
  });

  const params = {
    safeAddress: GNOSIS_SAFE_CONTRACT_ADDRESS,
    senderAddress: await dependencies.ethers.provider.getSigner().getAddress(),
    safeTransaction: transaction,
    safeTxHash: await safe.getTransactionHash(transaction),
  };

  await service.proposeTransaction(params);
}
