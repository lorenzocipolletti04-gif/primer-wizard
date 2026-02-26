PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS products (
  id TEXT PRIMARY KEY,
  brand TEXT NOT NULL,
  name TEXT NOT NULL,

  -- (Aanrader) jouw SKU/productcode, liefst gelijk aan CCV SKU
  code TEXT,

  -- Fallback link (bv. fabrikant/extern)
  url TEXT,

  -- Link naar jouw productpagina in CCV Shop (heeft voorkeur boven url)
  shop_url TEXT,

  -- CCV product-id die in de add-to-cart payload zit (bv. 900588323)
  ccv_product_id TEXT,

  -- Optioneel: afbeelding + prijs voor de UI (wizard)
  image_url TEXT,
  price TEXT,

  notes TEXT
);

CREATE TABLE IF NOT EXISTS rules (
  id TEXT PRIMARY KEY,
  substrate_id TEXT NOT NULL,
  situation TEXT NOT NULL,
  summary TEXT NOT NULL
);

CREATE UNIQUE INDEX IF NOT EXISTS rules_unique
  ON rules(substrate_id, situation);

CREATE TABLE IF NOT EXISTS rule_products (
  rule_id TEXT NOT NULL,
  product_id TEXT NOT NULL,
  step INTEGER NOT NULL DEFAULT 1,
  PRIMARY KEY (rule_id, product_id),
  FOREIGN KEY (rule_id) REFERENCES rules(id) ON DELETE CASCADE,
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
);
