import Link from 'next/link';

const footerMenus = [
  {
    title: 'PYT',
    links: [
      { label: '전체', href: '/products' },
      { label: 'MLB', href: '/products?league=MLB' },
      { label: 'NBA', href: '/products?league=NBA' },
      { label: 'NFL', href: '/products?league=NFL' },
      { label: 'NHL', href: '/products?league=NHL' },
      { label: 'MLS', href: '/products?league=MLS' },
    ],
  },
  {
    title: '티어표',
    links: [
      { label: '전체', href: '/tiers' },
      { label: 'MLB', href: '/tiers?league=MLB' },
      { label: 'NBA', href: '/tiers?league=NBA' },
      { label: 'NFL', href: '/tiers?league=NFL' },
      { label: 'NHL', href: '/tiers?league=NHL' },
      { label: 'MLS', href: '/tiers?league=MLS' },
    ],
  },
  {
    title: '발매일정',
    links: [
      { label: '전체', href: '/release-calendar' },
      { label: 'MLB', href: '/release-calendar?league=MLB' },
      { label: 'NBA', href: '/release-calendar?league=NBA' },
      { label: 'NFL', href: '/release-calendar?league=NFL' },
      { label: 'NHL', href: '/release-calendar?league=NHL' },
      { label: 'MLS', href: '/release-calendar?league=MLS' },
    ],
  },
  {
    title: 'Service',
    links: [
      { label: '제품 체크리스트', href: '/checklists' },
      { label: '카드 거래', href: '/trades' },
      { label: '커뮤니티', href: '/community' },
      { label: '카드가격', href: '/prices' },
    ],
  },
];

export default function Footer() {
  return (
    <footer className="border-t border-gray-200 bg-white text-black">
      <div className="mx-auto max-w-[1920px] px-10 py-14">
        <div className="grid gap-12 lg:grid-cols-[360px_1fr]">
          <div>
            <Link
              href="/"
              className="inline-flex items-center"
              aria-label="메인 페이지로 이동"
            >
              <span className="text-[44px] font-black italic leading-none tracking-[-0.08em] text-[#d71920]">
                pyt
              </span>
            </Link>

            <p className="mt-6 max-w-[300px] text-sm font-bold leading-6 text-gray-600">
              스포츠 카드 발매일정, 티어표, 제품 체크리스트와 카드 거래 정보를
              한 곳에서 확인하세요.
            </p>

            <div className="mt-8 inline-flex rounded-md bg-[#f1f1f1] px-4 py-3">
              <p className="text-xs font-black uppercase tracking-[0.2em] text-gray-500">
                Sports Card Board
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
            {footerMenus.map((menu) => (
              <div key={menu.title}>
                <h3 className="mb-5 text-[15px] font-black text-black">
                  {menu.title}
                </h3>

                <ul className="space-y-3">
                  {menu.links.map((link) => (
                    <li key={link.href}>
                      <Link
                        href={link.href}
                        className="text-sm font-bold text-gray-500 transition hover:text-[#d71920]"
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-14 flex flex-col gap-4 border-t border-gray-200 pt-6 text-xs font-bold text-gray-500 md:flex-row md:items-center md:justify-between">
          <p>© {new Date().getFullYear()} PYT. All rights reserved.</p>

          <div className="flex flex-wrap gap-x-6 gap-y-2">
            <Link href="/terms" className="transition hover:text-[#d71920]">
              이용약관
            </Link>
            <Link href="/privacy" className="transition hover:text-[#d71920]">
              개인정보처리방침
            </Link>
            <Link href="/contact" className="transition hover:text-[#d71920]">
              문의하기
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}