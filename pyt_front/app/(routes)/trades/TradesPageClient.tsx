'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';

const API_BASE_URL = process.env.NEXT_PUBLIC_SERVER_URL ?? '';

type CardTradeStatus = 'ON_SALE' | 'SOLD_OUT' | 'HIDDEN';

interface CardTradeListItem {
  id: number;
  title: string;
  leagueName: string;
  playerName: string;
  teamName: string | null;
  cardYear: string | null;
  brandName: string | null;
  gradeCompany: string | null;
  grade: string | null;
  conditionLabel: string;
  price: number;
  shippingFee: number;
  imageUrl: string | null;
  tradeStatus: CardTradeStatus;
  sellerUserId: string;
  sellerNickname: string | null;
  createdAt: string;
}

const categoryFilters = ['ALL', 'MLB', 'NBA', 'NFL', 'NHL', 'MLS'];

function formatCurrency(value: number) {
  return `${new Intl.NumberFormat('ko-KR').format(Number(value || 0))}원`;
}

function getStatusLabel(status: CardTradeStatus) {
  switch (status) {
    case 'ON_SALE':
      return '판매중';
    case 'SOLD_OUT':
      return '판매완료';
    default:
      return status;
  }
}

function TradeImage({ trade }: { trade: CardTradeListItem }) {
  if (trade.imageUrl) {
    return (
      <img
        src={trade.imageUrl}
        alt={trade.title}
        className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
      />
    );
  }

  return (
    <div className="flex h-full min-h-[260px] items-center justify-center bg-[#e9eef2] p-6">
      <div className="flex aspect-[2.5/3.5] w-32 flex-col justify-between rounded-md border border-black bg-white p-4 shadow-[5px_5px_0_#111]">
        <div>
          <p className="text-xs font-black text-[#d71920]">{trade.leagueName}</p>
          <p className="mt-2 text-lg font-black leading-tight text-black">
            {trade.playerName}
          </p>
        </div>
        <p className="text-xs font-black text-gray-500">
          {trade.brandName || 'Trading Card'}
        </p>
      </div>
    </div>
  );
}

function TradeCard({ trade }: { trade: CardTradeListItem }) {
  const isSold = trade.tradeStatus === 'SOLD_OUT';

  return (
    <Link
      href={`/trades/${trade.id}`}
      className="group block overflow-hidden rounded-md border border-black bg-white shadow-[5px_5px_0_#111] transition hover:-translate-y-1 hover:shadow-[8px_8px_0_#111]"
    >
      <div className="aspect-[4/3] overflow-hidden border-b border-black">
        <TradeImage trade={trade} />
      </div>

      <div className="p-5">
        <div className="mb-3 flex flex-wrap gap-2">
          <span
            className={`rounded-full border px-3 py-1 text-xs font-black ${
              isSold
                ? 'border-gray-400 bg-gray-200 text-gray-600'
                : 'border-[#d71920] bg-[#d71920] text-white'
            }`}
          >
            {getStatusLabel(trade.tradeStatus)}
          </span>
          <span className="rounded-full border border-black px-3 py-1 text-xs font-black text-black">
            {trade.leagueName}
          </span>
        </div>

        <h2 className="line-clamp-2 min-h-[3.5rem] text-xl font-black leading-tight text-black">
          {trade.title}
        </h2>

        <div className="mt-4 space-y-1 text-sm font-bold text-gray-600">
          <p>
            {trade.playerName}
            {trade.teamName ? ` / ${trade.teamName}` : ''}
          </p>
          <p>
            {[trade.cardYear, trade.brandName].filter(Boolean).join(' ') ||
              trade.conditionLabel}
          </p>
          <p>
            {[trade.gradeCompany, trade.grade].filter(Boolean).join(' ') ||
              trade.conditionLabel}
          </p>
        </div>

        <div className="mt-5 flex items-end justify-between gap-3">
          <div>
            <p className="text-xs font-black text-gray-500">판매가</p>
            <p className="text-2xl font-black text-black">
              {formatCurrency(trade.price)}
            </p>
          </div>
          <p className="text-xs font-bold text-gray-500">
            배송 {formatCurrency(trade.shippingFee)}
          </p>
        </div>
      </div>
    </Link>
  );
}

export default function TradesPageClient() {
  const searchParams = useSearchParams();
  const selectedCategory = searchParams.get('category') || 'ALL';
  const [trades, setTrades] = useState<CardTradeListItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    let isMounted = true;

    const fetchTrades = async () => {
      try {
        setIsLoading(true);
        setErrorMessage('');

        const query =
          selectedCategory && selectedCategory !== 'ALL'
            ? `?category=${encodeURIComponent(selectedCategory)}`
            : '';
        const response = await fetch(`${API_BASE_URL}/trades${query}`, {
          cache: 'no-store',
        });

        if (!response.ok) {
          throw new Error(await response.text());
        }

        const data = (await response.json()) as CardTradeListItem[];
        if (isMounted) {
          setTrades(data);
        }
      } catch (error) {
        console.error(error);
        if (isMounted) {
          setErrorMessage('카드 거래 목록을 불러오지 못했습니다.');
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    fetchTrades();

    return () => {
      isMounted = false;
    };
  }, [selectedCategory]);

  const totalOnSaleCount = useMemo(
    () => trades.filter((trade) => trade.tradeStatus === 'ON_SALE').length,
    [trades]
  );

  return (
    <main className="min-h-[calc(100vh-88px)] bg-[#f6f3ee] px-5 py-10">
      <div className="mx-auto max-w-7xl">
        <div className="mb-6 flex flex-col gap-4 border-b border-black pb-6 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-sm font-black text-[#d71920]">Card Trades</p>
            <h1 className="mt-2 text-4xl font-black text-black">카드 거래</h1>
          </div>
          <div className="text-sm font-black text-gray-600">
            판매중 <span className="text-black">{totalOnSaleCount}</span>건
          </div>
        </div>

        <div className="mb-6 flex flex-wrap gap-2">
          {categoryFilters.map((category) => {
            const href = category === 'ALL' ? '/trades' : `/trades?category=${category}`;
            const isActive = selectedCategory === category;

            return (
              <Link
                key={category}
                href={href}
                className={`inline-flex h-10 items-center rounded-md border px-4 text-sm font-black transition ${
                  isActive
                    ? 'border-black bg-black text-white'
                    : 'border-black bg-white text-black hover:bg-[#d71920] hover:text-white'
                }`}
              >
                {category === 'ALL' ? '전체' : category}
              </Link>
            );
          })}
        </div>

        {errorMessage && (
          <div className="mb-5 rounded-md border border-[#d71920] bg-red-50 px-4 py-3 text-sm font-bold text-[#d71920]">
            {errorMessage}
          </div>
        )}

        {isLoading ? (
          <div className="rounded-md border border-black bg-white p-10 text-center text-sm font-bold text-gray-500">
            카드 거래 목록을 불러오는 중입니다.
          </div>
        ) : trades.length === 0 ? (
          <div className="rounded-md border border-black bg-white p-10 text-center">
            <p className="text-lg font-black text-black">
              등록된 카드 거래가 없습니다.
            </p>
            <p className="mt-2 text-sm font-bold text-gray-500">
              판매중인 카드가 등록되면 이곳에 표시됩니다.
            </p>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
            {trades.map((trade) => (
              <TradeCard key={trade.id} trade={trade} />
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
