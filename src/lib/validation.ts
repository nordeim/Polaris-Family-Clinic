import { z } from 'zod';

/**
 * Zod schemas aligned with database_schema.sql and AGENT.md.
 *
 * These are the canonical validation contracts for:
 * - Patient profile upsert
 * - Appointment booking
 *
 * Notes:
 * - Keep in sync with:
 *   - database_schema.sql
 *   - API handlers under src/pages/api/*
 *   - AGENT.md
 */

/**
 * ProfileSchema
 *
 * For PUT /api/patient/profile.put
 *
 * Fields:
 * - full_name: 2-100 chars
 * - nric: raw input (will be hashed + masked server-side)
 * - dob: YYYY-MM-DD
 * - language: string; constrained at UI-level, stored as text
 * - chas_tier: enum: blue|orange|green|none|unknown
 */
export const ProfileSchema = z.object({
  full_name: z
    .string()
    .min(2, 'Name must be at least 2 characters')
    .max(100, 'Name must be at most 100 characters'),
  nric: z
    .string()
    .min(5, 'NRIC / ID seems too short')
    .max(20, 'NRIC / ID seems too long'),
  dob: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Date of birth must be YYYY-MM-DD'),
  language: z.string().default('en'),
  chas_tier: z
    .enum(['blue', 'orange', 'green', 'none', 'unknown'])
    .default('unknown')
});

export type ProfileInput = z.infer<typeof ProfileSchema>;

/**
 * BookAppointmentSchema
 *
 * For POST /api/appointments/book.post
 *
 * Fields:
 * - doctor_id: UUID string
 * - scheduled_start: ISO 8601 datetime string
 */
export const BookAppointmentSchema = z.object({
  doctor_id: z.string().uuid(),
  scheduled_start: z
    .string()
    .datetime()
});

export type BookAppointmentInput = z.infer<typeof BookAppointmentSchema>;