import { appEnv } from "@/config/env";
import { apiClient } from "@/lib/apiClient";
import type { AppType } from "@letyoucook/server";
import { hc } from "hono/client";

export interface TypedApiClientOptions {
  baseUrl?: string;
  fetch?: typeof fetch;
}

// Creates the AppType-derived client for a normalized API origin.
export const createTypedApiClient = (options: TypedApiClientOptions = {}) => {
  const baseUrl = (options.baseUrl ?? appEnv.apiBaseUrl).replace(/\/+$/, "");
  return hc<AppType>(baseUrl, { fetch: options.fetch ?? apiClient.request });
};

export const typedApiClient = createTypedApiClient();
