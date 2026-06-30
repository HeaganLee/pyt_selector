'use client';

import Cookies from 'js-cookie';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { FormEvent, useCallback, useEffect, useState } from 'react';

const API_BASE_URL = process.env.NEXT_PUBLIC_SERVER_URL ?? '';

type SellerApplicationStatus = 'PENDING' | 'APPROVED' | 'REJECTED';
type AdminSectionKey =
  | 'seller-applications'
  | 'box-registration'
  | 'tier-registration'
  | 'checklist-registration';
type SellerStatusFilterKey = 'pending' | 'approved' | 'cancelled' | 'all';
type ReviewAction = 'approve' | 'cancel';
type SportType = 'BASEBALL' | 'BASKETBALL' | 'FOOTBALL' | 'HOCKEY' | 'SOCCER';
type BoxType = 'HOBBY' | 'JUMBO' | 'BLASTER' | 'MEGA' | 'RETAIL' | 'HTA' | 'CASE';
type TierCriteriaType =
  | 'PROSPECT'
  | 'FIRST_PROSPECT'
  | 'SUPERSTAR_AND_PROSPECT'
  | 'PROSPECT_ROOKIE'
  | 'ROOKIE_SUPERSTAR'
  | 'SUPERSTAR'
  | 'ROOKIE'
  | 'VALUE'
  | 'HIGH_END';
type TierGrade = 'S' | 'A' | 'B' | 'C' | 'D' | 'F';

interface SellerApplication {
  id: number;
  userId: string;
  email: string;
  status: SellerApplicationStatus;
  createdAt: string;
}

interface ProductOptionForm {
  localId: string;
  boxType: BoxType;
  optionName: string;
  cardsPerPack: string;
  packsPerBox: string;
  boxesPerCase: string;
  estimatedPrice: string;
  currency: string;
  configurationText: string;
}

interface ProductCreateForm {
  cardCompanyId: string;
  sportType: SportType;
  brandName: string;
  productName: string;
  releaseDate: string;
  checklistUrl: string;
  imageUrl: string;
  options: ProductOptionForm[];
}

interface TeamTierForm {
  localId: string;
  teamId: string;
  expectedPytPrice: string;
  tierGrade: TierGrade;
  keyPlayers: string;
  commentText: string;
  aiSummary: string;
}

interface TierCreateForm {
  cardProductId: string;
  criteriaType: TierCriteriaType;
  criteriaName: string;
  description: string;
  teamTiers: TeamTierForm[];
}

interface ChecklistCreateForm {
  cardProductId: string;
  sourceUrl: string;
}

interface CardProductCreateResponse {
  productId: number;
  brandName: string;
  productName: string;
  optionIds: number[];
}

interface TierCriteriaCreateResponse {
  criteriaId: number;
  productId: number;
  criteriaType: TierCriteriaType;
  criteriaName: string;
  teamTierIds: number[];
}

interface ChecklistCreateResponse {
  productId: number;
  sourceUrl: string | null;
  itemIds: number[];
}

interface CardCompany {
  id: number;
  name: string;
  displayName: string | null;
  country: string | null;
}

interface CardProductAdmin {
  id: number;
  sportType: SportType;
  brandName: string;
  productName: string;
  productLabel: string;
  releaseDate: string | null;
  checklistUrl: string | null;
}

interface SportsTeamAdmin {
  id: number;
  sportType: SportType;
  name: string;
  shortName: string | null;
  leagueName: string | null;
  leagueLevelType: string;
}

interface AdminSection {
  key: AdminSectionKey;
  label: string;
}

interface SellerStatusFilter {
  key: SellerStatusFilterKey;
  label: string;
  status?: SellerApplicationStatus;
}

const adminSections: AdminSection[] = [
  { key: 'seller-applications', label: '셀러 신청 관리' },
  { key: 'box-registration', label: '박스 등록' },
  { key: 'tier-registration', label: '티어표 등록' },
  { key: 'checklist-registration', label: '체크리스트 등록' },
];

const sellerStatusFilters: SellerStatusFilter[] = [
  { key: 'pending', label: '대기', status: 'PENDING' },
  { key: 'approved', label: '승인', status: 'APPROVED' },
  { key: 'cancelled', label: '취소', status: 'REJECTED' },
  { key: 'all', label: '전체' },
];

const sportOptions: { value: SportType; label: string }[] = [
  { value: 'BASEBALL', label: '야구' },
  { value: 'BASKETBALL', label: '농구' },
  { value: 'FOOTBALL', label: '풋볼' },
  { value: 'HOCKEY', label: '하키' },
  { value: 'SOCCER', label: '축구' },
];

const boxTypeOptions: { value: BoxType; label: string }[] = [
  { value: 'HOBBY', label: 'Hobby' },
  { value: 'JUMBO', label: 'Jumbo' },
  { value: 'BLASTER', label: 'Blaster' },
  { value: 'MEGA', label: 'Mega' },
  { value: 'RETAIL', label: 'Retail' },
  { value: 'HTA', label: 'HTA' },
  { value: 'CASE', label: 'Case' },
];

const tierCriteriaOptions: { value: TierCriteriaType; label: string }[] = [
  { value: 'PROSPECT', label: 'Prospect' },
  { value: 'FIRST_PROSPECT', label: '1st Prospect' },
  { value: 'SUPERSTAR_AND_PROSPECT', label: 'Superstar + Prospect' },
  { value: 'PROSPECT_ROOKIE', label: 'Prospect + Rookie' },
  { value: 'ROOKIE_SUPERSTAR', label: 'Rookie + Superstar' },
  { value: 'SUPERSTAR', label: 'Superstar' },
  { value: 'ROOKIE', label: 'Rookie' },
  { value: 'VALUE', label: 'Value' },
  { value: 'HIGH_END', label: 'High End' },
];

const tierGradeOptions: TierGrade[] = ['S', 'A', 'B', 'C', 'D', 'F'];

const statusLabels: Record<SellerApplicationStatus, string> = {
  PENDING: '대기',
  APPROVED: '승인',
  REJECTED: '취소',
};

const statusClasses: Record<SellerApplicationStatus, string> = {
  PENDING: 'border-amber-300 bg-amber-50 text-amber-800',
  APPROVED: 'border-emerald-300 bg-emerald-50 text-emerald-800',
  REJECTED: 'border-gray-300 bg-gray-100 text-gray-700',
};

function isAdminRole(userRoleType: string) {
  return userRoleType === 'ADMIN' || userRoleType === 'MANAGER';
}

function getActiveSection(tabParam: string | null) {
  if (tabParam === 'boxes' || tabParam === 'box-registration') {
    return adminSections[1];
  }
  if (tabParam === 'tiers' || tabParam === 'tier-registration') {
    return adminSections[2];
  }
  if (tabParam === 'checklists' || tabParam === 'checklist-registration') {
    return adminSections[3];
  }

  return adminSections[0];
}

function getActiveSellerStatusFilter(
  tabParam: string | null,
  statusParam: string | null
) {
  const filterParam =
    statusParam ??
    sellerStatusFilters.find((filter) => filter.key === tabParam)?.key;

  return (
    sellerStatusFilters.find((filter) => filter.key === filterParam) ??
    sellerStatusFilters[0]
  );
}

