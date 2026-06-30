'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';

const API_BASE_URL = process.env.NEXT_PUBLIC_SERVER_URL ?? '';

type ProductStatus = 'ON_SALE' | 'UPCOMING' | 'ENDED' | 'UNKNOWN';
type ProductTab = 'checklist' | 'tier' | 'pyt';
type TierGrade = 'S' | 'A' | 'B' | 'C' | 'D' | 'F';
type PytStatus =
  | 'DRAFT'
  | 'OPEN'
  | 'FILLER_OPEN'
  | 'FILLER_SOLD_OUT'
  | 'SOLD_OUT'
  | 'READY'
  | 'COMPLETED'
  | 'CANCELLED';

interface TeamTier {
  id: number;
  teamName: string;
  expectedPytPrice: number | null;
  tierGrade: TierGrade;
  keyPlayers: string | null;
  commentText: string | null;
  aiSummary: string | null;
}

interface TierCriteria {
  id: number;
  criteriaType: string;
  criteriaName: string;
  description: string | null;
  teamTiers: TeamTier[];
}

interface ProductDetail {
  id: number;
  brandName: string;
  productName: string;
  releaseYear: number | null;
  releaseDate: string | null;
  status: ProductStatus;
  imageUrl: string | null;
  checklistUrl: string | null;
  tierCriteria: TierCriteria[];
}

interface ChecklistItem {
  id: number;
  sectionName: string | null;
  cardNumber: string | null;
  playerName: string | null;
  teamId: number | null;
  teamName: string | null;
  parallelName: string | null;
  rookieCard: boolean | null;
  autograph: boolean | null;
  relic: boolean | null;
  notes: string | null;
}

interface ProductChecklist {
  productId: number;
  sourceUrl: string | null;
  items: ChecklistItem[];
}

interface PytListItem {
  id: number;
  cardProductId: number;
  title: string;
  brandName: string;
  productName: string;
  imageUrl: string;
  sportType: string;
  optionName: string;
  boxType: string;
  breakUnitType: 'FULL_CASE' | 'HALF_CASE' | 'BOX' | 'CUSTOM';
  roundNo: number;
  boxCount: number;
  pytStatus: PytStatus;
  totalTeamCount: number;
  remainingTeamCount: number;
  fillerEnabled: boolean;
}

const tabs: { label: string; value: ProductTab }[] = [
  { label: '체크리스트', value: 'checklist' },
  { label: '티어표', value: 'tier' },
  { label: 'PYT', value: 'pyt' },
];

const activePytStatuses = new Set<PytStatus>([
  'OPEN',
  'FILLER_OPEN',
  'FILLER_SOLD_OUT',
  'SOLD_OUT',
  'READY',
]);

const tierOrder: Record<TierGrade, number> = {
  S: 0,
  A: 1,
  B: 2,
  C: 3,
  D: 4,
  F: 5,
};
const CHECKLIST_ALL_SECTION_KEY = 'ALL';
const CHECKLIST_TEAM_SET_SECTION_KEY = 'TEAM_SET';
const CHECKLIST_ALL_TEAM_KEY = 'ALL';

function getProductTitle(product: ProductDetail) {
  return `${product.releaseYear ? `${product.releaseYear} ` : ''}${product.brandName} ${
    product.productName
  }`;
}

function getPriceLabel(value: number | null) {
  if (value === null || value === undefined) return '-';

  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(value);
}

function getProductStatusLabel(status: ProductStatus) {
  switch (status) {
    case 'ON_SALE':
      return '현재 발매중';
    case 'UPCOMING':
      return '발매 예정';
    case 'ENDED':
      return '발매 종료';
    default:
      return '상태 미정';
  }
}

function getProductStatusClass(status: ProductStatus) {
  switch (status) {
    case 'ON_SALE':
      return 'border-[#d71920] bg-[#d71920] text-white';
    case 'UPCOMING':
      return 'border-black bg-[#ffd84d] text-black';
    case 'ENDED':
      return 'border-gray-500 bg-gray-200 text-gray-700';
    default:
      return 'border-gray-400 bg-white text-gray-600';
  }
}

