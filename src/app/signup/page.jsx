"use client";

import { useState } from "react";
import Button from "@/components/Button";
import { useToast } from "@/context/ToastContext";
import { useAuth } from "@/context/AuthContext";

export default function SignupPage() {
  const { addToast } = useToast();
  const { signUp } = useAuth();
  const [loading, setLoading] = useState(false);

  async function onSubmit(e) {
    e.preventDefault();
    setLoading(true);
    try {
      const form = new FormData(e.currentTarget);
      const email = String(form.get("email") || "");
      const password = String(form.get("password") || "");
      await signUp(email, password);
      addToast("Account created!", { type: "success" });
    } catch (e) {
      addToast("Sign up failed.", { type: "error" });
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-white text-gray-900 dark:bg-neutral-950 dark:text-gray-100 px-6">
      <div className="w-full max-w-md rounded-xl border border-black/10 dark:border-white/10 bg-white/70 dark:bg-neutral-950/70 backdrop-blur p-6">
        <h1 className="text-2xl font-semibold">Create your account</h1>
        <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">Start managing your portfolio.</p>
        <form onSubmit={onSubmit} className="mt-6 grid gap-4">
          <div className="grid gap-2">
            <label htmlFor="name" className="text-sm">Full name</label>
            <input id="name" name="name" type="text" required className="w-full rounded-md border border-black/15 dark:border-white/15 bg-transparent px-3 py-2 outline-none focus:ring-2 focus:ring-black/20 dark:focus:ring-white/20" />
          </div>
          <div className="grid gap-2">
            <label htmlFor="email" className="text-sm">Email</label>
            <input id="email" name="email" type="email" required className="w-full rounded-md border border-black/15 dark:border-white/15 bg-transparent px-3 py-2 outline-none focus:ring-2 focus:ring-black/20 dark:focus:ring-white/20" />
          </div>
          <div className="grid gap-2">
            <label htmlFor="password" className="text-sm">Password</label>
            <input id="password" name="password" type="password" required className="w-full rounded-md border border-black/15 dark:border-white/15 bg-transparent px-3 py-2 outline-none focus:ring-2 focus:ring-black/20 dark:focus:ring-white/20" />
          </div>
          <Button type="submit" loading={loading} className="mt-2 w-full">Create account</Button>
        </form>
        <p className="mt-4 text-sm text-gray-600 dark:text-gray-300">
          Already have an account? <a href="/login" className="underline">Log in</a>
        </p>
      </div>
    </main>
  );
}


