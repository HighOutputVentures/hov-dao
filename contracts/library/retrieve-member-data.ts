/* eslint-disable camelcase */
import { Client } from '@notionhq/client';
import R from 'ramda';
// Initializing a client
const notion = new Client({
  auth: 'secret_GMMqm2fXx1NJeeQdc7Uvrf4zMmcEaDdrAeETt5sbIWV',
});

export async function retrieveMemberData() {
  const response = await notion.databases.query({
    database_id: 'd36dff86bad840cb95f8b65c52c312e1',
    sorts: [
      {
        property: 'Name',
        direction: 'ascending',
      },
    ],
  });

  return (
    R.map((result: Record<string, unknown>) => {
      const property = result.properties as {
        Name: {
          title: { plain_text: string }[];
        };

        'ETH Address': {
          rich_text: { plain_text: string }[];
        };
      };

      const name = property.Name.title[0].plain_text;

      const address = property['ETH Address'].rich_text[0].plain_text;

      return {
        name,
        address,
      };
    }, response.results) || []
  );
}
