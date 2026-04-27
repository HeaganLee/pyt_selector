'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';

type ProductStatus = 'ON_SALE' | 'UPCOMING' | 'ENDED';

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
      className="group block overflow-hidden rounded-[22px] border border-black bg-white shadow-[5px_5px_0_#111] transition hover:-translate-y-1 hover:shadow-[8px_8px_0_#111]"
    >
      <div className="aspect-[3/4] w-full overflow-hidden border-b border-black bg-[#eee8df]">
        {product.imageUrl ? (
          <img
            src={product.imageUrl}
            alt={`${product.brandName} ${product.productName}`}
            className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-sm font-bold text-gray-500">
            No Image
          </div>
        )}
      </div>

      <div className="p-5">
        <div className="mb-3">
          <span
            className={`inline-flex rounded-full border px-3 py-1 text-xs font-black ${
              product.status === 'ON_SALE'
                ? 'border-[#d71920] bg-[#d71920] text-white'
                : product.status === 'UPCOMING'
                  ? 'border-black bg-[#ffd84d] text-black'
                  : 'border-gray-500 bg-gray-200 text-gray-700'
            }`}
          >
            {product.status === 'ON_SALE'
              ? '현재 발매중'
              : product.status === 'UPCOMING'
                ? '발매 예정'
                : '발매 종료'}
          </span>
        </div>

        <h2 className="text-lg font-black leading-snug text-black">
          {product.brandName} {product.productName}
        </h2>

        <p className="mt-3 rounded-lg border border-black bg-[#f6f3ee] px-3 py-2 text-sm font-semibold text-gray-800">
          발매일: {product.releaseDate}
        </p>
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
    <section className="mt-14">
      <div className="mb-6 flex items-end justify-between border-b-2 border-black pb-3">
        <h2 className="text-3xl font-black text-black">{title}</h2>
        <span className="text-sm font-black text-[#d71920]">
          {products.length} ITEMS
        </span>
      </div>

      {products.length === 0 ? (
        <div className="rounded-2xl border-2 border-dashed border-black bg-white px-6 py-10 text-center text-sm font-bold text-gray-500">
          표시할 상품이 없습니다.
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-7 sm:grid-cols-2 lg:grid-cols-4">
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
          cache: 'no-store',
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
    <main className="min-h-screen bg-[#f6f3ee]">
      <div className="mx-auto max-w-7xl px-6 py-10">
        <section className="overflow-hidden rounded-[28px] border border-black bg-white shadow-[8px_8px_0_#111]">
          <div className="border-b border-black bg-black px-8 py-4">
            <p className="text-sm font-black uppercase tracking-[0.3em] text-[#ff4b4b]">
              PYT
            </p>
          </div>

          <div className="grid gap-6 bg-white px-8 py-12 lg:grid-cols-[1fr_280px] lg:items-center">
            <div>
              <h1 className="text-5xl font-black leading-tight text-black">
                Sports Card
                <br />
                Box Board
              </h1>

              <p className="mt-5 max-w-xl text-base font-semibold text-gray-700">
                현재 발매중인 박스와 발매 예정 박스를 확인해보세요.
              </p>
            </div>

            <div className="rounded-2xl border border-black bg-[#d71920] px-6 py-8 text-white">
              <p className="text-xs font-black uppercase tracking-[0.25em]">
                Release Board
              </p>
              <p className="mt-4 text-4xl font-black">{products.length}</p>
              <p className="mt-1 text-sm font-bold">Products</p>
            </div>
          </div>
        </section>

        <ProductSection title="현재 발매중인 박스" products={onSaleProducts} />
        <ProductSection title="발매 예정 박스" products={upcomingProducts} />
      </div>
    </main>
  );
}