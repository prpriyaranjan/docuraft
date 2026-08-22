export async function GET() {
  return Response.json({
    status: "ok",
    app: "DocuCraft",
    timestamp: new Date().toISOString(),
  });
}
