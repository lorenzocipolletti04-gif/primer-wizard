PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS products (
  id TEXT PRIMARY KEY,
  brand TEXT NOT NULL,
  name TEXT NOT NULL,
  code TEXT,
  url TEXT,
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
