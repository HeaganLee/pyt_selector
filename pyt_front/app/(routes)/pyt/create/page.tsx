'use client';

import { FormEvent, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';

type BreakUnitType = 'FULL_CASE' | 'HALF_CASE' | 'BOX' | 'CUSTOM';

interface ProductOption {
  id: number;
  productLabel: string;
  optionName: string;
  boxType: string;
  sportType: 'MLB' | 'NBA' | 'NFL' | 'NHL' | 'MLS';
  boxCountDefault: number;
}

interface TeamItem {
  id: number;
  name: string;
  shortName: string;
  sportType: 'MLB' | 'NBA' | 'NFL' | 'NHL' | 'MLS';
}

const mockProductOptions: ProductOption[] = [
  {
    id: 1,
    productLabel: '2024 Topps Chrome Baseball',
    optionName: 'Hobby Box',
    boxType: 'HOBBY',
    sportType: 'MLB',
    boxCountDefault: 12,
  },
  {
    id: 2,
    productLabel: '2024 Topps Chrome Baseball',
    optionName: 'Jumbo Box',
    boxType: 'JUMBO',
    sportType: 'MLB',
    boxCountDefault: 8,
  },
  {
    id: 3,
    productLabel: '2024 Panini Prizm Basketball',
    optionName: 'Hobby Box',
    boxType: 'HOBBY',
    sportType: 'NBA',
    boxCountDefault: 12,
  },
];

const mockTeams: TeamItem[] = [
  { id: 1, name: 'Arizona Diamondbacks', shortName: 'Diamondbacks', sportType: 'MLB' },
  { id: 2, name: 'Atlanta Braves', shortName: 'Braves', sportType: 'MLB' },
  { id: 3, name: 'Baltimore Orioles', shortName: 'Orioles', sportType: 'MLB' },
  { id: 4, name: 'Boston Red Sox', shortName: 'Red Sox', sportType: 'MLB' },
  { id: 5, name: 'Chicago Cubs', shortName: 'Cubs', sportType: 'MLB' },
  { id: 6, name: 'Los Angeles Dodgers', shortName: 'Dodgers', sportType: 'MLB' },
  { id: 7, name: 'New York Yankees', shortName: 'Yankees', sportType: 'MLB' },
  { id: 8, name: 'Los Angeles Lakers', shortName: 'Lakers', sportType: 'NBA' },
  { id: 9, name: 'Boston Celtics', shortName: 'Celtics', sportType: 'NBA' },
];

function getBreakUnitLabel(type: BreakUnitType) {
  switch (type) {
    case 'FULL_CASE':
      return '한 케이스';
    case 'HALF_CASE':
      return '반 케이스';
    case 'BOX':
      return '박스';
    case 'CUSTOM':
      return '직접 입력';
    default:
      return type;
  }
}

export default function PytCreatePage() {
  const router = useRouter();

  const [cardProductOptionId, setCardProductOptionId] = useState<number>(
    mockProductOptions[0]?.id ?? 0
  );
  const [title, setTitle] = useState('');
  const [breakUnitType, setBreakUnitType] = useState<BreakUnitType>('FULL_CASE');
  const [roundNo, setRoundNo] = useState(1);
  const [boxCount, setBoxCount] = useState(mockProductOptions[0]?.boxCountDefault ?? 1);
  const [fillerEnabled, setFillerEnabled] = useState(true);
  const [teamPrices, setTeamPrices] = useState<Record<number, string>>({});
  const [errorMessage, setErrorMessage] = useState('');

  const selectedOption = useMemo(() => {
    return mockProductOptions.find((option) => option.id === cardProductOptionId);
  }, [cardProductOptionId]);

  const filteredTeams = useMemo(() => {
    if (!selectedOption) return [];
    return mockTeams.filter((team) => team.sportType === selectedOption.sportType);
  }, [selectedOption]);

  const totalPrice = useMemo(() => {
    return filteredTeams.reduce((sum, team) => {
      const price = Number(teamPrices[team.id] || 0);
      return sum + price;
    }, 0);
  }, [filteredTeams, teamPrices]);

  const handleOptionChange = (optionId: number) => {
    const option = mockProductOptions.find((item) => item.id === optionId);

    setCardProductOptionId(optionId);
    setBoxCount(option?.boxCountDefault ?? 1);
    setTeamPrices({});
  };

  const handlePriceChange = (teamId: number, value: string) => {
    const onlyNumber = value.replace(/[^0-9]/g, '');

    setTeamPrices((prev) => ({
      ...prev,
      [teamId]: onlyNumber,
    }));
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setErrorMessage('');

    if (!cardProductOptionId) {
      setErrorMessage('상품 옵션을 선택해주세요.');
      return;
    }

    if (!title.trim()) {
      setErrorMessage('PYT 제목을 입력해주세요.');
      return;
    }

    const emptyPriceTeam = filteredTeams.find((team) => !teamPrices[team.id]);

    if (emptyPriceTeam) {
      setErrorMessage(`${emptyPriceTeam.shortName} 팀 가격을 입력해주세요.`);
      return;
    }

    const requestBody = {
      cardProductOptionId,
      title,
      breakUnitType,
      roundNo,
      boxCount,
      fillerEnabled,
      teamPrices: filteredTeams.map((team) => ({
        teamId: team.id,
        price: Number(teamPrices[team.id]),
      })),
    };

    console.log('create pyt requestBody:', requestBody);

    /**
     * 백엔드 연결 시 아래처럼 교체
     *
     * const response = await fetch(`${process.env.NEXT_PUBLIC_SERVER_URL}/pyt`, {
     *   method: 'POST',
     *   headers: { 'Content-Type': 'application/json' },
     *   body: JSON.stringify(requestBody),
     * });
     *
     * if (!response.ok) throw new Error('PYT 생성 실패');
     *
     * const pytId = await response.json();
     * router.push(`/pyt/${pytId}`);
     */

    alert('PYT 생성 요청 데이터가 console에 출력되었습니다.');
    router.push('/pyt');
  };

  return (
    <main className="min-h-screen bg-[#f6f3ee]">
      <div className="mx-auto max-w-7xl px-6 py-10">
        <section className="overflow-hidden rounded-[28px] border border-black bg-white shadow-[8px_8px_0_#111]">
          <div className="border-b border-black bg-black px-8 py-4">
            <p className="text-sm font-black uppercase tracking-[0.3em] text-[#ff4b4b]">
              Create PYT
            </p>
          </div>

          <div className="px-8 py-10">
            <h1 className="text-4xl font-black text-black">
              PYT 생성
            </h1>

            <p className="mt-4 max-w-2xl text-sm font-bold leading-6 text-gray-600">
              상품 옵션을 선택하고 한 케이스, 반 케이스, 차수, 팀별 가격을 설정하세요.
              필러 사용 여부도 함께 지정할 수 있습니다.
            </p>
          </div>
        </section>

        <form onSubmit={handleSubmit} className="mt-10 space-y-8">
          <section className="overflow-hidden rounded-[24px] border border-black bg-white shadow-[6px_6px_0_#111]">
            <div className="border-b border-black px-6 py-5">
              <h2 className="text-2xl font-black text-black">1. 상품 옵션 선택</h2>
            </div>

            <div className="grid gap-5 p-6 lg:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-black text-black">
                  상품 옵션
                </label>

                <select
                  value={cardProductOptionId}
                  onChange={(event) => handleOptionChange(Number(event.target.value))}
                  className="h-14 w-full rounded-md border border-gray-300 bg-[#f1f1f1] px-4 text-base font-bold text-black outline-none focus:border-black focus:bg-white"
                >
                  {mockProductOptions.map((option) => (
                    <option key={option.id} value={option.id}>
                      {option.productLabel} / {option.optionName}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-2 block text-sm font-black text-black">
                  스포츠 타입
                </label>

                <div className="flex h-14 items-center rounded-md border border-gray-300 bg-[#f1f1f1] px-4 text-base font-black text-[#d71920]">
                  {selectedOption?.sportType ?? '-'}
                </div>
              </div>
            </div>
          </section>

          <section className="overflow-hidden rounded-[24px] border border-black bg-white shadow-[6px_6px_0_#111]">
            <div className="border-b border-black px-6 py-5">
              <h2 className="text-2xl font-black text-black">2. Break 설정</h2>
            </div>

            <div className="grid gap-5 p-6 lg:grid-cols-2">
              <div className="lg:col-span-2">
                <label className="mb-2 block text-sm font-black text-black">
                  PYT 제목
                </label>

                <input
                  type="text"
                  value={title}
                  onChange={(event) => setTitle(event.target.value)}
                  placeholder="예: 2024 Topps Chrome Baseball Hobby 1 Case PYT #1"
                  className="h-14 w-full rounded-md border border-gray-300 bg-[#f1f1f1] px-4 text-base font-bold text-black outline-none placeholder:text-gray-400 focus:border-black focus:bg-white"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-black text-black">
                  Break 단위
                </label>

                <select
                  value={breakUnitType}
                  onChange={(event) => setBreakUnitType(event.target.value as BreakUnitType)}
                  className="h-14 w-full rounded-md border border-gray-300 bg-[#f1f1f1] px-4 text-base font-bold text-black outline-none focus:border-black focus:bg-white"
                >
                  <option value="FULL_CASE">{getBreakUnitLabel('FULL_CASE')}</option>
                  <option value="HALF_CASE">{getBreakUnitLabel('HALF_CASE')}</option>
                  <option value="BOX">{getBreakUnitLabel('BOX')}</option>
                  <option value="CUSTOM">{getBreakUnitLabel('CUSTOM')}</option>
                </select>
              </div>

              <div>
                <label className="mb-2 block text-sm font-black text-black">
                  차수
                </label>

                <input
                  type="number"
                  min={1}
                  value={roundNo}
                  onChange={(event) => setRoundNo(Number(event.target.value))}
                  className="h-14 w-full rounded-md border border-gray-300 bg-[#f1f1f1] px-4 text-base font-bold text-black outline-none focus:border-black focus:bg-white"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-black text-black">
                  박스 수
                </label>

                <input
                  type="number"
                  min={1}
                  value={boxCount}
                  onChange={(event) => setBoxCount(Number(event.target.value))}
                  className="h-14 w-full rounded-md border border-gray-300 bg-[#f1f1f1] px-4 text-base font-bold text-black outline-none focus:border-black focus:bg-white"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-black text-black">
                  필러 사용 여부
                </label>

                <button
                  type="button"
                  onClick={() => setFillerEnabled((prev) => !prev)}
                  className={`h-14 w-full rounded-md border border-black text-base font-black transition ${
                    fillerEnabled
                      ? 'bg-[#d71920] text-white'
                      : 'bg-[#f1f1f1] text-black'
                  }`}
                >
                  {fillerEnabled ? '필러 사용' : '필러 미사용'}
                </button>
              </div>
            </div>
          </section>

          <section className="overflow-hidden rounded-[24px] border border-black bg-white shadow-[6px_6px_0_#111]">
            <div className="flex flex-col gap-3 border-b border-black px-6 py-5 md:flex-row md:items-center md:justify-between">
              <div>
                <h2 className="text-2xl font-black text-black">3. 팀 가격 설정</h2>
                <p className="mt-1 text-sm font-bold text-gray-500">
                  DB에서 불러온 팀 목록 기준으로 가격을 입력합니다.
                </p>
              </div>

              <div className="rounded-md bg-black px-4 py-3 text-sm font-black text-white">
                총합 {totalPrice.toLocaleString()}원
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full border-collapse">
                <thead>
                  <tr className="bg-[#d71920] text-white">
                    <th className="border-b border-black px-5 py-4 text-left text-xs font-black uppercase tracking-wider">
                      Team
                    </th>
                    <th className="border-b border-black px-5 py-4 text-left text-xs font-black uppercase tracking-wider">
                      Sport
                    </th>
                    <th className="border-b border-black px-5 py-4 text-left text-xs font-black uppercase tracking-wider">
                      Price
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {filteredTeams.map((team, index) => (
                    <tr
                      key={team.id}
                      className={index % 2 === 0 ? 'bg-white' : 'bg-[#f6f3ee]'}
                    >
                      <td className="border-b border-gray-300 px-5 py-4">
                        <p className="text-sm font-black text-black">{team.shortName}</p>
                        <p className="mt-1 text-xs font-bold text-gray-500">{team.name}</p>
                      </td>

                      <td className="border-b border-gray-300 px-5 py-4 text-sm font-black text-[#d71920]">
                        {team.sportType}
                      </td>

                      <td className="border-b border-gray-300 px-5 py-4">
                        <input
                          type="text"
                          value={teamPrices[team.id] ?? ''}
                          onChange={(event) => handlePriceChange(team.id, event.target.value)}
                          placeholder="0"
                          className="h-11 w-full max-w-[220px] rounded-md border border-gray-300 bg-white px-3 text-sm font-black text-black outline-none focus:border-black"
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          {errorMessage && (
            <div className="rounded-md border border-[#d71920] bg-red-50 px-5 py-4 text-sm font-black text-[#d71920]">
              {errorMessage}
            </div>
          )}

          <div className="flex justify-end">
            <button
              type="submit"
              className="h-14 rounded-md bg-black px-8 text-base font-black text-white transition hover:bg-[#d71920]"
            >
              PYT 생성하기
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}