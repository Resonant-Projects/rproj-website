import fs from 'node:fs';
import { CORE_SCHEMA, load as loadYaml, mergeTag, timestampTag } from 'js-yaml';

// js-yaml 5 defaults to the YAML 1.2 core schema; keep js-yaml 4 behaviour (timestamps, merge keys).
const CONFIG_SCHEMA = CORE_SCHEMA.withTags([timestampTag, mergeTag]);

const loadConfig = async (configPathOrData: string | object) => {
  if (typeof configPathOrData === 'string') {
    const content = fs.readFileSync(configPathOrData, 'utf8');
    if (configPathOrData.endsWith('.yaml') || configPathOrData.endsWith('.yml')) {
      return loadYaml(content, { schema: CONFIG_SCHEMA });
    }
    return content;
  }

  return configPathOrData;
};

export default loadConfig;
