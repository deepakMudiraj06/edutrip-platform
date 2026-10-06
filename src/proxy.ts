import { createServerClient } from "@supabase/ssr";
import { NextRequest, NextResponse } from "next/server";

import { getSupabaseConfig } from "@/lib/supabase/config";
import { isUserRole, type UserRole } from "@/types/auth";

const protectedAreas = ["admin", "student", "parent"] as const;
type ProtectedArea = (typeof protectedAreas)[number];

function isProtectedArea(value: string): value is ProtectedArea {
  return protectedAreas.includes(value as ProtectedArea);
}

function routeForRole(role: UserRole): `/${ProtectedArea}` {
  return `/${role.toLowerCase() as ProtectedArea}`;
}

function redirectWithCookies(
  request: NextRequest,
  response: NextResponse,
  pathname: string,
) {
  const url = request.nextUrl.clone();
  url.pathname = pathname;
  url.search = "";

  const redirectResponse = NextResponse.redirect(url);
  response.cookies.getAll().forEach((cookie) => {
    redirectResponse.cookies.set(cookie);
  });

  return redirectResponse;
}

export async function proxy(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });
  const { url, anonKey } = getSupabaseConfig();
  const supabase = createServerClient(url, anonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        supabaseResponse = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) => {
          supabaseResponse.cookies.set(name, value, options);
        });
      },
    },
  });

  const {
    data: { user },
  } = await supabase.auth.getUser();
  const area = request.nextUrl.pathname.split("/")[1] ?? "";

  if (!user) {
    return redirectWithCookies(request, supabaseResponse, "/login");
  }

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();

  if (profileError || !profile || !isUserRole(profile.role)) {
    await supabase.auth.signOut();
    return redirectWithCookies(request, supabaseResponse, "/login");
  }

  if (isProtectedArea(area) && area !== routeForRole(profile.role).slice(1)) {
    return redirectWithCookies(request, supabaseResponse, routeForRole(profile.role));
  }

  return supabaseResponse;
}

export const config = {
  matcher: ["/admin/:path*", "/student/:path*", "/parent/:path*"],
};
