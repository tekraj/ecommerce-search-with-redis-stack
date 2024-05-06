import {
  createElasticIndex,
  productIndexName,
  searchProperty,
} from './elastic';

export const createProductElasticIndex = async () => {
  try {
    await createElasticIndex(productIndexName, {
      id: { type: 'integer' },
      name: searchProperty,
      description: searchProperty,
      category: searchProperty,
      tags: searchProperty,
    });
    return true;
  } catch (e) {
    console.log(e);
    return false;
  }
};
