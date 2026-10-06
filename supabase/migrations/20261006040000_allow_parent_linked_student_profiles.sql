-- Allow parents to read only the profiles of students linked to them.

create policy profiles_parent_select_linked_students
on public.profiles
for select
to authenticated
using (
  public.current_user_role() = 'PARENT'::public.user_role
  and exists (
    select 1
    from public.student_parents as sp
    where sp.student_id = profiles.id
      and sp.parent_id = (select auth.uid())
  )
);
