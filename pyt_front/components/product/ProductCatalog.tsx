'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';

const API_BASE_URL = process.env.NEXT_PUBLIC_SERVER_URL ?? '';

type ProductStatus = 'ON_SALE' | 'UPCOMING' | 'ENDED' | 'UNKNOWN';
type SportType = 'BASEBALL' | 'BASKETBALL' | 'FOOTBALL' | 'HOCKEY' | 'SOCCER';

interface ProductItem {
  id: number;
  brandName: string;
  productName: string;
  releaseYear: number | null;
  releaseDate: string | null;
  status: ProductStatus;
  imageUrl: string | null;
  sportType: SportType;
  checklistUrl: string | null;
}

const categoryOptions: {
  key: string;
  label: string;
  sportType: SportType | null;
}[] = [
  { key: 'ALL', label: '전체', sportType: null },
  { key: 'MLB', label: 'MLB', sportType: 'BASEBALL' },
  { key: 'NBA', label: 'NBA', sportType: 'BASKETBALL' },
  { key: 'NFL', label: 'NFL', sportType: 'FOOTBALL' },
  { key: 'NHL', label: 'NHL', sportType: 'HOCKEY' },
  { key: 'MLS', label: 'MLS', sportType: 'SOCCER' },
];

const statusLabels: Record<ProductStatus, string> = {
  ON_SALE: '발매중',
  UPCOMING: '예정',
  ENDED: '종료',
  UNKNOWN: '미정',
};

const statusClasses: Record<ProductStatus, string> = {
  ON_SALE: 'border-[#d71920] bg-[#d71920] text-white',
  UPCOMING: 'border-black bg-[#ffd84d] text-black',
  ENDED: 'border-gray-400 bg-gray-100 text-gray-600',
  UNKNOWN: 'border-gray-400 bg-white text-gray-600',
};

const sportLabels: Record<SportType, string> = {
  BASEBALL: 'MLB',
  BASKETBALL: 'NBA',
  FOOTBALL: 'NFL',
  HOCKEY: 'NHL',
  SOCCER: 'MLS',
};

function getActiveCategory(category: string | null) {
  return (
    categoryOptions.find((option) => option.key === category?.toUpperCase()) ??
    categoryOptions[0]
  );
}

function getReleaseLabel(product: ProductItem) {
  if (product.releaseDate) return product.releaseDate;
  if (product.releaseYear) return String(product.releaseYear);
  return '미정';
}

