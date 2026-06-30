'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Suspense, useEffect, useMemo, useState } from 'react';

const API_BASE_URL = process.env.NEXT_PUBLIC_SERVER_URL ?? '';

type ProductStatus = 'ON_SALE' | 'UPCOMING' | 'ENDED' | 'UNKNOWN';
type SportType = 'BASEBALL' | 'BASKETBALL' | 'FOOTBALL';

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

const leagueFilters = [
  { key: 'ALL', label: '전체', sportType: null },
  { key: 'MLB', label: 'MLB', sportType: 'BASEBALL' },
  { key: 'NBA', label: 'NBA', sportType: 'BASKETBALL' },
  { key: 'NFL', label: 'NFL', sportType: 'FOOTBALL' },
] as const;

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

function getActiveFilter(league: string | null) {
  return (
    leagueFilters.find((filter) => filter.key === league?.toUpperCase()) ??
    leagueFilters[0]
  );
}

function getMonthLabel(releaseDate: string | null) {
  if (!releaseDate) return '발매일 미정';

  const date = new Date(`${releaseDate}T00:00:00`);

  return new Intl.DateTimeFormat('ko-KR', {
    year: 'numeric',
    month: 'long',
  }).format(date);
}

function ReleaseCalendarContent() {
  const searchParams = useSearchParams();
  const activeFilter = getActiveFilter(searchParams.get('league'));
  const [products, setProducts] = useState<ProductItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setIsLoading(true);

        const response = await fetch(`${API_BASE_URL}/product/release-calendar`, {
          cache: 'no-store',
        });

        if (!response.ok) {
          throw new Error('발매일정 조회 실패');
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
  }, []);

  const filteredProducts = useMemo(() => {
    if (!activeFilter.sportType) return products;

    return products.filter((product) => product.sportType === activeFilter.sportType);
  }, [activeFilter.sportType, products]);

  const productsByMonth = useMemo(() => {
    return filteredProducts.reduce<Record<string, ProductItem[]>>((groups, product) => {
      const key = getMonthLabel(product.releaseDate);
      groups[key] = [...(groups[key] ?? []), product];
      return groups;
    }, {});
  }, [filteredProducts]);

  return (
    <main className="min-h-screen bg-[#f5f5f5] px-5 py-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-6 border-b border-gray-300 pb-6">
          <p className="text-sm font-black uppercase tracking-[0.24em] text-[#d71920]">
            Release Calendar
          </p>
          <h1 className="mt-2 text-3xl font-black text-black">발매일정</h1>
        </div>

        <div className="mb-6 flex flex-wrap gap-2">
          {leagueFilters.map((filter) => (
            <Link
              key={filter.key}
              href={
                filter.key === 'ALL'
                  ? '/release-calendar'
                  : `/release-calendar?league=${filter.key}`
              }
              className={`inline-flex h-10 items-center rounded-md border px-4 text-sm font-black transition ${
                filter.key === activeFilter.key
                  ? 'border-black bg-black text-white'
                  : 'border-gray-300 bg-white text-gray-700 hover:border-black hover:text-black'
              }`}
            >
              {filter.label}
            </Link>
          ))}
        </div>

        {isLoading ? (
          <div className="border border-gray-300 bg-white px-6 py-16 text-center text-sm font-bold text-gray-500">
            발매일정을 불러오는 중입니다.
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="border border-dashed border-gray-400 bg-white px-6 py-16 text-center text-sm font-bold text-gray-500">
            표시할 발매일정이 없습니다.
          </div>
        ) : (
          <div className="space-y-8">
            {Object.entries(productsByMonth).map(([monthLabel, monthProducts]) => (
              <section key={monthLabel}>
                <div className="mb-3 flex items-end justify-between border-b border-black pb-2">
                  <h2 className="text-xl font-black text-black">{monthLabel}</h2>
                  <span className="text-xs font-black text-[#d71920]">
                    {monthProducts.length} ITEMS
                  </span>
                </div>

                <div className="overflow-hidden border border-gray-300 bg-white">
                  <div className="overflow-x-auto">
                    <table className="min-w-full border-collapse text-left">
                      <thead className="bg-gray-100 text-xs font-black uppercase text-gray-500">
                        <tr>
                          <th className="whitespace-nowrap px-5 py-3">발매일</th>
                          <th className="whitespace-nowrap px-5 py-3">상품</th>
                          <th className="whitespace-nowrap px-5 py-3">종목</th>
                          <th className="whitespace-nowrap px-5 py-3">상태</th>
                          <th className="whitespace-nowrap px-5 py-3">체크리스트</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {monthProducts.map((product) => (
                          <tr key={product.id} className="text-sm">
                            <td className="whitespace-nowrap px-5 py-4 font-black text-black">
                              {product.releaseDate ?? '-'}
                            </td>
                            <td className="px-5 py-4">
                              <Link
                                href={`/products/${product.id}`}
                                className="font-black text-black hover:text-[#d71920]"
                              >
                                {product.releaseYear ? `${product.releaseYear} ` : ''}
                                {product.brandName} {product.productName}
                              </Link>
                            </td>
                            <td className="whitespace-nowrap px-5 py-4 font-bold text-gray-700">
                              {product.sportType}
                            </td>
                            <td className="whitespace-nowrap px-5 py-4">
                              <span
                                className={`inline-flex rounded-md border px-2.5 py-1 text-xs font-black ${statusClasses[product.status]}`}
                              >
                                {statusLabels[product.status]}
                              </span>
                            </td>
                            <td className="whitespace-nowrap px-5 py-4">
                              {product.checklistUrl ? (
                                <a
                                  href={product.checklistUrl}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="font-black text-[#d71920] hover:text-black"
                                >
                                  원본
                                </a>
                              ) : (
                                <span className="font-bold text-gray-400">-</span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </section>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}

export default function ReleaseCalendarPage() {
  return (
    <Suspense fallback={null}>
      <ReleaseCalendarContent />
    </Suspense>
  );
}
