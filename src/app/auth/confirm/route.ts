import { NextRequest, NextResponse } from "next/server";

import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get("code");
  const resetUrl = new URL("/reset-password", request.url);

  if (!code) {
    resetUrl.searchParams.set("error", "invalid-link");
    return NextResponse.redirect(resetUrl);
  }

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.auth.exchangeCodeForSession(code);

  if (error) {
    resetUrl.searchParams.set("error", "invalid-link");
  }

  return NextResponse.redirect(resetUrl);
}
