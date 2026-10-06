import type { Metadata } from "next";
import { Suspense } from "react";

import { PasswordRecoveryForm } from "@/components/auth/password-recovery-form";

export const metadata: Metadata = {
  title: "Forgot password",
};

export default function ForgotPasswordPage() {
  return (
    <Suspense fallback={null}>
      <PasswordRecoveryForm mode="forgot" />
    </Suspense>
  );
}
