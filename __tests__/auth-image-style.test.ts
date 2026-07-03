import fs from "node:fs";
import path from "node:path";

const authScreenPaths = [
  "src/features/auth/LoginScreen.tsx",
  "src/features/auth/ForgotPasswordScreen.tsx",
  "src/features/auth/EmailOtpScreen.tsx",
  "src/features/auth/CreateNewPasswordScreen.tsx",
];

describe("auth expo-image styling", () => {
  it("does not style expo-image via className in auth screens", () => {
    for (const relativePath of authScreenPaths) {
      const fileContents = fs.readFileSync(
        path.join(process.cwd(), relativePath),
        "utf8",
      );
      const imageTags = fileContents.match(/<Image[\s\S]*?\/>/g) ?? [];

      for (const imageTag of imageTags) {
        expect(imageTag).not.toMatch(/className=/);
      }
    }
  });
});
