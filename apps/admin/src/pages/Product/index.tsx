import { useQuery } from '@tanstack/react-query';
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { listProducts } from '../../services/product-service'; // Update to your actual service path

export function Product() {
  const [page, setPage] = useState(1);
  const pageSize = 20

  const { data: products, isLoading, isError, error } = useQuery({
    queryKey: ['list-products', page, pageSize],
    queryFn: () => listProducts(page, pageSize),
    enabled: true
  });

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  };

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Product List</h1>
      <Link to="products/add">
        <button className="bg-blue-500 text-white px-4 py-2 rounded shadow hover:bg-blue-600" type='button'>
          Add Product
        </button>
      </Link>
      <div className="mt-6 overflow-x-auto">
        {isLoading ? (
          <p>Loading...</p>
        ) : isError ? (
          <p>Error: {error.message}</p>
        ) : (
          <>
            <table className="min-w-full bg-white border border-gray-200 rounded shadow-md">
              <thead className="bg-gray-100 text-left">
                <tr>
                  <th className="px-6 py-3 border-b">SN</th>
                  <th className="px-6 py-3 border-b">Name</th>
                  <th className="px-6 py-3 border-b">Description</th>
                  <th className="px-6 py-3 border-b">Price</th>
                  <th className="px-6 py-3 border-b">Quantity</th>
                  <th className="px-6 py-3 border-b">Discount</th>
                  <th className="px-6 py-3 border-b">Category</th>
                  <th className="px-6 py-3 border-b">Actions</th>
                </tr>
              </thead>
              <tbody>
                {products?.data.map((product, i) => (
                  <tr className="border-b hover:bg-gray-50" key={product.id}>
                    <td className="px-6 py-4">{((page - 1) * pageSize) + i + 1}</td>
                    <td className="px-6 py-4">{product.name}</td>
                    <td className="px-6 py-4">{product.description}</td>
                    <td className="px-6 py-4">${product.price.toFixed(2)}</td>
                    <td className="px-6 py-4">{product.quantity}</td>
                    <td className="px-6 py-4">{product.discount}%</td>
                    <td className="px-6 py-4">{product.category.name}</td> {/* Adjust based on your actual data structure */}
                    <td className="px-6 py-4">
                      <Link to={`/products/edit/${product.id}`}>
                        <button className="bg-yellow-500 text-white px-3 py-1 rounded mr-2 hover:bg-yellow-600" type='button'>
                          Edit
                        </button>
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="mt-4 flex justify-between items-center">
              <button
                className="bg-gray-300 text-gray-800 px-4 py-2 rounded hover:bg-gray-400"
                disabled={page === 1}
                onClick={() => { handlePageChange(page - 1); }}
                type='button'
              >
                Previous
              </button>
              <span>Page {page}</span>
              <button
                className="bg-gray-300 text-gray-800 px-4 py-2 rounded hover:bg-gray-400"
                disabled={!products?.hasMore}
                onClick={() => { handlePageChange(page + 1); }}
                type='button'
              >
                Next
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
