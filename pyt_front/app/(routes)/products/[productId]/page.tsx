'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';

type TierGrade = 'S' | 'A' | 'B' | 'C' | 'D';

interface TeamTier {
  id: number;
  teamName: string;
  tierGrade: TierGrade;
  keyPlayers: string;
  commentText: string;
  aiSummary: string;
}

interface TierCriteria {
  id: number;
  criteriaType: 'PROSPECT_ONLY' | 'FIRST_PROSPECT' | 'SUPERSTAR_AND_PROSPECT';
  criteriaName: string;
  description: string;
  teamTiers: TeamTier[];
}

interface ProductDetail {
  id: number;
  brandName: string;
  productName: string;
  releaseYear: number;
  releaseDate: string;
  status: 'ON_SALE' | 'UPCOMING' | 'ENDED';
  imageUrl: string;
  tierCriteria: TierCriteria[];
}

const tierOrder: Record<TierGrade, number> = {
  S: 0,
  A: 1,
  B: 2,
  C: 3,
  D: 4,
};

export default function ProductDetailPage() {
  const params = useParams<{ productId: string }>();
  const productId = Number(params.productId);

  const [product, setProduct] = useState<ProductDetail | null>(null);


  useEffect(() => {
    if (!productId) return;

    const fetchData = async () => {
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_SERVER_URL}/product/${productId}`
        );

        if (!response.ok) return;

        const result = await response.json();
        console.log('result>> ', result)
        setProduct(result);

      } catch (error) {
        console.error(error);
      }
    };

    fetchData();
  }, [productId]);

  if (!product) {
    return (
      <main className="mx-auto max-w-7xl px-6 py-10">
        <Link href="/" className="text-sm font-medium text-blue-600 hover:underline">
          ← 메인으로 돌아가기
        </Link>

        <div className="mt-8 rounded-2xl border border-gray-200 bg-white p-8">
          <h1 className="text-2xl font-bold text-gray-900">상품을 불러오는 중입니다.</h1>
        </div>
      </main>
    );
  }

  return (
  <main className="min-h-screen bg-[#f6f3ee]">
    <div className="mx-auto max-w-7xl px-6 py-8">
      <div className="mb-6">
        <Link
          href="/"
          className="inline-flex items-center rounded-full border border-black bg-white px-4 py-2 text-sm font-bold text-black transition hover:bg-black hover:text-white"
        >
          ← 메인으로 돌아가기
        </Link>
      </div>

      <section className="overflow-hidden rounded-[28px] border border-black bg-white shadow-[8px_8px_0_#111]">
        <div className="grid gap-0 lg:grid-cols-[360px_1fr]">
          <div className="border-b border-black bg-[#eee8df] p-6 lg:border-b-0 lg:border-r">
            <div className="overflow-hidden rounded-2xl border border-black bg-white">
              <div className="aspect-[3/4] w-full bg-[#f1eee8]">
                {product.imageUrl ? (
                  <img
                    src={product.imageUrl}
                    alt={`${product.releaseYear} ${product.brandName} ${product.productName}`}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center text-sm font-bold text-gray-500">
                    No Image
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="flex flex-col justify-center p-8 lg:p-12">
            <div className="mb-4">
              <span
                className={`inline-flex rounded-full border px-3 py-1 text-xs font-black tracking-wide ${
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

            <p className="mb-3 text-sm font-black uppercase tracking-[0.25em] text-[#d71920]">
              PYT Product
            </p>

            <h1 className="max-w-3xl text-4xl font-black leading-tight text-black lg:text-5xl">
              {product.releaseYear} {product.brandName} {product.productName}
            </h1>

            <div className="mt-6 grid gap-3 text-sm font-semibold text-gray-800 sm:grid-cols-2">
              <div className="rounded-xl border border-black bg-[#f6f3ee] px-4 py-3">
                <span className="block text-xs font-black uppercase text-gray-500">
                  Release Date
                </span>
                {product.releaseDate}
              </div>

              <div className="rounded-xl border border-black bg-[#f6f3ee] px-4 py-3">
                <span className="block text-xs font-black uppercase text-gray-500">
                  Product ID
                </span>
                #{product.id}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mt-14">
        {product.tierCriteria.length === 0 ? (
          <div className="rounded-2xl border-2 border-dashed border-black bg-white px-6 py-10 text-center text-sm font-bold text-gray-600">
            등록된 티어 기준이 없습니다.
          </div>
        ) : (
          <div className="space-y-12">
            {product.tierCriteria.map((criteria) => {
              const sortedTeamTiers = [...(criteria.teamTiers ?? [])].sort(
                (a, b) => tierOrder[a.tierGrade] - tierOrder[b.tierGrade]
              );

              return (
                <section
                  key={criteria.id}
                  className="overflow-hidden rounded-[24px] border border-black bg-white shadow-[6px_6px_0_#111]"
                >
                  <div className="border-b border-black bg-black px-6 py-5 text-white">
                    <p className="text-xs font-black uppercase tracking-[0.25em] text-[#ff4b4b]">
                      Tier Criteria
                    </p>

                    <h2 className="mt-2 text-2xl font-black">
                      {criteria.criteriaName}
                    </h2>

                    <p className="mt-2 text-sm text-gray-300">
                      {criteria.description}
                    </p>
                  </div>

                  {sortedTeamTiers.length === 0 ? (
                    <div className="bg-[#f6f3ee] px-6 py-10 text-center text-sm font-bold text-gray-500">
                      등록된 팀 티어가 없습니다.
                    </div>
                  ) : (
                    <div className="overflow-x-auto bg-white">
                      <table className="min-w-full border-collapse">
                        <thead>
                          <tr className="bg-[#d71920] text-white">
                            <th className="border-b border-black px-5 py-4 text-left text-xs font-black uppercase tracking-wider">
                              Tier
                            </th>
                            <th className="border-b border-black px-5 py-4 text-left text-xs font-black uppercase tracking-wider">
                              Team
                            </th>
                            <th className="border-b border-black px-5 py-4 text-left text-xs font-black uppercase tracking-wider">
                              Key Players
                            </th>
                            <th className="border-b border-black px-5 py-4 text-left text-xs font-black uppercase tracking-wider">
                              Comment
                            </th>
                          </tr>
                        </thead>

                        <tbody>
                          {sortedTeamTiers.map((teamTier, index) => (
                            <tr
                              key={teamTier.id}
                              className={
                                index % 2 === 0 ? 'bg-white' : 'bg-[#f6f3ee]'
                              }
                            >
                              <td className="border-b border-gray-300 px-5 py-4">
                                <span className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-black bg-black text-sm font-black text-white">
                                  {teamTier.tierGrade}
                                </span>
                              </td>

                              <td className="border-b border-gray-300 px-5 py-4 text-sm font-black text-black">
                                {teamTier.teamName}
                              </td>

                              <td className="border-b border-gray-300 px-5 py-4 text-sm font-semibold text-gray-800">
                                {teamTier.keyPlayers}
                              </td>

                              <td className="border-b border-gray-300 px-5 py-4 text-sm text-gray-700">
                                {teamTier.commentText}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </section>
              );
            })}
          </div>
        )}
      </section>
    </div>
  </main>
);
}