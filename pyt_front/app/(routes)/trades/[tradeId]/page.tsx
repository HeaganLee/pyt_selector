'use client';

import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';

const API_BASE_URL = process.env.NEXT_PUBLIC_SERVER_URL ?? '';

type CardTradeStatus = 'ON_SALE' | 'SOLD_OUT' | 'HIDDEN';

interface CardTradeDetail {
  id: number;
  title: string;
  leagueName: string;
  playerName: string;
  teamName: string | null;
  cardYear: string | null;
  brandName: string | null;
  cardNumber: string | null;
  gradeCompany: string | null;
  grade: string | null;
  conditionLabel: string;
  price: number;
  shippingFee: number;
  imageUrl: string | null;
  description: string | null;
  tradeStatus: CardTradeStatus;
  sellerUserId: string;
  sellerNickname: string | null;
  createdAt: string;
}

function getCookie(key: string) {
  if (typeof document === 'undefined') return null;

  const cookies = document.cookie.split('; ');
  const targetCookie = cookies.find((cookie) => cookie.startsWith(`${key}=`));

  if (!targetCookie) return null;

  return decodeURIComponent(targetCookie.split('=')[1]);
}

function formatCurrency(value: number) {
  return `${new Intl.NumberFormat('ko-KR').format(Number(value || 0))}원`;
}

