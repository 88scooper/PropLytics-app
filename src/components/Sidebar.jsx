"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
  { href: "/portfolio-summary", label: "Dashboard" },
  { href: "/my-properties", label: "My Properties" },
  { href: "/data", label: "Data" },
  { href: "/analytics", label: "Analytics" },
  { href: "/calculator", label: "Calculator" },
  { href: "/calendar", label: "Calendar" },
];

export default function Sidebar({ isMobileMenuOpen, setIsMobileMenuOpen }) {
  const pathname = usePathname();

  const handleNavClick = () => {
    // Close mobile menu when navigation link is clicked
    if (setIsMobileMenuOpen) {
      setIsMobileMenuOpen(false);
    }
  };

  return (
    <>
      {/* Mobile Overlay */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}
      
      {/* Sidebar */}
      <aside className={`
        fixed inset-y-0 left-0 z-50 transform transition-transform duration-300 ease-in-out
        md:relative md:translate-x-0 md:z-auto
        ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
        w-64 bg-white dark:bg-neutral-950 border-r border-black/10 dark:border-white/10
        flex flex-col
      `}>
        <div className="px-4 py-4 border-b border-black/10 dark:border-white/10 flex items-center justify-between">
          <span className="text-lg font-semibold">Proplytics</span>
          
          {/* Close Button - Mobile Only */}
          <button
            onClick={() => setIsMobileMenuOpen(false)}
            className="md:hidden p-1 rounded-md hover:bg-black/5 dark:hover:bg-white/5"
            aria-label="Close menu"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <nav className="flex-1 px-2 py-4">
          <ul className="space-y-1">
            {navItems.map((item) => {
              const isActive = pathname === item.href || pathname?.startsWith(item.href + "/");
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    onClick={handleNavClick}
                    className={`${
                      isActive
                        ? "bg-black/5 dark:bg-white/10 text-black dark:text-white"
                        : "text-gray-700 dark:text-gray-300 hover:bg-black/5 dark:hover:bg-white/5"
                    } block rounded-md px-3 py-2 text-sm font-medium transition-colors`}
                  >
                    {item.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
      </aside>
    </>
  );
}


