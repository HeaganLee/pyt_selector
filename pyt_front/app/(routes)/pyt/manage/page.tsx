'use client';

import Cookies from 'js-cookie';
import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';

const API_BASE_URL = process.env.NEXT_PUBLIC_SERVER_URL ?? '';

type BreakUnitType = 'FULL_CASE' | 'HALF_CASE' | 'BOX' | 'CUSTOM';
type SlotStatus = 'AVAILABLE' | 'RESERVED' | 'SOLD' | 'FILLER_TARGET' | 'FILLER_ASSIGNED';

interface PytListItem {
  id: number;
  cardProductOptionId: number;
  cardProductId: number;
  title: string;
  brandName: string;
  productName: string;
  sportType: string;
  optionName: string;
  breakUnitType: BreakUnitType;
  roundNo: number;
  boxCount: number;
  pytStatus: string;
  totalTeamCount: number;
  remainingTeamCount: number;
}

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

interface PytCreateData {
  productOptions: ProductOption[];
}

interface PytTeamSlot {
  id: number;
  teamId: number;
  teamName: string;
  shortName: string;
  price: number;
  slotStatus: SlotStatus;
  buyerNickname?: string | null;
  fillerTarget: boolean;
  fillerOnly: boolean;
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
  fillerStatus: string;
}

interface PytDetail {
  id: number;
  cardProductOptionId: number;
  cardProductId: number;
  title: string;
  brandName: string;
  productName: string;
  sportType: string;
  optionName: string;
  breakUnitType: BreakUnitType;
  roundNo: number;
  boxCount: number | null;
  pytStatus: string;
  teamSlots: PytTeamSlot[];
  fillers: PytFiller[];
}

interface EditForm {
  cardProductOptionId: number;
  title: string;
  breakUnitType: BreakUnitType;
  roundNo: number;
  boxCount: number;
  teamPrices: Record<number, string>;
  fillerOnlyTeamIds: number[];
}

const breakUnitOptions: { value: BreakUnitType; label: string }[] = [
  { value: 'FULL_CASE', label: '한 케이스' },
  { value: 'HALF_CASE', label: '반 케이스' },
  { value: 'BOX', label: '박스' },
  { value: 'CUSTOM', label: '직접 입력' },
];

function getBreakUnitLabel(type: BreakUnitType) {
  return breakUnitOptions.find((option) => option.value === type)?.label ?? type;
}

function getSlotStatusLabel(status: SlotStatus) {
  switch (status) {
    case 'AVAILABLE':
      return '판매 가능';
    case 'SOLD':
      return '판매 완료';
    case 'FILLER_TARGET':
      return '필러 대상';
    case 'FILLER_ASSIGNED':
      return '필러 배정';
    case 'RESERVED':
      return '예약중';
    default:
      return status;
  }
}

function buildEditForm(pyt: PytDetail): EditForm {
  return {
    cardProductOptionId: pyt.cardProductOptionId,
    title: pyt.title,
    breakUnitType: pyt.breakUnitType,
    roundNo: pyt.roundNo,
    boxCount: pyt.boxCount ?? 1,
    teamPrices: Object.fromEntries(
      pyt.teamSlots.map((slot) => [slot.teamId, String(slot.price)])
    ),
    fillerOnlyTeamIds: pyt.teamSlots
      .filter((slot) => slot.fillerOnly)
      .map((slot) => slot.teamId),
  };
}

function getNextFillerRoundNo(pyt: PytDetail) {
  return pyt.fillers.reduce(
    (maxRound, filler) => Math.max(maxRound, filler.fillerRoundNo ?? 0),
    0
  ) + 1;
}

