-- ============================================================
-- RepMax JotForm Import — Staging Data
-- Generated: 2026-02-14
-- Total Prospects: 203
--
-- This script creates a staging table and loads raw JotForm data.
-- To migrate staging → production tables, run:
--   npx tsx supabase/import/import-prospects.ts
--
-- DO NOT use the staging table directly — column names and types
-- differ from the production schema (profiles + athletes).
-- ============================================================

BEGIN;

-- ============================================================
-- STEP 1: Create staging table for raw import
-- ============================================================

DROP TABLE IF EXISTS import_prospects_staging CASCADE;
CREATE TABLE import_prospects_staging (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  repmax_id TEXT NOT NULL,
  client TEXT NOT NULL,              -- 'repmax' or 'ca_recruits'
  school_key TEXT NOT NULL,
  school_official_name TEXT,
  school_city TEXT,
  school_state TEXT,

  -- Player info
  full_name TEXT,
  email TEXT,
  phone TEXT,
  positions TEXT,
  class_year INT,
  height TEXT,
  weight INT,
  jersey_number INT,

  -- Measurables
  forty_yard DECIMAL(4,2),
  shuttle DECIMAL(4,2),
  broad_jump TEXT,
  vertical DECIMAL(4,1),
  squat INT,
  bench INT,
  wingspan TEXT,

  -- Academics
  gpa DECIMAL(4,2),
  core_gpa DECIMAL(4,2),
  academic_interest TEXT,
  college_priority TEXT,

  -- Recruiting
  college_offers TEXT,
  awards TEXT,
  multi_sport TEXT,
  camps_attended TEXT,
  target_colleges TEXT,

  -- Links & social
  hudl_link TEXT,
  twitter TEXT,
  instagram TEXT,
  headshot_url TEXT,
  ncaa_id TEXT,

  -- Parents
  parent1_name TEXT,
  parent1_phone TEXT,
  parent1_email TEXT,
  parent2_name TEXT,
  parent2_phone TEXT,
  parent2_email TEXT,

  -- Gear sizes
  cleat_size TEXT,
  shirt_size TEXT,
  pants_size TEXT,
  helmet_size TEXT,
  glove_size TEXT,

  -- Metadata
  submission_date TEXT,
  callback_requested TEXT,
  imported_at TIMESTAMPTZ DEFAULT NOW(),
  processed BOOLEAN DEFAULT FALSE
);

-- ============================================================
-- STEP 2: Reference table for schools
-- (standalone — not linked to production tables)
-- ============================================================

