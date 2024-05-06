import natural from 'natural';

export const tokenize = (text: string): string[] => {
  return text.toLowerCase().split(/\s+/);
};

export const computeTF = (tokens: string[]): Record<string, number> => {
  const totalCount = tokens.length;
  const counts = tokens.reduce<Record<string, number>>((acc, token) => {
    acc[token] = (acc[token] || 0) + 1;
    return acc;
  }, {});
  return Object.fromEntries(
    Object.entries(counts).map(([token, count]) => [token, count / totalCount]),
  );
};

export const computeIDF = (corpus: string[][], token: string): number => {
  const documentCount = corpus.filter((doc) => doc.includes(token)).length;
  return Math.log(corpus.length / documentCount + 1);
};

export const matchMostSimilarQuery = (
  productTags: string[],
  searchQuery: string,
) => {
  const searchTokens = tokenize(searchQuery);

  const productTokens = productTags.map((tag) => tokenize(tag));

  const tfSearch = computeTF(searchTokens);

  const idf: Record<string, number> = Object.fromEntries(
    searchTokens.map((token) => [token, computeIDF(productTokens, token)]),
  );

  const tfidfSearch = Object.fromEntries(
    Object.entries(tfSearch).map(([token, tf]) => [
      token,
      tf * (idf[token] || 0),
    ]),
  );

  return Array.from(
    new Set(
      productTags
        .map((tag) => {
          const tfProduct = computeTF(tokenize(tag));
          const tfidfProduct = Object.fromEntries(
            Object.entries(tfProduct).map(([token, tf]) => [
              token,
              tf * (idf[token] || 0),
            ]),
          );
          const similarity = Object.keys(tfidfSearch).reduce(
            (acc, token) =>
              acc + (tfidfSearch[token] || 0) * (tfidfProduct[token] || 0),
            0,
          );
          return { similarity, tag };
        })
        .sort((a, b) => b.similarity - a.similarity)
        .map((t) => t.tag),
    ),
  );
};
