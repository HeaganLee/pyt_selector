'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';

type ProductStatus = 'ON_SALE' | 'UPCOMING';

interface ProductItem {
  id: number;
  brandName: string;
  productName: string;
  releaseDate: string;
  status: ProductStatus;
  imageUrl: string;
}

function ProductCard({ product }: { product: ProductItem }) {
  return (
    <Link
      href={`/products/${product.id}`}
      className="group block overflow-hidden rounded-2xl border border-gray-200 bg-white transition hover:-translate-y-1 hover:shadow-lg"
    >
      <div className="aspect-[3/4] w-full overflow-hidden bg-gray-100">
        <img
          src={product.imageUrl}
          alt={`${product.brandName} ${product.productName}`}
          className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
        />
      </div>

      <div className="p-4">
        <h2 className="text-lg font-bold text-gray-900">
          {product.brandName} {product.productName}
        </h2>

        <p className="mt-2 text-sm text-gray-600">
          발매일: {product.releaseDate}
        </p>

        <div className="mt-3">
          <span
            className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${
              product.status === 'ON_SALE'
                ? 'bg-blue-100 text-blue-700'
                : 'bg-orange-100 text-orange-700'
            }`}
          >
            {product.status === 'ON_SALE' ? '현재 발매중' : '발매 예정'}
          </span>
        </div>
      </div>
    </Link>
  );
}

function ProductSection({
  title,
  products,
}: {
  title: string;
  products: ProductItem[];
}) {
  return (
    <section className="mt-12">
      <h2 className="mb-5 text-2xl font-bold text-gray-900">{title}</h2>

      {products.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-gray-300 bg-gray-50 px-6 py-10 text-center text-sm text-gray-500">
          표시할 상품이 없습니다.
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </section>
  );
}

export default function HomePage() {
  const [products, setProducts] = useState<ProductItem[]>([]);

  const getCardProduct = async () => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_SERVER_URL}/product`,
        {
          method: 'GET',
        }
      );

      if (!response.ok) {
        throw new Error('상품 목록 조회 실패');
      }

      const result: ProductItem[] = await response.json();
      setProducts(result);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    getCardProduct();
  }, []);

  const onSaleProducts = products.filter(
    (product) => product.status === 'ON_SALE'
  );

  const upcomingProducts = products.filter(
    (product) => product.status === 'UPCOMING'
  );

  return (
    <main className="mx-auto max-w-7xl px-6 py-10">
      <section className="rounded-3xl bg-slate-900 px-8 py-12 text-white">
        <p className="text-sm font-medium uppercase tracking-wider text-slate-300">
          PYT
        </p>

        <h1 className="mt-3 text-4xl font-bold">Sports Card Box Board</h1>

        <p className="mt-4 text-sm text-slate-300">
          현재 발매중인 박스와 발매 예정 박스를 확인해보세요.
        </p>
      </section>

      <ProductSection title="현재 발매중인 박스" products={onSaleProducts} />
      <ProductSection title="발매 예정 박스" products={upcomingProducts} />
    </main>
  );
}