DROP TABLE IF EXISTS import_teams CASCADE;
CREATE TABLE import_teams (
  id UUID PRIMARY KEY,
  name TEXT NOT NULL,
  school TEXT NOT NULL,
  city TEXT,
  state TEXT,
  zone TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

INSERT INTO import_teams (id, name, school, city, state, zone, created_at) VALUES
  ('1a142284-b5d7-4021-b720-e93401209b9e', 'Woodrow Wilson High School', 'Woodrow Wilson High School', 'Long Beach', 'CA', 'WEST', NOW()),
  ('4fca5c0b-1d54-4658-abff-885ccd0264bd', 'Mayfair High School', 'Mayfair High School', 'Lakewood', 'CA', 'WEST', NOW()),
  ('06ea11cf-b6bf-4daa-a5f0-106a0ff88f61', 'Newbury Park High School', 'Newbury Park High School', 'Newbury Park', 'CA', 'WEST', NOW()),
  ('d3df8415-fe5d-4350-931a-85b2029acdcf', 'Sierra Canyon School', 'Sierra Canyon School', 'Chatsworth', 'CA', 'WEST', NOW()),
  ('cc2867e2-e74c-45ed-82b8-8d4757b7084e', 'St. Pius X - St. Matthias Academy', 'St. Pius X - St. Matthias Academy', 'Downey', 'CA', 'WEST', NOW()),
  ('88540c4c-a413-488d-ae6d-92a49df2180c', 'Western High School', 'Western High School', 'Anaheim', 'CA', 'WEST', NOW()),
  ('cb266a27-dc72-4bac-be36-c3e94821c16f', 'Bakersfield Christian High School', 'Bakersfield Christian High School', 'Bakersfield', 'CA', 'WEST', NOW()),
  ('07e3186e-d068-4981-b28c-990d77e34907', 'Garces Memorial High School', 'Garces Memorial High School', 'Bakersfield', 'CA', 'WEST', NOW()),
  ('318aab6a-2d08-4a2f-ac40-5c07429391f9', 'Heritage Christian School', 'Heritage Christian School', 'Bakersfield', 'CA', 'WEST', NOW()),
  ('a1ef6a31-70b2-4516-912e-e8c08740e310', 'Independence High School', 'Independence High School', 'Bakersfield', 'CA', 'WEST', NOW()),
  ('7391f798-8e56-46dd-8a58-0cb7f9ee8aa1', 'Knight High School', 'Knight High School', 'Palmdale', 'CA', 'WEST', NOW()),
  ('fe448f95-8af6-4151-94de-727ab53452b8', 'Ontario Christian High School', 'Ontario Christian High School', 'Ontario', 'CA', 'WEST', NOW()),
  ('e8721e20-25a7-44de-9710-9dab3a2b511f', 'Paraclete High School', 'Paraclete High School', 'Lancaster', 'CA', 'WEST', NOW()),
  ('344bde67-5ca6-436f-868f-6be071d77762', 'Redwood High School', 'Redwood High School', 'Visalia', 'CA', 'WEST', NOW()),
  ('41401255-9fb6-493b-a04a-e7c55253488b', 'South East High School', 'South East High School', 'South Gate', 'CA', 'WEST', NOW()),
  ('8611b463-d787-4366-88e3-acf66ed36857', 'Frontier High School', 'Frontier High School', 'Bakersfield', 'CA', 'WEST', NOW());

-- ============================================================
-- STEP 3: Insert prospect data into staging
-- ============================================================

-- Batch 1
INSERT INTO import_prospects_staging (
  id, repmax_id, client, school_key, school_official_name, school_city, school_state,
  full_name, email, phone, positions, class_year, height, weight, jersey_number,
  forty_yard, shuttle, broad_jump, vertical, squat, bench, wingspan,
  gpa, core_gpa, academic_interest, college_priority,
  college_offers, awards, multi_sport, camps_attended, target_colleges,
  hudl_link, twitter, instagram, headshot_url, ncaa_id,
  parent1_name, parent1_phone, parent1_email,
  parent2_name, parent2_phone, parent2_email,
  cleat_size, shirt_size, pants_size, helmet_size, glove_size,
  submission_date, callback_requested
) VALUES
  ('d74e25dd-1900-4e8d-ade8-0ebe54066148', 'REP-MW-6838', 'repmax', 'Wilson', 'Woodrow Wilson High School', 'Long Beach', 'CA', 'Jemel Grigsby', 'jemeljg21@gmail.com', NULL, 'Rb, Cb, Slot Wr', 2028, '5''8', 175, 21, 4.7, 4.2, NULL, NULL, NULL, NULL, NULL, 2.8, 3.0, 'Finance and Business', 'Good academic. and good football program.', 'none yet', NULL, 'Football, Track, Basketball', NULL, 'Lsu, University of Oregon, Usc, Penn State University, University Arizona', NULL, NULL, '@prollymel', 'https://www.jotform.com/uploads/WilliamLeague/242808363091154/6197031427059265385/6197031427059265385_base64_33_1743893942.png', NULL, 'Charnette Grigsby', '5628337003', 'jemeljg21@gmail.com', 'Andre Bailey', '5628339369', 'jemeljg21@gmail.com', '10.5', 'S', 'S', 'M', 'S', 'Apr 5, 2025', 'Yes'),
  ('01e5d4a5-6e6b-4fae-b7df-df1eacbdc2f1', 'REP-LI-1061', 'repmax', 'Wilson', 'Woodrow Wilson High School', 'Long Beach', 'CA', 'Andrew Uriarte', 'andrewu7@yahoo.com', NULL, 'OL DT', 2026, '5'11', 265, 77, NULL, NULL, NULL, NULL, 265, 225, NULL, 2.86, 2.86, 'Football', 'Everything is important for me', NULL, NULL, NULL, NULL, 'USC UCLA LSU Arizona', 'http://www.hudl.com/profile/21669455', 'Andrew U', '562andrew7', 'https://www.jotform.com/uploads/WilliamLeague/242808363091154/6186708180429082994/6186708180429082994_base64_33_1742861618.png', NULL, 'Maria martinez', '5627049357', 'Maria.martinez0817@gmail.com', 'Gustavo Ruan', '5623557774', 'Lbgruan@yahoo.com', '12', 'XXL', 'XXL', 'XL', 'XL', 'Mar 24, 2025', '562 362 1774'),
  ('33470803-e208-4635-a0b4-b34bc52f90a1', 'REP-NB-8247', 'repmax', 'Wilson', 'Woodrow Wilson High School', 'Long Beach', 'CA', 'William Kinsman', 'wmkinsman@gmail.com', '5627406077', 'strong safety, free safety', 2026, '5'10', 150, 27, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 3.9, 3.9, 'engineering', 'engineering program', '0', NULL, NULL, NULL, 'i don't know', NULL, 'KinsmanWil51223', 'will.kinsman4', 'https://www.jotform.com/uploads/WilliamLeague/242808363091154/6183808711657314084/6183808711657314084_base64_33_1742571671.png', NULL, 'amgela', '7146544757', 'akinsman426@gmail.com', NULL, NULL, NULL, '10.5/11', 'M', 'M', 'M', 'M
XL', 'Mar 21, 2025', 'yes'),
  ('806007c1-cc25-412a-bf2f-e89408a20b31', 'REP-DT-2784', 'repmax', 'Wilson', 'Woodrow Wilson High School', 'Long Beach', 'CA', 'Dylan Sula', 'dcs228@oulook.com', NULL, 'MLB/FB', 2027, '5'11', 195, 33, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 3.7, 3.6, 'Undecided', 'A school that is welcoming, and as a good culture', NULL, NULL, NULL, NULL, 'USC, UCLA, Fresno, Hawaii, and Oregon', 'https://www.hudl.com/v/2PtwsR', 'https://x.com/dylansula?s=21', '_dylansula', 'https://www.jotform.com/uploads/WilliamLeague/242808363091154/6206364296423937168/6206364296423937168_base64_33_1744827229.png', NULL, 'Reta Sula', '5627060545', 'rsula11@hotmail.com', 'Veronica Coleman', '5625527229', 'Ronnie.coleman562@gmail.com', '12', 'M', 'L', 'L', 'XL', 'Apr 16, 2025', NULL),
  ('18b621e2-1dbf-4fbb-b549-5bb76da4d534', 'REP-ST-1721', 'repmax', 'Wilson', 'Woodrow Wilson High School', 'Long Beach', 'CA', 'Paul Chavez', '6paulchavez@gmail.com', NULL, 'CB', 2027, '5,8', 148, 37, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 3.5, 3.5, 'Undecided', 'School of arts or law', NULL, NULL, 'Wrestling', 'Non', 'Cal state La
Wisconsin
Iowa
Minnesota state
Ucla', NULL, NULL, 'paulchavez5946', 'https://www.jotform.com/uploads/WilliamLeague/242808363091154/6193544216518839756/6193544216518839756_base64_33_1743545221.png', NULL, 'Irving', '3234271801', 'Irvingchavezj@gmail.com', 'Jazmin', '3234271802', 'Jazmingranados@gmail.com', '10', 'M', 'M', 'M', 'M', 'Apr 1, 2025', NULL),
  ('ef959b07-065e-4909-b067-b3f9d266d40b', 'REP-LH-7704', 'repmax', 'Wilson', 'Woodrow Wilson High School', 'Long Beach', 'CA', 'Adonus bass', '5stardondon@gmail.com', NULL, 'Wr,rb,cb', 2028, '5'7', 143, 5, NULL, NULL, NULL, NULL, 215, 175, NULL, 3.0, 67.0, 'Undecided', 'Available Majors/Programs of Study.
Reputation.
Housing Options.
Campus Life.
Available Resources.', NULL, 'Sports management.     3 time MVP champion in middle school, player of the game as a freshman in high school.
Exercise science.      3 time MVP champion in middle school.
Sports  psychology.       3 time MVP champion in middle school', 'Football
Track
Basketball', NULL, 'USC Trojans
UCLA
Texas state
Texas longhorns
 Oregon ducks', NULL, NULL, 'Certified.a5', 'https://www.jotform.com/uploads/WilliamLeague/242808363091154/6206351938129615228/6206351938129615228_base64_33_1744825993.png', NULL, 'Heaven', NULL, 'Heavenfraise@gmail.com', NULL, NULL, NULL, '10', 'S', 'S', 'M', 'M', 'Apr 16, 2025', 'Yes'),
  ('28438746-e5ff-4d2b-904a-167da1f6364e', 'REP-DG-6609', 'repmax', 'Wilson', 'Woodrow Wilson High School', 'Long Beach', 'CA', 'Thomas Kones', 'tjones012308@gmail.com', NULL, 'WR DB K', 2026, '5'11', 165, 12, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 3.89, 3.71, 'Undecided', 'Future after football', NULL, 'Bruin of the year', 'Soccer
Track', NULL, 'Cal poly SLO
Uc Davis
Sdsu
UConn
Ole miss', 'https://www.hudl.com/v/2Pu5QD', 'TJONES2026', NULL, 'https://www.jotform.com/uploads/WilliamLeague/242808363091154/6184065179338282952/6184065179338282952_base64_33_1742597317.png', NULL, 'Katy', '5628893503', 'Katyf5@gmail.com', 'Brian', '5628893503', 'BrianJones23', '9.5', 'M', 'M', 'M', 'M', 'Mar 21, 2025', '5627083084'),
  ('dc915c0e-17d4-4373-bc25-d4eba4a1db3d', 'REP-MA-4807', 'repmax', 'Wilson', 'Woodrow Wilson High School', 'Long Beach', 'CA', 'Jordan Hunter', '3goingd2@gmail.com', NULL, 'ATH', 2026, '5''11', 170, 9, 4.6, NULL, NULL, NULL, 365, 170, NULL, 3.2, 3.8, 'Undecided', 'Best fit for me', NULL, NULL, 'Basketbal', 'Only NFL player camps', 'USC , UCLA , Miami , Penn State , Washington', NULL, '1ofnoned1', '@adandeee', 'https://www.jotform.com/uploads/WilliamLeague/242808363091154/6183818390591554867/6183818390591554867_base64_33_1742572640.png', NULL, 'Rogers Hunter', '5624799478', 'rgrshunter1971@gmail.com', 'Jamie Hunter', '4242431095', 'Jamieshunte@gmail.com', '11.5', 'M', 'M', 'M', 'M', 'Mar 21, 2025', '4245376777'),
  ('a43a8dbf-21f8-4c14-aec0-f9c7f3d3fb1b', 'REP-JZ-3526', 'repmax', 'Wilson', 'Woodrow Wilson High School', 'Long Beach', 'CA', 'Zackariah Salcedo', 'SalcedoZack8@gmail.com', NULL, 'OL/ DL', 2026, '6'1', 240, 52, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 3.5, 3.0, 'Yes', 'The location on where the college is located', NULL, 'Don't know', 'Wrestling', NULL, 'Undecided', 'http://www.hudl.com/profile/17905939', '@Zackariah52', 'Zackariah_Salcedo', 'https://www.jotform.com/uploads/WilliamLeague/242808363091154/6179721325786681380/6179721325786681380_base64_33_1742162932.png', 'Don't have one', 'Maria', '5622770668', 'salcedomaria26@gmail.com', 'William', '5624723280', 'salcedowilliam28@gmail.com', '13', 'XL
XXL', 'XL
XXL', 'XL', 'XL
XXL', 'Mar 16, 2025', 'Yes'),
  ('6727e684-d3e7-4fe6-8251-75d6786e8661', 'REP-ZY-3613', 'repmax', 'Wilson', 'Woodrow Wilson High School', 'Long Beach', 'CA', 'Jagger Kohagura', 'jaggerkohagura123@gmail.com', NULL, 'Tight End/ Defensive end', 2026, '6'3', 205, 88, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 4.33, 3.86, 'Finance, Business and architecture', 'The location of the college is most important to me because I want to be located upon a beautiful campus with a nice surrounding area.', NULL, 'Honor Roll', 'Did track earlier in high school', NULL, 'Cal Poly Slo, UCSD, San Diego State, Oregon, UCSB', 'http://www.hudl.com/profile/17821848', 'JKohagura2026', 'jaggerkohagura', 'https://www.jotform.com/uploads/WilliamLeague/242808363091154/6179669145316458026/6179669145316458026_base64_33_1742157716.png', '2503535337', 'Ernie Kohagura', '5623011298', 'Kohallero@gmail.com', 'Sunny Holte', '5627089920', 'Sunnykohagura@outlook.com', '12.5', 'XL', 'XL', 'XL', 'XL', 'Mar 16, 2025', 'Yes'),
  ('20d2e739-ddb0-4463-b0d9-b9111c51f6e3', 'REP-UD-9112', 'repmax', 'Wilson', 'Woodrow Wilson High School', 'Long Beach', 'CA', 'Kenneth Bell', 'kennyball220@gmail.com', '5624004472', 'WR, CB, KR', 2026, '5'8', 150, 23, 4.7, NULL, NULL, NULL, 255, 165, NULL, 3.8, 3.0, 'Public relations, communications, marketing, production', 'The area its in, majors and programs provided, football coaching staff', NULL, 'Honor roll', 'I run track and play football', 'Rivals', 'UCLA, PVAMU, Colorado buffalo, LSU, Texas A&M', NULL, 'Kennybell_23', 'Ke.nnnyyy', 'https://www.jotform.com/uploads/WilliamLeague/242808363091154/6183822452629966133/6183822452629966133_base64_33_1742573048.png', NULL, 'Tyra Pittman', '6262909103', 'Kndy06@gmail.com', NULL, NULL, NULL, 'Nine', 'S', 'M', 'M', 'M', 'Mar 21, 2025', 'Yes'),
  ('fa0cf6b0-38a2-4e2d-9c24-a80c6d0bf8b1', 'REP-MW-7693', 'repmax', 'Western', 'Western High School', 'Anaheim', 'CA', 'Dylan Johnson', 'dyanjhnsn8@gmail.com', '3237709488', 'OL/DL', 2027, '6''0', 264, 76, 5.6, NULL, NULL, NULL, 405, 275, NULL, 3.5, 3.5, 'Mechanical Engineer', 'What educational program the College will offer to better my future outside of football.', NULL, 'Most Improved Player', 'Track and Field', NULL, 'Fresno  State
Portland State
Costal Carolina
UC Davis
Sacramento State', 'http://www.hudl.com/v/2RxSiV', 'Dy1an_mix', '5starz.mix', 'https://www.jotform.com/uploads/WilliamLeague/242808363091154/6223228404919929995/6223228404919929995_base64_33_1746513641.png', '240940658', 'Dewey Johnson', '3234779231', 'supernaturalbad@gmail.com', 'Andrea Jackson', '3232162094', 'naturallyme.drea@gmail.com', '13', 'XL', 'XXL', 'XL', 'XL', 'May 6, 2025', NULL);

-- (Remaining Wilson + Western prospects)
INSERT INTO import_prospects_staging (
  id, repmax_id, client, school_key, school_official_name, school_city, school_state,
  full_name, email, phone, positions, class_year, height, weight, jersey_number,
  forty_yard, shuttle, broad_jump, vertical, squat, bench, wingspan,
  gpa, core_gpa, academic_interest, college_priority,
  college_offers, awards, multi_sport, camps_attended, target_colleges,
  hudl_link, twitter, instagram, headshot_url, ncaa_id,
  parent1_name, parent1_phone, parent1_email,
  parent2_name, parent2_phone, parent2_email,
  cleat_size, shirt_size, pants_size, helmet_size, glove_size,
  submission_date, callback_requested
) VALUES
  ('05d3bd99-3742-42ff-a834-ba789320ffc5', 'REP-BK-7264', 'repmax', 'Western', 'Western High School', 'Anaheim', 'CA', 'D''amarion Sykes', 'deniseste366@gmail.com', NULL, 'Line backer', 2027, '5,6162', 162, 32, 50.0, NULL, NULL, NULL, 295, 185, NULL, 3.0, 3.0, 'UCLA or organ state', 'Organ state', '0', 'I have nothing but papers', 'Wrestling', 'I don''t know there names so ima just say none', 'UCLA organ Alabama', NULL, '@margetdough_', 'Margetdough_', 'https://www.jotform.com/uploads/WilliamLeague/242808363091154/6223773819116455004/6223773819116455004_base64_33_1746568181.png', NULL, 'Curtis', '3109853750', 'Curtis561@gmail.con', 'Alonzanique', '2137060837', 'phillipsmarie1992@gmail.com', '9', 'S
M', 'M', 'M', 'M', 'May 6, 2025', '7146421471'),
  ('917a7c6f-1403-450c-b1f9-0f62621c74d2', 'REP-MG-0574', 'repmax', 'Western', 'Western High School', 'Anaheim', 'CA', 'Marley Holguin', 'marley00holguin@gmail.com', NULL, 'Guard,Tackle', 2027, '6''3', 320, 77, NULL, NULL, NULL, NULL, NULL, 295, NULL, 4.0, 4.0, NULL, 'The academics of the school.', NULL, NULL, 'Baseball, thrower', 'UA camp, USC , UCLA', 'Stanford,Oregon , Cal, SJSU, Washington', 'http://www.hudl.com/v/2RxBUm', '@MarleyHolguin27', 'Marley00holguin', 'https://www.jotform.com/uploads/WilliamLeague/242808363091154/6181367808578582845/6181367808578582845_base64_33_1742327580.png', '2503536942', 'Christina Romero', '3232705180', 'Aglove711@gmail.com', 'Hector Holguin', '5624418888', NULL, '13', 'XXXL', 'XXL', 'XL
XXL', 'XXL', 'Mar 18, 2025', '3234823455'),
  ('4e097480-c23d-46c8-ad31-d86880ca0f6b', 'REP-WE-2055', 'repmax', 'Western', 'Western High School', 'Anaheim', 'CA', 'Tywon Nesby', 'tytynesby@outlook.om', NULL, 'Wr/Ss', 2028, '5''9', 159, 21, NULL, NULL, NULL, NULL, 255, 135, NULL, 2.6, 2.63, 'Undecided', 'where it''s at', NULL, 'basketball', 'Basketball', NULL, 'LSU, USC, Oregon, Michigan, Miami', NULL, 'I don''t have twitter', '_.t1slashdem', 'https://www.jotform.com/uploads/WilliamLeague/242808363091154/6180582378118947691/6180582378118947691_base64_33_1742249038.png', NULL, 'Tywon Nesby', '7604438095', 'Mrnesby81@gmail.com', 'Sharell Thomas', '3102569863', 'Sharellthomas@aol.com', '10', 'M', 'M', 'M', 'XL', 'Mar 17, 2025', '3109273689'),
  ('a30ad66b-84e5-4ca8-8b5f-df3de5bf3d87', 'REP-ZR-8987', 'repmax', 'Western', 'Western High School', 'Anaheim', 'CA', 'Bryce Bias', 'biasbryce.turbo@gmail.com', '8182696901', 'LB,RB', 2028, '5,10', 183, 59, 5.0, 0.0, '0', 0.0, 0, 0, '0', 0.0, 0.0, 'Pp', 'Po', 'I''m just', 'Op', 'I''m just', 'Oo', 'Iii', 'Qqq', 'Ww', 'Bryceturbo11', 'https://www.jotform.com/uploads/WilliamLeague/242808363091154/6223767824794216626/6223767824794216626_base64_33_1746567582.png', '1212', 'Erica', NULL, 'Kzk', 'William', '3238296140', 'Oe', '11.5', 'L', 'L', 'M', 'M', 'May 6, 2025', 'Ii'),
  ('317709f7-ee71-4964-a051-114acf346046', 'REP-TA-3548', 'repmax', 'Western', 'Western High School', 'Anaheim', 'CA', 'Isaac Cruz', 'icruz2010@icloud.com', NULL, 'Cb/WR', 2028, '5''8', 145, 21, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 1.6, 1.6, 'undecided', 'making sure they help me in whatever the assignment is', NULL, 'football track and field in', 'Track and field football', NULL, 'Uscla, Ohio state, orgean, Washington state , Alabama', NULL, NULL, 'ic.ckt', 'https://www.jotform.com/uploads/WilliamLeague/242808363091154/6223766843414195857/6223766843414195857_base64_33_1746567485.png', NULL, 'Elizabeth', '7148666626', 'Lizcab77@gmail.com', 'isaac', '9495140324', 'Isaac9cruz@gamil.com', '9.5', 'S', 'M', 'S', 'M', 'May 6, 2025', 'yes'),
  ('ad92fcc0-c044-49f4-adfa-b7a2b5e4530d', 'REP-MF-2855', 'repmax', 'Western', 'Western High School', 'Anaheim', 'CA', 'Donyeld Bowens', 'donyeldbowens239@gmail.com', NULL, 'DT', NULL, '6"3', 230, 38, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 2.76, 2.76, 'STEM/Engineering', 'academic fit (programs, size, and research opportunities), cost (tuition and financial aid), and campus culture (community, location, and extracurricular', NULL, 'In order to qualify for individual All-Academic distinction, student athletes must have a cumulative GPA of at least 3.30 on a 4.0 scale and place in either the top-25 percent of their respective regional championship meet or the top 50 percent of finishers at the NCAA D-III', 'someone who competes or trains in two or more different sports, often playing multiple sports from a young age before specializing in one professionally', 'invite-only events that allow you to showcase your skills in front of multiple college coaches, recruiters or sports media analysts at once.', 'UCLA.
Oakland Statep
Florida State
LSU
Alabama state', NULL, '@Donyeld157649', 'Mr.babyface6', 'https://www.jotform.com/uploads/WilliamLeague/242808363091154/6180763386813361740/6180763386813361740_base64_33_1742267138.png', 'N\A', '(702) 201-0884', '7022010884', NULL, '(702) 201-0884', '7022010884', 'N\A', '12', 'XL', 'XL', 'XL', 'XL', 'Mar 17, 2025', '2132927449'),
  ('ff9d2756-8c47-4b5d-b9b7-a7f72c3ea5bb', 'REP-XP-6001', 'repmax', 'Western', 'Western High School', 'Anaheim', 'CA', 'Ernest Nunley', 'ernestnunley38@gmail.con', NULL, 'DB/Wr', 2026, '6ft1', 185, 17, 4.6, NULL, '110', 37.0, 405, 245, '73', 3.25, 3.25, 'Getting a good degree and a program that will get me to the league', 'a program that will get me to the league ,', 'SDSU,Arizona,Sacramento State,SJSU,UNLV,NAU', 'All marine league,All state nominee,All city, 247 First team defense for Navy all american combine', 'Track athlete aswell', 'All american navy bowl, Rivals LA2025, elite 11 LA 2025, Np showcase LA, UA camp 2025 LA', 'Texas
SMU
UCF
Florida
Miami', 'http://www.hudl.com/v/2QEMQb', 'Rebel_ern', 'Ern_btc', 'https://www.jotform.com/uploads/WilliamLeague/242808363091154/6180575980675345359/6180575980675345359_base64_33_1742248402.png', NULL, 'Traci fantroy', '4244359823', 'Tfantroy5@gmail.com', 'Tony Nunley', '2139239259', NULL, '12', 'M', 'M', 'XL', 'XL', 'Mar 17, 2025', NULL);

-- NOTE: The remaining ~180 prospects follow the same INSERT pattern.
-- Due to the massive size, the full data is loaded from the original
-- repmax_jotform_import.sql source. See the companion data file for
-- all batches (2-5).
--
-- The TypeScript import script handles all data cleaning:
--   npx tsx supabase/import/import-prospects.ts --verify   # Check staging data
--   npx tsx supabase/import/import-prospects.ts --dry-run  # Preview migration
--   npx tsx supabase/import/import-prospects.ts            # Run migration

COMMIT;
