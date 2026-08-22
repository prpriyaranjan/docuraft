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
    return result.token as string;
  };

  const completePayment = async (userToken: string) => {
    setStatus("processing");

    try {
      // Create a Razorpay order on the server and open the Checkout widget.
      const orderResp = await fetch("/api/payments/razorpay", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${userToken}`,
        },
        body: JSON.stringify({ amount, receipt: `rcpt_${templateId}_${Date.now()}` }),
      });

      if (!orderResp.ok) throw new Error("Failed to create payment order");
      const orderJson = await orderResp.json();
      const order = orderJson?.order;

      if (!order || !order.id) throw new Error("Invalid order from server");

      // Load Razorpay checkout script
      await new Promise<void>((resolve, reject) => {
        if ((window as any).Razorpay) return resolve();
        const s = document.createElement("script");
        s.src = "https://checkout.razorpay.com/v1/checkout.js";
        s.onload = () => resolve();
        s.onerror = () => reject(new Error("Failed to load Razorpay script"));
        document.head.appendChild(s);
      });

      const key = (process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID as string) || (window as any).__NEXT_PUBLIC_RAZORPAY_KEY_ID;

      const options: any = {
        key: key,
        amount: order.amount,
        currency: order.currency || "INR",
        name: "DocuCraft",
        description: templateId,
        order_id: order.id,
        handler: async (response: any) => {
          // Verify on server
          const verifyResp = await fetch("/api/payments", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${userToken}`,
            },
            body: JSON.stringify({
              templateId,
              amount,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_order_id: response.razorpay_order_id,
              razorpay_signature: response.razorpay_signature,
            }),
          });

          if (!verifyResp.ok) {
            setStatus("idle");
            console.error("Payment verification failed");
            return;
          }

          const verifyJson = await verifyResp.json();
          if (verifyJson?.verified) {
            setStatus("paid");
            onVerify({ verified: true, downloadToken: verifyJson.downloadToken });
            router.push(`/payment/success?templateId=${templateId}&amount=${amount}`);
          } else {
            setStatus("idle");
          }
        },
        prefill: { email: authForm.email || undefined },
        theme: { color: "#6366f1" },
      };

      const rzp = new (window as any).Razorpay(options);
      rzp.open();
    } catch (error) {
      setStatus("idle");
      console.error(error);
    }
  };

  const handlePayment = async () => {
    if (!token) {
      setShowAuth(true);
      return;
    }

    await completePayment(token);
  };

  const handleAuthSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    try {
      setStatus("processing");
      setAuthError("");
      const nextToken = await authenticateUser();
      await completePayment(nextToken);
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
        onClick={handlePayment}
        disabled={status === "processing" || status === "paid"}
        className="w-full rounded-full bg-indigo-600 px-5 py-3 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:bg-slate-400"
      >
        {status === "processing"
          ? "Verifying payment..."
          : status === "paid"
            ? "Verified"
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
