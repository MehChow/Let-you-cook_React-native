import { LoginScreen } from "@/features/auth/LoginScreen";
import { CreateAccountScreen } from "@/features/auth/CreateAccountScreen";
import { CreateNewPasswordScreen } from "@/features/auth/CreateNewPasswordScreen";
import { EmailOtpScreen } from "@/features/auth/EmailOtpScreen";
import { ForgotPasswordScreen } from "@/features/auth/ForgotPasswordScreen";
import { fireEvent, render, screen, waitFor } from "@testing-library/react-native";
import { toast } from "sonner-native";

const mockLogin = jest.fn();
const mockCreateAccount = jest.fn();
const mockUseCreateAccount = jest.fn(() => ({
  createAccount: mockCreateAccount,
  isCreating: false,
}));
const mockSendPasswordResetCode = jest.fn();
const mockVerifyOtp = jest.fn();
const mockResetPassword = jest.fn();
const mockSendCode = jest.fn();
const mockClearPasswordResetFlow = jest.fn();
const mockClearPasswordResetForAnotherEmail = jest.fn();
const mockCooldown = { remainingSeconds: 45, isCoolingDown: true };
const mockResume = { pendingEmail: null as string | null, shouldResume: false };
const mockUsePasswordResetResume = jest.fn(() => mockResume);

jest.mock("sonner-native", () => ({
  toast: { error: jest.fn(), info: jest.fn(), success: jest.fn() },
}));

const mockToastError = jest.mocked(toast.error);
const mockToastSuccess = jest.mocked(toast.success);

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
    authCreateAccount: "create-account",
    authCreateNewPassword: "create-new-password",
  },
}));

const mockPush = jest.fn();
const mockReplace = jest.fn();
const mockBack = jest.fn();
const mockDismissTo = jest.fn();
const mockSearchParams = { email: "meh@example.com", mode: undefined as string | undefined };

jest.mock("expo-router", () => ({
  useRouter: () => ({
    push: mockPush,
    replace: mockReplace,
    back: mockBack,
    dismissTo: mockDismissTo,
  }),
  useLocalSearchParams: () => mockSearchParams,
}));

jest.mock("@/features/auth/useAuth", () => ({
  useAuth: () => ({
    login: mockLogin,
    sendPasswordResetCode: mockSendPasswordResetCode,
    verifyOtp: mockVerifyOtp,
    resetPassword: mockResetPassword,
  }),
}));

jest.mock("@/features/auth/useCreateAccount", () => ({
  useCreateAccount: () => mockUseCreateAccount(),
}));

jest.mock("@/features/auth/useSendPasswordResetCode", () => ({
  useSendPasswordResetCode: () => ({ sendCode: mockSendCode, isSending: false }),
  usePasswordResetCooldown: () => mockCooldown,
  usePasswordResetResume: () => mockUsePasswordResetResume(),
  clearPasswordResetFlow: () => mockClearPasswordResetFlow(),
  clearPasswordResetForAnotherEmail: () => mockClearPasswordResetForAnotherEmail(),
}));

