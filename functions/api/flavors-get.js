// Top it off — GET today's board (public, no auth)
// GET /api/flavors-get
// Returns { ok, items: [{name, tag}], updatedBy, updatedAt }

export async function onRequest(context) {
  const { env } = context;
  const kv = env.TOPITOFF_KV;

  const headers = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Cache-Control': 'no-store',
  };

  if (!kv) {
    return new Response(JSON.stringify({ ok: false, error: 'KV not bound', items: [] }), { status: 200, headers });
  }

  try {
    const [itemsRaw, metaRaw] = await Promise.all([
      kv.get('tio-board-current'),
      kv.get('tio-board-meta'),
    ]);

    const items = itemsRaw ? JSON.parse(itemsRaw) : [];
    const meta  = metaRaw  ? JSON.parse(metaRaw)  : {};

    return new Response(JSON.stringify({
      ok: true,
      items,
      updatedBy: meta.updatedBy || null,
      updatedAt: meta.updatedAt || null,
    }), { headers });

  } catch (err) {
    return new Response(JSON.stringify({ ok: false, error: 'Failed to load board', items: [] }), {
      status: 500, headers,
    });
  }
}
