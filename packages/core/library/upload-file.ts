import Pinata from '@pinata/sdk';
import assert from 'assert';
import temp from 'temp';
import crypto from 'crypto';
import fs from 'fs/promises';

temp.track();

const { PINATA_API_KEY, PINATA_API_SECRET } = process.env;

assert(PINATA_API_KEY, '`PINATA_API_KEY` is not defined');
assert(PINATA_API_SECRET, '`PINATA_API_SECRET` is not defined');

const pinata = Pinata(PINATA_API_KEY, PINATA_API_SECRET);

export async function uploadFile(file: Buffer): Promise<string> {
  const path = await temp.mkdir('hov-dao');

  const filename = `${path}/${crypto
    .randomBytes(8)
    .toString('hex')}-${Date.now().toString().padStart(15, '0')}`;

  await fs.writeFile(filename, file);

  const { IpfsHash } = await pinata.pinFromFS(filename, {
    pinataMetadata: {
      keyvalues: {
        project: 'HOV DAO',
      },
    } as never,
    pinataOptions: {
      cidVersion: 1,
    },
  });

  return IpfsHash;
}
