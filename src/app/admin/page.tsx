import { adminMetrics, adminTemplates } from "@/data/dashboard";

export default function AdminPage() {
  const revenueBars = [38, 56, 52, 71, 68, 91, 84];

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl space-y-8">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-indigo-600">Admin panel</p>
          <h1 className="mt-2 text-4xl font-black tracking-[-0.06em] text-slate-950">Template administration</h1>
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

        <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
          <section className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm">
            <div className="mb-5 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-slate-900">Template management</h2>
              <button className="rounded-full bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-500">Add template</button>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-500">
                    <th className="py-3 pr-4 font-medium">Template</th>
                    <th className="py-3 pr-4 font-medium">Category</th>
                    <th className="py-3 pr-4 font-medium">Price</th>
                    <th className="py-3 pr-4 font-medium">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {adminTemplates.map((template) => (
                    <tr key={template.name} className="border-b border-slate-100 last:border-0">
                      <td className="py-3 pr-4 font-medium text-slate-800">{template.name}</td>
                      <td className="py-3 pr-4 text-slate-700">{template.category}</td>
                      <td className="py-3 pr-4 text-slate-700">{template.price}</td>
                      <td className="py-3 pr-4">
                        <span className="rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-semibold text-emerald-700">{template.status}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          <section className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="text-2xl font-bold text-slate-900">Revenue</h2>
            <div className="mt-6 flex h-48 items-end gap-3">
              {revenueBars.map((value, index) => (
                <div key={index} className="flex-1 rounded-t-2xl bg-gradient-to-t from-indigo-600 to-cyan-400" style={{ height: `${value}%` }} />
              ))}
            </div>
            <div className="mt-4 text-sm text-slate-500">Last 7 days</div>
          </section>
        </div>
      </div>
    </main>
  );
}
