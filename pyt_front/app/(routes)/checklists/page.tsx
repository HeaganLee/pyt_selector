'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Suspense, useEffect, useMemo, useState } from 'react';

const API_BASE_URL = process.env.NEXT_PUBLIC_SERVER_URL ?? '';

type SportType = 'BASEBALL' | 'BASKETBALL' | 'FOOTBALL';
type LeagueSportType = SportType | 'HOCKEY' | 'SOCCER';

interface ChecklistItem {
  id: number;
  sectionName: string;
  cardNumber: string;
  playerName: string;
  teamId: number | null;
  teamName: string | null;
  parallelName: string | null;
  rookieCard: boolean;
  autograph: boolean;
  relic: boolean;
  notes: string | null;
}

interface ProductChecklist {
  productId: number;
  brandName: string;
  productName: string;
  productLabel: string;
  releaseYear: number | null;
  releaseDate: string | null;
  sportType: SportType;
  imageUrl: string | null;
  sourceUrl: string | null;
  items: ChecklistItem[];
}

const leagueFilters: {
  key: string;
  label: string;
  sportType: LeagueSportType | null;
}[] = [
  { key: 'ALL', label: '전체', sportType: null },
  { key: 'MLB', label: 'MLB', sportType: 'BASEBALL' },
  { key: 'NBA', label: 'NBA', sportType: 'BASKETBALL' },
  { key: 'NFL', label: 'NFL', sportType: 'FOOTBALL' },
  { key: 'NHL', label: 'NHL', sportType: 'HOCKEY' },
  { key: 'MLS', label: 'MLS', sportType: 'SOCCER' },
];

function getItemBadges(item: ChecklistItem) {
  const badges = [];

  if (item.rookieCard) badges.push('RC');
  if (item.autograph) badges.push('Auto');
  if (item.relic) badges.push('Relic');
  if (item.parallelName) badges.push(item.parallelName);

  return badges;
}

function includesText(value: string | null | undefined, query: string) {
  return (value ?? '').toLowerCase().includes(query);
}

function getActiveFilter(league: string | null) {
  return (
    leagueFilters.find((filter) => filter.key === league?.toUpperCase()) ??
    leagueFilters[0]
  );
}

