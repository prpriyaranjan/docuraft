import { notFound } from "next/navigation";
import { DocumentEditor } from "@/components/DocumentEditor";
import { getTemplateById } from "@/data/templates";

export default function EditorPage({ params }: { params: { templateId: string } }) {
  const template = getTemplateById(params.templateId);

  if (!template) {
    notFound();
  }

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <DocumentEditor template={template} />
      </div>
    </main>
  );
}
