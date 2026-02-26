export async function onRequestGet({ env, request }) {
  try {
    const url = new URL(request.url);
    const substrate = url.searchParams.get("substrate");
    const situation = url.searchParams.get("situation");

    if (!substrate || !situation) {
      return json({ error: "Missing substrate or situation" }, 400);
    }

    if (!env || !env.DB) {
      return json({ error: "D1 binding missing: env.DB is undefined" }, 500);
    }

    const rule = await env.DB
      .prepare("SELECT id, summary FROM rules WHERE substrate_id = ? AND situation = ? LIMIT 1")
      .bind(substrate, situation)
      .first();

    if (!rule) return json({ error: "No advice found" }, 404);

    const rows = await env.DB
      .prepare(
        "SELECT rp.step, p.brand, p.name, p.code, p.notes, COALESCE(p.shop_url, p.url) AS url, " +
        "p.ccv_product_id AS ccvProductId, p.image_url AS imageUrl, p.price AS price " +
        "FROM rule_products rp " +
        "JOIN products p ON p.id = rp.product_id " +
        "WHERE rp.rule_id = ? " +
        "ORDER BY rp.step ASC, p.brand ASC, p.name ASC"
      )
      .bind(rule.id)
      .all();

    const products = (rows.results || []).map((p) => ({
      step: p.step,
      stepLabel: stepLabel(p.step),
      brand: p.brand,
      name: p.name,
      code: p.code,
      notes: p.notes,
      url: p.url || null,
      ccvProductId: p.ccvProductId || null,
      imageUrl: p.imageUrl || null,
      price: p.price || null,
    }));

    return json({ substrate, situation, summary: rule.summary, products });
  } catch (err) {
    // Super waardevol: dit verschijnt in Cloudflare logs
    console.error("advice.js crashed:", err);
    return json(
      { error: "Worker exception", details: String(err && err.message ? err.message : err) },
      500
    );
  }
}

function stepLabel(step) {
  if (step === 1) return "Stap 1 (hechting/basis)";
  if (step === 2) return "Stap 2 (vullen/egaliseren)";
  if (step === 3) return "Stap 3 (sealen/afwerking)";
  return "Stap " + step;
}

function json(data, status = 200) {
  return new Response(JSON.stringify(data, null, 2), {
    status,
    headers: {
      "content-type": "application/json; charset=utf-8",
      "cache-control": "no-store",
      "access-control-allow-origin": "*",
    },
  });
}
