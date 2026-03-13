# Open Jewish Text Repositories - Research Report

**Date**: 2026-03-02
**Purpose**: Evaluate freely available Jewish text sources for Halacha AI RAG system integration

---

## Table of Contents

1. [Sefaria Export](#1-sefaria-export) - PRIMARY SOURCE
2. [Otzaria Library](#2-otzaria-library) - PRIMARY SOURCE
3. [DICTA Library](#3-dicta-library-download)
4. [Al-Hatorah.org](#4-al-hatorahorg)
5. [Ben Yehuda Project](#5-ben-yehuda-project)
6. [HebrewBooks.org](#6-hebrewbooksorg)
7. [Internet Archive Hebrew Collection](#7-internet-archive-hebrew-collection)
8. [Torat Emet / Torah Database](#8-torat-emet--torah-database)
9. [Responsa Project (Bar-Ilan) & Alternatives](#9-responsa-project-bar-ilan--alternatives)
10. [Hebrew Wikisource](#10-hebrew-wikisource)
11. [Additional Sources](#11-additional-sources)
12. [Recommended Integration Strategy](#12-recommended-integration-strategy)

---

## 1. Sefaria Export

**Rating: ESSENTIAL - Primary text source**

| Field | Details |
|-------|---------|
| **URL** | https://github.com/Sefaria/Sefaria-Export |
| **Alt URL** | https://github.com/Sefaria/Sefaria-Data |
| **Website** | https://www.sefaria.org |
| **Dev Portal** | https://developers.sefaria.org |
| **Number of Texts** | Thousands of texts spanning 3,000 years of Jewish literature. Described as "the largest open-source database of Jewish texts in history." |
| **Format** | JSON, TXT, CSV (links/connections), XML (on request). MongoDB dump also available. |
| **License** | Mixed. Community translations: CC0 (public domain). Original Hebrew texts: mostly public domain. William Davidson Talmud: CC BY-NC. Other translations vary (CC BY, CC BY-SA, CC BY-NC). Check per-text. |
| **Download Method** | `git clone https://github.com/Sefaria/Sefaria-Export.git` or download MongoDB dump from their site. |
| **Integration Difficulty** | LOW - Well-structured JSON with consistent schema. |

### Text Categories Included
- **Tanakh**: Torah, Nevi'im, Ketuvim (full Hebrew Bible with multiple translations)
- **Mishnah**: All 6 orders, 63 tractates
- **Talmud Bavli**: Full Babylonian Talmud (William Davidson edition with English)
- **Talmud Yerushalmi**: Jerusalem Talmud
- **Midrash**: Midrash Rabbah, Tanchuma, Sifra, Sifrei, and many more
- **Halakhah**: Mishneh Torah (Rambam), Shulchan Arukh, Tur, Aruch HaShulchan
- **Kabbalah**: Zohar, Sefer Yetzirah, Tanya
- **Commentaries**: Rashi, Tosafot, Ramban, Ibn Ezra, Sforno, many more
- **Liturgy/Siddur**: Various prayer texts
- **Philosophy**: Moreh Nevukhim, Kuzari, etc.
- **Musar**: Ethical works
- **Responsa**: Select teshuvot
- **Modern**: Various modern commentaries and translations

### Data Structure
```
Sefaria-Export/
  json/           # Structured JSON, organized by category
    Tanakh/
      Torah/
        Genesis/
          merged.json      # Merged best-available text
          English/
            The_Contemporary_Torah,_JPS,_2006.json
          Hebrew/
            Tanach_with_Ta'amei_Hamikra.json
    Talmud/
    Midrash/
    Halakhah/
    ...
  txt/            # Plain text versions
  schemas/        # Text structure definitions
  links/          # CSV files of intertextual connections
  misc/           # Additional metadata
```

### Notes
- The **intertextual links** (connections between texts) are extremely valuable for RAG - they provide pre-built relationships between passages.
- MongoDB dump includes full database with edit history, user sheets, and more.
- Sefaria API is also available for real-time queries: `https://www.sefaria.org/api/`
- 775,000 monthly users (2024), 18 engineers maintaining it.

---

## 2. Otzaria Library

**Rating: HIGH VALUE - Complements Sefaria with additional texts**

| Field | Details |
|-------|---------|
| **URL** | https://github.com/Sivan22/otzaria-library |
| **App Repo** | https://github.com/Sivan22/otzaria |
| **MCP Server** | https://github.com/Sivan22/mcp-otzaria-server |
| **Number of Texts** | Large collection (exact count not published, estimated several thousand books). Sources include Sefaria, DICTA, Ben Yehuda, and Hebrew Wikisource. |
| **Format** | TXT files (plain text), with DOCX and PDF support in app. Plans to migrate to SQLite. |
| **License** | App code: Unlicense (public domain). Text licenses vary by source - check individual text origins (mostly from Sefaria, DICTA). |
| **Download Method** | `git clone https://github.com/Sivan22/otzaria-library.git` or download release ZIP from releases page. |
| **Integration Difficulty** | LOW-MEDIUM - Plain text files are easy to parse, but less structured than Sefaria JSON. |

### Key Features
- Aggregates texts from **multiple sources**: Sefaria, DICTA, Ben Yehuda Project, Hebrew Wikisource
- Conversion scripts included in the repo (Jupyter notebooks):
  - `sefariaToOtzaria/` - Converts Sefaria texts
  - `DictaToOtzaria/` - Converts DICTA texts
  - `Ben-YehudaToOtzaria/` - Converts Ben Yehuda texts
  - `wikisourceToOtzaria/` - Converts Wikisource texts
- Texts undergo a "thorough selection process" for Torah community suitability
- An **MCP server** already exists for LLM integration (full-text search via MCP protocol)

### Why Use This Over Just Sefaria?
- Contains texts from DICTA that may not be in Sefaria
- Includes Ben Yehuda Project literary texts
- Includes Hebrew Wikisource Jewish texts
- Pre-processed into consistent plain text format
- Already has LLM integration tooling (MCP server)

---

## 3. DICTA Library Download

**Rating: HIGH VALUE - Unique high-quality OCR texts with nikud**

| Field | Details |
|-------|---------|
| **URL** | https://github.com/Dicta-Israel-Center-for-Text-Analysis/Dicta-Library-Download |
| **Organization** | https://github.com/Dicta-Israel-Center-for-Text-Analysis |
| **Website** | https://dicta.org.il |
| **HuggingFace** | https://huggingface.co/dicta-il |
| **Number of Texts** | ~300 books as of March 2023 release, growing. 100+ scanned/OCR'd books across genres. |
| **Format** | Plain text files, available with and without nikud (vowel marks and punctuation). Download links in `books.json`. |
| **License** | **CC BY-SA 4.0** (Creative Commons Attribution-ShareAlike) |
| **Download Method** | Parse `books.json` from the repo, download text files via URLs listed therein. |
| **Integration Difficulty** | LOW - Clean text files with metadata in JSON. |

### Texts Included
- Responsa (She'elot u'Teshuvot)
- Biblical commentaries
- Talmudic commentaries and interpretations
- Other rabbinic literature
- All processed through DICTA's advanced AI/OCR pipeline

### Additional DICTA Resources
- **BEREL**: Pre-trained BERT model for Rabbinic Hebrew (useful for embeddings in RAG)
- **AlephBertGimmel**: Modern Hebrew BERT with 128K token vocabulary
- **DictaLM 3.0**: Open-weight Hebrew LLMs (24B, 12B, 1.7B parameters) - could be useful as a Hebrew-specialized model
- **Hebrew Diacritization Test Corpora**: Fully diacritized Hebrew texts for testing
- **NLP Tools**: Nikud (vocalization), morphological analysis, named entity recognition, text comparison

### Why This Matters
- DICTA's texts are **AI-processed with high-quality OCR**, making them cleaner than many other digitized sources.
- Nikud (vowelization) versions are extremely valuable for accurate Hebrew text processing.
- Their NLP models (BEREL, AlephBertGimmel) could enhance the RAG pipeline's Hebrew understanding.

---

## 4. Al-Hatorah.org

**Rating: MEDIUM - Excellent content, limited bulk access**

| Field | Details |
|-------|---------|
| **URL** | https://alhatorah.org |
| **Library** | https://library.alhatorah.org |
| **Mikraot Gedolot** | https://mgs.alhatorah.org |
| **Shas** | https://shas.alhatorah.org |
| **Downloads** | https://alhatorah.org/About:Downloads |
| **Number of Texts** | 40+ Bible commentaries, extensive Mikraot Gedolot collection, Talmud resources |
| **Format** | HTML (website), PDF and iBooks (downloads) |
| **License** | Freely accessible online. Download/reuse terms not clearly stated. |
| **Download Method** | Individual downloads via Dropbox links on the Downloads page. No bulk API. |
| **Integration Difficulty** | HIGH - No API, no structured data export. Would require scraping or manual extraction. |

### Content Strengths
- Especially strong in **medieval commentaries on Tanakh**
- Includes: Rashi, Ibn Ezra, Chizkuni, Kli Yakar, multiple Targumim
- Parallel midrashim display
- Bechor Shor, R. Avraham ben HaRambam, Meshech Chochmah, Netziv
- Mikraot Gedolot (Great Commentaries) collection
- Side-by-side comparison tools

### Practical Assessment
- The website is designed for interactive study, not data export.
- Most of these commentaries are **already available in Sefaria** in structured format.
- Worth cross-referencing for any unique texts not in Sefaria, but not a primary data source.
- Could be used as a **validation/comparison** source.

---

## 5. Ben Yehuda Project

**Rating: MEDIUM - Good for Hebrew literature, less for halakhic texts**

| Field | Details |
|-------|---------|
| **URL** | https://benyehuda.org |
| **GitHub** | https://github.com/projectbenyehuda/public_domain_dump |
| **Number of Texts** | 20,000+ public domain works in Hebrew from 300+ authors |
| **Format** | UTF-8 plaintext (with nikud), plaintext (stripped nikud), HTML. Includes `pseudocatalogue.csv` manifest. |
| **License** | **Public Domain** - completely free for any use. |
| **Download Method** | Download ZIP from GitHub releases page. Free API also available. |
| **Integration Difficulty** | LOW - Clean plaintext with CSV catalogue. |

### Content
- Hebrew literature: prose, poetry, essays, articles
- Reference works and translations
- Medieval to modern Hebrew texts
- Some religious/philosophical texts overlap with halakhic domain

### Practical Assessment
- Primarily **literary** rather than halakhic, but includes some relevant philosophical and ethical works.
- Already aggregated into Otzaria library.
- The CSV catalogue makes it easy to filter for relevant religious texts.
- Public domain license is ideal for AI training.

---

## 6. HebrewBooks.org

**Rating: HIGH VALUE (if accessible) - Massive scanned library, limited programmatic access**

| Field | Details |
|-------|---------|
| **URL** | https://hebrewbooks.org |
| **Number of Texts** | 65,000+ digitized seforim (books) |
| **Format** | PDF (scanned pages), OCR-searchable |
| **License** | Free to access. Reuse/redistribution terms not clearly stated for bulk use. |
| **Download Method** | Individual PDF download per book. No public bulk download API. |
| **Integration Difficulty** | VERY HIGH - Scanned PDFs require OCR pipeline. No structured text export. |

### Content
- One of the largest collections of Jewish books in digital form
- Includes Rambam, Shas, Meforshim in text format
- Rare and out-of-print seforim
- Historical responsa literature
- OCR-enabled search across all titles

### Practical Assessment
- The sheer volume (65K+ books) is unmatched, but access is the challenge.
- PDFs would need to be:
  1. Downloaded individually (no bulk API)
  2. OCR processed (many are scanned images)
  3. Cleaned and structured
- This is a **long-term** project, not a quick integration.
- Many of the commonly-needed texts are already in Sefaria in clean digital form.
- Best used for **rare texts** not found in other structured sources.
- Could potentially use DICTA's OCR tools to process downloaded PDFs.

---

## 7. Internet Archive Hebrew Collection

**Rating: LOW-MEDIUM - Supplementary source for rare texts**

| Field | Details |
|-------|---------|
| **URL** | https://archive.org/details/booksbylanguage_hebrew |
| **Number of Texts** | Thousands of Hebrew books, including HebrewBooks.org mirrors |
| **Format** | PDF, DJVU, with ABBYY FineReader OCR text layers |
| **License** | Varies per item. Many are public domain. |
| **Download Method** | Individual download or Internet Archive API. Bulk download possible via `ia` CLI tool. |
| **Integration Difficulty** | HIGH - Mixed formats, OCR quality varies, requires significant cleaning. |

### Notes
- Some HebrewBooks.org materials are mirrored on Internet Archive with OCR text layers.
- The `ia` command-line tool allows programmatic bulk downloads.
- OCR quality for Hebrew varies significantly (ABBYY FineReader, not specialized for Hebrew).
- Best for finding **specific rare texts** not available elsewhere.
- Would need a Hebrew-specialized OCR pipeline (like DICTA) for reliable text extraction.

---

## 8. Torat Emet / Torah Database

**Rating: DEPRECATED - No longer viable**

| Field | Details |
|-------|---------|
| **URL** | No longer actively maintained |
| **Status** | **Defunct/Abandoned** |
| **Historical Note** | Was one of the original Torah database programs. No longer developed or supported. |

### Practical Assessment
- Torat Emet is obsolete and should not be considered for integration.
- Its functionality has been superseded by Sefaria, Otzaria, and other modern tools.
- The Wikipedia article on "Torah database" lists it historically but notes it is no longer current.
- Any texts it contained are now available through Sefaria or Otzaria.

---

## 9. Responsa Project (Bar-Ilan) & Alternatives

### Bar-Ilan Responsa Project

| Field | Details |
|-------|---------|
| **URL** | https://www.responsa.co.il |
| **Status** | **Commercial / Subscription-based** |
| **Content** | One of the world's largest electronic collections of Jewish texts in Hebrew. Extensive responsa literature. |
| **License** | Proprietary. Requires paid subscription. |
| **Integration** | NOT AVAILABLE for open integration. |

### Open Alternatives to Bar-Ilan

1. **Sefaria** (FREE) - Has select responsa collections and is growing. Best open alternative.
2. **Otzar HaChochma** (PAID, limited free) - 156,000+ books with OCR search. Free trial: first 40 pages per book. Annual subscription available through institutional access (e.g., Spertus Institute ~$180/year).
3. **HebrewBooks.org** (FREE) - 65,000+ scanned books include significant responsa literature, but PDF only.
4. **DICTA Library** (FREE, CC BY-SA) - ~300 books include responsa (She'elot u'Teshuvot).
5. **Hebrew Wikisource** (FREE) - Volunteer-typed Torah texts, including some responsa.

### Practical Assessment
- There is **no true open-source equivalent** to Bar-Ilan's Responsa Project.
- For Halacha AI, the combined corpus of Sefaria + DICTA + Otzaria covers the most commonly referenced halakhic texts.
- Rare responsa will require either HebrewBooks.org PDF extraction or Otzar HaChochma access.

---

## 10. Hebrew Wikisource

**Rating: MEDIUM - Good supplementary source**

| Field | Details |
|-------|---------|
| **URL** | https://he.wikisource.org |
| **English** | https://en.wikisource.org/wiki/Wikisource:WikiProject_Jewish_Texts |
| **Number of Texts** | Thousands of texts (growing via volunteer effort) |
| **Format** | Wikitext/HTML, downloadable via Wikimedia API or dump |
| **License** | CC BY-SA or Public Domain (per text) |
| **Download Method** | Wikimedia dumps or API |
| **Integration Difficulty** | MEDIUM - Requires Wikitext parsing. |

### Content
- Mishnah (moved to Hebrew Wikisource)
- Talmud (various translations, including Rodkinson)
- Fully vocalized, punctuated, and formatted texts of complete tractates
- Growing collection maintained by volunteers

### Notes
- Already aggregated into Otzaria library via `wikisourceToOtzaria` scripts.
- Quality varies (volunteer-maintained).
- Useful for cross-referencing and gap-filling.

---

## 11. Additional Sources

### OnYourWay (Free Mobile Apps)
- Created by Roi Reshef of Ben Gurion University
- Largest collection of Hebrew texts for Android/iOS (as of 2015)
- Includes: OnYourWay Yesod, Halacha, Kabbala, Siddur
- Not a data source for RAG, but worth noting for reference

### Mechon Mamre
- **URL**: https://mechon-mamre.org
- Hebrew Bible with various vocalizations, Mishnah, some Talmud
- Clean digital text, free to access
- May overlap with Sefaria but worth checking for unique vocalization variants

### Tyndale STEP Bible
- Includes some Hebrew texts with morphological tagging
- More oriented toward Christian biblical scholarship
- Limited halakhic content

---

## 12. Recommended Integration Strategy

### Phase 1: Core Corpus (Immediate)

| Priority | Source | Action | Estimated Texts |
|----------|--------|--------|-----------------|
| 1 | **Sefaria Export** | Clone repo, parse JSON files. Set up MongoDB dump for full access. | Thousands (all major categories) |
| 2 | **Otzaria Library** | Clone repo, extract TXT files. Use as gap-filler for texts not in Sefaria. | Several thousand additional |
| 3 | **DICTA Library** | Download via `books.json` URLs. High-quality OCR'd texts with nikud. | ~300 books |

**Combined Phase 1 corpus**: Covers Tanakh, Talmud, Mishnah, Midrash, major commentaries, Halakhah (Rambam, Shulchan Arukh, Tur), Kabbalah, Musar, selected Responsa, and more.

### Phase 2: Enrichment (Short-term)

| Priority | Source | Action |
|----------|--------|--------|
| 4 | **Ben Yehuda Project** | Download dump, filter for religious/philosophical texts |
| 5 | **Hebrew Wikisource** | Already in Otzaria, but cross-reference for missing texts |
| 6 | **Sefaria Links/Connections** | Import CSV connections for relationship-aware RAG |

### Phase 3: Deep Expansion (Medium-term)

| Priority | Source | Action |
|----------|--------|--------|
| 7 | **HebrewBooks.org** | Selectively download rare/important PDFs, OCR with DICTA tools |
| 8 | **Internet Archive** | Use `ia` CLI for specific rare texts not found elsewhere |
| 9 | **Al-Hatorah.org** | Manual cross-reference for unique medieval commentaries |

### Phase 4: Advanced (Long-term)

| Priority | Source | Action |
|----------|--------|--------|
| 10 | **DICTA NLP Models** | Integrate BEREL/AlephBertGimmel for Hebrew-optimized embeddings |
| 11 | **DictaLM 3.0** | Evaluate as specialized Hebrew model for the RAG pipeline |
| 12 | **Otzar HaChochma** | If budget allows, institutional access for rare responsa |

### Technical Recommendations

1. **Start with Sefaria JSON** - Best structured, most comprehensive, easiest to parse.
2. **Use Otzaria as a supplement** - Its MCP server pattern is directly relevant to our architecture.
3. **Prioritize DICTA's nikud versions** - Vocalized text improves search accuracy for Hebrew.
4. **Leverage Sefaria's link graph** - The intertextual connections CSV is a massive advantage for RAG.
5. **Consider DICTA's BEREL model** - Purpose-built for Rabbinic Hebrew embeddings.
6. **Build an OCR pipeline** for HebrewBooks.org PDFs using DICTA tools for Phase 3.

### License Summary

| Source | License | Commercial Use | Attribution Required |
|--------|---------|---------------|---------------------|
| Sefaria (community) | CC0 | Yes | No |
| Sefaria (translations) | Mixed CC | Varies | Varies |
| William Davidson Talmud | CC BY-NC | No | Yes |
| DICTA Library | CC BY-SA 4.0 | Yes | Yes, ShareAlike |
| Ben Yehuda | Public Domain | Yes | No (recommended) |
| Otzaria (code) | Unlicense | Yes | No |
| Otzaria (texts) | Varies by source | Check per text | Check per text |
| Hebrew Wikisource | CC BY-SA / PD | Yes | ShareAlike for CC texts |
| HebrewBooks.org | Unclear | Check with site | Unknown |
| Al-Hatorah.org | Unclear | Check with site | Unknown |

---

## Quick Start Commands

```bash
# 1. Clone Sefaria Export (primary)
git clone https://github.com/Sefaria/Sefaria-Export.git

# 2. Clone Otzaria Library (supplement)
git clone https://github.com/Sivan22/otzaria-library.git

# 3. Clone DICTA Library metadata
git clone https://github.com/Dicta-Israel-Center-for-Text-Analysis/Dicta-Library-Download.git

# 4. Download Ben Yehuda dump (from releases page)
# Visit: https://github.com/projectbenyehuda/public_domain_dump/releases

# 5. Download Sefaria MongoDB dump (for full database)
# Visit: https://storage.googleapis.com/sefaria-mongo-backup/dump_small.tar.gz
```

---

*This report was compiled on 2026-03-02. Sources should be re-verified before integration as repositories are actively maintained and growing.*
