"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import Sidebar from "@/components/Sidebar";
import { useAuth } from "@/context/AuthContext";
import Button from "@/components/Button";

export default function Layout({ children }) {
  const [isDark, setIsDark] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { user, logOut } = useAuth();

  useEffect(() => {
    const saved = localStorage.getItem("theme");
    const shouldDark = saved ? saved === "dark" : window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches;
    setIsDark(shouldDark);
  }, []);

  useEffect(() => {
    const root = document.documentElement;
    if (isDark) {
      root.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      root.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  }, [isDark]);

  // Close mobile menu when screen size changes to desktop
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) { // md breakpoint
        setIsMobileMenuOpen(false);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div className="min-h-screen bg-white text-gray-900 dark:bg-neutral-950 dark:text-gray-100">
      <div className="flex min-h-screen">
        <Sidebar isMobileMenuOpen={isMobileMenuOpen} setIsMobileMenuOpen={setIsMobileMenuOpen} />
        <div className="flex-1 flex flex-col">
          <header className="sticky top-0 z-10 border-b border-black/10 dark:border-white/10 bg-white/80 dark:bg-neutral-950/80 backdrop-blur">
            <div className="mx-auto max-w-7xl px-4 py-3 flex items-center justify-between">
              <div className="flex items-center gap-3">
                {/* Hamburger Menu Button - Mobile Only */}
                <button
                  onClick={() => setIsMobileMenuOpen(true)}
                  className="md:hidden p-2 rounded-md hover:bg-black/5 dark:hover:bg-white/5"
                  aria-label="Open menu"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                </button>
                
                <Link href="/portfolio-summary" className="font-semibold tracking-tight">
                  Proplytics
                </Link>
              </div>
              
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setIsDark((v) => !v)}
                  className="inline-flex items-center gap-2 rounded-md border border-black/10 dark:border-white/15 px-3 py-1.5 text-sm hover:bg-black/5 dark:hover:bg-white/5"
                  aria-label="Toggle dark mode"
                >
                  {isDark ? "Light" : "Dark"} mode
                </button>
                {user && (
                  <Button onClick={logOut} variant="secondary" className="ml-1">Log out</Button>
                )}
              </div>
            </div>
          </header>
          <main className="mx-auto w-full max-w-7xl px-4 py-6">{children}</main>
        </div>
      </div>
    </div>
  );
}


