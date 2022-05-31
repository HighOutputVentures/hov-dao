import { program } from 'commander';
import path from 'path';
import fs from 'fs/promises';
import Bluebird from 'bluebird';
import { createMultisigTransaction } from '../library/create-multisig-transaction.next';
import { TokenType } from '../library/types';
import { generateTokenAsset } from '../library/generate-token-asset';

const typeToPowerMap = {
  [TokenType.Copper]: 1,
  [TokenType.Iron]: 2,
  [TokenType.Silver]: 3,
  [TokenType.Gold]: 4,
  [TokenType.Platinum]: 5,
};

program
  .requiredOption('-f, --file <file>', 'file')
  .action(async ({ file }: { file: string }) => {
    const owners: {
      address: string;
      message: string;
      tokenType: TokenType;
    }[] = JSON.parse(
      await fs.readFile(path.resolve(process.cwd(), file), 'utf8')
    );

    const data = await Bluebird.map(
      owners,
      async ({ address, message, tokenType }) => {
        const hash = await generateTokenAsset({
          message,
          type: tokenType,
        });

        console.log(`assets generated for ${address}`);

        return {
          fragment: 'updateToken',
          values: [
            address,
            Buffer.concat([
              Buffer.from(hash, 'ascii'),
              Buffer.from([typeToPowerMap[tokenType]]),
            ]),
          ],
        };
      },
      {
        concurrency: 5,
      }
    );

    await createMultisigTransaction(data);
  });

program.parseAsync();
