import { useQuery } from "@tanstack/react-query";
import React, { useEffect } from "react";
import { getProductByCategoryId } from "src/services/product.service";
import { Products } from "../Home/components/Product";
import { useParams } from "react-router-dom";

export function Product() {
    const { categoryId } = useParams();
    const { data: products, isLoading } = useQuery({
        queryKey: ['products'],
        queryFn: () => getProductByCategoryId({ categoryId: Number(categoryId) || 0, page: 1, pageSize: 100 }),
    })
    useEffect(() => {
        console.log(products);
    }, [products]);
    return (<div>
        {isLoading ? <p>Loading...</p> : <Products products={products ?? []} title={`Search Results for ${categoryId}`} />}
    </div>)
}