import type { TemplateDefinition } from "@/data/templates";

const fieldValue = (data: Record<string, string>, key: string) => data[key] || "";

export function DocumentPreview({
  template,
  data,
  showSectionTitles = true,
  showFieldLabels = true,
}: {
  template: TemplateDefinition;
  data: Record<string, string>;
  showSectionTitles?: boolean;
  showFieldLabels?: boolean;
}) {
  const renderSection = (section: string) => {
    const fieldsInSection = template.fields.filter((field) => field.section === section);

    if (!fieldsInSection.length) return null;

    return (
      <section key={section} className="mb-6">
        {showSectionTitles ? (
          <h3 className="mb-3 border-b border-slate-200 pb-1 text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500">
            {section}
          </h3>
        ) : null}

        <div className="space-y-2 text-[12px] leading-6 text-slate-700">
          {fieldsInSection.map((field) => {
            const value = fieldValue(data, field.key);
            if (!value) return null;

            return (
              <div key={field.key}>
                {showFieldLabels && field.label !== section ? (
                  <div className="font-semibold text-slate-900">{field.label}</div>
                ) : null}
                <div className="whitespace-pre-line">{value}</div>
              </div>
            );
          })}
          
        </div>
      </section>
    );
  };

  return (
    <div className="mx-auto w-full max-w-[880px] rounded-[28px] border border-slate-200 bg-white p-5 shadow-[0_24px_80px_rgba(15,23,42,0.12)] md:p-7">
        <div className="mb-6 flex items-start justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <div
            className="mb-2 inline-flex rounded-full px-2 py-1 text-[10px] font-bold uppercase tracking-[0.2em] text-white"
            style={{ backgroundColor: template.accent }}
          >
            {template.category}
          </div>
          <h2 className="text-xl font-bold text-slate-900">
            {template.name} — {fieldValue(data, "fullName") || "Your Name"}
          </h2>
          {fieldValue(data, "role") ? (
            <p className="text-sm text-slate-600">{fieldValue(data, "role")}</p>
          ) : null}
          {fieldValue(data, "location") ? (
            <p className="text-sm text-slate-600">{fieldValue(data, "location")}</p>
          ) : null}
        </div>
      </div>

      <div className="space-y-2">
        {template.sections.map((section) => renderSection(section))}
      </div>
    </div>
  );
}
