export async function onRequestGet({ env, request }) {
  const url = new URL(request.url);
  const substrate = url.searchParams.get("substrate");
  const situation = url.searchParams.get("situation");

  if (!substrate || !situation) {
    return json({ error: "Missing substrate or situation" }, 400);
  }

  // Rule ophalen
  const rule = await env.DB
    .prepare("SELECT id, summary FROM rules WHERE substrate_id = ? AND situation = ? LIMIT 1")
    .bind(substrate, situation)
    .first();

  if (!rule) return json({ error: "No advice found" }, 404);

  // Producten ophalen
  const products = await env.DB
    .prepare(`
      SELECT p.brand, p.name, p.code, p.url, p.notes, rp.step
      FROM rule_products rp
      JOIN products p ON p.id = rp.product_id
      WHERE rp.rule_id = ?
      ORDER BY rp.step ASC, p.brand ASC, p.name ASC
    `)
    .bind(rule.id)
    .all();

  const labeled = (products.results || []).map(p => ({
    ...p,
    stepLabel: (p.step === 1) ? "Stap 1 (hechting/basis)" : "Stap 2 (vullen/egaliseren)"
  }));

  return json({
    substrate,
    situation,
    summary: rule.summary,
    products: labeled
  });
}

function json(data, status = 200) {
  return new Response(JSON.stringify(data, null, 2), {
    status,
    headers: {
      "content-type": "application/json; charset=utf-8",
      "cache-control": "no-store"
    }
  });
}
