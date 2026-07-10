import { createMMKV } from "react-native-mmkv";

import type { CooldownStorage } from "./passwordResetCooldownCore";

const storage = createMMKV();

export const passwordResetCooldownStorage: CooldownStorage = {
  getNumber: (key) => storage.getNumber(key),
  getString: (key) => storage.getString(key),
  set: (key, value) => storage.set(key, value),
  setString: (key, value) => storage.set(key, value),
  remove: (key) => storage.remove(key),
};
