import React from 'react';
import { Products } from './components/Product';
import { Carousel } from 'src/components/Carousel';
import { useQuery } from '@tanstack/react-query';
import { listProduct } from 'src/services/product.service';

export function Home() {
  const productSections = ['Featured', 'Best Deals'];
  const { data: products, isLoading } = useQuery({
    queryKey: ['home-products'],
    queryFn: () => listProduct(1, 4)
  })
  return (
    <div className="container mx-auto px-4">
      <Carousel />
      {productSections.map(section => {
        return (<section className="py-8" key={section}>
          {isLoading ? <p>Loading...</p> :
            <Products products={products ?? []} title={section} />
          }
        </section>)
      })}
    </div>
  );
}
