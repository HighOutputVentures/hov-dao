import { program } from 'commander';
import { createMultisigTransaction } from '../library/create-multisig-transaction.next';

program
  .requiredOption('-t, --token <token>', 'token ID')
  .action(async ({ token }: { token: string }) => {
    await createMultisigTransaction({
      fragment: 'burn',
      values: [parseInt(token)],
    });
  });

program.parseAsync();
