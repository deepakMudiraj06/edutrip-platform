-- EduTrip core trip catalogue.

create type public.trip_status as enum (
  'DRAFT',
  'OPEN',
  'FULL',
  'COMPLETED',
  'CANCELLED'
);

create table public.destinations (
  id uuid primary key default gen_random_uuid(),
  name text not null check (btrim(name) <> ''),
  slug text not null check (btrim(slug) <> ''),
  description text,
  location text,
  country text,
  image_url text,
  is_published boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint destinations_slug_key unique (slug)
);

create table public.trips (
  id uuid primary key default gen_random_uuid(),
  destination_id uuid not null references public.destinations(id) on delete restrict,
  title text not null check (btrim(title) <> ''),
  slug text not null check (btrim(slug) <> ''),
  description text,
  start_date date not null,
  end_date date not null,
  registration_deadline date not null,
  capacity integer not null check (capacity > 0),
  price numeric(12, 2) not null default 0 check (price >= 0),
  status public.trip_status not null default 'DRAFT',
  is_published boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint trips_slug_key unique (slug),
  constraint trips_date_order_check check (end_date >= start_date),
  constraint trips_registration_deadline_check check (
    registration_deadline <= start_date
  ),
  constraint trips_published_status_check check (
    not is_published or status <> 'DRAFT'::public.trip_status
  )
);

create table public.trip_itineraries (
  id uuid primary key default gen_random_uuid(),
  trip_id uuid not null references public.trips(id) on delete cascade,
  day_number integer not null check (day_number > 0),
  title text not null check (btrim(title) <> ''),
  description text,
  activities text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint trip_itineraries_trip_day_key unique (trip_id, day_number)
);

create index destinations_publication_idx
  on public.destinations(is_published);

create index trips_destination_id_idx
  on public.trips(destination_id);

create index trips_catalog_filter_idx
  on public.trips(is_published, status, start_date)
  where is_published = true;

create trigger destinations_set_updated_at
before update on public.destinations
for each row execute function public.set_updated_at();

create trigger trips_set_updated_at
before update on public.trips
for each row execute function public.set_updated_at();

create trigger trip_itineraries_set_updated_at
before update on public.trip_itineraries
for each row execute function public.set_updated_at();

alter table public.destinations enable row level security;
alter table public.trips enable row level security;
alter table public.trip_itineraries enable row level security;

-- Anonymous users can only read published catalogue data. Authenticated users
-- have the same read access, but no catalogue write policy unless they are
-- trusted ADMIN users.
revoke all on table
  public.destinations,
  public.trips,
  public.trip_itineraries
from anon;

grant select on table
  public.destinations,
  public.trips,
  public.trip_itineraries
to anon;

grant select, insert, update, delete on table
  public.destinations,
  public.trips,
  public.trip_itineraries
to authenticated;

create policy destinations_public_select
on public.destinations
for select
to anon, authenticated
using (is_published = true);

create policy destinations_admin_all
on public.destinations
for all
to authenticated
using (public.current_user_role() = 'ADMIN'::public.user_role)
with check (public.current_user_role() = 'ADMIN'::public.user_role);

create policy trips_public_select
on public.trips
for select
to anon, authenticated
using (is_published = true);

create policy trips_admin_all
on public.trips
for all
to authenticated
using (public.current_user_role() = 'ADMIN'::public.user_role)
with check (public.current_user_role() = 'ADMIN'::public.user_role);

create policy trip_itineraries_published_select
on public.trip_itineraries
for select
to anon, authenticated
using (
  exists (
    select 1
    from public.trips
    where public.trips.id = trip_itineraries.trip_id
      and public.trips.is_published = true
  )
);

create policy trip_itineraries_admin_all
on public.trip_itineraries
for all
to authenticated
using (public.current_user_role() = 'ADMIN'::public.user_role)
with check (public.current_user_role() = 'ADMIN'::public.user_role);
