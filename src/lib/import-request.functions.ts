import { createServerFn } from '@tanstack/react-start';
import { importRequestSchema } from '@/lib/import-request-schema';

export const submitImportRequest = createServerFn({ method: 'POST' })
  .inputValidator((input: unknown) => importRequestSchema.parse(input))
  .handler(async ({ data }) => {
    if (data.website?.trim()) return { ok: true as const };

    try {
      const { supabaseAdmin } = await import('@/integrations/supabase/client.server');
      const client = supabaseAdmin as unknown as { from: (table: string) => any };
      const { error } = await client.from('import_requests').insert({
        preferred_make_model: data.preferred_make_model,
        year_from: data.year_from,
        year_to: data.year_to,
        target_budget_kes: data.target_budget_kes,
        fuel_type: data.fuel_type,
        import_type: data.import_type,
        full_name: data.full_name,
        phone: data.phone,
        email: data.email,
      });

      if (error) throw error;
      return { ok: true as const };
    } catch {
      throw new Error('We could not send your request right now. Please try again shortly.');
    }
  });