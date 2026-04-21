-- WaveRow Seed Listings (v2 — real New Orleans-style photos)
-- Run in Supabase SQL editor: https://supabase.com/dashboard/project/jwndsqttukfrivbgbvsa/sql/new
-- Deletes any previously seeded listings by title, then re-inserts fresh.

DO $$
DECLARE
  owner_id uuid;
BEGIN
  SELECT user_id INTO owner_id FROM profiles LIMIT 1;

  IF owner_id IS NULL THEN
    RAISE EXCEPTION 'No user found in profiles table. Log in first, then re-run.';
  END IF;

  -- Remove any prior seed listings so this is idempotent
  DELETE FROM listings WHERE user_id = owner_id AND title IN (
    'Charming Shotgun on Freret',
    'Modern 1BR on St. Charles',
    'Spacious 3BR Near Tulane',
    'Cozy Studio on Maple St',
    'Garden District Flat',
    'New Build 2BR on Nashville',
    'Student Sublet — Summer 2026',
    'Renovated Double on Calhoun',
    'Luxury 1BR Near Audubon Park',
    'Shared House — 4BR Near Freret',
    'Carrollton Cottage 2BR',
    'Magazine St Sublet — Fall 2026',
    'Jefferson Ave Upper 2BR',
    'Bright Studio Near Loyola',
    'Uptown 3BR with Parking',
    'Exposed-Brick Loft Downtown',
    'Riverfront Studio on Tchoupitoulas',
    'Penthouse 2BR on Bourbon Adjacent'
  );

  INSERT INTO listings (
    user_id, title, type, address, neighborhood,
    lat, lng, rent, deposit, beds, baths, sqft,
    furnished, pets, utilities, photos, amenities,
    proximity_tags, description, status, is_sublease,
    available_from, available_to, distance_to_campus
  ) VALUES

  -- 1 — Shotgun double near Freret
  (owner_id, 'Charming Shotgun on Freret', 'apartment',
   '7624 Freret St, New Orleans, LA 70118', 'Freret',
   29.9384, -90.1143, 1350, 1350, 2, 1, 900,
   false, true, false,
   ARRAY[
     'https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=800',
     'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800',
     'https://images.unsplash.com/photo-1554995207-c18c203602cb?w=800'
   ],
   ARRAY['Washer/Dryer','AC','Parking'],
   ARRAY['Walk to campus','Near Freret St restaurants'],
   'Beautiful double shotgun home half a block from Freret Street. High ceilings, original hardwood floors, updated kitchen. Walking distance to Tulane and the streetcar.',
   'ACTIVE', false, '2026-08-01', null, '0.4 miles'),

  -- 2 — St. Charles 1BR
  (owner_id, 'Modern 1BR on St. Charles', 'apartment',
   '6840 St. Charles Ave, New Orleans, LA 70118', 'Uptown',
   29.9351, -90.1202, 1150, 1150, 1, 1, 650,
   true, false, true,
   ARRAY[
     'https://images.unsplash.com/photo-1416331108676-a22ccb276e35?w=800',
     'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=800',
     'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800'
   ],
   ARRAY['Wifi','AC','Utilities'],
   ARRAY['Streetcar stop','Near Audubon Park'],
   'Fully furnished apartment on the St. Charles streetcar line. Utilities included. Perfect for a student or young professional. Steps from Audubon Park.',
   'ACTIVE', false, '2026-07-01', null, '0.6 miles'),

  -- 3 — 3BR near campus
  (owner_id, 'Spacious 3BR Near Tulane', 'house',
   '1538 Broadway St, New Orleans, LA 70118', 'Carrollton',
   29.9462, -90.1228, 2400, 2400, 3, 2, 1600,
   false, true, false,
   ARRAY[
     'https://images.unsplash.com/photo-1570129477492-45c003edd2be?w=800',
     'https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?w=800',
     'https://images.unsplash.com/photo-1531971589569-0d9370cbe1e5?w=800'
   ],
   ARRAY['Parking','Washer/Dryer','AC','Dishwasher'],
   ARRAY['Walk to campus','Backyard','Pet friendly'],
   'Large 3-bedroom home just two blocks from Tulane''s campus. Big backyard, off-street parking for 2 cars. Perfect for a group of students.',
   'ACTIVE', false, '2026-08-15', null, '0.2 miles'),

  -- 4 — Studio on Maple
  (owner_id, 'Cozy Studio on Maple St', 'studio',
   '7900 Maple St, New Orleans, LA 70118', 'Carrollton',
   29.9420, -90.1196, 875, 875, 0, 1, 420,
   true, false, true,
   ARRAY[
     'https://images.unsplash.com/photo-1536376072261-38c75010e6c9?w=800',
     'https://images.unsplash.com/photo-1600573472592-401b489a3cdc?w=800'
   ],
   ARRAY['Wifi','AC','Utilities'],
   ARRAY['Steps to Maple St','Walk to Tulane'],
   'Cute furnished studio right on Maple Street strip. All utilities included. Great natural light, in-unit AC, updated bathroom.',
   'ACTIVE', false, '2026-05-15', null, '0.1 miles'),

  -- 5 — Garden District flat
  (owner_id, 'Garden District Flat', 'apartment',
   '2315 Prytania St, New Orleans, LA 70130', 'Garden District',
   29.9278, -90.1050, 1700, 1700, 2, 2, 1100,
   true, false, false,
   ARRAY[
     'https://images.unsplash.com/photo-1524230572899-a752b3835840?w=800',
     'https://images.unsplash.com/photo-1484101403633-562f891dc89a?w=800',
     'https://images.unsplash.com/photo-1560185007-cde436f6a4d0?w=800'
   ],
   ARRAY['AC','Washer/Dryer','Parking'],
   ARRAY['Garden District','Near Magazine St'],
   'Stunning Garden District apartment in a Victorian double. High ceilings, clawfoot tub, private porch. Furnished with antiques. 5-minute ride to Tulane.',
   'ACTIVE', false, '2026-06-01', null, '1.2 miles'),

  -- 6 — New build 2BR
  (owner_id, 'New Build 2BR on Nashville', 'apartment',
   '1203 Nashville Ave, New Orleans, LA 70115', 'Uptown',
   29.9296, -90.1108, 1950, 1950, 2, 2, 1050,
   false, true, false,
   ARRAY[
     'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800',
     'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800',
     'https://images.unsplash.com/photo-1505843513577-22bb7d21e455?w=800'
   ],
   ARRAY['Gym','Parking','AC','Dishwasher','Pool'],
   ARRAY['Modern building','Near Whole Foods'],
   'Brand new 2BR/2BA in a boutique 8-unit building. Quartz countertops, stainless appliances, private balcony. Gated parking included.',
   'ACTIVE', false, '2026-08-01', null, '0.9 miles'),

  -- 7 — Summer sublet
  (owner_id, 'Student Sublet — Summer 2026', 'apartment',
   '7412 Jeanette St, New Orleans, LA 70118', 'Carrollton',
   29.9436, -90.1172, 800, 800, 1, 1, 560,
   true, false, false,
   ARRAY[
     'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=800',
     'https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=800'
   ],
   ARRAY['Wifi','AC'],
   ARRAY['Walk to campus','Sublet'],
   'Furnished 1BR sublet for Summer 2026 (May–August). Half a block from the Tulane main gate. Everything you need is here — just bring your clothes.',
   'ACTIVE', true, '2026-05-15', '2026-08-15', '0.15 miles'),

  -- 8 — Renovated double on Calhoun
  (owner_id, 'Renovated Double on Calhoun', 'house',
   '4908 Calhoun St, New Orleans, LA 70118', 'Uptown',
   29.9379, -90.1089, 1800, 1800, 3, 2, 1400,
   false, true, false,
   ARRAY[
     'https://images.unsplash.com/photo-1449844908441-8829872d2607?w=800',
     'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800',
     'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=800'
   ],
   ARRAY['Washer/Dryer','Parking','AC','Dishwasher'],
   ARRAY['Quiet street','Near Audubon Zoo'],
   'Fully renovated 1920s double shotgun. Open kitchen, new bathrooms, and a large screened porch. Off-street parking for 2 cars. Dogs welcome.',
   'ACTIVE', false, '2026-08-01', null, '0.7 miles'),

  -- 9 — Luxury 1BR Audubon
  (owner_id, 'Luxury 1BR Near Audubon Park', 'apartment',
   '6501 Perrier St, New Orleans, LA 70118', 'Uptown',
   29.9333, -90.1167, 1600, 1600, 1, 1, 780,
   true, false, true,
   ARRAY[
     'https://images.unsplash.com/photo-1508193638397-1c4234db14d8?w=800',
     'https://images.unsplash.com/photo-1502672023488-70e25813eb80?w=800',
     'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=800'
   ],
   ARRAY['Wifi','AC','Utilities','Gym'],
   ARRAY['Audubon Park views','Quiet street'],
   'Premium 1BR in a boutique building half a block from Audubon Park. All utilities included, in-building gym, concierge mail service.',
   'ACTIVE', false, '2026-07-15', null, '0.5 miles'),

  -- 10 — 4BR student house
  (owner_id, 'Shared House — 4BR Near Freret', 'house',
   '7301 Willow St, New Orleans, LA 70118', 'Carrollton',
   29.9410, -90.1155, 3200, 3200, 4, 2, 1800,
   false, true, false,
   ARRAY[
     'https://images.unsplash.com/photo-1523217582562-09d0def993a6?w=800',
     'https://images.unsplash.com/photo-1484154218962-a197022b5858?w=800',
     'https://images.unsplash.com/photo-1493663284031-b7e3aefcae8e?w=800'
   ],
   ARRAY['Washer/Dryer','Parking','AC','Dishwasher'],
   ARRAY['Walk to campus','Huge backyard','Student house'],
   'Massive 4BR house perfect for a group. Huge backyard with a grill, covered porch, large living room, and updated kitchen. Walking distance to Freret Street bars and restaurants.',
   'ACTIVE', false, '2026-08-01', null, '0.3 miles'),

  -- 11 — Carrollton cottage
  (owner_id, 'Carrollton Cottage 2BR', 'house',
   '8120 Oak St, New Orleans, LA 70118', 'Carrollton',
   29.9476, -90.1280, 1500, 1500, 2, 1, 950,
   false, false, false,
   ARRAY[
     'https://images.unsplash.com/photo-1560185893-a55cbc8c57e8?w=800',
     'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800'
   ],
   ARRAY['Parking','AC','Washer/Dryer'],
   ARRAY['Oak St corridor','Near Carrollton Ave'],
   'Cute 2BR cottage on the Oak Street shopping corridor. Hardwood floors, renovated kitchen, private yard with garden. Walk to Riverbend and the streetcar.',
   'ACTIVE', false, '2026-09-01', null, '1.0 miles'),

  -- 12 — Magazine St sublet
  (owner_id, 'Magazine St Sublet — Fall 2026', 'apartment',
   '3409 Magazine St, New Orleans, LA 70115', 'Garden District',
   29.9264, -90.1075, 1100, 1100, 1, 1, 680,
   true, false, false,
   ARRAY[
     'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800',
     'https://images.unsplash.com/photo-1560185007-cde436f6a4d0?w=800'
   ],
   ARRAY['Wifi','AC','Washer/Dryer'],
   ARRAY['Magazine St','Sublet','Garden District'],
   'Furnished 1BR sublet on Magazine Street for Fall 2026 semester. Fully equipped — just bring a bag. Steps from coffee shops, restaurants, and boutiques.',
   'ACTIVE', true, '2026-08-20', '2026-12-20', '1.3 miles'),

  -- 13 — Jefferson Ave upper
  (owner_id, 'Jefferson Ave Upper 2BR', 'apartment',
   '2840 Jefferson Ave, New Orleans, LA 70115', 'Uptown',
   29.9302, -90.1130, 1650, 1650, 2, 1, 900,
   false, false, false,
   ARRAY[
     'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800',
     'https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?w=800',
     'https://images.unsplash.com/photo-1484101403633-562f891dc89a?w=800'
   ],
   ARRAY['Washer/Dryer','AC','Parking'],
   ARRAY['St. Charles corridor','Quiet uptown block'],
   'Upper unit of an Uptown double. Exposed brick, high ceilings, updated bath. Off-street parking. Quiet residential block close to Tulane, Loyola, and the streetcar.',
   'ACTIVE', false, '2026-08-01', null, '0.8 miles'),

  -- 14 — Studio near Loyola
  (owner_id, 'Bright Studio Near Loyola', 'studio',
   '6601 St. Charles Ave, New Orleans, LA 70118', 'Uptown',
   29.9361, -90.1210, 950, 950, 0, 1, 500,
   true, false, true,
   ARRAY[
     'https://images.unsplash.com/photo-1598928506311-c55ded91a20c?w=800',
     'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800'
   ],
   ARRAY['Wifi','AC','Utilities'],
   ARRAY['Streetcar stop','Near Loyola & Tulane'],
   'Compact and bright furnished studio steps from Loyola University. Utilities included. Perfect for a single student. Streetcar stop right out front.',
   'ACTIVE', false, '2026-06-01', null, '0.4 miles'),

  -- 15 — 3BR with parking near campus
  (owner_id, 'Uptown 3BR with Parking', 'house',
   '1724 Lowerline St, New Orleans, LA 70118', 'Carrollton',
   29.9452, -90.1212, 2700, 2700, 3, 2, 1500,
   false, true, false,
   ARRAY[
     'https://images.unsplash.com/photo-1574362848149-11496d93a7c7?w=800',
     'https://images.unsplash.com/photo-1513694203232-719a280e022f?w=800',
     'https://images.unsplash.com/photo-1531971589569-0d9370cbe1e5?w=800'
   ],
   ARRAY['Parking','AC','Washer/Dryer','Dishwasher'],
   ARRAY['Walk to campus','Pet friendly','Off-street parking'],
   'Spacious 3BR raised shotgun two blocks from Tulane''s back campus gate. Newer roof, updated HVAC, private driveway. One of the best values near campus.',
   'ACTIVE', false, '2026-08-15', null, '0.25 miles'),

  -- 16 — CBD loft
  (owner_id, 'Exposed-Brick Loft Downtown', 'apartment',
   '700 Camp St, New Orleans, LA 70130', 'CBD',
   29.9508, -90.0729, 2100, 2100, 1, 1, 1000,
   true, false, true,
   ARRAY[
     'https://images.unsplash.com/photo-1505843513577-22bb7d21e455?w=800',
     'https://images.unsplash.com/photo-1554995207-c18c203602cb?w=800',
     'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=800'
   ],
   ARRAY['Gym','Pool','AC','Utilities','Parking'],
   ARRAY['CBD','River views','Modern building'],
   'Industrial loft in a converted warehouse in the CBD. Exposed brick and beams, 14-ft ceilings, floor-to-ceiling windows. Building has rooftop pool and gym.',
   'ACTIVE', false, '2026-07-01', null, '3.0 miles'),

  -- 17 — Tchoupitoulas studio
  (owner_id, 'Riverfront Studio on Tchoupitoulas', 'studio',
   '4600 Tchoupitoulas St, New Orleans, LA 70115', 'Uptown',
   29.9244, -90.0963, 1050, 1050, 0, 1, 520,
   false, false, true,
   ARRAY[
     'https://images.unsplash.com/photo-1536376072261-38c75010e6c9?w=800',
     'https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=800'
   ],
   ARRAY['AC','Utilities','Washer/Dryer'],
   ARRAY['Near river','Quiet street'],
   'Compact studio near the Tchoupitoulas corridor. Utilities included. Recently renovated with new appliances and floors. Ideal for a solo student or young professional.',
   'ACTIVE', false, '2026-05-01', null, '1.8 miles'),

  -- 18 — French Quarter penthouse
  (owner_id, 'Penthouse 2BR on Bourbon Adjacent', 'apartment',
   '800 Dauphine St, New Orleans, LA 70116', 'French Quarter',
   29.9616, -90.0655, 2600, 2600, 2, 2, 1200,
   true, false, false,
   ARRAY[
     'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800',
     'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800',
     'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=800'
   ],
   ARRAY['AC','Balcony','Wifi'],
   ARRAY['French Quarter','Bourbon St','Courtyard'],
   'Top-floor unit in a historic French Quarter building. Private balcony overlooking a courtyard, exposed brick, central AC. Short-term leases considered.',
   'ACTIVE', false, '2026-06-15', null, '4.5 miles');

  RAISE NOTICE 'Seed complete — 18 listings inserted for user %', owner_id;
END $$;
