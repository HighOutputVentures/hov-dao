/* eslint-disable no-unused-vars */
import { ethers } from 'ethers';

export enum TokenType {
  Copper = 'COPPER',
  Iron = 'IRON',
  Silver = 'SILVER',
  Gold = 'GOLD',
  Platinum = 'PLATINUM',
}

const coder = new ethers.utils.AbiCoder();

const data: Record<TokenType, { cid: string; power: number }> = {
  [TokenType.Copper]: {
    cid: 'QmcuZTRpxHhRwpzY27u4ioJKJr9EaPmQMeQzM8cBZyGmyp',
    power: 1,
  },
  [TokenType.Iron]: {
    cid: 'QmbVrQxf4jeB8AcV8o5cKrddcPbUPUsPZ9VAgJHXwAWZiC',
    power: 2,
  },
  [TokenType.Silver]: {
    cid: 'QmbJ8yekN9q4PPgGfgMMRMQHoeDf4W8VSxjQt64o5273tc',
    power: 3,
  },
  [TokenType.Gold]: {
    cid: 'QmNRbEMPdL1KfXnDRvUKNFNW9Yhcmju8E2un7PJK1Jn8VC',
    power: 4,
  },
  [TokenType.Platinum]: {
    cid: 'QmbrqS2RanXcm42TyXGjMSRWRbwJy7g8R6kXzu3NQpm57S',
    power: 5,
  },
};

export function getTokenData(type: TokenType) {
  const { cid, power } = data[type];

  return coder.encode(['string', 'bytes1'], [cid, power]);
}
