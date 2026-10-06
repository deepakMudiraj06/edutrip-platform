-- Identity data is private by default. Authorization is enforced here rather
-- than by frontend role checks.

create or replace function public.current_user_role()
returns public.user_role
language sql
stable
security definer
set search_path = ''
as $$
  select p.role
  from public.profiles as p
  where p.id = (select auth.uid())
  limit 1;
$$;

-- This helper is used by RLS policies for authenticated requests. Its owner
-- bypasses profiles RLS, preventing profiles policies from recursively
-- querying profiles through the helper.
revoke execute on function public.current_user_role() from public;
grant execute on function public.current_user_role() to authenticated;

alter table public.profiles enable row level security;
alter table public.schools enable row level security;
alter table public.students enable row level security;
alter table public.parents enable row level security;
alter table public.student_parents enable row level security;

-- The API roles need table privileges before RLS policies can restrict rows.
-- No anonymous role receives access to identity tables.
revoke all on table
  public.profiles,
  public.schools,
  public.students,
  public.parents,
  public.student_parents
from anon;

grant select, insert, update, delete on table public.profiles to authenticated;
grant select, insert, update, delete on table public.schools to authenticated;
grant select, insert, update, delete on table public.students to authenticated;
grant select, insert, update, delete on table public.parents to authenticated;
grant select, insert, update, delete on table public.student_parents to authenticated;

-- Profiles

create policy profiles_select_own
on public.profiles
for select
to authenticated
using (
  id = (select auth.uid())
  and role = public.current_user_role()
);

create policy profiles_update_own
on public.profiles
for update
to authenticated
using (
  id = (select auth.uid())
  and role = public.current_user_role()
)
with check (
  id = (select auth.uid())
  and role = public.current_user_role()
);

create policy profiles_admin_all
on public.profiles
for all
to authenticated
using (public.current_user_role() = 'ADMIN'::public.user_role)
with check (public.current_user_role() = 'ADMIN'::public.user_role);

-- Students can read only their own record. Parents can read only records
-- connected through the relationship table. No non-admin write policies are
-- created for student records.

create policy students_select_own
on public.students
for select
to authenticated
using (
  id = (select auth.uid())
  and public.current_user_role() = 'STUDENT'::public.user_role
);

create policy students_parent_linked
on public.students
for select
to authenticated
using (
  public.current_user_role() = 'PARENT'::public.user_role
  and exists (
    select 1
    from public.student_parents as sp
    where sp.student_id = students.id
      and sp.parent_id = (select auth.uid())
  )
);

create policy students_admin_all
on public.students
for all
to authenticated
using (public.current_user_role() = 'ADMIN'::public.user_role)
with check (public.current_user_role() = 'ADMIN'::public.user_role);

-- Parents can read only their own parent record. The table currently has no
-- user-editable fields, so non-admin update/delete policies are intentionally
-- absent.

create policy parents_select_own
on public.parents
for select
to authenticated
using (
  id = (select auth.uid())
  and public.current_user_role() = 'PARENT'::public.user_role
);

create policy parents_admin_all
on public.parents
for all
to authenticated
using (public.current_user_role() = 'ADMIN'::public.user_role)
with check (public.current_user_role() = 'ADMIN'::public.user_role);

-- Relationship visibility is limited to a user's own side of the link.
-- Inserts, updates, and deletes remain admin-only to prevent self-linking or
-- arbitrary reassignment.

create policy student_parents_student_link
on public.student_parents
for select
to authenticated
using (
  student_id = (select auth.uid())
  and public.current_user_role() = 'STUDENT'::public.user_role
);

create policy student_parents_parent_link
on public.student_parents
for select
to authenticated
using (
  parent_id = (select auth.uid())
  and public.current_user_role() = 'PARENT'::public.user_role
);

create policy student_parents_admin_all
on public.student_parents
for all
to authenticated
using (public.current_user_role() = 'ADMIN'::public.user_role)
with check (public.current_user_role() = 'ADMIN'::public.user_role);

-- Schools are private. A student can see only the school linked to their own
-- record, and a parent can see only schools linked to their children.

create policy schools_select_student_linked
on public.schools
for select
to authenticated
using (
  public.current_user_role() = 'STUDENT'::public.user_role
  and exists (
    select 1
    from public.students as s
    where s.id = (select auth.uid())
      and s.school_id = schools.id
  )
);

create policy schools_select_parent_linked
on public.schools
for select
to authenticated
using (
  public.current_user_role() = 'PARENT'::public.user_role
  and exists (
    select 1
    from public.student_parents as sp
    join public.students as s on s.id = sp.student_id
    where sp.parent_id = (select auth.uid())
      and s.school_id = schools.id
  )
);

create policy schools_admin_all
on public.schools
for all
to authenticated
using (public.current_user_role() = 'ADMIN'::public.user_role)
with check (public.current_user_role() = 'ADMIN'::public.user_role);
