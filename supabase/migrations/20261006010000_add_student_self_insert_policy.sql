-- Allow a student to create only the student row owned by their Auth user.
-- This remains a permissive policy so it OR-combines with the existing admin
-- FOR ALL policy; the WITH CHECK condition is the restrictive boundary.

create policy students_insert_own
on public.students
for insert
to authenticated
with check (
  id = (select auth.uid())
  and public.current_user_role() = 'STUDENT'::public.user_role
);
