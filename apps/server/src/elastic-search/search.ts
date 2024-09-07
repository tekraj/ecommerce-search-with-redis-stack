import { matchMostSimilarQuery } from '~/nlp/match-similar-word';

import { esClient, productTagIndexName } from './elastic';

export const elasticSearchProductsTags = async (searchQuery: string) => {
  try {
    const results = await esClient.search({
      index: productTagIndexName,
      body: {
        size: 100, // Return only the first 100 results
        query: {
          multi_match: {
            query: searchQuery,
            fields: ['tags'],
            type: 'best_fields',
            fuzziness: 'AUTO',
            operator: 'AND',
            tie_breaker: 0.3,
            minimum_should_match: '75%',
            boost: 2,
          },
        },
      },
    });
    const tags = (
      results.hits.hits
        .map((h) => {
          return h._source
            ? {
                ...h._source,
              }
            : null;
        })
        .filter((h) => h) as { tags: string }[]
    ).map((h) => h.tags);
    const mostSimilarTags = matchMostSimilarQuery(tags, searchQuery);
    return mostSimilarTags.splice(0, 20);
  } catch (e) {
    console.error(e);
    return [];
  }
};
