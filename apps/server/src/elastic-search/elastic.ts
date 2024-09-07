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
export const productTagIndexName = 'product-tags';

export type ElasticSchemaIndex = {
  index: {
    _index: string;
    _id: number | string;
  };
};
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
export const deleteElasticIndex = async (indexName: string) => {
  try {
    const response = await esClient.indices.delete({
      index: indexName,
    });
    console.log(`Index ${indexName} deleted successfully`, response);
    return response;
  } catch (error) {
    console.error(`Error deleting index ${indexName}:`, error);
    return null;
  }
};
