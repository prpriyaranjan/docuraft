import { describe, it, expect, beforeEach, vi } from "vitest";
import { POST } from "./route";
import { prisma } from "@/lib/prisma";
import { verifyToken } from "@/lib/auth";
import { createDownloadToken } from "@/lib/security";
import { getTemplateById } from "@/data/templates";

// Mocks
vi.mock("@/lib/prisma", () => ({
  prisma: {
    order: {
      create: vi.fn(),
    },
  },
}));

vi.mock("@/lib/auth", () => ({
  verifyToken: vi.fn(),
}));

vi.mock("@/lib/security", () => ({
  createDownloadToken: vi.fn(),
}));

vi.mock("@/data/templates", () => ({
  getTemplateById: vi.fn(),
}));

describe("Payments API", () => {
  const mockUser = { userId: "user-123", email: "test@example.com" };
  const mockToken = "mock-jwt-token";
  const mockTemplate = {
    id: "resume-modern-001",
    name: "Modern Professional",
    price: 5,
  };
  const mockDownloadToken = "mock-download-token";

  beforeEach(() => {
    vi.clearAllMocks();
    (verifyToken as any).mockReturnValue(mockUser);
    (getTemplateById as any).mockReturnValue(mockTemplate);
    (createDownloadToken as any).mockReturnValue(mockDownloadToken);
  });

  describe("POST /api/payments", () => {
    it("verifies Razorpay payment successfully", async () => {
      const mockOrder = {
        id: "order-123",
        paymentId: "pay_123",
        templateId: "resume-modern-001",
        amount: 5,
        status: "paid",
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      (prisma.order.create as any).mockResolvedValue(mockOrder);

      const request = new Request("http://localhost/api/payments", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${mockToken}`,
        },
        body: JSON.stringify({
          templateId: "resume-modern-001",
          amount: 5,
          razorpay_payment_id: "pay_123",
          razorpay_order_id: "order_123",
          razorpay_signature: "valid_signature",
        }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.verified).toBe(true);
      expect(data.downloadToken).toBe(mockDownloadToken);
      expect(data.templateId).toBe("resume-modern-001");
      expect(data.amount).toBe(5);
      expect(prisma.order.create).toHaveBeenCalled();
    });

    it("returns 400 for invalid template ID", async () => {
      (getTemplateById as any).mockReturnValue(undefined);

      const request = new Request("http://localhost/api/payments", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${mockToken}`,
        },
        body: JSON.stringify({
          templateId: "invalid-template",
          amount: 5,
          paymentId: "pay_123",
        }),
      });

      const response = await POST(request);
      expect(response.status).toBe(404);
    });

    it("returns 400 for amount mismatch", async () => {
      const request = new Request("http://localhost/api/payments", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${mockToken}`,
        },
        body: JSON.stringify({
          templateId: "resume-modern-001",
          amount: 10, // Wrong amount
          paymentId: "pay_123",
        }),
      });

      const response = await POST(request);
      expect(response.status).toBe(400);
    });

    it("returns 401 without auth token", async () => {
      const request = new Request("http://localhost/api/payments", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          templateId: "resume-modern-001",
          amount: 5,
          paymentId: "pay_123",
        }),
      });

      const response = await POST(request);
      expect(response.status).toBe(401);
    });

    it("verifies legacy payment flow (UPI)", async () => {
      const mockOrder = {
        id: "order-123",
        paymentId: "upi_123",
        templateId: "resume-modern-001",
        amount: 5,
        status: "paid",
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      (prisma.order.create as any).mockResolvedValue(mockOrder);

      const request = new Request("http://localhost/api/payments", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${mockToken}`,
        },
        body: JSON.stringify({
          templateId: "resume-modern-001",
          amount: 5,
          paymentId: "upi_123",
        }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.verified).toBe(true);
      expect(data.downloadToken).toBe(mockDownloadToken);
    });
  });
});