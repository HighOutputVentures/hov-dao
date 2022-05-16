/* eslint-disable node/no-missing-import */
import { generateTokenImage } from './generate-token-image';
import faker from '@faker-js/faker';
import { TokenType } from './type';
import { expect } from 'chai';

describe('generateTokenImage', () => {
  it('should generate token image', async function () {
    const message = faker.git.commitSha();
    const image = await generateTokenImage({
      message,
      type: TokenType.Copper,
    });
    const output = image.toString();

    expect(output).contains(message);
  });
});
