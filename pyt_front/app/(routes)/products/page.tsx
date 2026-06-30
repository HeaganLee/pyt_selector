import { Suspense } from 'react';
import ProductCatalog from '@/components/product/ProductCatalog';

export default function ProductsPage() {
  return (
    <Suspense fallback={null}>
      <ProductCatalog />
    </Suspense>
  );
}
