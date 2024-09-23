import React from 'react';
import Slider from 'react-slick';
import type { ProductWithImages } from 'src/types/index';
import { getImageURL } from 'src/services/api';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';

export function Products({ title, products }: { title: string, products: ProductWithImages[] }) {
    const settings = {
        dots: false,
        infinite: true,
        speed: 500,
        slidesToShow: 1,
        slidesToScroll: 1,
    };

    return (
        <div className="container mx-auto px-4 py-8">
            <h2 className="text-3xl font-bold mb-6 text-center">{title}</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {products.map(product => (
                    <div
                        className="bg-white p-4 shadow-lg rounded-lg hover:shadow-xl transition-shadow duration-300"
                        key={product.id}
                    >
                        <Slider {...settings}>
                            {product.images.map((img) => (
                                <div key={img.id}>
                                    <img
                                        alt={product.name}
                                        className="w-full h-48 object-cover rounded-md"
                                        src={getImageURL(img.url)}
                                    />
                                </div>
                            ))}
                        </Slider>

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
