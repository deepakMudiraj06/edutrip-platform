-- EduTrip development seed.
--
-- Authentication users and role-specific records are intentionally not seeded
-- here. They must be created through Supabase Auth in a later milestone so
-- this file never contains passwords or service-role credentials.
--
-- Safe non-authentication seed data can be added here when local database
-- testing begins.

insert into public.destinations (
  id,
  name,
  slug,
  description,
  location,
  country,
  image_url,
  is_published
)
values (
  '11111111-1111-1111-1111-111111111111',
  'Jaipur Heritage Trail',
  'jaipur-heritage-trail',
  'A guided exploration of historic forts, markets, and living craft traditions.',
  'Jaipur, Rajasthan',
  'India',
  'https://images.example.com/edutrip/jaipur-heritage.jpg',
  true
)
on conflict (slug) do nothing;

insert into public.trips (
  id,
  destination_id,
  title,
  slug,
  description,
  start_date,
  end_date,
  registration_deadline,
  capacity,
  price,
  status,
  is_published
)
values (
  '22222222-2222-2222-2222-222222222222',
  '11111111-1111-1111-1111-111111111111',
  'Jaipur Heritage Trail 2027',
  'jaipur-heritage-trail-2027',
  'A three-day learning journey through Jaipur history, architecture, and culture.',
  '2027-01-18',
  '2027-01-20',
  '2026-12-18',
  40,
  18500.00,
  'OPEN',
  true
)
on conflict (slug) do nothing;

insert into public.trip_itineraries (
  id,
  trip_id,
  day_number,
  title,
  description,
  activities
)
values
  (
    '33333333-3333-3333-3333-333333333331',
    '22222222-2222-2222-2222-222222222222',
    1,
    'Fort walls and city stories',
    'An introduction to Jaipur''s historic foundations and architectural planning.',
    'Amber Fort visit; guided observation journal; group reflection.'
  ),
  (
    '33333333-3333-3333-3333-333333333332',
    '22222222-2222-2222-2222-222222222222',
    2,
    'Craft, commerce, and community',
    'Students study local craft traditions and the role of markets in city life.',
    'Block-printing workshop; market walk; artisan conversation.'
  ),
  (
    '33333333-3333-3333-3333-333333333333',
    '22222222-2222-2222-2222-222222222222',
    3,
    'Presenting what we learned',
    'Teams synthesize observations and present their trip learnings.',
    'Team presentations; museum visit; closing circle.'
  )
on conflict (trip_id, day_number) do nothing;
