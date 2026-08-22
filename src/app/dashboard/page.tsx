import Link from "next/link";
import { adminMetrics, favoriteTemplates, myDocuments, purchases } from "@/data/dashboard";

export default function DashboardPage() {
  return (
    <main className="min-h-screen bg-slate-50 px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl space-y-8">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-indigo-600">My account</p>
            <h1 className="mt-2 text-4xl font-black tracking-[-0.06em] text-slate-950">Dashboard</h1>
          </div>

          <Link href="/gallery" className="inline-flex rounded-full bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-indigo-200 hover:bg-indigo-500">
            Create new document
          </Link>
        </div>

        <div className="grid gap-4 md:grid-cols-4">
          {adminMetrics.map((metric) => (
            <div key={metric.label} className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-sm">
              <p className="text-sm text-slate-500">{metric.label}</p>
              <div className="mt-3 text-3xl font-black text-slate-900">{metric.value}</div>
              <div className="mt-2 text-sm font-medium text-emerald-600">{metric.trend}</div>
            </div>
          ))}
        </div>

        <div className="grid gap-6 lg:grid-cols-[1.3fr_0.7fr]">
          <section className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm">
            <div className="mb-5 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-slate-900">My Documents</h2>
              <Link href="/gallery" className="text-sm font-semibold text-indigo-600">View all</Link>
            </div>

            <div className="space-y-3">
              {myDocuments.map((document) => (
                <div key={document.id} className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-4 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <div className="font-semibold text-slate-900">{document.title}</div>
                    <div className="mt-1 text-sm text-slate-500">{document.template} • {document.updatedAt}</div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-semibold text-emerald-700">{document.status}</span>
                    <Link href="/gallery" className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700">
                      Edit
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="text-2xl font-bold text-slate-900">Favorites</h2>
            <div className="mt-5 space-y-3">
              {favoriteTemplates.map((item) => (
                <div key={item} className="rounded-2xl bg-slate-50 p-3 text-sm font-medium text-slate-700">
                  {item}
                </div>
              ))}
            </div>
          </section>
        </div>

        <section className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm">
          <div className="mb-5 flex items-center justify-between">
            <h2 className="text-2xl font-bold text-slate-900">Purchase History</h2>
            <span className="text-sm text-slate-500">Secure downloads enabled</span>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead>
                <tr className="border-b border-slate-200 text-slate-500">
                  <th className="py-3 pr-4 font-medium">Order</th>
                  <th className="py-3 pr-4 font-medium">Template</th>
                  <th className="py-3 pr-4 font-medium">Amount</th>
                  <th className="py-3 pr-4 font-medium">Date</th>
                  <th className="py-3 pr-4 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {purchases.map((purchase) => (
                  <tr key={purchase.id} className="border-b border-slate-100 last:border-0">
                    <td className="py-3 pr-4 font-medium text-slate-800">{purchase.id}</td>
                    <td className="py-3 pr-4 text-slate-700">{purchase.template}</td>
                    <td className="py-3 pr-4 text-slate-700">{purchase.amount}</td>
                    <td className="py-3 pr-4 text-slate-700">{purchase.date}</td>
                    <td className="py-3 pr-4">
                      <span className="rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-semibold text-emerald-700">{purchase.status}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </main>
  );
}