function getFormattedDate(dateValue: string) {
  if (!dateValue) return '-';

  return new Intl.DateTimeFormat('ko-KR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(dateValue));
}

function createEmptyProductOption(boxType: BoxType = 'HOBBY'): ProductOptionForm {
  return {
    localId: `${Date.now()}-${Math.random()}`,
    boxType,
    optionName: '',
    cardsPerPack: '',
    packsPerBox: '',
    boxesPerCase: '',
    estimatedPrice: '',
    currency: 'USD',
    configurationText: '',
  };
}

function createEmptyProductForm(): ProductCreateForm {
  return {
    cardCompanyId: '',
    sportType: 'BASEBALL',
    brandName: '',
    productName: '',
    releaseDate: '',
    checklistUrl: '',
    imageUrl: '',
    options: [createEmptyProductOption()],
  };
}

function createEmptyTeamTier(teamId = ''): TeamTierForm {
  return {
    localId: `${Date.now()}-${Math.random()}`,
    teamId,
    expectedPytPrice: '',
    tierGrade: 'C',
    keyPlayers: '',
    commentText: '',
    aiSummary: '',
  };
}

function createEmptyTierForm(): TierCreateForm {
  return {
    cardProductId: '',
    criteriaType: 'PROSPECT',
    criteriaName: '',
    description: '',
    teamTiers: [createEmptyTeamTier()],
  };
}

function createEmptyChecklistForm(): ChecklistCreateForm {
  return {
    cardProductId: '',
    sourceUrl: '',
  };
}

function getOptionalNumber(value: string) {
  if (!value.trim()) return null;

  return Number(value);
}

function getProductOptionLabel(product: CardProductAdmin) {
  const releaseDateLabel = product.releaseDate ? ` / ${product.releaseDate}` : '';

  return `${product.productLabel}${releaseDateLabel}`;
}

function getTeamOptionLabel(team: SportsTeamAdmin) {
  const shortNameLabel = team.shortName ? ` (${team.shortName})` : '';
  const leagueLabel = team.leagueName ? ` / ${team.leagueName}` : '';

  return `${team.name}${shortNameLabel}${leagueLabel}`;
}

function getSectionHref(sectionKey: AdminSectionKey) {
  if (sectionKey === 'seller-applications') {
    return '/admin?tab=seller-applications&status=pending';
  }

  return `/admin?tab=${sectionKey}`;
}

function BoxCreatePanel() {
  const router = useRouter();
  const [form, setForm] = useState<ProductCreateForm>(createEmptyProductForm);
  const [cardCompanies, setCardCompanies] = useState<CardCompany[]>([]);
  const [isCompanyLoading, setIsCompanyLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    const fetchCardCompanies = async () => {
      const accessToken = Cookies.get('accessToken');

      if (!accessToken) {
        router.replace('/login');
        return;
      }

      try {
        setIsCompanyLoading(true);
        setErrorMessage('');

        const response = await fetch(
          `${API_BASE_URL}/product/admin/card-companies`,
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          }
        );

        if (!response.ok) {
          throw new Error(await response.text());
        }

        const data = (await response.json()) as CardCompany[];
        setCardCompanies(data);
        setForm((prev) => ({
          ...prev,
          cardCompanyId: prev.cardCompanyId || String(data[0]?.id ?? ''),
        }));
      } catch (error) {
        console.error(error);
        setErrorMessage(
          error instanceof Error && error.message
            ? error.message
            : '카드 회사 목록을 불러오지 못했습니다.'
        );
      } finally {
        setIsCompanyLoading(false);
      }
    };

    fetchCardCompanies();
  }, [router]);

  const updateProductField = (
    field: Exclude<keyof ProductCreateForm, 'options' | 'sportType'>,
    value: string
  ) => {
    setForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const updateOptionField = (
    localId: string,
    field: Exclude<keyof ProductOptionForm, 'localId' | 'boxType'>,
    value: string
  ) => {
    setForm((prev) => ({
      ...prev,
      options: prev.options.map((option) =>
        option.localId === localId ? { ...option, [field]: value } : option
      ),
    }));
  };

  const updateOptionBoxType = (localId: string, boxType: BoxType) => {
    setForm((prev) => ({
      ...prev,
      options: prev.options.map((option) =>
        option.localId === localId ? { ...option, boxType } : option
      ),
    }));
  };

  const addOption = () => {
    const usedBoxTypes = new Set(form.options.map((option) => option.boxType));
    const nextBoxType = boxTypeOptions.find(
      (option) => !usedBoxTypes.has(option.value)
    )?.value;

    if (!nextBoxType) {
      setErrorMessage('등록 가능한 박스 타입을 모두 추가했습니다.');
      return;
    }

    setErrorMessage('');
    setForm((prev) => ({
      ...prev,
      options: [...prev.options, createEmptyProductOption(nextBoxType)],
    }));
  };

  const removeOption = (localId: string) => {
    setForm((prev) => {
      if (prev.options.length === 1) return prev;

      return {
        ...prev,
        options: prev.options.filter((option) => option.localId !== localId),
      };
    });
  };

  const resetForm = () => {
    setForm({
      ...createEmptyProductForm(),
      cardCompanyId: String(cardCompanies[0]?.id ?? ''),
    });
    setSuccessMessage('');
    setErrorMessage('');
  };

  const validateForm = () => {
    if (!form.cardCompanyId) return '카드 회사를 선택해주세요.';
    if (!form.brandName.trim()) return '브랜드명을 입력해주세요.';
    if (!form.productName.trim()) return '상품명을 입력해주세요.';
    if (!form.releaseDate) return '발매일을 선택해주세요.';

    const optionBoxTypes = form.options.map((option) => option.boxType);
    if (new Set(optionBoxTypes).size !== optionBoxTypes.length) {
      return '같은 박스 타입은 중복 등록할 수 없습니다.';
    }

    return '';
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSuccessMessage('');
    setErrorMessage('');

    const validationMessage = validateForm();
    if (validationMessage) {
      setErrorMessage(validationMessage);
      return;
    }

    const accessToken = Cookies.get('accessToken');
    if (!accessToken) {
      router.replace('/login');
      return;
    }

    try {
      setIsSubmitting(true);

      const response = await fetch(`${API_BASE_URL}/product/admin`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          cardCompanyId: Number(form.cardCompanyId),
          sportType: form.sportType,
          brandName: form.brandName.trim(),
          productName: form.productName.trim(),
          releaseDate: form.releaseDate,
          checklistUrl: form.checklistUrl.trim() || null,
          imageUrl: form.imageUrl.trim() || null,
          options: form.options.map((option) => ({
            boxType: option.boxType,
            optionName: option.optionName.trim() || null,
            cardsPerPack: getOptionalNumber(option.cardsPerPack),
            packsPerBox: getOptionalNumber(option.packsPerBox),
            boxesPerCase: getOptionalNumber(option.boxesPerCase),
            estimatedPrice: getOptionalNumber(option.estimatedPrice),
            currency: option.currency.trim() || 'USD',
            configurationText: option.configurationText.trim() || null,
          })),
        }),
      });

      if (!response.ok) {
        throw new Error(await response.text());
      }

      const data = (await response.json()) as CardProductCreateResponse;
      setSuccessMessage(
        `박스 정보를 등록했습니다. 상품 ID #${data.productId}, 옵션 ${data.optionIds.length}개`
      );
      setForm({
        ...createEmptyProductForm(),
        cardCompanyId: String(cardCompanies[0]?.id ?? ''),
      });
    } catch (error) {
      console.error(error);
      setErrorMessage(
        error instanceof Error && error.message
          ? error.message
          : '박스 정보 등록에 실패했습니다.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="overflow-hidden rounded-md border border-gray-300 bg-white">
      <div className="border-b border-gray-200 px-5 py-4">
        <h2 className="text-lg font-black text-black">박스 정보 등록</h2>
      </div>

      {successMessage && (
        <div className="border-b border-emerald-200 bg-emerald-50 px-5 py-3 text-sm font-bold text-emerald-800">
          {successMessage}
        </div>
      )}

      {errorMessage && (
        <div className="border-b border-[#d71920]/30 bg-red-50 px-5 py-3 text-sm font-bold text-[#d71920]">
          {errorMessage}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8 px-5 py-5">
        <div>
          <h3 className="text-sm font-black text-gray-500">회사</h3>
          <div className="mt-3 grid gap-4 md:grid-cols-2">
            <label className="block">
              <span className="text-sm font-black text-black">카드 회사</span>
              <select
                value={form.cardCompanyId}
                onChange={(event) =>
                  updateProductField('cardCompanyId', event.target.value)
                }
                disabled={isCompanyLoading || cardCompanies.length === 0}
                className="mt-2 h-11 w-full rounded-md border border-gray-300 bg-white px-3 text-sm font-bold text-black outline-none focus:border-black disabled:cursor-not-allowed disabled:bg-gray-100 disabled:text-gray-400"
              >
                {cardCompanies.length === 0 ? (
                  <option value="">
                    {isCompanyLoading ? '불러오는 중' : '등록된 회사 없음'}
                  </option>
                ) : (
                  cardCompanies.map((company) => (
                    <option key={company.id} value={company.id}>
                      {company.displayName || company.name}
                      {company.country ? ` (${company.country})` : ''}
                    </option>
                  ))
                )}
              </select>
            </label>
          </div>
        </div>

        <div className="border-t border-gray-200 pt-6">
          <h3 className="text-sm font-black text-gray-500">상품</h3>
          <div className="mt-3 grid gap-4 md:grid-cols-2">
            <label className="block">
              <span className="text-sm font-black text-black">스포츠</span>
              <select
                value={form.sportType}
                onChange={(event) =>
                  setForm((prev) => ({
                    ...prev,
                    sportType: event.target.value as SportType,
                  }))
                }
                className="mt-2 h-11 w-full rounded-md border border-gray-300 bg-white px-3 text-sm font-bold text-black outline-none focus:border-black"
              >
                {sportOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>
            <label className="block">
              <span className="text-sm font-black text-black">브랜드명</span>
              <input
                type="text"
                value={form.brandName}
                onChange={(event) =>
                  updateProductField('brandName', event.target.value)
                }
                className="mt-2 h-11 w-full rounded-md border border-gray-300 px-3 text-sm font-bold text-black outline-none focus:border-black"
              />
            </label>
            <label className="block">
              <span className="text-sm font-black text-black">상품명</span>
              <input
                type="text"
                value={form.productName}
                onChange={(event) =>
                  updateProductField('productName', event.target.value)
                }
                className="mt-2 h-11 w-full rounded-md border border-gray-300 px-3 text-sm font-bold text-black outline-none focus:border-black"
              />
            </label>
            <label className="block">
              <span className="text-sm font-black text-black">발매일</span>
              <input
                type="date"
                value={form.releaseDate}
                onChange={(event) =>
                  updateProductField('releaseDate', event.target.value)
                }
                className="mt-2 h-11 w-full rounded-md border border-gray-300 px-3 text-sm font-bold text-black outline-none focus:border-black"
              />
            </label>
            <label className="block">
              <span className="text-sm font-black text-black">체크리스트 URL</span>
              <input
                type="url"
                value={form.checklistUrl}
                onChange={(event) =>
                  updateProductField('checklistUrl', event.target.value)
                }
                className="mt-2 h-11 w-full rounded-md border border-gray-300 px-3 text-sm font-bold text-black outline-none focus:border-black"
              />
            </label>
            <label className="block">
              <span className="text-sm font-black text-black">이미지 URL</span>
              <input
                type="url"
                value={form.imageUrl}
                onChange={(event) =>
                  updateProductField('imageUrl', event.target.value)
                }
                className="mt-2 h-11 w-full rounded-md border border-gray-300 px-3 text-sm font-bold text-black outline-none focus:border-black"
              />
            </label>
          </div>
        </div>

        <div className="border-t border-gray-200 pt-6">
          <div className="flex items-center justify-between gap-3">
            <h3 className="text-sm font-black text-gray-500">옵션</h3>
            <button
              type="button"
              onClick={addOption}
              className="inline-flex h-9 items-center rounded-md border border-gray-300 px-3 text-xs font-black text-black transition hover:border-black"
            >
              옵션 추가
            </button>
          </div>

          <div className="mt-4 divide-y divide-gray-200">
            {form.options.map((option, index) => (
              <div key={option.localId} className="py-5 first:pt-0 last:pb-0">
                <div className="mb-4 flex items-center justify-between gap-3">
                  <h4 className="text-sm font-black text-black">
                    옵션 {index + 1}
                  </h4>
                  <button
                    type="button"
                    onClick={() => removeOption(option.localId)}
                    disabled={form.options.length === 1}
                    className="inline-flex h-8 items-center rounded-md border border-gray-300 px-3 text-xs font-black text-black transition hover:border-black disabled:cursor-not-allowed disabled:text-gray-400"
                  >
                    삭제
                  </button>
                </div>

                <div className="grid gap-4 md:grid-cols-4">
                  <label className="block">
                    <span className="text-sm font-black text-black">박스 타입</span>
                    <select
                      value={option.boxType}
                      onChange={(event) =>
                        updateOptionBoxType(
                          option.localId,
                          event.target.value as BoxType
                        )
                      }
                      className="mt-2 h-11 w-full rounded-md border border-gray-300 bg-white px-3 text-sm font-bold text-black outline-none focus:border-black"
                    >
                      {boxTypeOptions.map((boxTypeOption) => (
                        <option
                          key={boxTypeOption.value}
                          value={boxTypeOption.value}
                        >
                          {boxTypeOption.label}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label className="block">
                    <span className="text-sm font-black text-black">옵션명</span>
                    <input
                      type="text"
                      value={option.optionName}
                      onChange={(event) =>
                        updateOptionField(
                          option.localId,
                          'optionName',
                          event.target.value
                        )
                      }
                      className="mt-2 h-11 w-full rounded-md border border-gray-300 px-3 text-sm font-bold text-black outline-none focus:border-black"
                    />
                  </label>
                  <label className="block">
                    <span className="text-sm font-black text-black">팩당 카드</span>
                    <input
                      type="number"
                      min="1"
                      value={option.cardsPerPack}
                      onChange={(event) =>
                        updateOptionField(
                          option.localId,
                          'cardsPerPack',
                          event.target.value
                        )
                      }
                      className="mt-2 h-11 w-full rounded-md border border-gray-300 px-3 text-sm font-bold text-black outline-none focus:border-black"
                    />
                  </label>
                  <label className="block">
                    <span className="text-sm font-black text-black">박스당 팩</span>
                    <input
                      type="number"
                      min="1"
                      value={option.packsPerBox}
                      onChange={(event) =>
                        updateOptionField(
                          option.localId,
                          'packsPerBox',
                          event.target.value
                        )
                      }
                      className="mt-2 h-11 w-full rounded-md border border-gray-300 px-3 text-sm font-bold text-black outline-none focus:border-black"
                    />
                  </label>
                  <label className="block">
                    <span className="text-sm font-black text-black">
                      케이스당 박스
                    </span>
                    <input
                      type="number"
                      min="1"
                      value={option.boxesPerCase}
                      onChange={(event) =>
                        updateOptionField(
                          option.localId,
                          'boxesPerCase',
                          event.target.value
                        )
                      }
                      className="mt-2 h-11 w-full rounded-md border border-gray-300 px-3 text-sm font-bold text-black outline-none focus:border-black"
                    />
                  </label>
                  <label className="block">
                    <span className="text-sm font-black text-black">예상 가격</span>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={option.estimatedPrice}
                      onChange={(event) =>
                        updateOptionField(
                          option.localId,
                          'estimatedPrice',
                          event.target.value
                        )
                      }
                      className="mt-2 h-11 w-full rounded-md border border-gray-300 px-3 text-sm font-bold text-black outline-none focus:border-black"
                    />
                  </label>
                  <label className="block">
                    <span className="text-sm font-black text-black">통화</span>
                    <input
                      type="text"
                      value={option.currency}
                      onChange={(event) =>
                        updateOptionField(
                          option.localId,
                          'currency',
                          event.target.value
                        )
                      }
                      className="mt-2 h-11 w-full rounded-md border border-gray-300 px-3 text-sm font-bold text-black outline-none focus:border-black"
                    />
                  </label>
                  <label className="block md:col-span-4">
                    <span className="text-sm font-black text-black">구성 메모</span>
                    <textarea
                      rows={3}
                      value={option.configurationText}
                      onChange={(event) =>
                        updateOptionField(
                          option.localId,
                          'configurationText',
                          event.target.value
                        )
                      }
                      className="mt-2 w-full rounded-md border border-gray-300 px-3 py-3 text-sm font-bold text-black outline-none focus:border-black"
                    />
                  </label>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex flex-wrap gap-3 border-t border-gray-200 pt-5">
          <button
            type="submit"
            disabled={isSubmitting || isCompanyLoading || cardCompanies.length === 0}
            className="inline-flex h-11 items-center rounded-md bg-[#d71920] px-5 text-sm font-black text-white transition hover:bg-black disabled:cursor-not-allowed disabled:bg-gray-400"
          >
            {isSubmitting ? '등록 중' : '등록'}
          </button>
          <button
            type="button"
            onClick={resetForm}
            disabled={isSubmitting}
            className="inline-flex h-11 items-center rounded-md border border-gray-300 px-5 text-sm font-black text-black transition hover:border-black disabled:cursor-not-allowed disabled:text-gray-400"
          >
            초기화
          </button>
        </div>
      </form>
    </section>
  );
}

function TierCreatePanel() {
  const router = useRouter();
  const [form, setForm] = useState<TierCreateForm>(createEmptyTierForm);
  const [products, setProducts] = useState<CardProductAdmin[]>([]);
  const [teams, setTeams] = useState<SportsTeamAdmin[]>([]);
  const [isDataLoading, setIsDataLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    const fetchCreateData = async () => {
      const accessToken = Cookies.get('accessToken');

      if (!accessToken) {
        router.replace('/login');
        return;
      }

      try {
        setIsDataLoading(true);
        setErrorMessage('');

        const [productsResponse, teamsResponse] = await Promise.all([
          fetch(`${API_BASE_URL}/product/admin/card-products`, {
            headers: { Authorization: `Bearer ${accessToken}` },
          }),
          fetch(`${API_BASE_URL}/product/admin/sports-teams`, {
            headers: { Authorization: `Bearer ${accessToken}` },
          }),
        ]);

        if (!productsResponse.ok) {
          throw new Error(await productsResponse.text());
        }
        if (!teamsResponse.ok) {
          throw new Error(await teamsResponse.text());
        }

        const productData = (await productsResponse.json()) as CardProductAdmin[];
        const teamData = (await teamsResponse.json()) as SportsTeamAdmin[];
        setProducts(productData);
        setTeams(teamData);
        setForm((prev) => ({
          ...prev,
          cardProductId: prev.cardProductId || String(productData[0]?.id ?? ''),
        }));
      } catch (error) {
        console.error(error);
        setErrorMessage(
          error instanceof Error && error.message
            ? error.message
            : '티어표 등록 데이터를 불러오지 못했습니다.'
        );
      } finally {
        setIsDataLoading(false);
      }
    };

    fetchCreateData();
  }, [router]);

  const selectedProduct = products.find(
    (product) => String(product.id) === form.cardProductId
  );
  const eligibleTeams = selectedProduct
    ? teams.filter((team) => team.sportType === selectedProduct.sportType)
    : teams;

  const updateTierField = (
    field: Exclude<keyof TierCreateForm, 'teamTiers' | 'criteriaType'>,
    value: string
  ) => {
    setForm((prev) => ({
      ...prev,
      [field]: value,
      ...(field === 'cardProductId'
        ? {
            teamTiers: prev.teamTiers.map((teamTier) => ({
              ...teamTier,
              teamId: '',
            })),
          }
        : {}),
    }));
  };

  const updateCriteriaType = (criteriaType: TierCriteriaType) => {
    setForm((prev) => ({ ...prev, criteriaType }));
  };

  const updateTeamTierField = (
    localId: string,
    field: Exclude<keyof TeamTierForm, 'localId' | 'tierGrade'>,
    value: string
  ) => {
    setForm((prev) => ({
      ...prev,
      teamTiers: prev.teamTiers.map((teamTier) =>
        teamTier.localId === localId ? { ...teamTier, [field]: value } : teamTier
      ),
    }));
  };

  const updateTeamTierGrade = (localId: string, tierGrade: TierGrade) => {
    setForm((prev) => ({
      ...prev,
      teamTiers: prev.teamTiers.map((teamTier) =>
        teamTier.localId === localId ? { ...teamTier, tierGrade } : teamTier
      ),
    }));
  };

  const addTeamTier = () => {
    const usedTeamIds = new Set(
      form.teamTiers.map((teamTier) => teamTier.teamId).filter(Boolean)
    );
    const nextTeamId =
      eligibleTeams.find((team) => !usedTeamIds.has(String(team.id)))?.id ?? '';

    setErrorMessage('');
    setForm((prev) => ({
      ...prev,
      teamTiers: [...prev.teamTiers, createEmptyTeamTier(String(nextTeamId))],
    }));
  };

  const removeTeamTier = (localId: string) => {
    setForm((prev) => {
      if (prev.teamTiers.length === 1) return prev;

      return {
        ...prev,
        teamTiers: prev.teamTiers.filter((teamTier) => teamTier.localId !== localId),
      };
    });
  };

  const resetForm = () => {
    setForm({
      ...createEmptyTierForm(),
      cardProductId: String(products[0]?.id ?? ''),
    });
    setSuccessMessage('');
    setErrorMessage('');
  };

  const validateForm = () => {
    if (!form.cardProductId) return '상품을 선택해주세요.';
    if (!form.criteriaName.trim()) return '티어 기준명을 입력해주세요.';

    const teamIds = form.teamTiers.map((teamTier) => teamTier.teamId);
    if (teamIds.some((teamId) => !teamId)) return '팀을 모두 선택해주세요.';
    if (new Set(teamIds).size !== teamIds.length) {
      return '같은 팀은 중복 등록할 수 없습니다.';
    }

    return '';
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSuccessMessage('');
    setErrorMessage('');

    const validationMessage = validateForm();
    if (validationMessage) {
      setErrorMessage(validationMessage);
      return;
    }

    const accessToken = Cookies.get('accessToken');
    if (!accessToken) {
      router.replace('/login');
      return;
    }

    try {
      setIsSubmitting(true);

      const response = await fetch(`${API_BASE_URL}/product/admin/tier-criteria`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          cardProductId: Number(form.cardProductId),
          criteriaType: form.criteriaType,
          criteriaName: form.criteriaName.trim(),
          description: form.description.trim() || null,
          teamTiers: form.teamTiers.map((teamTier) => ({
            teamId: Number(teamTier.teamId),
            expectedPytPrice: getOptionalNumber(teamTier.expectedPytPrice),
            tierGrade: teamTier.tierGrade,
            keyPlayers: teamTier.keyPlayers.trim() || null,
            commentText: teamTier.commentText.trim() || null,
            aiSummary: teamTier.aiSummary.trim() || null,
          })),
        }),
      });

      if (!response.ok) {
        throw new Error(await response.text());
      }

      const data = (await response.json()) as TierCriteriaCreateResponse;
      setSuccessMessage(
        `티어표를 등록했습니다. 기준 ID #${data.criteriaId}, 팀 ${data.teamTierIds.length}개`
      );
      setForm({
        ...createEmptyTierForm(),
        cardProductId: String(products[0]?.id ?? ''),
      });
    } catch (error) {
      console.error(error);
      setErrorMessage(
        error instanceof Error && error.message
          ? error.message
          : '티어표 등록에 실패했습니다.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="overflow-hidden rounded-md border border-gray-300 bg-white">
      <div className="border-b border-gray-200 px-5 py-4">
        <h2 className="text-lg font-black text-black">티어표 등록</h2>
      </div>

      {successMessage && (
        <div className="border-b border-emerald-200 bg-emerald-50 px-5 py-3 text-sm font-bold text-emerald-800">
          {successMessage}
        </div>
      )}

      {errorMessage && (
        <div className="border-b border-[#d71920]/30 bg-red-50 px-5 py-3 text-sm font-bold text-[#d71920]">
          {errorMessage}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8 px-5 py-5">
        <div>
          <h3 className="text-sm font-black text-gray-500">기준</h3>
          <div className="mt-3 grid gap-4 md:grid-cols-2">
            <label className="block md:col-span-2">
              <span className="text-sm font-black text-black">상품</span>
              <select
                value={form.cardProductId}
                onChange={(event) =>
                  updateTierField('cardProductId', event.target.value)
                }
                disabled={isDataLoading || products.length === 0}
                className="mt-2 h-11 w-full rounded-md border border-gray-300 bg-white px-3 text-sm font-bold text-black outline-none focus:border-black disabled:cursor-not-allowed disabled:bg-gray-100 disabled:text-gray-400"
              >
                {products.length === 0 ? (
                  <option value="">
                    {isDataLoading ? '불러오는 중' : '등록된 상품 없음'}
                  </option>
                ) : (
                  products.map((product) => (
                    <option key={product.id} value={product.id}>
                      {getProductOptionLabel(product)}
                    </option>
                  ))
                )}
              </select>
            </label>
            <label className="block">
              <span className="text-sm font-black text-black">기준 타입</span>
              <select
                value={form.criteriaType}
                onChange={(event) =>
                  updateCriteriaType(event.target.value as TierCriteriaType)
                }
                className="mt-2 h-11 w-full rounded-md border border-gray-300 bg-white px-3 text-sm font-bold text-black outline-none focus:border-black"
              >
                {tierCriteriaOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>
            <label className="block">
              <span className="text-sm font-black text-black">기준명</span>
              <input
                type="text"
                value={form.criteriaName}
                onChange={(event) =>
                  updateTierField('criteriaName', event.target.value)
                }
                className="mt-2 h-11 w-full rounded-md border border-gray-300 px-3 text-sm font-bold text-black outline-none focus:border-black"
              />
            </label>
            <label className="block md:col-span-2">
              <span className="text-sm font-black text-black">설명</span>
              <textarea
                rows={3}
                value={form.description}
                onChange={(event) =>
                  updateTierField('description', event.target.value)
                }
                className="mt-2 w-full rounded-md border border-gray-300 px-3 py-3 text-sm font-bold text-black outline-none focus:border-black"
              />
            </label>
          </div>
        </div>

        <div className="border-t border-gray-200 pt-6">
          <div className="flex items-center justify-between gap-3">
            <h3 className="text-sm font-black text-gray-500">팀 티어</h3>
            <button
              type="button"
              onClick={addTeamTier}
              className="inline-flex h-9 items-center rounded-md border border-gray-300 px-3 text-xs font-black text-black transition hover:border-black"
            >
              팀 추가
            </button>
          </div>

          <div className="mt-4 divide-y divide-gray-200">
            {form.teamTiers.map((teamTier, index) => (
              <div key={teamTier.localId} className="py-5 first:pt-0 last:pb-0">
                <div className="mb-4 flex items-center justify-between gap-3">
                  <h4 className="text-sm font-black text-black">
                    팀 {index + 1}
                  </h4>
                  <button
                    type="button"
                    onClick={() => removeTeamTier(teamTier.localId)}
                    disabled={form.teamTiers.length === 1}
                    className="inline-flex h-8 items-center rounded-md border border-gray-300 px-3 text-xs font-black text-black transition hover:border-black disabled:cursor-not-allowed disabled:text-gray-400"
                  >
                    삭제
                  </button>
                </div>

                <div className="grid gap-4 md:grid-cols-4">
                  <label className="block md:col-span-2">
                    <span className="text-sm font-black text-black">팀</span>
                    <select
                      value={teamTier.teamId}
                      onChange={(event) =>
                        updateTeamTierField(
                          teamTier.localId,
                          'teamId',
                          event.target.value
                        )
                      }
                      className="mt-2 h-11 w-full rounded-md border border-gray-300 bg-white px-3 text-sm font-bold text-black outline-none focus:border-black"
                    >
                      <option value="">팀 선택</option>
                      {eligibleTeams.map((team) => (
                        <option key={team.id} value={team.id}>
                          {getTeamOptionLabel(team)}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label className="block">
                    <span className="text-sm font-black text-black">등급</span>
                    <select
                      value={teamTier.tierGrade}
                      onChange={(event) =>
                        updateTeamTierGrade(
                          teamTier.localId,
                          event.target.value as TierGrade
                        )
                      }
                      className="mt-2 h-11 w-full rounded-md border border-gray-300 bg-white px-3 text-sm font-bold text-black outline-none focus:border-black"
                    >
                      {tierGradeOptions.map((grade) => (
                        <option key={grade} value={grade}>
                          {grade}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label className="block">
                    <span className="text-sm font-black text-black">PYT 가격</span>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={teamTier.expectedPytPrice}
                      onChange={(event) =>
                        updateTeamTierField(
                          teamTier.localId,
                          'expectedPytPrice',
                          event.target.value
                        )
                      }
                      className="mt-2 h-11 w-full rounded-md border border-gray-300 px-3 text-sm font-bold text-black outline-none focus:border-black"
                    />
                  </label>
                  <label className="block md:col-span-2">
                    <span className="text-sm font-black text-black">핵심 선수</span>
                    <input
                      type="text"
                      value={teamTier.keyPlayers}
                      onChange={(event) =>
                        updateTeamTierField(
                          teamTier.localId,
                          'keyPlayers',
                          event.target.value
                        )
                      }
                      className="mt-2 h-11 w-full rounded-md border border-gray-300 px-3 text-sm font-bold text-black outline-none focus:border-black"
                    />
                  </label>
                  <label className="block md:col-span-2">
                    <span className="text-sm font-black text-black">메모</span>
                    <input
                      type="text"
                      value={teamTier.commentText}
                      onChange={(event) =>
                        updateTeamTierField(
                          teamTier.localId,
                          'commentText',
                          event.target.value
                        )
                      }
                      className="mt-2 h-11 w-full rounded-md border border-gray-300 px-3 text-sm font-bold text-black outline-none focus:border-black"
                    />
                  </label>
                  <label className="block md:col-span-4">
                    <span className="text-sm font-black text-black">AI 요약</span>
                    <textarea
                      rows={2}
                      value={teamTier.aiSummary}
                      onChange={(event) =>
                        updateTeamTierField(
                          teamTier.localId,
                          'aiSummary',
                          event.target.value
                        )
                      }
                      className="mt-2 w-full rounded-md border border-gray-300 px-3 py-3 text-sm font-bold text-black outline-none focus:border-black"
                    />
                  </label>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex flex-wrap gap-3 border-t border-gray-200 pt-5">
          <button
            type="submit"
            disabled={isSubmitting || isDataLoading || products.length === 0}
            className="inline-flex h-11 items-center rounded-md bg-[#d71920] px-5 text-sm font-black text-white transition hover:bg-black disabled:cursor-not-allowed disabled:bg-gray-400"
          >
            {isSubmitting ? '등록 중' : '등록'}
          </button>
          <button
            type="button"
            onClick={resetForm}
            disabled={isSubmitting}
            className="inline-flex h-11 items-center rounded-md border border-gray-300 px-5 text-sm font-black text-black transition hover:border-black disabled:cursor-not-allowed disabled:text-gray-400"
          >
            초기화
          </button>
        </div>
      </form>
    </section>
  );
}

function ChecklistCreatePanel() {
  const router = useRouter();
  const [form, setForm] = useState<ChecklistCreateForm>(createEmptyChecklistForm);
  const [products, setProducts] = useState<CardProductAdmin[]>([]);
  const [checklistFile, setChecklistFile] = useState<File | null>(null);
  const [fileInputKey, setFileInputKey] = useState(0);
  const [isDataLoading, setIsDataLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    const fetchCreateData = async () => {
      const accessToken = Cookies.get('accessToken');

      if (!accessToken) {
        router.replace('/login');
        return;
      }

      try {
        setIsDataLoading(true);
        setErrorMessage('');

        const productsResponse = await fetch(
          `${API_BASE_URL}/product/admin/card-products`,
          {
            headers: { Authorization: `Bearer ${accessToken}` },
          }
        );

        if (!productsResponse.ok) {
          throw new Error(await productsResponse.text());
        }

        const productData = (await productsResponse.json()) as CardProductAdmin[];
        const defaultProduct = productData[0];
        setProducts(productData);
        setForm({
          cardProductId: String(defaultProduct?.id ?? ''),
          sourceUrl: defaultProduct?.checklistUrl ?? '',
        });
      } catch (error) {
        console.error(error);
        setErrorMessage(
          error instanceof Error && error.message
            ? error.message
            : '체크리스트 등록 데이터를 불러오지 못했습니다.'
        );
      } finally {
        setIsDataLoading(false);
      }
    };

    fetchCreateData();
  }, [router]);

  const updateChecklistField = (
    field: keyof ChecklistCreateForm,
    value: string
  ) => {
    setForm((prev) => ({
      ...prev,
      [field]: value,
      ...(field === 'cardProductId'
        ? {
            sourceUrl:
              products.find((product) => String(product.id) === value)
                ?.checklistUrl ?? '',
          }
        : {}),
    }));
  };

  const updateChecklistFile = (file: File | null) => {
    setErrorMessage('');
    setSuccessMessage('');
    setChecklistFile(file);
  };

  const resetForm = () => {
    const defaultProduct = products[0];
    setForm({
      cardProductId: String(defaultProduct?.id ?? ''),
      sourceUrl: defaultProduct?.checklistUrl ?? '',
    });
    setChecklistFile(null);
    setFileInputKey((prev) => prev + 1);
    setSuccessMessage('');
    setErrorMessage('');
  };

  const validateForm = () => {
    if (!form.cardProductId) return '상품을 선택해주세요.';
    if (!checklistFile) return '업로드할 엑셀 파일을 선택해주세요.';

    const fileName = checklistFile.name.toLowerCase();
    if (!fileName.endsWith('.xlsx')) {
      return '엑셀 파일(.xlsx)만 업로드할 수 있습니다.';
    }

    return '';
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSuccessMessage('');
    setErrorMessage('');

    const validationMessage = validateForm();
    if (validationMessage) {
      setErrorMessage(validationMessage);
      return;
    }

    const selectedFile = checklistFile;
    if (!selectedFile) {
      setErrorMessage('업로드할 엑셀 파일을 선택해주세요.');
      return;
    }

    const accessToken = Cookies.get('accessToken');
    if (!accessToken) {
      router.replace('/login');
      return;
    }

    try {
      setIsSubmitting(true);
      const payload = new FormData();
      payload.append('cardProductId', form.cardProductId);
      payload.append('sourceUrl', form.sourceUrl.trim());
      payload.append('file', selectedFile);

      const response = await fetch(`${API_BASE_URL}/product/admin/checklists`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
        body: payload,
      });

      if (!response.ok) {
        throw new Error(await response.text());
      }

      const data = (await response.json()) as ChecklistCreateResponse;
      setSuccessMessage(
        `체크리스트를 등록했습니다. 상품 ID #${data.productId}, 카드 ${data.itemIds.length}개`
      );
      setProducts((prev) =>
        prev.map((product) =>
          product.id === data.productId
            ? { ...product, checklistUrl: data.sourceUrl }
            : product
        )
      );
      setForm((prev) => ({
        ...prev,
        sourceUrl: data.sourceUrl ?? prev.sourceUrl,
      }));
      setChecklistFile(null);
      setFileInputKey((prev) => prev + 1);
    } catch (error) {
      console.error(error);
      setErrorMessage(
        error instanceof Error && error.message
          ? error.message
          : '체크리스트 등록에 실패했습니다.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="overflow-hidden rounded-md border border-gray-300 bg-white">
      <div className="border-b border-gray-200 px-5 py-4">
        <h2 className="text-lg font-black text-black">체크리스트 등록</h2>
      </div>

      {successMessage && (
        <div className="border-b border-emerald-200 bg-emerald-50 px-5 py-3 text-sm font-bold text-emerald-800">
          {successMessage}
        </div>
      )}

      {errorMessage && (
        <div className="border-b border-[#d71920]/30 bg-red-50 px-5 py-3 text-sm font-bold text-[#d71920]">
          {errorMessage}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8 px-5 py-5">
        <div>
          <h3 className="text-sm font-black text-gray-500">상품</h3>
          <div className="mt-3 grid gap-4 md:grid-cols-2">
            <label className="block md:col-span-2">
              <span className="text-sm font-black text-black">상품</span>
              <select
                value={form.cardProductId}
                onChange={(event) =>
                  updateChecklistField('cardProductId', event.target.value)
                }
                disabled={isDataLoading || products.length === 0}
                className="mt-2 h-11 w-full rounded-md border border-gray-300 bg-white px-3 text-sm font-bold text-black outline-none focus:border-black disabled:cursor-not-allowed disabled:bg-gray-100 disabled:text-gray-400"
              >
                {products.length === 0 ? (
                  <option value="">
                    {isDataLoading ? '불러오는 중' : '등록된 상품 없음'}
                  </option>
                ) : (
                  products.map((product) => (
                    <option key={product.id} value={product.id}>
                      {getProductOptionLabel(product)}
                    </option>
                  ))
                )}
              </select>
            </label>
            <label className="block md:col-span-2">
              <span className="text-sm font-black text-black">원본 URL</span>
              <input
                type="url"
                value={form.sourceUrl}
                onChange={(event) =>
                  updateChecklistField('sourceUrl', event.target.value)
                }
                className="mt-2 h-11 w-full rounded-md border border-gray-300 px-3 text-sm font-bold text-black outline-none focus:border-black"
              />
            </label>
          </div>
        </div>

        <div className="border-t border-gray-200 pt-6">
          <h3 className="text-sm font-black text-gray-500">엑셀 파일</h3>
          <label className="mt-3 block">
            <span className="text-sm font-black text-black">
              체크리스트 엑셀 파일
            </span>
            <input
              key={fileInputKey}
              type="file"
              accept=".xlsx,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
              onChange={(event) =>
                updateChecklistFile(event.target.files?.[0] ?? null)
              }
              className="mt-2 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm font-bold text-black file:mr-4 file:h-8 file:rounded-md file:border-0 file:bg-black file:px-3 file:text-xs file:font-black file:text-white"
            />
          </label>
          {checklistFile && (
            <div className="mt-3 rounded-md border border-gray-200 bg-gray-50 px-3 py-2 text-sm font-bold text-black">
              {checklistFile.name}
            </div>
          )}
        </div>

        <div className="flex flex-wrap gap-3 border-t border-gray-200 pt-5">
          <button
            type="submit"
            disabled={
              isSubmitting ||
              isDataLoading ||
              products.length === 0 ||
              !checklistFile
            }
            className="inline-flex h-11 items-center rounded-md bg-[#d71920] px-5 text-sm font-black text-white transition hover:bg-black disabled:cursor-not-allowed disabled:bg-gray-400"
          >
            {isSubmitting ? '등록 중' : '등록'}
          </button>
          <button
            type="button"
            onClick={resetForm}
            disabled={isSubmitting}
            className="inline-flex h-11 items-center rounded-md border border-gray-300 px-5 text-sm font-black text-black transition hover:border-black disabled:cursor-not-allowed disabled:text-gray-400"
          >
            초기화
          </button>
        </div>
      </form>
    </section>
  );
}

export default function AdminPageClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const tabParam = searchParams.get('tab');
  const activeSection = getActiveSection(tabParam);
  const activeStatusFilter = getActiveSellerStatusFilter(
    tabParam,
    searchParams.get('status')
  );
  const activeStatus = activeStatusFilter.status;
  const isSellerSection = activeSection.key === 'seller-applications';
  const isBoxSection = activeSection.key === 'box-registration';
  const isTierSection = activeSection.key === 'tier-registration';

  const [isAuthorized, setIsAuthorized] = useState(false);
  const [isAuthChecked, setIsAuthChecked] = useState(false);
  const [adminRoleType, setAdminRoleType] = useState('');
  const [applications, setApplications] = useState<SellerApplication[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [actionId, setActionId] = useState<string | null>(null);
  const [noticeMessage, setNoticeMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    const accessToken = Cookies.get('accessToken');
    const userRoleType = Cookies.get('userRoleType') ?? '';

    if (!accessToken) {
      setIsAuthChecked(true);
      router.replace('/login');
      return;
    }

    if (!isAdminRole(userRoleType)) {
      setIsAuthChecked(true);
      router.replace('/');
      return;
    }

    setAdminRoleType(userRoleType);
    setIsAuthorized(true);
    setIsAuthChecked(true);
  }, [router]);

  const fetchApplications = useCallback(async () => {
    if (!isAuthorized || !isSellerSection) return;

    const accessToken = Cookies.get('accessToken');

    if (!accessToken) {
      router.replace('/login');
      return;
    }

    try {
      setIsLoading(true);
      setErrorMessage('');

      const statusQuery = activeStatus ? `?status=${activeStatus}` : '';
      const response = await fetch(
        `${API_BASE_URL}/seller-applications/admin${statusQuery}`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error(await response.text());
      }

      const data = (await response.json()) as SellerApplication[];
      setApplications(data);
    } catch (error) {
      console.error(error);
      setErrorMessage(
        error instanceof Error && error.message
          ? error.message
          : '셀러 신청 목록을 불러오지 못했습니다.'
      );
    } finally {
      setIsLoading(false);
    }
  }, [activeStatus, isAuthorized, isSellerSection, router]);

  useEffect(() => {
    fetchApplications();
  }, [fetchApplications]);

  const handleReview = async (
    sellerApplicationId: number,
    action: ReviewAction
  ) => {
    const accessToken = Cookies.get('accessToken');

    if (!accessToken) {
      router.replace('/login');
      return;
    }

    try {
      setActionId(`${action}-${sellerApplicationId}`);
      setNoticeMessage('');
      setErrorMessage('');

      const response = await fetch(
        `${API_BASE_URL}/seller-applications/${sellerApplicationId}/${action}`,
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

      setNoticeMessage(
        action === 'approve'
          ? '셀러 신청을 승인했습니다.'
          : '셀러 신청을 취소했습니다.'
      );
      await fetchApplications();
    } catch (error) {
      console.error(error);
      setErrorMessage(
        error instanceof Error && error.message
          ? error.message
          : '셀러 신청 처리에 실패했습니다.'
      );
    } finally {
      setActionId(null);
    }
  };

  if (!isAuthChecked || !isAuthorized) {
    return null;
  }

  return (
    <main className="min-h-[calc(100vh-88px)] bg-[#f5f5f5] px-5 py-10">
      <div className="mx-auto max-w-7xl">
        <div className="mb-6 flex flex-col gap-4 border-b border-gray-300 pb-6 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-sm font-black uppercase tracking-[0.24em] text-[#d71920]">
              Admin
            </p>
            <h1 className="mt-2 text-3xl font-black text-black">
              관리자 페이지
            </h1>
          </div>

          <div className="text-sm font-bold text-gray-600">
            권한 <span className="text-black">{adminRoleType}</span>
          </div>
        </div>

        <div className="mb-5 flex flex-wrap gap-2">
          {adminSections.map((section) => {
            const isActive = section.key === activeSection.key;

            return (
              <Link
                key={section.key}
                href={getSectionHref(section.key)}
                className={`inline-flex h-10 items-center rounded-md border px-4 text-sm font-black transition ${
                  isActive
                    ? 'border-black bg-black text-white'
                    : 'border-gray-300 bg-white text-gray-700 hover:border-black hover:text-black'
                }`}
              >
                {section.label}
              </Link>
            );
          })}
        </div>

        {isSellerSection ? (
          <section className="overflow-hidden rounded-md border border-gray-300 bg-white">
            <div className="flex flex-col gap-3 border-b border-gray-200 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-lg font-black text-black">
                  셀러 신청 관리
                </h2>
                <p className="mt-1 text-sm font-bold text-gray-500">
                  {applications.length}건
                </p>
              </div>

              <button
                type="button"
                onClick={fetchApplications}
                disabled={isLoading}
                className="inline-flex h-10 items-center justify-center rounded-md border border-gray-300 px-4 text-sm font-black text-black transition hover:border-black disabled:cursor-not-allowed disabled:text-gray-400"
              >
                새로고침
              </button>
            </div>

            <div className="flex flex-wrap gap-2 border-b border-gray-200 px-5 py-3">
              {sellerStatusFilters.map((filter) => {
                const isActive = filter.key === activeStatusFilter.key;

                return (
                  <Link
                    key={filter.key}
                    href={`/admin?tab=seller-applications&status=${filter.key}`}
                    className={`inline-flex h-9 items-center rounded-md border px-3 text-xs font-black transition ${
                      isActive
                        ? 'border-black bg-black text-white'
                        : 'border-gray-300 bg-white text-gray-700 hover:border-black hover:text-black'
                    }`}
                  >
                    {filter.label}
                  </Link>
                );
              })}
            </div>

            {noticeMessage && (
              <div className="border-b border-emerald-200 bg-emerald-50 px-5 py-3 text-sm font-bold text-emerald-800">
                {noticeMessage}
              </div>
            )}

            {errorMessage && (
              <div className="border-b border-[#d71920]/30 bg-red-50 px-5 py-3 text-sm font-bold text-[#d71920]">
                {errorMessage}
              </div>
            )}

            <div className="overflow-x-auto">
              <table className="min-w-full border-collapse text-left">
                <thead className="bg-gray-100 text-xs font-black uppercase text-gray-500">
                  <tr>
                    <th className="whitespace-nowrap px-5 py-3">신청 ID</th>
                    <th className="whitespace-nowrap px-5 py-3">이메일</th>
                    <th className="whitespace-nowrap px-5 py-3">상태</th>
                    <th className="whitespace-nowrap px-5 py-3">신청일</th>
                    <th className="whitespace-nowrap px-5 py-3">처리</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {isLoading ? (
                    <tr>
                      <td
                        colSpan={5}
                        className="px-5 py-12 text-center text-sm font-bold text-gray-500"
                      >
                        신청 목록을 불러오는 중입니다.
                      </td>
                    </tr>
                  ) : applications.length === 0 ? (
                    <tr>
                      <td
                        colSpan={5}
                        className="px-5 py-12 text-center text-sm font-bold text-gray-500"
                      >
                        표시할 신청이 없습니다.
                      </td>
                    </tr>
                  ) : (
                    applications.map((application) => (
                      <tr key={application.id} className="text-sm">
                        <td className="whitespace-nowrap px-5 py-4 font-black text-black">
                          #{application.id}
                        </td>
                        <td className="px-5 py-4">
                          <div className="font-bold text-black">
                            {application.email}
                          </div>
                          <div className="mt-1 break-all text-xs font-semibold text-gray-500">
                            {application.userId}
                          </div>
                        </td>
                        <td className="whitespace-nowrap px-5 py-4">
                          <span
                            className={`inline-flex rounded-md border px-2.5 py-1 text-xs font-black ${statusClasses[application.status]}`}
                          >
                            {statusLabels[application.status]}
                          </span>
                        </td>
                        <td className="whitespace-nowrap px-5 py-4 font-semibold text-gray-700">
                          {getFormattedDate(application.createdAt)}
                        </td>
                        <td className="whitespace-nowrap px-5 py-4">
                          {application.status === 'PENDING' ? (
                            <div className="flex gap-2">
                              <button
                                type="button"
                                onClick={() =>
                                  handleReview(application.id, 'approve')
                                }
                                disabled={actionId !== null}
                                className="inline-flex h-9 items-center rounded-md bg-[#d71920] px-3 text-xs font-black text-white transition hover:bg-black disabled:cursor-not-allowed disabled:bg-gray-400"
                              >
                                {actionId === `approve-${application.id}`
                                  ? '승인 중'
                                  : '승인'}
                              </button>
                              <button
                                type="button"
                                onClick={() =>
                                  handleReview(application.id, 'cancel')
                                }
                                disabled={actionId !== null}
                                className="inline-flex h-9 items-center rounded-md border border-gray-300 px-3 text-xs font-black text-black transition hover:border-black disabled:cursor-not-allowed disabled:text-gray-400"
                              >
                                {actionId === `cancel-${application.id}`
                                  ? '취소 중'
                                  : '취소'}
                              </button>
                            </div>
                          ) : (
                            <span className="text-sm font-bold text-gray-400">
                              완료
                            </span>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </section>
        ) : isBoxSection ? (
          <BoxCreatePanel />
        ) : isTierSection ? (
          <TierCreatePanel />
        ) : (
          <ChecklistCreatePanel />
        )}
      </div>
    </main>
  );
}
