import Link from "next/link";

export default function PaymentSuccessPage({
  searchParams,
}: {
  searchParams: { templateId?: string; amount?: string };
}) {
  const amount = Number(searchParams.amount ?? 0);
  const templateId = searchParams.templateId ?? "resume-modern-001";

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-10 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-xl rounded-[30px] border border-emerald-200 bg-white p-6 shadow-[0_20px_60px_rgba(15,23,42,0.08)] sm:p-8">
        <div className="mb-5 inline-flex rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-emerald-700">
          Payment received
        </div>

        <h1 className="text-4xl font-black tracking-[-0.06em] text-slate-950">Thank you for your payment</h1>
        <p className="mt-3 text-slate-600">
          Your document purchase was confirmed successfully. You can now return to the editor and download the final PDF.
        </p>

        <div className="mt-6 space-y-3 rounded-[24px] bg-slate-50 p-4 text-sm text-slate-700">
          <div className="flex items-center justify-between">
            <span>Amount</span>
            <span className="font-semibold text-slate-900">₹{amount || 0}</span>
          </div>
          <div className="flex items-center justify-between">
            <span>Template</span>
            <span className="font-semibold text-slate-900">{templateId}</span>
          </div>
        </div>

        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
          <Link
            href={`/editor/${templateId}`}
            className="inline-flex flex-1 items-center justify-center rounded-full bg-indigo-600 px-5 py-3 text-sm font-semibold text-white hover:bg-indigo-500"
          >
            Return to editor
          </Link>
          <Link
            href="/gallery"
            className="inline-flex flex-1 items-center justify-center rounded-full border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-100"
          >
            Browse more templates
          </Link>
        </div>
      </div>
    </main>
  );
}
