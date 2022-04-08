import R from 'ramda';
import { ethers } from 'hardhat';

const coder = new ethers.utils.AbiCoder();

async function main() {
  const types = [
    {
      name: 'platinum',
      cid: 'QmbrqS2RanXcm42TyXGjMSRWRbwJy7g8R6kXzu3NQpm57S',
      power: 5,
    },
    {
      name: 'gold',
      cid: 'QmNRbEMPdL1KfXnDRvUKNFNW9Yhcmju8E2un7PJK1Jn8VC',
      power: 4,
    },
    {
      name: 'silver',
      cid: 'QmbJ8yekN9q4PPgGfgMMRMQHoeDf4W8VSxjQt64o5273tc',
      power: 3,
    },
    {
      name: 'iron',
      cid: 'QmbVrQxf4jeB8AcV8o5cKrddcPbUPUsPZ9VAgJHXwAWZiC',
      power: 2,
    },
    {
      name: 'copper',
      cid: 'QmcuZTRpxHhRwpzY27u4ioJKJr9EaPmQMeQzM8cBZyGmyp',
      power: 1,
    },
  ];

  console.log(
    R.map(({ name, cid, power }) => {
      return `${name}: ${coder.encode(['string', 'bytes1'], [cid, power])}`;
    }, types).join('\n')
  );
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
