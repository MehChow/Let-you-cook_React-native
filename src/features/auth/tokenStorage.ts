import * as SecureStore from "expo-secure-store";

import { createAuthTokenStorage } from "./tokenStorageCore";

export { createAuthTokenStorage, type AuthTokenStore } from "./tokenStorageCore";

export const authTokenStorage = createAuthTokenStorage(SecureStore);
