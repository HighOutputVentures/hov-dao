import path from 'path';
import { createCanvas, loadImage } from 'canvas';
import ejs from 'ejs';
import { TokenType } from './types';
import { uploadFile } from './upload-file';

const renderMetadata = ejs.compile(`{
  "name": "<%= name %>",
  "description": "<%= description %>",
  "image": "<%= image %>"
}`);

export async function generateTokenAsset(params: {
  message: string;
  type: TokenType;
}) {
  const canvas = createCanvas(1920, 1920, 'svg');

  const ctx = canvas.getContext('2d');

  ctx.drawImage(
    await loadImage(
      path.resolve(__dirname, `../resources/images/${params.type}.svg`)
    ),
    0,
    0
  );

  ctx.font = 'bold 32px aleo';
  ctx.translate(980, 1036);
  ctx.textAlign = 'center';
  ctx.fillStyle = '#ffffff';
  ctx.rotate((-15 * Math.PI) / 180);
  ctx.fillText(params.message.split('').join(' '), 0, 0);

  const image = canvas.toBuffer('image/png', {
    compressionLevel: 2,
  });

  const hash = await uploadFile(image);

  const metadata = renderMetadata({
    name: 'HOVX Pass',
    description: 'Membership token for HOVX',
    image: `ipfs://${hash}`,
  });

  return uploadFile(Buffer.from(metadata, 'utf8'));
}
