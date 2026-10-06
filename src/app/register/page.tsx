import type { Metadata } from "next";

import { AuthForm } from "@/components/auth/auth-form";

export const metadata: Metadata = {
  title: "Create an account",
  description: "Create an EduTrip account as a student or parent.",
};

export default function RegisterPage() {
  return <AuthForm mode="register" />;
}
