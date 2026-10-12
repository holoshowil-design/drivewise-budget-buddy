import { describe, expect, it } from "vitest";
import { authErrorMessage } from "@/lib/auth-messages";

describe("auth error messages in Hebrew", () => {
  it("wrong email or password points to the password setup", () => {
    expect(authErrorMessage("Invalid login credentials")).toContain("הגדר סיסמה");
  });
  it("unconfirmed email", () => {
    expect(authErrorMessage("Email not confirmed")).toContain("לא אושר");
  });
  it("rate limits", () => {
    expect(
      authErrorMessage("For security purposes, you can only request this after 42 seconds."),
    ).toContain("יותר מדי");
  });
  it("unknown messages pass through", () => {
    expect(authErrorMessage("Something odd")).toBe("Something odd");
    expect(authErrorMessage(undefined)).toBe("שגיאה בהתחברות");
  });
});
