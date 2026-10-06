# EduTrip

EduTrip is a full-stack educational trip management website for students, parents, schools, and administrators. It provides a public trip catalogue, secure student registration, role-based dashboards, and database-level access control for educational travel workflows.

The current project is a responsive web application. Mobile apps, live payment processing, notifications, and realtime features are future work and are not implemented.

## Project Overview

EduTrip addresses the operational gap between discovering an educational trip and keeping the people involved informed about it. Students can explore and register for trips, parents can view linked children and their registrations, and administrators can review catalogue and registration activity.

### Current capabilities

- Public educational trip catalogue and trip detail pages
- Email/password authentication through Supabase Auth
- Student profile setup and student-only registration flow
- Student My Trips dashboard
- Read-only Parent Dashboard for linked students
- Read-only Admin Dashboard with catalogue and registration metrics
- Registration status and trip pricing visibility
- Payment-ready UI foundation without payment processing
- Server-side role protection and PostgreSQL Row Level Security

## Features

### Public website

- Responsive homepage with platform overview and real featured trip data when available
- Published educational trip catalogue
- Trip detail pages with destination, dates, price, capacity, status, and itinerary
- Responsive navigation and footer
- Empty, loading, error, and not-found states

### Authentication

- Student and parent registration
- Email/password login and logout
- Password recovery and password reset
- Role-based protected routes
- Public registration restricted to `STUDENT` and `PARENT`
- Controlled administrator role assignment through trusted server-side processes

### Student experience

- Student profile setup with student number, grade, and school
- Browse published trips
- Register for an eligible trip
- View My Trips
- View registration status, dates, destination, and real trip pricing
- Payment-ready display that clearly states payments are not available yet

### Parent experience

- View students linked through `student_parents`
- View linked student number, grade, and school information
- View registrations belonging to linked students
- Open the public trip detail page for a registered trip
- Read-only access with no registration or relationship management actions

### Admin experience

- Read-only admin dashboard
- Total trip, student, and registration metrics
- Published/open trip count
- Trip table with destination, dates, status, capacity, price, and registration counts

### Security

- Supabase Auth for identity and sessions
- Server-side role checks with `requireRole()` and route middleware
- PostgreSQL Row Level Security for database authorization
- Authenticated ownership derived from `auth.uid()`
- Secure `register_for_trip` PostgreSQL RPC
- No service-role key used by the website application

## Tech Stack

### Frontend

- Next.js 16 App Router
- React 19
- TypeScript
- Tailwind CSS 4

### Backend and data

- Supabase
- PostgreSQL
- Supabase Auth
- PostgreSQL Row Level Security
- Supabase SSR client integration

### Validation and development

- Zod
- ESLint
- TypeScript compiler checks through the Next.js build
- npm

## Architecture

```text
Browser
   |
   v
Next.js App Router
   |
   +-- Server Components
   +-- Server Actions
   +-- Client UI for interactive forms only
   |
   v
Typed service layer
   |
   v
Supabase
   +-- Supabase Auth
   +-- PostgreSQL
   +-- Row Level Security
   +-- Secure registration RPC
```

The application uses Next.js Server Components by default. Route pages create the authenticated Supabase server client and call typed services for data access. Server Actions handle the student registration interaction and delegate to the registration service. PostgreSQL RLS remains the database authorization boundary, while route-level role checks prevent users from entering the wrong protected workspace.

There is no separate custom backend API in this project. Supabase provides authentication and database access through the server client and controlled database functions.

## Project Structure

```text
src/
  app/                  App Router pages, layouts, metadata, and Server Actions
  components/           Shared and feature-specific UI components
  lib/                  Supabase clients and authentication utilities
  services/             Typed authentication, catalogue, student, parent,
                        registration, and admin data services
  types/                Shared TypeScript domain and service result types
  proxy.ts              Session refresh and protected route role routing

supabase/
  migrations/           Versioned PostgreSQL schema, functions, and RLS policies
  seed.sql              Safe non-authentication catalogue seed data

public/                 Static public assets
```

The repository currently does not contain a separate `hooks/` or `utils/` directory; reusable logic is kept in the existing service and `lib` structure.

## Security Architecture

### Authentication

Supabase Auth owns user credentials in `auth.users`. Application identity is represented by `public.profiles`, whose ID references the Auth user ID. Passwords are never stored in application tables.

### Authorization

Protected route pages call the existing `requireRole()` utility with the server Supabase client. `src/proxy.ts` refreshes the SSR session, reads the profile role, and redirects unauthenticated or mismatched users to the correct route.

### Database authorization

PostgreSQL RLS policies enforce row visibility and write permissions. The trusted `public.current_user_role()` helper is a narrowly scoped `SECURITY DEFINER` function with a fixed search path and is used by policies without recursively querying profiles through normal user access.

### Ownership and registration

Ownership is derived from the authenticated request through `auth.uid()`. The application does not use client-provided `student_id` or `parent_id` as an authorization boundary. Student registration calls the `register_for_trip` RPC, which derives the user identity server-side and applies eligibility and capacity rules atomically.

The website uses the Supabase publishable anonymous key with RLS. It does not use a service-role key.

## Role Access Model

| Role | Access |
| --- | --- |
| Student | Own profile, own student record, published trips, and own registrations |
| Parent | Own parent workspace, linked student records, and registrations belonging to linked students |
| Admin | Read-only administrative dashboard data and admin-authorized database access through existing RLS policies |

