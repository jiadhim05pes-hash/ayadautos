import { createFileRoute } from '@tanstack/react-router';
import { dealership } from '@/config/dealership';

const GATEWAY_URL = 'https://ai.gateway.lovable.dev/v1/chat/completions';
const MODEL = 'google/gemini-3-flash-preview';

type ChatMessage = { role: 'system' | 'user' | 'assistant' | 'tool'; content: string; tool_call_id?: string; tool_calls?: unknown[] };

const SALES_EMAIL = dealership.contact.salesEmail;

function buildSystemPrompt(inventorySummary: string): string {
  return `${dealership.ai.persona}

Today: ${new Date().toISOString().slice(0, 10)}
Dealership: ${dealership.brand.name} · ${dealership.contact.locationDisplay}
Hours: ${dealership.contact.hours}
Phone/WhatsApp: ${dealership.contact.phoneDisplay}

You MUST respond in the same language the user writes in (English, Kiswahili, or Sheng). Be warm, concise, and premium in tone — like a Mercedes-Benz concierge.

Behavior rules:
- Answer inventory, financing, trade-in and test-drive questions using the current inventory below.
- Progressively collect lead info across the conversation: name, phone, email, interested vehicle, budget (KES), finance interest (yes/no), trade-in interest (yes/no), preferred viewing date. Do not ask for everything at once — one or two fields per turn, only when it feels natural.
- The MOMENT you learn ANY of those fields from the user, call the "save_lead" tool with what you know so far. Call it again whenever new info is captured. Never fabricate values.
- If the user asks for a human, or asks to speak to sales, or seems ready to buy, call "save_lead" with escalate_to_human=true and then tell them the sales team will contact them shortly, and share the WhatsApp number ${dealership.contact.phoneDisplay}.
- Never invent vehicles that aren't in the inventory list. If asked about something we don't stock, say we can source it and offer to record their request.
- Keep replies short (2-4 sentences) unless the user asks for detail.

Current inventory (top listings):
${inventorySummary}`;
}

const tools = [
  {
    type: 'function',
    function: {
      name: 'save_lead',
      description: 'Persist or update the lead captured in the current chat session. Call as soon as ANY field is learned, and again whenever new info comes in. Include only fields you actually know.',
      parameters: {
        type: 'object',
        properties: {
          name: { type: 'string' },
          phone: { type: 'string', description: 'E.164 or Kenyan format' },
          email: { type: 'string' },
          interested_vehicle: { type: 'string', description: 'Vehicle name or description' },
          vehicle_id: { type: 'string', description: 'UUID of the vehicle from the inventory list, if identifiable' },
          budget_kes: { type: 'number' },
          finance_interest: { type: 'boolean' },
          trade_in_interest: { type: 'boolean' },
          preferred_viewing_date: { type: 'string', description: 'YYYY-MM-DD' },
          language: { type: 'string', description: 'en, sw, or sheng' },
          escalate_to_human: { type: 'boolean' },
        },
        additionalProperties: false,
      },
    },
  },
];

async function fetchInventorySummary(): Promise<{ text: string; ids: Set<string> }> {
  try {
    const { supabaseAdmin } = await import('@/integrations/supabase/client.server');
    const client = supabaseAdmin as unknown as { from: (t: string) => any };
    const { data } = await client
      .from('vehicles')
      .select('id, name, year, price_kes, fuel, transmission, mileage_km, status, categories(name)')
      .in('status', ['available', 'reserved'])
      .order('featured', { ascending: false })
      .limit(25);
    const rows = (data as any[]) ?? [];
    const ids = new Set<string>(rows.map((r) => r.id));
    const text = rows.length
      ? rows
          .map(
            (r) =>
              `- [${r.id}] ${r.year} ${r.name} — KES ${Number(r.price_kes).toLocaleString()} · ${r.fuel}/${r.transmission} · ${Number(r.mileage_km).toLocaleString()} km · ${r.categories?.name ?? ''} · ${r.status}`,
          )
          .join('\n')
      : '(no vehicles currently listed)';
    return { text, ids };
  } catch (e) {
    console.error('[chat] inventory fetch failed', e);
    return { text: '(inventory temporarily unavailable)', ids: new Set() };
  }
}

