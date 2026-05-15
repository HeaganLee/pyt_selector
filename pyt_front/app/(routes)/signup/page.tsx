'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { FormEvent, useState } from 'react';

export default function SignupPage() {
  const router = useRouter();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [name, setName] = useState('');
  const [nickname, setNickname] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [profileImageUrl, setProfileImageUrl] = useState('');

  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleSignup = async (event: FormEvent<HTMLFormElement>) => {
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

    if (password !== passwordConfirm) {
      setErrorMessage('비밀번호가 서로 일치하지 않습니다.');
      return;
    }

    if (!name.trim()) {
      setErrorMessage('이름을 입력해주세요.');
      return;
    }

    try {
      setIsLoading(true);

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_SERVER_URL}/auth/signup`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email,
            password,
            name,
            nickname,
            phoneNumber,
            profileImageUrl,
          }),
        }
      );

      if (!response.ok) {
        throw new Error('회원가입에 실패했습니다.');
      }

      alert('회원가입이 완료되었습니다.');
      router.push('/login');
    } catch (error) {
      console.error(error);
      setErrorMessage('회원가입에 실패했습니다. 입력 정보를 확인해주세요.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="min-h-[calc(100vh-88px)] bg-[#f6f3ee] px-5 py-16">
      <section className="mx-auto grid max-w-6xl overflow-hidden rounded-[28px] border border-black bg-white shadow-[8px_8px_0_#111] lg:grid-cols-[440px_1fr]">
        <div className="hidden border-r border-black bg-black px-10 py-14 text-white lg:block">
          <p className="text-sm font-black uppercase tracking-[0.3em] text-[#ff4b4b]">
            Join PYT
          </p>

          <h1 className="mt-6 text-5xl font-black leading-tight">
            Create
            <br />
            Account.
          </h1>

          <p className="mt-6 max-w-sm text-base font-semibold leading-7 text-gray-300">
            회원가입 후 발매 예정 상품, 티어표, 체크리스트와 카드 거래 정보를
            더 편하게 확인해보세요.
          </p>

          <div className="mt-12 rounded-2xl border border-white/30 bg-[#111] p-6">
            <p className="text-xs font-black uppercase tracking-[0.25em] text-[#ff4b4b]">
              Account Benefits
            </p>

            <ul className="mt-5 space-y-3 text-sm font-bold text-gray-300">
              <li>· 발매일정 확인</li>
              <li>· 팀별 티어표 확인</li>
              <li>· 제품 체크리스트 이용</li>
              <li>· 카드 거래 기능 이용</li>
            </ul>
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

            <h2 className="mt-8 text-3xl font-black text-black">회원가입</h2>
            <p className="mt-3 text-sm font-bold text-gray-500">
              PYT에서 사용할 계정 정보를 입력해주세요.
            </p>
          </div>

          <form onSubmit={handleSignup} className="space-y-5">
            <div>
              <label className="mb-2 block text-sm font-black text-black">
                이메일 <span className="text-[#d71920]">*</span>
              </label>
              <input
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="example@email.com"
                className="h-14 w-full rounded-md border border-gray-300 bg-[#f1f1f1] px-4 text-base font-bold text-black outline-none transition placeholder:text-gray-400 focus:border-black focus:bg-white"
              />
            </div>

            <div className="grid gap-5 md:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-black text-black">
                  비밀번호 <span className="text-[#d71920]">*</span>
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder="비밀번호"
                  className="h-14 w-full rounded-md border border-gray-300 bg-[#f1f1f1] px-4 text-base font-bold text-black outline-none transition placeholder:text-gray-400 focus:border-black focus:bg-white"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-black text-black">
                  비밀번호 확인 <span className="text-[#d71920]">*</span>
                </label>
                <input
                  type="password"
                  value={passwordConfirm}
                  onChange={(event) => setPasswordConfirm(event.target.value)}
                  placeholder="비밀번호 확인"
                  className="h-14 w-full rounded-md border border-gray-300 bg-[#f1f1f1] px-4 text-base font-bold text-black outline-none transition placeholder:text-gray-400 focus:border-black focus:bg-white"
                />
              </div>
            </div>

            <div className="grid gap-5 md:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-black text-black">
                  이름 <span className="text-[#d71920]">*</span>
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  placeholder="이름"
                  className="h-14 w-full rounded-md border border-gray-300 bg-[#f1f1f1] px-4 text-base font-bold text-black outline-none transition placeholder:text-gray-400 focus:border-black focus:bg-white"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-black text-black">
                  닉네임
                </label>
                <input
                  type="text"
                  value={nickname}
                  onChange={(event) => setNickname(event.target.value)}
                  placeholder="닉네임"
                  className="h-14 w-full rounded-md border border-gray-300 bg-[#f1f1f1] px-4 text-base font-bold text-black outline-none transition placeholder:text-gray-400 focus:border-black focus:bg-white"
                />
              </div>
            </div>

            <div>
              <label className="mb-2 block text-sm font-black text-black">
                전화번호
              </label>
              <input
                type="text"
                value={phoneNumber}
                onChange={(event) => setPhoneNumber(event.target.value)}
                placeholder="010-0000-0000"
                className="h-14 w-full rounded-md border border-gray-300 bg-[#f1f1f1] px-4 text-base font-bold text-black outline-none transition placeholder:text-gray-400 focus:border-black focus:bg-white"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-black text-black">
                프로필 이미지 URL
              </label>
              <input
                type="text"
                value={profileImageUrl}
                onChange={(event) => setProfileImageUrl(event.target.value)}
                placeholder="https://..."
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
              {isLoading ? '가입 중...' : '회원가입'}
            </button>
          </form>

          <div className="mt-8 border-t border-gray-200 pt-6 text-center">
            <p className="text-sm font-bold text-gray-500">
              이미 계정이 있나요?{' '}
              <Link href="/login" className="font-black text-[#d71920]">
                로그인
              </Link>
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}