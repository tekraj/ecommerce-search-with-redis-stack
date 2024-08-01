import { useQuery } from '@tanstack/react-query';
import type { ChangeEvent } from 'react';
import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { Cart } from 'src/assets/icons/cart';
import { Logo } from 'src/assets/logos/logo';
import { elasticSearchProducts } from 'src/services/product.service';
import { useDebouncedCallback } from 'use-debounce';

export function Header() {

    const [keyword, setKeyword] = useState<string>('');
    const [isDropdownOpen, setIsDropdownOpen] = useState<boolean>(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    const { data, refetch } = useQuery({
        queryKey: ['products'],
        queryFn: () => elasticSearchProducts(keyword),
        enabled: false
    });

    const debouncedFetch = useDebouncedCallback(() => {
        void refetch();
    }, 2000);
    const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value.trim();
        setKeyword(value);
        debouncedFetch();
        setIsDropdownOpen(true);

    };
    const handleClickOutside = (event: MouseEvent) => {
        if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
            setIsDropdownOpen(false);
        }
    };

    useEffect(() => {
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);
    return (
        <>
            <header className="bg-gray-300 relative z-20 ">
                <div className="container mx-auto p-4 flex items-center  ">
                    <div className="flex-shrink-0 w-[20%]">
                        <Link to="/">
                            <Logo height={50} width={200} />
                        </Link>
                    </div>

                    <div className="flex-grow  w-[60%] relative">
                        <input
                            className="w-full p-2 rounded border border-gray-600  focus:outline-none focus:border-blue-500"
                            onChange={handleChange} onFocus={() => { setIsDropdownOpen(true) }}
                            placeholder="Search products..."
                            type="text"
                            value={keyword}
                        />
                        {isDropdownOpen ? <div
                            aria-labelledby="searchDropdown"
                            className="absolute z-20 mt-2 w-[100%] bg-white border border-gray-300 rounded-lg shadow-lg"
                            ref={dropdownRef}
                            style={{ top: '32px' }}
                        >
                            <div className="p-2">
                                {data && data.length > 0 ? (
                                    data.map((product) => (
                                        <Link
                                            className="block px-4 py-2 text-gray-800 hover:bg-gray-100"
                                            key={product}
                                            to={`/search/${product}`}
                                        >
                                            {product}
                                        </Link>
                                    ))
                                ) : (
                                    <div className="p-4 text-gray-500">No results found</div>
                                )}
                            </div>
                        </div> : null}
                    </div>

                    <div className="flex-shrink-0 w-[20%] ml-auto text-right">
                        <Link className='inline-block' to="/cart">
                            <Cart />
                        </Link>
                    </div>
                </div>
                <nav className="bg-gray-900">
                    <div className="container mx-auto p-2">
                        <ul className="flex justify-around">
                            <li><Link className="text-gray-300 hover:text-white" to="/">Home</Link></li>
                            <li><Link className="text-gray-300 hover:text-white" to="/products">Products</Link></li>
                            <li><Link className="text-gray-300 hover:text-white" to="/about">About Us</Link></li>
                            <li><Link className="text-gray-300 hover:text-white" to="/contact">Contact</Link></li>
                            <li><Link className="text-gray-300 hover:text-white" to="/cart">Cart</Link></li>
                        </ul>
                    </div>
                </nav>
            </header >

            {
                isDropdownOpen ? <div className="fixed inset-0 bg-black opacity-50 z-10" /> : null
            }
        </>
    );
}

