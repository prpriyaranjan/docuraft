import { describe, it, expect, beforeEach, vi } from "vitest";
import { POST } from "./route";
import { prisma } from "@/lib/prisma";
import { hashPassword, signToken } from "@/lib/auth";

// Mocks
vi.mock("@/lib/prisma", () => ({
  prisma: {
    user: {
      findUnique: vi.fn(),
      create: vi.fn(),
    },
  },
}));

vi.mock("@/lib/auth", () => ({
  hashPassword: vi.fn(),
  signToken: vi.fn(),
  AuthSchema: {
    parse: vi.fn((data) => data),
  },
}));

describe("Auth Register API", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (hashPassword as any).mockResolvedValue("hashed-password");
    (signToken as any).mockReturnValue("mock-jwt-token");
  });

  describe("POST /api/auth/register", () => {
    it("registers a new user successfully", async () => {
      const mockUser = {
        id: "user-123",
        email: "test@example.com",
        name: "Test User",
        passwordHash: "hashed-password",
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      (prisma.user.findUnique as any).mockResolvedValue(null);
      (prisma.user.create as any).mockResolvedValue(mockUser);

      const request = new Request("http://localhost/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: "test@example.com",
          password: "password123",
          name: "Test User",
        }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.token).toBe("mock-jwt-token");
      expect(data.user).toEqual({
        id: "user-123",
        email: "test@example.com",
        name: "Test User",
      });
      expect(prisma.user.create).toHaveBeenCalledWith({
        data: {
          email: "test@example.com",
          name: "Test User",
          passwordHash: "hashed-password",
        },
      });
    });

    it("returns 409 for existing user", async () => {
      (prisma.user.findUnique as any).mockResolvedValue({
        id: "existing-user",
        email: "test@example.com",
      });

      const request = new Request("http://localhost/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: "test@example.com",
          password: "password123",
        }),
      });

      const response = await POST(request);
      expect(response.status).toBe(409);
    });

    it("returns 400 for invalid email", async () => {
      const request = new Request("http://localhost/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: "invalid-email",
          password: "password123",
        }),
      });

      const response = await POST(request);
      expect(response.status).toBe(400);
    });

    it("returns 400 for short password", async () => {
      const request = new Request("http://localhost/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: "test@example.com",
          password: "123",
        }),
      });

      const response = await POST(request);
      expect(response.status).toBe(400);
    });

    it("uses email prefix as name when not provided", async () => {
      const mockUser = {
        id: "user-123",
        email: "test@example.com",
        name: "test",
        passwordHash: "hashed-password",
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      (prisma.user.findUnique as any).mockResolvedValue(null);
      (prisma.user.create as any).mockResolvedValue(mockUser);

      const request = new Request("http://localhost/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: "test@example.com",
          password: "password123",
        }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.user.name).toBe("test");
    });
  });
});