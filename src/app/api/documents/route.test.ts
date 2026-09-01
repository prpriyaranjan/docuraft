import { describe, it, expect, beforeEach, vi } from "vitest";
import { POST, GET } from "./route";
import { prisma } from "@/lib/prisma";
import { signToken, verifyToken } from "@/lib/auth";

// Mock Prisma
vi.mock("@/lib/prisma", () => ({
  prisma: {
    document: {
      findMany: vi.fn(),
      create: vi.fn(),
    },
  },
}));

// Mock auth
vi.mock("@/lib/auth", () => ({
  signToken: vi.fn(),
  verifyToken: vi.fn(),
}));

describe("Documents API", () => {
  const mockUser = { userId: "user-123", email: "test@example.com" };
  const mockToken = "mock-jwt-token";
  
  beforeEach(() => {
    vi.clearAllMocks();
    (signToken as any).mockReturnValue(mockToken);
    (verifyToken as any).mockReturnValue(mockUser);
  });

  describe("POST /api/documents", () => {
    it("creates a document with valid data", async () => {
      const mockDocument = {
        id: "doc-123",
        templateId: "resume-modern-001",
        title: "Test Resume",
        content: "Test content",
        status: "draft",
        userId: "user-123",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      (prisma.document.create as any).mockResolvedValue(mockDocument);

      const request = new Request("http://localhost/api/documents", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${mockToken}`,
        },
        body: JSON.stringify({
          templateId: "resume-modern-001",
          title: "Test Resume",
          content: "Test content",
        }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(201);
      expect(data).toEqual(mockDocument);
      expect(prisma.document.create).toHaveBeenCalledWith({
        data: {
          templateId: "resume-modern-001",
          title: "Test Resume",
          content: "Test content",
          status: "draft",
          userId: "user-123",
        },
      });
    });

    it("returns 400 for invalid data", async () => {
      const request = new Request("http://localhost/api/documents", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${mockToken}`,
        },
        body: JSON.stringify({
          templateId: "",
          title: "",
          content: "",
        }),
      });

      const response = await POST(request);
      expect(response.status).toBe(400);
    });

    it("creates document without auth (guest mode)", async () => {
      const mockDocument = {
        id: "doc-123",
        templateId: "resume-modern-001",
        title: "Guest Resume",
        content: "Test content",
        status: "draft",
        userId: null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      (prisma.document.create as any).mockResolvedValue(mockDocument);

      const request = new Request("http://localhost/api/documents", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          templateId: "resume-modern-001",
          title: "Guest Resume",
          content: "Test content",
          userId: "guest-user",
        }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(201);
      expect(data.userId).toBe("guest-user");
    });
  });

  describe("GET /api/documents", () => {
    it("returns documents for authenticated user", async () => {
      const mockDocuments = [
        { id: "doc-1", title: "Doc 1", userId: "user-123" },
        { id: "doc-2", title: "Doc 2", userId: "user-123" },
      ];

      (prisma.document.findMany as any).mockResolvedValue(mockDocuments);

      const request = new Request("http://localhost/api/documents", {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${mockToken}`,
        },
      });

      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.documents).toEqual(mockDocuments);
      expect(prisma.document.findMany).toHaveBeenCalledWith({
        where: { userId: "user-123" },
        orderBy: { createdAt: "desc" },
        include: { user: true },
      });
    });

    it("returns empty array when no auth token", async () => {
      (prisma.document.findMany as any).mockResolvedValue([]);

      const request = new Request("http://localhost/api/documents", {
        method: "GET",
      });

      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.documents).toEqual([]);
    });
  });
});