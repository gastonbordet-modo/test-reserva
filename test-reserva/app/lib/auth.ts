const USER_ID_KEY = "modo_user_id";
const MOCK_USER_ID = "landing-demo-001";

export function getUserId(): string {
  if (typeof window === "undefined") {
    throw new Error(
      "getUserId() solo puede llamarse desde el cliente (depende de sessionStorage)"
    );
  }

  const existing = window.sessionStorage.getItem(USER_ID_KEY);
  if (existing) return existing;

  window.sessionStorage.setItem(USER_ID_KEY, MOCK_USER_ID);
  return MOCK_USER_ID;
}
