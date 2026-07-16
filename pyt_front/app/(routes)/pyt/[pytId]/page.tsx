'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';

const API_BASE_URL = process.env.NEXT_PUBLIC_SERVER_URL ?? '';

type SlotStatus = 'AVAILABLE' | 'RESERVED' | 'SOLD' | 'FILLER_TARGET' | 'FILLER_ASSIGNED';

interface PytTeamSlot {
  id: number;
  teamId: number;
  teamName: string;
  shortName: string;
  price: number;
  slotStatus: SlotStatus;
  buyerNickname?: string;
  fillerTarget: boolean;
}

interface PytFillerEntry {
  id: number;
  slotNo: number;
  paidAmount: number;
  entryStatus: string;
  userId: string;
  userNickname: string | null;
}

interface PytFiller {
  id: number;
  title: string;
  fillerRoundNo: number | null;
  boxCount: number | null;
  teamsPerSlot: number | null;
  targetTeamCount: number;
  slotCount: number;
  entryCount: number;
  remainingSlotCount: number;
  pricePerSlot: number;
  totalTeamPrice: number;
  fillerStatus: 'OPEN' | 'SOLD_OUT' | 'ASSIGNED' | 'CANCELLED';
  targetTeamSlots: PytTeamSlot[];
  entries: PytFillerEntry[];
}

interface PytDetail {
  id: number;
  createdByUserId: string | null;
  createdByNickname: string | null;
  title: string;
  brandName: string;
  productName: string;
  imageUrl: string;
  checklistUrl: string | null;
  sportType: string;
  optionName: string;
  boxType: string;
  breakUnitType: 'FULL_CASE' | 'HALF_CASE' | 'BOX' | 'CUSTOM';
  roundNo: number;
  boxCount: number;
  pytStatus:
    | 'DRAFT'
    | 'OPEN'
    | 'FILLER_OPEN'
    | 'FILLER_SOLD_OUT'
    | 'SOLD_OUT'
    | 'READY'
    | 'COMPLETED'
    | 'CANCELLED';
  fillerEnabled: boolean;
  teamSlots: PytTeamSlot[];
  fillers: PytFiller[];
}

function getCookie(key: string) {
  if (typeof document === 'undefined') return null;

  const cookies = document.cookie.split('; ');
  const targetCookie = cookies.find((cookie) => cookie.startsWith(`${key}=`));

  if (!targetCookie) return null;

  return decodeURIComponent(targetCookie.split('=')[1]);
}

function getBreakUnitLabel(type: PytDetail['breakUnitType']) {
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

function getSlotStatusLabel(status: SlotStatus) {
  switch (status) {
    case 'AVAILABLE':
      return '참가 가능';
    case 'RESERVED':
      return '예약중';
    case 'SOLD':
      return '판매완료';
    case 'FILLER_TARGET':
      return '필러대상';
    case 'FILLER_ASSIGNED':
      return '필러배정';
    default:
      return status;
  }
}

function getPytStatusLabel(status: PytDetail['pytStatus']) {
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
    default:
      return status;
  }
}

function SlotStatusBadge({ status }: { status: SlotStatus }) {
  const className =
    status === 'AVAILABLE'
      ? 'border-black bg-white text-black'
      : status === 'SOLD'
        ? 'border-gray-500 bg-gray-200 text-gray-700'
        : status === 'FILLER_TARGET'
          ? 'border-black bg-[#ffd84d] text-black'
          : status === 'FILLER_ASSIGNED'
            ? 'border-[#d71920] bg-[#d71920] text-white'
            : 'border-black bg-black text-white';

  return (
    <span className={`inline-flex rounded-full border px-3 py-1 text-xs font-black ${className}`}>
      {getSlotStatusLabel(status)}
    </span>
  );
}

