-- WaveRow Seed Listings (v3 — authentic student housing NOLA)
-- Run in Supabase SQL editor: https://supabase.com/dashboard/project/jwndsqttukfrivbgbvsa/sql/new

DO $$
DECLARE
  owner_id uuid;
BEGIN
  SELECT user_id INTO owner_id FROM profiles LIMIT 1;

  IF owner_id IS NULL THEN
    RAISE EXCEPTION 'No user found in profiles table. Log in first, then re-run.';
  END IF;

  -- Force delete ALL listings for this seed user to wipe out ghost properties from v1
  DELETE FROM listings WHERE user_id = owner_id;

  INSERT INTO listings (
    user_id, title, type, address, neighborhood,
    lat, lng, rent, deposit, beds, baths, sqft,
    furnished, pets, utilities, photos, amenities,
    proximity_tags, description, status, is_sublease,
    available_from, available_to, distance_to_campus
  ) VALUES

  -- 1
  (owner_id, 'Room avaible in 3bd house near Freret', 'house',
   '4512 Freret St, New Orleans, LA 70115', 'Freret',
   29.9384, -90.1143, 850, 850, 3, 1, 1200,
   false, true, false,
   ARRAY['https://images.pexels.com/photos/2089698/pexels-photo-2089698.jpeg?auto=compress&cs=tinysrgb&w=800'],
   ARRAY['Washer/Dryer','AC','Parking'],
   ARRAY['Walk to campus','Next to dat dog'],
   'Looking for 1 roomate to fill a room in our 3bd/1ba house just off Freret. Rent is 850 + utilites usually around $100. We are 2 juniors, keep things pretty chill. We have a cat so must be ok with pets.',
   'ACTIVE', false, '2026-08-01', null, '0.4 miles'),

  -- 2
  (owner_id, 'Sublet for Fall semester (Aug-Dec)', 'apartment',
   '1538 Broadway St, New Orleans, LA 70118', 'Carrollton',
   29.9462, -90.1228, 900, 900, 1, 1, 450,
   true, false, true,
   ARRAY['https://images.pexels.com/photos/2724749/pexels-photo-2724749.jpeg?auto=compress&cs=tinysrgb&w=800'],
   ARRAY['Wifi','AC','Utilities'],
   ARRAY['Super close to campus','Walk to bootcamp'],
   'Im going abroad next fall and need someone to sublet my room. It''s a 1 bed 1 bath, totally furnised with an ikea bed and desk. Rent includes all utilites. Super easy walk to campus.',
   'ACTIVE', true, '2026-08-15', '2026-12-20', '0.2 miles'),

  -- 3
  (owner_id, '1 roomate needed for double shotgun', 'house',
   '7301 Willow St, New Orleans, LA 70118', 'Carrollton',
   29.9410, -90.1155, 750, 750, 4, 2, 1600,
   false, true, false,
   ARRAY['https://images.pexels.com/photos/259962/pexels-photo-259962.jpeg?auto=compress&cs=tinysrgb&w=800'],
   ARRAY['Parking','AC','Dishwasher'],
   ARRAY['Walk to campus','Backyard'],
   'One room avaible in a 4 person group. We already signed the lease and one person dropped out. House is a older shotgun double but has a nice little backyard. $750/month rent.',
   'ACTIVE', false, '2026-08-01', null, '0.3 miles'),

  -- 4
  (owner_id, 'Summer sublet - utilites included', 'apartment',
   '7900 Maple St, New Orleans, LA 70118', 'Carrollton',
   29.9420, -90.1196, 700, 700, 1, 1, 400,
   true, false, true,
   ARRAY['https://images.pexels.com/photos/1571470/pexels-photo-1571470.jpeg?auto=compress&cs=tinysrgb&w=800'],
   ARRAY['Wifi','AC','Utilities'],
   ARRAY['Steps to Maple St','Above Bruno''s'],
   'Summer sublet (June to mid August). It''s a small furnised place right on Maple st. Really cheap rent for the summer, 700 flat covers internet and power.',
   'ACTIVE', true, '2026-06-01', '2026-08-15', '0.1 miles'),

  -- 5
  (owner_id, 'Lease takeover near Tulane', 'house',
   '1203 Nashville Ave, New Orleans, LA 70115', 'Uptown',
   29.9296, -90.1108, 1100, 1100, 2, 2, 1100,
   false, false, false,
   ARRAY['https://images.pexels.com/photos/279719/pexels-photo-279719.jpeg?auto=compress&cs=tinysrgb&w=800'],
   ARRAY['Washer/Dryer','AC'],
   ARRAY['Near Whole Foods','Audubon park'],
   'Need to get out of my lease early. 2 roomates currently living there, but my room has its own bathroom. You would just be taking over the rest of my lease starting next month.',
   'ACTIVE', true, '2026-09-01', '2027-05-31', '0.9 miles'),

  -- 6
  (owner_id, 'Huge room in shared house on Calhoun', 'house',
   '4908 Calhoun St, New Orleans, LA 70118', 'Uptown',
   29.9379, -90.1089, 950, 950, 3, 2, 1400,
   false, true, false,
   ARRAY['https://images.pexels.com/photos/1454804/pexels-photo-1454804.jpeg?auto=compress&cs=tinysrgb&w=800'],
   ARRAY['Washer/Dryer','Parking','Dishwasher'],
   ARRAY['Quiet street','Near Audubon Zoo'],
   'Looking for a 3rd roomate for our house on Calhoun. Room is massive with a good closet. We are 2 seniors at Tulane. House is a bit older but landlord is responsive.',
   'ACTIVE', false, '2026-08-01', null, '0.7 miles'),

  -- 7
  (owner_id, 'Cozy 1br apt near Loyola', 'apartment',
   '6601 St. Charles Ave, New Orleans, LA 70118', 'Uptown',
   29.9361, -90.1210, 1350, 1350, 1, 1, 550,
   true, false, false,
   ARRAY['https://images.pexels.com/photos/1080721/pexels-photo-1080721.jpeg?auto=compress&cs=tinysrgb&w=800'],
   ARRAY['AC','Wifi'],
   ARRAY['Streetcar stop','Very close to Loyola'],
   'Its a tight squeeze but great if you want to live alone. 1br apartment right off St charles. Unfurnished but I can leave the desk and couch if you want.',
   'ACTIVE', false, '2026-08-15', null, '0.4 miles'),

  -- 8
  (owner_id, 'Looking for roomate - Spring semester', 'apartment',
   '3409 Magazine St, New Orleans, LA 70115', 'Garden District',
   29.9264, -90.1075, 1000, 1000, 2, 1, 900,
   true, false, false,
   ARRAY['https://images.pexels.com/photos/259580/pexels-photo-259580.jpeg?auto=compress&cs=tinysrgb&w=800'],
   ARRAY['AC','Washer/Dryer'],
   ARRAY['Magazine St','Lots of food'],
   'My roomate is studying abroad in spring so I need someone to cover his half of rent from Jan-May. It is fully furnised. Right on magazine street.',
   'ACTIVE', true, '2027-01-01', '2027-05-31', '1.3 miles'),

  -- 9
  (owner_id, 'Cheap room in old uptown house', 'house',
   '2840 Jefferson Ave, New Orleans, LA 70115', 'Uptown',
   29.9302, -90.1130, 650, 650, 4, 1, 1500,
   false, false, false,
   ARRAY['https://images.pexels.com/photos/280222/pexels-photo-280222.jpeg?auto=compress&cs=tinysrgb&w=800'],
   ARRAY['Washer/Dryer','AC'],
   ARRAY['Cheap rent','Big house'],
   'We need a 4th person to sign the lease with us. The house is def old and only has 1 bathroom but rent is super cheap ($650). AC works fine most of the time.',
   'ACTIVE', false, '2026-08-01', null, '0.8 miles'),

  -- 10
  (owner_id, 'Furnised room for sublease ASAP', 'apartment',
   '8120 Oak St, New Orleans, LA 70118', 'Carrollton',
   29.9476, -90.1280, 800, 800, 2, 1, 800,
   true, false, false,
   ARRAY['https://images.pexels.com/photos/2724748/pexels-photo-2724748.jpeg?auto=compress&cs=tinysrgb&w=800'],
   ARRAY['AC'],
   ARRAY['Near Jacques imos'],
   'Subleasing my room starting immediatly through August. $800 a month plus half of utilites. Roomate is a chill grad student. I am leaving my bed and dresser.',
   'ACTIVE', true, '2026-04-15', '2026-08-31', '1.0 miles'),

  -- 11
  (owner_id, 'Looking for replacement roommate on Zimple', 'house',
   '7200 Zimple St, New Orleans, LA 70118', 'Carrollton',
   29.9405, -90.1180, 825, 825, 3, 2, 1300,
   false, false, false,
   ARRAY['https://images.pexels.com/photos/209296/pexels-photo-209296.jpeg?auto=compress&cs=tinysrgb&w=800'],
   ARRAY['AC', 'Washer/Dryer', 'WiFi'],
   ARRAY['Walk to bootcamp', 'Very close to campus'],
   'I am graduating in December and need someone to take over my room starting January. The house is a typical older shotgun right near campus.',
   'ACTIVE', true, '2027-01-01', '2027-05-31', '0.2 miles'),

  -- 12
  (owner_id, '2 Bedrooms available in 4BD House', 'house',
   '7800 Burthe St, New Orleans, LA 70118', 'Carrollton',
   29.9430, -90.1205, 950, 950, 4, 2, 1800,
   false, true, true,
   ARRAY['https://images.pexels.com/photos/1396122/pexels-photo-1396122.jpeg?auto=compress&cs=tinysrgb&w=800'],
   ARRAY['AC', 'Dishwasher', 'Pets OK'],
   ARRAY['Quiet Block', 'Off-street parking'],
   'Myself and a friend signed a 4BD house but our other two roommates backed out. We have 2 rooms available. Total rent per person $950.',
   'ACTIVE', false, '2026-08-01', null, '0.4 miles'),

  -- 13
  (owner_id, 'Studio apt off St Charles', 'apartment',
   '7400 St Charles Ave, New Orleans, LA 70118', 'Uptown',
   29.9380, -90.1190, 1200, 1200, 0, 1, 400,
   true, false, false,
   ARRAY['https://images.pexels.com/photos/2082087/pexels-photo-2082087.jpeg?auto=compress&cs=tinysrgb&w=800'],
   ARRAY['AC', 'Furnished'],
   ARRAY['Streetcar', 'Loyola side'],
   'Small detached studio behind a larger property. Fully furnished with a twin bed. Kitchenette only (no full oven). Really cozy for 1 person.',
   'ACTIVE', false, '2026-08-15', null, '0.5 miles'),

  -- 14
  (owner_id, 'Room in lower garden district flat', 'apartment',
   '1400 Felicity St, New Orleans, LA 70130', 'Lower Garden',
   29.9365, -90.0760, 1050, 1050, 2, 1, 950,
   false, true, false,
   ARRAY['https://images.pexels.com/photos/210265/pexels-photo-210265.jpeg?auto=compress&cs=tinysrgb&w=800'],
   ARRAY['Washer/Dryer', 'AC'],
   ARRAY['Magazine St', 'Bus Route'],
   'A bit further from campus but great if you have a car or ride the bus. Living with an older grad student. Exposed brick inside.',
   'ACTIVE', false, '2026-09-01', null, '3.5 miles'),

  -- 15
  (owner_id, 'Summer Sublet near Tulane Med', 'apartment',
   '1500 Tulane Ave, New Orleans, LA 70112', 'CBD/Downtown',
   29.9570, -90.0765, 1400, 1400, 1, 1, 600,
   true, false, true,
   ARRAY['https://images.pexels.com/photos/1668860/pexels-photo-1668860.jpeg?auto=compress&cs=tinysrgb&w=800'],
   ARRAY['Gym', 'Pool', 'Utilities'],
   ARRAY['Near Med School', 'Medical District'],
   'Perfect for a med student rotating down here in the summer. Modern hi-rise building directly across from the med school.',
   'ACTIVE', true, '2026-05-15', '2026-08-01', '4.0 miles');

  RAISE NOTICE 'Seed complete — 15 realistic student listings inserted for user %', owner_id;
END $$;
