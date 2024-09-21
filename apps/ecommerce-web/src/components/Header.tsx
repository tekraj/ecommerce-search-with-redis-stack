import { useMutation, useQuery } from '@tanstack/react-query';
import type { ChangeEvent } from 'react';
import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { CartIcon } from 'src/assets/icons/cart';
import { Logo } from 'src/assets/logos/logo';
import { listCategories, saveNewKeyword, searchSuggestions } from 'src/services/product.service';
import { useDebouncedCallback } from 'use-debounce';
import { useNavigate } from 'react-router-dom';
import { SearchIcon } from 'src/assets/icons/search';
import { ArrowTopIcon } from 'src/assets/icons/arrow-top';
import { BarIcon } from 'src/assets/icons/bar';

export function Header() {
    const navigate = useNavigate();

    const [keyword, setKeyword] = useState<string>('');
    const [isDropdownOpen, setIsDropdownOpen] = useState<boolean>(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    const { data: suggestionTags, refetch: searchProductSuggestions } = useQuery({
        queryKey: ['search-tags'],
        queryFn: () => searchSuggestions(keyword),
        enabled: false
    });
    const { data: categories } = useQuery({
        queryKey: ['list-categories'],
        queryFn: () => listCategories(),
    });

    const addNewKeyword = useMutation({
        mutationKey: ['add-new-keyword'],
        mutationFn: saveNewKeyword,
    });

    const debouncedFetch = useDebouncedCallback(() => {
        void searchProductSuggestions();
    }, 500);
    const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setKeyword(value);
        setIsDropdownOpen(true);
        debouncedFetch();

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

    const searchProducts = (product: string) => {
        setIsDropdownOpen(false);
        setKeyword('');
        addNewKeyword.mutate(product);
        navigate(`/search?keyword=${product}`);
    }


    return (
        <>
            <header className="bg-gray-300 relative z-20 ">
                <div className="container mx-auto p-4 flex items-center  ">
                    <div className="flex-shrink-0 w-[20%]">
                        <Link to="">
                            <Logo height={50} width={200} />
                        </Link>
                    </div>

                    <div className="flex-grow w-[60%] relative">
                        <input
                            className="w-full p-2 pr-10 rounded border border-gray-600 focus:outline-none focus:border-blue-500"
                            onChange={handleChange}
                            onFocus={() => { setIsDropdownOpen(true) }}
                            placeholder="Search products..."
                            type="text"
                            value={keyword}
                        />
                        <button
                            className={`absolute right-0 top:0  p-2 rounded ${keyword ? 'text-white bg-blue-400' : 'text-gray-600 bg-gray-100'} hover:bg-blue-600`}
                            onClick={() => { searchProducts(keyword); }}
                            type="button"
                        >
                            <SearchIcon />

                        </button>

                        {!!keyword && isDropdownOpen && !!suggestionTags?.length ? (
                            <div
                                aria-labelledby="searchDropdown"
                                className="absolute z-20 mt-0 w-full bg-white border border-gray-300 rounded-lg shadow-lg"
                                ref={dropdownRef}
                                style={{ top: '42px' }} // Adjusted to accommodate button height
                            >
                                <div className="p-2">
                                    {suggestionTags.map((product) => (
                                        <button
                                            className="flex items-center justify-between px-4 py-2 text-gray-800 hover:bg-gray-100 w-full text-left"
                                            key={product}
                                            onClick={() => {
                                                searchProducts(product);
                                            }}
                                            type="button"
                                        >
                                            {product}
                                            <span className='opacity-15'>
                                                <ArrowTopIcon />
                                            </span>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        ) : null}
                    </div>

                    <div className="flex-shrink-0 w-[20%] ml-auto text-right">
                        <Link className='inline-block' to="cart">
                            <CartIcon />
                        </Link>
                    </div>
                </div>
                <nav className="bg-gray-900">
                    <div className="container mx-auto p-2">
                        <ul className="flex justify-around relative group">
                            <li >
                                <Link className="text-gray-300 hover:text-white flex items-center space-x-2" to="category">
                                    <BarIcon />
                                    <span>Category</span>
                                </Link>

                                <div className="absolute left-0 mt-0 bg-white shadow-lg rounded-md hidden group-hover:block z-20 w-full">
                                    <div className="grid grid-cols-4 gap-4 p-4">
                                        {/* Loop through categories */}
                                        {categories?.map((categoryItem) => (
                                            <div className="space-y-2" key={categoryItem.id}>
                                                {/* Main Category */}
                                                <h4 className="text-lg font-semibold text-gray-700">{categoryItem.name}</h4>
                                                <ul className="space-y-1">
                                                    {/* Sub-categories */}
                                                    {categoryItem.childCategories.map((subCategory) => (
                                                        <li key={subCategory.id}>
                                                            <Link
                                                                className="block text-gray-600 hover:text-blue-500"
                                                                to={`/category/${subCategory.id}`}
                                                            >
                                                                {subCategory.name}
                                                            </Link>
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </li>


                            <li><Link className="text-gray-300 hover:text-white" to="">Home</Link></li>
                            <li><Link className="text-gray-300 hover:text-white" to="about">About Us</Link></li>
                            <li><Link className="text-gray-300 hover:text-white" to="contact">Contact</Link></li>
                            <li><Link className="text-gray-300 hover:text-white" to="cart">Cart</Link></li>
                        </ul>
                    </div>
                </nav>
            </header >

            {
                !!keyword && isDropdownOpen && !!suggestionTags?.length ? <div className="fixed inset-0 bg-black opacity-50 z-10" /> : null
            }
        </>
    );
}

