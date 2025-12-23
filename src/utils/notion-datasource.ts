import type { Client } from '@notionhq/client';

/**
 * Cache for resolved data source IDs to minimize API calls.
 * Maps database_id -> data_source_id
 */
const dataSourceCache = new Map<string, string>();

/**
 * Resolves a data_source_id from a database_id using the Notion API 2025-09-03.
 *
 * The new API version introduces multi-source databases where each database
 * can have multiple data sources. This function retrieves the first (primary)
 * data source ID for use with dataSources.query() and page creation.
 *
 * For backwards compatibility with databases that haven't been migrated yet,
 * this function falls back to returning the original database_id if no
 * data_sources array is found. A warning is logged in this case.
 *
 * @param client - Notion client instance (must use notionVersion: '2025-09-03')
 * @param databaseId - The database ID to resolve
 * @returns The data_source_id for querying, or database_id as fallback
 */
export async function resolveDataSourceId(client: Client, databaseId: string): Promise<string> {
  // Check cache first
  const cached = dataSourceCache.get(databaseId);
  if (cached) return cached;

  // Retrieve database to get data_sources array
  const db = await client.databases.retrieve({ database_id: databaseId });

  // Extract the first data source ID
  // The data_sources array is available in API version 2025-09-03+
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const dataSources = (db as any).data_sources;
  const dataSourceId = dataSources?.[0]?.id;

  if (!dataSourceId) {
    // Fallback to database_id for backwards compatibility
    // This handles databases that haven't been migrated yet
    console.warn(`No data_sources found for database ${databaseId}, falling back to database_id`);
    dataSourceCache.set(databaseId, databaseId);
    return databaseId;
  }

  // Cache and return
  dataSourceCache.set(databaseId, dataSourceId);
  return dataSourceId;
}

/**
 * Clears the data source cache. Useful for testing or when databases are updated.
 */
export function clearDataSourceCache(): void {
  dataSourceCache.clear();
}
