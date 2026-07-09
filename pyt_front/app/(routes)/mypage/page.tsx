'use client';

import Cookies from 'js-cookie';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

const API_BASE_URL = process.env.NEXT_PUBLIC_SERVER_URL ?? '';

type SellerApplicationStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

interface SellerApplication {
  id: number;
  email: string;
  status: SellerApplicationStatus;
  createdAt: string;
}

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

export default function Mypage() {
  const router = useRouter();
  const accessToken = Cookies.get('accessToken');
  const email = Cookies.get('email') ?? '';
  const nickname = Cookies.get('nickname') ?? '';
  const userRoleType = Cookies.get('userRoleType') ?? '';
  const profileImageUrl = Cookies.get('profileImageUrl') ?? '';

  const [sellerApplication, setSellerApplication] =
    useState<SellerApplication | null>(null);
  const [isSellerApplicationLoading, setIsSellerApplicationLoading] =
    useState(false);
  const [isSellerApplying, setIsSellerApplying] = useState(false);
  const [sellerApplicationMessage, setSellerApplicationMessage] = useState('');
  const [sellerApplicationError, setSellerApplicationError] = useState('');

  const isSeller = userRoleType === 'SELLER';
  const canApplySeller = userRoleType === 'USER';
  const hasPendingSellerApplication =
    sellerApplication?.status === 'PENDING';

  useEffect(() => {
    if (!Cookies.get('accessToken')) {
      router.replace('/login');
    }
  }, [router]);

  useEffect(() => {
    if (!accessToken || !canApplySeller || !email) return;

    const fetchSellerApplication = async () => {
      try {
        setIsSellerApplicationLoading(true);
        setSellerApplicationError('');

        const response = await fetch(
          `${API_BASE_URL}/seller-applications/latest?email=${encodeURIComponent(email)}`
        );

        if (response.status === 204) {
          setSellerApplication(null);
          return;
        }

        if (!response.ok) {
          throw new Error(await response.text());
        }

        const data = (await response.json()) as SellerApplication;
        setSellerApplication(data);
      } catch (error) {
        console.error(error);
        setSellerApplicationError('셀러 신청 상태를 불러오지 못했습니다.');
      } finally {
        setIsSellerApplicationLoading(false);
      }
    };

    fetchSellerApplication();
  }, [accessToken, canApplySeller, email]);

  const handleLogout = () => {
    Cookies.remove('accessToken', { path: '/' });
    Cookies.remove('email', { path: '/' });
    Cookies.remove('name', { path: '/' });
    Cookies.remove('nickname', { path: '/' });
    Cookies.remove('userRoleType', { path: '/' });
    Cookies.remove('profileImageUrl', { path: '/' });
    router.push('/');
  };

  const handleSellerApply = async () => {
    setSellerApplicationMessage('');
    setSellerApplicationError('');

    if (!email) {
      setSellerApplicationError('이메일 정보가 없어 셀러 신청을 할 수 없습니다.');
      return;
    }

    try {
      setIsSellerApplying(true);

      const response = await fetch(`${API_BASE_URL}/seller-applications`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      if (!response.ok) {
        throw new Error(await response.text());
      }

      const data = (await response.json()) as SellerApplication;
      setSellerApplication(data);
      setSellerApplicationMessage('셀러 신청이 접수되었습니다.');
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

  if (!accessToken) {
    return null;
  }

  return (
    <main className="min-h-[calc(100vh-88px)] bg-[#f6f3ee] px-5 py-16">
      <section className="mx-auto max-w-3xl overflow-hidden rounded-[28px] border border-black bg-white shadow-[8px_8px_0_#111]">
        <div className="border-b border-black bg-black px-8 py-10 text-white">
          <p className="text-sm font-black uppercase tracking-[0.3em] text-[#ff4b4b]">
            My Page
          </p>
          <h1 className="mt-4 text-4xl font-black">마이페이지</h1>
        </div>

        <div className="space-y-6 px-8 py-10">
          <div>
            <p className="text-sm font-black text-gray-500">닉네임</p>
            <p className="mt-2 text-2xl font-black text-black">
              {nickname || '닉네임 없음'}
            </p>
          </div>

          <div>
            <p className="text-sm font-black text-gray-500">이메일</p>
            <p className="mt-2 text-lg font-bold text-black">{email}</p>
          </div>

          <div>
            <p className="text-sm font-black text-gray-500">권한</p>
            <p className="mt-2 text-lg font-bold text-black">{userRoleType}</p>
          </div>

          {profileImageUrl && (
            <div>
              <p className="text-sm font-black text-gray-500">프로필 이미지</p>
              <p className="mt-2 break-all text-sm font-bold text-gray-700">
                {profileImageUrl}
              </p>
            </div>
          )}

          {isSeller && (
            <div className="border-t border-gray-200 pt-6">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm font-black text-gray-500">셀러 메뉴</p>
                  <p className="mt-2 text-base font-bold text-black">
                    PYT 브레이크를 등록할 수 있습니다.
                  </p>
                </div>

                <Link
                  href="/pyt/create"
                  className="inline-flex h-12 items-center justify-center rounded-md bg-[#d71920] px-6 text-sm font-black text-white transition hover:bg-black"
                >
                  PYT 등록
                </Link>
              </div>
            </div>
          )}

          {canApplySeller && (
            <div className="border-t border-gray-200 pt-6">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm font-black text-gray-500">셀러 신청</p>
                  <p className="mt-2 text-base font-bold text-black">
                    {sellerApplication
                      ? getSellerApplicationStatusText(sellerApplication.status)
                      : '신청 전'}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={handleSellerApply}
                  disabled={
                    isSellerApplying ||
                    isSellerApplicationLoading ||
                    hasPendingSellerApplication
                  }
                  className="inline-flex h-12 items-center justify-center rounded-md bg-[#d71920] px-6 text-sm font-black text-white transition hover:bg-black disabled:cursor-not-allowed disabled:bg-gray-400"
                >
                  {isSellerApplying
                    ? '신청 중...'
                    : hasPendingSellerApplication
                      ? '신청 완료'
                      : '셀러 신청'}
                </button>
              </div>

              {sellerApplicationMessage && (
                <p className="mt-3 text-sm font-bold text-[#d71920]">
                  {sellerApplicationMessage}
                </p>
              )}

              {sellerApplicationError && (
                <p className="mt-3 text-sm font-bold text-[#d71920]">
                  {sellerApplicationError}
                </p>
              )}
            </div>
          )}

          <div className="flex flex-wrap gap-3 pt-4">
            <Link
              href="/"
              className="inline-flex h-12 items-center rounded-md border border-black px-6 text-sm font-black text-black transition hover:bg-[#f6f3ee]"
            >
              홈으로
            </Link>
            <button
              type="button"
              onClick={handleLogout}
              className="inline-flex h-12 items-center rounded-md bg-black px-6 text-sm font-black text-white transition hover:bg-[#d71920]"
            >
              로그아웃
            </button>
          </div>
        </div>
      </section>
    </main>
  );
}
