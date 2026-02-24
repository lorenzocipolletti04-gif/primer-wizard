INSERT OR REPLACE INTO products (id, brand, name, code, url, notes) VALUES
  ('cs_plastic_primer_145986', 'CarSystem', 'Plastic Primer 400ml', '145.986', 'https://www.car-system.nl/index.php?main_page=product_info&products_id=459',
   'Hechtprimer voor kunststof delen (bumpers/trim).'),

  ('fx_tsp030', 'Finixa', 'TSP 030 Adhesion primer 400ml', 'TSP 030', 'https://www.emm.com/en-gb/technical-sprays/specials/tsp-030-adhesion-primer-400ml',
   'Adhesion promoter voor diverse plastics.'),

  ('fx_tsp190', 'Finixa', 'TSP 190 Etch primer grey 400ml', 'TSP 190', 'https://finixa.com/en-gb/technical-sprays/corrosion-protection',
   'Etch primer voor blank metaal (hechting + anti-corrosie).'),

  ('fx_tsp110', 'Finixa', 'TSP 110 Primer/Filler light grey 400ml', 'TSP 110', 'https://www.emm.com/en-gb/technical-sprays/primer-filler/tsp-primer-400ml/light-grey',
   'Universele primer/filler voor spot & panel repairs.');

INSERT OR REPLACE INTO rules (id, substrate_id, situation, summary) VALUES
  ('r_blank_metaal_hechting', 'blank_metaal', 'hechting_bescherming',
   'Op blank metaal kies je eerst een hecht-/beschermlaag (etch/epoxy). Indien je nog moet egaliseren: daarna een primer/filler (surfacer).'),

  ('r_kunststof_hechting', 'kunststof', 'hechting_kunststof',
   'Op kunststof gebruik je eerst een adhesion promoter / kunststof hechtprimer. Daarna kun je eventueel primer/filler gebruiken om te egaliseren.'),

  ('r_bestaande_lak_egaliseren', 'bestaande_lak', 'egaliseren',
   'Op geschuurde bestaande lak gebruik je meestal een primer/filler (surfacer) om schuurgroeven te vullen en strak te zetten.'),

  ('r_plamuur_vullen', 'plamuur', 'vullen',
   'Op plamuur/polyester filler gebruik je een primer/filler (high build) zodat je strak kunt schuren en afwerken.');

INSERT OR REPLACE INTO rule_products (rule_id, product_id, step) VALUES
  ('r_blank_metaal_hechting', 'fx_tsp190', 1),
  ('r_blank_metaal_hechting', 'fx_tsp110', 2),

  ('r_kunststof_hechting', 'cs_plastic_primer_145986', 1),
  ('r_kunststof_hechting', 'fx_tsp030', 1),
  ('r_kunststof_hechting', 'fx_tsp110', 2),

  ('r_bestaande_lak_egaliseren', 'fx_tsp110', 1),

  ('r_plamuur_vullen', 'fx_tsp110', 1);
