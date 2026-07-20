'use client';

import Cookies from 'js-cookie';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ChangeEvent,
  FormEvent,
  MouseEvent,
  ReactNode,
  useEffect,
  useMemo,
  useState,
} from 'react';

import PytCreatePage from '../pyt/create/page';
import PytManagePage from '../pyt/manage/page';

const API_BASE_URL = process.env.NEXT_PUBLIC_SERVER_URL ?? '';

type SellerApplicationStatus = 'PENDING' | 'APPROVED' | 'REJECTED';
type MyPagePanel =
  | 'profile'
  | 'seller-info'
  | 'seller-accounts'
  | 'seller-sales'
  | 'trade-create'
  | 'pyt-manage'
  | 'pyt-create';

interface UserProfile {
  userId: string;
  email: string;
  name: string;
  nickname: string | null;
  phoneNumber: string | null;
  userRoleType: string;
  profileImageUrl: string | null;
  registeredAt: string | null;
}

interface SellerApplication {
  id: number;
  email: string;
  status: SellerApplicationStatus;
  createdAt: string;
  storeName: string | null;
  businessType: string | null;
  contactName: string | null;
  contactPhone: string | null;
  settlementBank: string | null;
  settlementAccountHolder: string | null;
  settlementAccountNumber: string | null;
  shippingPolicy: string | null;
  mainProductCategories: string | null;
  salesChannelUrl: string | null;
  experienceNote: string | null;
  sellerPolicyAgreed: boolean | null;
}

interface SellerSummary {
  pytBreakCount: number;
  pytSaleCount: number;
  cardTradeSaleCount: number;
  totalSalesAmount: number;
}

interface PasswordForm {
  currentPassword: string;
  newPassword: string;
  newPasswordConfirm: string;
}

interface SellerApplicationForm {
  storeName: string;
  businessType: 'PERSONAL' | 'BUSINESS';
  contactName: string;
  contactPhone: string;
  settlementBank: string;
  settlementAccountHolder: string;
  settlementAccountNumber: string;
  shippingPolicy: string;
  mainProductCategories: string;
  salesChannelUrl: string;
  experienceNote: string;
  sellerPolicyAgreed: boolean;
}

interface CardTradeForm {
  title: string;
  leagueName: string;
  playerName: string;
  teamName: string;
  cardYear: string;
  brandName: string;
  cardNumber: string;
  gradeCompany: string;
  grade: string;
  conditionLabel: string;
  price: string;
  shippingFee: string;
  imageUrl: string;
  description: string;
}

const cookieOptions = {
  expires: 1,
  path: '/',
};

const sellerBusinessTypeOptions: {
  value: SellerApplicationForm['businessType'];
  label: string;
}[] = [
  { value: 'PERSONAL', label: '개인 셀러' },
  { value: 'BUSINESS', label: '사업자 셀러' },
];

const initialSellerApplicationForm: SellerApplicationForm = {
  storeName: '',
  businessType: 'PERSONAL',
  contactName: '',
  contactPhone: '',
  settlementBank: '',
  settlementAccountHolder: '',
  settlementAccountNumber: '',
  shippingPolicy: '',
  mainProductCategories: '',
  salesChannelUrl: '',
  experienceNote: '',
  sellerPolicyAgreed: false,
};

const tradeLeagueOptions = ['MLB', 'NBA', 'NFL', 'NHL', 'MLS'];

const initialCardTradeForm: CardTradeForm = {
  title: '',
  leagueName: 'MLB',
  playerName: '',
  teamName: '',
  cardYear: '',
  brandName: '',
  cardNumber: '',
  gradeCompany: '',
  grade: '',
  conditionLabel: '',
  price: '',
  shippingFee: '0',
  imageUrl: '',
  description: '',
};

function getSellerApplicationStatusText(status: SellerApplicationStatus) {
  switch (status) {
    case 'PENDING':
      return '검토 대기';
    case 'APPROVED':
      return '승인 완료';
    case 'REJECTED':
      return '반려';
    default:
      return status;
  }
}

function getRoleLabel(userRoleType: string) {
  switch (userRoleType) {
    case 'ADMIN':
      return '관리자';
    case 'MANAGER':
      return '매니저';
    case 'SELLER':
      return '셀러';
    case 'USER':
      return '일반 회원';
    default:
      return userRoleType || '회원';
  }
}

function getBusinessTypeLabel(value: string | null) {
  return (
    sellerBusinessTypeOptions.find((option) => option.value === value)?.label ??
    value ??
    '-'
  );
}

function getDisplayText(value: string | null | undefined) {
  return value && value.trim() ? value : '-';
}

