import { Suspense } from 'react';

import TradesPageClient from './TradesPageClient';

export default function TradesPage() {
  return (
    <Suspense
      fallback={
        <main className="min-h-[calc(100vh-88px)] bg-[#f6f3ee] px-5 py-10">
          <div className="mx-auto max-w-7xl text-sm font-bold text-gray-600">
            카드 거래 목록을 불러오는 중입니다.
          </div>
        </main>
      }
    >
      <TradesPageClient />
    </Suspense>
  );
}
