import type { AuthClient } from "@/types/auth";
import type {
  ParentDashboardData,
  ParentService,
  ParentServiceResult,
  ParentStudent,
  ParentTripRegistration,
} from "@/types/parent";
import type { RegistrationStatus } from "@/types/registration";

type LinkRow = {
  student_id: string;
};

type StudentRow = {
  id: string;
  student_number: string | null;
  grade_level: string | null;
  schools: {
    name: string;
  } | null;
  profiles: {
    full_name: string;
  };
};

type RegistrationRow = {
  id: string;
  student_id: string;
  status: RegistrationStatus;
  registered_at: string;
  trips: {
    id: string;
    slug: string;
    title: string;
    price: number;
    start_date: string;
    end_date: string;
    destinations: {
      name: string;
    };
  };
};

function serviceError(error: unknown): ParentServiceResult<never> {
  return {
    data: null,
    error: new Error(error instanceof Error ? error.message : "Unable to load the parent dashboard."),
  };
}

function mapStudent(row: StudentRow): ParentStudent {
  return {
    id: row.id,
    fullName: row.profiles.full_name,
    studentNumber: row.student_number,
    gradeLevel: row.grade_level,
    schoolName: row.schools?.name ?? null,
  };
}

function mapRegistration(
  row: RegistrationRow,
  studentsById: Map<string, ParentStudent>,
): ParentTripRegistration | null {
  const student = studentsById.get(row.student_id);

  if (!student) {
    return null;
  }

  return {
    id: row.id,
    studentId: row.student_id,
    studentName: student.fullName,
    tripId: row.trips.id,
    tripSlug: row.trips.slug,
    tripTitle: row.trips.title,
    destinationName: row.trips.destinations.name,
    price: row.trips.price,
    startDate: row.trips.start_date,
    endDate: row.trips.end_date,
    status: row.status,
    registeredAt: row.registered_at,
  };
}

export function createParentService(supabase: AuthClient): ParentService {
  return {
    async getDashboard(): Promise<ParentServiceResult<ParentDashboardData>> {
      try {
        const {
          data: { user },
          error: userError,
        } = await supabase.auth.getUser();

        if (userError || !user) {
          return serviceError(new Error("Authentication is required."));
        }

        const { data: links, error: linksError } = await supabase
          .from("student_parents")
          .select("student_id")
          .eq("parent_id", user.id)
          .returns<LinkRow[]>();

        if (linksError) {
          return serviceError(linksError);
        }

        const studentIds = links.map((link) => link.student_id);

        if (studentIds.length === 0) {
          return { data: { students: [], registrations: [] }, error: null };
        }

        const { data: studentRows, error: studentsError } = await supabase
          .from("students")
          .select("id, student_number, grade_level, schools (name), profiles (full_name)")
          .in("id", studentIds)
          .returns<StudentRow[]>();

        if (studentsError) {
          return serviceError(studentsError);
        }

        const students = studentRows.map(mapStudent);
        const studentsById = new Map(students.map((student) => [student.id, student]));

        const { data: registrationRows, error: registrationsError } = await supabase
          .from("trip_registrations")
          .select(
            "id, student_id, status, registered_at, trips (id, slug, title, price, start_date, end_date, destinations (name))",
          )
          .in("student_id", studentIds)
          .order("registered_at", { ascending: false })
          .returns<RegistrationRow[]>();

        if (registrationsError) {
          return serviceError(registrationsError);
        }

        return {
          data: {
            students,
            registrations: registrationRows
              .map((registration) => mapRegistration(registration, studentsById))
              .filter((registration): registration is ParentTripRegistration => registration !== null),
          },
          error: null,
        };
      } catch (error) {
        return serviceError(error);
      }
    },
  };
}
