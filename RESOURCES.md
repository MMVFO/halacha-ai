# Digital Halakhic Text Resources for RAG Ingestion

## Comprehensive Inventory of Publicly Available Sources

*Compiled: March 2026*

---

## Table of Contents

1. [Tier 1: Primary Open-Access Platforms (Programmatic Access)](#tier-1-primary-open-access-platforms)
2. [Tier 2: Free Digital Libraries (Manual/Scrape Access)](#tier-2-free-digital-libraries)
3. [Tier 3: Commercial/Subscription Databases](#tier-3-commercialsubscription-databases)
4. [Tier 4: Specialized & Supplementary Sources](#tier-4-specialized--supplementary-sources)
5. [Tier 5: Second Temple & Non-Canonical Sources](#tier-5-second-temple--non-canonical-sources)
6. [Tier 6: AI/NLP Tools & Infrastructure](#tier-6-ainlp-tools--infrastructure)
7. [Content Coverage Matrix](#content-coverage-matrix)
8. [Recommended Ingestion Order](#recommended-ingestion-order)

---

## Tier 1: Primary Open-Access Platforms

### 1. Sefaria

| Field | Details |
|-------|---------|
| **URL** | https://www.sefaria.org / https://github.com/Sefaria/Sefaria-Export |
| **Description** | The single most important source. Open-source living library of Jewish texts with structured data, interlinked references, and translations. Contains 3,000+ years of Jewish texts. |
| **API** | Full REST API at https://developers.sefaria.org -- no API key required for read access. Also offers an official MCP server (https://github.com/Sefaria/sefaria-mcp) with 15+ tools. |
| **Data Export** | Complete database dump available via GitHub (Sefaria-Export repo). MongoDB dump also available. Texts organized by category with merged files. |
| **Format** | JSON (API), structured text files (export), MongoDB dump |
| **License** | Creative Commons (varies by text). Original Hebrew texts mostly public domain. William Davidson Talmud is CC-BY-NC. Sefaria-original content is CC-BY-SA or CC-BY-NC. Code is open source (AGPL). |
| **Languages** | Hebrew, Aramaic, English (primary); some French, German, Russian, Spanish, Portuguese translations |
| **Priority** | **CRITICAL** |

**Halakhic content available on Sefaria:**

- **Talmud Bavli**: Complete -- all 37 tractates with Steinsaltz English translation (William Davidson edition, CC-BY-NC), Rashi, Tosafot
- **Talmud Yerushalmi**: Significant coverage
- **Mishnah**: Complete with Bartenura, Rambam commentary
- **Mishneh Torah (Rambam)**: Complete Hebrew; partial English translations
- **Shulchan Arukh**: All 4 sections (Orach Chaim, Yoreh De'ah, Even HaEzer, Choshen Mishpat) with Rema
- **Mishnah Berurah**: Available with Beur Halacha and Sha'ar HaTziyun
- **Aruch HaShulchan**: Available (Choshen Mishpat section digitized by Sefaria)
- **Kitzur Shulchan Arukh**: Complete
- **Tur**: Available with Beit Yosef
- **Chayei Adam / Chochmat Adam**: Available
- **Rishonim on Talmud**: Rashba, Ritva, Ran, Meiri, Rosh, Nimukei Yosef
- **Responsa (Rishonim)**: Teshuvot HaRashba (3000+ decisions), Teshuvot HaRosh, Teshuvot HaRan, Teshuvot HaRivash, Teshuvot HaRambam
- **Midrash**: Midrash Rabbah (all), Tanchuma, Sifra, Sifrei, Mechilta
- **Tosefta**: Complete
- **Zohar**: Available
- **Modern Responsa**: Partial -- some 20th century responsa including R' Yitzchak Nissim

---

### 2. Sefaria MCP Server (Official)

| Field | Details |
|-------|---------|
| **URL** | https://github.com/Sefaria/sefaria-mcp |
| **Description** | Official FastMCP server for connecting LLMs to Sefaria's complete library via Model Context Protocol. |
| **API** | MCP protocol -- 15+ tools across Primary, Core, Support, Structure, and Manuscript categories |
| **Format** | MCP protocol (JSON responses) |
| **License** | Open source |
| **Languages** | Hebrew, Aramaic, English |
| **Priority** | **CRITICAL** -- Direct LLM integration path |

---

### 3. Otzaria + MCP-Otzaria-Server

| Field | Details |
|-------|---------|
| **URL** | https://github.com/Sivan22/otzaria / https://github.com/Sivan22/mcp-otzaria-server |
| **Description** | Open-source Flutter app bringing the Jewish library to every device. Includes an MCP server for LLM access with full-text search across the entire library. Data sourced from Sefaria and Dicta. |
| **API** | MCP protocol for LLM integration; full-text search with Boolean operators, phrase search, wildcards |
| **Format** | Structured text files, MCP protocol |
| **License** | Code: Unlicense (public domain). Texts: various open licenses (see Sefaria licensing) |
| **Languages** | Hebrew, English |
| **Priority** | **HIGH** -- Provides pre-built RAG-ready search infrastructure |

---

### 4. Mechon Mamre

| Field | Details |
|-------|---------|
| **URL** | https://mechon-mamre.org / https://mechon-mamre.org/downloads.htm |
| **Description** | Small group of observant scholars in Israel maintaining searchable classic Jewish texts. Known for the most accurate Mishneh Torah edition (based on Yemenite manuscripts). |
| **API** | No API. Downloadable files available at /downloads.htm |
| **Format** | HTML pages, downloadable text files (MTR software format) |
| **License** | Free to use, copyrighted. Written permission needed to quote substantial parts. |
| **Languages** | Hebrew, Aramaic, English translations |
| **Priority** | **HIGH** |

**Content available:**
- Hebrew Bible (Tanakh) -- vocalized, carefully edited
- Mishneh Torah (Rambam) -- considered the most accurate digital edition (Yemenite manuscript base)
- Mishnah
- Talmud Bavli and Yerushalmi
- Hebrew-English parallel Bible

---

## Tier 2: Free Digital Libraries

### 5. HebrewBooks.org

| Field | Details |
|-------|---------|
| **URL** | https://hebrewbooks.org |
| **Description** | Massive archive of 60,000-65,000+ out-of-print seforim/Hebrew books, operated by the Society for the Preservation of Hebrew Books. The single largest collection of scanned rabbinic literature. |
| **API** | No public API. Contact dev@hebrewbooks.org for development inquiries. GitHub repo exists for volunteers. |
| **Format** | PDF (scanned page images). Some texts have OCR-searchable layers. |
| **License** | Free access for viewing and downloading. Books are mostly out-of-print/public domain in practice, but individual copyright status varies. |
| **Languages** | Hebrew (primary), some Yiddish, Aramaic, Ladino |
| **Estimated Size** | 60,000-65,000+ volumes |
| **Priority** | **HIGH** -- but requires OCR pipeline for text extraction |

**Content includes (among others):**
- Thousands of responsa collections (Igrot Moshe, Yabia Omer, Tzitz Eliezer, Minchat Yitzchak, etc.)
- Complete Shas (Talmud) editions
- Rishonim and Acharonim commentaries
- Rare out-of-print halakhic works
- Rabbinic journals and periodicals

**Ingestion challenge:** PDF/image format requires OCR. Dicta's Hebrew OCR tools (see Tier 6) are specifically designed for rabbinic typefaces including Rashi script.

---

### 6. Al-Hatorah.org

| Field | Details |
|-------|---------|
| **URL** | https://alhatorah.org / https://library.alhatorah.org |
| **Description** | One-stop Tanakh study resource with 40+ commentaries. Especially strong in medieval commentaries. Core library includes Tanakh, Talmud, Mishneh Torah, and Tur-Shulchan Arukh with tens of commentaries each. |
| **API** | No API available (confirmed -- unlike Sefaria, does not offer data export) |
| **Format** | HTML (web-only) |
| **License** | Free access for reading. No explicit open license for data reuse. |
| **Languages** | Hebrew, Aramaic, English tools and interfaces |
| **Priority** | **MEDIUM** -- rich commentary content but no programmatic access |

**Notable content:**
- 40+ Tanakh commentaries including Rashi, Ibn Ezra, Chizkuni, Kli Yakar, Meshech Chochmah, Netziv
- Multiple Targumim
- Parallel Midrashim
- Customizable commentary display

---

### 7. Chabad.org Torah Texts

| Field | Details |
|-------|---------|
| **URL** | https://www.chabad.org/torah-texts / https://www.chabad.org/library |
| **Description** | Immersive learning platform with original Hebrew/Yiddish texts and side-by-side translations. Strong in Chabad-Lubavitch texts but also covers core halakhic works. |
| **API** | No public API |
| **Format** | HTML (web-only) |
| **License** | Free access for reading. Content is copyrighted by Chabad.org. |
| **Languages** | Hebrew, English, Yiddish |
| **Priority** | **MEDIUM** |

**Content includes:**
- Tanakh with Rashi
- Mishneh Torah (Rambam) -- complete with daily study program
- Shulchan Aruch HaRav (R' Shneur Zalman of Liadi)
- Kitzur Shulchan Aruch
- Tanya and Chassidic works
- Torah Ohr, Likkutei Torah

---

### 8. Halachipedia

| Field | Details |
|-------|---------|
| **URL** | https://www.halachipedia.com |
| **Description** | Wiki-style collection of Orthodox halacha articles covering holidays, blessings, prayer, and practical modern-day questions. Uses MediaWiki software. Broader scope of opinions than typical single-source halakha books. |
| **API** | MediaWiki API available (standard MW API endpoints) |
| **Format** | HTML/wikitext (MediaWiki). A dump is available on Internet Archive. |
| **License** | Content licensing unclear -- user-contributed wiki content. Likely fair use of source citations. |
| **Languages** | English (primary), with extensive Hebrew source citations |
| **Estimated Size** | ~500 pages, 10,000+ footnotes |
| **Priority** | **MEDIUM** -- useful as secondary synthesis/summary layer, not primary source |

---

### 9. Torat Emet

| Field | Details |
|-------|---------|
| **URL** | https://www.toratemetfreeware.com (download) |
| **Description** | Free downloadable program with a large library of classical Jewish texts. Freeware with hypertext cross-referencing. Also available online and as Android/Linux ports. |
| **API** | No API. Desktop software with local text files. |
| **Format** | Proprietary text format within the application; potentially extractable |
| **License** | Freeware (free to use, not open source) |
| **Languages** | Hebrew, Aramaic |
| **Priority** | **MEDIUM** -- large text corpus but extraction requires reverse engineering |

---

### 10. Hebrew Wikisource

| Field | Details |
|-------|---------|
| **URL** | https://he.wikisource.org |
| **Description** | Wikimedia project hosting public domain Hebrew texts. Includes WikiProject Jewish Texts and the Open Mishnah Project. |
| **API** | Standard MediaWiki/Wikimedia API |
| **Format** | Wikitext, HTML, API (JSON/XML) |
| **License** | CC-BY-SA (Creative Commons Attribution-ShareAlike) |
| **Languages** | Hebrew (primary) |
| **Priority** | **MEDIUM** -- partial coverage, community-edited |

**Content includes:**
- Partial Mishnah (100+ mishnayot with Vilna and Rambam editions, Bartenura commentary)
- Some Talmud Yerushalmi
- Hebrew Bible
- Some Midrashic texts
- Various rabbinic works

---

### 11. Internet Sacred Text Archive (sacred-texts.com)

| Field | Details |
|-------|---------|
| **URL** | https://sacred-texts.com/jud/index.htm |
| **Description** | Large archive of public domain religious and esoteric texts. Judaism section includes classic translations and scholarly works. |
| **API** | No API. Static HTML pages. |
| **Format** | HTML |
| **License** | Mostly public domain. Some site-specific content copyrighted. |
| **Languages** | English translations |
| **Priority** | **LOW** -- primarily English translations of older public domain editions |

**Content includes:**
- Legends of the Jews (Ginzberg)
- Rodkinson Talmud translation (outdated/partial)
- Various apocryphal texts (Jubilees, Enoch, etc.)
- Midrashic collections in translation

---

### 12. Open Siddur Project

| Field | Details |
|-------|---------|
| **URL** | https://opensiddur.org / https://github.com/opensiddur |
| **Description** | Collaborative platform for creating custom Jewish liturgical books. Source texts for siddurim, haggadot, and related liturgical works. |
| **API** | REST API (back-end database server) |
| **Format** | TEI XML (Text Encoding Initiative schema) |
| **License** | Code: LGPL. Content: CC-BY-SA 4.0 |
| **Languages** | Hebrew, English, various translation languages |
| **Priority** | **LOW** for halakhic RAG (liturgy-focused, not halakhic) |

---

## Tier 3: Commercial/Subscription Databases

### 13. Bar-Ilan Responsa Project (The Global Jewish Database)

| Field | Details |
|-------|---------|
| **URL** | https://www.responsa.co.il / https://www.biu.ac.il/en/about-bar-ilan/jewish-heritage/responsa-project |
| **Description** | The gold standard comprehensive database of Jewish legal literature. 200+ million words. The most complete digital collection of responsa literature in existence. |
| **API** | No public API. Web-based search interface for subscribers. Limited to 10 concurrent users. |
| **Format** | Proprietary web interface, searchable text |
| **License** | **PAID subscription required.** Individual USB/download: ~$1,290-$1,390. Institutional pricing varies. |
| **Languages** | Hebrew, Aramaic |
| **Priority** | **CRITICAL content, but BLOCKED by licensing** |

**Content includes:**
- Tanakh with all principal commentaries
- Talmud Bavli and Yerushalmi with commentaries
- Complete Midrash collections
- Zohar
- Rambam (Mishneh Torah)
- Shulchan Aruch with all commentaries
- **Massive Responsa collection (the largest digital collection)**
- Talmudic Encyclopedia
- 360,000+ hypertext cross-references
- Topical halakhic index

**Note:** This is the only source with comprehensive coverage of classical and modern responsa literature. No free alternative covers the same scope. Content cannot be legally extracted for RAG without a commercial license agreement.

---

### 14. Otzar HaChochma

| Field | Details |
|-------|---------|
| **URL** | https://www.otzar.org |
| **Description** | World's largest digital library of Judaica books -- 156,000+ volumes. Page-image based with search capability. |
| **API** | No public API. Authentication via IP-based system (EZ-Proxy for institutions). |
| **Format** | Page images (like HebrewBooks but with search overlay). Not raw text. |
| **License** | **PAID subscription required.** Personal and institutional licenses available. Terms explicitly prohibit public redistribution. |
| **Languages** | Hebrew (primary), Aramaic, Yiddish, Ladino |
| **Estimated Size** | 156,000+ volumes |
| **Priority** | **HIGH content value, but BLOCKED by licensing** |

**Note:** Terms of use explicitly state: "the database or any part thereof must not be featured in the public domain." Circumventing digital protections is prohibited. Cannot be used for RAG without explicit written permission.

---

## Tier 4: Specialized & Supplementary Sources

### 15. National Library of Israel (NLI) -- Ktiv Manuscripts

| Field | Details |
|-------|---------|
| **URL** | https://www.nli.org.il / https://ktiv.nli.org.il (Ktiv manuscripts portal) |
| **Description** | Ktiv is the largest digital collection of Hebrew manuscripts in existence -- 4.5 million images from 45,000 manuscripts. Includes prayer books, biblical texts, commentary, philosophy, and scientific writings. |
| **API** | NLI has catalog APIs. Ktiv manuscript images accessible via web portal (free registration via Friedberg Jewish Manuscript Society). |
| **Format** | High-resolution images of manuscripts. Catalog metadata available. |
| **License** | Free access for research. Image reuse terms vary by collection. |
| **Languages** | Hebrew, Aramaic, Yiddish, Ladino, Judeo-Arabic |
| **Priority** | **MEDIUM** -- primarily manuscript images, not parsed text. Valuable for manuscript variant research. |

---

### 16. Cambridge Genizah Collection

| Field | Details |
|-------|---------|
| **URL** | https://cudl.lib.cam.ac.uk/collections/genizah |
| **Description** | World's largest collection of Cairo Genizah fragments -- 193,000 manuscripts. 21,000+ fragments digitized and online. Hundreds added monthly. |
| **API** | Cambridge Digital Library has IIIF image API. No text transcription API. |
| **Format** | High-resolution manuscript images |
| **License** | Free access for research |
| **Languages** | Hebrew, Aramaic, Judeo-Arabic |
| **Priority** | **LOW** for RAG (manuscript images, not parsed text) |

---

### 17. STEP Bible (Tyndale House, Cambridge)

| Field | Details |
|-------|---------|
| **URL** | https://www.stepbible.org / https://github.com/STEPBible/STEPBible-Data |
| **Description** | Scripture Tools for Every Person. Focus on original language tools. Extensive tagged Hebrew text datasets based on the Leningrad Codex. |
| **API** | No formal API. Downloadable tab-separated data files on GitHub. |
| **Format** | TSV (tab-separated values) |
| **License** | CC-BY 4.0 (Creative Commons Attribution) |
| **Languages** | Hebrew, Greek, English (280 languages for Bible translations) |
| **Priority** | **LOW** for halakhic RAG (Bible-focused, not halakhic codes) |

**Relevant datasets:**
- TOTHT: Tyndale OT Hebrew Tagged text (Leningrad codex, full morphological and semantic tags)
- TBESH: Translators Brief lexicon of Extended Strongs for Hebrew (abridged BDB)

---

### 18. Judaic Classics Online (Jerusalem Council)

| Field | Details |
|-------|---------|
| **URL** | http://jerusalemcouncil.org/articles/reference/judaic-classics-online/ |
| **Description** | Free online access to classic Judaic literature in Hebrew and English. |
| **API** | No API |
| **Format** | HTML |
| **License** | Free access |
| **Languages** | Hebrew, English |
| **Priority** | **LOW** |

**Content includes:**
- All Midrash Halacha (Mechilta, Sifra, Sifrei)
- All Midrash Aggadah (Midrash Rabbah, Tanchuma)
- Full Tanakh

---

### 19. Responsa for Today

| Field | Details |
|-------|---------|
| **URL** | https://responsafortoday.com |
| **Description** | Modern responsa platform |
| **API** | Unknown |
| **Format** | Web-based |
| **License** | Free access |
| **Languages** | English, Hebrew |
| **Priority** | **LOW** |

---

### 20. CCAR Reform Responsa

| Field | Details |
|-------|---------|
| **URL** | https://www.ccarnet.org/rabbinic-voice/reform-responsa/ |
| **Description** | Complete collection of Reform movement responsa. Downloadable as ebooks. |
| **API** | No API |
| **Format** | Ebook (PDF/EPUB) |
| **License** | Published by CCAR Press. Copyright restrictions likely apply. |
| **Languages** | English |
| **Priority** | **LOW** (Reform responsa, supplementary to Orthodox halakhic system) |

---

### 21. Conservative (Masorti) Responsa

| Field | Details |
|-------|---------|
| **URL** | https://www.rabbinicalassembly.org (Rabbinical Assembly) / Schechter Institute website |
| **Description** | Six volumes of Conservative responsa from the Rabbinical Assembly. |
| **API** | No API |
| **Format** | Web/PDF |
| **License** | Varies |
| **Languages** | English, Hebrew |
| **Priority** | **LOW** |

---

## Tier 5: Second Temple & Non-Canonical Sources

### 22. Leon Levy Dead Sea Scrolls Digital Library

| Field | Details |
|-------|---------|
| **URL** | https://www.deadseascrolls.org.il |
| **Description** | Free online library of the Dead Sea Scrolls. High-resolution multi-spectral imaging of 930+ manuscripts comprising 25,000+ fragments. Partnership between Israel Antiquities Authority and Google. |
| **API** | No public API. Web browsing with search functionality. |
| **Format** | High-resolution images (multi-spectral). Metadata searchable. |
| **License** | Free access for viewing. Image reuse terms apply (IAA copyright). |
| **Languages** | Hebrew, Aramaic, Greek (original manuscripts) |
| **Priority** | **MEDIUM** for halakhic RAG -- contains proto-halakhic material (Temple Scroll, MMT, Damascus Document, Community Rule) |

---

### 23. Internet Sacred Text Archive -- Pseudepigrapha

| Field | Details |
|-------|---------|
| **URL** | https://sacred-texts.com/bib/jub/index.htm (Jubilees) / https://sacred-texts.com/bib/ |
| **Description** | Public domain translations of Second Temple literature. |
| **API** | No API |
| **Format** | HTML |
| **License** | Public domain (older translations) |
| **Languages** | English |
| **Priority** | **LOW** |

**Available texts:**
- Book of Jubilees (R.H. Charles translation)
- 1 Enoch / Book of Enoch
- Ben Sira / Ecclesiasticus
- 1-4 Maccabees
- Various other pseudepigrapha

---

### 24. Sefaria -- Second Temple Texts

| Field | Details |
|-------|---------|
| **URL** | https://www.sefaria.org/texts |
| **Description** | Sefaria also hosts some Second Temple period and apocryphal texts |
| **Format** | JSON via API |
| **License** | CC licenses |
| **Priority** | **MEDIUM** -- check Sefaria's current holdings for these texts |

---

## Tier 6: AI/NLP Tools & Infrastructure

### 25. Dicta -- Israel Center for Text Analysis

| Field | Details |
|-------|---------|
| **URL** | https://dicta.org.il |
| **Description** | Non-profit applying machine learning and NLP to Hebrew text analysis. Provides critical infrastructure tools for digitizing and processing rabbinic texts. |
| **API** | Web-based tools freely available. Some tools have API access. |
| **Format** | Various (tool outputs) |
| **License** | Free access to tools |
| **Languages** | Hebrew, Aramaic |
| **Priority** | **HIGH** (infrastructure, not content -- but critical for processing HebrewBooks PDFs) |

**Key tools for RAG pipeline:**
- **Hebrew OCR**: Specifically adapted for rabbinic typefaces including Rashi script. Can convert 19th-century cramped rabbinic printing into legible text.
- **Vocalization tool**: Neural network prediction of full vocalization (nikkud) for historical Hebrew texts
- **Abbreviation expander**: Predicts how abbreviations in manuscripts should be expanded
- **Scriptural Allusion Finder**: Identifies biblical quotations and allusions in any Hebrew text
- **Synopsis tool**: Automatic alignment of multiple recensions of a text
- **Advanced Talmud/Bible search**: Query texts regardless of orthographic or morphological variations
- **Dicta-LM 3.0**: Open-weight sovereign Hebrew LLM (on HuggingFace at dicta-il)

---

### 26. MCP-Sefaria-Server (Community)

| Field | Details |
|-------|---------|
| **URL** | https://github.com/Sivan22/mcp-sefaria-server |
| **Description** | Community-built MCP server for fetching and reading Jewish texts through Sefaria's API. |
| **Format** | MCP protocol |
| **License** | Open source |
| **Priority** | **HIGH** -- ready-made LLM integration |

---

## Content Coverage Matrix

This matrix shows which sources cover which halakhic texts:

| Text | Sefaria | Mechon Mamre | HebrewBooks | Bar-Ilan | Otzar | Al-Hatorah | Chabad |
|------|---------|-------------|-------------|----------|-------|------------|--------|
| **Shulchan Arukh (all 4)** | Yes | No | Yes (scans) | Yes | Yes | Yes | Partial |
| **Rema / Mapah** | Yes | No | Yes (scans) | Yes | Yes | No | No |
| **Mishneh Torah** | Yes | Yes (best ed.) | Yes (scans) | Yes | Yes | Yes | Yes |
| **Kesef Mishneh** | Yes | No | Yes (scans) | Yes | Yes | No | No |
| **Maggid Mishneh** | Yes | No | Yes (scans) | Yes | Yes | No | No |
| **Lechem Mishneh** | Partial | No | Yes (scans) | Yes | Yes | No | No |
| **Mishnah Berurah** | Yes | No | Yes (scans) | Yes | Yes | No | No |
| **Beur Halacha** | Yes | No | Yes (scans) | Yes | Yes | No | No |
| **Sha'ar HaTziyun** | Yes | No | Yes (scans) | Yes | Yes | No | No |
| **Aruch HaShulchan** | Partial | No | Yes (scans) | Yes | Yes | No | No |
| **Kitzur Shulchan Arukh** | Yes | No | Yes (scans) | Yes | Yes | No | Yes |
| **Tur** | Yes | No | Yes (scans) | Yes | Yes | Yes | No |
| **Beit Yosef** | Yes | No | Yes (scans) | Yes | Yes | No | No |
| **Bach** | Partial | No | Yes (scans) | Yes | Yes | No | No |
| **Chayei Adam** | Yes | No | Yes (scans) | Yes | Yes | No | No |
| **Chochmat Adam** | Yes | No | Yes (scans) | Yes | Yes | No | No |
| **Talmud Bavli** | Yes (full) | Yes | Yes (scans) | Yes | Yes | Partial | No |
| **Rashi on Talmud** | Yes | No | Yes (scans) | Yes | Yes | No | No |
| **Tosafot** | Yes | No | Yes (scans) | Yes | Yes | No | No |
| **Yerushalmi** | Partial | Yes | Yes (scans) | Yes | Yes | No | No |
| **Rashba on Talmud** | Yes | No | Yes (scans) | Yes | Yes | No | No |
| **Ritva** | Yes | No | Yes (scans) | Yes | Yes | No | No |
| **Ran** | Yes | No | Yes (scans) | Yes | Yes | No | No |
| **Meiri** | Partial | No | Yes (scans) | Yes | Yes | No | No |
| **Teshuvot HaRashba** | Yes | No | Yes (scans) | Yes | Yes | No | No |
| **Teshuvot HaRosh** | Yes | No | Yes (scans) | Yes | Yes | No | No |
| **Igrot Moshe** | Partial | No | Yes (scans) | Yes | Yes | No | No |
| **Yabia Omer** | No | No | Yes (scans) | Yes | Yes | No | No |
| **Tzitz Eliezer** | No | No | Yes (scans) | Yes | Yes | No | No |
| **Minchat Yitzchak** | No | No | Yes (scans) | Yes | Yes | No | No |
| **Midrash Rabbah** | Yes | No | Yes (scans) | Yes | Yes | No | No |
| **Tanchuma** | Yes | No | Yes (scans) | Yes | Yes | No | No |
| **Sifra** | Yes | No | Yes (scans) | Yes | Yes | No | No |
| **Sifrei** | Yes | No | Yes (scans) | Yes | Yes | No | No |
| **Mechilta** | Yes | No | Yes (scans) | Yes | Yes | No | No |
| **Shulchan Aruch HaRav** | Partial | No | Yes (scans) | Yes | Yes | No | Yes |

**Legend:** "Yes" = structured digital text; "Yes (scans)" = PDF page images requiring OCR; "Partial" = incomplete coverage; "No" = not available

---

## Recommended Ingestion Order

### Phase 1: Foundation (Immediate)
1. **Sefaria Export** -- Clone the complete Sefaria-Export repository. This gives you structured JSON for the majority of primary halakhic texts, Talmud, Midrash, and commentaries. Estimated: 500MB-1GB+ of structured text.
2. **Sefaria API** -- Set up API access for real-time queries and incremental updates.
3. **Sefaria MCP / Otzaria MCP** -- Configure MCP servers for direct LLM integration.

### Phase 2: Gap-Filling (Short-term)
4. **Mechon Mamre** -- Download their text files for the highest-quality Mishneh Torah text and vocalized Tanakh.
5. **Halachipedia dump** -- Ingest the MediaWiki dump from Internet Archive for practical halakha summaries.
6. **Hebrew Wikisource** -- API-scrape available Mishnah and other texts under CC-BY-SA.

### Phase 3: Responsa Expansion (Medium-term)
7. **HebrewBooks.org** -- Begin OCR pipeline using Dicta tools for priority responsa collections:
   - Igrot Moshe (volumes 1-8)
   - Yabia Omer (all volumes)
   - Tzitz Eliezer
   - Minchat Yitzchak
   - Shevet HaLevi
   - Additional Rishonim responsa not in Sefaria
8. **Dicta OCR tools** -- Deploy for processing HebrewBooks PDFs at scale.

### Phase 4: Commercial Sources (Requires Budget)
9. **Bar-Ilan Responsa Project** -- Investigate institutional/commercial licensing for API access or data licensing. This is the single most important gap in the free/open ecosystem.
10. **Otzar HaChochma** -- Explore institutional access for supplementary texts.

### Phase 5: Supplementary (Long-term)
11. **Al-Hatorah** -- Web scraping (check terms of service) for commentary content.
12. **Chabad.org** -- Web scraping for Shulchan Aruch HaRav and Chassidic works.
13. **Dead Sea Scrolls** -- Image-to-text pipeline for proto-halakhic material.
14. **Sacred-texts.com** -- Scrape public domain pseudepigrapha translations.

---

## Key Gaps & Challenges

### Critical Content Gaps (Not Available in Open Access)
1. **Modern Acharonim Responsa**: Igrot Moshe, Yabia Omer, Tzitz Eliezer, Minchat Yitzchak -- available only as scanned PDFs on HebrewBooks (requires OCR) or in commercial databases.
2. **Complete Rishonim commentary set**: Some Rishonim on Talmud (certain Meiri tractates, some Ritva) may only be in commercial databases or HebrewBooks scans.
3. **Contemporary poskim**: Living rabbis' teshuvot are rarely digitized openly.
4. **Talmudic Encyclopedia**: Only in Bar-Ilan's commercial database.

### Technical Challenges
1. **Hebrew/Aramaic OCR**: Rabbinic texts use specialized typefaces (Rashi script, various block fonts). Dicta's OCR is the best available tool.
2. **Abbreviation expansion**: Rabbinic texts are dense with abbreviations. Dicta offers tools for this.
3. **Text normalization**: Different editions have orthographic variations. Dicta's search tools handle this.
4. **Cross-referencing**: Halakhic texts are deeply interlinked. Sefaria's link database is the most comprehensive mapping.
5. **Multi-script handling**: Texts mix Hebrew, Aramaic, and occasionally Arabic/Ladino.

### Legal Considerations
- **Public domain texts** (pre-1928 publications, or texts whose copyright has expired in relevant jurisdictions) can generally be freely digitized.
- **Sefaria's CC-licensed content** can be used per the specific CC license terms (most require attribution, some prohibit commercial use).
- **HebrewBooks** hosts out-of-print books but individual copyright status varies.
- **Bar-Ilan and Otzar HaChochma** content is strictly proprietary. Do not attempt to scrape or extract.
- **Modern responsa** (20th-21st century) are generally under copyright. Consult a legal advisor for fair use in a RAG context.

---

## Summary Statistics

| Category | Open/Free Sources | Paid Sources | Total Estimated Texts |
|----------|------------------|-------------|----------------------|
| Primary Halakhic Codes | 4-5 sources | 2 sources | ~20 major works |
| Talmud & Commentaries | 3-4 sources | 2 sources | 37+ tractates + dozens of commentaries |
| Responsa (Classical) | 2-3 sources | 2 sources | Thousands of teshuvot |
| Responsa (Modern) | 1-2 sources (scans) | 2 sources | Tens of thousands |
| Midrash | 3-4 sources | 2 sources | All major collections |
| Second Temple | 3-4 sources | 0 | ~15-20 major works |
| **Total unique volumes** | **Sefaria: ~3,000+ works** | **Bar-Ilan: 200M+ words; Otzar: 156,000+ volumes** | -- |

---

## Source Links Summary

| # | Source | URL | Access Type |
|---|--------|-----|-------------|
| 1 | Sefaria | https://www.sefaria.org | Free / Open API |
| 2 | Sefaria Export | https://github.com/Sefaria/Sefaria-Export | Free / GitHub |
| 3 | Sefaria MCP | https://github.com/Sefaria/sefaria-mcp | Free / Open Source |
| 4 | Sefaria Dev Docs | https://developers.sefaria.org | Free |
| 5 | Otzaria | https://github.com/Sivan22/otzaria | Free / Open Source |
| 6 | MCP-Otzaria | https://github.com/Sivan22/mcp-otzaria-server | Free / Open Source |
| 7 | Mechon Mamre | https://mechon-mamre.org | Free / Downloads |
| 8 | HebrewBooks.org | https://hebrewbooks.org | Free / PDF |
| 9 | Al-Hatorah | https://alhatorah.org | Free / Web Only |
| 10 | Chabad.org | https://www.chabad.org/torah-texts | Free / Web Only |
| 11 | Halachipedia | https://www.halachipedia.com | Free / Wiki |
| 12 | Torat Emet | https://www.toratemetfreeware.com | Free / Download |
| 13 | Hebrew Wikisource | https://he.wikisource.org | Free / CC-BY-SA |
| 14 | Open Siddur | https://opensiddur.org | Free / CC-BY-SA |
| 15 | Sacred Texts | https://sacred-texts.com/jud/ | Free / Public Domain |
| 16 | Bar-Ilan Responsa | https://www.responsa.co.il | **Paid** (~$1,300+) |
| 17 | Otzar HaChochma | https://www.otzar.org | **Paid** (subscription) |
| 18 | NLI / Ktiv | https://www.nli.org.il | Free / Registration |
| 19 | Cambridge Genizah | https://cudl.lib.cam.ac.uk/collections/genizah | Free |
| 20 | Dead Sea Scrolls | https://www.deadseascrolls.org.il | Free |
| 21 | STEP Bible Data | https://github.com/STEPBible/STEPBible-Data | Free / CC-BY 4.0 |
| 22 | Dicta (NLP tools) | https://dicta.org.il | Free |
| 23 | Dicta LLM (HuggingFace) | https://huggingface.co/dicta-il | Free / Open Weights |
| 24 | CCAR Reform Responsa | https://www.ccarnet.org/rabbinic-voice/reform-responsa/ | Free / Ebook |
| 25 | MCP-Sefaria (Community) | https://github.com/Sivan22/mcp-sefaria-server | Free / Open Source |
