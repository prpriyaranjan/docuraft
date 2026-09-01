"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { templates } from "@/data/templates";
import { buildAuthPayload, getAuthEndpoint, type AuthMode } from "@/lib/auth-ui";

const categories = [
  "Resume",
  "Marriage Biodata",
  "Cover Letter",
  "Portfolio",
  "Professional Bio",
  "Letters",
];

const steps = [
  { title: "Choose a template", description: "Pick a resume, biodata, or cover letter design that fits your goals." },
  { title: "Fill your details", description: "Add your information and preview the final layout in real time." },
  { title: "Pay and download", description: "Pay a small amount after previewing, then download your polished document." },
];

const benefits = [
  "Mobile-first, Android-friendly workflow",
  "₹5 and ₹10 pay-per-download pricing",
  "Secure flow designed for later Razorpay integration",
  "Reusable document engine for future categories",
];

const faqs = [
  { question: "Can I preview before paying?", answer: "Yes. You can fully edit and preview your document before any payment is required." },
  { question: "How much does it cost?", answer: "Most templates are ₹5, while premium templates are ₹10." },
  { question: "Do I need an account?", answer: "No. Guest users can create and test documents before saving or paying." },
  { question: "Can I add more categories later?", answer: "Yes. The template system is config-driven, making it easy to add more document types over time." },
];

