import { describe, it, expect, beforeEach } from "vitest";
import { getStoredTokens, setStoredTokens, getErrorMessage } from "@/lib/api/client";

describe("Company Admin API Client & Token Management", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("stores and retrieves company tokens in local storage", () => {
    const mockTokens = {
      access_token: "company-admin-token-123",
      refresh_token: "company-refresh-token-456",
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
          message: "Service with this slug already exists",
        },
      },
    };
    expect(getErrorMessage(errorObj)).toBe("Service with this slug already exists");
  });
});

