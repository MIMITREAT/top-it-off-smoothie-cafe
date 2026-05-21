// Top it off — SET today's board (staff PIN protected)
// POST /api/flavors-set  { name, pin, items: [{name, tag}] | ["Strawberry Sunrise", ...] }
// Returns { ok, updatedBy, updatedAt, count }

export async function onRequest(context) {
  const { request, env } = context;
  const kv = env.TOPITOFF_KV;

  const headers = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
  };

  if (request.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers });
  }
  if (request.method !== 'POST') {
    return new Response(JSON.stringify({ ok: false, error: 'Method not allowed' }), { status: 405, headers });
  }
  if (!kv) {
    return new Response(JSON.stringify({ ok: false, error: 'KV not bound' }), { status: 500, headers });
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return new Response(JSON.stringify({ ok: false, error: 'Invalid request body' }), { status: 400, headers });
  }

  const { name, pin, items } = body;

  if (!name || typeof name !== 'string' || !pin || typeof pin !== 'string') {
    return new Response(JSON.stringify({ ok: false, error: 'Name and PIN are required' }), { status: 400, headers });
  }
  if (!Array.isArray(items) || items.length === 0) {
    return new Response(JSON.stringify({ ok: false, error: 'Add at least one item to the board' }), { status: 400, headers });
  }
  if (items.length > 24) {
    return new Response(JSON.stringify({ ok: false, error: 'Maximum 24 items allowed' }), { status: 400, headers });
  }

  // ── Brute-force protection: per-IP failed-attempt lockout ──
  const ip = request.headers.get('CF-Connecting-IP') || 'unknown';
  const rlKey = `tio-rl-${ip}`;
  const MAX_FAILS = 6;
  const LOCK_SECONDS = 900; // 15 minutes
  let rl = { count: 0 };
  try { const raw = await kv.get(rlKey); if (raw) rl = JSON.parse(raw); } catch {}
  if (rl.count >= MAX_FAILS) {
    return new Response(JSON.stringify({ ok: false, error: 'Too many attempts. Please try again in about 15 minutes.' }), { status: 429, headers });
  }

  // Load staff PINs from KV
  let staffPins;
  try {
    const raw = await kv.get('tio-staff-pins');
    staffPins = raw ? JSON.parse(raw) : {};
  } catch {
    return new Response(JSON.stringify({ ok: false, error: 'Could not load staff data' }), { status: 500, headers });
  }

  const staffEntry = staffPins[name.trim()];
  if (!staffEntry || String(staffEntry.pin) !== pin.trim()) {
    // Record the failed attempt with a rolling 15-min expiry
    try { await kv.put(rlKey, JSON.stringify({ count: rl.count + 1 }), { expirationTtl: LOCK_SECONDS }); } catch {}
    const left = Math.max(0, MAX_FAILS - (rl.count + 1));
    return new Response(JSON.stringify({ ok: false, error: 'Incorrect name or PIN' + (left <= 2 ? ` (${left} attempt${left === 1 ? '' : 's'} left)` : '') }), { status: 401, headers });
  }

  // Correct PIN → clear the failed-attempt counter
  try { await kv.delete(rlKey); } catch {}

  // Normalize items → [{name, tag}]
  const cleaned = items
    .map((it) => {
      if (typeof it === 'string') return { name: it.trim(), tag: '' };
      return { name: String(it.name || '').trim(), tag: String(it.tag || '').trim().slice(0, 20) };
    })
    .filter((it) => it.name.length > 0 && it.name.length <= 60)
    .slice(0, 24);

  if (cleaned.length === 0) {
    return new Response(JSON.stringify({ ok: false, error: 'No valid items' }), { status: 400, headers });
  }

  const nowMST = new Date().toLocaleString('en-US', {
    timeZone: 'America/Denver',
    year: 'numeric', month: 'short', day: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });

  try {
    await Promise.all([
      kv.put('tio-board-current', JSON.stringify(cleaned)),
      kv.put('tio-board-meta', JSON.stringify({
        updatedBy: name.trim(),
        updatedAt: nowMST,
        updatedAtISO: new Date().toISOString(),
      })),
    ]);
  } catch (err) {
    return new Response(JSON.stringify({ ok: false, error: 'Failed to save board' }), { status: 500, headers });
  }

  return new Response(JSON.stringify({
    ok: true,
    updatedBy: name.trim(),
    updatedAt: nowMST,
    count: cleaned.length,
  }), { headers });
}
