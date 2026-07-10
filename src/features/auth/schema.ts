import type { SignUpInput } from "./api";
import { z } from "zod";

export const createAccountSchema = z
  .object({
    name: z.string().trim().min(1, "Enter your name.").max(80),
    email: z
      .string()
      .trim()
      .toLowerCase()
      .pipe(z.email("Enter a valid email address.")),
    password: z
      .string()
      .min(8, "Password must be at least 8 characters.")
      .max(20, "Password must be 20 characters or fewer."),
    confirmPassword: z.string().min(1, "Confirm your password."),
  })
  .refine((values) => values.password === values.confirmPassword, {
    path: ["confirmPassword"],
    message: "Passwords do not match.",
  });

export type CreateAccountFormValues = z.infer<typeof createAccountSchema>;

export const toSignUpInput = ({
  name,
  email,
  password,
}: CreateAccountFormValues): SignUpInput => ({
  displayName: name,
  email,
  password,
});
