import { createFileRoute } from '@tanstack/react-router';
import { dealership } from '@/config/dealership';

const GATEWAY_URL = 'https://ai.gateway.lovable.dev/v1/chat/completions';
const MODEL = 'google/gemini-3-flash-preview';

type ChatMessage = { role: 'system' | 'user' | 'assistant' | 'tool'; content: string; tool_call_id?: string; tool_calls?: unknown[] };

const SALES_EMAIL = dealership.contact.salesEmail;

function buildSystemPrompt(inventorySummary: string): string {
  return `You are Blaze, the AI sales concierge for ${dealership.brand.name}, a premium Nairobi dealership. Warm, concise, premium tone — like a Mercedes-Benz concierge.

Today: ${new Date().toISOString().slice(0, 10)}
Dealership: ${dealership.brand.name} · ${dealership.contact.locationDisplay}
Hours: ${dealership.contact.hours}
Phone/WhatsApp: ${dealership.contact.phoneDisplay}

Language: default to natural English. Reply in Kiswahili, Sheng or any other language ONLY when the customer writes in it — mirror their tone and energy naturally, while never dropping your concierge role or task.

Behavior — you are an AI VEHICLE SALES ASSISTANT, not a contact form:
- When a message arrives with vehicle context (name, stock ID, price, specs), acknowledge it briefly and ANSWER the customer's actual question first using the inventory and dealership knowledge below (availability, price, mileage, fuel, transmission, features, condition, financing, trade-in, delivery).
- Do NOT open with a generic "our team will contact you" message and do NOT ask for contact details unless the customer needs a human, a booking, a finance application or a valuation.
- If the customer says their question is answered, briefly acknowledge it and offer to help further. Do not push them to a salesperson.
- ESCALATE ONLY when the customer asks to talk to a human / salesperson / specialist / be called, or when the request truly needs a person. Then politely collect a name + phone and call "save_lead" with escalate_to_human=true.
- If the message is a FINANCE QUOTE REQUEST (contains vehicle, price, deposit, loan period, monthly repayment), call "submit_finance_request" immediately with all those figures, then reply exactly in spirit: "Thank you. Your finance request has been received successfully. Our finance team will contact you shortly." Ask for a phone number afterwards only if none was provided.
- If the message is a TRADE-IN VALUATION submission (make, model, year, mileage, auction grade, contact details), call "submit_trade_in" immediately (put the auction grade in "condition"), then reply: "Thank you. Your vehicle valuation request has been received. Our valuation team will review your submission and contact you shortly."
- When the user wants to BOOK A TEST DRIVE, call "book_test_drive" once you have the vehicle + a preferred date (and ideally phone/name). Confirm afterwards.
- Call "save_lead" whenever you learn contact info (name, phone, email). Never fabricate details.
- Never invent vehicles not in the inventory. Keep replies short (2-4 sentences) unless asked for detail.


Current inventory (top listings):
${inventorySummary}`;
}

