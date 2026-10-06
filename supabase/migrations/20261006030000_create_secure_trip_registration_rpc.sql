-- Atomically register the authenticated student for an eligible trip.
-- Capacity counts PENDING and CONFIRMED registrations; CANCELLED does not count.

create or replace function public.register_for_trip(p_trip_id uuid)
returns table (
  success boolean,
  code text,
  message text,
  registration_id uuid
)
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_user_id uuid;
  v_trip public.trips%rowtype;
  v_existing public.trip_registrations%rowtype;
  v_has_existing boolean;
  v_active_count bigint;
begin
  v_user_id := auth.uid();

  if v_user_id is null then
    return query select false, 'unauthenticated', 'Authentication is required.', null::uuid;
    return;
  end if;

  if not exists (
    select 1
    from public.profiles as p
    where p.id = v_user_id
  ) then
    return query select false, 'student_profile_missing', 'A user profile is required.', null::uuid;
    return;
  end if;

  if public.current_user_role() is distinct from 'STUDENT'::public.user_role then
    return query select false, 'not_student', 'Only student accounts can register for trips.', null::uuid;
    return;
  end if;

  if not exists (
    select 1
    from public.students as s
    where s.id = v_user_id
  ) then
    return query select false, 'student_profile_missing', 'A student profile is required.', null::uuid;
    return;
  end if;

  -- Serialise registrations for this trip before checking duplicates/capacity.
  select t.*
  into v_trip
  from public.trips as t
  where t.id = p_trip_id
  for update;

  if not found then
    return query select false, 'trip_not_found', 'The requested trip was not found.', null::uuid;
    return;
  end if;

  if not v_trip.is_published then
    return query select false, 'trip_not_published', 'This trip is not available for registration.', null::uuid;
    return;
  end if;

  if v_trip.status <> 'OPEN'::public.trip_status then
    return query select false, 'trip_not_open', 'This trip is not open for registration.', null::uuid;
    return;
  end if;

  -- registration_deadline is a DATE in the existing trips schema, so its date
  -- is inclusive and registration closes after that calendar date.
  if v_trip.registration_deadline is not null
     and current_date > v_trip.registration_deadline then
    return query select false, 'registration_deadline_passed', 'Registration for this trip has closed.', null::uuid;
    return;
  end if;

  select r.*
  into v_existing
  from public.trip_registrations as r
  where r.trip_id = v_trip.id
    and r.student_id = v_user_id;

  v_has_existing := found;

  if v_has_existing and v_existing.status <> 'CANCELLED'::public.trip_registration_status then
    return query select false, 'already_registered', 'You are already registered for this trip.', v_existing.id;
    return;
  end if;

  select count(*)
  into v_active_count
  from public.trip_registrations as r
  where r.trip_id = v_trip.id
    and r.status in (
      'PENDING'::public.trip_registration_status,
      'CONFIRMED'::public.trip_registration_status
    );

  if v_active_count >= v_trip.capacity then
    return query select false, 'trip_full', 'This trip has reached capacity.', null::uuid;
    return;
  end if;

  if v_has_existing then
    update public.trip_registrations
    set status = 'PENDING'::public.trip_registration_status,
        registered_at = now()
    where id = v_existing.id
    returning id into registration_id;
  else
    insert into public.trip_registrations (trip_id, student_id, status, registered_at)
    values (
      v_trip.id,
      v_user_id,
      'PENDING'::public.trip_registration_status,
      now()
    )
    returning id into registration_id;
  end if;

  return query select true, 'registered', 'Trip registration created.', registration_id;
exception
  when others then
    return query select false, 'registration_failed', 'The trip registration could not be completed.', null::uuid;
end;
$$;

revoke execute on function public.register_for_trip(uuid) from public;
revoke execute on function public.register_for_trip(uuid) from anon;
grant execute on function public.register_for_trip(uuid) to authenticated;