function getPytStatusLabel(status: PytStatus) {
  switch (status) {
    case 'OPEN':
      return '모집중';
    case 'FILLER_OPEN':
      return '필러중';
    case 'FILLER_SOLD_OUT':
      return '필러 마감';
    case 'SOLD_OUT':
      return '마감';
    case 'READY':
      return '진행 준비';
    case 'COMPLETED':
      return '완료';
    case 'CANCELLED':
      return '취소';
    case 'DRAFT':
      return '작성중';
    default:
      return status;
  }
}

function getBreakUnitLabel(type: PytListItem['breakUnitType']) {
  switch (type) {
    case 'FULL_CASE':
      return '1 Case';
    case 'HALF_CASE':
      return 'Half Case';
    case 'BOX':
      return 'Box';
    case 'CUSTOM':
      return 'Custom';
    default:
      return type;
  }
}

function PytStatusBadge({ status }: { status: PytStatus }) {
  const className =
    status === 'OPEN'
      ? 'border-[#d71920] bg-[#d71920] text-white'
      : status === 'FILLER_OPEN' || status === 'FILLER_SOLD_OUT'
        ? 'border-black bg-[#ffd84d] text-black'
        : status === 'SOLD_OUT'
          ? 'border-gray-500 bg-gray-200 text-gray-700'
          : 'border-black bg-black text-white';

  return (
    <span className={`inline-flex rounded-full border px-3 py-1 text-xs font-black ${className}`}>
      {getPytStatusLabel(status)}
    </span>
  );
}

function ChecklistBadges({ item }: { item: ChecklistItem }) {
  const badges = [
    item.parallelName,
    item.rookieCard ? 'RC' : null,
    item.autograph ? 'Auto' : null,
    item.relic ? 'Relic' : null,
  ].filter(Boolean);

  if (badges.length === 0) {
    return <span className="text-sm font-semibold text-gray-400">-</span>;
  }

  return (
    <div className="flex flex-wrap gap-1.5">
      {badges.map((badge) => (
        <span
          key={badge}
          className="rounded-full border border-black bg-[#f6f3ee] px-2.5 py-1 text-xs font-black text-black"
        >
          {badge}
        </span>
      ))}
    </div>
  );
}

function PytCard({ pyt }: { pyt: PytListItem }) {
  const soldTeamCount = pyt.totalTeamCount - pyt.remainingTeamCount;
  const progressPercent =
    pyt.totalTeamCount > 0 ? Math.round((soldTeamCount / pyt.totalTeamCount) * 100) : 0;

  return (
    <Link
      href={`/pyt/${pyt.id}`}
      className="group block overflow-hidden rounded-[24px] border border-black bg-white shadow-[5px_5px_0_#111] transition hover:-translate-y-1 hover:shadow-[8px_8px_0_#111]"
    >
      <div className="grid gap-0 md:grid-cols-[180px_1fr]">
        <div className="border-b border-black bg-[#eee8df] md:border-b-0 md:border-r">
          <div className="aspect-[4/3] h-full w-full md:aspect-auto">
            {pyt.imageUrl ? (
              <img
                src={pyt.imageUrl}
                alt={pyt.title}
                className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
              />
            ) : (
              <div className="flex h-full min-h-[180px] items-center justify-center bg-[#f1eee8] text-sm font-black text-gray-500">
                No Image
              </div>
            )}
          </div>
        </div>

        <div className="p-5">
          <div className="mb-3 flex flex-wrap items-center gap-2">
            <PytStatusBadge status={pyt.pytStatus} />
            <span className="rounded-full border border-black bg-white px-3 py-1 text-xs font-black text-black">
              {pyt.sportType}
            </span>
            {pyt.fillerEnabled && (
              <span className="rounded-full border border-black bg-[#f6f3ee] px-3 py-1 text-xs font-black text-black">
                Filler 가능
              </span>
            )}
          </div>

          <h3 className="text-xl font-black leading-tight text-black group-hover:text-[#d71920]">
            {pyt.title}
          </h3>

          <div className="mt-4 grid gap-3 text-sm font-bold text-gray-700 sm:grid-cols-3">
            <div className="rounded-xl border border-black bg-[#f6f3ee] px-4 py-3">
              <span className="block text-xs font-black text-gray-500">Option</span>
              {pyt.optionName}
            </div>

            <div className="rounded-xl border border-black bg-[#f6f3ee] px-4 py-3">
              <span className="block text-xs font-black text-gray-500">Break</span>
              {getBreakUnitLabel(pyt.breakUnitType)}
            </div>

            <div className="rounded-xl border border-black bg-[#f6f3ee] px-4 py-3">
              <span className="block text-xs font-black text-gray-500">Round</span>
              #{pyt.roundNo}
            </div>
          </div>

          <div className="mt-5">
            <div className="mb-2 flex items-center justify-between text-sm font-black">
              <span>진행률</span>
              <span>
                {soldTeamCount} / {pyt.totalTeamCount} teams
              </span>
            </div>

            <div className="h-3 overflow-hidden rounded-full border border-black bg-[#f1f1f1]">
              <div className="h-full bg-[#d71920]" style={{ width: `${progressPercent}%` }} />
            </div>

            <p className="mt-3 text-sm font-bold text-gray-600">
              남은 팀 {pyt.remainingTeamCount}개
            </p>
          </div>
        </div>
      </div>
    </Link>
  );
}

