#!/usr/bin/env node

import fs from 'node:fs/promises';
import path from 'node:path';

import { Client } from '@notionhq/client';
import { config as loadDotenv } from 'dotenv';

const CACHE_FILE_PATH = path.resolve(process.cwd(), 'src/content/resources-cache.json');

const ALLOWED_STATUS = new Set(['Needs Review', 'Writing', 'Needs Update', 'Up-to-Date']);
const ALLOWED_LENGTH = new Set(['Short', 'Medium', 'Long']);
const ALLOWED_SKILL_LEVEL = new Set(['Beginner', 'Intermediate', 'Advanced', 'Any']);

const loadEnv = () => {
  loadDotenv();
  loadDotenv({ path: '.env.development.local', override: true });
  loadDotenv({ path: '.env.local', override: true });
};

const isString = value => typeof value === 'string' && value.trim().length > 0;

const toText = value => {
  if (!Array.isArray(value)) {
    return '';
  }

  return value
    .map(item => {
      if (!item || typeof item !== 'object') {
        return '';
      }
      return typeof item.plain_text === 'string' ? item.plain_text : '';
    })
    .join('')
    .trim();
};

const toDateValue = value => {
  if (!value || typeof value !== 'object') {
    return undefined;
  }

  const date = value;
  if (typeof date.start === 'string' && date.start.trim()) {
    return date.start;
  }

  return undefined;
};

const toUrlValue = value => {
  if (!isString(value)) {
    return undefined;
  }

  try {
    const url = new URL(value.trim());
    return url.toString();
  } catch {
    return undefined;
  }
};

const normalizeStringArray = value => {
  if (Array.isArray(value)) {
    return value.map(item => String(item).trim()).filter(Boolean);
  }

  if (isString(value)) {
    return [value.trim()];
  }

  return undefined;
};

const transformProperty = property => {
  if (!property || typeof property !== 'object') {
    return undefined;
  }

  switch (property.type) {
    case 'title':
      return toText(property.title);
    case 'rich_text':
      return toText(property.rich_text);
    case 'status':
      return property.status?.name ?? undefined;
    case 'select':
      return property.select?.name ?? undefined;
    case 'multi_select':
      return Array.isArray(property.multi_select)
        ? property.multi_select.map(option => option?.name).filter(Boolean)
        : [];
    case 'url':
      return toUrlValue(property.url);
    case 'checkbox':
      return Boolean(property.checkbox);
    case 'number':
      return typeof property.number === 'number' ? property.number : undefined;
    case 'date':
      return toDateValue(property.date);
    case 'email':
      return isString(property.email) ? property.email.trim() : undefined;
    case 'phone_number':
      return isString(property.phone_number) ? property.phone_number.trim() : undefined;
    case 'created_time':
      return isString(property.created_time) ? property.created_time : undefined;
    case 'last_edited_time':
      return isString(property.last_edited_time) ? property.last_edited_time : undefined;
    default:
      return undefined;
  }
};

const sanitizeKnownFields = transformed => {
  const data = { ...transformed };

  if (isString(data.Name)) {
    data.Name = data.Name.trim();
  }

  data.Source = toUrlValue(data.Source);
  data['User Defined URL'] = toUrlValue(data['User Defined URL']);

  data.Category = normalizeStringArray(data.Category);
  data.Type = normalizeStringArray(data.Type);
  data.Tags = normalizeStringArray(data.Tags);
  data.Keywords = normalizeStringArray(data.Keywords);

  if (!ALLOWED_STATUS.has(String(data.Status))) {
    delete data.Status;
  }

  if (!ALLOWED_LENGTH.has(String(data.Length))) {
    delete data.Length;
  }

  if (!ALLOWED_SKILL_LEVEL.has(String(data['Skill Level']))) {
    delete data['Skill Level'];
  }

  if (!isString(data['AI summary'])) {
    delete data['AI summary'];
  }

  if (typeof data.Favorite !== 'boolean') {
    delete data.Favorite;
  }

  if (!isString(data['Last Updated'])) {
    delete data['Last Updated'];
  }

  return data;
};

const transformPageToCacheEntry = page => {
  const properties = page.properties && typeof page.properties === 'object' ? page.properties : {};
  const transformed = {};

  for (const [name, property] of Object.entries(properties)) {
    const value = transformProperty(property);
    if (value !== undefined && value !== null && value !== '') {
      transformed[name] = value;
    }
  }

  const sanitized = sanitizeKnownFields(transformed);

  const payload = {
    icon: page.icon ?? null,
    cover: page.cover ?? null,
    archived: Boolean(page.archived),
    in_trash: Boolean(page.in_trash),
    url: isString(page.url) ? page.url : '',
    public_url: isString(page.public_url) ? page.public_url : null,
    properties,
    ...sanitized,
    flat: transformed,
  };

  return {
    id: page.id,
    data: payload,
  };
};

const byNameThenId = (a, b) => {
  const nameA = isString(a.data?.Name) ? a.data.Name.trim().toLowerCase() : '';
  const nameB = isString(b.data?.Name) ? b.data.Name.trim().toLowerCase() : '';

  if (nameA !== nameB) {
    return nameA.localeCompare(nameB);
  }

  return String(a.id).localeCompare(String(b.id));
};

const main = async () => {
  loadEnv();

  const token = process.env.NOTION_TOKEN;
  const databaseId = process.env.NOTION_RR_RESOURCES_ID;

  if (!isString(token)) {
    console.error('Missing NOTION_TOKEN. Set it in your environment before refreshing resources cache.');
    process.exit(1);
  }

  if (!isString(databaseId)) {
    console.error('Missing NOTION_RR_RESOURCES_ID. Set it in your environment before refreshing resources cache.');
    process.exit(1);
  }

  const notion = new Client({
    auth: token,
    notionVersion: '2025-09-03',
  });

  let dataSourceId = databaseId;
  const database = await notion.databases.retrieve({ database_id: databaseId });
  const dataSources = Array.isArray(database.data_sources) ? database.data_sources : [];

  if (dataSources.length > 0 && isString(dataSources[0]?.id)) {
    dataSourceId = dataSources[0].id;
  } else {
    console.warn('No data_sources found for the configured database. Falling back to database ID.');
  }

  const entries = [];
  let nextCursor = undefined;

  do {
    const response = await notion.dataSources.query({
      data_source_id: dataSourceId,
      filter: {
        property: 'Status',
        status: { equals: 'Up-to-Date' },
      },
      page_size: 100,
      start_cursor: nextCursor,
    });

    for (const result of response.results) {
      if (result.object === 'page') {
        entries.push(transformPageToCacheEntry(result));
      }
    }

    nextCursor = response.has_more && response.next_cursor ? response.next_cursor : undefined;
  } while (nextCursor);

  if (entries.length === 0) {
    console.error('No up-to-date resources were returned from Notion. Cache refresh aborted.');
    process.exit(1);
  }

  entries.sort(byNameThenId);

  const output = `${JSON.stringify(entries, null, 2)}\n`;
  await fs.writeFile(CACHE_FILE_PATH, output, 'utf8');

  console.log(`Wrote ${entries.length} resources to ${CACHE_FILE_PATH}`);
};

main().catch(error => {
  console.error(`Failed to refresh resources cache: ${error instanceof Error ? error.message : String(error)}`);
  process.exit(1);
});
