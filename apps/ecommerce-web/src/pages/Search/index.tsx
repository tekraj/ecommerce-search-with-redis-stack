import { useQuery } from "@tanstack/react-query";
import React, { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { searchProducts } from "src/services/product.service";
import { Products } from "../Home/components/Product";

export function Search() {
    const location = useLocation();
    const query = new URLSearchParams(location.search);
    const keyword = query.get('keyword');
    const { data: products, isLoading } = useQuery({
        queryKey: ['products'],
        queryFn: () => searchProducts(keyword ?? ''),
        enabled: !!keyword
    })
    useEffect(() => {
        console.log(products);
    }, [products]);
    return (<div>
        {isLoading ? <p>Loading...</p> : <Products products={products ?? []} title={`Search Results for ${keyword}`} />}
    </div>)
}