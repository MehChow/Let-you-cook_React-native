import { authSessionInvalidation } from "@/features/auth/session";
import { authTokenStorage } from "@/features/auth/tokenStorage";

import { createApiClient } from "./apiClientCore";

export { createApiClient } from "./apiClientCore";

export const apiClient = createApiClient({
  tokenStorage: authTokenStorage,
  onSessionExpired: authSessionInvalidation.notify,
});
