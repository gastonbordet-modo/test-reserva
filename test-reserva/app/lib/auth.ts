const TOKEN_KEY = "modo_auth_token";
const MOCK_TOKEN = "mock-modo-token-abc123";

export function getAuthToken(): string {
  if (typeof window === "undefined") {
    throw new Error(
      "getAuthToken() solo puede llamarse desde el cliente (depende de sessionStorage)"
    );
  }

  const existing = window.sessionStorage.getItem(TOKEN_KEY);
  if (existing) return existing;

  window.sessionStorage.setItem(TOKEN_KEY, MOCK_TOKEN);
  return MOCK_TOKEN;
}
