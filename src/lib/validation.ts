export function sanitizeText(value: string) {
  return String(value ?? "").trim().replace(/\s+/g, " ");
}

export function validateAmount(amount: number) {
  return Number.isFinite(amount) && amount > 0;
}

export function isValidTemplateId(templateId: string) {
  return typeof templateId === "string" && templateId.length > 2;
}
