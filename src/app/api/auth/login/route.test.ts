import { describe, it, expect, beforeEach, vi } from "vitest";
import { POST } from "./route";
import { prisma } from "@/lib/prisma";
import { verifyPassword, signToken } from "@/lib/auth";

// Mocks
vi.mock("@/lib/prisma", () => ({
  prisma: {
    user: {
      findUnique: vi.fn(),
    },
  },
}));

vi.mock("@/lib/auth", () => ({
  verifyPassword: vi.fn(),
  signToken: vi.fn(),
}));

describe("Auth Login API", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (signToken as any).mockReturnValue("mock-jwt-token");
  });

  describe("POST /api/auth/login", () => {
    it("logs in user with valid credentials", async () => {
      const mockUser = {
        id: "user-123",
        email: "test@example.com",
        name: "Test User",
        passwordHash: "hashed-password",
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      (prisma.user.findUnique as any).mockResolvedValue(mockUser);
      (verifyPassword as any).mockResolvedValue(true);

      const request = new Request("http://localhost/api/auth/login", {
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
      expect(data.token).toBe("mock-jwt-token");
      expect(data.user).toEqual({
        id: "user-123",
        email: "test@example.com",
        name: "Test User",
      });
      expect(verifyPassword).toHaveBeenCalledWith("password123", "hashed-password");
    });

    it("returns 401 for non-existent user", async () => {
      (prisma.user.findUnique as any).mockResolvedValue(null);

      const request = new Request("http://localhost/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: "nonexistent@example.com",
          password: "password123",
        }),
      });

      const response = await POST(request);
      expect(response.status).toBe(401);
    });

    it("returns 401 for invalid password", async () => {
      const mockUser = {
        id: "user-123",
        email: "test@example.com",
        passwordHash: "hashed-password",
      };

      (prisma.user.findUnique as any).mockResolvedValue(mockUser);
      (verifyPassword as any).mockResolvedValue(false);

      const request = new Request("http://localhost/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: "test@example.com",
          password: "wrongpassword",
        }),
      });

      const response = await POST(request);
      expect(response.status).toBe(401);
    });

    it("returns 401 for user without password hash", async () => {
      const mockUser = {
        id: "user-123",
        email: "test@example.com",
        passwordHash: null,
      };

      (prisma.user.findUnique as any).mockResolvedValue(mockUser);

      const request = new Request("http://localhost/api/auth/login", {
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
      expect(response.status).toBe(401);
    });

    it("returns 400 for invalid email format", async () => {
      const request = new Request("http://localhost/api/auth/login", {
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
      const request = new Request("http://localhost/api/auth/login", {
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
  });
});