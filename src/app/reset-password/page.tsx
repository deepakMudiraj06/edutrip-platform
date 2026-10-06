import type { Metadata } from "next";
import { Suspense } from "react";

import { PasswordRecoveryForm } from "@/components/auth/password-recovery-form";

export const metadata: Metadata = {
  title: "Reset password",
};

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={null}>
      <PasswordRecoveryForm mode="reset" />
    </Suspense>
  );
}
