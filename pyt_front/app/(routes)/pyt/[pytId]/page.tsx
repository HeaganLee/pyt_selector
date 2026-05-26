'use client';

import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useMemo, useState } from 'react';

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

interface PytDetail {
  id: number;
  title: string;
  brandName: string;
  productName: string;
  imageUrl: string;
  checklistUrl: string;
  sportType: string;
  optionName: string;
  boxType: string;
  breakUnitType: 'FULL_CASE' | 'HALF_CASE' | 'BOX' | 'CUSTOM';
  roundNo: number;
  boxCount: number;
  pytStatus: 'OPEN' | 'FILLER_OPEN' | 'SOLD_OUT' | 'COMPLETED';
  fillerEnabled: boolean;
  teamSlots: PytTeamSlot[];
}

const mockPytDetail: PytDetail = {
  id: 1,
  title: '2024 Topps Chrome Baseball Hobby 1 Case PYT #1',
  brandName: 'Topps',
  productName: 'Chrome Baseball',
  imageUrl: '',
  checklistUrl: 'https://example.com/checklist',
  sportType: 'MLB',
  optionName: 'Hobby Box',
  boxType: 'HOBBY',
  breakUnitType: 'FULL_CASE',
  roundNo: 1,
  boxCount: 12,
  pytStatus: 'OPEN',
  fillerEnabled: true,
  teamSlots: [
    {
      id: 1,
      teamId: 1,
      teamName: 'Arizona Diamondbacks',
      shortName: 'Diamondbacks',
      price: 15000,
      slotStatus: 'AVAILABLE',
      fillerTarget: false,
    },
    {
      id: 2,
      teamId: 2,
      teamName: 'Atlanta Braves',
      shortName: 'Braves',
      price: 80000,
      slotStatus: 'SOLD',
      buyerNickname: 'collectorA',
      fillerTarget: false,
    },
    {
      id: 3,
      teamId: 3,
      teamName: 'Baltimore Orioles',
      shortName: 'Orioles',
      price: 90000,
      slotStatus: 'AVAILABLE',
      fillerTarget: false,
    },
    {
      id: 4,
      teamId: 4,
      teamName: 'Boston Red Sox',
      shortName: 'Red Sox',
      price: 45000,
      slotStatus: 'AVAILABLE',
      fillerTarget: false,
    },
    {
      id: 5,
      teamId: 5,
      teamName: 'Chicago Cubs',
      shortName: 'Cubs',
      price: 50000,
      slotStatus: 'SOLD',
      buyerNickname: 'pytUser',
      fillerTarget: false,
    },
    {
      id: 6,
      teamId: 6,
      teamName: 'Los Angeles Dodgers',
      shortName: 'Dodgers',
      price: 150000,
      slotStatus: 'SOLD',
      buyerNickname: 'dodgerFan',
      fillerTarget: false,
    },
    {
      id: 7,
      teamId: 7,
      teamName: 'New York Yankees',
      shortName: 'Yankees',
      price: 120000,
      slotStatus: 'AVAILABLE',
      fillerTarget: false,
    },
  ],
};

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
  const router = useRouter();

  const pytId = Number(params.pytId);

  const [pyt, setPyt] = useState<PytDetail>(mockPytDetail);
  const [selectedFillerSlotIds, setSelectedFillerSlotIds] = useState<number[]>([]);
  const [fillerSlotCount, setFillerSlotCount] = useState(10);

  const totalTeamCount = pyt.teamSlots.length;
  const soldTeamCount = pyt.teamSlots.filter((slot) => slot.slotStatus === 'SOLD').length;
  const availableTeamCount = pyt.teamSlots.filter(
    (slot) => slot.slotStatus === 'AVAILABLE'
  ).length;

  const totalPrice = useMemo(() => {
    return pyt.teamSlots.reduce((sum, slot) => sum + slot.price, 0);
  }, [pyt.teamSlots]);

  const remainingPrice = useMemo(() => {
    return pyt.teamSlots
      .filter((slot) => slot.slotStatus === 'AVAILABLE')
      .reduce((sum, slot) => sum + slot.price, 0);
  }, [pyt.teamSlots]);

  const selectedFillerTotalPrice = useMemo(() => {
    return pyt.teamSlots
      .filter((slot) => selectedFillerSlotIds.includes(slot.id))
      .reduce((sum, slot) => sum + slot.price, 0);
  }, [pyt.teamSlots, selectedFillerSlotIds]);

  const fillerPricePerSlot =
    fillerSlotCount > 0 ? Math.ceil(selectedFillerTotalPrice / fillerSlotCount) : 0;

  const handleJoinTeam = async (teamSlotId: number) => {
    const token = getCookie('UT');

    if (!token) {
      router.push('/login');
      return;
    }

    const confirmed = confirm('해당 팀으로 PYT에 참가하시겠습니까?');

    if (!confirmed) return;

    /**
     * 백엔드 연결 시 아래처럼 교체
     *
     * const response = await fetch(
     *   `${process.env.NEXT_PUBLIC_SERVER_URL}/pyt/${pytId}/teams/${teamSlotId}/join`,
     *   {
     *     method: 'POST',
     *     headers: {
     *       Authorization: `Bearer ${token}`,
     *     },
     *   }
     * );
     *
     * if (!response.ok) {
     *   alert('참가에 실패했습니다.');
     *   return;
     * }
     */

    setPyt((prev) => ({
      ...prev,
      teamSlots: prev.teamSlots.map((slot) =>
        slot.id === teamSlotId
          ? {
              ...slot,
              slotStatus: 'SOLD',
              buyerNickname: 'me',
            }
          : slot
      ),
    }));

    alert('참가 처리되었습니다.');
  };

  const handleToggleFillerTarget = (teamSlotId: number) => {
    setSelectedFillerSlotIds((prev) => {
      if (prev.includes(teamSlotId)) {
        return prev.filter((id) => id !== teamSlotId);
      }

      return [...prev, teamSlotId];
    });
  };

  const handleCreateFiller = async () => {
    if (selectedFillerSlotIds.length === 0) {
      alert('필러 대상 팀을 선택해주세요.');
      return;
    }

    if (fillerSlotCount <= 0) {
      alert('필러 슬롯 수를 입력해주세요.');
      return;
    }

    const requestBody = {
      teamSlotIds: selectedFillerSlotIds,
      slotCount: fillerSlotCount,
    };

    console.log('create filler requestBody:', requestBody);

    /**
     * 백엔드 연결 시 아래처럼 교체
     *
     * const response = await fetch(
     *   `${process.env.NEXT_PUBLIC_SERVER_URL}/pyt/${pytId}/fillers`,
     *   {
     *     method: 'POST',
     *     headers: { 'Content-Type': 'application/json' },
     *     body: JSON.stringify(requestBody),
     *   }
     * );
     *
     * if (!response.ok) {
     *   alert('필러 생성에 실패했습니다.');
     *   return;
     * }
     */

    setPyt((prev) => ({
      ...prev,
      pytStatus: 'FILLER_OPEN',
      teamSlots: prev.teamSlots.map((slot) =>
        selectedFillerSlotIds.includes(slot.id)
          ? {
              ...slot,
              slotStatus: 'FILLER_TARGET',
              fillerTarget: true,
            }
          : slot
      ),
    }));

    setSelectedFillerSlotIds([]);

    alert('필러가 생성되었습니다.');
  };

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
                  {pyt.pytStatus === 'OPEN'
                    ? '모집중'
                    : pyt.pytStatus === 'FILLER_OPEN'
                      ? '필러중'
                      : pyt.pytStatus}
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

        <section className="mt-10 grid gap-5 md:grid-cols-4">
          <div className="rounded-2xl border border-black bg-white p-5 shadow-[4px_4px_0_#111]">
            <p className="text-xs font-black uppercase text-gray-500">전체 팀</p>
            <p className="mt-2 text-3xl font-black text-black">{totalTeamCount}</p>
          </div>

          <div className="rounded-2xl border border-black bg-white p-5 shadow-[4px_4px_0_#111]">
            <p className="text-xs font-black uppercase text-gray-500">판매 완료</p>
            <p className="mt-2 text-3xl font-black text-black">{soldTeamCount}</p>
          </div>

          <div className="rounded-2xl border border-black bg-white p-5 shadow-[4px_4px_0_#111]">
            <p className="text-xs font-black uppercase text-gray-500">남은 팀</p>
            <p className="mt-2 text-3xl font-black text-[#d71920]">{availableTeamCount}</p>
          </div>

          <div className="rounded-2xl border border-black bg-white p-5 shadow-[4px_4px_0_#111]">
            <p className="text-xs font-black uppercase text-gray-500">남은 금액</p>
            <p className="mt-2 text-3xl font-black text-black">
              {remainingPrice.toLocaleString()}
            </p>
          </div>
        </section>

        <section className="mt-10 overflow-hidden rounded-[24px] border border-black bg-white shadow-[6px_6px_0_#111]">
          <div className="border-b border-black bg-black px-6 py-5 text-white">
            <p className="text-xs font-black uppercase tracking-[0.25em] text-[#ff4b4b]">
              Team Slots
            </p>
            <h2 className="mt-2 text-2xl font-black">팀 선택</h2>
            <p className="mt-2 text-sm font-bold text-gray-300">
              원하는 팀을 선택하고 PYT에 참가하세요.
            </p>
          </div>

          <div className="overflow-x-auto bg-white">
            <table className="min-w-full border-collapse">
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

                    <td className="border-b border-gray-300 px-5 py-4 text-sm font-black text-black">
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
                          className="rounded-md bg-black px-4 py-2 text-sm font-black text-white transition hover:bg-[#d71920]"
                        >
                          참가하기
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

        {pyt.fillerEnabled && (
          <section className="mt-10 overflow-hidden rounded-[24px] border border-black bg-white shadow-[6px_6px_0_#111]">
            <div className="border-b border-black px-6 py-5">
              <p className="text-xs font-black uppercase tracking-[0.25em] text-[#d71920]">
                Filler
              </p>
              <h2 className="mt-2 text-2xl font-black text-black">필러 생성</h2>
              <p className="mt-2 text-sm font-bold text-gray-500">
                남은 팀을 선택하고 필러 슬롯 수를 입력하면 슬롯 가격이 자동 계산됩니다.
              </p>
            </div>

            <div className="grid gap-6 p-6 lg:grid-cols-[1fr_320px]">
              <div className="overflow-hidden rounded-2xl border border-black">
                <table className="min-w-full border-collapse">
                  <thead>
                    <tr className="bg-black text-white">
                      <th className="px-5 py-4 text-left text-xs font-black uppercase tracking-wider">
                        Select
                      </th>
                      <th className="px-5 py-4 text-left text-xs font-black uppercase tracking-wider">
                        Team
                      </th>
                      <th className="px-5 py-4 text-left text-xs font-black uppercase tracking-wider">
                        Price
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    {pyt.teamSlots
                      .filter((slot) => slot.slotStatus === 'AVAILABLE')
                      .map((slot, index) => (
                        <tr
                          key={slot.id}
                          className={index % 2 === 0 ? 'bg-white' : 'bg-[#f6f3ee]'}
                        >
                          <td className="border-b border-gray-300 px-5 py-4">
                            <input
                              type="checkbox"
                              checked={selectedFillerSlotIds.includes(slot.id)}
                              onChange={() => handleToggleFillerTarget(slot.id)}
                              className="h-5 w-5 accent-[#d71920]"
                            />
                          </td>

                          <td className="border-b border-gray-300 px-5 py-4 text-sm font-black text-black">
                            {slot.shortName}
                          </td>

                          <td className="border-b border-gray-300 px-5 py-4 text-sm font-black text-black">
                            {slot.price.toLocaleString()}원
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>

              <div className="rounded-2xl border border-black bg-[#f6f3ee] p-5">
                <label className="mb-2 block text-sm font-black text-black">
                  필러 슬롯 수
                </label>

                <input
                  type="number"
                  min={1}
                  value={fillerSlotCount}
                  onChange={(event) => setFillerSlotCount(Number(event.target.value))}
                  className="h-12 w-full rounded-md border border-gray-300 bg-white px-4 text-base font-black text-black outline-none focus:border-black"
                />

                <div className="mt-5 space-y-3 rounded-xl border border-black bg-white p-4">
                  <div className="flex items-center justify-between text-sm font-black">
                    <span>선택 팀 수</span>
                    <span>{selectedFillerSlotIds.length}개</span>
                  </div>

                  <div className="flex items-center justify-between text-sm font-black">
                    <span>대상 총액</span>
                    <span>{selectedFillerTotalPrice.toLocaleString()}원</span>
                  </div>

                  <div className="flex items-center justify-between text-sm font-black text-[#d71920]">
                    <span>1슬롯 가격</span>
                    <span>{fillerPricePerSlot.toLocaleString()}원</span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleCreateFiller}
                  className="mt-5 h-12 w-full rounded-md bg-black text-sm font-black text-white transition hover:bg-[#d71920]"
                >
                  필러 생성하기
                </button>
              </div>
            </div>
          </section>
        )}
      </div>
    </main>
  );
}