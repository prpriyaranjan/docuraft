import Link from "next/link";
import { notFound } from "next/navigation";
import { getTemplateById } from "@/data/templates";

export default function PaymentPage({ params }: { params: { templateId: string } }) {
  const template = getTemplateById(params.templateId);

  if (!template) {
    notFound();
  }

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-10 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-xl rounded-[30px] border border-slate-200 bg-white p-6 shadow-[0_20px_60px_rgba(15,23,42,0.08)] sm:p-8">
        <div className="mb-6">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-indigo-600">Secure checkout</p>
          <h1 className="mt-2 text-4xl font-black tracking-[-0.06em] text-slate-950">Pay for your document</h1>
        </div>

        <div className="space-y-4 rounded-[24px] bg-slate-50 p-5 text-sm text-slate-700">
          <div className="flex items-center justify-between">
            <span>Template</span>
            <span className="font-semibold text-slate-900">{template.name}</span>
          </div>
          <div className="flex items-center justify-between">
            <span>Category</span>
            <span>{template.category}</span>
          </div>
          <div className="flex items-center justify-between">
            <span>Price</span>
            <span className="font-bold text-slate-900">₹{template.price}</span>
          </div>
          <div className="flex items-center justify-between">
            <span>Payment method</span>
            <span>UPI / Razorpay / Card</span>
          </div>
        </div>

        <div className="mt-6 space-y-3">
          <button className="w-full rounded-full bg-indigo-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-200 hover:bg-indigo-500">
            Pay ₹{template.price}
          </button>
          <Link href={`/editor/${template.id}`} className="block w-full rounded-full border border-slate-200 bg-white px-5 py-3 text-center text-sm font-semibold text-slate-700 hover:bg-slate-100">
            Back to editor
          </Link>
        </div>

        <p className="mt-5 text-xs leading-5 text-slate-500">
          Demo payment flow: in production, payment verification would occur on the server before the PDF is unlocked for download.
        </p>
      </div>
    </main>
  );
}
