import { isUserRole } from "@/types/auth";
import type {
  AuthClient,
  AuthResult,
  AuthService,
  ResetPasswordInput,
  SignInData,
  SignInInput,
  SignUpData,
  SignUpInput,
  UpdatePasswordInput,
  UserRoleData,
} from "@/types/auth";

const PUBLIC_REGISTRATION_ROLES = ["STUDENT", "PARENT"] as const;

function isPublicRegistrationRole(role: SignUpInput["role"]): boolean {
  return PUBLIC_REGISTRATION_ROLES.includes(role);
}

export function createAuthService(supabase: AuthClient): AuthService {
  return {
    async signUp(input: SignUpInput): Promise<AuthResult<SignUpData>> {
      if (!isPublicRegistrationRole(input.role)) {
        return {
          data: null,
          error: new Error("Public registration is limited to STUDENT and PARENT accounts."),
        };
      }

      const { data, error } = await supabase.auth.signUp({
        email: input.email,
        password: input.password,
        options: {
          emailRedirectTo: input.emailRedirectTo,
          data: {
            full_name: input.fullName,
            phone: input.phone,
            role: input.role,
          },
        },
      });

      if (error) {
        return { data: null, error };
      }

      return { data, error: null };
    },

    async signIn(input: SignInInput): Promise<AuthResult<SignInData>> {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: input.email,
        password: input.password,
      });

      if (error) {
        return { data: null, error };
      }

      return { data, error: null };
    },

    async getCurrentUserRole(): Promise<AuthResult<UserRoleData>> {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError) {
        return { data: null, error: userError };
      }

      if (!user) {
        return { data: null, error: new Error("No authenticated user was found.") };
      }

      const { data, error } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .maybeSingle();

      if (error) {
        return { data: null, error };
      }

      if (!data || !isUserRole(data.role)) {
        return { data: null, error: new Error("The authenticated user has no valid profile role.") };
      }

      return { data: { role: data.role }, error: null };
    },

    async signOut(): Promise<AuthResult<void>> {
      const { error } = await supabase.auth.signOut();

      if (error) {
        return { data: null, error };
      }

      return { data: undefined, error: null };
    },

    async resetPassword(input: ResetPasswordInput): Promise<AuthResult<void>> {
      const { error } = await supabase.auth.resetPasswordForEmail(input.email, {
        redirectTo: input.redirectTo,
      });

      if (error) {
        return { data: null, error };
      }

      return { data: undefined, error: null };
    },

    async updatePassword(input: UpdatePasswordInput): Promise<AuthResult<void>> {
      const { error } = await supabase.auth.updateUser({
        password: input.password,
      });

      if (error) {
        return { data: null, error };
      }

      return { data: undefined, error: null };
    },
  };
}
