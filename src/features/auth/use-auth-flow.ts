"use client";

import { useQueryClient } from "@tanstack/react-query";
import { maskEmail } from "@v2/utils/format";
import { useCallback, useEffect, useState } from "react";
import { isValidEmail } from "@/utils/validation";
import { RESEND_COOLDOWN_SECONDS } from "./constants";
import { invalidateAuthMe } from "./invalidate-auth";
import { type LastLoginMethod, saveLastLoginMethod } from "./last-login-method";
import type { AuthFlowReturn, AuthStep, UseAuthFlowOptions } from "./types";

const OTP_LENGTH = 6;

async function postJson(path: string, body: unknown): Promise<{ ok: boolean; error: string | null }> {
  const response = await fetch(path, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (response.ok) return { ok: true, error: null };
  const data = (await response.json().catch(() => null)) as { error?: string } | null;
  return { ok: false, error: data?.error ?? "Something went wrong. Try again." };
}

function useAuthFlow({ defaultEmail, onSuccess }: UseAuthFlowOptions): AuthFlowReturn {
  const queryClient = useQueryClient();
  const [step, setStep] = useState<AuthStep>("options");
  const [email, setEmail] = useState(defaultEmail ?? "");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [otpValue, setOtpValue] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [hasResent, setHasResent] = useState(false);

  useEffect(() => {
    if (resendCooldown <= 0) return;
    const timer = setTimeout(() => setResendCooldown((seconds) => seconds - 1), 1000);
    return () => clearTimeout(timer);
  }, [resendCooldown]);

  const completeSignIn = useCallback(
    async (method: LastLoginMethod) => {
      saveLastLoginMethod(method);
      await invalidateAuthMe(queryClient);
      onSuccess();
    },
    [queryClient, onSuccess],
  );

  const signInWithProvider = useCallback(
    async (method: "google" | "linkedin_oidc") => {
      setError(null);
      setIsLoading(true);
      const result = await postJson("/api/auth/mock-sign-in", { method });
      if (!result.ok) {
        setError(result.error);
        setIsLoading(false);
        return;
      }
      await completeSignIn(method);
    },
    [completeSignIn],
  );

  const sendCode = useCallback(async () => {
    const result = await postJson("/api/auth/mock-send-code", { email: email.trim() });
    if (!result.ok) {
      setError(result.error);
      return false;
    }
    setResendCooldown(RESEND_COOLDOWN_SECONDS);
    return true;
  }, [email]);

  const handleEmailSubmit = useCallback(async () => {
    if (!isValidEmail(email.trim())) return;
    setError(null);
    setIsLoading(true);
    const sent = await sendCode();
    setIsLoading(false);
    if (sent) {
      setOtpValue("");
      setStep("otp");
    }
  }, [email, sendCode]);

  const handleOtpChange = useCallback(
    async (value: string) => {
      setOtpValue(value);
      setError(null);
      if (value.length !== OTP_LENGTH) return;
      setIsVerifying(true);
      const result = await postJson("/api/auth/mock-sign-in", { method: "email_code", email: email.trim(), code: value });
      if (!result.ok) {
        setError(result.error);
        setOtpValue("");
        setIsVerifying(false);
        return;
      }
      await completeSignIn("email_code");
    },
    [email, completeSignIn],
  );

  const handleResend = useCallback(async () => {
    if (resendCooldown > 0) return;
    setError(null);
    if (await sendCode()) setHasResent(true);
  }, [resendCooldown, sendCode]);

  const goBack = useCallback(() => {
    setError(null);
    setOtpValue("");
    setStep((current) => (current === "otp" ? "email" : "options"));
  }, []);

  return {
    step,
    email,
    setEmail,
    error,
    isLoading,
    otpValue,
    isVerifying,
    resendCooldown,
    maskedEmail: maskEmail(email.trim()),
    hasResent,
    goToEmail: () => {
      setError(null);
      setStep("email");
    },
    goBack,
    confirmTalentIntent: () => setStep("email"),
    confirmCompanyIntent: () => setStep("email"),
    handleGoogleAuth: () => signInWithProvider("google"),
    handleLinkedInAuth: () => signInWithProvider("linkedin_oidc"),
    handleEmailSubmit,
    handleOtpChange,
    handleResend,
  };
}

export { useAuthFlow };
