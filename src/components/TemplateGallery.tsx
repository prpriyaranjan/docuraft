"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";
import { templates, type TemplateDefinition } from "@/data/templates";

export function TemplateGallery() {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("All");
  const [sortBy, setSortBy] = useState("popular");
  const [favoriteIds, setFavoriteIds] = useState<string[]>(["resume-modern-001", "biodata-luxury-009"]);

  const filteredTemplates = useMemo(() => {
    const normalized = query.trim().toLowerCase();

    const next = templates.filter((template) => {
      const matchesCategory = category === "All" || template.category === category;
      const matchesQuery =
        normalized.length === 0 ||
        template.name.toLowerCase().includes(normalized) ||
        template.category.toLowerCase().includes(normalized) ||
        template.description.toLowerCase().includes(normalized);

      return matchesCategory && matchesQuery;
    });

    return [...next].sort((a, b) => {
      if (sortBy === "price-low") return a.price - b.price;
      if (sortBy === "price-high") return b.price - a.price;
      if (sortBy === "newest") return b.id.localeCompare(a.id);
      return b.price - a.price;
    });
  }, [query, category, sortBy]);

  const categories = ["All", ...Array.from(new Set(templates.map((template) => template.category)))];

  const toggleFavorite = (templateId: string) => {
    setFavoriteIds((prev) =>
      prev.includes(templateId)
        ? prev.filter((id) => id !== templateId)
        : [...prev, templateId],
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 rounded-[28px] border border-slate-200 bg-white p-4 shadow-sm md:flex-row md:items-center md:justify-between">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search templates..."
          className="w-full rounded-full border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-800 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 md:max-w-xs"
        />

        <div className="flex flex-wrap gap-2">
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="rounded-full border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700 outline-none focus:border-indigo-500"
          >
            {categories.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="rounded-full border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700 outline-none focus:border-indigo-500"
          >
            <option value="popular">Popular</option>
            <option value="newest">Newest</option>
            <option value="price-low">Price: Low to High</option>
            <option value="price-high">Price: High to Low</option>
          </select>
        </div>
      </div>

      <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
        {filteredTemplates.map((template) => (
          <TemplateCard
            key={template.id}
            template={template}
            isFavorite={favoriteIds.includes(template.id)}
            onToggleFavorite={() => toggleFavorite(template.id)}
          />
        ))}
      </div>
    </div>
  );
}

function TemplateCard({
  template,
  isFavorite,
  onToggleFavorite,
}: {
  template: TemplateDefinition;
  isFavorite: boolean;
  onToggleFavorite: () => void;
}) {
  return (
    <article className="group overflow-hidden rounded-[26px] border border-slate-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-lg">
      <div className="relative h-48 overflow-hidden bg-slate-100">
        <Image
          src={template.thumbnail}
          alt={template.name}
          fill
          className="object-cover transition duration-300 group-hover:scale-105"
          unoptimized
        />
        <button
          type="button"
          onClick={onToggleFavorite}
          className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full border border-white/60 bg-white/80 text-lg backdrop-blur-sm"
          aria-label="Favorite template"
        >
          {isFavorite ? "♥" : "♡"}
        </button>
        {template.premium ? (
          <span className="absolute left-3 top-3 rounded-full bg-amber-400 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.12em] text-slate-900">
            Premium
          </span>
        ) : null}
      </div>

      <div className="space-y-4 p-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">{template.category}</p>
            <h3 className="mt-1 text-xl font-bold text-slate-900">{template.name}</h3>
          </div>
          <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-700">₹{template.price}</span>
        </div>

        <p className="text-sm leading-6 text-slate-600">{template.description}</p>

        <div className="flex gap-2">
          <Link
            href={`/editor/${template.id}`}
            className="flex-1 rounded-full bg-slate-900 px-4 py-2.5 text-center text-sm font-semibold text-white transition hover:bg-slate-800"
          >
            Use Template
          </Link>
          <button
            type="button"
            className="rounded-full border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-100"
          >
            Preview
          </button>
        </div>
      </div>
    </article>
  );
}
