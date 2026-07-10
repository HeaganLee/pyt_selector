'use client';

import Cookies from 'js-cookie';
import { FormEvent, useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';

const API_BASE_URL = process.env.NEXT_PUBLIC_SERVER_URL ?? '';

type BreakUnitType = 'FULL_CASE' | 'HALF_CASE' | 'BOX' | 'CUSTOM';
type RegisterMode = 'DIRECT' | 'EXCEL';

interface ProductOption {
  id: number;
  productId: number;
  brandName: string;
  productName: string;
  productLabel: string;
  optionName: string;
  boxType: string;
  sportType: string;
  boxCountDefault: number | null;
}

interface TeamItem {
  id: number;
  name: string;
  shortName: string;
  sportType: string;
}

interface PytCreateData {
  productOptions: ProductOption[];
  teams: TeamItem[];
}

interface PytUploadTeamPrice {
  teamId: number;
  teamName: string;
  shortName: string;
  price: string;
  fillerOnly: boolean;
}

interface PytUploadItem {
  pytId: number | null;
  sheetName: string;
  title: string;
  breakUnitType: BreakUnitType;
  roundNo: number;
  boxCount: number;
  teamCount: number;
  totalPrice: string;
  teamPrices: PytUploadTeamPrice[];
}

interface PytUploadResult {
  pytIds: number[];
  sheetNames: string[];
  items: PytUploadItem[];
  createdCount: number;
}

interface DirectRoundForm {
  localId: number;
  title: string;
  breakUnitType: BreakUnitType;
  roundNo: number;
  boxCount: number;
  teamPrices: Record<number, string>;
  fillerOnlyTeamIds: number[];
}

const templateSports = [
  { label: '야구', value: 'BASEBALL' },
  { label: '축구', value: 'SOCCER' },
  { label: '농구', value: 'BASKETBALL' },
  { label: '풋볼', value: 'FOOTBALL' },
  { label: '하키', value: 'HOCKEY' },
];

function createDirectRound(
  localId: number,
  roundNo: number,
  boxCount: number
): DirectRoundForm {
  return {
    localId,
    title: '',
    breakUnitType: 'FULL_CASE',
    roundNo,
    boxCount,
    teamPrices: {},
    fillerOnlyTeamIds: [],
  };
}

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
  const uploadFileInputRef = useRef<HTMLInputElement>(null);

  const [authState, setAuthState] = useState({
    isChecked: false,
    accessToken: '',
    userRoleType: '',
  });
  const [registerMode, setRegisterMode] = useState<RegisterMode>('DIRECT');
  const [productOptions, setProductOptions] = useState<ProductOption[]>([]);
  const [teams, setTeams] = useState<TeamItem[]>([]);
  const [cardProductOptionId, setCardProductOptionId] = useState(0);
  const [directRounds, setDirectRounds] = useState<DirectRoundForm[]>([
    createDirectRound(1, 1, 1),
  ]);
  const [nextRoundLocalId, setNextRoundLocalId] = useState(2);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [directMessage, setDirectMessage] = useState('');
  const [directErrorMessage, setDirectErrorMessage] = useState('');
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploadResult, setUploadResult] = useState<PytUploadResult | null>(null);
  const [isPreviewing, setIsPreviewing] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadMessage, setUploadMessage] = useState('');
  const [uploadErrorMessage, setUploadErrorMessage] = useState('');

  const accessToken = authState.accessToken;
  const isSeller = authState.userRoleType === 'SELLER';

  useEffect(() => {
    const nextAccessToken = Cookies.get('accessToken') ?? '';
    const nextUserRoleType = Cookies.get('userRoleType') ?? '';

    setAuthState({
      isChecked: true,
      accessToken: nextAccessToken,
      userRoleType: nextUserRoleType,
    });

    if (!nextAccessToken) {
      router.replace('/login');
      return;
    }

    if (nextUserRoleType !== 'SELLER') {
      alert('PYT 등록은 셀러만 가능합니다.');
      router.replace('/mypage');
    }
  }, [router]);

  useEffect(() => {
    if (!authState.isChecked) {
      return;
    }

    if (!accessToken || !isSeller) {
      setIsLoading(false);
      return;
    }

    const fetchCreateData = async () => {
      try {
        setIsLoading(true);
        setDirectErrorMessage('');

        const response = await fetch(`${API_BASE_URL}/pyt/create-data`);

        if (!response.ok) {
          throw new Error(await response.text());
        }

        const data = (await response.json()) as PytCreateData;
        const firstOption = data.productOptions[0];
        const defaultBoxCount = firstOption?.boxCountDefault ?? 1;

        setProductOptions(data.productOptions);
        setTeams(data.teams);
        setCardProductOptionId(firstOption?.id ?? 0);
        setDirectRounds([createDirectRound(1, 1, defaultBoxCount)]);
        setNextRoundLocalId(2);
      } catch (error) {
        console.error(error);
        setDirectErrorMessage('PYT 생성 데이터를 불러오지 못했습니다.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchCreateData();
  }, [authState.isChecked, accessToken, isSeller]);

  const selectedOption = useMemo(() => {
    return productOptions.find((option) => option.id === cardProductOptionId);
  }, [cardProductOptionId, productOptions]);

  const filteredTeams = useMemo(() => {
    if (!selectedOption) return [];
    return teams.filter((team) => team.sportType === selectedOption.sportType);
  }, [selectedOption, teams]);

  const isExcelProductReady = selectedOption?.sportType === 'BASEBALL';

  const getRoundTotalPrice = (round: DirectRoundForm) => {
    return filteredTeams.reduce((sum, team) => {
      const price = Number(round.teamPrices[team.id] || 0);
      return sum + price;
    }, 0);
  };

  const handleModeChange = (mode: RegisterMode) => {
    setRegisterMode(mode);
    setDirectMessage('');
    setDirectErrorMessage('');
    setUploadMessage('');
    setUploadErrorMessage('');
  };

  const handleOptionChange = (optionId: number) => {
    const option = productOptions.find((item) => item.id === optionId);
    const defaultBoxCount = option?.boxCountDefault ?? 1;

    setCardProductOptionId(optionId);
    setDirectRounds((prev) =>
      prev.map((round) => ({
        ...round,
        boxCount: defaultBoxCount,
        teamPrices: {},
        fillerOnlyTeamIds: [],
      }))
    );
    setDirectMessage('');
    setDirectErrorMessage('');
    setUploadFile(null);
    setUploadResult(null);
    setUploadMessage('');
    setUploadErrorMessage('');

    if (uploadFileInputRef.current) {
      uploadFileInputRef.current.value = '';
    }
  };

  const handleRoundFillerOnlyToggle = (localId: number, teamId: number) => {
    updateRound(localId, (round) => {
      const isSelected = round.fillerOnlyTeamIds.includes(teamId);
      return {
        ...round,
        fillerOnlyTeamIds: isSelected
          ? round.fillerOnlyTeamIds.filter((id) => id !== teamId)
          : [...round.fillerOnlyTeamIds, teamId],
      };
    });
  };

  const updateRound = (
    localId: number,
    updater: (round: DirectRoundForm) => DirectRoundForm
  ) => {
    setDirectRounds((prev) =>
      prev.map((round) => (round.localId === localId ? updater(round) : round))
    );
  };

  const handleRoundPriceChange = (
    localId: number,
    teamId: number,
    value: string
  ) => {
    const onlyNumber = value.replace(/[^0-9]/g, '');

    updateRound(localId, (round) => ({
      ...round,
      teamPrices: {
        ...round.teamPrices,
        [teamId]: onlyNumber,
      },
    }));
  };

  const handleAddRound = () => {
    const maxRoundNo = directRounds.reduce(
      (maxRound, round) => Math.max(maxRound, round.roundNo),
      0
    );
    const defaultBoxCount = selectedOption?.boxCountDefault ?? 1;

    setDirectRounds((prev) => [
      ...prev,
      createDirectRound(nextRoundLocalId, maxRoundNo + 1, defaultBoxCount),
    ]);
    setNextRoundLocalId((prev) => prev + 1);
  };

  const handleRemoveRound = (localId: number) => {
    if (directRounds.length === 1) return;
    setDirectRounds((prev) => prev.filter((round) => round.localId !== localId));
  };

  const handleTemplateDownload = (sportType: string) => {
    if (sportType !== 'BASEBALL') {
      alert('준비중입니다.');
      return;
    }

    const link = document.createElement('a');
    link.href = '/templates/pyt/baseball/pyt_seller_upload_only_template.xlsx';
    link.download = 'pyt_seller_upload_only_template.xlsx';
    link.click();
  };

  const previewUploadFile = async (file: File) => {
    if (!accessToken || !isSeller) {
      setUploadErrorMessage('셀러만 PYT를 등록할 수 있습니다.');
      return;
    }

    if (!cardProductOptionId) {
      setUploadErrorMessage('상품 옵션을 선택해주세요.');
      return;
    }

    if (!isExcelProductReady) {
      setUploadErrorMessage('엑셀 등록은 야구 상품만 가능합니다.');
      return;
    }

    const formData = new FormData();
    formData.append('cardProductOptionId', String(cardProductOptionId));
    formData.append('file', file);

    try {
      setIsPreviewing(true);

      const response = await fetch(`${API_BASE_URL}/pyt/upload-preview`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
        body: formData,
      });

      if (!response.ok) {
        throw new Error(await response.text());
      }

      const result = (await response.json()) as PytUploadResult;
      setUploadResult(result);
      setUploadMessage('엑셀 값을 불러왔습니다. 내용을 확인한 뒤 등록하세요.');
    } catch (error) {
      console.error(error);
      setUploadErrorMessage(error instanceof Error && error.message
        ? error.message
        : '엑셀 값을 불러오지 못했습니다.');
    } finally {
      setIsPreviewing(false);
    }
  };

  const handleUploadFileChange = (file: File | null) => {
    setUploadFile(file);
    setUploadResult(null);
    setUploadMessage('');
    setUploadErrorMessage('');

    if (file) {
      void previewUploadFile(file);
    }
  };

  const handleClearUploadFile = () => {
    setUploadFile(null);
    setUploadResult(null);
    setUploadMessage('');
    setUploadErrorMessage('');

    if (uploadFileInputRef.current) {
      uploadFileInputRef.current.value = '';
    }
  };

  const validateDirectRounds = () => {
    if (!cardProductOptionId) {
      return '상품 옵션을 선택해주세요.';
    }

    if (directRounds.length === 0) {
      return '등록할 차수를 추가해주세요.';
    }

    for (const round of directRounds) {
      const roundLabel = `${round.roundNo}차`;
      if (!round.title.trim()) {
        return `${roundLabel} PYT 제목을 입력해주세요.`;
      }
      if (!round.roundNo || round.roundNo <= 0) {
        return `${roundLabel} 차수는 1 이상이어야 합니다.`;
      }
      if (!round.boxCount || round.boxCount <= 0) {
        return `${roundLabel} 박스 수는 1 이상이어야 합니다.`;
      }

      const emptyPriceTeam = filteredTeams.find((team) => !round.teamPrices[team.id]);
      if (emptyPriceTeam) {
        return `${roundLabel} ${emptyPriceTeam.shortName} 팀 가격을 입력해주세요.`;
      }
    }

    return '';
  };

  const handleDirectSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setDirectMessage('');
    setDirectErrorMessage('');

    if (!accessToken || !isSeller) {
      setDirectErrorMessage('셀러만 PYT를 등록할 수 있습니다.');
      return;
    }

    const validationMessage = validateDirectRounds();
    if (validationMessage) {
      setDirectErrorMessage(validationMessage);
      return;
    }

    try {
      setIsSubmitting(true);

      const createdIds: number[] = [];
      for (const round of directRounds) {
        const response = await fetch(`${API_BASE_URL}/pyt`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${accessToken}`,
          },
          body: JSON.stringify({
            cardProductOptionId,
            title: round.title,
            breakUnitType: round.breakUnitType,
            roundNo: round.roundNo,
            boxCount: round.boxCount,
            teamPrices: filteredTeams.map((team) => ({
              teamId: team.id,
              price: Number(round.teamPrices[team.id]),
              fillerOnly: round.fillerOnlyTeamIds.includes(team.id),
            })),
          }),
        });

        if (!response.ok) {
          throw new Error(await response.text());
        }

        createdIds.push((await response.json()) as number);
      }

      setDirectMessage(`${createdIds.length}개 차수가 등록되었습니다.`);
    } catch (error) {
      console.error(error);
      setDirectErrorMessage(error instanceof Error && error.message
        ? error.message
        : 'PYT 생성에 실패했습니다.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUploadSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setUploadMessage('');
    setUploadErrorMessage('');

    if (!accessToken || !isSeller) {
      setUploadErrorMessage('셀러만 PYT를 등록할 수 있습니다.');
      return;
    }

    if (!cardProductOptionId) {
      setUploadErrorMessage('상품 옵션을 선택해주세요.');
      return;
    }

    if (!isExcelProductReady) {
      setUploadErrorMessage('엑셀 등록은 야구 상품만 가능합니다.');
      return;
    }

    if (!uploadFile) {
      setUploadErrorMessage('업로드할 엑셀 파일을 선택해주세요.');
      return;
    }

    if (!uploadResult || uploadResult.items.length === 0) {
      setUploadErrorMessage('엑셀 값을 먼저 불러와야 합니다.');
      return;
    }

    const formData = new FormData();
    formData.append('cardProductOptionId', String(cardProductOptionId));
    formData.append('file', uploadFile);

    try {
      setIsUploading(true);

      const response = await fetch(`${API_BASE_URL}/pyt/upload`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
        body: formData,
      });

      if (!response.ok) {
        throw new Error(await response.text());
      }

      const result = (await response.json()) as PytUploadResult;
      setUploadResult(result);
      setUploadFile(null);
      if (uploadFileInputRef.current) {
        uploadFileInputRef.current.value = '';
      }
      setUploadMessage(`${result.createdCount}개 차수가 등록되었습니다.`);
    } catch (error) {
      console.error(error);
      setUploadErrorMessage(error instanceof Error && error.message
        ? error.message
        : '엑셀 업로드에 실패했습니다.');
    } finally {
      setIsUploading(false);
    }
  };

  if (!authState.isChecked || !accessToken || !isSeller) {
    return null;
  }

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
            <h1 className="text-4xl font-black text-black">PYT 등록</h1>
            <p className="mt-4 max-w-2xl text-sm font-bold leading-6 text-gray-600">
              직접 등록과 엑셀 등록 중 하나를 선택하고, 먼저 등록할 상품 옵션을 고르세요.
            </p>
          </div>
        </section>

        <section className="mt-10 overflow-hidden rounded-[24px] border border-black bg-white shadow-[6px_6px_0_#111]">
          <div className="border-b border-black px-6 py-5">
            <h2 className="text-2xl font-black text-black">등록 방식 / 상품 선택</h2>
          </div>

          <div className="grid gap-5 p-6 lg:grid-cols-[300px_1fr_220px]">
            <div>
              <p className="mb-2 text-sm font-black text-black">등록 방식</p>
              <div className="grid grid-cols-2 overflow-hidden rounded-md border border-black">
                <button
                  type="button"
                  onClick={() => handleModeChange('DIRECT')}
                  className={`h-12 text-sm font-black transition ${
                    registerMode === 'DIRECT'
                      ? 'bg-black text-white'
                      : 'bg-white text-black hover:bg-[#f6f3ee]'
                  }`}
                >
                  직접 등록
                </button>
                <button
                  type="button"
                  onClick={() => handleModeChange('EXCEL')}
                  className={`h-12 border-l border-black text-sm font-black transition ${
                    registerMode === 'EXCEL'
                      ? 'bg-black text-white'
                      : 'bg-white text-black hover:bg-[#f6f3ee]'
                  }`}
                >
                  엑셀 등록
                </button>
              </div>
            </div>

            <label className="block">
              <span className="mb-2 block text-sm font-black text-black">상품 옵션</span>
              <select
                value={cardProductOptionId}
                disabled={isLoading}
                onChange={(event) => handleOptionChange(Number(event.target.value))}
                className="h-12 w-full rounded-md border border-gray-300 bg-[#f1f1f1] px-4 text-sm font-bold text-black outline-none focus:border-black focus:bg-white"
              >
                {productOptions.map((option) => (
                  <option key={option.id} value={option.id}>
                    {option.productLabel} / {option.optionName}
                  </option>
                ))}
              </select>
            </label>

            <div>
              <p className="mb-2 text-sm font-black text-black">스포츠 타입</p>
              <div className="flex h-12 items-center rounded-md border border-gray-300 bg-[#f1f1f1] px-4 text-sm font-black text-[#d71920]">
                {selectedOption?.sportType ?? '-'}
              </div>
            </div>
          </div>
        </section>

        {registerMode === 'EXCEL' ? (
          <section className="mt-10 overflow-hidden rounded-[24px] border border-black bg-white shadow-[6px_6px_0_#111]">
            <div className="border-b border-black px-6 py-5">
              <h2 className="text-2xl font-black text-black">엑셀 등록</h2>
            </div>

            <div className="grid gap-7 p-6 lg:grid-cols-[1fr_1.2fr]">
              <div>
                <p className="text-sm font-black text-gray-500">형식 다운로드</p>
                <div className="mt-4 flex flex-wrap gap-2">
                  {templateSports.map((sport) => (
                    <button
                      key={sport.value}
                      type="button"
                      onClick={() => handleTemplateDownload(sport.value)}
                      className="inline-flex h-11 items-center justify-center rounded-md border border-black bg-white px-4 text-sm font-black text-black transition hover:bg-[#d71920] hover:text-white"
                    >
                      {sport.label}
                    </button>
                  ))}
                </div>
              </div>

              <form onSubmit={handleUploadSubmit} className="space-y-4">
                <label className="block">
                  <span className="text-sm font-black text-black">엑셀 파일</span>
                  <input
                    ref={uploadFileInputRef}
                    type="file"
                    accept=".xlsx,.xlsm"
                    onChange={(event) => handleUploadFileChange(event.target.files?.[0] ?? null)}
                    className="mt-2 block w-full rounded-md border border-gray-300 bg-[#f1f1f1] px-4 py-3 text-sm font-bold text-black file:mr-4 file:rounded-md file:border-0 file:bg-black file:px-4 file:py-2 file:text-sm file:font-black file:text-white"
                  />
                </label>

                {uploadFile && (
                  <div className="flex flex-col gap-3 rounded-md border border-black bg-[#f6f3ee] px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
                    <p className="text-sm font-black text-black">
                      {uploadFile.name} 선택됨
                    </p>
                    <button
                      type="button"
                      onClick={handleClearUploadFile}
                      className="h-9 rounded-md border border-black bg-white px-4 text-xs font-black text-black transition hover:bg-black hover:text-white"
                    >
                      파일 선택 해제
                    </button>
                  </div>
                )}

                {isPreviewing && (
                  <div className="rounded-md border border-black bg-[#f6f3ee] px-4 py-3 text-sm font-black text-black">
                    엑셀 값을 불러오는 중입니다.
                  </div>
                )}

                {!isExcelProductReady && (
                  <div className="rounded-md border border-[#d71920] bg-red-50 px-4 py-3 text-sm font-black text-[#d71920]">
                    엑셀 등록은 야구 상품만 가능합니다.
                  </div>
                )}

                {uploadMessage && (
                  <div className="rounded-md border border-black bg-[#f6f3ee] px-4 py-3 text-sm font-black text-black">
                    {uploadMessage}
                  </div>
                )}

                {uploadErrorMessage && (
                  <div className="rounded-md border border-[#d71920] bg-red-50 px-4 py-3 text-sm font-black text-[#d71920]">
                    {uploadErrorMessage}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isUploading || isPreviewing}
                  className="h-12 rounded-md bg-black px-6 text-sm font-black text-white transition hover:bg-[#d71920] disabled:cursor-not-allowed disabled:bg-gray-400"
                >
                  {isUploading ? '등록 중...' : '엑셀 등록하기'}
                </button>
              </form>
            </div>

            {uploadResult && uploadResult.items.length > 0 && (
              <div className="border-t border-black p-6">
                <h3 className="text-lg font-black text-black">
                  {uploadResult.createdCount > 0 ? '등록된 엑셀 값' : '엑셀 미리보기 값'}
                </h3>

                <div className="mt-5 space-y-6">
                  {uploadResult.items.map((item) => (
                    <div
                      key={`${item.sheetName}-${item.roundNo}-${item.pytId ?? 'preview'}`}
                      className="overflow-hidden rounded-md border border-black"
                    >
                      <div className="grid gap-3 border-b border-black bg-[#f6f3ee] px-5 py-4 md:grid-cols-5">
                        <div>
                          <p className="text-xs font-black text-gray-500">시트</p>
                          <p className="mt-1 text-sm font-black text-black">{item.sheetName}</p>
                        </div>
                        <div>
                          <p className="text-xs font-black text-gray-500">차수</p>
                          <p className="mt-1 text-sm font-black text-[#d71920]">{item.roundNo}차</p>
                        </div>
                        <div>
                          <p className="text-xs font-black text-gray-500">Break</p>
                          <p className="mt-1 text-sm font-black text-black">
                            {getBreakUnitLabel(item.breakUnitType)}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs font-black text-gray-500">박스 수</p>
                          <p className="mt-1 text-sm font-black text-black">{item.boxCount}</p>
                        </div>
                        <div>
                          <p className="text-xs font-black text-gray-500">총액</p>
                          <p className="mt-1 text-sm font-black text-black">
                            {Number(item.totalPrice).toLocaleString()}원
                          </p>
                        </div>
                        <div className="md:col-span-5">
                          <p className="text-xs font-black text-gray-500">제목</p>
                          <p className="mt-1 text-sm font-black text-black">{item.title}</p>
                        </div>
                      </div>

                      <div className="overflow-x-auto">
                        <table className="min-w-full border-collapse">
                          <thead>
                            <tr className="bg-black text-white">
                              <th className="border-b border-black px-4 py-3 text-left text-xs font-black">팀 ID</th>
                              <th className="border-b border-black px-4 py-3 text-left text-xs font-black">팀</th>
                              <th className="border-b border-black px-4 py-3 text-right text-xs font-black">판매가</th>
                              <th className="border-b border-black px-4 py-3 text-center text-xs font-black">필러 전용</th>
                            </tr>
                          </thead>
                          <tbody>
                            {item.teamPrices.map((teamPrice, index) => (
                              <tr
                                key={`${item.sheetName}-${teamPrice.teamId}`}
                                className={index % 2 === 0 ? 'bg-white' : 'bg-[#f6f3ee]'}
                              >
                                <td className="border-b border-gray-300 px-4 py-3 text-sm font-bold text-black">
                                  {teamPrice.teamId}
                                </td>
                                <td className="border-b border-gray-300 px-4 py-3">
                                  <p className="text-sm font-black text-black">
                                    {teamPrice.shortName || teamPrice.teamName}
                                  </p>
                                  <p className="mt-1 text-xs font-bold text-gray-500">{teamPrice.teamName}</p>
                                </td>
                                <td className="border-b border-gray-300 px-4 py-3 text-right text-sm font-black text-black">
                                  {Number(teamPrice.price).toLocaleString()}원
                                </td>
                                <td className="border-b border-gray-300 px-4 py-3 text-center text-sm font-black text-black">
                                  {teamPrice.fillerOnly ? 'Y' : '-'}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </section>
        ) : (
          <form onSubmit={handleDirectSubmit} className="mt-10 space-y-8">
            <section className="overflow-hidden rounded-[24px] border border-black bg-white shadow-[6px_6px_0_#111]">
              <div className="flex flex-col gap-3 border-b border-black px-6 py-5 sm:flex-row sm:items-center sm:justify-between">
                <h2 className="text-2xl font-black text-black">직접 등록 차수</h2>
                <button
                  type="button"
                  onClick={handleAddRound}
                  className="h-11 rounded-md border border-black bg-white px-5 text-sm font-black text-black transition hover:bg-black hover:text-white"
                >
                  차수 추가
                </button>
              </div>
            </section>

            {directRounds.map((round) => (
              <section
                key={round.localId}
                className="overflow-hidden rounded-[24px] border border-black bg-white shadow-[6px_6px_0_#111]"
              >
                <div className="flex flex-col gap-3 border-b border-black px-6 py-5 sm:flex-row sm:items-center sm:justify-between">
                  <h3 className="text-2xl font-black text-black">{round.roundNo}차</h3>
                  <button
                    type="button"
                    onClick={() => handleRemoveRound(round.localId)}
                    disabled={directRounds.length === 1}
                    className="h-10 rounded-md border border-black bg-white px-4 text-xs font-black text-black transition hover:bg-black hover:text-white disabled:cursor-not-allowed disabled:border-gray-300 disabled:text-gray-400 disabled:hover:bg-white"
                  >
                    차수 삭제
                  </button>
                </div>

                <div className="grid gap-5 p-6 lg:grid-cols-2">
                  <label className="block lg:col-span-2">
                    <span className="mb-2 block text-sm font-black text-black">PYT 제목</span>
                    <input
                      type="text"
                      value={round.title}
                      onChange={(event) =>
                        updateRound(round.localId, (prev) => ({
                          ...prev,
                          title: event.target.value,
                        }))
                      }
                      placeholder="예: 2024 Topps Chrome Baseball Hobby 1 Case PYT #1"
                      className="h-14 w-full rounded-md border border-gray-300 bg-[#f1f1f1] px-4 text-base font-bold text-black outline-none placeholder:text-gray-400 focus:border-black focus:bg-white"
                    />
                  </label>

                  <label className="block">
                    <span className="mb-2 block text-sm font-black text-black">Break 단위</span>
                    <select
                      value={round.breakUnitType}
                      onChange={(event) =>
                        updateRound(round.localId, (prev) => ({
                          ...prev,
                          breakUnitType: event.target.value as BreakUnitType,
                        }))
                      }
                      className="h-14 w-full rounded-md border border-gray-300 bg-[#f1f1f1] px-4 text-base font-bold text-black outline-none focus:border-black focus:bg-white"
                    >
                      <option value="FULL_CASE">{getBreakUnitLabel('FULL_CASE')}</option>
                      <option value="HALF_CASE">{getBreakUnitLabel('HALF_CASE')}</option>
                      <option value="BOX">{getBreakUnitLabel('BOX')}</option>
                      <option value="CUSTOM">{getBreakUnitLabel('CUSTOM')}</option>
                    </select>
                  </label>

                  <label className="block">
                    <span className="mb-2 block text-sm font-black text-black">차수</span>
                    <input
                      type="number"
                      min={1}
                      value={round.roundNo}
                      onChange={(event) =>
                        updateRound(round.localId, (prev) => ({
                          ...prev,
                          roundNo: Number(event.target.value),
                        }))
                      }
                      className="h-14 w-full rounded-md border border-gray-300 bg-[#f1f1f1] px-4 text-base font-bold text-black outline-none focus:border-black focus:bg-white"
                    />
                  </label>

                  <label className="block">
                    <span className="mb-2 block text-sm font-black text-black">박스 수</span>
                    <input
                      type="number"
                      min={1}
                      value={round.boxCount}
                      onChange={(event) =>
                        updateRound(round.localId, (prev) => ({
                          ...prev,
                          boxCount: Number(event.target.value),
                        }))
                      }
                      className="h-14 w-full rounded-md border border-gray-300 bg-[#f1f1f1] px-4 text-base font-bold text-black outline-none focus:border-black focus:bg-white"
                    />
                  </label>

                </div>

                <div className="flex flex-col gap-3 border-t border-black px-6 py-5 md:flex-row md:items-center md:justify-between">
                  <div>
                    <h4 className="text-xl font-black text-black">팀 가격 설정</h4>
                    <p className="mt-1 text-sm font-bold text-gray-500">
                      {round.roundNo}차에 적용할 팀별 가격입니다.
                    </p>
                  </div>

                  <div className="rounded-md bg-black px-4 py-3 text-sm font-black text-white">
                    총합 {getRoundTotalPrice(round).toLocaleString()}원
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="min-w-full border-collapse">
                    <thead>
                      <tr className="bg-[#d71920] text-white">
                        <th className="border-b border-black px-5 py-4 text-left text-xs font-black uppercase tracking-wider">Team</th>
                        <th className="border-b border-black px-5 py-4 text-left text-xs font-black uppercase tracking-wider">Sport</th>
                        <th className="border-b border-black px-5 py-4 text-left text-xs font-black uppercase tracking-wider">Price</th>
                        <th className="border-b border-black px-5 py-4 text-center text-xs font-black uppercase tracking-wider">Filler</th>
                      </tr>
                    </thead>

                    <tbody>
                      {isLoading ? (
                        <tr>
                          <td colSpan={4} className="border-b border-gray-300 px-5 py-8 text-center text-sm font-black text-gray-500">
                            팀 목록을 불러오는 중입니다.
                          </td>
                        </tr>
                      ) : filteredTeams.length === 0 ? (
                        <tr>
                          <td colSpan={4} className="border-b border-gray-300 px-5 py-8 text-center text-sm font-black text-gray-500">
                            선택 가능한 팀이 없습니다.
                          </td>
                        </tr>
                      ) : (
                        filteredTeams.map((team, index) => (
                          <tr key={team.id} className={index % 2 === 0 ? 'bg-white' : 'bg-[#f6f3ee]'}>
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
                                value={round.teamPrices[team.id] ?? ''}
                                onChange={(event) =>
                                  handleRoundPriceChange(round.localId, team.id, event.target.value)
                                }
                                placeholder="0"
                                className="h-11 w-full max-w-[220px] rounded-md border border-gray-300 bg-white px-3 text-sm font-black text-black outline-none focus:border-black"
                              />
                            </td>
                            <td className="border-b border-gray-300 px-5 py-4 text-center">
                              <input
                                type="checkbox"
                                checked={round.fillerOnlyTeamIds.includes(team.id)}
                                onChange={() => handleRoundFillerOnlyToggle(round.localId, team.id)}
                                className="h-5 w-5 accent-[#d71920]"
                              />
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </section>
            ))}

            {directMessage && (
              <div className="rounded-md border border-black bg-white px-5 py-4 text-sm font-black text-black">
                {directMessage}
              </div>
            )}

            {directErrorMessage && (
              <div className="rounded-md border border-[#d71920] bg-red-50 px-5 py-4 text-sm font-black text-[#d71920]">
                {directErrorMessage}
              </div>
            )}

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={isLoading || isSubmitting}
                className="h-14 rounded-md bg-black px-8 text-base font-black text-white transition hover:bg-[#d71920] disabled:cursor-not-allowed disabled:bg-gray-400"
              >
                {isSubmitting ? '등록 중...' : '직접 등록하기'}
              </button>
            </div>
          </form>
        )}
      </div>
    </main>
  );
}
