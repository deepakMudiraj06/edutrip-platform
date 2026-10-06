-- EduTrip trip registration foundation. Payment data is intentionally separate.

create type public.trip_registration_status as enum (
  'PENDING',
  'CONFIRMED',
  'CANCELLED'
);

create table public.trip_registrations (
  id uuid primary key default gen_random_uuid(),
  trip_id uuid not null references public.trips(id) on delete cascade,
  student_id uuid not null references public.students(id) on delete cascade,
  status public.trip_registration_status not null default 'PENDING',
  registered_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint trip_registrations_trip_student_key unique (trip_id, student_id)
);

create index trip_registrations_student_id_idx
  on public.trip_registrations(student_id);

create index trip_registrations_trip_id_idx
  on public.trip_registrations(trip_id);

create index trip_registrations_status_idx
  on public.trip_registrations(status);

create trigger trip_registrations_set_updated_at
before update on public.trip_registrations
for each row execute function public.set_updated_at();

alter table public.trip_registrations enable row level security;

revoke all on table public.trip_registrations from anon;

grant select, insert, update, delete
on table public.trip_registrations
to authenticated;

create policy trip_registrations_admin_all
on public.trip_registrations
for all
to authenticated
using (public.current_user_role() = 'ADMIN'::public.user_role)
with check (public.current_user_role() = 'ADMIN'::public.user_role);

create policy trip_registrations_student_select_own
on public.trip_registrations
for select
to authenticated
using (
  student_id = (select auth.uid())
  and public.current_user_role() = 'STUDENT'::public.user_role
);

create policy trip_registrations_parent_select_linked
on public.trip_registrations
for select
to authenticated
using (
  public.current_user_role() = 'PARENT'::public.user_role
  and exists (
    select 1
    from public.student_parents as sp
    where sp.student_id = trip_registrations.student_id
      and sp.parent_id = (select auth.uid())
  )
);
