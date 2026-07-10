import { createAccountSchema, toSignUpInput } from "@/features/auth/schema";

describe("createAccountSchema", () => {
  it("normalizes valid values", () => {
    const values = createAccountSchema.parse({
      name: "  Mei Lin  ",
      email: "  MEI@EXAMPLE.COM ",
      password: "cook1234",
      confirmPassword: "cook1234",
    });

    expect(toSignUpInput(values)).toEqual({
      displayName: "Mei Lin",
      email: "mei@example.com",
      password: "cook1234",
    });
  });

  it.each(["", "1234567"])("rejects passwords shorter than 8", (password) => {
    expect(() =>
      createAccountSchema.parse({
        name: "Mei Lin",
        email: "mei@example.com",
        password,
        confirmPassword: password,
      }),
    ).toThrow();
  });

  it("rejects passwords longer than 20", () => {
    const password = "a".repeat(21);

    expect(() =>
      createAccountSchema.parse({
        name: "Mei Lin",
        email: "mei@example.com",
        password,
        confirmPassword: password,
      }),
    ).toThrow();
  });

  it("rejects invalid name, email, and confirmation", () => {
    expect(() =>
      createAccountSchema.parse({
        name: "   ",
        email: "not-an-email",
        password: "cook1234",
        confirmPassword: "different",
      }),
    ).toThrow();
  });
});
