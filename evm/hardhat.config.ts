import * as dotenv from 'dotenv';

import { HardhatUserConfig, task } from 'hardhat/config';
import 'hardhat-deploy';
import '@nomiclabs/hardhat-etherscan';
import '@nomiclabs/hardhat-waffle';
import '@typechain/hardhat';
import 'hardhat-gas-reporter';
import 'solidity-coverage';

dotenv.config();

// This is a sample Hardhat task. To learn how to create your own go to
// https://hardhat.org/guides/create-task.html
task('accounts', 'Prints the list of accounts', async (taskArgs, hre) => {
  const accounts = await hre.ethers.getSigners();

  for (const account of accounts) {
    console.log(account.address);
  }
});

// You need to export an object to set up your config
// Go to https://hardhat.org/config/ to learn more

const ALCHEMY_KEY = 'QT3FlqyiDlYGtFSUjkw1xnAVtywiDEDh';
const ALCHEMY_BASE_URL = 'https://eth-mainnet.alchemyapi.io';
const ALCHEMY_API_VERSION = 'v2';

const config: HardhatUserConfig = {
  solidity: {
    compilers: [
      {
        version: '0.8.4',
      },
    ],
  },
  networks: {
    rinkeby: {
      url:
        process.env.ROPSTEN_URL ||
        `${ALCHEMY_BASE_URL}/${ALCHEMY_API_VERSION}/${ALCHEMY_KEY}`,
      accounts:
        process.env.PRIVATE_KEY !== undefined ? [process.env.PRIVATE_KEY] : [],
    },
    hardhat: {
      chainId: 4,
      forking: {
        url: `${ALCHEMY_BASE_URL}/${ALCHEMY_API_VERSION}/${ALCHEMY_KEY}`,
        blockNumber: 14522351,
      },
    },
  },
  gasReporter: {
    enabled: process.env.REPORT_GAS !== undefined,
    currency: 'USD',
  },
  etherscan: {
    apiKey: process.env.ETHERSCAN_API_KEY,
  },
};

export default config;
