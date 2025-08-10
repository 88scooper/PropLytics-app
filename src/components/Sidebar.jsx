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

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden md:flex md:w-64 md:flex-col border-r border-black/10 dark:border-white/10 bg-white dark:bg-neutral-950">
      <div className="px-4 py-4 border-b border-black/10 dark:border-white/10">
        <span className="text-lg font-semibold">Proplytics</span>
      </div>
      <nav className="flex-1 px-2 py-4">
        <ul className="space-y-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href || pathname?.startsWith(item.href + "/");
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={`${
                    isActive
                      ? "bg-black/5 dark:bg-white/10 text-black dark:text-white"
                      : "text-gray-700 dark:text-gray-300 hover:bg-black/5 dark:hover:bg-white/5"
                  } block rounded-md px-3 py-2 text-sm font-medium`}
                >
                  {item.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </aside>
  );
}


