-- EduTrip identity foundation.
-- Authentication credentials remain in Supabase's auth.users table.

create type public.user_role as enum ('ADMIN', 'STUDENT', 'PARENT');

create type public.guardian_relationship as enum (
  'PARENT',
  'GUARDIAN',
  'OTHER'
);

-- PostgreSQL and Supabase provide gen_random_uuid() without requiring a
-- project-specific extension for this schema.
create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null check (btrim(full_name) <> ''),
  role public.user_role not null,
  phone text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.schools (
  id uuid primary key default gen_random_uuid(),
  name text not null check (btrim(name) <> ''),
  code text unique check (code is null or btrim(code) <> ''),
  address text,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.students (
  id uuid primary key references public.profiles(id) on delete cascade,
  school_id uuid references public.schools(id) on delete set null,
  student_number text check (
    student_number is null or btrim(student_number) <> ''
  ),
  grade_level text check (grade_level is null or btrim(grade_level) <> ''),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.parents (
  id uuid primary key references public.profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.student_parents (
  student_id uuid not null references public.students(id) on delete cascade,
  parent_id uuid not null references public.parents(id) on delete cascade,
  relationship_type public.guardian_relationship not null default 'PARENT',
  is_primary boolean not null default false,
  created_at timestamptz not null default now(),
  primary key (student_id, parent_id)
);

create index profiles_role_idx on public.profiles(role);

create index schools_active_idx
  on public.schools(is_active)
  where is_active = true;

create index students_school_idx on public.students(school_id);

-- The student_id side is already indexed by the composite primary key.
create index student_parents_parent_idx
  on public.student_parents(parent_id);

-- A student can have several guardians, but only one can be marked primary.
create unique index student_parents_one_primary_idx
  on public.student_parents(student_id)
  where is_primary = true;

create trigger profiles_set_updated_at
before update on public.profiles
for each row execute function public.set_updated_at();

create trigger schools_set_updated_at
before update on public.schools
for each row execute function public.set_updated_at();

create trigger students_set_updated_at
before update on public.students
for each row execute function public.set_updated_at();

create trigger parents_set_updated_at
before update on public.parents
for each row execute function public.set_updated_at();
