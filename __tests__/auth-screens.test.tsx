import { LoginScreen } from "@/features/auth/LoginScreen";
import { CreateNewPasswordScreen } from "@/features/auth/CreateNewPasswordScreen";
import { EmailOtpScreen } from "@/features/auth/EmailOtpScreen";
import { ForgotPasswordScreen } from "@/features/auth/ForgotPasswordScreen";
import { fireEvent, render, screen, waitFor } from "@testing-library/react-native";
import { toast } from "sonner-native";

const mockLogin = jest.fn();
const mockSendPasswordResetCode = jest.fn();
const mockVerifyOtp = jest.fn();
const mockResetPassword = jest.fn();

jest.mock("sonner-native", () => ({
  toast: { error: jest.fn(), info: jest.fn() },
}));

const mockToastError = jest.mocked(toast.error);

jest.mock("expo-image", () => ({
  Image: () => null,
}));

jest.mock("@/components/layout/AppScreen", () => {
  const { View } = require("react-native");

  return {
    AppScreen: ({ children }: { children: React.ReactNode }) => <View>{children}</View>,
  };
});

jest.mock("@/components/ui/text", () => {
  const { Text } = require("react-native");

  return {
    Text: ({ children }: { children: React.ReactNode }) => <Text>{children}</Text>,
  };
});

jest.mock("@/components/ui/icon", () => ({
  Icon: () => null,
}));

jest.mock("@/components/ui/button", () => {
  const { Pressable } = require("react-native");

  return {
    Button: ({
      children,
      onPress,
    }: {
      children: React.ReactNode;
      onPress?: () => void;
    }) => <Pressable onPress={onPress}>{children}</Pressable>,
  };
});

jest.mock("@/components/Icon", () => ({
  Check: () => null,
  ChevronLeft: () => null,
}));

jest.mock("@/util/twColor", () => ({
  colors: {
    neutral: {
      400: "#a3a3a3",
    },
    sage: {
      300: "#97afa9",
      400: "#75948c",
      500: "#52796f",
    },
  },
}));

jest.mock("@/data/images", () => ({
  images: {
    authLoginBg: "login-bg",
    authLoginBg2: "login-bg2",
    authForgotPassword: "forget-password",
    authForgotPassword2: "forget-password2",
    authEmailOtp: "email-otp",
    authCreateNewPassword: "create-new-password",
  },
}));

const mockPush = jest.fn();
const mockReplace = jest.fn();
const mockBack = jest.fn();

jest.mock("expo-router", () => ({
  useRouter: () => ({ push: mockPush, replace: mockReplace, back: mockBack }),
  useLocalSearchParams: () => ({ email: "meh@example.com" }),
}));

jest.mock("@/features/auth/useAuth", () => ({
  useAuth: () => ({
    login: mockLogin,
    sendPasswordResetCode: mockSendPasswordResetCode,
    verifyOtp: mockVerifyOtp,
    resetPassword: mockResetPassword,
  }),
}));

describe("auth screens", () => {
  beforeEach(() => {
    mockLogin.mockReset();
    mockSendPasswordResetCode.mockReset();
    mockVerifyOtp.mockReset();
    mockResetPassword.mockReset();
    mockToastError.mockReset();
  });

  it("renders the login screen copy and actions from the approved mockup", () => {
    render(<LoginScreen />);

    expect(screen.getByText("Welcome back")).toBeTruthy();
    expect(screen.getByText("Ready to cook again?")).toBeTruthy();
    expect(screen.getByText("Email")).toBeTruthy();
    expect(screen.getByText("Password")).toBeTruthy();
    expect(screen.getByText("Continue with Google")).toBeTruthy();
    expect(screen.getByText("Create account")).toBeTruthy();
  });

  it("shows login failures as a toast instead of inline text", async () => {
    mockLogin.mockRejectedValueOnce(new Error("Enter your email and password."));

    render(<LoginScreen />);
    fireEvent.press(screen.getByText("Log in"));

    await waitFor(() =>
      expect(mockToastError).toHaveBeenCalledWith("Enter your email and password."),
    );
    expect(screen.queryByText("Enter your email and password.")).toBeNull();
  });

  it("shows password-reset failures as a toast instead of inline text", async () => {
    mockSendPasswordResetCode.mockRejectedValueOnce(new Error("Enter your email address."));

    render(<ForgotPasswordScreen />);
    fireEvent.press(screen.getByText("Send code"));

    await waitFor(() =>
      expect(mockToastError).toHaveBeenCalledWith("Enter your email address."),
    );
    expect(screen.queryByText("Enter your email address.")).toBeNull();
  });

  it("shows verification failures as a toast instead of inline text", async () => {
    mockVerifyOtp.mockRejectedValueOnce(new Error("Enter the 6-digit code."));

    render(<EmailOtpScreen />);
    fireEvent.press(screen.getByText("Verify"));

    await waitFor(() =>
      expect(mockToastError).toHaveBeenCalledWith("Enter the 6-digit code."),
    );
    expect(screen.queryByText("Enter the 6-digit code.")).toBeNull();
  });

  it("shows new-password failures as a toast instead of inline text", async () => {
    mockResetPassword.mockRejectedValueOnce(new Error("Enter a new password."));

    render(<CreateNewPasswordScreen />);
    fireEvent.press(screen.getByText("Update password"));

    await waitFor(() =>
      expect(mockToastError).toHaveBeenCalledWith("Enter a new password."),
    );
    expect(screen.queryByText("Enter a new password.")).toBeNull();
  });

  it("shows the masked destination email on the OTP screen", () => {
    render(<EmailOtpScreen />);

    expect(screen.getByText("meh***@example.com")).toBeTruthy();
    expect(screen.getByText("Enter 6-digit code")).toBeTruthy();
  });

  it("renders password guidance on the reset password screen", () => {
    render(<CreateNewPasswordScreen />);

    expect(screen.getByText("Password strength")).toBeTruthy();
    expect(
      screen.getByText("Use 8+ characters with a mix of letters, numbers and symbols."),
    ).toBeTruthy();
  });
});