## Database Model

The main tables are:

- `profiles`: application identity, display name, phone, and trusted role
- `schools`: school information linked to student records
- `students`: student-specific information linked to a profile
- `parents`: parent-specific identity records
- `student_parents`: parent-to-student relationship links
- `destinations`: educational travel destinations
- `trips`: published or managed trips, including dates, capacity, status, and price
- `trip_itineraries`: day-by-day trip content
- `trip_registrations`: student registrations linked to trips and registration status

Important relationships include:

```text
auth.users 1--1 profiles
profiles   1--0..1 students
profiles   1--0..1 parents
parents    1--many student_parents many--1 students
destinations 1--many trips
trips      1--many trip_itineraries
students   1--many trip_registrations many--1 trips
```

There is currently no payments table. Trip pricing comes from `trips.price` and the payment UI is intentionally a non-functional readiness placeholder.

## Registration Flow

```text
Student
   |
   v
Trip detail page
   |
   v
Registration Server Action
   |
   v
Registration service
   |
   v
register_for_trip RPC
   |
   v
PostgreSQL transaction and RLS
   |
   v
PENDING registration
```

The secure RPC currently enforces:

- authenticated user requirement
- `STUDENT` role requirement
- student record requirement
- published trip requirement
- `OPEN` trip status requirement
- inclusive registration deadline handling
- duplicate registration prevention
- capacity checks counting `PENDING` and `CONFIRMED` registrations
- reactivation of a `CANCELLED` registration as `PENDING`
- atomic trip locking while checking capacity and creating or reactivating a registration

The RPC execute permission is restricted to authenticated users. The registration service maps database responses into typed, user-safe result codes.

## Payment Status

The project includes a payment domain type foundation and display-only payment messaging in student and parent trip views. It uses the real trip price from `trips.price` and clearly displays that payment integration is coming soon.

Real Razorpay payment processing is **not implemented**. The project does not currently include:

- Razorpay checkout
- server-side order creation
- payment verification
- webhooks or signature verification
- refunds
- instalments
- payment records or transactions

These are future integration work, not current functionality.

## Local Setup

### Prerequisites

- Node.js 20.9 or newer
- npm
- A Supabase project for Auth and PostgreSQL
- Supabase CLI for applying database migrations

### Install

```bash
npm install
```

### Environment variables

Copy the example environment file:

```bash
cp .env.example .env.local
```

Set the values from the Supabase project settings:

```text
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
```

Only the public Supabase URL and publishable anonymous key are required by the current web client. Do not add database passwords, access tokens, or service-role credentials to `.env.local`, source code, or the README.

### Database migrations

The migration files in `supabase/migrations/` are the database source of truth. Link the local Supabase CLI to the intended project and apply migrations with:

```bash
supabase login
supabase link --project-ref <your-project-ref>
supabase db push
```

For a local Supabase database, `supabase db reset` applies the migrations and the local seed workflow. `supabase/seed.sql` contains non-authentication destination, trip, and itinerary data. It intentionally does not create Auth users, passwords, student records, parent records, or registrations.

### Run locally

```bash
npm run dev
```

Open <http://localhost:3000>.

## Scripts

```bash
npm run dev       # Start the development server
npm run lint      # Run ESLint
npm run build     # Create a production build
npm run start     # Serve the production build locally
```

## Routes

### Public routes

- `/` - Homepage
- `/trips` - Published trip catalogue
- `/trips/[slug]` - Trip detail and itinerary
- `/login` - Sign in
- `/register` - Create a student or parent account
- `/forgot-password` - Request a password reset
- `/reset-password` - Set a new password
- `/auth/confirm` - Auth confirmation route used by Supabase recovery flow

### Protected routes

- `/student` - Student profile and My Trips dashboard
- `/parent` - Linked children and registered trips dashboard
- `/admin` - Read-only administrative dashboard

Protected routes remain server-side and role-specific. Navigation visibility is not used as an authorization mechanism.

## Screenshots

Screenshots will be added after deployment.

## Deployment

The intended deployment architecture is:

- Frontend: Vercel
- Authentication and database: Supabase

This repository does not claim an existing production deployment.

## Engineering Highlights

- Next.js App Router with Server Components by default
- Server-side role authorization for protected workspaces
- PostgreSQL RLS for database-level ownership and role enforcement
- Atomic secure registration RPC with business-rule validation
- Typed service layer separating UI, data access, and domain mapping
- Separate Student, Parent, and Admin dashboard experiences
- Responsive Tailwind UI with loading, error, empty, and not-found states
- Payment-ready presentation without pretending that payment processing exists
- No service-role access in the website application

## Verification Status

The current application verification commands pass:

```text
npm run lint  - PASS
npm run build - PASS
```

The build confirms that the public and protected route tree compiles. Fully populated authenticated dashboard behavior has not been end-to-end tested against permanent hosted users because the project does not maintain permanent hosted test accounts or registration data.

## Future Work

The following are intentionally not implemented in the current scope:

- Razorpay order creation, checkout, verification, and webhooks
- Payment records, refunds, and instalment support
- Notifications
- Realtime trip updates
- Document management
- Admin CRUD workflows
- Native mobile application
- Expanded automated and authenticated end-to-end testing

## License

This is a portfolio project and does not currently include a public license.