const tools = [
  {
    type: 'function',
    function: {
      name: 'save_lead',
      description: 'Persist or update the base lead captured in the current chat session. Call as soon as ANY field is learned.',
      parameters: {
        type: 'object',
        properties: {
          name: { type: 'string' },
          phone: { type: 'string' },
          email: { type: 'string' },
          interested_vehicle: { type: 'string' },
          vehicle_id: { type: 'string' },
          budget_kes: { type: 'number' },
          finance_interest: { type: 'boolean' },
          trade_in_interest: { type: 'boolean' },
          preferred_viewing_date: { type: 'string', description: 'YYYY-MM-DD' },
          language: { type: 'string' },
          escalate_to_human: { type: 'boolean' },
        },
        additionalProperties: false,
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'book_test_drive',
      description: 'Create a test-drive booking. Use once vehicle + date are known.',
      parameters: {
        type: 'object',
        properties: {
          name: { type: 'string' },
          phone: { type: 'string' },
          email: { type: 'string' },
          vehicle_id: { type: 'string' },
          interested_vehicle: { type: 'string' },
          preferred_date: { type: 'string', description: 'YYYY-MM-DD' },
          preferred_time: { type: 'string' },
          notes: { type: 'string' },
        },
        required: ['interested_vehicle'],
        additionalProperties: false,
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'submit_trade_in',
      description: 'Create a trade-in valuation request.',
      parameters: {
        type: 'object',
        properties: {
          name: { type: 'string' },
          phone: { type: 'string' },
          email: { type: 'string' },
          make: { type: 'string' },
          model: { type: 'string' },
          year: { type: 'number' },
          mileage_km: { type: 'number' },
          condition: { type: 'string' },
          expected_value_kes: { type: 'number' },
          notes: { type: 'string' },
        },
        required: ['make', 'model'],
        additionalProperties: false,
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'submit_finance_request',
      description: 'Create a financing application.',
      parameters: {
        type: 'object',
        properties: {
          name: { type: 'string' },
          phone: { type: 'string' },
          email: { type: 'string' },
          vehicle_id: { type: 'string' },
          interested_vehicle: { type: 'string' },
          price_kes: { type: 'number' },
          deposit_kes: { type: 'number' },
          term_months: { type: 'number' },
          employment_status: { type: 'string' },
          monthly_income_kes: { type: 'number' },
          notes: { type: 'string' },
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

// ============ Server-side conversation memory (per browser session) ============
type StoredMessage = { role: 'user' | 'assistant'; content: string };

async function loadTranscript(sessionId: string): Promise<StoredMessage[]> {
  try {
    const { supabaseAdmin } = await import('@/integrations/supabase/client.server');
    const client = supabaseAdmin as unknown as { from: (t: string) => any };
    const { data } = await client
      .from('chat_sessions')
      .select('messages')
      .eq('session_id', sessionId)
      .maybeSingle();
    const msgs = data?.messages as StoredMessage[] | undefined;
    return Array.isArray(msgs)
      ? msgs.filter((m) => (m.role === 'user' || m.role === 'assistant') && typeof m.content === 'string' && m.content.trim())
      : [];
  } catch (e) {
    console.error('[chat] memory load failed', e);
    return [];
  }
}

async function saveTranscript(sessionId: string, transcript: StoredMessage[]) {
  try {
    const { supabaseAdmin } = await import('@/integrations/supabase/client.server');
    const client = supabaseAdmin as unknown as { from: (t: string) => any };
    const trimmed = transcript.slice(-60);
    const { error } = await client
      .from('chat_sessions')
      .upsert(
        { session_id: sessionId, messages: trimmed, updated_at: new Date().toISOString() },
        { onConflict: 'session_id' },
      );
    if (error) throw error;
  } catch (e) {
    console.error('[chat] memory save failed', e);
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

async function bookTestDrive(args: Record<string, any>, validVehicleIds: Set<string>): Promise<string> {
  const { supabaseAdmin } = await import('@/integrations/supabase/client.server');
  const client = supabaseAdmin as unknown as { from: (t: string) => any };
  const payload: Record<string, unknown> = {
    vehicle_name: args.interested_vehicle ?? null,
    name: args.name ?? null,
    phone: args.phone ?? null,
    email: args.email ?? null,
    preferred_date: args.preferred_date ?? null,
    notes: [args.preferred_time && `Time: ${args.preferred_time}`, args.notes].filter(Boolean).join(' · ') || null,
  };
  if (typeof args.vehicle_id === 'string' && validVehicleIds.has(args.vehicle_id)) payload.vehicle_id = args.vehicle_id;
  const { data, error } = await client.from('test_drive_requests').insert(payload).select('id').single();
  if (error) return JSON.stringify({ ok: false, error: error.message });
  void notifySales({ type: 'test_drive', ...payload }).catch(() => {});
  return JSON.stringify({ ok: true, id: data?.id });
}

async function submitTradeIn(args: Record<string, any>): Promise<string> {
  const { supabaseAdmin } = await import('@/integrations/supabase/client.server');
  const client = supabaseAdmin as unknown as { from: (t: string) => any };
  const payload = {
    name: args.name ?? null,
    phone: args.phone ?? null,
    email: args.email ?? null,
    make: args.make ?? null,
    model: args.model ?? null,
    year: args.year ?? null,
    mileage_km: args.mileage_km ?? null,
    condition: args.condition ?? null,
    estimated_value_kes: args.expected_value_kes ?? null,
    notes: args.notes ?? null,
  };
  const { data, error } = await client.from('trade_in_requests').insert(payload).select('id').single();
  if (error) return JSON.stringify({ ok: false, error: error.message });
  void notifySales({ type: 'trade_in', ...payload }).catch(() => {});
  return JSON.stringify({ ok: true, id: data?.id });
}

async function submitFinance(args: Record<string, any>, validVehicleIds: Set<string>): Promise<string> {
  const { supabaseAdmin } = await import('@/integrations/supabase/client.server');
  const client = supabaseAdmin as unknown as { from: (t: string) => any };
  const payload: Record<string, unknown> = {
    vehicle_name: args.interested_vehicle ?? null,
    name: args.name ?? null,
    phone: args.phone ?? null,
    email: args.email ?? null,
    vehicle_price: args.price_kes ?? null,
    deposit: args.deposit_kes ?? null,
    term_months: args.term_months ?? null,
    monthly_income: args.monthly_income_kes ?? null,
    notes: [args.employment_status && `Employment: ${args.employment_status}`, args.notes].filter(Boolean).join(' · ') || null,
  };
  if (typeof args.vehicle_id === 'string' && validVehicleIds.has(args.vehicle_id)) payload.vehicle_id = args.vehicle_id;
  const { data, error } = await client.from('finance_requests').insert(payload).select('id').single();
  if (error) return JSON.stringify({ ok: false, error: error.message });
  void notifySales({ type: 'finance', ...payload }).catch(() => {});
  return JSON.stringify({ ok: true, id: data?.id });
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

        let body: { sessionId?: string; message?: string; messages?: ChatMessage[] };
        try {
          body = await request.json();
        } catch {
          return new Response(JSON.stringify({ error: 'Invalid JSON' }), { status: 400 });
        }
        const sessionId = body.sessionId?.trim();
        const clientMessages = Array.isArray(body.messages) ? body.messages : [];
        const userText =
          typeof body.message === 'string' && body.message.trim()
            ? body.message.trim()
            : [...clientMessages].reverse().find((m) => m.role === 'user' && typeof m.content === 'string')?.content;
        if (!sessionId || !userText) {
          return new Response(JSON.stringify({ error: 'Missing sessionId or message' }), { status: 400 });
        }

        // Blaze remembers the conversation on the backend across refreshes.
        const transcript = await loadTranscript(sessionId);
        const history: ChatMessage[] = [...transcript, { role: 'user', content: userText }];

        const { text: invText, ids: invIds } = await fetchInventorySummary();
        const messages: ChatMessage[] = [
          { role: 'system', content: buildSystemPrompt(invText) },
          ...history.slice(-24),
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
              try {
                const args = JSON.parse(call.function.arguments || '{}');
                switch (call.function.name) {
                  case 'save_lead':
                    result = await saveLead(sessionId, args, history, invIds);
                    break;
                  case 'book_test_drive':
                    result = await bookTestDrive(args, invIds);
                    break;
                  case 'submit_trade_in':
                    result = await submitTradeIn(args);
                    break;
                  case 'submit_finance_request':
                    result = await submitFinance(args, invIds);
                    break;
                  default:
                    result = JSON.stringify({ ok: false, error: 'unknown_tool' });
                }
              } catch (e) {
                console.error(`[chat] tool ${call.function.name} failed`, e);
                result = JSON.stringify({ ok: false, error: 'tool_failed' });
              }
              messages.push({ role: 'tool', tool_call_id: call.id, content: result });
            }

            continue; // loop to let model produce a final assistant message
          }

          // Final assistant reply — persist the exchange to server-side memory
          const reply = msg.content ?? '…';
          void saveTranscript(
            sessionId,
            [
              ...history.filter((m) => m.role === 'user' || m.role === 'assistant'),
              { role: 'assistant' as const, content: reply },
            ].map((m) => ({ role: m.role as 'user' | 'assistant', content: m.content })),
          );
          return new Response(
            JSON.stringify({ reply, sessionId }),
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
