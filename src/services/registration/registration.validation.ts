import { z } from "zod";

export const tripIdSchema = z.uuid("A valid trip is required.");
