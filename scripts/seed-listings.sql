-- WaveRow Seed Listings (v4 — Authentic NOLA Student Style)
-- Run in Supabase SQL editor

DO $$
DECLARE
  owner_id uuid;
BEGIN
  SELECT user_id INTO owner_id FROM profiles LIMIT 1;

  IF owner_id IS NULL THEN
    RAISE EXCEPTION 'No user found in profiles table. Log in first, then re-run.';
  END IF;

  -- Wipe out ghost properties
  DELETE FROM listings WHERE user_id = owner_id;

  INSERT INTO listings (
    user_id, title, type, address, neighborhood,
    lat, lng, rent, deposit, beds, baths, sqft,
    furnished, pets, utilities, photos, amenities,
    proximity_tags, description, status, is_sublease,
    available_from, available_to, distance_to_campus
  ) VALUES

  -- 1
  (owner_id, 'Raised Shotgun on Freret (Needs Roommate)', 'house',
   '4512 Freret St, New Orleans, LA 70118', 'Uptown / Carrollton',
   29.9384, -90.1143, 1400, 1400, 3, 1, 1200,
   false, true, false,
   ARRAY['https://images.pexels.com/photos/259962/pexels-photo-259962.jpeg?auto=compress&cs=tinysrgb&w=800'],
   ARRAY['Window AC','High Ceilings','Peeling Paint'],
   ARRAY['Walk to Tulane','Next to Dat Dog'],
   'Looking for one person to take the middle room in our slightly rundown raised shotgun. Classic NOLA charm (meaning nothing is perfectly level). We have a few cats. Rent is 1400 for your share. It''s messy but we love it.',
   'ACTIVE', false, '2026-08-01', null, '0.4 miles'),

  -- 2
  (owner_id, 'Semester Sublet - Big Room, Messy Counter', 'apartment',
   '1538 Broadway St, New Orleans, LA 70118', 'Uptown / Carrollton',
   29.9462, -90.1228, 1650, 1650, 1, 1, 450,
   true, false, true,
   ARRAY['https://images.pexels.com/photos/2724749/pexels-photo-2724749.jpeg?auto=compress&cs=tinysrgb&w=800'],
   ARRAY['Window AC','Wifi Included','Walk to Tulane'],
   ARRAY['Super close to campus','Walk to bootcamp'],
   'I need someone to take my fall sublet while I''m abroad. Room is cluttered but massive with huge ceilings. I''m leaving my Tulane gear and desk. Kitchen is old but works.',
   'ACTIVE', true, '2026-08-15', '2026-12-20', '0.2 miles'),

  -- 3
  (owner_id, 'Huge Double Shotgun near Willow', 'house',
   '7301 Willow St, New Orleans, LA 70118', 'Uptown / Carrollton',
   29.9410, -90.1155, 2400, 2400, 4, 2, 1600,
   false, true, false,
   ARRAY['https://images.pexels.com/photos/1454804/pexels-photo-1454804.jpeg?auto=compress&cs=tinysrgb&w=800'],
   ARRAY['High Ceilings','Wrought Iron Balcony','Backyard'],
   ARRAY['Walk to Tulane','Near The Boot'],
   'Classic peeling colorful paint exterior. We are 3 rising seniors needing a 4th. House has amazing high cypress ceilings but you will definitely need the window AC unit running full blast in August.',
   'ACTIVE', false, '2026-08-01', null, '0.3 miles'),

  -- 4
  (owner_id, 'Basic Summer Flat Above Bruno''s', 'apartment',
   '7900 Maple St, New Orleans, LA 70118', 'Uptown / Carrollton',
   29.9420, -90.1196, 1450, 1450, 1, 1, 400,
   true, false, true,
   ARRAY['https://images.pexels.com/photos/279719/pexels-photo-279719.jpeg?auto=compress&cs=tinysrgb&w=800'],
   ARRAY['Window AC','Utilities included'],
   ARRAY['Steps to Maple St','Above Bruno''s'],
   'Tiny snapshot of my summer sublet. Ignore the clothes in the picture. Cheap, easy, right near Maple street. 1450/mo flat.',
   'ACTIVE', true, '2026-06-01', '2026-08-15', '0.1 miles'),

  -- 5
  (owner_id, 'Lease takeover - Old house on Nashville', 'house',
   '1203 Nashville Ave, New Orleans, LA 70118', 'Uptown / Carrollton',
   29.9296, -90.1108, 1800, 1800, 2, 2, 1100,
   false, false, false,
   ARRAY['https://images.pexels.com/photos/2089698/pexels-photo-2089698.jpeg?auto=compress&cs=tinysrgb&w=800'],
   ARRAY['Window AC','Wood Floors','High Ceilings'],
   ARRAY['Near Whole Foods','Audubon park'],
   'Flash photo of my bedroom because the bulb went out. Need to get out of my lease early. Hardwood floors, classic old Uptown vibe. $1800/mo.',
   'ACTIVE', true, '2026-09-01', '2027-05-31', '0.9 miles'),

  -- 6
  (owner_id, 'Calhoun St House - Unpolished gem', 'house',
   '4908 Calhoun St, New Orleans, LA 70118', 'Uptown / Carrollton',
   29.9379, -90.1089, 2100, 2100, 3, 2, 1400,
   false, true, false,
   ARRAY['https://images.pexels.com/photos/1571470/pexels-photo-1571470.jpeg?auto=compress&cs=tinysrgb&w=800'],
   ARRAY['Window AC','Wrought Iron Gate'],
   ARRAY['Quiet street','Walk to Tulane'],
   'Looking for a 3rd roommate. Typical uptown clutter, messy kitchen but incredible location. Tons of character.',
   'ACTIVE', false, '2026-08-01', null, '0.7 miles'),

  -- 7
  (owner_id, 'Tight 1br off St Charles', 'apartment',
   '6601 St. Charles Ave, New Orleans, LA 70118', 'Uptown / Carrollton',
   29.9361, -90.1210, 1550, 1550, 1, 1, 550,
   true, false, false,
   ARRAY['https://images.pexels.com/photos/259580/pexels-photo-259580.jpeg?auto=compress&cs=tinysrgb&w=800'],
   ARRAY['High Ceilings','Window AC'],
   ARRAY['Streetcar stop','Very close to Loyola'],
   'Snapshot of the kitchen. Tight squeeze but great if you want to fly solo. Peeling paint outside but cozy inside. Very close to the streetcar.',
   'ACTIVE', false, '2026-08-15', null, '0.4 miles'),

  -- 8
  (owner_id, 'Spring Semester Room - Magazine St', 'apartment',
   '3409 Magazine St, New Orleans, LA 70118', 'Uptown / Carrollton',
   29.9264, -90.1075, 1750, 1750, 2, 1, 900,
   true, false, false,
   ARRAY['https://images.pexels.com/photos/1080721/pexels-photo-1080721.jpeg?auto=compress&cs=tinysrgb&w=800'],
   ARRAY['Window AC','Wood Floors'],
   ARRAY['Magazine St','Walk to Tulane'],
   'My roommate is studying abroad. Classic uptown flat, lots of character (and old plumbing). Rent is $1750 for your half.',
   'ACTIVE', true, '2027-01-01', '2027-05-31', '1.3 miles'),

  -- 9
  (owner_id, 'Need 4th for Old Uptown House', 'house',
   '2840 Jefferson Ave, New Orleans, LA 70118', 'Uptown / Carrollton',
   29.9302, -90.1130, 1400, 1400, 4, 1, 1500,
   false, false, false,
   ARRAY['https://images.pexels.com/photos/280222/pexels-photo-280222.jpeg?auto=compress&cs=tinysrgb&w=800'],
   ARRAY['Window AC','Small Yard'],
   ARRAY['Cheap rent','Walk to Tulane'],
   'Old exterior with peeling paint and iron rails. We need an extra person to sign. Rent is totally cheap for the area considering we get the whole house.',
   'ACTIVE', false, '2026-08-01', null, '0.8 miles'),

  -- 10
  (owner_id, 'Messy Sublease on Oak St', 'apartment',
   '8120 Oak St, New Orleans, LA 70118', 'Uptown / Carrollton',
   29.9476, -90.1280, 1600, 1600, 2, 1, 800,
   true, false, false,
   ARRAY['https://images.pexels.com/photos/2724748/pexels-photo-2724748.jpeg?auto=compress&cs=tinysrgb&w=800'],
   ARRAY['Window AC','High Ceilings'],
   ARRAY['Near Jacques Imos','Walk to Tulane'],
   'Quick snap of my room before I move out. Subleasing starting ASAP. Really good high ceilings and natural light if you open the old blinds.',
   'ACTIVE', true, '2026-04-15', '2026-08-31', '1.0 miles'),

  -- 11
  (owner_id, 'Zimple St Replacement Roommate', 'house',
   '7200 Zimple St, New Orleans, LA 70118', 'Uptown / Carrollton',
   29.9405, -90.1180, 1900, 1900, 3, 2, 1300,
   false, false, false,
   ARRAY['https://images.pexels.com/photos/209296/pexels-photo-209296.jpeg?auto=compress&cs=tinysrgb&w=800'],
   ARRAY['Window AC', 'High Ceilings', 'WiFi'],
   ARRAY['Walk to bootcamp', 'Walk to Tulane'],
   'Candid shot of the bathroom right near campus. I am graduating in December so I need someone to snake my room for January.',
   'ACTIVE', true, '2027-01-01', '2027-05-31', '0.2 miles'),

  -- 12
  (owner_id, '2 Beds open in 4BD Burthe St House', 'house',
   '7800 Burthe St, New Orleans, LA 70118', 'Uptown / Carrollton',
   29.9430, -90.1205, 3000, 3000, 4, 2, 1800,
   false, true, true,
   ARRAY['https://images.pexels.com/photos/1396122/pexels-photo-1396122.jpeg?auto=compress&cs=tinysrgb&w=800'],
   ARRAY['Window AC', 'Peeling Paint Exterior', 'Pets OK'],
   ARRAY['Quiet Block', 'Walk to Tulane'],
   'Rent is $3000 total for the remaining two bedrooms. It''s a classic double gallery house. Very rustic NOLA interior (uneven floors etc).',
   'ACTIVE', false, '2026-08-01', null, '0.4 miles'),

  -- 13
  (owner_id, 'Studio flat off St Charles - Cluttered', 'apartment',
   '7400 St Charles Ave, New Orleans, LA 70118', 'Uptown / Carrollton',
   29.9380, -90.1190, 1850, 1850, 0, 1, 400,
   true, false, false,
   ARRAY['https://images.pexels.com/photos/2082087/pexels-photo-2082087.jpeg?auto=compress&cs=tinysrgb&w=800'],
   ARRAY['Window AC', 'Furnished'],
   ARRAY['Streetcar', 'Loyola side'],
   'Sorry for the blur, took this fast. It''s a tiny studio flat. $1850/mo. Window AC unit kicks hard in the summer. Very authentic feel.',
   'ACTIVE', false, '2026-08-15', null, '0.5 miles'),

  -- 14
  (owner_id, 'Carriage house near Freret', 'apartment',
   '4600 Freret St, New Orleans, LA 70118', 'Uptown / Carrollton',
   29.9365, -90.0760, 2200, 2200, 2, 1, 950,
   false, true, false,
   ARRAY['https://images.pexels.com/photos/210265/pexels-photo-210265.jpeg?auto=compress&cs=tinysrgb&w=800'],
   ARRAY['High Ceilings', 'Window AC'],
   ARRAY['Freret Corridor', 'Walk to Tulane'],
   'Living here with my dog. It''s a dope little carriage house with massive windows and raw brick. Needs a roommate for the second room.',
   'ACTIVE', false, '2026-09-01', null, '0.5 miles'),

  -- 15
  (owner_id, 'Sublet near The Boot', 'apartment',
   '1000 Broadway St, New Orleans, LA 70118', 'Uptown / Carrollton',
   29.9570, -90.0765, 2000, 2000, 1, 1, 600,
   true, false, true,
   ARRAY['https://images.pexels.com/photos/1668860/pexels-photo-1668860.jpeg?auto=compress&cs=tinysrgb&w=800'],
   ARRAY['Window AC', 'Tulane Gear', 'Utilities'],
   ARRAY['Near The Boot', 'Walk to Tulane'],
   'Very candid room snapshot - I am leaving my Tulane stuff up on the walls. Need a sublet. $2000 flat.',
   'ACTIVE', true, '2026-05-15', '2026-08-01', '0.1 miles');

  RAISE NOTICE 'Seed complete — 15 realistic student listings matching prompt constraints inserted';
END $$;
