import { getPasswordStrength, maskEmailAddress } from "@/features/auth/presentation";

describe("auth presentation helpers", () => {
  it("masks the auth email the same way the OTP screen shows it", () => {
    expect(maskEmailAddress("meh@example.com")).toBe("meh***@example.com");
    expect(maskEmailAddress("me@example.com")).toBe("me***@example.com");
    expect(maskEmailAddress("cook")).toBe("cook");
  });

  it("marks mixed passwords as strong once they clear the minimum rules", () => {
    expect(getPasswordStrength("abc")).toEqual({
      activeSegments: 1,
      label: "Weak",
      meetsLength: false,
      meetsMix: false,
    });

    expect(getPasswordStrength("password12")).toEqual({
      activeSegments: 3,
      label: "Strong",
      meetsLength: true,
      meetsMix: true,
    });

    expect(getPasswordStrength("password123!")).toEqual({
      activeSegments: 4,
      label: "Strong",
      meetsLength: true,
      meetsMix: true,
    });
  });
});