export default function PytManagePage() {
  const router = useRouter();
  const [authState, setAuthState] = useState({
    isChecked: false,
    accessToken: '',
    userRoleType: '',
  });
  const [pytList, setPytList] = useState<PytListItem[]>([]);
  const [productOptions, setProductOptions] = useState<ProductOption[]>([]);
  const [selectedPytId, setSelectedPytId] = useState<number | null>(null);
  const [selectedPyt, setSelectedPyt] = useState<PytDetail | null>(null);
  const [editForm, setEditForm] = useState<EditForm | null>(null);
  const [fillerRoundNo, setFillerRoundNo] = useState(1);
  const [fillerBoxCount, setFillerBoxCount] = useState(1);
  const [teamsPerFillerSlot, setTeamsPerFillerSlot] = useState(1);
  const [isListLoading, setIsListLoading] = useState(true);
  const [isDetailLoading, setIsDetailLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

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
      alert('PYT 관리는 셀러만 가능합니다.');
      router.replace('/mypage');
    }
  }, [router]);

  const fetchPytList = async (token: string) => {
    const response = await fetch(`${API_BASE_URL}/pyt/manage`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!response.ok) {
      throw new Error(await response.text());
    }

    return (await response.json()) as PytListItem[];
  };

  const fetchPytDetail = async (token: string, pytId: number) => {
    const response = await fetch(`${API_BASE_URL}/pyt/manage/${pytId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!response.ok) {
      throw new Error(await response.text());
    }

    return (await response.json()) as PytDetail;
  };

  const fetchCreateData = async () => {
    const response = await fetch(`${API_BASE_URL}/pyt/create-data`);

    if (!response.ok) {
      throw new Error(await response.text());
    }

    return (await response.json()) as PytCreateData;
  };

  useEffect(() => {
    if (!authState.isChecked) return;
    if (!accessToken || !isSeller) {
      setIsListLoading(false);
      return;
    }

    let isMounted = true;

    const loadList = async () => {
      try {
        setIsListLoading(true);
        setErrorMessage('');

        const [data, createData] = await Promise.all([
          fetchPytList(accessToken),
          fetchCreateData(),
        ]);
        if (!isMounted) return;

        setPytList(data);
        setProductOptions(createData.productOptions);
        if (data.length > 0) {
          setSelectedPytId((prev) => prev ?? data[0].id);
        }
      } catch (error) {
        console.error(error);
        if (isMounted) {
          setErrorMessage('PYT 관리 목록을 불러오지 못했습니다.');
        }
      } finally {
        if (isMounted) {
          setIsListLoading(false);
        }
      }
    };

    loadList();

    return () => {
      isMounted = false;
    };
  }, [authState.isChecked, accessToken, isSeller]);

  useEffect(() => {
    if (!accessToken || !isSeller || selectedPytId == null) return;

    let isMounted = true;

    const loadDetail = async () => {
      try {
        setIsDetailLoading(true);
        setMessage('');
        setErrorMessage('');

        const data = await fetchPytDetail(accessToken, selectedPytId);
        if (!isMounted) return;

        setSelectedPyt(data);
        setEditForm(buildEditForm(data));
        setFillerRoundNo(getNextFillerRoundNo(data));
        setFillerBoxCount(Math.min(2, data.boxCount ?? 1));
        setTeamsPerFillerSlot(1);
      } catch (error) {
        console.error(error);
        if (isMounted) {
          setErrorMessage('PYT 상세 정보를 불러오지 못했습니다.');
        }
      } finally {
        if (isMounted) {
          setIsDetailLoading(false);
        }
      }
    };

    loadDetail();

    return () => {
      isMounted = false;
    };
  }, [accessToken, isSeller, selectedPytId]);

  const availableSlots = useMemo(() => {
    return selectedPyt?.teamSlots.filter((slot) => slot.slotStatus === 'AVAILABLE') ?? [];
  }, [selectedPyt]);

  const compatibleProductOptions = useMemo(() => {
    if (!selectedPyt) return productOptions;
    return productOptions.filter((option) => option.sportType === selectedPyt.sportType);
  }, [productOptions, selectedPyt]);

  const remainingTeamTotalPrice = useMemo(() => {
    return availableSlots.reduce((sum, slot) => sum + slot.price, 0);
  }, [availableSlots]);

  const calculatedFillerSlotCount =
    teamsPerFillerSlot > 0 && availableSlots.length % teamsPerFillerSlot === 0
      ? availableSlots.length / teamsPerFillerSlot
      : 0;

  const fillerPricePerSlot =
    calculatedFillerSlotCount > 0
      ? Math.ceil(remainingTeamTotalPrice / calculatedFillerSlotCount)
      : 0;

  const handleSelectPyt = (pytId: number) => {
    setSelectedPytId(pytId);
  };

  const handlePriceChange = (teamId: number, value: string) => {
    const onlyNumber = value.replace(/[^0-9]/g, '');
    setEditForm((prev) =>
      prev
        ? {
            ...prev,
            teamPrices: {
              ...prev.teamPrices,
              [teamId]: onlyNumber,
            },
          }
        : prev
    );
  };

  const handleFillerOnlyToggle = (teamId: number) => {
    setEditForm((prev) => {
      if (!prev) return prev;
      const isSelected = prev.fillerOnlyTeamIds.includes(teamId);
      return {
        ...prev,
        fillerOnlyTeamIds: isSelected
          ? prev.fillerOnlyTeamIds.filter((id) => id !== teamId)
          : [...prev.fillerOnlyTeamIds, teamId],
      };
    });
  };

  const handleSave = async () => {
    if (!selectedPyt || !editForm) return;
    setMessage('');
    setErrorMessage('');

    if (!editForm.title.trim()) {
      setErrorMessage('PYT 제목을 입력해주세요.');
      return;
    }

    if (!editForm.cardProductOptionId) {
      setErrorMessage('상품 옵션을 선택해주세요.');
      return;
    }

    try {
      setIsSaving(true);

      const response = await fetch(`${API_BASE_URL}/pyt/${selectedPyt.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          cardProductOptionId: editForm.cardProductOptionId,
          title: editForm.title,
          breakUnitType: editForm.breakUnitType,
          roundNo: editForm.roundNo,
          boxCount: editForm.boxCount,
          teamPrices: selectedPyt.teamSlots.map((slot) => ({
            teamId: slot.teamId,
            price: Number(editForm.teamPrices[slot.teamId] || 0),
            fillerOnly: editForm.fillerOnlyTeamIds.includes(slot.teamId),
          })),
        }),
      });

      if (!response.ok) {
        throw new Error(await response.text());
      }

      const updated = (await response.json()) as PytDetail;
      setSelectedPyt(updated);
      setEditForm(buildEditForm(updated));
      setPytList(await fetchPytList(accessToken));
      setMessage('PYT가 수정되었습니다.');
    } catch (error) {
      console.error(error);
      setErrorMessage(error instanceof Error && error.message
        ? error.message
        : 'PYT 수정에 실패했습니다.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedPyt) return;
    setMessage('');
    setErrorMessage('');

    const confirmed = confirm('이 PYT를 삭제하시겠습니까? 구매 기록이나 필러가 있으면 삭제할 수 없습니다.');
    if (!confirmed) return;

    try {
      setIsSaving(true);

      const response = await fetch(`${API_BASE_URL}/pyt/${selectedPyt.id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${accessToken}` },
      });

      if (!response.ok) {
        throw new Error(await response.text());
      }

      const nextList = await fetchPytList(accessToken);
      setPytList(nextList);
      setSelectedPytId(nextList[0]?.id ?? null);
      setSelectedPyt(null);
      setEditForm(null);
      setMessage('PYT가 삭제되었습니다.');
    } catch (error) {
      console.error(error);
      setErrorMessage(error instanceof Error && error.message
        ? error.message
        : 'PYT 삭제에 실패했습니다.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCreateFiller = async () => {
    if (!selectedPyt) return;
    setMessage('');
    setErrorMessage('');

    if (availableSlots.length === 0) {
      setErrorMessage('필러 전환할 남은 팀이 없습니다.');
      return;
    }

    if (fillerRoundNo <= 0) {
      setErrorMessage('필러 차수는 1 이상이어야 합니다.');
      return;
    }

    if (fillerBoxCount <= 0) {
      setErrorMessage('필러 진행 박스 수는 1 이상이어야 합니다.');
      return;
    }

    if (teamsPerFillerSlot <= 0) {
      setErrorMessage('슬롯당 팀 수는 1 이상이어야 합니다.');
      return;
    }

    if (availableSlots.length % teamsPerFillerSlot !== 0) {
      setErrorMessage('남은 팀 수가 슬롯당 팀 수로 나누어 떨어져야 합니다.');
      return;
    }

    try {
      setIsSaving(true);

      const response = await fetch(`${API_BASE_URL}/pyt/${selectedPyt.id}/fillers`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          fillerRoundNo,
          boxCount: fillerBoxCount,
          teamsPerSlot: teamsPerFillerSlot,
        }),
      });

      if (!response.ok) {
        throw new Error(await response.text());
      }

      const updated = await fetchPytDetail(accessToken, selectedPyt.id);
      setSelectedPyt(updated);
      setEditForm(buildEditForm(updated));
      setFillerRoundNo(getNextFillerRoundNo(updated));
      setPytList(await fetchPytList(accessToken));
      setMessage('남은 팀 전체가 필러로 전환되었습니다.');
    } catch (error) {
      console.error(error);
      setErrorMessage(error instanceof Error && error.message
        ? error.message
        : '필러 전환에 실패했습니다.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancelFiller = async (filler: PytFiller) => {
    if (!selectedPyt) return;
    setMessage('');
    setErrorMessage('');

    if (filler.entryCount > 0) {
      setErrorMessage('필러 참가자가 있는 필러는 PYT 모집으로 되돌릴 수 없습니다.');
      return;
    }

    const confirmed = confirm('이 필러를 취소하고 대상 팀을 다시 PYT 모집으로 되돌리겠습니까?');
    if (!confirmed) return;

    try {
      setIsSaving(true);

      const response = await fetch(`${API_BASE_URL}/pyt/${selectedPyt.id}/fillers/${filler.id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${accessToken}` },
      });

      if (!response.ok) {
        throw new Error(await response.text());
      }

      const updated = await fetchPytDetail(accessToken, selectedPyt.id);
      setSelectedPyt(updated);
      setEditForm(buildEditForm(updated));
      setFillerRoundNo(getNextFillerRoundNo(updated));
      setPytList(await fetchPytList(accessToken));
      setMessage('필러가 취소되고 PYT 모집으로 되돌아갔습니다.');
    } catch (error) {
      console.error(error);
      setErrorMessage(error instanceof Error && error.message
        ? error.message
        : '필러 취소에 실패했습니다.');
    } finally {
      setIsSaving(false);
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
              Seller PYT
            </p>
          </div>
          <div className="flex flex-col gap-5 px-8 py-8 md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-4xl font-black text-black">PYT 관리</h1>
              <p className="mt-3 text-sm font-bold text-gray-600">
                등록한 PYT를 수정, 삭제하고 남은 팀을 필러로 전환합니다.
              </p>
            </div>
            <Link
              href="/pyt/create"
              className="inline-flex h-12 items-center justify-center rounded-md bg-[#d71920] px-5 text-sm font-black text-white transition hover:bg-black"
            >
              PYT 등록
            </Link>
          </div>
        </section>

        {(message || errorMessage) && (
          <div
            className={`mt-6 rounded-md border px-5 py-4 text-sm font-black ${
              errorMessage
                ? 'border-[#d71920] bg-red-50 text-[#d71920]'
                : 'border-black bg-white text-black'
            }`}
          >
            {errorMessage || message}
          </div>
        )}

        <div className="mt-8 grid gap-8 lg:grid-cols-[360px_1fr]">
          <section className="overflow-hidden rounded-[24px] border border-black bg-white shadow-[6px_6px_0_#111]">
            <div className="border-b border-black px-5 py-4">
              <h2 className="text-xl font-black text-black">PYT 목록</h2>
            </div>
            <div className="max-h-[720px] overflow-y-auto">
              {isListLoading ? (
                <div className="px-5 py-8 text-sm font-black text-gray-500">
                  목록을 불러오는 중입니다.
                </div>
              ) : pytList.length === 0 ? (
                <div className="px-5 py-8 text-sm font-black text-gray-500">
                  등록된 PYT가 없습니다.
                </div>
              ) : (
                pytList.map((pyt) => (
                  <button
                    key={pyt.id}
                    type="button"
                    onClick={() => handleSelectPyt(pyt.id)}
                    className={`block w-full border-b border-gray-200 px-5 py-4 text-left transition ${
                      selectedPytId === pyt.id ? 'bg-black text-white' : 'bg-white text-black hover:bg-[#f6f3ee]'
                    }`}
                  >
                    <p className="text-sm font-black">{pyt.title}</p>
                    <p className={`mt-2 text-xs font-bold ${selectedPytId === pyt.id ? 'text-gray-300' : 'text-gray-500'}`}>
                      {pyt.productName} / {pyt.optionName} / {pyt.roundNo}차
                    </p>
                    <p className={`mt-1 text-xs font-bold ${selectedPytId === pyt.id ? 'text-gray-300' : 'text-gray-500'}`}>
                      남은 팀 {pyt.remainingTeamCount} / {pyt.totalTeamCount}
                    </p>
                  </button>
                ))
              )}
            </div>
          </section>

          <section className="min-w-0 overflow-hidden rounded-[24px] border border-black bg-white shadow-[6px_6px_0_#111]">
            <div className="border-b border-black px-6 py-5">
              <h2 className="text-xl font-black text-black">상세 관리</h2>
            </div>

            {isDetailLoading ? (
              <div className="px-6 py-10 text-sm font-black text-gray-500">
                상세 정보를 불러오는 중입니다.
              </div>
            ) : !selectedPyt || !editForm ? (
              <div className="px-6 py-10 text-sm font-black text-gray-500">
                관리할 PYT를 선택해주세요.
              </div>
            ) : (
              <div className="space-y-8 p-6">
                <div className="grid gap-4 md:grid-cols-2">
                  <label className="block md:col-span-2">
                    <span className="mb-2 block text-sm font-black text-black">상품 옵션</span>
                    <select
                      value={editForm.cardProductOptionId}
                      onChange={(event) =>
                        setEditForm((prev) =>
                          prev
                            ? {
                                ...prev,
                                cardProductOptionId: Number(event.target.value),
                              }
                            : prev
                        )
                      }
                      className="h-12 w-full rounded-md border border-gray-300 bg-[#f1f1f1] px-4 text-sm font-bold text-black outline-none focus:border-black focus:bg-white"
                    >
                      <option value={0}>상품 옵션을 선택해주세요</option>
                      {compatibleProductOptions.map((option) => (
                        <option key={option.id} value={option.id}>
                          {option.productLabel} / {option.optionName} / {option.boxType} / {option.sportType}
                        </option>
                      ))}
                    </select>
                  </label>

                  <label className="block md:col-span-2">
                    <span className="mb-2 block text-sm font-black text-black">제목</span>
                    <input
                      type="text"
                      value={editForm.title}
                      onChange={(event) =>
                        setEditForm((prev) => prev ? { ...prev, title: event.target.value } : prev)
                      }
                      className="h-12 w-full rounded-md border border-gray-300 bg-[#f1f1f1] px-4 text-sm font-bold text-black outline-none focus:border-black focus:bg-white"
                    />
                  </label>

                  <label className="block">
                    <span className="mb-2 block text-sm font-black text-black">Break 단위</span>
                    <select
                      value={editForm.breakUnitType}
                      onChange={(event) =>
                        setEditForm((prev) =>
                          prev ? { ...prev, breakUnitType: event.target.value as BreakUnitType } : prev
                        )
                      }
                      className="h-12 w-full rounded-md border border-gray-300 bg-[#f1f1f1] px-4 text-sm font-bold text-black outline-none focus:border-black focus:bg-white"
                    >
                      {breakUnitOptions.map((option) => (
                        <option key={option.value} value={option.value}>{option.label}</option>
                      ))}
                    </select>
                  </label>

                  <label className="block">
                    <span className="mb-2 block text-sm font-black text-black">차수</span>
                    <input
                      type="number"
                      min={1}
                      value={editForm.roundNo}
                      onChange={(event) =>
                        setEditForm((prev) => prev ? { ...prev, roundNo: Number(event.target.value) } : prev)
                      }
                      className="h-12 w-full rounded-md border border-gray-300 bg-[#f1f1f1] px-4 text-sm font-bold text-black outline-none focus:border-black focus:bg-white"
                    />
                  </label>

                  <label className="block">
                    <span className="mb-2 block text-sm font-black text-black">박스 수</span>
                    <input
                      type="number"
                      min={1}
                      value={editForm.boxCount}
                      onChange={(event) =>
                        setEditForm((prev) => prev ? { ...prev, boxCount: Number(event.target.value) } : prev)
                      }
                      className="h-12 w-full rounded-md border border-gray-300 bg-[#f1f1f1] px-4 text-sm font-bold text-black outline-none focus:border-black focus:bg-white"
                    />
                  </label>

                </div>

                <div className="overflow-hidden rounded-md border border-black">
                  <div className="flex flex-col gap-2 border-b border-black bg-[#f6f3ee] px-5 py-4 md:flex-row md:items-center md:justify-between">
                    <div>
                      <h3 className="text-lg font-black text-black">팀 가격 수정</h3>
                      <p className="mt-1 text-xs font-bold text-gray-500">
                        판매 완료 또는 필러 전환된 팀은 가격 변경이 제한됩니다.
                      </p>
                    </div>
                    <p className="text-sm font-black text-black">
                      {selectedPyt.brandName} {selectedPyt.productName} / {getBreakUnitLabel(selectedPyt.breakUnitType)}
                    </p>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="min-w-full border-collapse">
                      <thead>
                        <tr className="bg-black text-white">
                          <th className="px-4 py-3 text-left text-xs font-black">팀</th>
                          <th className="px-4 py-3 text-left text-xs font-black">상태</th>
                          <th className="px-4 py-3 text-left text-xs font-black">가격</th>
                          <th className="px-4 py-3 text-center text-xs font-black">필러 전용</th>
                        </tr>
                      </thead>
                      <tbody>
                        {selectedPyt.teamSlots.map((slot, index) => {
                          const isLocked = slot.slotStatus !== 'AVAILABLE';

                          return (
                            <tr key={slot.id} className={index % 2 === 0 ? 'bg-white' : 'bg-[#f6f3ee]'}>
                              <td className="border-t border-gray-200 px-4 py-3">
                                <p className="text-sm font-black text-black">{slot.shortName}</p>
                                <p className="mt-1 text-xs font-bold text-gray-500">{slot.teamName}</p>
                              </td>
                              <td className="border-t border-gray-200 px-4 py-3 text-xs font-black text-gray-700">
                                {getSlotStatusLabel(slot.slotStatus)}
                              </td>
                              <td className="border-t border-gray-200 px-4 py-3">
                                <input
                                  type="text"
                                  disabled={isLocked}
                                  value={editForm.teamPrices[slot.teamId] ?? ''}
                                  onChange={(event) => handlePriceChange(slot.teamId, event.target.value)}
                                  className="h-10 w-full max-w-[180px] rounded-md border border-gray-300 bg-white px-3 text-sm font-black text-black outline-none focus:border-black disabled:cursor-not-allowed disabled:bg-gray-100 disabled:text-gray-400"
                                />
                              </td>
                              <td className="border-t border-gray-200 px-4 py-3 text-center">
                                <input
                                  type="checkbox"
                                  disabled={isLocked}
                                  checked={editForm.fillerOnlyTeamIds.includes(slot.teamId)}
                                  onChange={() => handleFillerOnlyToggle(slot.teamId)}
                                  className="h-5 w-5 accent-[#d71920] disabled:cursor-not-allowed"
                                />
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>

                <div className="flex flex-wrap justify-end gap-3">
                  <button
                    type="button"
                    onClick={handleDelete}
                    disabled={isSaving}
                    className="h-12 rounded-md border border-[#d71920] bg-white px-6 text-sm font-black text-[#d71920] transition hover:bg-[#d71920] hover:text-white disabled:cursor-not-allowed disabled:border-gray-300 disabled:text-gray-400 disabled:hover:bg-white"
                  >
                    PYT 삭제
                  </button>
                  <button
                    type="button"
                    onClick={handleSave}
                    disabled={isSaving}
                    className="h-12 rounded-md bg-black px-6 text-sm font-black text-white transition hover:bg-[#d71920] disabled:cursor-not-allowed disabled:bg-gray-400"
                  >
                    {isSaving ? '저장 중...' : '수정 저장'}
                  </button>
                </div>

                <div className="overflow-hidden rounded-md border border-black">
                  <div className="border-b border-black bg-[#f6f3ee] px-5 py-4">
                    <h3 className="text-lg font-black text-black">필러 전환</h3>
                    <p className="mt-1 text-xs font-bold text-gray-500">
                      남은 팀 전체를 필러 대상으로 전환합니다. 남은 팀 수가 슬롯당 팀 수로 나누어 떨어져야 합니다.
                    </p>
                  </div>

                  <div className="grid gap-5 p-5 lg:grid-cols-[1fr_240px]">
                    <div className="grid gap-2 sm:grid-cols-2">
                      {availableSlots.length === 0 ? (
                        <p className="text-sm font-black text-gray-500">필러 전환 가능한 팀이 없습니다.</p>
                      ) : (
                        availableSlots.map((slot) => (
                          <div
                            key={slot.id}
                            className="flex items-center justify-between gap-3 rounded-md border border-gray-300 bg-white px-3 py-2 text-sm font-bold text-black"
                          >
                            <span>{slot.shortName || slot.teamName}</span>
                            {slot.fillerOnly && (
                              <span className="rounded bg-black px-2 py-1 text-[11px] font-black text-white">
                                필러 전용
                              </span>
                            )}
                            <span>{slot.price.toLocaleString()}원</span>
                          </div>
                        ))
                      )}
                    </div>

                    <div className="rounded-md border border-black bg-white p-4">
                      {selectedPyt.fillers.length > 0 && (
                        <div className="mb-4 space-y-2 border-b border-gray-200 pb-4">
                          <p className="text-sm font-black text-black">등록된 필러</p>
                          {selectedPyt.fillers.map((filler) => (
                            <div key={filler.id} className="rounded bg-[#f6f3ee] px-3 py-2 text-xs font-bold text-black">
                              <div>
                                {selectedPyt.roundNo}-{filler.fillerRoundNo ?? '?'}차 / {filler.boxCount ?? '-'}박스 / {filler.teamsPerSlot ?? '-'}팀씩 / {filler.entryCount}/{filler.slotCount}
                              </div>
                              <button
                                type="button"
                                onClick={() => handleCancelFiller(filler)}
                                disabled={isSaving || filler.entryCount > 0}
                                className="mt-2 h-8 w-full rounded-md border border-black bg-white text-xs font-black text-black transition hover:bg-black hover:text-white disabled:cursor-not-allowed disabled:border-gray-300 disabled:text-gray-400 disabled:hover:bg-white"
                              >
                                {filler.entryCount > 0 ? '참가자 있음' : 'PYT 모집 복귀'}
                              </button>
                            </div>
                          ))}
                        </div>
                      )}

                      <label className="block">
                        <span className="mb-2 block text-sm font-black text-black">필러 차수</span>
                        <input
                          type="number"
                          min={1}
                          value={fillerRoundNo}
                          onChange={(event) => setFillerRoundNo(Number(event.target.value))}
                          className="h-11 w-full rounded-md border border-gray-300 px-3 text-sm font-black text-black outline-none focus:border-black"
                        />
                      </label>
                      <label className="mt-3 block">
                        <span className="mb-2 block text-sm font-black text-black">진행 박스 수</span>
                        <input
                          type="number"
                          min={1}
                          max={selectedPyt.boxCount ?? undefined}
                          value={fillerBoxCount}
                          onChange={(event) => setFillerBoxCount(Number(event.target.value))}
                          className="h-11 w-full rounded-md border border-gray-300 px-3 text-sm font-black text-black outline-none focus:border-black"
                        />
                      </label>
                      <label className="mt-3 block">
                        <span className="mb-2 block text-sm font-black text-black">슬롯당 팀 수</span>
                        <input
                          type="number"
                          min={1}
                          value={teamsPerFillerSlot}
                          onChange={(event) => setTeamsPerFillerSlot(Number(event.target.value))}
                          className="h-11 w-full rounded-md border border-gray-300 px-3 text-sm font-black text-black outline-none focus:border-black"
                        />
                      </label>
                      <div className="mt-4 space-y-2 text-sm font-black text-black">
                        <p>필러명 {selectedPyt.roundNo}-{fillerRoundNo}차</p>
                        <p>남은 팀 {availableSlots.length}개</p>
                        <p>계산 슬롯 {calculatedFillerSlotCount || '-'}개</p>
                        <p>총액 {remainingTeamTotalPrice.toLocaleString()}원</p>
                        <p>슬롯가 {fillerPricePerSlot.toLocaleString()}원</p>
                      </div>
                      <button
                        type="button"
                        onClick={handleCreateFiller}
                        disabled={isSaving || availableSlots.length === 0 || calculatedFillerSlotCount === 0}
                        className="mt-4 h-11 w-full rounded-md bg-[#d71920] text-sm font-black text-white transition hover:bg-black disabled:cursor-not-allowed disabled:bg-gray-400"
                      >
                        필러 전환
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </section>
        </div>
      </div>
    </main>
  );
}
