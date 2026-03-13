-- Enable trigram similarity for fuzzy text matching
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- Synonym/alias lookup table for Hebrew names and terms
CREATE TABLE IF NOT EXISTS hebrew_synonyms (
  id SERIAL PRIMARY KEY,
  canonical TEXT NOT NULL,
  alias TEXT NOT NULL,
  category TEXT DEFAULT 'author'
    CHECK (category IN ('author','work','term','concept')),
  UNIQUE(canonical, alias)
);

CREATE INDEX idx_synonyms_alias ON hebrew_synonyms USING btree (lower(alias));
CREATE INDEX idx_synonyms_canonical ON hebrew_synonyms USING btree (lower(canonical));

-- Trigram indexes on work and author for fuzzy library search
CREATE INDEX idx_chunks_work_trgm ON halacha_chunks USING gin (work gin_trgm_ops);
CREATE INDEX idx_chunks_author_trgm ON halacha_chunks USING gin (author gin_trgm_ops);

-- Seed synonym data
INSERT INTO hebrew_synonyms (canonical, alias, category) VALUES
  -- Authors
  ('Rambam', 'Maimonides', 'author'),
  ('Rambam', 'Moses ben Maimon', 'author'),
  ('Rambam', 'Moshe ben Maimon', 'author'),
  ('Rashi', 'Rabbi Shlomo Yitzchaki', 'author'),
  ('Rashi', 'Rabbi Shelomo Yitzhaki', 'author'),
  ('Rashi', 'Shlomo Yitzchaki', 'author'),
  ('Ramban', 'Nachmanides', 'author'),
  ('Ramban', 'Nahmanides', 'author'),
  ('Ramban', 'Moses ben Nachman', 'author'),
  ('Ramban', 'Moshe ben Nachman', 'author'),
  ('Rif', 'Isaac Alfasi', 'author'),
  ('Rif', 'Yitzchak Alfasi', 'author'),
  ('Rosh', 'Asher ben Yechiel', 'author'),
  ('Rosh', 'Rabbeinu Asher', 'author'),
  ('Tur', 'Yaakov ben Asher', 'author'),
  ('Tur', 'Jacob ben Asher', 'author'),
  ('Mechaber', 'Yosef Karo', 'author'),
  ('Mechaber', 'Joseph Caro', 'author'),
  ('Mechaber', 'Yosef Caro', 'author'),
  ('Rema', 'Moshe Isserles', 'author'),
  ('Rema', 'Moses Isserles', 'author'),
  ('Chofetz Chaim', 'Yisrael Meir Kagan', 'author'),
  ('Chofetz Chaim', 'Israel Meir Kagan', 'author'),
  ('Ben Ish Chai', 'Yosef Chaim', 'author'),
  ('Chazon Ish', 'Avraham Yeshaya Karelitz', 'author'),
  ('Vilna Gaon', 'Eliyahu ben Shlomo Zalman', 'author'),
  ('Vilna Gaon', 'GRA', 'author'),
  ('Baal HaTanya', 'Schneur Zalman of Liadi', 'author'),
  ('Baal HaTanya', 'Alter Rebbe', 'author'),
  -- Works
  ('Shulchan Arukh', 'Shulhan Aruch', 'work'),
  ('Shulchan Arukh', 'Shulchan Aruch', 'work'),
  ('Shulchan Arukh', 'Shulhan Arukh', 'work'),
  ('Shulchan Arukh', 'Code of Jewish Law', 'work'),
  ('Mishneh Torah', 'Yad HaChazakah', 'work'),
  ('Mishneh Torah', 'Yad Hachazaka', 'work'),
  ('Mishnah Berurah', 'Mishna Berura', 'work'),
  ('Mishnah Berurah', 'Mishnah Berura', 'work'),
  ('Arukh HaShulchan', 'Aruch HaShulchan', 'work'),
  ('Arukh HaShulchan', 'Aruch Hashulchan', 'work'),
  ('Kitzur Shulchan Arukh', 'Kitzur Shulchan Aruch', 'work'),
  -- Terms
  ('Chanukah', 'Hanukkah', 'term'),
  ('Chanukah', 'Hanukah', 'term'),
  ('Chanukah', 'Khanukah', 'term'),
  ('Shabbat', 'Shabbos', 'term'),
  ('Shabbat', 'Sabbath', 'term'),
  ('tzitzit', 'tsitsit', 'term'),
  ('tzitzit', 'zizith', 'term'),
  ('tefillin', 'tfillin', 'term'),
  ('tefillin', 'phylacteries', 'term'),
  ('sukkot', 'sukkos', 'term'),
  ('sukkot', 'succot', 'term'),
  ('brit milah', 'bris milah', 'term'),
  ('brit milah', 'circumcision', 'term'),
  ('mezuzah', 'mezuza', 'term'),
  ('kashrut', 'kashrus', 'term'),
  ('kashrut', 'kosher laws', 'term'),
  ('teshuvah', 'teshuva', 'term'),
  ('teshuvah', 'repentance', 'term')
ON CONFLICT (canonical, alias) DO NOTHING;