function formatDate(value: string | null) {
  if (!value) return '-';

  return new Intl.DateTimeFormat('ko-KR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(new Date(value));
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

function DetailRow({
  label,
  value,
}: {
  label: string;
  value: string | number | null | undefined;
}) {
  return (
    <div className="border-b border-gray-200 py-4 last:border-b-0">
      <p className="text-sm font-black text-gray-500">{label}</p>
      <p className="mt-2 text-base font-bold text-black">
        {value || '-'}
      </p>
    </div>
  );
}

export default function TradeDetailPage() {
  const params = useParams<{ tradeId: string }>();
  const router = useRouter();
  const tradeId = Number(params.tradeId);

  const [trade, setTrade] = useState<CardTradeDetail | null>(null);
  const [accessToken, setAccessToken] = useState('');
  const [currentUserId, setCurrentUserId] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isPurchasing, setIsPurchasing] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [purchaseMessage, setPurchaseMessage] = useState('');

  useEffect(() => {
    setAccessToken(getCookie('accessToken') ?? '');
    setCurrentUserId(getCookie('userId') ?? '');
  }, []);

  useEffect(() => {
    if (!Number.isFinite(tradeId)) {
      setErrorMessage('잘못된 거래 상품 ID입니다.');
      setIsLoading(false);
      return;
    }

    let isMounted = true;

    const fetchTrade = async () => {
      try {
        setIsLoading(true);
        setErrorMessage('');

        const response = await fetch(`${API_BASE_URL}/trades/${tradeId}`, {
          cache: 'no-store',
        });

        if (!response.ok) {
          throw new Error(await response.text());
        }

        const data = (await response.json()) as CardTradeDetail;
        if (isMounted) {
          setTrade(data);
        }
      } catch (error) {
        console.error(error);
        if (isMounted) {
          setErrorMessage('카드 거래 상세 정보를 불러오지 못했습니다.');
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    fetchTrade();

    return () => {
      isMounted = false;
    };
  }, [tradeId]);

  const totalPrice = useMemo(() => {
    if (!trade) return 0;

    return Number(trade.price || 0) + Number(trade.shippingFee || 0);
  }, [trade]);

  const isMine = Boolean(
    trade?.sellerUserId && currentUserId && trade.sellerUserId === currentUserId
  );
  const canPurchase = trade?.tradeStatus === 'ON_SALE' && !isMine;

  const handlePurchase = async () => {
    if (!trade) return;

    if (!accessToken) {
      router.push('/login');
      return;
    }

    if (!canPurchase) {
      return;
    }

    const confirmed = confirm('이 카드를 구매하시겠습니까?');
    if (!confirmed) return;

    try {
      setIsPurchasing(true);
      setErrorMessage('');
      setPurchaseMessage('');

      const response = await fetch(`${API_BASE_URL}/trades/${trade.id}/purchase`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      if (!response.ok) {
        throw new Error(await response.text());
      }

      await response.json();
      setTrade((prev) =>
        prev ? { ...prev, tradeStatus: 'SOLD_OUT' } : prev
      );
      setPurchaseMessage('구매가 완료되었습니다.');
    } catch (error) {
      console.error(error);
      setErrorMessage(
        error instanceof Error && error.message
          ? error.message
          : '구매 처리에 실패했습니다.'
      );
    } finally {
      setIsPurchasing(false);
    }
  };

  if (isLoading) {
    return (
      <main className="min-h-[calc(100vh-88px)] bg-[#f6f3ee] px-5 py-10">
        <div className="mx-auto max-w-7xl rounded-md border border-black bg-white p-10 text-center text-sm font-bold text-gray-500">
          카드 거래 상세 정보를 불러오는 중입니다.
        </div>
      </main>
    );
  }

  if (!trade) {
    return (
      <main className="min-h-[calc(100vh-88px)] bg-[#f6f3ee] px-5 py-10">
        <div className="mx-auto max-w-7xl rounded-md border border-black bg-white p-10 text-center">
          <p className="text-lg font-black text-black">
            거래 상품을 찾을 수 없습니다.
          </p>
          <Link
            href="/trades"
            className="mt-5 inline-flex h-11 items-center rounded-md bg-black px-5 text-sm font-black text-white transition hover:bg-[#d71920]"
          >
            목록으로
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-[calc(100vh-88px)] bg-[#f6f3ee] px-5 py-10">
      <div className="mx-auto max-w-7xl">
        <Link
          href="/trades"
          className="mb-5 inline-flex h-10 items-center rounded-md border border-black bg-white px-4 text-sm font-black text-black transition hover:bg-black hover:text-white"
        >
          목록으로
        </Link>

        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_380px]">
          <section className="overflow-hidden rounded-md border border-black bg-white">
            <div className="aspect-[4/3] border-b border-black bg-[#e9eef2] lg:aspect-[16/10]">
              {trade.imageUrl ? (
                <img
                  src={trade.imageUrl}
                  alt={trade.title}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full items-center justify-center p-8">
                  <div className="flex aspect-[2.5/3.5] w-52 flex-col justify-between rounded-md border border-black bg-white p-6 shadow-[8px_8px_0_#111]">
                    <div>
                      <p className="text-sm font-black text-[#d71920]">
                        {trade.leagueName}
                      </p>
                      <p className="mt-4 text-3xl font-black leading-tight text-black">
                        {trade.playerName}
                      </p>
                    </div>
                    <p className="text-sm font-black text-gray-500">
                      {trade.brandName || 'Trading Card'}
                    </p>
                  </div>
                </div>
              )}
            </div>

            <div className="p-6">
              <div className="mb-4 flex flex-wrap gap-2">
                <span
                  className={`rounded-full border px-3 py-1 text-xs font-black ${
                    trade.tradeStatus === 'ON_SALE'
                      ? 'border-[#d71920] bg-[#d71920] text-white'
                      : 'border-gray-400 bg-gray-200 text-gray-600'
                  }`}
                >
                  {getStatusLabel(trade.tradeStatus)}
                </span>
                <span className="rounded-full border border-black px-3 py-1 text-xs font-black text-black">
                  {trade.leagueName}
                </span>
              </div>

              <h1 className="text-4xl font-black leading-tight text-black">
                {trade.title}
              </h1>

              <p className="mt-4 text-base font-bold text-gray-600">
                {trade.description || '상세 설명이 등록되지 않았습니다.'}
              </p>

              <div className="mt-8 grid gap-6 md:grid-cols-2">
                <div>
                  <DetailRow label="선수" value={trade.playerName} />
                  <DetailRow label="팀" value={trade.teamName} />
                  <DetailRow label="연도" value={trade.cardYear} />
                  <DetailRow label="브랜드" value={trade.brandName} />
                </div>

                <div>
                  <DetailRow label="카드 번호" value={trade.cardNumber} />
                  <DetailRow
                    label="그레이딩"
                    value={[trade.gradeCompany, trade.grade]
                      .filter(Boolean)
                      .join(' ')}
                  />
                  <DetailRow label="카드 상태" value={trade.conditionLabel} />
                  <DetailRow label="등록일" value={formatDate(trade.createdAt)} />
                </div>
              </div>
            </div>
          </section>

          <aside className="h-fit rounded-md border border-black bg-white p-6">
            <p className="text-sm font-black text-[#d71920]">구매 정보</p>
            <h2 className="mt-2 text-2xl font-black text-black">
              {formatCurrency(totalPrice)}
            </h2>

            <div className="mt-6 space-y-3 text-sm font-bold text-gray-700">
              <div className="flex justify-between gap-4">
                <span>상품금액</span>
                <span className="text-black">{formatCurrency(trade.price)}</span>
              </div>
              <div className="flex justify-between gap-4">
                <span>배송비</span>
                <span className="text-black">
                  {formatCurrency(trade.shippingFee)}
                </span>
              </div>
              <div className="flex justify-between gap-4 border-t border-gray-200 pt-3">
                <span>셀러</span>
                <span className="text-black">
                  {trade.sellerNickname || '셀러'}
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={handlePurchase}
              disabled={!canPurchase || isPurchasing}
              className="mt-6 h-12 w-full rounded-md bg-[#d71920] text-sm font-black text-white transition hover:bg-black disabled:cursor-not-allowed disabled:bg-gray-400"
            >
              {isPurchasing
                ? '구매 중...'
                : isMine
                  ? '내 상품'
                  : trade.tradeStatus === 'SOLD_OUT'
                    ? '판매 완료'
                    : accessToken
                      ? '구매하기'
                      : '로그인 후 구매'}
            </button>

            {purchaseMessage && (
              <p className="mt-4 text-sm font-bold text-[#d71920]">
                {purchaseMessage}
              </p>
            )}

            {errorMessage && (
              <p className="mt-4 text-sm font-bold text-[#d71920]">
                {errorMessage}
              </p>
            )}
          </aside>
        </div>
      </div>
    </main>
  );
}
