'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';

const API_BASE_URL = process.env.NEXT_PUBLIC_SERVER_URL ?? '';

type PytStatus =
  | 'DRAFT'
  | 'OPEN'
  | 'FILLER_OPEN'
  | 'FILLER_SOLD_OUT'
  | 'SOLD_OUT'
  | 'READY'
  | 'COMPLETED'
  | 'CANCELLED';

interface PytListItem {
  id: number;
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

const statusFilters = [
  { label: '전체', value: 'ALL' },
  { label: '모집중', value: 'OPEN' },
  { label: '필러중', value: 'FILLER_OPEN' },
  { label: '마감', value: 'SOLD_OUT' },
];

function getStatusLabel(status: PytStatus) {
  switch (status) {
    case 'OPEN':
      return '모집중';
    case 'FILLER_OPEN':
      return '필러중';
    case 'SOLD_OUT':
      return '마감';
    case 'COMPLETED':
      return '완료';
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
      : status === 'FILLER_OPEN'
        ? 'border-black bg-[#ffd84d] text-black'
        : status === 'SOLD_OUT'
          ? 'border-gray-500 bg-gray-200 text-gray-700'
          : 'border-black bg-black text-white';

  return (
    <span className={`inline-flex rounded-full border px-3 py-1 text-xs font-black ${className}`}>
      {getStatusLabel(status)}
    </span>
  );
}

function PytCard({ pyt }: { pyt: PytListItem }) {
  const soldTeamCount = pyt.totalTeamCount - pyt.remainingTeamCount;
  const progressPercent =
    pyt.totalTeamCount > 0 ? Math.round((soldTeamCount / pyt.totalTeamCount) * 100) : 0;

  return (
    <Link
      href={`/pyt/${pyt.id}`}
      className="group block overflow-hidden rounded-[24px] border border-black bg-white shadow-[6px_6px_0_#111] transition hover:-translate-y-1 hover:shadow-[9px_9px_0_#111]"
    >
      <div className="grid gap-0 md:grid-cols-[220px_1fr]">
        <div className="border-b border-black bg-[#eee8df] md:border-b-0 md:border-r">
          <div className="aspect-[4/3] h-full w-full md:aspect-auto">
            {pyt.imageUrl ? (
              <img
                src={pyt.imageUrl}
                alt={pyt.title}
                className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
              />
            ) : (
              <div className="flex h-full min-h-[220px] items-center justify-center bg-[#f1eee8] text-sm font-black text-gray-500">
                No Image
              </div>
            )}
          </div>
        </div>

        <div className="p-6">
          <div className="mb-4 flex flex-wrap items-center gap-2">
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

          <p className="text-xs font-black uppercase tracking-[0.25em] text-[#d71920]">
            PYT Break
          </p>

          <h2 className="mt-2 text-2xl font-black leading-tight text-black">
            {pyt.title}
          </h2>

          <div className="mt-5 grid gap-3 text-sm font-bold text-gray-700 sm:grid-cols-3">
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

          <div className="mt-6">
            <div className="mb-2 flex items-center justify-between text-sm font-black">
              <span>진행률</span>
              <span>
                {soldTeamCount} / {pyt.totalTeamCount} teams
              </span>
            </div>

            <div className="h-3 overflow-hidden rounded-full border border-black bg-[#f1f1f1]">
              <div
                className="h-full bg-[#d71920]"
                style={{ width: `${progressPercent}%` }}
              />
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

export default function PytPage() {
  const [pytList, setPytList] = useState<PytListItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');
  const [selectedSport, setSelectedSport] = useState('ALL');
  const [selectedStatus, setSelectedStatus] = useState('ALL');

  useEffect(() => {
    const fetchPytList = async () => {
      try {
        setIsLoading(true);
        setErrorMessage('');

        const response = await fetch(`${API_BASE_URL}/pyt`);

        if (!response.ok) {
          throw new Error(await response.text());
        }

        const data = (await response.json()) as PytListItem[];
        setPytList(data);
      } catch (error) {
        console.error(error);
        setErrorMessage('PYT 목록을 불러오지 못했습니다.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchPytList();
  }, []);

  const sportFilters = useMemo(() => {
    return ['ALL', ...Array.from(new Set(pytList.map((pyt) => pyt.sportType)))];
  }, [pytList]);

  const filteredPytList = useMemo(() => {
    return pytList.filter((pyt) => {
      const sportMatched = selectedSport === 'ALL' || pyt.sportType === selectedSport;
      const statusMatched = selectedStatus === 'ALL' || pyt.pytStatus === selectedStatus;

      return sportMatched && statusMatched;
    });
  }, [pytList, selectedSport, selectedStatus]);

  return (
    <main className="min-h-screen bg-[#f6f3ee]">
      <div className="mx-auto max-w-7xl px-6 py-10">
        <section className="overflow-hidden rounded-[28px] border border-black bg-white shadow-[8px_8px_0_#111]">
          <div className="border-b border-black bg-black px-8 py-4">
            <p className="text-sm font-black uppercase tracking-[0.3em] text-[#ff4b4b]">
              Pick Your Team
            </p>
          </div>

          <div className="grid gap-8 bg-white px-8 py-12 lg:grid-cols-[1fr_260px] lg:items-center">
            <div>
              <h1 className="text-5xl font-black leading-tight text-black">
                PYT
                <br />
                Breaks
              </h1>

              <p className="mt-5 max-w-xl text-base font-semibold text-gray-700">
                원하는 팀을 직접 선택하고 스포츠 카드 브레이크에 참가하세요.
              </p>
            </div>

            <Link
              href="/pyt/create"
              className="inline-flex h-14 items-center justify-center rounded-md bg-[#d71920] px-6 text-base font-black text-white transition hover:bg-black"
            >
              PYT 생성하기
            </Link>
          </div>
        </section>

        <section className="mt-10 rounded-[24px] border border-black bg-white p-5 shadow-[5px_5px_0_#111]">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex flex-wrap gap-2">
              {sportFilters.map((sport) => (
                <button
                  key={sport}
                  type="button"
                  onClick={() => setSelectedSport(sport)}
                  className={`rounded-full border px-4 py-2 text-sm font-black transition ${
                    selectedSport === sport
                      ? 'border-black bg-black text-white'
                      : 'border-black bg-white text-black hover:bg-[#d71920] hover:text-white'
                  }`}
                >
                  {sport === 'ALL' ? '전체' : sport}
                </button>
              ))}
            </div>

            <div className="flex flex-wrap gap-2">
              {statusFilters.map((status) => (
                <button
                  key={status.value}
                  type="button"
                  onClick={() => setSelectedStatus(status.value)}
                  className={`rounded-full border px-4 py-2 text-sm font-black transition ${
                    selectedStatus === status.value
                      ? 'border-black bg-black text-white'
                      : 'border-black bg-white text-black hover:bg-[#d71920] hover:text-white'
                  }`}
                >
                  {status.label}
                </button>
              ))}
            </div>
          </div>
        </section>

        <section className="mt-10">
          {isLoading ? (
            <div className="rounded-2xl border-2 border-dashed border-black bg-white px-6 py-12 text-center text-sm font-bold text-gray-500">
              PYT 목록을 불러오는 중입니다.
            </div>
          ) : errorMessage ? (
            <div className="rounded-2xl border-2 border-dashed border-[#d71920] bg-white px-6 py-12 text-center text-sm font-bold text-[#d71920]">
              {errorMessage}
            </div>
          ) : filteredPytList.length === 0 ? (
            <div className="rounded-2xl border-2 border-dashed border-black bg-white px-6 py-12 text-center text-sm font-bold text-gray-500">
              표시할 PYT가 없습니다.
            </div>
          ) : (
            <div className="space-y-7">
              {filteredPytList.map((pyt) => (
                <PytCard key={pyt.id} pyt={pyt} />
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
