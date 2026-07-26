const DEFAULT_ANDROID_API_URL = "http://10.0.2.2:8787";

// Resolves and validates the backend URL used by mobile requests.
export const getApiBaseUrl = (value?: string): string => {
  const candidate = value?.trim() || DEFAULT_ANDROID_API_URL;
  let parsed: URL;

  try {
    parsed = new URL(candidate);
  } catch {
    throw new Error("EXPO_PUBLIC_API_URL must be a valid absolute URL");
  }

  if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
    throw new Error("EXPO_PUBLIC_API_URL must use http or https");
  }

  return candidate.replace(/\/+$/, "");
};

export const appEnv = Object.freeze({
  apiBaseUrl: getApiBaseUrl(process.env.EXPO_PUBLIC_API_URL),
});
