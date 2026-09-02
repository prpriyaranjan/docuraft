"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function Header() {
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<{ id: string; name: string; email: string } | null>(null);
  const router = useRouter();

  useEffect(() => {
    const saved = typeof window !== "undefined" ? window.localStorage.getItem("docucraft-token") : null;
    setToken(saved);
  }, []);

  useEffect(() => {
    const fetchUser = async () => {
      if (!token) return setUser(null);

      try {
        const res = await fetch("/api/auth/me", { headers: { Authorization: `Bearer ${token}` } });
        if (!res.ok) throw new Error("Unauthorized");
        const json = await res.json();
        setUser(json.user ?? null);
      } catch {
        setUser(null);
      }
    };

    fetchUser();
  }, [token]);

  const logout = () => {
    if (typeof window !== "undefined") {
      window.localStorage.removeItem("docucraft-token");
    }
    setToken(null);
    setUser(null);
    router.refresh();
  };

  return (
    <header className="border-b border-slate-200 bg-white/80">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-3">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-600 to-cyan-500 text-sm font-bold text-white">D</span>
          <span className="text-xl font-black tracking-tight">DocuCraft</span>
        </Link>

        <nav className="hidden items-center gap-6 text-sm text-slate-600 md:flex">
          <Link href="/gallery">Templates</Link>
          <Link href="/editor/resume-modern-001">Create</Link>
          <Link href="/dashboard">Dashboard</Link>
          <Link href="/payment/success">Orders</Link>
        </nav>

        <div className="flex items-center gap-2">
          {user ? (
            <div className="flex items-center gap-3">
              <div className="text-sm text-slate-700">Hi, <span className="font-semibold">{user.name}</span></div>
              <button onClick={logout} className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-sm text-slate-600">Logout</button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link href="/" className="hidden rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 sm:inline-flex">Log in</Link>
              <Link href="/editor/resume-modern-001" className="rounded-full bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-indigo-200 transition hover:bg-indigo-500">Create Resume</Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
