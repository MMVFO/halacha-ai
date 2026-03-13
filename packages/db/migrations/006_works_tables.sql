-- Migration 006: Dedicated works and work_categories tables
-- Provides structured metadata for the library browser, autocomplete, and category navigation.

-- Work categories (hierarchical)
CREATE TABLE IF NOT EXISTS work_categories (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  name_he TEXT,
  parent_id INT REFERENCES work_categories(id),
  sort_order INT DEFAULT 0,
  icon TEXT
);

-- Seed top-level categories
INSERT INTO work_categories (name, name_he, sort_order, icon) VALUES
  ('Tanakh',             'תנ"ך',          1,  'scroll'),
  ('Mishnah',            'משנה',           2,  'book'),
  ('Talmud Bavli',       'תלמוד בבלי',    3,  'books'),
  ('Talmud Yerushalmi',  'תלמוד ירושלמי', 4,  'books'),
  ('Midrash',            'מדרש',           5,  'feather'),
  ('Halakhah',           'הלכה',           6,  'scale'),
  ('Musar',              'מוסר',           7,  'heart'),
  ('Kabbalah',           'קבלה',           8,  'sparkles'),
  ('Liturgy',            'תפילה',          9,  'music'),
  ('Philosophy',         'פילוסופיה',     10,  'lightbulb'),
  ('Responsa',           'שו"ת',          11,  'mail'),
  ('Chasidut',           'חסידות',        12,  'flame'),
  ('Modern',             'מודרני',        13,  'globe')
ON CONFLICT DO NOTHING;

-- Works table
CREATE TABLE IF NOT EXISTS works (
  id SERIAL PRIMARY KEY,
  slug TEXT UNIQUE,
  work_name TEXT NOT NULL,
  title_he TEXT,
  title_en TEXT,
  category TEXT,
  subcategory TEXT,
  language TEXT,
  community TEXT,
  corpus_tier TEXT,
  author TEXT,
  era TEXT,
  structure TEXT,
  chunk_count INT DEFAULT 0,
  has_embeddings BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_works_slug ON works (slug);
CREATE INDEX idx_works_category ON works (category);
CREATE INDEX idx_works_work_name ON works (work_name);

-- Populate works from existing chunks data
INSERT INTO works (work_name, language, community, corpus_tier, author, era, chunk_count)
SELECT
  work,
  language,
  community,
  corpus_tier,
  author,
  era,
  COUNT(*)
FROM halacha_chunks
GROUP BY work, language, community, corpus_tier, author, era
ON CONFLICT DO NOTHING;

-- Generate slugs from work_name (lowercase, replace spaces/special chars with hyphens)
UPDATE works
SET slug = lower(regexp_replace(work_name, '[^a-zA-Z0-9]+', '-', 'g'))
WHERE slug IS NULL;

-- Handle duplicate slugs by appending id
UPDATE works w
SET slug = w.slug || '-' || w.id
WHERE EXISTS (
  SELECT 1 FROM works w2
  WHERE w2.slug = w.slug AND w2.id < w.id
);

-- Set has_embeddings flag
UPDATE works w
SET has_embeddings = EXISTS (
  SELECT 1 FROM halacha_chunks c
  WHERE c.work = w.work_name AND c.embedding IS NOT NULL
  LIMIT 1
);

-- Auto-categorize known works based on work_name patterns
UPDATE works SET category = 'Tanakh' WHERE work_name ILIKE ANY(ARRAY[
  'Genesis%', 'Exodus%', 'Leviticus%', 'Numbers%', 'Deuteronomy%',
  'Joshua%', 'Judges%', 'Samuel%', 'Kings%', 'Isaiah%', 'Jeremiah%', 'Ezekiel%',
  'Hosea%', 'Joel%', 'Amos%', 'Obadiah%', 'Jonah%', 'Micah%', 'Nahum%',
  'Habakkuk%', 'Zephaniah%', 'Haggai%', 'Zechariah%', 'Malachi%',
  'Psalms%', 'Proverbs%', 'Job%', 'Song of Songs%', 'Ruth%', 'Lamentations%',
  'Ecclesiastes%', 'Esther%', 'Daniel%', 'Ezra%', 'Nehemiah%', 'Chronicles%',
  'Torah%', 'Nevi%', 'Ketuvim%', 'Tanakh%'
]);

UPDATE works SET category = 'Mishnah' WHERE work_name ILIKE 'Mishnah%' OR work_name ILIKE 'Pirkei Avot%';

UPDATE works SET category = 'Talmud Bavli' WHERE work_name ILIKE ANY(ARRAY[
  'Talmud%', 'Berakhot%', 'Shabbat%', 'Eruvin%', 'Pesachim%', 'Yoma%',
  'Sukkah%', 'Beitzah%', 'Megillah%', 'Taanit%', 'Chagigah%',
  'Yevamot%', 'Ketubot%', 'Nedarim%', 'Nazir%', 'Sotah%', 'Gittin%', 'Kiddushin%',
  'Bava Kamma%', 'Bava Metzia%', 'Bava Batra%', 'Sanhedrin%', 'Makkot%',
  'Shevuot%', 'Avodah Zarah%', 'Horayot%', 'Zevachim%', 'Menachot%',
  'Chullin%', 'Bekhorot%', 'Arakhin%', 'Temurah%', 'Keritot%', 'Meilah%',
  'Tamid%', 'Middot%', 'Kinnim%', 'Niddah%'
]) AND category IS NULL;

UPDATE works SET category = 'Halakhah' WHERE work_name ILIKE ANY(ARRAY[
  'Shulchan Arukh%', 'Shulhan Aruch%', 'Mishneh Torah%', 'Rambam%',
  'Tur%', 'Aruch HaShulchan%', 'Kitzur%', 'Ben Ish Chai%'
]) AND category IS NULL;

UPDATE works SET category = 'Midrash' WHERE work_name ILIKE ANY(ARRAY[
  'Midrash%', 'Bereishit Rabbah%', 'Shemot Rabbah%', 'Vayikra Rabbah%',
  'Bamidbar Rabbah%', 'Devarim Rabbah%', 'Tanchuma%', 'Mechilta%',
  'Sifra%', 'Sifre%', 'Yalkut%'
]) AND category IS NULL;

UPDATE works SET category = 'Kabbalah' WHERE work_name ILIKE ANY(ARRAY[
  'Zohar%', 'Sefer Yetzirah%', 'Tanya%', 'Etz Chaim%', 'Tikkunei%'
]) AND category IS NULL;

UPDATE works SET category = 'Musar' WHERE work_name ILIKE ANY(ARRAY[
  'Mesillat Yesharim%', 'Orchot Tzaddikim%', 'Chovot HaLevavot%',
  'Sha%arei Teshuvah%', 'Pele Yoetz%'
]) AND category IS NULL;

UPDATE works SET category = 'Philosophy' WHERE work_name ILIKE ANY(ARRAY[
  'Moreh Nevuchim%', 'Guide%Perplexed%', 'Kuzari%', 'Emunot%'
]) AND category IS NULL;

UPDATE works SET category = 'Chasidut' WHERE work_name ILIKE ANY(ARRAY[
  'Likutey Moharan%', 'Kedushat Levi%', 'Noam Elimelech%',
  'Sfat Emet%', 'Mei HaShiloach%', 'Toldot%'
]) AND category IS NULL;

UPDATE works SET category = 'Liturgy' WHERE work_name ILIKE ANY(ARRAY[
  'Siddur%', 'Machzor%', 'Haggadah%', 'Selichot%'
]) AND category IS NULL;

-- Default uncategorized works
UPDATE works SET category = 'Other' WHERE category IS NULL;
