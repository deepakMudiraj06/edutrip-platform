-- Create the application profile whenever Supabase Auth creates a user.
-- Credentials remain managed exclusively by auth.users.

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  requested_role text;
  profile_role public.user_role;
  profile_full_name text;
  profile_phone text;
begin
  requested_role := upper(
    btrim(coalesce(new.raw_user_meta_data ->> 'role', ''))
  );

  -- Client metadata is untrusted. ADMIN and unknown values intentionally
  -- fall back to the least-privileged public role.
  profile_role := case requested_role
    when 'PARENT' then 'PARENT'::public.user_role
    else 'STUDENT'::public.user_role
  end;

  profile_full_name := nullif(
    btrim(coalesce(new.raw_user_meta_data ->> 'full_name', '')),
    ''
  );

  profile_phone := nullif(
    btrim(coalesce(new.raw_user_meta_data ->> 'phone', '')),
    ''
  );

  insert into public.profiles (id, full_name, role, phone)
  values (
    new.id,
    coalesce(profile_full_name, 'EduTrip user'),
    profile_role,
    profile_phone
  )
  on conflict (id) do nothing;

  return new;
end;
$$;

-- The function is intended to run only through the auth.users trigger.
revoke execute on function public.handle_new_user() from public;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