function ChecklistTab({
  checklist,
  sourceUrl,
  isLoading,
  errorMessage,
}: {
  checklist: ProductChecklist | null;
  sourceUrl: string | null;
  isLoading: boolean;
  errorMessage: string;
}) {
  const [activeSection, setActiveSection] = useState(CHECKLIST_ALL_SECTION_KEY);
  const [activeTeam, setActiveTeam] = useState(CHECKLIST_ALL_TEAM_KEY);
  const sectionOptions = useMemo(() => {
    const sectionCounts = new Map<string, number>();

    for (const item of checklist?.items ?? []) {
      const sectionName = item.sectionName?.trim() || '미분류';
      sectionCounts.set(sectionName, (sectionCounts.get(sectionName) ?? 0) + 1);
    }

    return [
      { key: CHECKLIST_ALL_SECTION_KEY, label: '전체', count: checklist?.items.length ?? 0 },
      {
        key: CHECKLIST_TEAM_SET_SECTION_KEY,
        label: 'Team Set',
        count: new Set(
          (checklist?.items ?? []).map((item) => item.teamName?.trim() || '미분류')
        ).size,
      },
      ...Array.from(sectionCounts.entries())
        .filter(([sectionName]) => sectionName.toLowerCase() !== 'team set')
        .map(([sectionName, count]) => ({
          key: sectionName,
          label: sectionName,
          count,
        })),
    ];
  }, [checklist]);
  const effectiveActiveSection = sectionOptions.some((section) => section.key === activeSection)
    ? activeSection
    : CHECKLIST_ALL_SECTION_KEY;
  const teamSetItems = useMemo(() => {
    if (!checklist) return [];

    const explicitTeamSetItems = checklist.items.filter(
      (item) => (item.sectionName?.trim() || '').toLowerCase() === 'team set'
    );

    if (explicitTeamSetItems.length > 0) {
      return explicitTeamSetItems;
    }

    return checklist.items;
  }, [checklist]);
  const teamOptions = useMemo(() => {
    const teamCounts = new Map<string, number>();

    for (const item of teamSetItems) {
      const teamName = item.teamName?.trim() || '미분류';
      teamCounts.set(teamName, (teamCounts.get(teamName) ?? 0) + 1);
    }

    return [
      { key: CHECKLIST_ALL_TEAM_KEY, label: '전체', count: teamSetItems.length },
      ...Array.from(teamCounts.entries())
        .sort(([teamNameA], [teamNameB]) => teamNameA.localeCompare(teamNameB))
        .map(([teamName, count]) => ({
          key: teamName,
          label: teamName,
          count,
        })),
    ];
  }, [teamSetItems]);
  const effectiveActiveTeam = teamOptions.some((team) => team.key === activeTeam)
    ? activeTeam
    : CHECKLIST_ALL_TEAM_KEY;
  const visibleChecklistItems = useMemo(() => {
    if (!checklist) return [];
    if (effectiveActiveSection === CHECKLIST_ALL_SECTION_KEY) return checklist.items;

    if (effectiveActiveSection === CHECKLIST_TEAM_SET_SECTION_KEY) {
      if (effectiveActiveTeam === CHECKLIST_ALL_TEAM_KEY) return teamSetItems;

      return teamSetItems.filter(
        (item) => (item.teamName?.trim() || '미분류') === effectiveActiveTeam
      );
    }

    return checklist.items.filter(
      (item) => (item.sectionName?.trim() || '미분류') === effectiveActiveSection
    );
  }, [effectiveActiveSection, effectiveActiveTeam, checklist, teamSetItems]);

  if (isLoading) {
    return (
      <div className="rounded-2xl border-2 border-dashed border-black bg-white px-6 py-12 text-center text-sm font-bold text-gray-500">
        체크리스트를 불러오는 중입니다.
      </div>
    );
  }

  if (errorMessage) {
    return (
      <div className="rounded-2xl border-2 border-dashed border-[#d71920] bg-white px-6 py-12 text-center text-sm font-bold text-[#d71920]">
        {errorMessage}
      </div>
    );
  }

  if (!checklist || checklist.items.length === 0) {
    return (
      <div className="rounded-2xl border-2 border-dashed border-black bg-white px-6 py-12 text-center text-sm font-bold text-gray-500">
        등록된 체크리스트가 없습니다.
      </div>
    );
  }

  return (
    <section className="overflow-hidden rounded-[24px] border border-black bg-white shadow-[6px_6px_0_#111]">
      <div className="flex flex-col gap-3 border-b border-black bg-black px-6 py-5 text-white sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.25em] text-[#ff4b4b]">
            Checklist
          </p>
          <h2 className="mt-2 text-2xl font-black">체크리스트</h2>
        </div>

        {sourceUrl && (
          <a
            href={sourceUrl}
            target="_blank"
            rel="noreferrer"
            className="inline-flex h-10 items-center justify-center rounded-md border border-white px-4 text-sm font-black text-white transition hover:bg-white hover:text-black"
          >
            원본 보기
          </a>
        )}
      </div>

      <div className="border-b border-black bg-[#f6f3ee] px-5 py-4">
        <div className="flex gap-2 overflow-x-auto pb-1">
          {sectionOptions.map((section) => {
            const isActive = effectiveActiveSection === section.key;

            return (
              <button
                key={section.key}
                type="button"
                onClick={() => {
                  setActiveSection(section.key);
                  setActiveTeam(CHECKLIST_ALL_TEAM_KEY);
                }}
                className={`inline-flex h-10 shrink-0 items-center rounded-md border px-3 text-sm font-black transition ${
                  isActive
                    ? 'border-black bg-black text-white'
                    : 'border-gray-300 bg-white text-black hover:border-black'
                }`}
              >
                {section.label}
                <span
                  className={`ml-2 rounded-full px-2 py-0.5 text-xs ${
                    isActive ? 'bg-white text-black' : 'bg-[#f6f3ee] text-gray-700'
                  }`}
                >
                  {section.count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {effectiveActiveSection === CHECKLIST_TEAM_SET_SECTION_KEY && (
        <div className="border-b border-black bg-white px-5 py-4">
          <div className="flex gap-2 overflow-x-auto pb-1">
            {teamOptions.map((team) => {
              const isActive = effectiveActiveTeam === team.key;

              return (
                <button
                  key={team.key}
                  type="button"
                  onClick={() => setActiveTeam(team.key)}
                  className={`inline-flex h-10 shrink-0 items-center rounded-md border px-3 text-sm font-black transition ${
                    isActive
                      ? 'border-[#d71920] bg-[#d71920] text-white'
                      : 'border-gray-300 bg-[#f6f3ee] text-black hover:border-black'
                  }`}
                >
                  {team.label}
                  <span
                    className={`ml-2 rounded-full px-2 py-0.5 text-xs ${
                      isActive ? 'bg-white text-[#d71920]' : 'bg-white text-gray-700'
                    }`}
                  >
                    {team.count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      <div className="overflow-x-auto bg-white">
        <table className="min-w-full border-collapse">
          <thead>
            <tr className="bg-[#d71920] text-white">
              <th className="border-b border-black px-5 py-4 text-left text-xs font-black uppercase tracking-wider">
                Section
              </th>
              <th className="border-b border-black px-5 py-4 text-left text-xs font-black uppercase tracking-wider">
                No.
              </th>
              <th className="border-b border-black px-5 py-4 text-left text-xs font-black uppercase tracking-wider">
                Player
              </th>
              <th className="border-b border-black px-5 py-4 text-left text-xs font-black uppercase tracking-wider">
                Team
              </th>
              <th className="border-b border-black px-5 py-4 text-left text-xs font-black uppercase tracking-wider">
                Tags
              </th>
              <th className="border-b border-black px-5 py-4 text-left text-xs font-black uppercase tracking-wider">
                Notes
              </th>
            </tr>
          </thead>

          <tbody>
            {visibleChecklistItems.map((item, index) => (
              <tr key={item.id} className={index % 2 === 0 ? 'bg-white' : 'bg-[#f6f3ee]'}>
                <td className="border-b border-gray-300 px-5 py-4 text-sm font-bold text-gray-800">
                  {item.sectionName || '-'}
                </td>
                <td className="border-b border-gray-300 px-5 py-4 text-sm font-black text-black">
                  {item.cardNumber || '-'}
                </td>
                <td className="border-b border-gray-300 px-5 py-4 text-sm font-black text-black">
                  {item.playerName || '-'}
                </td>
                <td className="border-b border-gray-300 px-5 py-4 text-sm font-semibold text-gray-800">
                  {item.teamName || '-'}
                </td>
                <td className="border-b border-gray-300 px-5 py-4">
                  <ChecklistBadges item={item} />
                </td>
                <td className="border-b border-gray-300 px-5 py-4 text-sm text-gray-700">
                  {item.notes || '-'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

function TierTab({ product }: { product: ProductDetail }) {
  if (product.tierCriteria.length === 0) {
    return (
      <div className="rounded-2xl border-2 border-dashed border-black bg-white px-6 py-12 text-center text-sm font-bold text-gray-500">
        등록된 티어 기준이 없습니다.
      </div>
    );
  }

  return (
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

              <h2 className="mt-2 text-2xl font-black">{criteria.criteriaName}</h2>

              <p className="mt-2 text-sm text-gray-300">{criteria.description}</p>
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
                        PYT
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
                      <tr key={teamTier.id} className={index % 2 === 0 ? 'bg-white' : 'bg-[#f6f3ee]'}>
                        <td className="border-b border-gray-300 px-5 py-4">
                          <span className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-black bg-black text-sm font-black text-white">
                            {teamTier.tierGrade}
                          </span>
                        </td>

                        <td className="border-b border-gray-300 px-5 py-4 text-sm font-black text-black">
                          {teamTier.teamName}
                        </td>

                        <td className="border-b border-gray-300 px-5 py-4 text-sm font-bold text-gray-800">
                          {getPriceLabel(teamTier.expectedPytPrice)}
                        </td>

                        <td className="border-b border-gray-300 px-5 py-4 text-sm font-semibold text-gray-800">
                          {teamTier.keyPlayers || '-'}
                        </td>

                        <td className="border-b border-gray-300 px-5 py-4 text-sm text-gray-700">
                          {teamTier.commentText || teamTier.aiSummary || '-'}
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
  );
}

function PytTab({
  pytList,
  isLoading,
  errorMessage,
}: {
  pytList: PytListItem[];
  isLoading: boolean;
  errorMessage: string;
}) {
  if (isLoading) {
    return (
      <div className="rounded-2xl border-2 border-dashed border-black bg-white px-6 py-12 text-center text-sm font-bold text-gray-500">
        PYT 목록을 불러오는 중입니다.
      </div>
    );
  }

  if (errorMessage) {
    return (
      <div className="rounded-2xl border-2 border-dashed border-[#d71920] bg-white px-6 py-12 text-center text-sm font-bold text-[#d71920]">
        {errorMessage}
      </div>
    );
  }

  if (pytList.length === 0) {
    return (
      <div className="rounded-2xl border-2 border-dashed border-black bg-white px-6 py-12 text-center text-sm font-bold text-gray-500">
        진행 중인 PYT가 없습니다.
      </div>
    );
  }

  return (
    <div className="space-y-7">
      {pytList.map((pyt) => (
        <PytCard key={pyt.id} pyt={pyt} />
      ))}
    </div>
  );
}

export default function ProductDetailPage() {
  const params = useParams<{ productId: string }>();
  const productId = Number(params.productId);

  const [activeTab, setActiveTab] = useState<ProductTab>('checklist');
  const [product, setProduct] = useState<ProductDetail | null>(null);
  const [isProductLoading, setIsProductLoading] = useState(true);
  const [productErrorMessage, setProductErrorMessage] = useState('');
  const [checklist, setChecklist] = useState<ProductChecklist | null>(null);
  const [isChecklistLoading, setIsChecklistLoading] = useState(true);
  const [checklistErrorMessage, setChecklistErrorMessage] = useState('');
  const [pytList, setPytList] = useState<PytListItem[]>([]);
  const [isPytLoading, setIsPytLoading] = useState(true);
  const [pytErrorMessage, setPytErrorMessage] = useState('');

  useEffect(() => {
    if (!Number.isFinite(productId)) return;

    let isMounted = true;

    const fetchProduct = async () => {
      try {
        setIsProductLoading(true);
        setProductErrorMessage('');

        const response = await fetch(`${API_BASE_URL}/product/${productId}`, {
          cache: 'no-store',
        });

        if (!response.ok) {
          throw new Error(await response.text());
        }

        const data = (await response.json()) as ProductDetail;
        if (isMounted) {
          setProduct(data);
        }
      } catch (error) {
        console.error(error);
        if (isMounted) {
          setProductErrorMessage('상품 정보를 불러오지 못했습니다.');
          setProduct(null);
        }
      } finally {
        if (isMounted) {
          setIsProductLoading(false);
        }
      }
    };

    const fetchChecklist = async () => {
      try {
        setIsChecklistLoading(true);
        setChecklistErrorMessage('');

        const response = await fetch(`${API_BASE_URL}/product/checklists`, {
          cache: 'no-store',
        });

        if (!response.ok) {
          throw new Error(await response.text());
        }

        const data = (await response.json()) as ProductChecklist[];
        if (isMounted) {
          setChecklist(data.find((item) => item.productId === productId) ?? null);
        }
      } catch (error) {
        console.error(error);
        if (isMounted) {
          setChecklistErrorMessage('체크리스트를 불러오지 못했습니다.');
          setChecklist(null);
        }
      } finally {
        if (isMounted) {
          setIsChecklistLoading(false);
        }
      }
    };

    const fetchPytList = async () => {
      try {
        setIsPytLoading(true);
        setPytErrorMessage('');

        const response = await fetch(`${API_BASE_URL}/pyt`, {
          cache: 'no-store',
        });

        if (!response.ok) {
          throw new Error(await response.text());
        }

        const data = (await response.json()) as PytListItem[];
        if (isMounted) {
          setPytList(data);
        }
      } catch (error) {
        console.error(error);
        if (isMounted) {
          setPytErrorMessage('PYT 목록을 불러오지 못했습니다.');
          setPytList([]);
        }
      } finally {
        if (isMounted) {
          setIsPytLoading(false);
        }
      }
    };

    fetchProduct();
    fetchChecklist();
    fetchPytList();

    return () => {
      isMounted = false;
    };
  }, [productId]);

  const activeProductPytList = useMemo(() => {
    return pytList.filter(
      (pyt) => pyt.cardProductId === productId && activePytStatuses.has(pyt.pytStatus)
    );
  }, [productId, pytList]);

  if (isProductLoading) {
    return (
      <main className="min-h-screen bg-[#f6f3ee]">
        <div className="mx-auto max-w-7xl px-6 py-10">
          <div className="rounded-2xl border border-gray-200 bg-white p-8">
            <h1 className="text-2xl font-bold text-gray-900">상품을 불러오는 중입니다.</h1>
          </div>
        </div>
      </main>
    );
  }

  if (!product) {
    return (
      <main className="min-h-screen bg-[#f6f3ee]">
        <div className="mx-auto max-w-7xl px-6 py-10">
          <div className="rounded-2xl border-2 border-dashed border-[#d71920] bg-white p-8 text-center text-sm font-bold text-[#d71920]">
            {productErrorMessage || '상품 정보를 찾을 수 없습니다.'}
          </div>
        </div>
      </main>
    );
  }

  const checklistSourceUrl = checklist?.sourceUrl ?? product.checklistUrl;

  return (
    <main className="min-h-screen bg-[#f6f3ee]">
      <div className="mx-auto max-w-7xl px-6 py-8">
        <section className="overflow-hidden rounded-[28px] border border-black bg-white shadow-[8px_8px_0_#111]">
          <div className="grid gap-0 lg:grid-cols-[360px_1fr]">
            <div className="border-b border-black bg-[#eee8df] p-6 lg:border-b-0 lg:border-r">
              <div className="overflow-hidden rounded-2xl border border-black bg-white">
                <div className="aspect-[3/4] w-full bg-[#f1eee8]">
                  {product.imageUrl ? (
                    <img
                      src={product.imageUrl}
                      alt={getProductTitle(product)}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-sm font-bold text-gray-500">
                      No Image
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="flex flex-col justify-center p-8 lg:p-12">
              <div className="mb-4">
                <span
                  className={`inline-flex rounded-full border px-3 py-1 text-xs font-black tracking-wide ${getProductStatusClass(
                    product.status
                  )}`}
                >
                  {getProductStatusLabel(product.status)}
                </span>
              </div>

              <p className="mb-3 text-sm font-black uppercase tracking-[0.25em] text-[#d71920]">
                PYT Product
              </p>

              <h1 className="max-w-3xl text-4xl font-black leading-tight text-black lg:text-5xl">
                {getProductTitle(product)}
              </h1>

              <div className="mt-6 grid gap-3 text-sm font-semibold text-gray-800 sm:grid-cols-2">
                <div className="rounded-xl border border-black bg-[#f6f3ee] px-4 py-3">
                  <span className="block text-xs font-black uppercase text-gray-500">
                    Release Date
                  </span>
                  {product.releaseDate || '-'}
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

        <section className="mt-10">
          <div className="flex flex-wrap gap-2 border-b border-black pb-4">
            {tabs.map((tab) => (
              <button
                key={tab.value}
                type="button"
                onClick={() => setActiveTab(tab.value)}
                className={`rounded-full border px-5 py-2.5 text-sm font-black transition ${
                  activeTab === tab.value
                    ? 'border-black bg-black text-white'
                    : 'border-black bg-white text-black hover:bg-[#d71920] hover:text-white'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </section>

        <section className="mt-8">
          {activeTab === 'checklist' && (
            <ChecklistTab
              checklist={checklist}
              sourceUrl={checklistSourceUrl}
              isLoading={isChecklistLoading}
              errorMessage={checklistErrorMessage}
            />
          )}

          {activeTab === 'tier' && <TierTab product={product} />}

          {activeTab === 'pyt' && (
            <PytTab
              pytList={activeProductPytList}
              isLoading={isPytLoading}
              errorMessage={pytErrorMessage}
            />
          )}
        </section>
      </div>
    </main>
  );
}
