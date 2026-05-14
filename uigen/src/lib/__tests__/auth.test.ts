import { test, expect, vi, beforeEach } from "vitest";

vi.mock("server-only", () => ({}));

const mockSet = vi.fn();
vi.mock("next/headers", () => ({
  cookies: vi.fn(() => Promise.resolve({ set: mockSet })),
}));

const mockSign = vi.fn().mockResolvedValue("mock-jwt-token");
vi.mock("jose", () => ({
  SignJWT: vi.fn().mockImplementation(() => ({
    setProtectedHeader: vi.fn().mockReturnThis(),
    setExpirationTime: vi.fn().mockReturnThis(),
    setIssuedAt: vi.fn().mockReturnThis(),
    sign: mockSign,
  })),
  jwtVerify: vi.fn(),
}));

import { createSession } from "@/lib/auth";
import { SignJWT } from "jose";
import { cookies } from "next/headers";

beforeEach(() => {
  vi.clearAllMocks();
  mockSign.mockResolvedValue("mock-jwt-token");
  vi.mocked(cookies).mockResolvedValue({ set: mockSet } as any);
});

test("createSession signs a JWT with the user payload", async () => {
  await createSession("user-123", "test@example.com");

  expect(SignJWT).toHaveBeenCalledWith(
    expect.objectContaining({
      userId: "user-123",
      email: "test@example.com",
    })
  );
  expect(mockSign).toHaveBeenCalledTimes(1);
});

test("createSession sets an httpOnly cookie with the JWT", async () => {
  await createSession("user-123", "test@example.com");

  expect(mockSet).toHaveBeenCalledWith(
    "auth-token",
    "mock-jwt-token",
    expect.objectContaining({
      httpOnly: true,
      sameSite: "lax",
      path: "/",
    })
  );
});

test("createSession sets cookie expiry ~7 days from now", async () => {
  const before = Date.now();
  await createSession("user-123", "test@example.com");
  const after = Date.now();

  const cookieOptions = mockSet.mock.calls[0][2];
  const expiresAt: Date = cookieOptions.expires;

  const sevenDaysMs = 7 * 24 * 60 * 60 * 1000;
  expect(expiresAt.getTime()).toBeGreaterThanOrEqual(before + sevenDaysMs - 1000);
  expect(expiresAt.getTime()).toBeLessThanOrEqual(after + sevenDaysMs + 1000);
});

test("createSession includes expiresAt in JWT payload", async () => {
  await createSession("user-123", "test@example.com");

  const jwtPayload = vi.mocked(SignJWT).mock.calls[0][0] as any;
  expect(jwtPayload.expiresAt).toBeInstanceOf(Date);
});

test("createSession works with different user IDs and emails", async () => {
  await createSession("user-456", "other@example.com");

  expect(SignJWT).toHaveBeenCalledWith(
    expect.objectContaining({
      userId: "user-456",
      email: "other@example.com",
    })
  );
  expect(mockSet).toHaveBeenCalledWith("auth-token", "mock-jwt-token", expect.any(Object));
});
