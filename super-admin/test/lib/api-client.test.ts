import { describe, it, expect, beforeEach } from "vitest";
import { getStoredTokens, setStoredTokens, getErrorMessage } from "@/lib/api/client";

describe("API Client & Token Management", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("stores and retrieves tokens in local storage", () => {
    const mockTokens = {
      access_token: "mock-access-token-xyz",
      refresh_token: "mock-refresh-token-abc",
      token_type: "bearer",
      expires_in: 900,
    };

    expect(getStoredTokens()).toBeNull();
    setStoredTokens(mockTokens);
    expect(getStoredTokens()).toEqual(mockTokens);

    setStoredTokens(null);
    expect(getStoredTokens()).toBeNull();
  });

  it("extracts error message from structured response", () => {
    const errorObj = {
      isAxiosError: true,
      response: {
        data: {
          message: "Invalid administrator credentials",
        },
      },
    };
    expect(getErrorMessage(errorObj)).toBe("Invalid administrator credentials");
  });
});

