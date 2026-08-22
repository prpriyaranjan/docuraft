import { NextResponse } from "next/server";
import { templates } from "@/data/templates";

export async function GET() {
  return NextResponse.json({
    templates: templates.map((template) => ({
      id: template.id,
      name: template.name,
      category: template.category,
      description: template.description,
      price: template.price,
      premium: template.premium,
      thumbnail: template.thumbnail,
      sections: template.sections,
    })),
  });
}
