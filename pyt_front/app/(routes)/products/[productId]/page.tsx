'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';

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
  status: 'ON_SALE' | 'UPCOMING';
  imageUrl: string;
  tierCriteria: TierCriteria[];
}

const mockProducts: ProductDetail[] = [
  {
    id: 1,
    brandName: 'Topps Bowman',
    productName: 'Baseball',
    releaseYear: 2026,
    releaseDate: '2026-05-13',
    status: 'ON_SALE',
    imageUrl: 'https://via.placeholder.com/300x420?text=2026+Bowman+Baseball',
    tierCriteria: [
      {
        id: 1,
        criteriaType: 'PROSPECT_ONLY',
        criteriaName: '프로스펙트 기준',
        description: '프로스펙트 선수 전체를 기준으로 본 팀 티어표',
        teamTiers: [
          {
            id: 1,
            teamName: 'Pittsburgh Pirates',
            tierGrade: 'S',
            keyPlayers: 'Konnor Griffin, Edward Florentino, Wyatt Sanford',
            commentText: '최상위 헤드라이너와 보조 prospect 깊이가 모두 강한 팀',
            aiSummary: '순수 prospect 기준 최상위 팀',
          },
          {
            id: 2,
            teamName: 'Milwaukee Brewers',
            tierGrade: 'S',
            keyPlayers: 'Andrew Fischer, Brailyn Antunez, Luis Peña',
            commentText: '상위권 유망주 수량과 뎁스가 매우 좋은 팀',
            aiSummary: '신규성과 뎁스를 모두 갖춘 강한 팀',
          },
          {
            id: 3,
            teamName: 'Baltimore Orioles',
            tierGrade: 'A',
            keyPlayers: 'Wehiwa Aloy, Andrew Tess, Esteban Mejia',
            commentText: '상단과 중간층 prospect 구성이 고르게 좋은 팀',
            aiSummary: '상위권 평가',
          },
        ],
      },
    ],
  },
];

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

  const product = mockProducts.find((item) => item.id === productId);

  if (!product) {
    return (
      <main className="mx-auto max-w-7xl px-6 py-10">
        <Link href="/" className="text-sm font-medium text-blue-600 hover:underline">
          ← 메인으로 돌아가기
        </Link>
        <div className="mt-8 rounded-2xl border border-gray-200 bg-white p-8">
          <h1 className="text-2xl font-bold text-gray-900">상품을 찾을 수 없습니다.</h1>
          <p className="mt-2 text-sm text-gray-600">존재하지 않는 상품 ID입니다.</p>
        </div>
      </main>
    );
  }

  const defaultCriteria = product.tierCriteria[0];
  const sortedTeamTiers = [...defaultCriteria.teamTiers].sort(
    (a, b) => tierOrder[a.tierGrade] - tierOrder[b.tierGrade]
  );

  return (
    <main className="mx-auto max-w-7xl px-6 py-10">
      <div className="mb-6">
        <Link href="/" className="text-sm font-medium text-blue-600 hover:underline">
          ← 메인으로 돌아가기
        </Link>
      </div>

      <section className="grid gap-8 lg:grid-cols-[320px_1fr]">
        <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white">
          <div className="aspect-[3/4] w-full bg-gray-100">
            <img
              src={product.imageUrl}
              alt={`${product.releaseYear} ${product.brandName} ${product.productName}`}
              className="h-full w-full object-cover"
            />
          </div>
        </div>

        <div>
          <div className="mb-3">
            <span
              className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
                product.status === 'ON_SALE'
                  ? 'bg-blue-100 text-blue-700'
                  : 'bg-orange-100 text-orange-700'
              }`}
            >
              {product.status === 'ON_SALE' ? '현재 발매중' : '발매 예정'}
            </span>
          </div>

          <h1 className="text-3xl font-bold text-gray-900">
            {product.releaseYear} {product.brandName} {product.productName}
          </h1>

          <div className="mt-4 space-y-2 text-sm text-gray-600">
            <p>발매일: {product.releaseDate}</p>
            <p>상품 ID: {product.id}</p>
          </div>
        </div>
      </section>

      <section className="mt-12">
        <h2 className="mb-4 text-2xl font-bold text-gray-900">
          {defaultCriteria.criteriaName}
        </h2>
        <p className="mb-6 text-sm text-gray-600">{defaultCriteria.description}</p>

        <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white">
          <div className="overflow-x-auto">
            <table className="min-w-full border-collapse">
              <thead className="bg-gray-50">
                <tr>
                  <th className="border-b px-4 py-3 text-left text-sm font-semibold">Tier</th>
                  <th className="border-b px-4 py-3 text-left text-sm font-semibold">Team</th>
                  <th className="border-b px-4 py-3 text-left text-sm font-semibold">Key Players</th>
                  <th className="border-b px-4 py-3 text-left text-sm font-semibold">Comment</th>
                </tr>
              </thead>
              <tbody>
                {sortedTeamTiers.map((teamTier) => (
                  <tr key={teamTier.id}>
                    <td className="border-b px-4 py-3 text-sm font-bold">{teamTier.tierGrade}</td>
                    <td className="border-b px-4 py-3 text-sm">{teamTier.teamName}</td>
                    <td className="border-b px-4 py-3 text-sm">{teamTier.keyPlayers}</td>
                    <td className="border-b px-4 py-3 text-sm">{teamTier.commentText}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </main>
  );
}