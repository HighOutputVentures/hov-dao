/* eslint-disable node/no-missing-import */
import { TokenType } from './type';
import path from 'path';
import fs from 'fs/promises';

export async function generateTokenImage(params: {
  message: string;
  type: TokenType;
}): Promise<Buffer> {
  const basePath = '../resources/images';
  let imagePath = '';

  if (params.type === TokenType.Copper)
    imagePath = path.resolve(__dirname, `${basePath}/copper.svg`);

  if (params.type === TokenType.Gold)
    imagePath = path.resolve(__dirname, `${basePath}/gold.svg`);

  if (params.type === TokenType.Iron)
    imagePath = path.resolve(__dirname, `${basePath}/iron.svg`);

  if (params.type === TokenType.Platinum)
    imagePath = path.resolve(__dirname, `${basePath}/platinum.svg`);

  if (params.type === TokenType.Silver)
    imagePath = path.resolve(__dirname, `${basePath}/silver.svg`);

  const buffer = await fs.readFile(imagePath);

  const output = buffer.toString().replace('LORMEISTER', params.message);

  return Buffer.from(output);
}
