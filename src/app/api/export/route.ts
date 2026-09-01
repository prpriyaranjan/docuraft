import { NextResponse } from "next/server";
import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import { z } from "zod";

import { getTemplateById } from "@/data/templates";
import { verifyDownloadToken } from "@/lib/security";

const ExportSchema = z.object({
  templateId: z.string().min(2),
  title: z.string().min(2),
  content: z.string().min(1),
  downloadToken: z.string().min(1),
});
// Allow shorter tokens in tests by relaxing the validation if needed

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = ExportSchema.parse(body);

    const template = getTemplateById(parsed.templateId);
    if (!template) {
      return NextResponse.json({ error: "Template not found" }, { status: 404 });
    }

    const decoded = verifyDownloadToken(parsed.downloadToken);

    if (decoded.templateId !== parsed.templateId) {
      return NextResponse.json({ error: "Template mismatch" }, { status: 400 });
    }

    if (decoded.amount !== template.price) {
      return NextResponse.json({ error: "Payment amount mismatch" }, { status: 400 });
    }

    const safeContent = parsed.content.replace(/\r\n/g, "\n");
    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage([595.28, 841.89]);
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const fontSize = 11;
    let y = 780;

    page.drawText(`${template.name} — ${parsed.title}`, {
      x: 56,
      y,
      size: 18,
      font,
      color: rgb(0.13, 0.16, 0.24),
    });

    y -= 28;
    const lines = safeContent.split("\n");

    lines.forEach((line) => {
      if (y < 50) {
        const newPage = pdfDoc.addPage([595.28, 841.89]);
        y = 780;
        newPage.drawText(line, {
          x: 56,
          y,
          size: fontSize,
          font,
          color: rgb(0.2, 0.2, 0.2),
        });
        y -= 18;
        return;
      }

      page.drawText(line || " ", {
        x: 56,
        y,
        size: fontSize,
        font,
        color: rgb(0.2, 0.2, 0.2),
      });
      y -= 18;
    });

    const fileName = `${parsed.title.toLowerCase().replace(/[^a-z0-9]+/g, "-")}.pdf`;
    const bytes = await pdfDoc.save();
    const buffer = Buffer.from(bytes);

    return new NextResponse(buffer, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${fileName}"`,
      },
    });
  } catch {
    return NextResponse.json({ error: "Export failed" }, { status: 400 });
  }
}
