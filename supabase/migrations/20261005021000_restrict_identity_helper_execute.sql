-- Supabase projects may grant function execution directly to API roles by
-- default. Keep the RLS helper available to authenticated policies only.

revoke execute on function public.current_user_role() from anon;
grant execute on function public.current_user_role() to authenticated;