function ProductCatalogCard({ product }: { product: ProductItem }) {
  return (
    <Link
      href={`/products/${product.id}`}
      className="group grid overflow-hidden rounded-md border border-gray-300 bg-white transition hover:-translate-y-0.5 hover:border-black hover:shadow-[0_12px_28px_rgba(0,0,0,0.12)] sm:grid-cols-[150px_1fr]"
    >
      <div className="aspect-[3/4] border-b border-gray-300 bg-[#eee8df] sm:border-b-0 sm:border-r">
        {product.imageUrl ? (
          <img
            src={product.imageUrl}
            alt={`${product.brandName} ${product.productName}`}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-sm font-black text-gray-400">
            No Image
          </div>
        )}
      </div>

      <div className="flex min-h-[220px] flex-col p-5">
        <div className="flex flex-wrap gap-2">
          <span className="inline-flex rounded-md border border-gray-300 bg-gray-50 px-2.5 py-1 text-xs font-black text-gray-700">
            {sportLabels[product.sportType]}
          </span>
          <span
            className={`inline-flex rounded-md border px-2.5 py-1 text-xs font-black ${
              statusClasses[product.status]
            }`}
          >
            {statusLabels[product.status]}
          </span>
        </div>

        <h2 className="mt-4 text-lg font-black leading-snug text-black group-hover:text-[#d71920]">
          {product.releaseYear ? `${product.releaseYear} ` : ''}
          {product.brandName} {product.productName}
        </h2>

        <div className="mt-auto grid grid-cols-2 gap-2 pt-5">
          <div className="rounded-md border border-gray-300 px-3 py-2">
            <span className="block text-xs font-black text-gray-500">
              발매
            </span>
            <span className="text-sm font-black text-black">
              {getReleaseLabel(product)}
            </span>
          </div>

          <div className="rounded-md border border-gray-300 px-3 py-2">
            <span className="block text-xs font-black text-gray-500">
              체크
            </span>
            <span className="text-sm font-black text-black">
              {product.checklistUrl ? '있음' : '-'}
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}

export default function ProductCatalog() {
  const searchParams = useSearchParams();
  const activeCategory = getActiveCategory(searchParams.get('category'));
  const catalogLabel =
    activeCategory.key === 'ALL'
      ? 'Product Catalog'
      : `${activeCategory.label} Product Catalog`;
  const [products, setProducts] = useState<ProductItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setIsLoading(true);

        const params = new URLSearchParams();
        if (activeCategory.sportType) {
          params.set('sportType', activeCategory.sportType);
        }

        const queryString = params.toString();
        const response = await fetch(
          `${API_BASE_URL}/product/catalog${queryString ? `?${queryString}` : ''}`,
          { cache: 'no-store' }
        );

        if (!response.ok) {
          throw new Error('상품 목록 조회 실패');
        }

        setProducts((await response.json()) as ProductItem[]);
      } catch (error) {
        console.error(error);
        setProducts([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProducts();
  }, [activeCategory.sportType]);

  const productCounts = useMemo(() => {
    return products.reduce<Record<ProductStatus, number>>(
      (counts, product) => ({
        ...counts,
        [product.status]: counts[product.status] + 1,
      }),
      {
        ON_SALE: 0,
        UPCOMING: 0,
        ENDED: 0,
        UNKNOWN: 0,
      }
    );
  }, [products]);

  return (
    <main className="min-h-screen bg-[#f5f5f5] px-5 py-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-6 flex flex-col gap-4 border-b border-gray-300 pb-6 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-sm font-black uppercase tracking-[0.24em] text-[#d71920]">
              {catalogLabel}
            </p>
            <h1 className="mt-2 text-3xl font-black text-black">제품</h1>
          </div>

          <div className="grid grid-cols-2 gap-2 text-sm sm:grid-cols-4">
            <div className="border border-gray-300 bg-white px-4 py-3">
              <span className="block text-xs font-black text-gray-500">
                전체
              </span>
              <span className="text-lg font-black text-black">
                {products.length}
              </span>
            </div>
            <div className="border border-gray-300 bg-white px-4 py-3">
              <span className="block text-xs font-black text-gray-500">
                발매중
              </span>
              <span className="text-lg font-black text-black">
                {productCounts.ON_SALE}
              </span>
            </div>
            <div className="border border-gray-300 bg-white px-4 py-3">
              <span className="block text-xs font-black text-gray-500">
                예정
              </span>
              <span className="text-lg font-black text-black">
                {productCounts.UPCOMING}
              </span>
            </div>
            <div className="border border-gray-300 bg-white px-4 py-3">
              <span className="block text-xs font-black text-gray-500">
                종료
              </span>
              <span className="text-lg font-black text-black">
                {productCounts.ENDED}
              </span>
            </div>
          </div>
        </div>

        {isLoading ? (
          <div className="border border-gray-300 bg-white px-6 py-16 text-center text-sm font-bold text-gray-500">
            제품을 불러오는 중입니다.
          </div>
        ) : products.length === 0 ? (
          <div className="border border-dashed border-gray-400 bg-white px-6 py-16 text-center text-sm font-bold text-gray-500">
            등록된 제품이 없습니다.
          </div>
        ) : (
          <div className="grid gap-5 xl:grid-cols-2">
            {products.map((product) => (
              <ProductCatalogCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
