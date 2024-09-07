import type { Product } from '@ecommerce/database';
import React from 'react';

export function Products({ title, products }: { title: string, products: Product[] }) {
    return (
        <div className="container mx-auto px-4 py-8">
            <h2 className="text-3xl font-bold mb-6">{title}</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {products.map(product => (
                    <div
                        className="bg-white p-4 shadow-lg rounded-lg hover:shadow-xl transition-shadow duration-300"
                        key={product.id}
                    >
                        <img
                            alt={product.name}
                            className="w-full h-48 object-cover rounded-md mb-4"
                            src="https://via.placeholder.com/300x200"
                        />
                        <h3 className="text-xl font-semibold mb-2">{product.name}</h3>
                        <p className="text-gray-700 mb-4">${product.price}</p>
                        <button className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600 transition-colors duration-300" type='button'>
                            Add to Cart
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
}
