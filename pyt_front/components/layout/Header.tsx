'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const leagueItems = [
  { label: '전체', href: '/products' },
  { label: 'MLB', href: '/products?league=MLB' },
  { label: 'NBA', href: '/products?league=NBA' },
  { label: 'NFL', href: '/products?league=NFL' },
  { label: 'NHL', href: '/products?league=NHL' },
  { label: 'MLS', href: '/products?league=MLS' },
];

const navItems = [
  {
    label: 'PYT',
    href: '/',
    children: leagueItems,
  },
  {
    label: '티어표',
    href: '/tiers',
    children: [
      { label: '전체', href: '/tiers' },
      { label: 'MLB', href: '/tiers?league=MLB' },
      { label: 'NBA', href: '/tiers?league=NBA' },
      { label: 'NFL', href: '/tiers?league=NFL' },
      { label: 'NHL', href: '/tiers?league=NHL' },
      { label: 'MLS', href: '/tiers?league=MLS' },
    ],
  },
  {
    label: '제품 체크리스트',
    href: '/checklists',
  },
  {
    label: '발매일정',
    href: '/release-calendar',
    children: [
      { label: '전체', href: '/release-calendar' },
      { label: 'MLB', href: '/release-calendar?league=MLB' },
      { label: 'NBA', href: '/release-calendar?league=NBA' },
      { label: 'NFL', href: '/release-calendar?league=NFL' },
      { label: 'NHL', href: '/release-calendar?league=NHL' },
      { label: 'MLS', href: '/release-calendar?league=MLS' },
    ],
  },
  {
    label: '카드 거래',
    href: '/trades',
  },
];

function ChevronDownIcon() {
  return (
    <svg
      className="h-4 w-4"
      viewBox="0 0 20 20"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M5 7.5L10 12.5L15 7.5"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function SearchIcon() {
  return (
    <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M11 19C15.4183 19 19 15.4183 19 11C19 6.58172 15.4183 3 11 3C6.58172 3 3 6.58172 3 11C3 15.4183 6.58172 19 11 19Z"
        stroke="currentColor"
        strokeWidth="2.4"
      />
      <path
        d="M16.8 16.8L21 21"
        stroke="currentColor"
        strokeWidth="2.4"
        strokeLinecap="round"
      />
    </svg>
  );
}

function UserIcon() {
  return (
    <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M12 12C14.2091 12 16 10.2091 16 8C16 5.79086 14.2091 4 12 4C9.79086 4 8 5.79086 8 8C8 10.2091 9.79086 12 12 12Z"
        stroke="currentColor"
        strokeWidth="2.3"
      />
      <path
        d="M5 21C5.8 16.8 8.4 15 12 15C15.6 15 18.2 16.8 19 21"
        stroke="currentColor"
        strokeWidth="2.3"
        strokeLinecap="round"
      />
    </svg>
  );
}

function CartIcon() {
  return (
    <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M4 5H6L8.4 16.2C8.5 16.7 8.9 17 9.4 17H18.3C18.8 17 19.2 16.7 19.4 16.2L21 9H7"
        stroke="currentColor"
        strokeWidth="2.3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M10 21H10.01M18 21H18.01"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
      />
    </svg>
  );
}

export default function Header() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-50 border-b border-gray-200 bg-white">
      <div className="mx-auto flex h-[88px] max-w-[1920px] items-center px-10">
        <Link
          href="/"
          className="mr-10 flex shrink-0 items-center"
          aria-label="메인 페이지로 이동"
        >
          <span className="text-[34px] font-black italic leading-none tracking-[-0.08em] text-[#d71920]">
            pyt
          </span>
        </Link>

        <nav className="hidden h-full items-center gap-10 lg:flex">
          {navItems.map((item) => {
            const isActive =
              item.href === '/'
                ? pathname === '/'
                : pathname.startsWith(item.href);

            return (
              <div key={item.href} className="group relative flex h-full items-center">
                <Link
                  href={item.href}
                  className={`flex items-center gap-2 text-[18px] font-black transition hover:text-[#d71920] ${
                    isActive ? 'text-[#d71920]' : 'text-[#171717]'
                  }`}
                >
                  {item.label}

                  {item.children && <ChevronDownIcon />}
                </Link>

                {item.children && (
                  <div className="invisible absolute left-0 top-full min-w-[190px] translate-y-3 border border-gray-200 bg-white py-3 opacity-0 shadow-[0_12px_30px_rgba(0,0,0,0.12)] transition group-hover:visible group-hover:translate-y-0 group-hover:opacity-100">
                    {item.children.map((child) => (
                      <Link
                        key={child.href}
                        href={child.href}
                        className="block px-5 py-3 text-sm font-extrabold text-black transition hover:bg-[#f2f2f2] hover:text-[#d71920]"
                      >
                        {child.label}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </nav>

        <div className="ml-auto hidden items-center gap-8 lg:flex">
          <label className="flex h-[56px] w-[380px] items-center gap-4 rounded-md bg-[#f1f1f1] px-5 text-[#111]">
            <SearchIcon />
            <input
              type="text"
              placeholder="Search"
              className="w-full bg-transparent text-[20px] font-black outline-none placeholder:text-gray-500"
            />
          </label>

          <button
            type="button"
            className="text-black transition hover:text-[#d71920]"
            aria-label="마이페이지"
          >
            <UserIcon />
          </button>

          <button
            type="button"
            className="text-black transition hover:text-[#d71920]"
            aria-label="장바구니"
          >
            <CartIcon />
          </button>
        </div>

        <button
          type="button"
          className="ml-auto inline-flex rounded-md border border-black px-4 py-2 text-sm font-black lg:hidden"
        >
          MENU
        </button>
      </div>

      <nav className="flex gap-3 overflow-x-auto border-t border-gray-200 px-5 py-3 lg:hidden">
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="shrink-0 rounded-full bg-[#f1f1f1] px-4 py-2 text-sm font-black text-black"
          >
            {item.label}
          </Link>
        ))}
      </nav>
    </header>
  );
}