import { getApiBaseUrl } from "@/config/env";

describe("getApiBaseUrl", () => {
  test("uses the Android emulator host by default", () => {
    expect(getApiBaseUrl(undefined)).toBe("http://10.0.2.2:8787");
  });

  test("trims whitespace and trailing slashes", () => {
    expect(getApiBaseUrl(" http://192.168.1.10:8787/// ")).toBe(
      "http://192.168.1.10:8787",
    );
  });

  test("rejects unsupported protocols", () => {
    expect(() => getApiBaseUrl("ftp://localhost:8787")).toThrow(
      "EXPO_PUBLIC_API_URL must use http or https",
    );
  });

  test("rejects malformed URLs", () => {
    expect(() => getApiBaseUrl("not-a-url")).toThrow(
      "EXPO_PUBLIC_API_URL must be a valid absolute URL",
    );
  });
});