export default function HomePage() {
  const featuredTemplates = templates.slice(0, 6);
  const [showAuth, setShowAuth] = useState(false);
  const [authMode, setAuthMode] = useState<AuthMode>("login");
  const [authForm, setAuthForm] = useState({ name: "", email: "", password: "" });
  const [authError, setAuthError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [user, setUser] = useState<{ id: string; name: string; email: string } | null>(null);

  useEffect(() => {
    const loadUser = async () => {
      try {
        const token = typeof window !== "undefined" ? window.localStorage.getItem("docucraft-token") : null;
        if (!token) return setUser(null);

        const resp = await fetch("/api/auth/me", {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!resp.ok) {
          window.localStorage.removeItem("docucraft-token");
          return setUser(null);
        }

        const json = await resp.json();
        setUser(json.user ?? null);
      } catch {
        setUser(null);
      }
    };

    loadUser();

    const handler = () => loadUser();
    window.addEventListener("docucraft:auth-change", handler);
    return () => window.removeEventListener("docucraft:auth-change", handler);
  }, []);

  const [showProfileMenu, setShowProfileMenu] = useState(false);

  const handleLogout = () => {
    try {
      window.localStorage.removeItem("docucraft-token");
    } catch {}
    setUser(null);
    try {
      window.dispatchEvent(new Event("docucraft:auth-change"));
    } catch {}
    setShowProfileMenu(false);
  };

  const handleAuthSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    try {
      setAuthError("");
      setIsSubmitting(true);

      const endpoint = getAuthEndpoint(authMode);
      const payload = buildAuthPayload(authMode, authForm);

      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result?.error ?? "Authentication failed");
      }

      if (!result?.token) {
        throw new Error("Authentication token missing");
      }

      window.localStorage.setItem("docucraft-token", result.token);
      setShowAuth(false);
      setAuthForm({ name: "", email: "", password: "" });

      // fetch current user and update UI
      try {
        const meResp = await fetch("/api/auth/me", { headers: { Authorization: `Bearer ${result.token}` } });
        if (meResp.ok) {
          const meJson = await meResp.json();
          setUser(meJson.user ?? null);
        }
      } catch {
        // ignore
      }

      // notify other components (e.g., PaymentFlow) about auth change
      try {
        window.dispatchEvent(new Event("docucraft:auth-change"));
      } catch {}
    } catch (error) {
      setAuthError(error instanceof Error ? error.message : "Authentication failed");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      <header className="border-b border-slate-200 bg-white/80 backdrop-blur-sm">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
          <Link href="/" className="flex items-center gap-3">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-600 to-cyan-500 text-sm font-bold text-white">
              D
            </span>
            <span className="text-xl font-black tracking-tight">DocuCraft</span>
          </Link>

          <nav className="hidden items-center gap-6 text-sm text-slate-600 md:flex">
            <Link href="#categories">Categories</Link>
            <Link href="#templates">Templates</Link>
            <Link href="#how-it-works">How it works</Link>
            <Link href="#pricing">Pricing</Link>
            <Link href="#faq">FAQ</Link>
          </nav>

          <div className="flex items-center gap-2">
            {user ? (
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setShowProfileMenu((s) => !s)}
                  className="hidden items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 sm:inline-flex"
                >
                  {user.name}
                </button>
                {showProfileMenu ? (
                  <div className="absolute right-0 mt-2 w-48 rounded-xl border border-slate-200 bg-white shadow-lg">
                    <div className="flex flex-col p-2">
                      <Link href="/my-documents" className="rounded px-3 py-2 text-sm text-slate-700 hover:bg-slate-50">
                        My documents
                      </Link>
                      <button onClick={handleLogout} className="mt-1 rounded px-3 py-2 text-sm text-slate-700 hover:bg-slate-50 text-left">
                        Logout
                      </button>
                    </div>
                  </div>
                ) : null}
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setShowAuth(true)}
                className="hidden rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 sm:inline-flex"
              >
                Log in
              </button>
            )}

            <Link href="/editor/resume-modern-001" className="rounded-full bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-indigo-200 transition hover:bg-indigo-500">
              Create Resume
            </Link>
          </div>
        </div>
      </header>

      {showAuth ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4">
          <div className="w-full max-w-md rounded-[28px] border border-slate-200 bg-white p-6 shadow-2xl">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-indigo-600">Account required</p>
                <h3 className="mt-1 text-2xl font-bold text-slate-900">
                  {authMode === "register" ? "Create account" : "Login"}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => {
                  setShowAuth(false);
                  setAuthError("");
                }}
                className="rounded-full border border-slate-200 px-3 py-1.5 text-sm text-slate-600"
              >
                Close
              </button>
            </div>

            <div className="mb-4 flex rounded-full border border-slate-200 bg-slate-50 p-1">
              <button
                type="button"
                onClick={() => setAuthMode("register")}
                className={`flex-1 rounded-full px-3 py-2 text-sm font-semibold ${
                  authMode === "register" ? "bg-indigo-600 text-white" : "text-slate-600"
                }`}
              >
                Create account
              </button>
              <button
                type="button"
                onClick={() => setAuthMode("login")}
                className={`flex-1 rounded-full px-3 py-2 text-sm font-semibold ${
                  authMode === "login" ? "bg-indigo-600 text-white" : "text-slate-600"
                }`}
              >
                Login
              </button>
            </div>

            <form onSubmit={handleAuthSubmit} className="space-y-3">
              {authMode === "register" ? (
                <label className="block text-sm text-slate-700">
                  <span className="mb-1 block">Name</span>
                  <input
                    value={authForm.name}
                    onChange={(event) => setAuthForm((prev) => ({ ...prev, name: event.target.value }))}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-slate-800 outline-none focus:border-indigo-500"
                    placeholder="Your name"
                  />
                </label>
              ) : null}

              <label className="block text-sm text-slate-700">
                <span className="mb-1 block">Email</span>
                <input
                  type="email"
                  value={authForm.email}
                  onChange={(event) => setAuthForm((prev) => ({ ...prev, email: event.target.value }))}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-slate-800 outline-none focus:border-indigo-500"
                  placeholder="you@example.com"
                  required
                />
              </label>

              <label className="block text-sm text-slate-700">
                <span className="mb-1 block">Password</span>
                <input
                  type="password"
                  value={authForm.password}
                  onChange={(event) => setAuthForm((prev) => ({ ...prev, password: event.target.value }))}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-slate-800 outline-none focus:border-indigo-500"
                  placeholder="********"
                  minLength={6}
                  required
                />
              </label>

              {authError ? <div className="rounded-xl border border-red-200 bg-red-50 p-2 text-sm text-red-700">{authError}</div> : null}

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full rounded-full bg-indigo-600 px-5 py-3 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:bg-slate-400"
              >
                {isSubmitting ? "Please wait..." : authMode === "register" ? "Create account & continue" : "Login & continue"}
              </button>
            </form>
          </div>
        </div>
      ) : null}

      <section className="mx-auto max-w-7xl px-4 pb-12 pt-10 sm:px-6 lg:px-8 lg:pb-20 lg:pt-16">
        <div className="grid items-center gap-10 lg:grid-cols-[1.15fr_0.85fr]">
          <div>
            <div className="mb-5 inline-flex rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-emerald-700">
              Built for Indian users
            </div>

            <h1 className="max-w-xl text-4xl font-black tracking-[-0.06em] text-slate-950 sm:text-5xl lg:text-6xl">
              Create Your Perfect Document in Minutes
            </h1>

            <p className="mt-5 max-w-xl text-lg leading-8 text-slate-600">
              Professional resumes, marriage biodatas and more — choose a template, fill your details, preview and download.
            </p>

            <div className="mt-7 flex flex-col gap-3 sm:flex-row">
              <Link href="/editor/resume-modern-001" className="rounded-full bg-indigo-600 px-6 py-3 text-center text-sm font-semibold text-white shadow-lg shadow-indigo-200 transition hover:bg-indigo-500">
                Create Resume
              </Link>
              <Link href="/editor/biodata-indian-008" className="rounded-full border border-slate-200 bg-white px-6 py-3 text-center text-sm font-semibold text-slate-700 transition hover:bg-slate-100">
                Create Marriage Biodata
              </Link>
            </div>

            <div className="mt-8 flex flex-wrap gap-6 text-sm text-slate-600">
              <div>
                <span className="block text-2xl font-black text-slate-950">10k+</span>
                documents created
              </div>
              <div>
                <span className="block text-2xl font-black text-slate-950">₹5</span>
                standard templates
              </div>
              <div>
                <span className="block text-2xl font-black text-slate-950">₹10</span>
                premium templates
              </div>
            </div>
          </div>

          <div className="rounded-[30px] border border-slate-200 bg-white p-4 shadow-[0_18px_60px_rgba(15,23,42,0.08)] md:p-6">
            <div className="rounded-[26px] bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-900 p-5 text-white">
              <div className="mb-5 flex items-center justify-between text-xs uppercase tracking-[0.18em] text-slate-300">
                <span>Template preview</span>
                <span>Live</span>
              </div>

              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <div className="mb-4 flex items-center gap-3">
                  <div className="h-12 w-12 rounded-full bg-gradient-to-br from-indigo-400 to-cyan-300" />
                  <div>
                    <div className="font-bold">Aarav Sharma</div>
                    <div className="text-xs text-slate-300">Product Manager</div>
                  </div>
                </div>

                <div className="grid gap-3 text-sm text-slate-200">
                  <div className="flex justify-between"><span>Experience</span><span className="font-medium text-white">5+ years</span></div>
                  <div className="flex justify-between"><span>Skills</span><span className="font-medium text-white">UX, SQL</span></div>
                  <div className="flex justify-between"><span>Status</span><span className="font-medium text-emerald-300">Ready to apply</span></div>
                </div>
              </div>

              <div className="mt-5 grid grid-cols-3 gap-3 text-center text-xs">
                <div className="rounded-xl bg-white/5 p-3"><span className="block text-lg font-bold text-white">12</span> templates</div>
                <div className="rounded-xl bg-white/5 p-3"><span className="block text-lg font-bold text-white">₹5</span> starts</div>
                <div className="rounded-xl bg-white/5 p-3"><span className="block text-lg font-bold text-white">PDF</span> export</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="categories" className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-6 text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-indigo-600">Popular categories</p>
          <h2 className="mt-2 text-3xl font-black tracking-[-0.05em] text-slate-950">Create any professional document</h2>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
          {categories.map((category) => (
            <div key={category} className="rounded-[20px] border border-slate-200 bg-white p-4 text-center shadow-sm">
              <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-50 text-xl text-indigo-600">
                {category.slice(0, 1)}
              </div>
              <div className="text-sm font-semibold text-slate-800">{category}</div>
            </div>
          ))}
        </div>
      </section>

      <section id="templates" className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="mb-6 flex items-end justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-indigo-600">Template gallery</p>
            <h2 className="mt-2 text-3xl font-black tracking-[-0.05em] text-slate-950">Popular picks</h2>
          </div>
          <Link href="/gallery" className="text-sm font-semibold text-indigo-600 hover:text-indigo-500">
            Browse more →
          </Link>
        </div>

        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {featuredTemplates.map((template) => (
            <article key={template.id} className="overflow-hidden rounded-[26px] border border-slate-200 bg-white shadow-sm">
              <Image
                src={template.thumbnail}
                alt={template.name}
                width={1200}
                height={800}
                className="h-48 w-full object-cover"
                unoptimized
              />
              <div className="p-4">
                <div className="mb-2 flex items-center justify-between">
                  <span className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">{template.category}</span>
                  <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-700">₹{template.price}</span>
                </div>
                <h3 className="text-xl font-bold text-slate-900">{template.name}</h3>
                <p className="mt-2 text-sm leading-6 text-slate-600">{template.description}</p>
                <Link href={`/editor/${template.id}`} className="mt-4 inline-flex rounded-full bg-indigo-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-indigo-500">
                  Use template
                </Link>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section id="how-it-works" className="bg-white py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-8 text-center">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-indigo-600">How it works</p>
            <h2 className="mt-2 text-3xl font-black tracking-[-0.05em] text-slate-950">Simple, fast, and mobile-first</h2>
          </div>

          <div className="grid gap-5 md:grid-cols-3">
            {steps.map((step, index) => (
              <div key={step.title} className="rounded-[24px] border border-slate-200 bg-slate-50 p-6">
                <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-full bg-indigo-600 text-sm font-bold text-white">
                  {index + 1}
                </div>
                <h3 className="mb-2 text-xl font-bold text-slate-900">{step.title}</h3>
                <p className="leading-7 text-slate-600">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-6 lg:grid-cols-2">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-indigo-600">Why choose us</p>
            <h2 className="mt-2 text-3xl font-black tracking-[-0.05em] text-slate-950">A clean product built for real document needs</h2>
          </div>

          <div className="grid gap-4">
            {benefits.map((item) => (
              <div key={item} className="flex items-start gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                <span className="mt-1 flex h-6 w-6 items-center justify-center rounded-full bg-emerald-100 text-xs font-bold text-emerald-700">✓</span>
                <span className="text-slate-700">{item}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="pricing" className="bg-slate-900 py-16 text-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-8 text-center">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-cyan-300">Pricing</p>
            <h2 className="mt-2 text-3xl font-black tracking-[-0.05em] text-white">Simple pricing, no subscriptions</h2>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <div className="rounded-[28px] border border-slate-700 bg-slate-800 p-7">
              <p className="text-sm uppercase tracking-[0.2em] text-slate-300">Standard</p>
              <div className="mt-4 text-4xl font-black">₹5</div>
              <p className="mt-2 text-slate-300">For normal templates and everyday documents.</p>
            </div>

            <div className="rounded-[28px] border border-indigo-500 bg-indigo-600 p-7 shadow-lg shadow-indigo-500/30">
              <p className="text-sm uppercase tracking-[0.2em] text-indigo-100">Premium</p>
              <div className="mt-4 text-4xl font-black">₹10</div>
              <p className="mt-2 text-indigo-100">For premium designs and more polished professional use cases.</p>
            </div>
          </div>
        </div>
      </section>

      <section id="faq" className="mx-auto max-w-5xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="mb-8 text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-indigo-600">FAQ</p>
          <h2 className="mt-2 text-3xl font-black tracking-[-0.05em] text-slate-950">Everything you need to know</h2>
        </div>

        <div className="space-y-4">
          {faqs.map((faq) => (
            <div key={faq.question} className="rounded-[22px] border border-slate-200 bg-white p-5 shadow-sm">
              <h3 className="text-lg font-bold text-slate-900">{faq.question}</h3>
              <p className="mt-2 leading-7 text-slate-600">{faq.answer}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 pb-20 sm:px-6 lg:px-8">
        <div className="rounded-[30px] bg-gradient-to-r from-indigo-600 to-cyan-500 p-8 text-white shadow-xl shadow-indigo-200">
          <div className="flex flex-col items-start justify-between gap-4 lg:flex-row lg:items-center">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-indigo-100">Ready?</p>
              <h2 className="mt-2 text-3xl font-black tracking-[-0.05em]">Start building your next document today.</h2>
            </div>
            <Link href="/gallery" className="rounded-full bg-white px-5 py-3 text-sm font-semibold text-indigo-600 transition hover:bg-slate-100">
              Explore templates
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
