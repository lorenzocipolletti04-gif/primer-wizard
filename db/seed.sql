-- Seed data voor de Primer Wizard (Lakopmaat)
-- Tip: je kunt dit later uitbreiden met extra producten en regels.

-- =====================
-- Products
-- =====================
INSERT OR REPLACE INTO products (
  id, brand, name, code,
  url, shop_url, ccv_product_id,
  image_url, price,
  notes
) VALUES

  -- Kunststof
  ('cs_plastic_primer_145986', 'CarSystem', 'CS Plastic Primer Transparant - 400ml', '145.986',
    NULL, 'https://www.lakopmaat.nl/nl/CS-Plastic-Primer-Transparant-400ml', '900611528',
    'https://www.lakopmaat.nl//Files/10/399000/399149/ProductPhotos/620/2358537821.png', '€ 12,17',
    'Hechtprimer voor kunststof delen (bumpers/trim). Dun aanbrengen.'),

  -- Metaal: Etch
  ('fx_tsp190', 'Finixa', 'Finixa Etch primer grijs - 400 ml', 'TSP 190',
    NULL, 'https://www.lakopmaat.nl/nl/Finixa-Etch-primer-grijs-400-ml', '900588323',
    'https://www.lakopmaat.nl//Files/10/399000/399149/ProductPhotos/620/2358424376.png', '€ 13,99',
    'Snelle hechtprimer voor blank metaal (spotrepair).'),

  -- Metaal: Epoxy 1K
  ('cs_epoxy_1k_151958', 'CarSystem', 'CS 1K Epoxy Primer - 400ml', '151.958',
    NULL, 'https://www.lakopmaat.nl/nl/CS-1K-Epoxy-Primer-400ml', '900611507',
    'https://www.lakopmaat.nl//Files/10/399000/399149/ProductPhotos/620/2358537689.png', '€ 15,20',
    'Goede epoxy basis (hechting + (anti)corrosie) in 1K spuitbus.'),

  -- Metaal: Epoxy 2K
  ('cs_epoxy_2k_159158', 'CarSystem', 'CS 2K Epoxy Fill Primer', '159.158',
    NULL, 'https://www.lakopmaat.nl/nl/CS-2k-Epoxy-Fill-Primer', '900611519',
    'https://www.lakopmaat.nl//Files/10/399000/399149/ProductPhotos/620/2358537773.png', '€ 32,50',
    'Maximale hechting en corrosiebescherming (2K).'),

  -- Filler / Surfacer
  ('cs_filler_1k_151522', 'CarSystem', 'CS 1K Hoog vullende primer', '151.522',
    NULL, 'https://www.lakopmaat.nl/nl/CS-1K-Hoog-vullende-primer', '900611573',
    'https://www.lakopmaat.nl//Files/10/399000/399149/ProductPhotos/620/2358538274.png', '€ 21,49',
    'Hoog vullend: vult schuurkrassen en zet strak (schuren na droging).'),

  -- Verzinkt / extra bescherming
  ('fx_tsp410', 'Finixa', 'Finixa Zinkspray - 400 ml', 'TSP 410',
    NULL, 'https://www.lakopmaat.nl/nl/Finixa-Zinkspray-400-ml', '900589553',
    'https://www.lakopmaat.nl//Files/10/399000/399149/ProductPhotos/620/2358433403.png', '€ 12,49',
    'Extra roestbescherming (bijv. laswerk, holtes, verzinkte delen).'),

  -- Tip / toebehoren
  ('eg_soft_nitrile', 'Eurogloves', 'Eurogloves Soft Nitrile - 100 stuks', NULL,
    NULL, 'https://www.lakopmaat.nl/nl/Eurogloves-Soft-Nitrile', '900590462',
    'https://www.lakopmaat.nl//Files/10/399000/399149/ProductPhotos/620/2358441479.jpg', '€ 15,25',
    'Handschoenen houden de ondergrond vetvrij.');


