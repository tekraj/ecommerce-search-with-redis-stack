import { Client } from '@elastic/elasticsearch';
import type {
  MappingProperty,
  PropertyName,
} from '@elastic/elasticsearch/lib/api/types';

import { env } from '../env.mjs';

export const esClient = new Client({
  node: `${env.ELASTIC_SEARCH_URL}:${env.ELASTIC_SEARCH_PORT}`,
});
export const searchProperty: MappingProperty = {
  type: 'text',
  analyzer: 'autocomplete',
  search_analyzer: 'standard',
};
export const productIndexName = 'products';
export const createElasticIndex = async (
  indexName: string,
  settings: Record<PropertyName, MappingProperty>,
) => {
  try {
    await esClient.indices.create({
      index: indexName,
    });
    await esClient.indices.putSettings({
      index: indexName,
      body: {
        settings: {
          max_ngram_diff: 19,
          analysis: {
            filter: {
              autocomplete_filter: {
                type: 'ngram',
                min_gram: 1,
                max_gram: 20,
              },
            },
            analyzer: {
              autocomplete: {
                filter: ['lowercase', 'autocomplete_filter'],
                type: 'custom',
                tokenizer: 'standard',
              },
            },
          },
          number_of_replicas: 1,
        },
      },
    });
    await esClient.indices.putMapping({
      index: indexName,
      body: {
        properties: settings,
      },
    });
    return true;
  } catch (e) {
    return null;
  }
};
