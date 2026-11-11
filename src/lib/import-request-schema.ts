import { z } from 'zod';

export const importRequestSchema = z
  .object({
    preferred_make_model: z.string().trim().min(2, 'Enter a make or model').max(120),
    year_from: z.coerce.number().int().min(1980).max(2100),
    year_to: z.coerce.number().int().min(1980).max(2100),
    target_budget_kes: z.coerce.number().int().positive().max(500_000_000),
    fuel_type: z.enum(['Any', 'Petrol', 'Diesel', 'Hybrid', 'Electric']),
    import_type: z.enum(['CIF', 'Doorstep']),
    full_name: z.string().trim().min(2, 'Enter your full name').max(100),
    phone: z
      .string()
      .trim()
      .min(8)
      .max(30)
      .regex(/^[+\d(][\d\s()+-]*$/, 'Enter a valid phone number')
      .refine((value) => value.replace(/\D/g, '').length >= 8, 'Enter a valid phone number'),
    email: z.string().trim().email('Enter a valid email address').max(255),
    website: z.string().max(200).optional(),
  })
  .refine((data) => data.year_from <= data.year_to, {
    path: ['year_to'],
    message: 'The latest year must be the same as or later than the earliest year',
  });

export type ImportRequestInput = z.input<typeof importRequestSchema>;
export type ImportRequest = z.output<typeof importRequestSchema>;