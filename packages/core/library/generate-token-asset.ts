import path from 'path';
import fs from 'fs/promises';
import ejs from 'ejs';
import { uploadFile } from './upload-file';
import { TokenType } from './types';

const template = `{
  "name": "<%= name %>",
  "description": "<%= description %>",
  "image": "<%= image %>"
}`;

// const ipfsBaseUrl = 'https://ipfs.fleek.co/ipfs/';

const renderMetadata = ejs.compile(template);

export async function generateTokenAsset(params: {
  message: string;
  type: TokenType;
}): Promise<string> {
  const filename = path.resolve(
    __dirname,
    `../resources/images/${TokenType.Copper}.svg`
  );

  const raw = await fs.readFile(filename, 'utf8');

  const image = Buffer.from(
    raw.replace('ALEXANDER LUIE JHAMES SARITA PBD', params.message),
    'utf8'
  );

  const imageHash = await uploadFile(image);

  const metadata = renderMetadata({
    name: 'HOVX Pass',
    description: 'Membership token for HOVX',
    image: `ipfs://${imageHash}`,
  });

  return uploadFile(Buffer.from(metadata, 'utf8'));
}
