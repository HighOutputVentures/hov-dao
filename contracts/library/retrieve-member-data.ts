/* eslint-disable camelcase */
import { Client } from '@notionhq/client';
import R from 'ramda';
// Initializing a client
const notion = new Client({
  auth: process.env.NOTION_TOKEN,
});

export async function retrieveMemberData() {
  const response = await notion.databases.query({
    database_id: process.env.NOTION_DATABASE_ID as never,
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
