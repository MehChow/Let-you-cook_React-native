export interface PasswordStrength {
  activeSegments: number;
  label: "Weak" | "Good" | "Strong";
  meetsLength: boolean;
  meetsMix: boolean;
}

export function maskEmailAddress(email?: string) {
  if (!email) {
    return "your inbox";
  }

  const [localPart, domain] = email.split("@");

  if (!localPart || !domain) {
    return email;
  }

  return `${localPart.slice(0, Math.min(localPart.length, 3))}***@${domain}`;
}

export function getPasswordStrength(password: string): PasswordStrength {
  const hasLetter = /[A-Za-z]/.test(password);
  const hasNumber = /\d/.test(password);
  const hasSymbol = /[^A-Za-z0-9]/.test(password);
  const meetsLength = password.length >= 8;
  const meetsMix = hasLetter && (hasNumber || hasSymbol);

  if (!password) {
    return {
      activeSegments: 0,
      label: "Weak",
      meetsLength,
      meetsMix,
    };
  }

  if (!meetsLength) {
    return {
      activeSegments: 1,
      label: "Weak",
      meetsLength,
      meetsMix,
    };
  }

  if (hasLetter && hasNumber && hasSymbol) {
    return {
      activeSegments: 4,
      label: "Strong",
      meetsLength,
      meetsMix,
    };
  }

  if (meetsMix) {
    return {
      activeSegments: 3,
      label: "Strong",
      meetsLength,
      meetsMix,
    };
  }

  return {
    activeSegments: 2,
    label: "Good",
    meetsLength,
    meetsMix,
  };
}
