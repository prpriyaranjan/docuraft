import { templates, type TemplateDefinition } from "@/data/templates";

export type TemplateCategory = "Resume" | "Marriage Biodata" | "Cover Letter" | "Portfolio" | "Professional Bio" | "Letters";

export function getAllTemplates() {
  return templates;
}

export function getTemplatesByCategory(category: TemplateCategory) {
  return templates.filter((template) => template.category === category);
}

export function searchTemplates(query: string) {
  const normalized = query.trim().toLowerCase();

  if (!normalized) return templates;

  return templates.filter((template) => {
    return (
      template.name.toLowerCase().includes(normalized) ||
      template.category.toLowerCase().includes(normalized) ||
      template.description.toLowerCase().includes(normalized)
    );
  });
}

export function getTemplateMeta(template: TemplateDefinition) {
  return {
    id: template.id,
    name: template.name,
    category: template.category,
    price: template.price,
    premium: template.premium,
    layout: template.layout,
    sections: template.sections,
  };
}