function ChecklistsContent() {
  const searchParams = useSearchParams();
  const activeFilter = getActiveFilter(searchParams.get('league'));
  const [checklists, setChecklists] = useState<ProductChecklist[]>([]);
  const [selectedProductId, setSelectedProductId] = useState('ALL');
  const [searchKeyword, setSearchKeyword] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchChecklists = async () => {
      try {
        setIsLoading(true);

        const response = await fetch(`${API_BASE_URL}/product/checklists`, {
          cache: 'no-store',
        });

        if (!response.ok) {
          throw new Error('체크리스트 조회 실패');
        }

        setChecklists((await response.json()) as ProductChecklist[]);
      } catch (error) {
        console.error(error);
        setChecklists([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchChecklists();
  }, []);

  useEffect(() => {
    setSelectedProductId('ALL');
  }, [activeFilter.key]);

  const leagueChecklists = useMemo(() => {
    if (!activeFilter.sportType) return checklists;

    return checklists.filter(
      (checklist) => checklist.sportType === activeFilter.sportType
    );
  }, [activeFilter.sportType, checklists]);

  const filteredChecklists = useMemo(() => {
    const query = searchKeyword.trim().toLowerCase();

    return leagueChecklists
      .filter((checklist) =>
        selectedProductId === 'ALL'
          ? true
          : String(checklist.productId) === selectedProductId
      )
      .map((checklist) => ({
        ...checklist,
        items: query
          ? checklist.items.filter(
              (item) =>
                includesText(item.sectionName, query) ||
                includesText(item.cardNumber, query) ||
                includesText(item.playerName, query) ||
                includesText(item.teamName, query) ||
                includesText(item.parallelName, query) ||
                includesText(item.notes, query)
            )
          : checklist.items,
      }))
      .filter((checklist) => checklist.items.length > 0 || !query);
  }, [leagueChecklists, searchKeyword, selectedProductId]);

  return (
    <main className="min-h-screen bg-[#f5f5f5] px-5 py-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-6 border-b border-gray-300 pb-6">
          <p className="text-sm font-black uppercase tracking-[0.24em] text-[#d71920]">
            Product Checklist
          </p>
          <h1 className="mt-2 text-3xl font-black text-black">체크리스트</h1>
        </div>

        <div className="mb-6 grid gap-3 md:grid-cols-[1fr_2fr]">
          <label className="block">
            <span className="text-sm font-black text-black">상품</span>
            <select
              value={selectedProductId}
              onChange={(event) => setSelectedProductId(event.target.value)}
              className="mt-2 h-11 w-full rounded-md border border-gray-300 bg-white px-3 text-sm font-bold text-black outline-none focus:border-black"
            >
              <option value="ALL">전체 상품</option>
              {leagueChecklists.map((checklist) => (
                <option key={checklist.productId} value={checklist.productId}>
                  {checklist.releaseYear ? `${checklist.releaseYear} ` : ''}
                  {checklist.productLabel}
                </option>
              ))}
            </select>
          </label>

          <label className="block">
            <span className="text-sm font-black text-black">검색</span>
            <input
              type="search"
              value={searchKeyword}
              onChange={(event) => setSearchKeyword(event.target.value)}
              placeholder="선수, 팀, 카드 번호, 섹션 검색"
              className="mt-2 h-11 w-full rounded-md border border-gray-300 bg-white px-3 text-sm font-bold text-black outline-none focus:border-black"
            />
          </label>
        </div>

        {isLoading ? (
          <div className="border border-gray-300 bg-white px-6 py-16 text-center text-sm font-bold text-gray-500">
            체크리스트를 불러오는 중입니다.
          </div>
        ) : filteredChecklists.length === 0 ? (
          <div className="border border-dashed border-gray-400 bg-white px-6 py-16 text-center text-sm font-bold text-gray-500">
            표시할 체크리스트가 없습니다.
          </div>
        ) : (
          <div className="space-y-8">
            {filteredChecklists.map((checklist) => (
              <section
                key={checklist.productId}
                className="overflow-hidden rounded-md border border-gray-300 bg-white"
              >
                <div className="grid gap-0 md:grid-cols-[180px_1fr]">
                  <div
                    className="min-h-[220px] border-b border-gray-300 bg-gray-100 bg-cover bg-center md:border-b-0 md:border-r"
                    style={{
                      backgroundImage: checklist.imageUrl
                        ? `url(${checklist.imageUrl})`
                        : undefined,
                    }}
                  >
                    {!checklist.imageUrl && (
                      <div className="flex h-full min-h-[220px] items-center justify-center text-sm font-black text-gray-400">
                        No Image
                      </div>
                    )}
                  </div>

                  <div>
                    <div className="flex flex-col gap-3 border-b border-gray-200 px-5 py-4 lg:flex-row lg:items-end lg:justify-between">
                      <div>
                        <Link
                          href={`/products/${checklist.productId}`}
                          className="text-xl font-black text-black hover:text-[#d71920]"
                        >
                          {checklist.releaseYear ? `${checklist.releaseYear} ` : ''}
                          {checklist.productLabel}
                        </Link>
                        <div className="mt-2 flex flex-wrap gap-2 text-xs font-black text-gray-500">
                          <span>{checklist.sportType}</span>
                          <span>{checklist.releaseDate ?? '발매일 미정'}</span>
                          <span>{checklist.items.length} cards</span>
                        </div>
                      </div>

                      {checklist.sourceUrl && (
                        <a
                          href={checklist.sourceUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex h-10 items-center rounded-md border border-gray-300 px-4 text-sm font-black text-black transition hover:border-black"
                        >
                          원본 체크리스트
                        </a>
                      )}
                    </div>

                    <div className="overflow-x-auto">
                      <table className="min-w-full border-collapse text-left">
                        <thead className="bg-black text-xs font-black uppercase text-white">
                          <tr>
                            <th className="whitespace-nowrap px-5 py-3">No.</th>
                            <th className="whitespace-nowrap px-5 py-3">Player</th>
                            <th className="whitespace-nowrap px-5 py-3">Team</th>
                            <th className="whitespace-nowrap px-5 py-3">Section</th>
                            <th className="whitespace-nowrap px-5 py-3">Tags</th>
                            <th className="whitespace-nowrap px-5 py-3">Notes</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                          {checklist.items.map((item) => {
                            const badges = getItemBadges(item);

                            return (
                              <tr key={item.id} className="text-sm">
                                <td className="whitespace-nowrap px-5 py-4 font-black text-black">
                                  {item.cardNumber}
                                </td>
                                <td className="whitespace-nowrap px-5 py-4 font-black text-black">
                                  {item.playerName}
                                </td>
                                <td className="whitespace-nowrap px-5 py-4 font-bold text-gray-700">
                                  {item.teamName || '-'}
                                </td>
                                <td className="whitespace-nowrap px-5 py-4 font-semibold text-gray-700">
                                  {item.sectionName}
                                </td>
                                <td className="min-w-[180px] px-5 py-4">
                                  {badges.length === 0 ? (
                                    <span className="font-bold text-gray-400">-</span>
                                  ) : (
                                    <div className="flex flex-wrap gap-1.5">
                                      {badges.map((badge) => (
                                        <span
                                          key={badge}
                                          className="inline-flex rounded-md border border-gray-300 bg-gray-50 px-2 py-1 text-xs font-black text-gray-700"
                                        >
                                          {badge}
                                        </span>
                                      ))}
                                    </div>
                                  )}
                                </td>
                                <td className="min-w-[240px] px-5 py-4 text-gray-700">
                                  {item.notes || '-'}
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
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

export default function ChecklistsPage() {
  return (
    <Suspense fallback={null}>
      <ChecklistsContent />
    </Suspense>
  );
}
