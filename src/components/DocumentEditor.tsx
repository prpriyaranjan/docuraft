"use client";

import { useEffect, useMemo, useState } from "react";
import { defaultTemplateData, type TemplateDefinition } from "@/data/templates";
import { DocumentPreview } from "@/components/DocumentPreview";
import { PaymentFlow } from "@/components/PaymentFlow";

export function DocumentEditor({ template }: { template: TemplateDefinition }) {
  const [data, setData] = useState<Record<string, string>>(() => defaultTemplateData(template.id));
  const [isPaid, setIsPaid] = useState(false);
  const [downloadToken, setDownloadToken] = useState("");
  const [showPayment, setShowPayment] = useState(false);
  const [saveState, setSaveState] = useState<"idle" | "saving" | "saved">("idle");

  useEffect(() => {
    setData(defaultTemplateData(template.id));
    setIsPaid(false);
    setDownloadToken("");
    setShowPayment(false);
    setSaveState("idle");
  }, [template]);

  const groupedFields = useMemo(() => {
    return template.sections.reduce<Record<string, typeof template.fields>>((acc, section) => {
      acc[section] = template.fields.filter((field) => field.section === section);
      return acc;
    }, {});
  }, [template]);

  const updateField = (key: string, value: string) => {
    setData((prev) => ({ ...prev, [key]: value }));
  };

  const buildDocumentText = () => {
    return template.sections
      .map((section) => {
        const fieldsInSection = template.fields.filter((field) => field.section === section);
        const values = fieldsInSection
          .map((field) => {
            const value = (data[field.key] ?? "").trim();
            return value ? `${field.label}: ${value}` : null;
          })
          .filter(Boolean)
          .join("\n");

        return values ? `${section}\n${values}\n` : "";
      })
      .filter(Boolean)
      .join("\n");
  };

  const saveDocument = async () => {
    setSaveState("saving");

    try {
      const title = (data.fullName || template.name || "Untitled Document").trim() || "Untitled Document";
      const response = await fetch("/api/documents", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          templateId: template.id,
          title,
          content: buildDocumentText(),
          status: isPaid ? "paid" : "draft",
        }),
      });

      if (!response.ok) {
        throw new Error("Save failed");
      }

      setSaveState("saved");
      window.setTimeout(() => setSaveState("idle"), 1800);
    } catch (error) {
      setSaveState("idle");
      console.error(error);
    }
  };

  const exportDocument = async () => {
    if (!isPaid) {
      setShowPayment(true);
      return;
    }

    if (!downloadToken) {
      setShowPayment(true);
      return;
    }

    try {
      const title = (data.fullName || template.name || "untitled-document").trim() || "untitled-document";
      const response = await fetch("/api/export", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          templateId: template.id,
          title,
          content: buildDocumentText(),
          downloadToken,
        }),
      });

      if (!response.ok) {
        throw new Error("Export failed");
      }

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `${title.toLowerCase().replace(/[^a-z0-9]+/g, "-")}.pdf`;
      link.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error(error);
    }
  };

  const activePrice = template.price;

  return (
    <div className="grid gap-6 lg:grid-cols-[1.05fr_1.2fr]">
      <div className="space-y-6 rounded-[28px] border border-slate-200 bg-white p-4 shadow-sm md:p-6">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Editor</p>
            <h2 className="mt-1 text-2xl font-bold text-slate-900">{template.name}</h2>
          </div>
          <span className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
            {template.price === 10 ? "Premium" : "Standard"}
          </span>
        </div>

        <div className="flex gap-2">
          <button
            type="button"
            onClick={saveDocument}
            className="rounded-full border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700"
          >
            {saveState === "saving" ? "Saving..." : saveState === "saved" ? "Saved" : "Save draft"}
          </button>
          <button
            type="button"
            onClick={exportDocument}
            className="rounded-full bg-indigo-600 px-3 py-2 text-xs font-semibold text-white"
          >
            {isPaid ? "Export" : "Pay to export"}
          </button>
        </div>

        <div className="space-y-6">
          {template.sections.map((section) => (
            <div key={section} className="rounded-2xl bg-slate-50 p-4">
              <h3 className="mb-4 text-sm font-bold uppercase tracking-[0.12em] text-slate-600">{section}</h3>

              <div className="grid gap-4">
                {groupedFields[section]?.map((field) => (
                  <label key={field.key} className="block text-sm text-slate-700">
                    <span className="mb-1.5 block font-medium">{field.label}</span>
                    {field.type === "textarea" ? (
                      <textarea
                        value={data[field.key] ?? ""}
                        onChange={(e) => updateField(field.key, e.target.value)}
                        placeholder={field.placeholder}
                        rows={4}
                        className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-800 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                      />
                    ) : (
                      <input
                        value={data[field.key] ?? ""}
                        onChange={(e) => updateField(field.key, e.target.value)}
                        type={field.type ?? "text"}
                        placeholder={field.placeholder}
                        className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-800 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                      />
                    )}
                  </label>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="space-y-4">
        <div className="rounded-[28px] border border-slate-200 bg-white p-4 shadow-sm md:p-5">
          <div className="mb-4 flex items-center justify-between gap-3">
            <h3 className="text-lg font-bold text-slate-900">Live Preview</h3>
            <button
              type="button"
              onClick={() => setShowPayment(true)}
              disabled={isPaid}
              className={`rounded-full px-4 py-2 text-sm font-semibold text-white transition ${
                isPaid ? "cursor-not-allowed bg-emerald-600" : "bg-slate-900 hover:bg-slate-800"
              }`}
            >
              {isPaid ? "Paid • Ready to download" : `Download for ₹${activePrice}`}
            </button>
          </div>

          <DocumentPreview template={template} data={data} />
        </div>
      </div>

      {showPayment && !isPaid ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-[28px] border border-slate-200 bg-white p-6 shadow-2xl">
            <div className="mb-5 flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Secure checkout</p>
                <h3 className="mt-1 text-2xl font-bold text-slate-900">Pay ₹{activePrice}</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowPayment(false)}
                className="rounded-full border border-slate-200 px-3 py-1.5 text-sm text-slate-600"
              >
                Close
              </button>
            </div>

            <div className="space-y-3 rounded-2xl bg-slate-50 p-4 text-sm text-slate-700">
              <div className="flex items-center justify-between">
                <span>Template</span>
                <span className="font-medium text-slate-900">{template.name}</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Amount</span>
                <span className="font-medium text-slate-900">₹{activePrice}</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Method</span>
                <span className="font-medium text-slate-900">Razorpay / UPI / Card</span>
              </div>
            </div>

            <div className="mt-5">
              <PaymentFlow
                templateId={template.id}
                amount={activePrice}
                onVerify={({ verified, downloadToken: nextDownloadToken }) => {
                  setIsPaid(verified);
                  setDownloadToken(nextDownloadToken ?? "");
                  setShowPayment(false);
                }}
              />
            </div>

            <p className="mt-3 text-center text-xs text-slate-500">
              Actual verification must occur on the server before enabling the final PDF download.
            </p>
          </div>
        </div>
      ) : null}
    </div>
  );
}
