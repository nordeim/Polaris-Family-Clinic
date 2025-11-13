import { z } from 'zod';

/**
 * Shared Zod schemas for API validation.
 *
 * These schemas must stay aligned with:
 * - database_schema.sql
 * - AGENT.md security and PDPA requirements
 */

/**
 * Patient profile schema
 *
 * NOTE:
 * - NRIC is accepted as plain string at API boundary.
 * - Handler code must:
 *   - Hash NRIC into nric_hash.
 *   - Derive nric_masked for display.
 * - We do NOT expose or persist raw NRIC beyond what is necessary to derive those fields.
 */
export const ProfileSchema = z.object({
  full_name: z
    .string()
    .min(1, 'Full name is required')
    .max(200, 'Full name is too long'),
  nric: z
    .string()
    .min(5, 'NRIC is required')
    .max(32, 'NRIC looks invalid'),
  dob: z
    .string()
    .min(4, 'Date of birth is required'),
  language: z
    .string()
    .min(1)
    .max(16)
    .default('en'),
  chas_tier: z
    .enum(['blue', 'orange', 'green', 'none', 'unknown'])
    .default('unknown')
});

export type ProfileInput = z.infer<typeof ProfileSchema>;

/**
 * Book appointment schema
 *
 * - doctor_id: UUID string
 * - scheduled_start: ISO string
 * - reason: optional, short free-text
 */
export const BookAppointmentSchema = z.object({
  doctor_id: z
    .string()
    .uuid('Invalid doctor'),
  scheduled_start: z
    .string()
    .datetime('Invalid timeslot'),
  reason: z
    .string()
    .max(500, 'Reason is too long')
    .optional()
});

export type BookAppointmentInput = z.infer<typeof BookAppointmentSchema>;

/**
 * Utility: safeParse wrapper that normalizes error output
 */
export function validateOrThrow<TSchema extends z.ZodTypeAny>(
  schema: TSchema,
  data: unknown
): z.infer<TSchema> {
  const result = schema.safeParse(data);
  if (!result.success) {
    const flat = result.error.flatten();
    const message =
      flat.formErrors.join('; ') ||
      Object.values(flat.fieldErrors)
        .flat()
        .join('; ') ||
      'Invalid request payload';
    const error = new Error(message);
    // Attach details for API handlers to inspect/log if needed.
    (error as any).details = flat;
    throw error;
  }
  return result.data;
}