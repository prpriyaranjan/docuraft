import { TemplateGallery } from "@/components/TemplateGallery";

export default function GalleryPage() {
  return (
    <main className="min-h-screen bg-slate-50 px-4 py-10 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-indigo-600">Template gallery</p>
          <h1 className="mt-2 text-4xl font-black tracking-[-0.06em] text-slate-950">Find the right template for your next document</h1>
        </div>

        <TemplateGallery />
      </div>
    </main>
  );
}
