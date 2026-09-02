"use client";

import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { buildAuthPayload, getAuthEndpoint } from "@/lib/auth-ui";
import { buildUpiPaymentLink, buildUpiQrCodeUrl, SELLER_UPI_ID } from "@/lib/payment";

export function PaymentFlow({
  templateId,
  amount,
  onVerify,
}: {
  templateId: string;
  amount: number;
  onVerify: (result: { verified: boolean; downloadToken?: string }) => void;
}) {
  const router = useRouter();
  const [status, setStatus] = useState<"idle" | "processing" | "verified" | "paid">("idle");
  const [paymentId, setPaymentId] = useState("");
  const [copyState, setCopyState] = useState<"idle" | "copied">("idle");
  const [showAuth, setShowAuth] = useState(false);
  const [authMode, setAuthMode] = useState<"login" | "register">("register");
  const [authForm, setAuthForm] = useState({ name: "", email: "", password: "" });
  const [authError, setAuthError] = useState("");
  const [authSuccess, setAuthSuccess] = useState("");
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    const saved = typeof window !== "undefined" ? window.localStorage.getItem("docucraft-token") : null;
    setToken(saved);
  }, []);

  const upiLink = useMemo(
    () => buildUpiPaymentLink({
      amount,
      templateName: templateId.replace(/-/g, " "),
      orderId: `docucraft-${templateId}-${Date.now()}`,
    }),
    [amount, templateId],
  );

  const qrCodeUrl = useMemo(
    () => buildUpiQrCodeUrl({
      amount,
      templateName: templateId.replace(/-/g, " "),
      orderId: `docucraft-${templateId}-${Date.now()}`,
    }),
    [amount, templateId],
  );

  const handleCopyUpiId = async () => {
    try {
      await navigator.clipboard.writeText(SELLER_UPI_ID);
      setCopyState("copied");
      window.setTimeout(() => setCopyState("idle"), 1500);
    } catch {
      setCopyState("idle");
    }
  };

  const persistToken = (nextToken: string) => {
    window.localStorage.setItem("docucraft-token", nextToken);
    setToken(nextToken);
  };

  const authenticateUser = async () => {
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

    persistToken(result.token);
    setShowAuth(false);
    setAuthError("");
    setAuthSuccess(authMode === "register" ? "Account created successfully" : "Logged in successfully");
    // Refresh next.js data so Header sees the new user immediately
    try {
      router.refresh();
    } catch {
      // ignore
    }
    return result.token as string;
  };

  const completePayment = async () => {
    // Start payment by generating an id and opening the UPI app/QR.
    // Actual verification is performed separately by `verifyPayment`.
    const nextPaymentId = `upi_${Date.now()}`;
    setPaymentId(nextPaymentId);
    setStatus("processing");

    try {
      // Open the UPI link in a new tab/window so we don't navigate away from the app.
      if (typeof window !== "undefined") {
        window.open(upiLink, "_blank");
      }
    } catch (err) {
      // ignore open failures; user can still copy UPI ID and use their app.
      console.error(err);
    }
  };

  const verifyPayment = async (userToken: string) => {
    if (!paymentId) return;
    setStatus("processing");

    try {
      const response = await fetch("/api/payments", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${userToken}`,
        },
        body: JSON.stringify({
          templateId,
          amount,
          paymentId,
        }),
      });

      if (!response.ok) {
        throw new Error("Payment verification failed");
      }

      const result = await response.json();

      if (result?.verified) {
        const orderResponse = await fetch("/api/orders", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${userToken}`,
          },
          body: JSON.stringify({
            templateId,
            amount,
            paymentId: result.paymentId,
            status: "paid",
          }),
        });

        if (!orderResponse.ok) {
          throw new Error("Order creation failed");
        }

        setStatus("paid");
        onVerify({ verified: true, downloadToken: result.downloadToken });
        router.push(`/payment/success?templateId=${templateId}&amount=${amount}`);
      } else {
        setStatus("idle");
      }
    } catch (error) {
      setStatus("idle");
      console.error(error instanceof Error ? error.message : error);
      setAuthError("Payment verification failed");
    }
  };

  // removed prior handlePayment helper; button uses inline handler now

  const handleAuthSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    try {
      setStatus("processing");
      setAuthError("");
      await authenticateUser();
      await completePayment();
    } catch (error) {
      setStatus("idle");
      setAuthError(error instanceof Error ? error.message : "Authentication failed");
    }
  };

  return (
    <div className="rounded-[24px] border border-slate-200 bg-slate-50 p-5">
      <div className="mb-3 text-sm text-slate-500">Pay via UPI, debit card, or wallet</div>

      <div className="mb-4 grid gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-800 sm:grid-cols-[120px_1fr] sm:items-center">
        <div className="overflow-hidden rounded-xl border border-emerald-200 bg-white p-2">
          <Image
            src={qrCodeUrl}
            alt="UPI QR code"
            width={120}
            height={120}
            className="mx-auto h-[120px] w-[120px] rounded-md object-cover"
            unoptimized
          />
        </div>

        <div>
          <div className="font-semibold">UPI ID for payment</div>
          <div className="mt-1 break-all font-mono text-[13px]">{SELLER_UPI_ID}</div>
          <button
            type="button"
            onClick={handleCopyUpiId}
            className="mt-2 rounded-full border border-emerald-300 bg-white px-3 py-1.5 text-xs font-semibold text-emerald-700"
          >
            {copyState === "copied" ? "Copied" : "Copy UPI ID"}
          </button>
        </div>
      </div>

      <a
        href={upiLink}
        target="_blank"
        rel="noreferrer"
        className="mb-3 inline-flex w-full items-center justify-center rounded-full bg-emerald-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-emerald-500"
      >
        Open UPI app to pay ₹{amount}
      </a>

      <button
        type="button"
        onClick={async () => {
          if (!token) {
            setShowAuth(true);
            return;
          }

          // If we don't yet have a payment id, start the payment process (open UPI).
          if (!paymentId) {
            await completePayment();
            return;
          }

          // If paymentId exists, attempt verification.
          await verifyPayment(token);
        }}
        disabled={status === "processing" || status === "paid"}
        className="w-full rounded-full bg-indigo-600 px-5 py-3 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:bg-slate-400"
      >
        {status === "processing"
          ? paymentId
            ? "Verifying payment..."
            : "Starting payment..."
          : status === "paid"
            ? "Verified"
            : paymentId
              ? `Verify payment of ₹${amount}`
              : `Confirm payment of ₹${amount}`}
      </button>

      {paymentId ? (
        <div className="mt-3 text-center text-[11px] text-slate-500">Reference: {paymentId}</div>
      ) : null}

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
              {authSuccess ? <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-2 text-sm text-emerald-700">{authSuccess}</div> : null}

              <button
                type="submit"
                disabled={status === "processing"}
                className="w-full rounded-full bg-indigo-600 px-5 py-3 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:bg-slate-400"
              >
                {status === "processing" ? "Please wait..." : authMode === "register" ? "Create account & continue" : "Login & continue"}
              </button>
            </form>
          </div>
        </div>
      ) : null}
    </div>
  );
}