export default function PytDetailPage() {
  const params = useParams<{ pytId: string }>();

  const pytId = Number(params.pytId);

  const [pyt, setPyt] = useState<PytDetail | null>(null);
  const [currentUserId, setCurrentUserId] = useState('');
  const [accessToken, setAccessToken] = useState('');
  const [joiningFillerId, setJoiningFillerId] = useState<number | null>(null);
  const [reloadKey, setReloadKey] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    setCurrentUserId(getCookie('userId') ?? '');
    setAccessToken(getCookie('accessToken') ?? '');
  }, []);

  useEffect(() => {
    if (!Number.isFinite(pytId)) {
      setErrorMessage('잘못된 PYT ID입니다.');
      setIsLoading(false);
      return;
    }

    let isMounted = true;

    const fetchPytDetail = async () => {
      try {
        setIsLoading(true);
        setErrorMessage('');

        const response = await fetch(`${API_BASE_URL}/pyt/${pytId}`);

        if (!response.ok) {
          throw new Error(await response.text());
        }

        const data = (await response.json()) as PytDetail;

        if (isMounted) {
          setPyt(data);
        }
      } catch (error) {
        console.error(error);
        if (isMounted) {
          setErrorMessage('PYT 상세 정보를 불러오지 못했습니다.');
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    fetchPytDetail();

    return () => {
      isMounted = false;
    };
  }, [pytId, reloadKey]);

  const teamSlots = useMemo(() => pyt?.teamSlots ?? [], [pyt]);

  const totalTeamCount = teamSlots.length;
  const soldTeamCount = teamSlots.filter((slot) => slot.slotStatus === 'SOLD').length;
  const availableTeamCount = teamSlots.filter(
    (slot) => slot.slotStatus === 'AVAILABLE'
  ).length;

  const remainingPrice = useMemo(() => {
    return teamSlots
      .filter((slot) => slot.slotStatus === 'AVAILABLE')
      .reduce((sum, slot) => sum + slot.price, 0);
  }, [teamSlots]);

  const handleJoinTeam = async (teamSlotId: number) => {
    if (!accessToken) {
      alert('로그인 후 참가할 수 있습니다.');
      return;
    }

    if (pyt?.pytStatus !== 'OPEN') {
      alert('필러중에는 필러 참가를 이용해주세요.');
      return;
    }

    if (currentUserId && pyt?.createdByUserId && pyt.createdByUserId === currentUserId) {
      alert('본인이 생성한 PYT에는 참가할 수 없습니다.');
      return;
    }

    const confirmed = confirm('해당 팀으로 PYT에 참가하시겠습니까?');

    if (!confirmed) return;

    try {
      const response = await fetch(
        `${API_BASE_URL}/pyt/${pytId}/teams/${teamSlotId}/join`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error(await response.text());
      }

      setReloadKey((prev) => prev + 1);
      alert('참가 처리되었습니다.');
    } catch (error) {
      console.error(error);
      alert(error instanceof Error && error.message ? error.message : '참가에 실패했습니다.');
    }
  };

  const handleJoinFiller = async (filler: PytFiller) => {
    if (!accessToken) {
      alert('로그인 후 참가할 수 있습니다.');
      return;
    }

    if (currentUserId && pyt?.createdByUserId && pyt.createdByUserId === currentUserId) {
      alert('본인이 생성한 PYT에는 참가할 수 없습니다.');
      return;
    }

    if (filler.fillerStatus !== 'OPEN' || filler.remainingSlotCount <= 0) {
      alert('참가 가능한 필러가 아닙니다.');
      return;
    }

    const confirmed = confirm(`${filler.pricePerSlot.toLocaleString()}원으로 필러에 참가하시겠습니까?`);
    if (!confirmed) return;

    try {
      setJoiningFillerId(filler.id);

      const response = await fetch(`${API_BASE_URL}/pyt/${pytId}/fillers/${filler.id}/join`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      if (!response.ok) {
        throw new Error(await response.text());
      }

      setReloadKey((prev) => prev + 1);
      alert('필러 참가가 완료되었습니다.');
    } catch (error) {
      console.error(error);
      alert(error instanceof Error && error.message ? error.message : '필러 참가에 실패했습니다.');
    } finally {
      setJoiningFillerId(null);
    }
  };

  if (isLoading && !pyt) {
    return (
      <main className="min-h-screen bg-[#f6f3ee]">
        <div className="mx-auto max-w-7xl px-6 py-10">
          <div className="rounded-2xl border-2 border-dashed border-black bg-white px-6 py-12 text-center text-sm font-bold text-gray-500">
            PYT 상세 정보를 불러오는 중입니다.
          </div>
        </div>
      </main>
    );
  }

  if (!pyt) {
    return (
      <main className="min-h-screen bg-[#f6f3ee]">
        <div className="mx-auto max-w-7xl px-6 py-10">
          <Link
            href="/pyt"
            className="mb-6 inline-flex items-center rounded-full border border-black bg-white px-4 py-2 text-sm font-black text-black transition hover:bg-black hover:text-white"
          >
            ← PYT 목록으로 돌아가기
          </Link>

          <div className="rounded-2xl border-2 border-dashed border-[#d71920] bg-white px-6 py-12 text-center text-sm font-bold text-[#d71920]">
            {errorMessage || 'PYT 상세 정보를 찾을 수 없습니다.'}
          </div>
        </div>
      </main>
    );
  }

  const isFillerMode = pyt.pytStatus === 'FILLER_OPEN';
  const isOwnPyt = Boolean(currentUserId && pyt.createdByUserId && pyt.createdByUserId === currentUserId);
  const canJoinDirectTeams = pyt.pytStatus === 'OPEN';
  const totalFillerSlotCount = pyt.fillers.reduce((sum, filler) => sum + filler.slotCount, 0);
  const fillerEntryCount = pyt.fillers.reduce((sum, filler) => sum + filler.entryCount, 0);
  const remainingFillerSlotCount = pyt.fillers.reduce(
    (sum, filler) => sum + filler.remainingSlotCount,
    0
  );
  const displayFillerPrice = pyt.fillers.find((filler) => filler.fillerStatus === 'OPEN')?.pricePerSlot
    ?? pyt.fillers[0]?.pricePerSlot
    ?? 0;

  return (
    <main className="min-h-screen bg-[#f6f3ee]">
      <div className="mx-auto max-w-7xl px-6 py-10">
        <div className="mb-6">
          <Link
            href="/pyt"
            className="inline-flex items-center rounded-full border border-black bg-white px-4 py-2 text-sm font-black text-black transition hover:bg-black hover:text-white"
          >
            ← PYT 목록으로 돌아가기
          </Link>
        </div>

        <section className="overflow-hidden rounded-[28px] border border-black bg-white shadow-[8px_8px_0_#111]">
          <div className="grid gap-0 lg:grid-cols-[360px_1fr]">
            <div className="border-b border-black bg-[#eee8df] p-6 lg:border-b-0 lg:border-r">
              <div className="overflow-hidden rounded-2xl border border-black bg-white">
                <div className="aspect-[3/4] w-full bg-[#f1eee8]">
                  {pyt.imageUrl ? (
                    <img
                      src={pyt.imageUrl}
                      alt={pyt.title}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center text-sm font-black text-gray-500">
                      No Image
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="flex flex-col justify-center p-8 lg:p-12">
              <div className="mb-4 flex flex-wrap gap-2">
                <span className="inline-flex rounded-full border border-[#d71920] bg-[#d71920] px-3 py-1 text-xs font-black text-white">
                  {getPytStatusLabel(pyt.pytStatus)}
                </span>

                <span className="inline-flex rounded-full border border-black bg-white px-3 py-1 text-xs font-black text-black">
                  {pyt.sportType}
                </span>
              </div>

              <p className="mb-3 text-sm font-black uppercase tracking-[0.25em] text-[#d71920]">
                PYT Detail #{pytId}
              </p>

              <h1 className="max-w-3xl text-4xl font-black leading-tight text-black lg:text-5xl">
                {pyt.title}
              </h1>

              <div className="mt-6 grid gap-3 text-sm font-semibold text-gray-800 sm:grid-cols-2 lg:grid-cols-4">
                <div className="rounded-xl border border-black bg-[#f6f3ee] px-4 py-3">
                  <span className="block text-xs font-black uppercase text-gray-500">
                    Option
                  </span>
                  {pyt.optionName}
                </div>

                <div className="rounded-xl border border-black bg-[#f6f3ee] px-4 py-3">
                  <span className="block text-xs font-black uppercase text-gray-500">
                    Break
                  </span>
                  {getBreakUnitLabel(pyt.breakUnitType)}
                </div>

                <div className="rounded-xl border border-black bg-[#f6f3ee] px-4 py-3">
                  <span className="block text-xs font-black uppercase text-gray-500">
                    Round
                  </span>
                  #{pyt.roundNo}
                </div>

                <div className="rounded-xl border border-black bg-[#f6f3ee] px-4 py-3">
                  <span className="block text-xs font-black uppercase text-gray-500">
                    Boxes
                  </span>
                  {pyt.boxCount}
                </div>
              </div>

              {pyt.checklistUrl && (
                <a
                  href={pyt.checklistUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-6 inline-flex w-fit rounded-md bg-black px-5 py-3 text-sm font-black text-white transition hover:bg-[#d71920]"
                >
                  체크리스트 보기
                </a>
              )}
            </div>
          </div>
        </section>

        <section className="mt-10 grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-2xl border border-black bg-white p-5 shadow-[4px_4px_0_#111]">
            <p className="text-xs font-black uppercase text-gray-500">
              {isFillerMode ? '필러 슬롯' : '전체 팀'}
            </p>
            <p className="mt-2 whitespace-nowrap text-2xl font-black tabular-nums text-black sm:text-3xl">
              {isFillerMode ? totalFillerSlotCount : totalTeamCount}
            </p>
          </div>

          <div className="rounded-2xl border border-black bg-white p-5 shadow-[4px_4px_0_#111]">
            <p className="text-xs font-black uppercase text-gray-500">
              {isFillerMode ? '필러 참가' : '판매 완료'}
            </p>
            <p className="mt-2 whitespace-nowrap text-2xl font-black tabular-nums text-black sm:text-3xl">
              {isFillerMode ? fillerEntryCount : soldTeamCount}
            </p>
          </div>

          <div className="rounded-2xl border border-black bg-white p-5 shadow-[4px_4px_0_#111]">
            <p className="text-xs font-black uppercase text-gray-500">
              {isFillerMode ? '남은 슬롯' : '남은 팀'}
            </p>
            <p className="mt-2 whitespace-nowrap text-2xl font-black tabular-nums text-[#d71920] sm:text-3xl">
              {isFillerMode ? remainingFillerSlotCount : availableTeamCount}
            </p>
          </div>

          <div className="rounded-2xl border border-black bg-white p-5 shadow-[4px_4px_0_#111]">
            <p className="text-xs font-black uppercase text-gray-500">
              {isFillerMode ? '슬롯가' : '남은 금액'}
            </p>
            <p className="mt-2 whitespace-nowrap text-2xl font-black tabular-nums text-black sm:text-3xl">
              {(isFillerMode ? displayFillerPrice : remainingPrice).toLocaleString()}
            </p>
          </div>
        </section>

        <div className="flex flex-col">
        <section className={`mt-10 overflow-hidden rounded-[24px] border border-black bg-white shadow-[6px_6px_0_#111] ${isFillerMode ? 'order-2' : 'order-1'}`}>
          <div className="border-b border-black bg-black px-6 py-5 text-white">
            <p className="text-xs font-black uppercase tracking-[0.25em] text-[#ff4b4b]">
              Team Slots
            </p>
            <h2 className="mt-2 text-2xl font-black">
              {isFillerMode ? '팀 현황' : '팀 선택'}
            </h2>
            <p className="mt-2 text-sm font-bold text-gray-300">
              {isFillerMode
                ? '필러 대상 팀과 판매 상태를 확인하세요.'
                : '원하는 팀을 선택하고 PYT에 참가하세요.'}
            </p>
          </div>

          <div className="overflow-x-auto bg-white">
            <table className="min-w-[760px] border-collapse">
              <thead>
                <tr className="bg-[#d71920] text-white">
                  <th className="border-b border-black px-5 py-4 text-left text-xs font-black uppercase tracking-wider">
                    Team
                  </th>
                  <th className="border-b border-black px-5 py-4 text-left text-xs font-black uppercase tracking-wider">
                    Price
                  </th>
                  <th className="border-b border-black px-5 py-4 text-left text-xs font-black uppercase tracking-wider">
                    Status
                  </th>
                  <th className="border-b border-black px-5 py-4 text-left text-xs font-black uppercase tracking-wider">
                    Buyer
                  </th>
                  <th className="border-b border-black px-5 py-4 text-left text-xs font-black uppercase tracking-wider">
                    Action
                  </th>
                </tr>
              </thead>

              <tbody>
                {pyt.teamSlots.map((slot, index) => (
                  <tr
                    key={slot.id}
                    className={index % 2 === 0 ? 'bg-white' : 'bg-[#f6f3ee]'}
                  >
                    <td className="border-b border-gray-300 px-5 py-4">
                      <p className="text-sm font-black text-black">{slot.shortName}</p>
                      <p className="mt-1 text-xs font-bold text-gray-500">{slot.teamName}</p>
                    </td>

                    <td className="whitespace-nowrap border-b border-gray-300 px-5 py-4 text-sm font-black tabular-nums text-black">
                      {slot.price.toLocaleString()}원
                    </td>

                    <td className="border-b border-gray-300 px-5 py-4">
                      <SlotStatusBadge status={slot.slotStatus} />
                    </td>

                    <td className="border-b border-gray-300 px-5 py-4 text-sm font-bold text-gray-700">
                      {slot.buyerNickname ?? '-'}
                    </td>

                    <td className="border-b border-gray-300 px-5 py-4">
                      {slot.slotStatus === 'AVAILABLE' ? (
                        <button
                          type="button"
                          onClick={() => handleJoinTeam(slot.id)}
                          disabled={isOwnPyt || !canJoinDirectTeams}
                          className="rounded-md bg-black px-4 py-2 text-sm font-black text-white transition hover:bg-[#d71920] disabled:cursor-not-allowed disabled:bg-gray-400"
                        >
                          {isOwnPyt ? '내 PYT' : canJoinDirectTeams ? '참가하기' : '필러중'}
                        </button>
                      ) : (
                        <span className="text-sm font-black text-gray-400">-</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {pyt.fillers.length > 0 && (
          <section className={`mt-10 overflow-hidden rounded-[24px] border border-black bg-white shadow-[6px_6px_0_#111] ${isFillerMode ? 'order-1' : 'order-2'}`}>
            <div className="border-b border-black px-6 py-5">
              <p className="text-xs font-black uppercase tracking-[0.25em] text-[#d71920]">
                Filler
              </p>
              <h2 className="mt-2 text-2xl font-black text-black">필러 참가</h2>
              <p className="mt-2 text-sm font-bold text-gray-500">
                필러 모집 중인 슬롯에 참가할 수 있습니다.
              </p>
            </div>

            <div className="space-y-5 p-6">
              {pyt.fillers.map((filler) => {
                const isOwnPyt = Boolean(currentUserId && pyt.createdByUserId && pyt.createdByUserId === currentUserId);
                const isJoinDisabled =
                  isOwnPyt ||
                  filler.fillerStatus !== 'OPEN' ||
                  filler.remainingSlotCount <= 0 ||
                  joiningFillerId === filler.id;

                return (
                  <div key={filler.id} className="overflow-hidden rounded-md border border-black">
                    <div className="flex flex-col gap-3 border-b border-black bg-[#f6f3ee] px-5 py-4 md:flex-row md:items-center md:justify-between">
                      <div>
                        <h3 className="text-lg font-black text-black">{filler.title}</h3>
                        <p className="mt-1 text-xs font-bold text-gray-500">
                          {pyt.roundNo}-{filler.fillerRoundNo ?? '?'}차 / {filler.boxCount ?? '-'}박스 / 슬롯당 {filler.teamsPerSlot ?? '-'}팀
                        </p>
                        <p className="mt-1 text-xs font-bold text-gray-500">
                          대상 팀 {filler.targetTeamSlots.map((slot) => slot.shortName || slot.teamName).join(', ')}
                        </p>
                      </div>
                      <div className="text-sm font-black text-black">
                        {filler.entryCount} / {filler.slotCount} 슬롯
                      </div>
                    </div>

                    <div className="grid min-w-0 gap-5 p-5 xl:grid-cols-[minmax(0,1fr)_280px]">
                      <div className="grid min-w-0 gap-2 sm:grid-cols-2">
                        {Array.from({ length: filler.slotCount }, (_, index) => {
                          const slotNo = index + 1;
                          const entry = filler.entries.find((item) => item.slotNo === slotNo);

                          return (
                            <div
                              key={`${filler.id}-${slotNo}`}
                              className={`flex min-w-0 items-center justify-between gap-3 rounded-md border px-3 py-2 text-sm font-bold ${
                                entry
                                  ? 'border-black bg-black text-white'
                                  : 'border-gray-300 bg-white text-black'
                              }`}
                            >
                              <span className="whitespace-nowrap tabular-nums">{slotNo}번</span>
                              <span className="min-w-0 truncate text-right">{entry?.userNickname || entry?.userId || '빈 슬롯'}</span>
                            </div>
                          );
                        })}
                      </div>

                      <div className="min-w-0 rounded-md border border-black bg-white p-4">
                        <div className="space-y-2 text-sm font-black text-black">
                          <p>상태 {filler.fillerStatus}</p>
                          <p>진행 {pyt.roundNo}-{filler.fillerRoundNo ?? '?'}차</p>
                          <p>슬롯당 {filler.teamsPerSlot ?? '-'}팀</p>
                          <p>대상 팀 {filler.targetTeamCount}개</p>
                          <p>남은 슬롯 {filler.remainingSlotCount}개</p>
                          <p className="flex justify-between gap-3">
                            <span>슬롯가</span>
                            <span className="whitespace-nowrap tabular-nums">{filler.pricePerSlot.toLocaleString()}원</span>
                          </p>
                          <p className="flex justify-between gap-3">
                            <span>대상 총액</span>
                            <span className="whitespace-nowrap tabular-nums">{filler.totalTeamPrice.toLocaleString()}원</span>
                          </p>
                        </div>

                        <button
                          type="button"
                          onClick={() => handleJoinFiller(filler)}
                          disabled={isJoinDisabled}
                          className="mt-4 h-11 w-full rounded-md bg-[#d71920] text-sm font-black text-white transition hover:bg-black disabled:cursor-not-allowed disabled:bg-gray-400"
                        >
                          {isOwnPyt
                            ? '내 PYT'
                            : filler.fillerStatus !== 'OPEN' || filler.remainingSlotCount <= 0
                              ? '마감'
                              : joiningFillerId === filler.id
                                ? '참가 중...'
                                : '필러 참가'}
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        )}
        </div>
      </div>
    </main>
  );
}