-- =====================
-- Rules
-- substrate_id: staal | aluminium | verzinkt | kunststof | bestaande_lak | plamuur
-- situation: max_bescherming | spotrepair | egaliseren | vullen
-- =====================
INSERT OR REPLACE INTO rules (id, substrate_id, situation, summary) VALUES
  -- STAAL
  ('r_staal_max', 'staal', 'max_bescherming',
   'Op blank staal is epoxy de beste basis: top hechting én (anti)corrosie. Kies 2K voor maximale performance, 1K als snelle/handige optie. Wil je daarna egaliseren: gebruik een filler/surfacer.'),
  ('r_staal_spot', 'staal', 'spotrepair',
   'Voor een snelle spotrepair op blank staal kun je etch primer gebruiken. Wil je meer bescherming (bijv. buiten, steenslaggevoelig): kies epoxy.'),

  -- ALUMINIUM
  ('r_alu_max', 'aluminium', 'max_bescherming',
   'Op aluminium kies je bij voorkeur epoxy (liefst 2K) voor betrouwbare hechting en bescherming. Egaliseren kan daarna met een filler/surfacer.'),
  ('r_alu_spot', 'aluminium', 'spotrepair',
   'Voor kleine plekken aluminium: etch primer is snel. Voor langere bescherming: epoxy.'),

  -- VERZINKT
  ('r_verzinkt_max', 'verzinkt', 'max_bescherming',
   'Op verzinkt metaal: goed schuren/ontvetten, daarna epoxy als basis. Zinkspray kan extra bescherming geven op kritieke plekken (laswerk/holtes).'),
  ('r_verzinkt_spot', 'verzinkt', 'spotrepair',
   'Voor kleine plekjes op verzinkt: etch primer is snel. Wil je duurzamer: epoxy.'),

  -- KUNSTSTOF
  ('r_kunststof_hechting', 'kunststof', 'max_bescherming',
   'Op kunststof gebruik je eerst een kunststof hechtprimer/adhesion promoter. Daarna kun je (indien nodig) egaliseren met een filler/surfacer.'),
  ('r_kunststof_spot', 'kunststof', 'spotrepair',
   'Voor snelle spotrepair op kunststof: kunststof primer dun aanbrengen. Daarna lakken volgens opbouw.'),

  -- BESTAANDE LAK
  ('r_lak_egaliseren', 'bestaande_lak', 'egaliseren',
   'Op geschuurde bestaande lak gebruik je meestal een primer/filler (surfacer) om schuurgroeven te vullen en strak te zetten.'),
  ('r_lak_vullen', 'bestaande_lak', 'vullen',
   'Wil je meer opbouw en krassen wegwerken? Kies een hoogvullende primer en schuur deze strak.'),

  -- PLAMUUR
  ('r_plamuur_vullen', 'plamuur', 'vullen',
   'Op plamuur/polyester filler gebruik je een primer/filler (high build) zodat je strak kunt schuren en afwerken.'),
  ('r_plamuur_spot', 'plamuur', 'spotrepair',
   'Voor kleine plekjes plamuur: een hoogvullende primer is het meest vergevingsgezind en werkt snel.' );


-- =====================
-- Rule → Products (met stappen)
-- step: 1 = basis/hechting, 2 = vullen/egaliseren, 3 = optioneel
-- =====================
INSERT OR REPLACE INTO rule_products (rule_id, product_id, step) VALUES
  -- STAAL
  ('r_staal_max', 'cs_epoxy_2k_159158', 1),
  ('r_staal_max', 'cs_epoxy_1k_151958', 1),
  ('r_staal_max', 'cs_filler_1k_151522', 2),
  ('r_staal_max', 'eg_soft_nitrile', 3),

  ('r_staal_spot', 'fx_tsp190', 1),
  ('r_staal_spot', 'cs_epoxy_1k_151958', 1),
  ('r_staal_spot', 'eg_soft_nitrile', 3),

  -- ALU
  ('r_alu_max', 'cs_epoxy_2k_159158', 1),
  ('r_alu_max', 'cs_epoxy_1k_151958', 1),
  ('r_alu_max', 'cs_filler_1k_151522', 2),
  ('r_alu_max', 'eg_soft_nitrile', 3),

  ('r_alu_spot', 'fx_tsp190', 1),
  ('r_alu_spot', 'cs_epoxy_1k_151958', 1),
  ('r_alu_spot', 'eg_soft_nitrile', 3),

  -- VERZINKT
  ('r_verzinkt_max', 'cs_epoxy_2k_159158', 1),
  ('r_verzinkt_max', 'cs_epoxy_1k_151958', 1),
  ('r_verzinkt_max', 'fx_tsp410', 3),
  ('r_verzinkt_max', 'cs_filler_1k_151522', 2),
  ('r_verzinkt_max', 'eg_soft_nitrile', 3),

  ('r_verzinkt_spot', 'fx_tsp190', 1),
  ('r_verzinkt_spot', 'cs_epoxy_1k_151958', 1),
  ('r_verzinkt_spot', 'fx_tsp410', 3),
  ('r_verzinkt_spot', 'eg_soft_nitrile', 3),

  -- KUNSTSTOF
  ('r_kunststof_hechting', 'cs_plastic_primer_145986', 1),
  ('r_kunststof_hechting', 'cs_filler_1k_151522', 2),
  ('r_kunststof_hechting', 'eg_soft_nitrile', 3),

  ('r_kunststof_spot', 'cs_plastic_primer_145986', 1),
  ('r_kunststof_spot', 'eg_soft_nitrile', 3),

  -- BESTAANDE LAK
  ('r_lak_egaliseren', 'cs_filler_1k_151522', 1),
  ('r_lak_egaliseren', 'eg_soft_nitrile', 3),
  ('r_lak_vullen', 'cs_filler_1k_151522', 1),
  ('r_lak_vullen', 'eg_soft_nitrile', 3),

  -- PLAMUUR
  ('r_plamuur_vullen', 'cs_filler_1k_151522', 1),
  ('r_plamuur_vullen', 'eg_soft_nitrile', 3),
  ('r_plamuur_spot', 'cs_filler_1k_151522', 1),
  ('r_plamuur_spot', 'eg_soft_nitrile', 3);
