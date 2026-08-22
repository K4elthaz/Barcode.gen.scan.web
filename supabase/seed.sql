-- ============================================================
-- Barcode.gen.scan.web — Sample data (Suppliers + Categories)
-- Run after supabase/schema.sql in the Supabase SQL Editor.
-- ============================================================

-- ---------- SAMPLE CATEGORIES ----------
insert into public.categories (name, description, image) values
  ('Beverages',       'Drinks, water, juices, and ready-to-drink products.', null),
  ('Snacks',          'Chips, candies, pastries, and quick bites.',          null),
  ('Office Supplies', 'Paper, pens, ink, and general office consumables.',   null),
  ('Electronics',     'Cables, batteries, adapters, and small devices.',     null),
  ('Hardware',        'Tools, fasteners, and hardware components.',          null),
  ('Cleaning Supplies', 'Detergents, disinfectants, and janitorial items.',  null)
on conflict do nothing;

-- ---------- SAMPLE SUPPLIERS ----------
insert into public.suppliers
  (name, shop_name, category, description, phone, email, address, image) values
  ('Juan Dela Cruz',    'JC Beverage Trading',    'Beverages',       'Wholesale distributor of bottled drinks and juices for retail.',        '+63 917 555 0101', 'sales@jcbeverage.ph',   '123 Rizal Ave, Quezon City',      null),
  ('Maria Santos',      'Tinapay ni Maria Bakery','Snacks',          'Daily-baked breads, pastries, and snack packs.',                        '+63 918 555 0102', 'maria@tinapay.ph',      '45 Mabini St, Manila',            null),
  ('Pedro Reyes',       'Reyes Office Depot',     'Office Supplies', 'Office paper, writing instruments, and printing consumables.',          '+63 919 555 0103', 'orders@reyesoffice.ph', '8 Bonifacio Drive, Pasay City',  null),
  ('Ana Garcia',        'ACG Tech Distributors',  'Electronics',      'Cables, adapters, batteries, and small electronics wholesale.',         '+63 920 555 0104', 'ana@acgtech.ph',        '22 Commonwealth Ave, Quezon City', null),
  ('Carlos Mendoza',    'Mendoza Hardware',       'Hardware',         'General hardware, tools, and construction fasteners.',                  '+63 921 555 0105', 'carlos@mendozahw.ph',  '77 Katipunan Rd, Marikina',       null),
  ('Liza Fernandez',    'CleanPro Supply',        'Cleaning Supplies','Institutional detergents and janitorial supplies.',                      '+63 922 555 0106', 'liza@cleanpro.ph',     '15 España Blvd, Manila',           null)
on conflict do nothing;