import {
  createElasticIndex,
  deleteElasticIndex,
  productIndexName,
  productTagIndexName,
  searchProperty,
} from './elastic';

export const createProductTagsIndex = async () => {
  try {
    await deleteElasticIndex(productTagIndexName);
    await createElasticIndex(productTagIndexName, {
      frequency: { type: 'integer' },
      tags: searchProperty,
      createdAt: { type: 'date' },
    });
    return true;
  } catch (e) {
    return false;
  }
};

export const createProductsIndex = async () => {
  try {
    await deleteElasticIndex(productIndexName);
    await createElasticIndex(productIndexName, {
      id: { type: 'integer' },
      name: searchProperty,
      url: { type: 'keyword' },
      description: searchProperty,
      price: { type: 'float' },
      quantity: { type: 'integer' },
      discount: { type: 'float' },
      tags: { type: 'text', index: true },
      categoryId: { type: 'integer' },
      categoryName: { type: 'keyword' },
      images: {
        type: 'nested',
        properties: {
          url: { type: 'keyword' },
          description: searchProperty,
        },
      },
      createdAt: { type: 'date' },
      updatedAt: { type: 'date' },
    });
    return true;
  } catch (e) {
    return false;
  }
};
