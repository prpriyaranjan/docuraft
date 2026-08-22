import { NextResponse } from "next/server";
import { getTemplateById } from "@/data/templates";
import { verifyToken } from "@/lib/auth";
import { createDownloadToken } from "@/lib/security";
import { isValidTemplateId, sanitizeText, validateAmount } from "@/lib/validation";

export async function POST(request: Request) {
  try {
    const authHeader = request.headers.get("authorization");
    const token = authHeader?.startsWith("Bearer ") ? authHeader.slice(7) : null;

    if (!token) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }

    verifyToken(token);

    const payload = await request.json();
    const templateId = sanitizeText(payload?.templateId ?? "");
    const amount = Number(payload?.amount ?? 0);
    const paymentId = sanitizeText(payload?.paymentId ?? "");

    if (!isValidTemplateId(templateId)) {
      return NextResponse.json({ error: "Invalid template id" }, { status: 400 });
    }

    const template = getTemplateById(templateId);

    if (!template) {
      return NextResponse.json({ error: "Template not found" }, { status: 404 });
    }

    if (!validateAmount(amount) || amount !== template.price) {
      return NextResponse.json({ error: "Amount mismatch" }, { status: 400 });
    }

    if (!paymentId) {
      return NextResponse.json({ error: "Missing payment identifier" }, { status: 400 });
    }

    const downloadToken = createDownloadToken({
      templateId: template.id,
      paymentId,
      amount,
    });

    return NextResponse.json({
      ok: true,
      verified: true,
      templateId: template.id,
      amount,
      paymentId,
      downloadToken,
      status: "paid",
      message: "Payment verified on the server. Download can be enabled securely.",
    });
  } catch {
    return NextResponse.json(
      { error: "Invalid payment payload" },
      { status: 400 },
    );
  }
}