describe("auth screens", () => {
  beforeEach(() => {
    mockLogin.mockReset();
    mockCreateAccount.mockReset();
    mockUseCreateAccount.mockReturnValue({
      createAccount: mockCreateAccount,
      isCreating: false,
    });
    mockSendPasswordResetCode.mockReset();
    mockVerifyOtp.mockReset();
    mockResetPassword.mockReset();
    mockSendCode.mockReset();
    mockClearPasswordResetFlow.mockReset();
    mockClearPasswordResetForAnotherEmail.mockReset();
    mockCooldown.remainingSeconds = 45;
    mockCooldown.isCoolingDown = true;
    mockResume.pendingEmail = null;
    mockResume.shouldResume = false;
    mockUsePasswordResetResume.mockReturnValue(mockResume);
    mockToastError.mockReset();
    mockToastSuccess.mockReset();
    mockReplace.mockReset();
    mockDismissTo.mockReset();
    mockSearchParams.mode = undefined;
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

  it("renders the create-account fields and action", () => {
    render(<CreateAccountScreen />);

    expect(screen.getByText("Create your account")).toBeTruthy();
    expect(screen.getByPlaceholderText("Your name")).toBeTruthy();
    expect(screen.getByPlaceholderText("name@example.com")).toBeTruthy();
    expect(screen.getByPlaceholderText("Enter your password")).toBeTruthy();
    expect(screen.getByPlaceholderText("Confirm your password")).toBeTruthy();
    expect(screen.getByText("Create account")).toBeTruthy();
  });

  it("blocks an invalid create-account submission", async () => {
    render(<CreateAccountScreen />);

    fireEvent.press(screen.getByText("Create account"));

    await waitFor(() => expect(mockToastError).toHaveBeenCalledWith("Enter your name."));
    expect(mockCreateAccount).not.toHaveBeenCalled();
  });

  it("normalizes valid create-account values before the local mutation", async () => {
    mockCreateAccount.mockResolvedValueOnce(undefined);

    render(<CreateAccountScreen />);
    fireEvent.changeText(screen.getByPlaceholderText("Your name"), "  Mei Lin  ");
    fireEvent.changeText(screen.getByPlaceholderText("name@example.com"), " MEI@EXAMPLE.COM ");
    fireEvent.changeText(screen.getByPlaceholderText("Enter your password"), "cook1234");
    fireEvent.changeText(screen.getByPlaceholderText("Confirm your password"), "cook1234");
    fireEvent.press(screen.getByText("Create account"));

    await waitFor(() =>
      expect(mockCreateAccount).toHaveBeenCalledWith({
        displayName: "Mei Lin",
        email: "mei@example.com",
        password: "cook1234",
      }),
    );
    await waitFor(() =>
      expect(mockLogin).toHaveBeenCalledWith({
        email: "mei@example.com",
        password: "cook1234",
      }),
    );
    expect(mockToastSuccess).toHaveBeenCalledWith("Account created.");
    expect(mockReplace).toHaveBeenCalledWith("/private/(tabs)");
  });

  it("shows the local mutation failure as a toast", async () => {
    mockCreateAccount.mockRejectedValueOnce(new Error("Unable to create account."));

    render(<CreateAccountScreen />);
    fireEvent.changeText(screen.getByPlaceholderText("Your name"), "Mei Lin");
    fireEvent.changeText(screen.getByPlaceholderText("name@example.com"), "mei@example.com");
    fireEvent.changeText(screen.getByPlaceholderText("Enter your password"), "cook1234");
    fireEvent.changeText(screen.getByPlaceholderText("Confirm your password"), "cook1234");
    fireEvent.press(screen.getByText("Create account"));

    await waitFor(() =>
      expect(mockToastError).toHaveBeenCalledWith("Unable to create account."),
    );
    expect(mockReplace).not.toHaveBeenCalled();
  });

  it("disables the create-account action while creating", () => {
    mockUseCreateAccount.mockReturnValue({
      createAccount: mockCreateAccount,
      isCreating: true,
    });

    render(<CreateAccountScreen />);

    expect(screen.getByText("Creating...")).toBeTruthy();
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
    mockCooldown.remainingSeconds = 0;
    mockCooldown.isCoolingDown = false;
    mockSendCode.mockRejectedValueOnce(new Error("Enter your email address."));

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

  it("resumes an active reset flow when the forgot-password page reopens", async () => {
    mockResume.pendingEmail = "gg@gmail.com";
    mockResume.shouldResume = true;

    render(<ForgotPasswordScreen />);

    await waitFor(() =>
      expect(mockReplace).toHaveBeenCalledWith({
        pathname: "/auth/email-otp",
        params: { email: "gg@gmail.com" },
      }),
    );
    expect(mockSendCode).not.toHaveBeenCalled();
  });

  it("does not auto-resume while choosing another email", async () => {
    mockResume.pendingEmail = "gg@gmail.com";
    mockResume.shouldResume = true;
    mockSearchParams.mode = "another-email";

    render(<ForgotPasswordScreen />);

    await new Promise((resolve) => setTimeout(resolve, 0));
    expect(mockReplace).not.toHaveBeenCalled();
  });

  it("renders the active resend cooldown", () => {
    render(<EmailOtpScreen />);

    expect(screen.getByText("Resend in 00:45")).toBeTruthy();
  });

  it("resends the code and shows a success toast after cooldown expires", async () => {
    mockCooldown.remainingSeconds = 0;
    mockCooldown.isCoolingDown = false;
    mockSendCode.mockResolvedValue(undefined);

    render(<EmailOtpScreen />);
    fireEvent.press(screen.getByText("Resend code"));

    await waitFor(() => expect(mockSendCode).toHaveBeenCalledWith("meh@example.com"));
    expect(mockToastSuccess).toHaveBeenCalledWith("A new code was sent.");
  });

  it("lets the user abandon the current reset flow and use another email", () => {
    render(<EmailOtpScreen />);

    fireEvent.press(screen.getByText("Use another email"));

    expect(mockClearPasswordResetForAnotherEmail).not.toHaveBeenCalled();
    expect(mockDismissTo).toHaveBeenCalledWith({
      pathname: "/auth/forgot-password",
      params: { mode: "another-email" },
    });
  });

  it("clears the pending reset flow after OTP verification succeeds", async () => {
    mockVerifyOtp.mockResolvedValue(undefined);

    render(<EmailOtpScreen />);
    fireEvent.press(screen.getByText("Verify"));

    await waitFor(() => expect(mockClearPasswordResetFlow).toHaveBeenCalledTimes(1));
  });

  it("renders password guidance on the reset password screen", () => {
    render(<CreateNewPasswordScreen />);

    expect(screen.getByText("Password strength")).toBeTruthy();
    expect(
      screen.getByText("Use 8+ characters with a mix of letters, numbers and symbols."),
    ).toBeTruthy();
  });
});
