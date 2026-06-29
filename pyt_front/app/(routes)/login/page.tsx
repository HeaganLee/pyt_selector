'use client';

import Cookies from 'js-cookie';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { FormEvent, useState } from 'react';

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleLogin = async (event: FormEvent<HTMLFormElement>) => {
  event.preventDefault();
  setErrorMessage('');

  if (!email.trim()) {
    setErrorMessage('이메일을 입력해주세요.');
    return;
  }

  if (!password.trim()) {
    setErrorMessage('비밀번호를 입력해주세요.');
    return;
  }

  try {
    setIsLoading(true);

    const response = await fetch(
      `${process.env.NEXT_PUBLIC_SERVER_URL}/auth/login`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          password,
        }),
      }
    );

    if (!response.ok) {
      throw new Error('로그인에 실패했습니다.');
    }

    const result = await response.json();

    Cookies.set('accessToken', result.accessToken, {
      expires: 1,
      path: '/',
    });

    Cookies.set('email', result.email, {
      expires: 1,
      path: '/',
    });

    Cookies.set('name', result.name ?? '', {
      expires: 1,
      path: '/',
    });

    Cookies.set('nickname', result.nickname ?? '', {
      expires: 1,
      path: '/',
    });

    Cookies.set('userRoleType', result.userRoleType, {
      expires: 1,
      path: '/',
    });

    Cookies.set('profileImageUrl', result.profileImageUrl ?? '', {
      expires: 1,
      path: '/',
    });

    router.push('/');
  } catch (error) {
    console.error(error);
    setErrorMessage('이메일 또는 비밀번호를 확인해주세요.');
  } finally {
    setIsLoading(false);
  }
};

  return (
    <main className="min-h-[calc(100vh-88px)] bg-[#f6f3ee] px-5 py-16">
      <section className="mx-auto grid max-w-6xl overflow-hidden rounded-[28px] border border-black bg-white shadow-[8px_8px_0_#111] lg:grid-cols-[1fr_480px]">
        <div className="hidden border-r border-black bg-black px-10 py-14 text-white lg:block">
          <p className="text-sm font-black uppercase tracking-[0.3em] text-[#ff4b4b]">
            PYT Account
          </p>

          <h1 className="mt-6 text-5xl font-black leading-tight">
            Welcome
            <br />
            Back.
          </h1>

          <p className="mt-6 max-w-sm text-base font-semibold leading-7 text-gray-300">
            스포츠 카드 발매일정, 티어표, 제품 체크리스트와 카드 거래 정보를
            확인하려면 로그인해주세요.
          </p>

          <div className="mt-12 rounded-2xl border border-white/30 bg-[#111] p-6">
            <p className="text-xs font-black uppercase tracking-[0.25em] text-[#ff4b4b]">
              Sports Card Board
            </p>
            <p className="mt-4 text-3xl font-black">PYT</p>
            <p className="mt-2 text-sm font-bold text-gray-400">
              Release · Tier · Checklist · Trade
            </p>
          </div>
        </div>

        <div className="px-7 py-10 sm:px-10 lg:px-12 lg:py-14">
          <div className="mb-10">
            <Link
              href="/"
              className="inline-flex text-[36px] font-black italic leading-none tracking-[-0.08em] text-[#d71920]"
            >
              pyt
            </Link>

            <h2 className="mt-8 text-3xl font-black text-black">로그인</h2>
            <p className="mt-3 text-sm font-bold text-gray-500">
              계정 정보를 입력하고 서비스를 이용해보세요.
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="mb-2 block text-sm font-black text-black">
                이메일
              </label>
              <input
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="example@email.com"
                className="h-14 w-full rounded-md border border-gray-300 bg-[#f1f1f1] px-4 text-base font-bold text-black outline-none transition placeholder:text-gray-400 focus:border-black focus:bg-white"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-black text-black">
                비밀번호
              </label>
              <input
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="비밀번호를 입력해주세요"
                className="h-14 w-full rounded-md border border-gray-300 bg-[#f1f1f1] px-4 text-base font-bold text-black outline-none transition placeholder:text-gray-400 focus:border-black focus:bg-white"
              />
            </div>

            {errorMessage && (
              <div className="rounded-md border border-[#d71920] bg-red-50 px-4 py-3 text-sm font-bold text-[#d71920]">
                {errorMessage}
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="h-14 w-full rounded-md bg-black text-base font-black text-white transition hover:bg-[#d71920] disabled:cursor-not-allowed disabled:bg-gray-400"
            >
              {isLoading ? '로그인 중...' : '로그인'}
            </button>
          </form>

          <div className="mt-8 border-t border-gray-200 pt-6 text-center">
            <p className="text-sm font-bold text-gray-500">
              아직 계정이 없나요?{' '}
              <Link href="/signup" className="font-black text-[#d71920]">
                회원가입
              </Link>
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
