-- Expand community system to be more granular
-- Drop the restrictive CHECK constraint and replace with a broader one

ALTER TABLE halacha_chunks DROP CONSTRAINT IF EXISTS halacha_chunks_community_check;
ALTER TABLE halacha_chunks ADD CONSTRAINT halacha_chunks_community_check
  CHECK (community IN (
    -- General / cross-community
    'General',
    -- Ashkenazi sub-communities
    'Ashkenazi', 'Lithuanian', 'German', 'Polish', 'Hungarian',
    -- Chassidic communities
    'Chabad', 'Breslov', 'Satmar', 'Belz', 'Ger', 'Vizhnitz', 'Chassidic',
    -- Sephardi sub-communities
    'Sephardi', 'Syrian', 'Moroccan', 'Iraqi', 'Persian', 'Turkish', 'Tunisian', 'Algerian',
    -- Mizrachi / Edot HaMizrach
    'Mizrachi', 'Yemenite', 'Bukharan', 'Indian', 'Kurdish',
    -- Land-of-Israel communities
    'Jerusalem', 'Old Yishuv',
    -- Ethiopian
    'Ethiopian',
    -- Historical / academic
    'Qumran', 'Karaite', 'Italian', 'Romaniote'
  ));

-- Create a community_groups reference table for hierarchy
CREATE TABLE IF NOT EXISTS community_groups (
  community TEXT PRIMARY KEY,
  parent_group TEXT,
  display_name TEXT NOT NULL,
  region TEXT
);

INSERT INTO community_groups (community, parent_group, display_name, region) VALUES
  ('General', NULL, 'General / Cross-Community', NULL),
  -- Ashkenazi
  ('Ashkenazi', NULL, 'Ashkenazi (General)', 'Europe'),
  ('Lithuanian', 'Ashkenazi', 'Lithuanian (Litvish)', 'Eastern Europe'),
  ('German', 'Ashkenazi', 'German (Yekke)', 'Western Europe'),
  ('Polish', 'Ashkenazi', 'Polish', 'Eastern Europe'),
  ('Hungarian', 'Ashkenazi', 'Hungarian', 'Central Europe'),
  -- Chassidic
  ('Chassidic', 'Ashkenazi', 'Chassidic (General)', 'Eastern Europe'),
  ('Chabad', 'Chassidic', 'Chabad-Lubavitch', 'Eastern Europe'),
  ('Breslov', 'Chassidic', 'Breslov', 'Eastern Europe'),
  ('Satmar', 'Chassidic', 'Satmar', 'Hungary'),
  ('Belz', 'Chassidic', 'Belz', 'Galicia'),
  ('Ger', 'Chassidic', 'Ger', 'Poland'),
  ('Vizhnitz', 'Chassidic', 'Vizhnitz', 'Romania'),
  -- Sephardi
  ('Sephardi', NULL, 'Sephardi (General)', 'Mediterranean'),
  ('Syrian', 'Sephardi', 'Syrian (Halabi/Shami)', 'Middle East'),
  ('Moroccan', 'Sephardi', 'Moroccan', 'North Africa'),
  ('Iraqi', 'Sephardi', 'Iraqi (Bavli)', 'Middle East'),
  ('Persian', 'Sephardi', 'Persian (Iranian)', 'Middle East'),
  ('Turkish', 'Sephardi', 'Turkish', 'Turkey'),
  ('Tunisian', 'Sephardi', 'Tunisian', 'North Africa'),
  ('Algerian', 'Sephardi', 'Algerian', 'North Africa'),
  -- Mizrachi
  ('Mizrachi', NULL, 'Mizrachi (General)', 'Middle East'),
  ('Yemenite', 'Mizrachi', 'Yemenite (Teimani)', 'Yemen'),
  ('Bukharan', 'Mizrachi', 'Bukharan', 'Central Asia'),
  ('Indian', 'Mizrachi', 'Indian (Bene Israel/Cochin)', 'India'),
  ('Kurdish', 'Mizrachi', 'Kurdish', 'Kurdistan'),
  -- Land-of-Israel
  ('Jerusalem', NULL, 'Jerusalem Style', 'Israel'),
  ('Old Yishuv', 'Jerusalem', 'Old Yishuv', 'Israel'),
  -- Other
  ('Ethiopian', NULL, 'Ethiopian (Beta Israel)', 'Ethiopia'),
  ('Italian', NULL, 'Italian (Italki)', 'Italy'),
  ('Romaniote', NULL, 'Romaniote (Greek)', 'Greece'),
  -- Historical
  ('Qumran', NULL, 'Qumran (Dead Sea Sect)', 'Ancient Israel'),
  ('Karaite', NULL, 'Karaite', 'Various')
ON CONFLICT (community) DO NOTHING;
