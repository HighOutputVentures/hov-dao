/* eslint-disable node/no-missing-import */
import { TokenType } from './type';

export async function generateTokenImage(params: {
  message: string;
  type: TokenType;
}): Promise<Buffer> {
  return Buffer.from([]);
}
