import { program } from 'commander';
import hardhat from 'hardhat';
import { TokenType } from '../library/types';
import { generateTokenAsset } from '../library/generate-token-asset';

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
      console.log(owner, type, message);
      console.log(hardhat.network.name);

      const hash = await generateTokenAsset({
        message,
        type,
      });

      console.log(hash);
    }
  );

program.parse();
