import {
  createElasticIndex,
  productIndexName,
  searchProperty,
} from './elastic';

export const createProductElasticIndex = async () => {
  try {
    return createElasticIndex(productIndexName, {
      id: { type: 'integer' },
      name: searchProperty,
      description: searchProperty,
      category: searchProperty,
    });
  } catch (e) {
    console.log(e);
    return false;
  }
};
