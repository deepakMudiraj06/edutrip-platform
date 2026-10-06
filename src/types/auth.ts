import type { AuthError, Session, SupabaseClient, User } from "@supabase/supabase-js";

export type UserRole = "ADMIN" | "STUDENT" | "PARENT";

export type PublicRegistrationRole = Exclude<UserRole, "ADMIN">;

export function isUserRole(value: unknown): value is UserRole {
  return value === "ADMIN" || value === "STUDENT" || value === "PARENT";
}

export type AuthClient = SupabaseClient;

export type AuthResult<T> =
  | { data: T; error: null }
  | { data: null; error: AuthError | Error };

export type SignUpInput = {
  email: string;
  password: string;
  fullName: string;
  role: PublicRegistrationRole;
  phone?: string;
  emailRedirectTo?: string;
};

export type SignInInput = {
  email: string;
  password: string;
};

export type ResetPasswordInput = {
  email: string;
  redirectTo?: string;
};

export type UpdatePasswordInput = {
  password: string;
};

export type SignUpData = {
  user: User | null;
  session: Session | null;
};

export type SignInData = {
  user: User;
  session: Session;
};

export type UserRoleData = {
  role: UserRole;
};

export type AuthService = {
  signUp(input: SignUpInput): Promise<AuthResult<SignUpData>>;
  signIn(input: SignInInput): Promise<AuthResult<SignInData>>;
  getCurrentUserRole(): Promise<AuthResult<UserRoleData>>;
  signOut(): Promise<AuthResult<void>>;
  resetPassword(input: ResetPasswordInput): Promise<AuthResult<void>>;
  updatePassword(input: UpdatePasswordInput): Promise<AuthResult<void>>;
};
