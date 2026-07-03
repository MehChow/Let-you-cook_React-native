import "react-native-gesture-handler/jestSetup";

process.env.EXPO_OS = "web";

Object.defineProperty(globalThis, "fetch", {
  configurable: true,
  value: jest.fn(),
  writable: true,
});

jest.mock("react-native-reanimated", () => {
  const Reanimated = require("react-native-reanimated/mock");
  Reanimated.default.call = () => {};
  return Reanimated;
});