async function saveLead(
  sessionId: string,
  args: Record<string, unknown>,
  transcript: ChatMessage[],
  validVehicleIds: Set<string>,
): Promise<string> {
  const { supabaseAdmin } = await import('@/integrations/supabase/client.server');
  const client = supabaseAdmin as unknown as { from: (t: string) => any };

  const payload: Record<string, unknown> = { session_id: sessionId, transcript, updated_at: new Date().toISOString() };
  const passthrough = [
    'name', 'phone', 'email', 'interested_vehicle', 'budget_kes',
    'finance_interest', 'trade_in_interest', 'preferred_viewing_date', 'language',
  ] as const;
  for (const k of passthrough) if (args[k] != null && args[k] !== '') payload[k] = args[k];
  if (typeof args.vehicle_id === 'string' && validVehicleIds.has(args.vehicle_id)) {
    payload.vehicle_id = args.vehicle_id;
  }
  const escalated = args.escalate_to_human === true;
  if (escalated) payload.escalated_to_human = true;

  // Upsert by session_id (unique)
  const { data: existing } = await client
    .from('ai_chat_leads')
    .select('id, escalated_to_human')
    .eq('session_id', sessionId)
    .maybeSingle();

  let leadId: string | undefined = existing?.id;
  if (existing) {
    const { error } = await client.from('ai_chat_leads').update(payload).eq('id', existing.id);
    if (error) throw error;
  } else {
    const { data, error } = await client
      .from('ai_chat_leads')
      .insert({ ...payload, status: 'new' })
      .select('id')
      .single();
    if (error) throw error;
    leadId = data?.id;
  }

  // Fire-and-forget email notification if configured
  if (escalated || args.phone || args.email) {
    void notifySales(payload).catch((e) => console.error('[chat] notify failed', e));
  }

  return JSON.stringify({ ok: true, lead_id: leadId, escalated });
}

async function notifySales(lead: Record<string, unknown>) {
  const key = process.env.LOVABLE_API_KEY;
  if (!key) return;
  // Attempt Lovable-managed email API; silently no-op if domain not configured.
  const body = {
    to: SALES_EMAIL,
    subject: `New AI chat lead${lead.escalated_to_human ? ' — ESCALATED' : ''}: ${lead.name ?? lead.phone ?? lead.email ?? 'unknown'}`,
    html: `<h2>New AI chat lead</h2><pre style="font:14px/1.4 monospace;background:#f7f7f7;padding:12px;border-radius:8px">${escapeHtml(JSON.stringify(lead, null, 2))}</pre>`,
  };
  try {
    await fetch('https://email.gateway.lovable.dev/v1/emails/send', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Lovable-API-Key': key },
      body: JSON.stringify(body),
    });
  } catch {
    /* email not configured yet — lead still saved */
  }
}

function escapeHtml(s: string) {
  return s.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]!));
}

export const Route = createFileRoute('/api/chat')({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const key = process.env.LOVABLE_API_KEY;
        if (!key) return new Response(JSON.stringify({ error: 'AI not configured' }), { status: 500 });

        let body: { sessionId?: string; messages?: ChatMessage[] };
        try {
          body = await request.json();
        } catch {
          return new Response(JSON.stringify({ error: 'Invalid JSON' }), { status: 400 });
        }
        const sessionId = body.sessionId?.trim();
        const userMessages = Array.isArray(body.messages) ? body.messages : [];
        if (!sessionId || userMessages.length === 0) {
          return new Response(JSON.stringify({ error: 'Missing sessionId or messages' }), { status: 400 });
        }

        const { text: invText, ids: invIds } = await fetchInventorySummary();
        const messages: ChatMessage[] = [
          { role: 'system', content: buildSystemPrompt(invText) },
          ...userMessages.filter((m) => m && typeof m.content === 'string'),
        ];

        // Up to 3 tool-call rounds
        for (let round = 0; round < 3; round++) {
          const res = await fetch(GATEWAY_URL, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${key}`,
            },
            body: JSON.stringify({ model: MODEL, messages, tools, tool_choice: 'auto' }),
          });

          if (!res.ok) {
            const errText = await res.text();
            console.error('[chat] gateway error', res.status, errText);
            if (res.status === 429) {
              return new Response(JSON.stringify({ error: 'Too many requests — please try again in a moment.' }), { status: 429 });
            }
            if (res.status === 402) {
              return new Response(JSON.stringify({ error: 'AI credits exhausted. Please contact the dealership directly.' }), { status: 402 });
            }
            return new Response(JSON.stringify({ error: 'AI service error' }), { status: 500 });
          }

          const json = await res.json();
          const choice = json.choices?.[0];
          const msg = choice?.message;
          if (!msg) {
            return new Response(JSON.stringify({ error: 'Empty AI response' }), { status: 500 });
          }

          const toolCalls = msg.tool_calls as Array<{ id: string; function: { name: string; arguments: string } }> | undefined;
          if (toolCalls?.length) {
            messages.push({ role: 'assistant', content: msg.content ?? '', tool_calls: toolCalls });
            for (const call of toolCalls) {
              let result = '{}';
              if (call.function.name === 'save_lead') {
                try {
                  const args = JSON.parse(call.function.arguments || '{}');
                  result = await saveLead(sessionId, args, userMessages, invIds);
                } catch (e) {
                  console.error('[chat] save_lead failed', e);
                  result = JSON.stringify({ ok: false, error: 'save_failed' });
                }
              }
              messages.push({ role: 'tool', tool_call_id: call.id, content: result });
            }
            continue; // loop to let model produce a final assistant message
          }

          // Final assistant reply
          return new Response(
            JSON.stringify({ reply: msg.content ?? '', sessionId }),
            { headers: { 'Content-Type': 'application/json' } },
          );
        }

        return new Response(JSON.stringify({ reply: 'Sorry, I got stuck. Please try again or WhatsApp us.', sessionId }), {
          headers: { 'Content-Type': 'application/json' },
        });
      },
    },
  },
});
