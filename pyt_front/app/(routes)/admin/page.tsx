import { Suspense } from 'react';

import AdminPageClient from './AdminPageClient';

export default function AdminPage() {
  return (
    <Suspense
      fallback={
        <main className="min-h-[calc(100vh-88px)] bg-[#f5f5f5] px-5 py-10">
          <div className="mx-auto max-w-7xl text-sm font-bold text-gray-600">
            관리자 페이지를 불러오는 중입니다.
          </div>
        </main>
      }
    >
      <AdminPageClient />
    </Suspense>
  );
}