function formatDate(value: string | null) {
  if (!value) return '-';

  return new Intl.DateTimeFormat('ko-KR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(new Date(value));
}

function formatNumber(value: number) {
  return new Intl.NumberFormat('ko-KR').format(Number(value || 0));
}

function formatCurrency(value: number) {
  return `${formatNumber(value)}원`;
}

function syncProfileCookies(profile: UserProfile) {
  Cookies.set('userId', profile.userId ?? '', cookieOptions);
  Cookies.set('email', profile.email ?? '', cookieOptions);
  Cookies.set('name', profile.name ?? '', cookieOptions);
  Cookies.set('nickname', profile.nickname ?? '', cookieOptions);
  Cookies.set('userRoleType', profile.userRoleType ?? '', cookieOptions);
  Cookies.set('profileImageUrl', profile.profileImageUrl ?? '', cookieOptions);
}

function InfoRow({
  label,
  value,
}: {
  label: string;
  value: ReactNode;
}) {
  return (
    <div className="border-b border-gray-200 py-4 last:border-b-0">
      <p className="text-sm font-black text-gray-500">{label}</p>
      <div className="mt-2 text-base font-bold text-black">{value}</div>
    </div>
  );
}

function SidebarButton({
  isActive,
  children,
  onClick,
}: {
  isActive: boolean;
  children: ReactNode;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex h-11 w-full items-center rounded-md border px-4 text-left text-sm font-black transition ${
        isActive
          ? 'border-black bg-black text-white'
          : 'border-transparent bg-transparent text-gray-700 hover:border-black hover:bg-white hover:text-black'
      }`}
    >
      {children}
    </button>
  );
}

export default function Mypage() {
  const router = useRouter();
  const [authState, setAuthState] = useState({
    isChecked: false,
    accessToken: '',
    userRoleType: '',
  });
  const [activePanel, setActivePanel] = useState<MyPagePanel>('profile');

  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isProfileLoading, setIsProfileLoading] = useState(true);
  const [profileError, setProfileError] = useState('');
  const [profileMessage, setProfileMessage] = useState('');
  const [selectedProfileImageFile, setSelectedProfileImageFile] =
    useState<File | null>(null);
  const [profileImagePreview, setProfileImagePreview] = useState('');
  const [profileImageInputKey, setProfileImageInputKey] = useState(0);
  const [isProfileImageUploading, setIsProfileImageUploading] = useState(false);

  const [passwordForm, setPasswordForm] = useState<PasswordForm>({
    currentPassword: '',
    newPassword: '',
    newPasswordConfirm: '',
  });
  const [isPasswordSaving, setIsPasswordSaving] = useState(false);
  const [passwordMessage, setPasswordMessage] = useState('');
  const [passwordError, setPasswordError] = useState('');

  const [sellerApplication, setSellerApplication] =
    useState<SellerApplication | null>(null);
  const [isSellerApplicationLoading, setIsSellerApplicationLoading] =
    useState(false);
  const [isSellerApplying, setIsSellerApplying] = useState(false);
  const [sellerApplicationMessage, setSellerApplicationMessage] = useState('');
  const [sellerApplicationError, setSellerApplicationError] = useState('');
  const [sellerApplicationForm, setSellerApplicationForm] =
    useState<SellerApplicationForm>(initialSellerApplicationForm);
  const [sellerSummary, setSellerSummary] = useState<SellerSummary | null>(
    null
  );
  const [isSellerSummaryLoading, setIsSellerSummaryLoading] = useState(false);
  const [sellerSummaryError, setSellerSummaryError] = useState('');
  const [cardTradeForm, setCardTradeForm] =
    useState<CardTradeForm>(initialCardTradeForm);
  const [isCardTradeSaving, setIsCardTradeSaving] = useState(false);
  const [cardTradeMessage, setCardTradeMessage] = useState('');
  const [cardTradeError, setCardTradeError] = useState('');
  const [createdTradeId, setCreatedTradeId] = useState<number | null>(null);

  const accessToken = authState.accessToken;
  const userRoleType = profile?.userRoleType ?? authState.userRoleType;
  const isSeller = userRoleType === 'SELLER';
  const canApplySeller = userRoleType === 'USER';
  const hasPendingSellerApplication =
    sellerApplication?.status === 'PENDING';
  const shouldShowSellerApplicationForm =
    canApplySeller && !hasPendingSellerApplication;
  const displayName =
    profile?.nickname || profile?.name || profile?.email || '회원';
  const profileImageUrl = profileImagePreview || profile?.profileImageUrl || '';
  const avatarInitial = displayName.trim().charAt(0).toUpperCase() || 'P';

  const sellerStatusText = useMemo(() => {
    if (isSeller) return '셀러';
    if (sellerApplication) {
      return getSellerApplicationStatusText(sellerApplication.status);
    }
    return '신청 전';
  }, [isSeller, sellerApplication]);

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
    }
  }, [router]);

  useEffect(() => {
    if (!authState.isChecked) return;

    if (!accessToken) {
      setIsProfileLoading(false);
      return;
    }

    let isMounted = true;

    const fetchProfile = async () => {
      try {
        setIsProfileLoading(true);
        setProfileError('');

        const response = await fetch(`${API_BASE_URL}/auth/me`, {
          headers: { Authorization: `Bearer ${accessToken}` },
        });

        if (!response.ok) {
          throw new Error(await response.text());
        }

        const data = (await response.json()) as UserProfile;
        if (!isMounted) return;

        setProfile(data);
        syncProfileCookies(data);
        setAuthState((prev) => ({
          ...prev,
          userRoleType: data.userRoleType,
        }));
      } catch (error) {
        console.error(error);
        if (isMounted) {
          setProfileError('내 정보를 불러오지 못했습니다.');
        }
      } finally {
        if (isMounted) {
          setIsProfileLoading(false);
        }
      }
    };

    fetchProfile();

    return () => {
      isMounted = false;
    };
  }, [accessToken, authState.isChecked]);

  useEffect(() => {
    if (!accessToken || !canApplySeller) return;

    let isMounted = true;

    const fetchSellerApplication = async () => {
      try {
        setIsSellerApplicationLoading(true);
        setSellerApplicationError('');

        const response = await fetch(`${API_BASE_URL}/seller-applications/latest/me`, {
          headers: { Authorization: `Bearer ${accessToken}` },
        });

        if (response.status === 204) {
          if (isMounted) {
            setSellerApplication(null);
          }
          return;
        }

        if (!response.ok) {
          throw new Error(await response.text());
        }

        const data = (await response.json()) as SellerApplication;
        if (isMounted) {
          setSellerApplication(data);
        }
      } catch (error) {
        console.error(error);
        if (isMounted) {
          setSellerApplicationError('셀러 신청 상태를 불러오지 못했습니다.');
        }
      } finally {
        if (isMounted) {
          setIsSellerApplicationLoading(false);
        }
      }
    };

    fetchSellerApplication();

    return () => {
      isMounted = false;
    };
  }, [accessToken, canApplySeller]);

  useEffect(() => {
    if (!accessToken || !isSeller) return;

    let isMounted = true;

    const fetchSellerSummary = async () => {
      try {
        setIsSellerSummaryLoading(true);
        setSellerSummaryError('');

        const response = await fetch(`${API_BASE_URL}/auth/me/seller-summary`, {
          headers: { Authorization: `Bearer ${accessToken}` },
        });

        if (!response.ok) {
          throw new Error(await response.text());
        }

        const data = (await response.json()) as SellerSummary;
        if (isMounted) {
          setSellerSummary(data);
        }
      } catch (error) {
        console.error(error);
        if (isMounted) {
          setSellerSummaryError('셀러 정보를 불러오지 못했습니다.');
        }
      } finally {
        if (isMounted) {
          setIsSellerSummaryLoading(false);
        }
      }
    };

    fetchSellerSummary();

    return () => {
      isMounted = false;
    };
  }, [accessToken, isSeller]);

  useEffect(() => {
    return () => {
      if (profileImagePreview.startsWith('blob:')) {
        URL.revokeObjectURL(profileImagePreview);
      }
    };
  }, [profileImagePreview]);

  const handleLogout = () => {
    Cookies.remove('accessToken', { path: '/' });
    Cookies.remove('userId', { path: '/' });
    Cookies.remove('email', { path: '/' });
    Cookies.remove('name', { path: '/' });
    Cookies.remove('nickname', { path: '/' });
    Cookies.remove('userRoleType', { path: '/' });
    Cookies.remove('profileImageUrl', { path: '/' });
    router.push('/');
  };

  const updateSellerApplicationField = <
    FieldName extends keyof SellerApplicationForm,
  >(
    fieldName: FieldName,
    value: SellerApplicationForm[FieldName]
  ) => {
    setSellerApplicationForm((prev) => ({
      ...prev,
      [fieldName]: value,
    }));
  };

  const handleSellerApply = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSellerApplicationMessage('');
    setSellerApplicationError('');

    if (!profile?.email) {
      setSellerApplicationError('이메일 정보가 없어 셀러 신청을 할 수 없습니다.');
      return;
    }

    if (!sellerApplicationForm.sellerPolicyAgreed) {
      setSellerApplicationError('셀러 운영 기준에 동의해주세요.');
      return;
    }

    try {
      setIsSellerApplying(true);

      const response = await fetch(`${API_BASE_URL}/seller-applications`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: profile.email,
          ...sellerApplicationForm,
        }),
      });

      if (!response.ok) {
        throw new Error(await response.text());
      }

      const data = (await response.json()) as SellerApplication;
      setSellerApplication(data);
      setSellerApplicationMessage('셀러 신청이 접수되었습니다.');
      setSellerApplicationForm(initialSellerApplicationForm);
    } catch (error) {
      console.error(error);
      setSellerApplicationError(
        error instanceof Error && error.message
          ? error.message
          : '셀러 신청에 실패했습니다.'
      );
    } finally {
      setIsSellerApplying(false);
    }
  };

  const updateCardTradeField = <FieldName extends keyof CardTradeForm>(
    fieldName: FieldName,
    value: CardTradeForm[FieldName]
  ) => {
    setCardTradeForm((prev) => ({
      ...prev,
      [fieldName]: value,
    }));
  };

  const handleCardTradeCreate = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setCardTradeMessage('');
    setCardTradeError('');
    setCreatedTradeId(null);

    const price = Number(cardTradeForm.price);
    const shippingFee = Number(cardTradeForm.shippingFee || 0);

    if (!Number.isFinite(price) || price <= 0) {
      setCardTradeError('판매가를 0원보다 크게 입력해주세요.');
      return;
    }

    if (!Number.isFinite(shippingFee) || shippingFee < 0) {
      setCardTradeError('배송비는 0원 이상으로 입력해주세요.');
      return;
    }

    try {
      setIsCardTradeSaving(true);

      const response = await fetch(`${API_BASE_URL}/trades`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...cardTradeForm,
          price,
          shippingFee,
        }),
      });

      if (!response.ok) {
        throw new Error(await response.text());
      }

      const tradeId = Number(await response.json());
      setCreatedTradeId(tradeId);
      setCardTradeMessage('카드 거래 상품이 등록되었습니다.');
      setCardTradeForm(initialCardTradeForm);
    } catch (error) {
      console.error(error);
      setCardTradeError(
        error instanceof Error && error.message
          ? error.message
          : '카드 거래 상품 등록에 실패했습니다.'
      );
    } finally {
      setIsCardTradeSaving(false);
    }
  };

  const handleProfileImageChange = (
    event: ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0] ?? null;
    setProfileMessage('');
    setProfileError('');
    setSelectedProfileImageFile(file);

    if (!file) {
      setProfileImagePreview('');
      return;
    }

    setProfileImagePreview(URL.createObjectURL(file));
  };

  const handleProfileImageUpload = async () => {
    setProfileMessage('');
    setProfileError('');

    if (!selectedProfileImageFile) {
      setProfileError('등록할 프로필 이미지를 선택해주세요.');
      return;
    }

    try {
      setIsProfileImageUploading(true);

      const formData = new FormData();
      formData.append('file', selectedProfileImageFile);

      const uploadResponse = await fetch('/api/profile-image', {
        method: 'POST',
        body: formData,
      });

      if (!uploadResponse.ok) {
        const errorBody = await uploadResponse.json().catch(() => null);
        throw new Error(errorBody?.message ?? '이미지 업로드에 실패했습니다.');
      }

      const uploadResult = (await uploadResponse.json()) as {
        profileImageUrl: string;
      };

      const saveResponse = await fetch(`${API_BASE_URL}/auth/me/profile-image`, {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          profileImageUrl: uploadResult.profileImageUrl,
        }),
      });

      if (!saveResponse.ok) {
        throw new Error(await saveResponse.text());
      }

      const nextProfile = (await saveResponse.json()) as UserProfile;
      setProfile(nextProfile);
      syncProfileCookies(nextProfile);
      setSelectedProfileImageFile(null);
      setProfileImagePreview('');
      setProfileImageInputKey((prev) => prev + 1);
      setProfileMessage('프로필 이미지가 변경되었습니다.');
    } catch (error) {
      console.error(error);
      setProfileError(
        error instanceof Error && error.message
          ? error.message
          : '프로필 이미지 변경에 실패했습니다.'
      );
    } finally {
      setIsProfileImageUploading(false);
    }
  };

  const handlePasswordChange = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setPasswordMessage('');
    setPasswordError('');

    if (!passwordForm.currentPassword.trim()) {
      setPasswordError('현재 비밀번호를 입력해주세요.');
      return;
    }

    if (!passwordForm.newPassword.trim()) {
      setPasswordError('변경할 비밀번호를 입력해주세요.');
      return;
    }

    if (passwordForm.newPassword !== passwordForm.newPasswordConfirm) {
      setPasswordError('변경 비밀번호가 서로 일치하지 않습니다.');
      return;
    }

    try {
      setIsPasswordSaving(true);

      const response = await fetch(`${API_BASE_URL}/auth/me/password`, {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          currentPassword: passwordForm.currentPassword,
          newPassword: passwordForm.newPassword,
        }),
      });

      if (!response.ok) {
        throw new Error(await response.text());
      }

      setPasswordForm({
        currentPassword: '',
        newPassword: '',
        newPasswordConfirm: '',
      });
      setPasswordMessage('비밀번호가 변경되었습니다.');
    } catch (error) {
      console.error(error);
      setPasswordError(
        error instanceof Error && error.message
          ? error.message
          : '비밀번호 변경에 실패했습니다.'
      );
    } finally {
      setIsPasswordSaving(false);
    }
  };

  const handleEmbeddedPytClickCapture = (
    event: MouseEvent<HTMLDivElement>
  ) => {
    const target = event.target as HTMLElement;
    const link = target.closest('a[href]');
    const href = link?.getAttribute('href');

    if (href === '/pyt/manage') {
      event.preventDefault();
      setActivePanel('pyt-manage');
    }

    if (href === '/pyt/create') {
      event.preventDefault();
      setActivePanel('pyt-create');
    }
  };

  const renderEmbeddedPytPanel = (panel: 'manage' | 'create') => (
    <div
      onClickCapture={handleEmbeddedPytClickCapture}
      className="[&>main]:min-h-0 [&>main]:bg-transparent [&>main>div]:max-w-none [&>main>div]:px-0 [&>main>div]:py-0"
    >
      {panel === 'manage' ? <PytManagePage /> : <PytCreatePage />}
    </div>
  );

  const renderProfilePanel = () => (
    <div className="space-y-8">
      <section className="rounded-md border border-black bg-white">
        <div className="border-b border-black px-6 py-5">
          <p className="text-sm font-black text-[#d71920]">나의 정보</p>
          <h2 className="mt-2 text-2xl font-black text-black">{displayName}</h2>
        </div>

        <div className="grid gap-8 p-6 lg:grid-cols-[220px_1fr]">
          <div>
            <div className="flex h-[180px] w-[180px] items-center justify-center overflow-hidden rounded-md border border-black bg-[#f1f1f1]">
              {profileImageUrl ? (
                <img
                  src={profileImageUrl}
                  alt={`${displayName} 프로필 이미지`}
                  className="h-full w-full object-cover"
                />
              ) : (
                <span className="text-6xl font-black text-black">
                  {avatarInitial}
                </span>
              )}
            </div>

            <div className="mt-4 space-y-3">
              <input
                key={profileImageInputKey}
                type="file"
                accept="image/*"
                onChange={handleProfileImageChange}
                className="block w-full text-sm font-bold text-gray-700 file:mr-3 file:h-10 file:rounded-md file:border-0 file:bg-black file:px-4 file:text-sm file:font-black file:text-white"
              />
              <button
                type="button"
                onClick={handleProfileImageUpload}
                disabled={isProfileImageUploading}
                className="h-11 w-full rounded-md bg-[#d71920] text-sm font-black text-white transition hover:bg-black disabled:cursor-not-allowed disabled:bg-gray-400"
              >
                {isProfileImageUploading ? '변경 중...' : '프로필 이미지 변경'}
              </button>
            </div>
          </div>

          <div>
            {isProfileLoading ? (
              <p className="py-8 text-sm font-bold text-gray-500">
                정보를 불러오는 중입니다.
              </p>
            ) : (
              <div>
                <InfoRow label="이메일" value={profile?.email ?? '-'} />
                <InfoRow label="이름" value={profile?.name ?? '-'} />
                <InfoRow
                  label="닉네임"
                  value={profile?.nickname || '닉네임 없음'}
                />
                <InfoRow
                  label="전화번호"
                  value={profile?.phoneNumber || '-'}
                />
                <InfoRow label="권한" value={getRoleLabel(userRoleType)} />
                <InfoRow
                  label="가입일"
                  value={formatDate(profile?.registeredAt ?? null)}
                />
              </div>
            )}
          </div>
        </div>

        {(profileMessage || profileError) && (
          <div className="border-t border-gray-200 px-6 py-4">
            {profileMessage && (
              <p className="text-sm font-bold text-[#d71920]">
                {profileMessage}
              </p>
            )}
            {profileError && (
              <p className="text-sm font-bold text-[#d71920]">
                {profileError}
              </p>
            )}
          </div>
        )}
      </section>

      <section className="rounded-md border border-black bg-white p-6">
        <div className="mb-5">
          <p className="text-sm font-black text-[#d71920]">비밀번호 변경</p>
          <h2 className="mt-2 text-2xl font-black text-black">계정 보안</h2>
        </div>

        <form
          onSubmit={handlePasswordChange}
          className="grid gap-4 lg:grid-cols-3"
        >
          <div>
            <label className="mb-2 block text-sm font-black text-black">
              현재 비밀번호
            </label>
            <input
              type="password"
              value={passwordForm.currentPassword}
              onChange={(event) =>
                setPasswordForm((prev) => ({
                  ...prev,
                  currentPassword: event.target.value,
                }))
              }
              className="h-12 w-full rounded-md border border-gray-300 bg-[#f1f1f1] px-4 text-sm font-bold text-black outline-none transition focus:border-black focus:bg-white"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-black text-black">
              변경 비밀번호
            </label>
            <input
              type="password"
              value={passwordForm.newPassword}
              onChange={(event) =>
                setPasswordForm((prev) => ({
                  ...prev,
                  newPassword: event.target.value,
                }))
              }
              className="h-12 w-full rounded-md border border-gray-300 bg-[#f1f1f1] px-4 text-sm font-bold text-black outline-none transition focus:border-black focus:bg-white"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-black text-black">
              변경 비밀번호 확인
            </label>
            <input
              type="password"
              value={passwordForm.newPasswordConfirm}
              onChange={(event) =>
                setPasswordForm((prev) => ({
                  ...prev,
                  newPasswordConfirm: event.target.value,
                }))
              }
              className="h-12 w-full rounded-md border border-gray-300 bg-[#f1f1f1] px-4 text-sm font-bold text-black outline-none transition focus:border-black focus:bg-white"
            />
          </div>

          <div className="lg:col-span-3">
            <button
              type="submit"
              disabled={isPasswordSaving}
              className="h-12 rounded-md bg-black px-6 text-sm font-black text-white transition hover:bg-[#d71920] disabled:cursor-not-allowed disabled:bg-gray-400"
            >
              {isPasswordSaving ? '변경 중...' : '비밀번호 변경'}
            </button>
          </div>
        </form>

        {(passwordMessage || passwordError) && (
          <div className="mt-4">
            {passwordMessage && (
              <p className="text-sm font-bold text-[#d71920]">
                {passwordMessage}
              </p>
            )}
            {passwordError && (
              <p className="text-sm font-bold text-[#d71920]">
                {passwordError}
              </p>
            )}
          </div>
        )}
      </section>
    </div>
  );

  const renderSellerInfoPanel = () => (
    <section className="rounded-md border border-black bg-white">
      <div className="border-b border-black px-6 py-5">
        <p className="text-sm font-black text-[#d71920]">셀러</p>
        <h2 className="mt-2 text-2xl font-black text-black">정보</h2>
      </div>

      {isSeller ? (
        <div className="p-6">
          {isSellerSummaryLoading ? (
            <p className="py-8 text-sm font-bold text-gray-500">
              셀러 정보를 불러오는 중입니다.
            </p>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              <div className="rounded-md border border-gray-200 p-5">
                <p className="text-sm font-black text-gray-500">PYT 등록수</p>
                <p className="mt-3 text-3xl font-black text-black">
                  {formatNumber(sellerSummary?.pytBreakCount ?? 0)}
                </p>
              </div>

              <div className="rounded-md border border-gray-200 p-5">
                <p className="text-sm font-black text-gray-500">PYT 판매수</p>
                <p className="mt-3 text-3xl font-black text-black">
                  {formatNumber(sellerSummary?.pytSaleCount ?? 0)}
                </p>
              </div>

              <div className="rounded-md border border-gray-200 p-5">
                <p className="text-sm font-black text-gray-500">
                  카드 거래 판매수
                </p>
                <p className="mt-3 text-3xl font-black text-black">
                  {formatNumber(sellerSummary?.cardTradeSaleCount ?? 0)}
                </p>
              </div>

              <div className="rounded-md border border-gray-200 p-5">
                <p className="text-sm font-black text-gray-500">총 판매금액</p>
                <p className="mt-3 text-3xl font-black text-black">
                  {formatCurrency(sellerSummary?.totalSalesAmount ?? 0)}
                </p>
              </div>
            </div>
          )}

          {sellerSummaryError && (
            <p className="mt-4 text-sm font-bold text-[#d71920]">
              {sellerSummaryError}
            </p>
          )}
        </div>
      ) : (
        <div className="space-y-5 p-6">
          <div className="rounded-md border border-gray-200 p-5">
            <div>
              <p className="text-sm font-black text-gray-500">셀러 상태</p>
              <div className="mt-2 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                <p className="text-2xl font-black text-black">
                  {sellerStatusText}
                </p>
                {sellerApplication?.createdAt && (
                  <p className="text-sm font-bold text-gray-500">
                    신청일 {formatDate(sellerApplication.createdAt)}
                  </p>
                )}
              </div>
            </div>
          </div>

          {sellerApplication && (
            <div className="rounded-md border border-gray-200 p-5">
              <p className="text-sm font-black text-gray-500">최근 신청 정보</p>
              <div className="mt-4 grid gap-4 md:grid-cols-2">
                <InfoRow
                  label="스토어명"
                  value={getDisplayText(sellerApplication.storeName)}
                />
                <InfoRow
                  label="판매자 유형"
                  value={getBusinessTypeLabel(sellerApplication.businessType)}
                />
                <InfoRow
                  label="담당자"
                  value={getDisplayText(sellerApplication.contactName)}
                />
                <InfoRow
                  label="연락처"
                  value={getDisplayText(sellerApplication.contactPhone)}
                />
                <InfoRow
                  label="판매 카테고리"
                  value={getDisplayText(
                    sellerApplication.mainProductCategories
                  )}
                />
                <InfoRow
                  label="외부 판매 채널"
                  value={
                    sellerApplication.salesChannelUrl ? (
                      <a
                        href={sellerApplication.salesChannelUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="break-all text-[#d71920] underline"
                      >
                        {sellerApplication.salesChannelUrl}
                      </a>
                    ) : (
                      '-'
                    )
                  }
                />
              </div>
            </div>
          )}

          {shouldShowSellerApplicationForm && (
            <form
              onSubmit={handleSellerApply}
              className="rounded-md border border-gray-200 p-5"
            >
              <div className="mb-5">
                <p className="text-sm font-black text-gray-500">
                  셀러 등록 신청
                </p>
                <h3 className="mt-2 text-xl font-black text-black">
                  카드 거래 셀러 정보
                </h3>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-black text-black">
                    스토어명
                  </label>
                  <input
                    type="text"
                    required
                    maxLength={100}
                    value={sellerApplicationForm.storeName}
                    onChange={(event) =>
                      updateSellerApplicationField(
                        'storeName',
                        event.target.value
                      )
                    }
                    className="h-12 w-full rounded-md border border-gray-300 bg-[#f1f1f1] px-4 text-sm font-bold text-black outline-none transition focus:border-black focus:bg-white"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-black text-black">
                    판매자 유형
                  </label>
                  <select
                    value={sellerApplicationForm.businessType}
                    onChange={(event) =>
                      updateSellerApplicationField(
                        'businessType',
                        event.target.value as SellerApplicationForm['businessType']
                      )
                    }
                    className="h-12 w-full rounded-md border border-gray-300 bg-[#f1f1f1] px-4 text-sm font-bold text-black outline-none transition focus:border-black focus:bg-white"
                  >
                    {sellerBusinessTypeOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-black text-black">
                    담당자명
                  </label>
                  <input
                    type="text"
                    required
                    maxLength={50}
                    value={sellerApplicationForm.contactName}
                    onChange={(event) =>
                      updateSellerApplicationField(
                        'contactName',
                        event.target.value
                      )
                    }
                    className="h-12 w-full rounded-md border border-gray-300 bg-[#f1f1f1] px-4 text-sm font-bold text-black outline-none transition focus:border-black focus:bg-white"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-black text-black">
                    연락처
                  </label>
                  <input
                    type="tel"
                    required
                    maxLength={30}
                    value={sellerApplicationForm.contactPhone}
                    onChange={(event) =>
                      updateSellerApplicationField(
                        'contactPhone',
                        event.target.value
                      )
                    }
                    className="h-12 w-full rounded-md border border-gray-300 bg-[#f1f1f1] px-4 text-sm font-bold text-black outline-none transition focus:border-black focus:bg-white"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-black text-black">
                    정산 은행
                  </label>
                  <input
                    type="text"
                    required
                    maxLength={50}
                    value={sellerApplicationForm.settlementBank}
                    onChange={(event) =>
                      updateSellerApplicationField(
                        'settlementBank',
                        event.target.value
                      )
                    }
                    className="h-12 w-full rounded-md border border-gray-300 bg-[#f1f1f1] px-4 text-sm font-bold text-black outline-none transition focus:border-black focus:bg-white"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-black text-black">
                    예금주
                  </label>
                  <input
                    type="text"
                    required
                    maxLength={50}
                    value={sellerApplicationForm.settlementAccountHolder}
                    onChange={(event) =>
                      updateSellerApplicationField(
                        'settlementAccountHolder',
                        event.target.value
                      )
                    }
                    className="h-12 w-full rounded-md border border-gray-300 bg-[#f1f1f1] px-4 text-sm font-bold text-black outline-none transition focus:border-black focus:bg-white"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-black text-black">
                    정산 계좌번호
                  </label>
                  <input
                    type="text"
                    required
                    maxLength={80}
                    value={sellerApplicationForm.settlementAccountNumber}
                    onChange={(event) =>
                      updateSellerApplicationField(
                        'settlementAccountNumber',
                        event.target.value
                      )
                    }
                    className="h-12 w-full rounded-md border border-gray-300 bg-[#f1f1f1] px-4 text-sm font-bold text-black outline-none transition focus:border-black focus:bg-white"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-black text-black">
                    판매 예정 카테고리
                  </label>
                  <input
                    type="text"
                    required
                    maxLength={300}
                    value={sellerApplicationForm.mainProductCategories}
                    onChange={(event) =>
                      updateSellerApplicationField(
                        'mainProductCategories',
                        event.target.value
                      )
                    }
                    className="h-12 w-full rounded-md border border-gray-300 bg-[#f1f1f1] px-4 text-sm font-bold text-black outline-none transition focus:border-black focus:bg-white"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="mb-2 block text-sm font-black text-black">
                    외부 판매 채널 URL
                  </label>
                  <input
                    type="url"
                    maxLength={500}
                    value={sellerApplicationForm.salesChannelUrl}
                    onChange={(event) =>
                      updateSellerApplicationField(
                        'salesChannelUrl',
                        event.target.value
                      )
                    }
                    className="h-12 w-full rounded-md border border-gray-300 bg-[#f1f1f1] px-4 text-sm font-bold text-black outline-none transition focus:border-black focus:bg-white"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="mb-2 block text-sm font-black text-black">
                    배송 정책
                  </label>
                  <textarea
                    required
                    maxLength={500}
                    rows={4}
                    value={sellerApplicationForm.shippingPolicy}
                    onChange={(event) =>
                      updateSellerApplicationField(
                        'shippingPolicy',
                        event.target.value
                      )
                    }
                    className="w-full resize-none rounded-md border border-gray-300 bg-[#f1f1f1] px-4 py-3 text-sm font-bold text-black outline-none transition focus:border-black focus:bg-white"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="mb-2 block text-sm font-black text-black">
                    카드 거래 경험 및 운영 계획
                  </label>
                  <textarea
                    required
                    maxLength={1000}
                    rows={5}
                    value={sellerApplicationForm.experienceNote}
                    onChange={(event) =>
                      updateSellerApplicationField(
                        'experienceNote',
                        event.target.value
                      )
                    }
                    className="w-full resize-none rounded-md border border-gray-300 bg-[#f1f1f1] px-4 py-3 text-sm font-bold text-black outline-none transition focus:border-black focus:bg-white"
                  />
                </div>
              </div>

              <label className="mt-5 flex gap-3 rounded-md border border-gray-200 p-4 text-sm font-bold text-black">
                <input
                  type="checkbox"
                  checked={sellerApplicationForm.sellerPolicyAgreed}
                  onChange={(event) =>
                    updateSellerApplicationField(
                      'sellerPolicyAgreed',
                      event.target.checked
                    )
                  }
                  className="mt-1 h-4 w-4 accent-[#d71920]"
                />
                카드 상태를 정확히 고지하고, 실제 사진과 배송 추적 정보를 제공하겠습니다.
              </label>

              <button
                type="submit"
                disabled={isSellerApplying || isSellerApplicationLoading}
                className="mt-5 h-12 rounded-md bg-[#d71920] px-6 text-sm font-black text-white transition hover:bg-black disabled:cursor-not-allowed disabled:bg-gray-400"
              >
                {isSellerApplying
                  ? '신청 중...'
                  : sellerApplication?.status === 'REJECTED'
                    ? '셀러 재신청'
                    : '셀러 신청'}
              </button>
            </form>
          )}

          {(sellerApplicationMessage || sellerApplicationError) && (
            <div>
              {sellerApplicationMessage && (
                <p className="text-sm font-bold text-[#d71920]">
                  {sellerApplicationMessage}
                </p>
              )}
              {sellerApplicationError && (
                <p className="text-sm font-bold text-[#d71920]">
                  {sellerApplicationError}
                </p>
              )}
            </div>
          )}
        </div>
      )}
    </section>
  );

  const renderSellerAccountsPanel = () => (
    <section className="rounded-md border border-black bg-white">
      <div className="border-b border-black px-6 py-5">
        <p className="text-sm font-black text-[#d71920]">셀러</p>
        <h2 className="mt-2 text-2xl font-black text-black">계좌 관리</h2>
      </div>

      <div className="p-6">
        <div className="rounded-md border border-gray-200 p-5">
          <p className="text-base font-black text-black">
            등록된 계좌 정보가 없습니다.
          </p>
          <p className="mt-2 text-sm font-bold text-gray-500">
            계좌 등록과 변경은 준비 중입니다.
          </p>
        </div>
      </div>
    </section>
  );

  const renderTradeCreatePanel = () => (
    <section className="rounded-md border border-black bg-white">
      <div className="border-b border-black px-6 py-5">
        <p className="text-sm font-black text-[#d71920]">카드 거래</p>
        <h2 className="mt-2 text-2xl font-black text-black">상품 등록</h2>
      </div>

      <form onSubmit={handleCardTradeCreate} className="p-6">
        <div className="grid gap-4 md:grid-cols-2">
          <div className="md:col-span-2">
            <label className="mb-2 block text-sm font-black text-black">
              상품명
            </label>
            <input
              type="text"
              required
              maxLength={200}
              value={cardTradeForm.title}
              onChange={(event) =>
                updateCardTradeField('title', event.target.value)
              }
              className="h-12 w-full rounded-md border border-gray-300 bg-[#f1f1f1] px-4 text-sm font-bold text-black outline-none transition focus:border-black focus:bg-white"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-black text-black">
              리그
            </label>
            <select
              value={cardTradeForm.leagueName}
              onChange={(event) =>
                updateCardTradeField('leagueName', event.target.value)
              }
              className="h-12 w-full rounded-md border border-gray-300 bg-[#f1f1f1] px-4 text-sm font-bold text-black outline-none transition focus:border-black focus:bg-white"
            >
              {tradeLeagueOptions.map((leagueName) => (
                <option key={leagueName} value={leagueName}>
                  {leagueName}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-2 block text-sm font-black text-black">
              선수명
            </label>
            <input
              type="text"
              required
              maxLength={100}
              value={cardTradeForm.playerName}
              onChange={(event) =>
                updateCardTradeField('playerName', event.target.value)
              }
              className="h-12 w-full rounded-md border border-gray-300 bg-[#f1f1f1] px-4 text-sm font-bold text-black outline-none transition focus:border-black focus:bg-white"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-black text-black">
              팀명
            </label>
            <input
              type="text"
              maxLength={100}
              value={cardTradeForm.teamName}
              onChange={(event) =>
                updateCardTradeField('teamName', event.target.value)
              }
              className="h-12 w-full rounded-md border border-gray-300 bg-[#f1f1f1] px-4 text-sm font-bold text-black outline-none transition focus:border-black focus:bg-white"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-black text-black">
              연도
            </label>
            <input
              type="text"
              maxLength={20}
              value={cardTradeForm.cardYear}
              onChange={(event) =>
                updateCardTradeField('cardYear', event.target.value)
              }
              className="h-12 w-full rounded-md border border-gray-300 bg-[#f1f1f1] px-4 text-sm font-bold text-black outline-none transition focus:border-black focus:bg-white"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-black text-black">
              브랜드
            </label>
            <input
              type="text"
              maxLength={100}
              value={cardTradeForm.brandName}
              onChange={(event) =>
                updateCardTradeField('brandName', event.target.value)
              }
              className="h-12 w-full rounded-md border border-gray-300 bg-[#f1f1f1] px-4 text-sm font-bold text-black outline-none transition focus:border-black focus:bg-white"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-black text-black">
              카드 번호
            </label>
            <input
              type="text"
              maxLength={50}
              value={cardTradeForm.cardNumber}
              onChange={(event) =>
                updateCardTradeField('cardNumber', event.target.value)
              }
              className="h-12 w-full rounded-md border border-gray-300 bg-[#f1f1f1] px-4 text-sm font-bold text-black outline-none transition focus:border-black focus:bg-white"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-black text-black">
              그레이딩 회사
            </label>
            <input
              type="text"
              maxLength={50}
              value={cardTradeForm.gradeCompany}
              onChange={(event) =>
                updateCardTradeField('gradeCompany', event.target.value)
              }
              className="h-12 w-full rounded-md border border-gray-300 bg-[#f1f1f1] px-4 text-sm font-bold text-black outline-none transition focus:border-black focus:bg-white"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-black text-black">
              등급
            </label>
            <input
              type="text"
              maxLength={30}
              value={cardTradeForm.grade}
              onChange={(event) =>
                updateCardTradeField('grade', event.target.value)
              }
              className="h-12 w-full rounded-md border border-gray-300 bg-[#f1f1f1] px-4 text-sm font-bold text-black outline-none transition focus:border-black focus:bg-white"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-black text-black">
              카드 상태
            </label>
            <input
              type="text"
              required
              maxLength={80}
              value={cardTradeForm.conditionLabel}
              onChange={(event) =>
                updateCardTradeField('conditionLabel', event.target.value)
              }
              className="h-12 w-full rounded-md border border-gray-300 bg-[#f1f1f1] px-4 text-sm font-bold text-black outline-none transition focus:border-black focus:bg-white"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-black text-black">
              판매가
            </label>
            <input
              type="number"
              required
              min="1"
              value={cardTradeForm.price}
              onChange={(event) =>
                updateCardTradeField('price', event.target.value)
              }
              className="h-12 w-full rounded-md border border-gray-300 bg-[#f1f1f1] px-4 text-sm font-bold text-black outline-none transition focus:border-black focus:bg-white"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-black text-black">
              배송비
            </label>
            <input
              type="number"
              min="0"
              value={cardTradeForm.shippingFee}
              onChange={(event) =>
                updateCardTradeField('shippingFee', event.target.value)
              }
              className="h-12 w-full rounded-md border border-gray-300 bg-[#f1f1f1] px-4 text-sm font-bold text-black outline-none transition focus:border-black focus:bg-white"
            />
          </div>

          <div className="md:col-span-2">
            <label className="mb-2 block text-sm font-black text-black">
              이미지 URL
            </label>
            <input
              type="url"
              maxLength={500}
              value={cardTradeForm.imageUrl}
              onChange={(event) =>
                updateCardTradeField('imageUrl', event.target.value)
              }
              className="h-12 w-full rounded-md border border-gray-300 bg-[#f1f1f1] px-4 text-sm font-bold text-black outline-none transition focus:border-black focus:bg-white"
            />
          </div>

          <div className="md:col-span-2">
            <label className="mb-2 block text-sm font-black text-black">
              설명
            </label>
            <textarea
              maxLength={2000}
              rows={5}
              value={cardTradeForm.description}
              onChange={(event) =>
                updateCardTradeField('description', event.target.value)
              }
              className="w-full resize-none rounded-md border border-gray-300 bg-[#f1f1f1] px-4 py-3 text-sm font-bold text-black outline-none transition focus:border-black focus:bg-white"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={isCardTradeSaving}
          className="mt-5 h-12 rounded-md bg-[#d71920] px-6 text-sm font-black text-white transition hover:bg-black disabled:cursor-not-allowed disabled:bg-gray-400"
        >
          {isCardTradeSaving ? '등록 중...' : '카드 거래 등록'}
        </button>

        {(cardTradeMessage || cardTradeError) && (
          <div className="mt-4">
            {cardTradeMessage && (
              <p className="text-sm font-bold text-[#d71920]">
                {cardTradeMessage}
                {createdTradeId && (
                  <>
                    {' '}
                    <Link
                      href={`/trades/${createdTradeId}`}
                      className="underline"
                    >
                      상세 보기
                    </Link>
                  </>
                )}
              </p>
            )}
            {cardTradeError && (
              <p className="text-sm font-bold text-[#d71920]">
                {cardTradeError}
              </p>
            )}
          </div>
        )}
      </form>
    </section>
  );

  const renderSellerSalesPanel = () => (
    <section className="rounded-md border border-black bg-white">
      <div className="border-b border-black px-6 py-5">
        <p className="text-sm font-black text-[#d71920]">셀러</p>
        <h2 className="mt-2 text-2xl font-black text-black">판매내역</h2>
      </div>

      <div className="p-6">
        <div className="grid gap-4 md:grid-cols-3">
          <div className="rounded-md border border-gray-200 p-5">
            <p className="text-sm font-black text-gray-500">PYT 판매수</p>
            <p className="mt-3 text-3xl font-black text-black">
              {formatNumber(sellerSummary?.pytSaleCount ?? 0)}
            </p>
          </div>

          <div className="rounded-md border border-gray-200 p-5">
            <p className="text-sm font-black text-gray-500">카드 거래 판매수</p>
            <p className="mt-3 text-3xl font-black text-black">
              {formatNumber(sellerSummary?.cardTradeSaleCount ?? 0)}
            </p>
          </div>

          <div className="rounded-md border border-gray-200 p-5">
            <p className="text-sm font-black text-gray-500">총 판매금액</p>
            <p className="mt-3 text-3xl font-black text-black">
              {formatCurrency(sellerSummary?.totalSalesAmount ?? 0)}
            </p>
          </div>
        </div>

        <div className="mt-4 rounded-md border border-gray-200 p-5">
          <p className="text-base font-black text-black">
            상세 판매내역이 없습니다.
          </p>
          <p className="mt-2 text-sm font-bold text-gray-500">
            PYT와 카드 거래 상세 목록은 준비 중입니다.
          </p>
        </div>
      </div>
    </section>
  );

  const renderActivePanel = () => {
    switch (activePanel) {
      case 'seller-info':
        return renderSellerInfoPanel();
      case 'seller-accounts':
        return renderSellerAccountsPanel();
      case 'seller-sales':
        return renderSellerSalesPanel();
      case 'trade-create':
        return renderTradeCreatePanel();
      case 'pyt-manage':
        return renderEmbeddedPytPanel('manage');
      case 'pyt-create':
        return renderEmbeddedPytPanel('create');
      case 'profile':
      default:
        return renderProfilePanel();
    }
  };

  if (!authState.isChecked || !accessToken) {
    return null;
  }

  return (
    <main className="min-h-[calc(100vh-88px)] bg-[#f6f3ee] px-5 py-10">
      <div className="mx-auto max-w-7xl">
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-black text-[#d71920]">My Page</p>
            <h1 className="mt-2 text-4xl font-black text-black">마이페이지</h1>
          </div>

          <div className="flex flex-wrap gap-2">
            <Link
              href="/"
              className="inline-flex h-11 items-center rounded-md border border-black bg-white px-5 text-sm font-black text-black transition hover:bg-black hover:text-white"
            >
              홈으로
            </Link>
            <button
              type="button"
              onClick={handleLogout}
              className="h-11 rounded-md bg-black px-5 text-sm font-black text-white transition hover:bg-[#d71920]"
            >
              로그아웃
            </button>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-[260px_1fr]">
          <aside className="h-fit rounded-md border border-black bg-white p-4">
            <nav className="space-y-7">
              <div>
                <p className="mb-3 px-2 text-lg font-black text-black">
                  나의 정보
                </p>
                <SidebarButton
                  isActive={activePanel === 'profile'}
                  onClick={() => setActivePanel('profile')}
                >
                  내 정보
                </SidebarButton>
              </div>

              <div>
                <p className="mb-3 px-2 text-lg font-black text-black">셀러</p>
                <div className="space-y-2">
                  <SidebarButton
                    isActive={activePanel === 'seller-info'}
                    onClick={() => setActivePanel('seller-info')}
                  >
                    정보
                  </SidebarButton>

                  {isSeller && (
                    <>
                      <SidebarButton
                        isActive={activePanel === 'seller-accounts'}
                        onClick={() => setActivePanel('seller-accounts')}
                      >
                        계좌 관리
                      </SidebarButton>
                      <SidebarButton
                        isActive={activePanel === 'trade-create'}
                        onClick={() => setActivePanel('trade-create')}
                      >
                        카드 거래 등록
                      </SidebarButton>
                      <SidebarButton
                        isActive={activePanel === 'seller-sales'}
                        onClick={() => setActivePanel('seller-sales')}
                      >
                        판매내역
                      </SidebarButton>
                    </>
                  )}
                </div>
              </div>

              <div>
                <p className="mb-3 px-2 text-lg font-black text-black">PYT</p>
                <div className="space-y-2">
                  {isSeller ? (
                    <>
                      <SidebarButton
                        isActive={activePanel === 'pyt-manage'}
                        onClick={() => setActivePanel('pyt-manage')}
                      >
                        PYT 관리
                      </SidebarButton>
                      <SidebarButton
                        isActive={activePanel === 'pyt-create'}
                        onClick={() => setActivePanel('pyt-create')}
                      >
                        PYT 등록
                      </SidebarButton>
                    </>
                  ) : (
                    <p className="rounded-md bg-[#f1f1f1] px-4 py-3 text-sm font-bold text-gray-500">
                      셀러 승인 후 이용
                    </p>
                  )}
                </div>
              </div>
            </nav>
          </aside>

          <div>
            {profileError && !profile && (
              <div className="mb-4 rounded-md border border-[#d71920] bg-red-50 px-4 py-3 text-sm font-bold text-[#d71920]">
                {profileError}
              </div>
            )}
            {renderActivePanel()}
          </div>
        </div>
      </div>
    </main>
  );
}
