"use server";

import { revalidatePath } from "next/cache";

import { createSupabaseServerClient } from "@/lib/supabase/server";
import { createRegistrationService } from "@/services/registration/registration.service";
import type {
  RegistrationErrorCode,
  TripRegistration,
} from "@/types/registration";

export type TripRegistrationActionResult =
  | { success: true; registration: TripRegistration }
  | { success: false; code: RegistrationErrorCode; message: string };

export async function registerForTripAction(
  tripId: string,
): Promise<TripRegistrationActionResult> {
  const service = createRegistrationService(await createSupabaseServerClient());
  const result = await service.registerForTrip(tripId);

  if (result.error) {
    return {
      success: false,
      code: result.error.code,
      message: result.error.message,
    };
  }

  revalidatePath("/trips/[slug]", "page");
  return { success: true, registration: result.data };
}
