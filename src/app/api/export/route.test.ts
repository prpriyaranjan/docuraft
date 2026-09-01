import { describe, it, expect, beforeEach, vi } from "vitest";
import { POST } from "./route";
import { verifyDownloadToken } from "@/lib/security";
import { getTemplateById } from "@/data/templates";

// Mocks
vi.mock("@/lib/security", () => ({
  verifyDownloadToken: vi.fn(),
}));

vi.mock("@/data/templates", () => ({
  getTemplateById: vi.fn(),
}));

describe("Export API", () => {
  const mockTemplate = {
    id: "resume-modern-001",
    name: "Modern Professional",
    price: 5,
  };
  const mockDecodedToken = {
    templateId: "resume-modern-001",
    paymentId: "pay_123",
    amount: 5,
    exp: Math.floor(Date.now() / 1000) + 3600,
  };

  beforeEach(() => {
    vi.clearAllMocks();
    (getTemplateById as any).mockReturnValue(mockTemplate);
    (verifyDownloadToken as any).mockReturnValue(mockDecodedToken);
  });

  describe("POST /api/export", () => {
    it("exports PDF with valid token", async () => {
      const request = new Request("http://localhost/api/export", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          templateId: "resume-modern-001",
          title: "Test Resume",
          content: "Test content\nLine 2",
          downloadToken: "valid-token",
        }),
      });

      const response = await POST(request);
      
      expect(response.status).toBe(200);
      expect(response.headers.get("Content-Type")).toBe("application/pdf");
      expect(response.headers.get("Content-Disposition")).toContain("attachment");
      expect(response.headers.get("Content-Disposition")).toContain(".pdf");
    });

    it("returns 400 for invalid download token", async () => {
      (verifyDownloadToken as any).mockImplementation(() => {
        throw new Error("Invalid token");
      });

      const request = new Request("http://localhost/api/export", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          templateId: "resume-modern-001",
          title: "Test Resume",
          content: "Test content",
          downloadToken: "invalid-token",
        }),
      });

      const response = await POST(request);
      expect(response.status).toBe(400);
    });

    it("returns 400 for template mismatch", async () => {
      (verifyDownloadToken as any).mockReturnValue({
        ...mockDecodedToken,
        templateId: "different-template",
      });

      const request = new Request("http://localhost/api/export", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          templateId: "resume-modern-001",
          title: "Test Resume",
          content: "Test content",
          downloadToken: "valid-token",
        }),
      });

      const response = await POST(request);
      expect(response.status).toBe(400);
    });

    it("returns 400 for amount mismatch", async () => {
      (verifyDownloadToken as any).mockReturnValue({
        ...mockDecodedToken,
        amount: 10,
      });

      const request = new Request("http://localhost/api/export", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          templateId: "resume-modern-001",
          title: "Test Resume",
          content: "Test content",
          downloadToken: "valid-token",
        }),
      });

      const response = await POST(request);
      expect(response.status).toBe(400);
    });

    it("returns 404 for non-existent template", async () => {
      (getTemplateById as any).mockReturnValue(undefined);

      const request = new Request("http://localhost/api/export", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          templateId: "non-existent",
          title: "Test Resume",
          content: "Test content",
          downloadToken: "valid-token",
        }),
      });

      const response = await POST(request);
      expect(response.status).toBe(404);
    });

    it("returns 400 for expired token", async () => {
      (verifyDownloadToken as any).mockImplementation(() => {
        throw new Error("Token expired");
      });

      const request = new Request("http://localhost/api/export", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          templateId: "resume-modern-001",
          title: "Test Resume",
          content: "Test content",
          downloadToken: "expired-token",
        }),
      });

      const response = await POST(request);
      expect(response.status).toBe(400);
    });
  });
});