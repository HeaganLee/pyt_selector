'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Suspense, useEffect, useMemo, useState } from 'react';

const API_BASE_URL = process.env.NEXT_PUBLIC_SERVER_URL ?? '';

type SportType = 'BASEBALL' | 'BASKETBALL' | 'FOOTBALL';

interface TeamTier {
  id: number;
}

interface TierCriteria {
  id: number;
  criteriaName: string;
  teamTiers: TeamTier[];
}

interface ProductTierBoard {
  productId: number;
  brandName: string;
  productName: string;
  productLabel: string;
  releaseYear: number | null;
  releaseDate: string | null;
  sportType: SportType;
  imageUrl: string | null;
  tierCriteria: TierCriteria[];
}

const leagueFilters = [
  { key: 'ALL', label: '전체', sportType: null },
  { key: 'MLB', label: 'MLB', sportType: 'BASEBALL' },
  { key: 'NBA', label: 'NBA', sportType: 'BASKETBALL' },
  { key: 'NFL', label: 'NFL', sportType: 'FOOTBALL' },
] as const;

function getActiveFilter(league: string | null) {
  return (
    leagueFilters.find((filter) => filter.key === league?.toUpperCase()) ??
    leagueFilters[0]
  );
}

function getTierCount(product: ProductTierBoard) {
  return product.tierCriteria.reduce(
    (count, criteria) => count + criteria.teamTiers.length,
    0
  );
}

function TiersContent() {
  const searchParams = useSearchParams();
  const activeFilter = getActiveFilter(searchParams.get('league'));
  const [products, setProducts] = useState<ProductTierBoard[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchTierBoards = async () => {
      try {
        setIsLoading(true);

        const response = await fetch(`${API_BASE_URL}/product/tiers`, {
          cache: 'no-store',
        });

        if (!response.ok) {
          throw new Error('티어표 조회 실패');
        }

        setProducts((await response.json()) as ProductTierBoard[]);
      } catch (error) {
        console.error(error);
        setProducts([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTierBoards();
  }, []);

  const filteredProducts = useMemo(() => {
    if (!activeFilter.sportType) return products;

    return products.filter((product) => product.sportType === activeFilter.sportType);
  }, [activeFilter.sportType, products]);

  return (
    <main className="min-h-screen bg-[#f5f5f5] px-5 py-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-6 border-b border-gray-300 pb-6">
          <p className="text-sm font-black uppercase tracking-[0.24em] text-[#d71920]">
            Product Tiers
          </p>
          <h1 className="mt-2 text-3xl font-black text-black">티어표</h1>
        </div>

        <div className="mb-6 flex flex-wrap gap-2">
          {leagueFilters.map((filter) => (
            <Link
              key={filter.key}
              href={filter.key === 'ALL' ? '/tiers' : `/tiers?league=${filter.key}`}
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
            티어표 제품을 불러오는 중입니다.
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="border border-dashed border-gray-400 bg-white px-6 py-16 text-center text-sm font-bold text-gray-500">
            등록된 티어표 제품이 없습니다.
          </div>
        ) : (
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {filteredProducts.map((product) => (
              <Link
                key={product.productId}
                href={`/products/${product.productId}`}
                className="group overflow-hidden rounded-md border border-gray-300 bg-white transition hover:-translate-y-0.5 hover:border-black hover:shadow-[0_12px_28px_rgba(0,0,0,0.12)]"
              >
                <div className="grid min-h-[220px] grid-cols-[130px_1fr]">
                  <div
                    className="border-r border-gray-300 bg-gray-100 bg-cover bg-center"
                    style={{
                      backgroundImage: product.imageUrl
                        ? `url(${product.imageUrl})`
                        : undefined,
                    }}
                  >
                    {!product.imageUrl && (
                      <div className="flex h-full items-center justify-center px-3 text-center text-xs font-black text-gray-400">
                        No Image
                      </div>
                    )}
                  </div>

                  <div className="flex flex-col p-5">
                    <div className="flex flex-wrap gap-2">
                      <span className="inline-flex rounded-md border border-gray-300 bg-gray-50 px-2.5 py-1 text-xs font-black text-gray-700">
                        {product.sportType}
                      </span>
                      <span className="inline-flex rounded-md border border-gray-300 bg-gray-50 px-2.5 py-1 text-xs font-black text-gray-700">
                        {product.releaseDate ?? '발매일 미정'}
                      </span>
                    </div>

                    <h2 className="mt-4 text-lg font-black leading-snug text-black group-hover:text-[#d71920]">
                      {product.releaseYear ? `${product.releaseYear} ` : ''}
                      {product.productLabel}
                    </h2>

                    <div className="mt-auto grid grid-cols-2 gap-2 pt-5">
                      <div className="rounded-md border border-gray-300 px-3 py-2">
                        <span className="block text-xs font-black text-gray-500">
                          기준
                        </span>
                        <span className="text-sm font-black text-black">
                          {product.tierCriteria.length}개
                        </span>
                      </div>
                      <div className="rounded-md border border-gray-300 px-3 py-2">
                        <span className="block text-xs font-black text-gray-500">
                          팀
                        </span>
                        <span className="text-sm font-black text-black">
                          {getTierCount(product)}개
                        </span>
                      </div>
                    </div>

                    <div className="mt-4 text-sm font-black text-[#d71920]">
                      상세에서 티어표 보기
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}

export default function TiersPage() {
  return (
    <Suspense fallback={null}>
      <TiersContent />
    </Suspense>
  );
}
