import { Client, isFullPage, isFullDatabase } from '@notionhq/client';

/**
 * @module
 * Types from the internal Notion JS API, exposed for use in this project.
 */

type Asserts<Function> = Function extends (input: any) => input is infer Type ? Type : never;

export type ClientOptions = NonNullable<ConstructorParameters<typeof Client>[0]>;

// Query parameters for both databases.query (legacy) and dataSources.query (2025-09-03+)
export interface QueryDatabaseParameters {
  database_id: string;
  filter_properties?: string[];
  sorts?: Array<{
    property?: string;
    timestamp?: 'created_time' | 'last_edited_time';
    direction: 'ascending' | 'descending';
  }>;
  filter?: Record<string, unknown>;
  archived?: boolean;
  start_cursor?: string;
  page_size?: number;
}

export type DatabasePropertyConfigResponse = Asserts<typeof isFullDatabase>['properties'][string];

export type PageObjectResponse = Asserts<typeof isFullPage>;
export type PageProperty = PageObjectResponse['properties'][string];
export type EmojiRequest = Extract<PageObjectResponse['icon'], { type: 'emoji' }>['emoji'];

export type RichTextItemResponse = Extract<PageProperty, { type: 'rich_text' }>['rich_text'][number];

export type NotionPageData = Pick<
  PageObjectResponse,
  'icon' | 'cover' | 'archived' | 'in_trash' | 'url' | 'public_url' | 'properties'
> & {
  /**
   * Flattened values for every Notion property, already converted to easy-to-use primitives.
   * Example: { Name: 'My Title', Tags: ['A','B'], Source: 'https://...'}
   */
  flat?: Record<string, unknown>;
};

export type FileObject = { type: 'external'; external: { url: string } } | { type: 'file'; file: { url: string } };
