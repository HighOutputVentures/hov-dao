/* eslint-disable node/no-missing-import */
import { expect } from 'chai';
import { retrieveMemberData } from './retrieve-member-data';
import sinon from 'sinon';
import { Client } from '@notionhq/client';
import faker from '@faker-js/faker';
import R from 'ramda';

describe('retrieveMemberData', () => {
  it('should retrieve member datas', async function () {
    const name = `${faker.name.firstName()} ${faker.name.lastName()}`;
    const ethereumAddress = faker.finance.ethereumAddress();

    sinon.stub(Client.prototype, 'request').resolves({
      results: [
        {
          properties: {
            Name: {
              title: [
                {
                  plain_text: name,
                },
              ],
            },

            'ETH Address': {
              rich_text: [
                {
                  plain_text: ethereumAddress,
                },
              ],
            },
          },
        },
      ],
    });

    const memberDatas = await retrieveMemberData();

    expect(memberDatas).to.have.length.greaterThan(0);
    expect(R.head(memberDatas)).to.deep.equal({
      name,
      address: ethereumAddress,
    });
  });
});
