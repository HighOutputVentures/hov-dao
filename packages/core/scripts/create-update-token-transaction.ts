import { program } from 'commander';
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
  .requiredOption('-o, --owner <owner>', 'owner address')
  .requiredOption('-m, --message <message>', 'message')
  .option('-t, --type <type>', 'token type', 'copper')
  .action(
    async ({
      owner,
      type,
      message,
    }: {
      owner: string;
      type: TokenType;
      message: string;
    }) => {
      const hash = await generateTokenAsset({
        message,
        type,
      });

      await createMultisigTransaction({
        fragment: 'updateToken',
        values: [
          owner,
          Buffer.concat([
            Buffer.from(hash, 'ascii'),
            Buffer.from([typeToPowerMap[type]]),
          ]),
        ],
      });
    }
  );

program.parseAsync();
