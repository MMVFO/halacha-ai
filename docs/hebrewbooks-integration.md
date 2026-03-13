# HebrewBooks.org Integration Report for Halacha AI

## 1. Overview of HebrewBooks.org

**Founded:** 2001 by Chaim Rosenberg
**Organization:** The Society for the Preservation of Hebrew Books (501(c)(3) non-profit)
**Location:** Brooklyn, NY
**Website:** https://hebrewbooks.org
**Beta site:** https://beta.hebrewbooks.org
**Mission:** Preserve and make freely available all Torah seforim ever printed, especially out-of-print and rare works.

### Collection Size

- **Main site:** 40,000+ seforim available as free PDFs
- **Mobile app / expanded catalog:** 60,000-65,000+ volumes (as of late 2025)
- The collection started with ~2,000 works of American rabbis from the late 19th and early 20th centuries and has expanded to cover the broad range of Jewish tradition

### Subject Categories

HebrewBooks.org covers the full scope of Torah literature. Based on standard Jewish library classification and browseable at https://hebrewbooks.org/browse, major categories include:

- **Tanach** - Bible commentaries
- **Talmud & Mishnah** - Shas, Meforshim (available in full text on beta site)
- **Halacha** - Shulchan Aruch, Tur, codes and commentaries
- **She'elot u-Teshuvot (Responsa)** - Thousands of responsa collections spanning Geonim through modern era
- **Chassidut** - Chassidic thought and teachings across all dynasties
- **Kabbalah / Machshava** - Jewish mysticism and philosophy
- **Mussar** - Ethical literature
- **Derush / Drash** - Sermons and homiletical works
- **History / Biography** - Historical works and biographies of rabbinical figures
- **Periodicals / Journals** - Rabbinical journals and publications
- **Liturgy / Tefillah** - Prayer books and liturgical texts
- **Languages:** Hebrew, Yiddish, and English publications

---

## 2. Data Format and Text Quality

### Primary Format: Scanned PDF Images

HebrewBooks.org books are digitized scans stored as **PDF files**. Each book is viewable and downloadable as a PDF preserving the original printed page layout.

**Scanning technology:** Since 2006, scanning has been performed by Crowley Imaging, which has scanned 11,000+ volumes of rare and out-of-print works using professional book scanning equipment.

### OCR and Searchability

- **OCR-enabled search:** The site uses OCR (Optical Character Recognition) to make scanned content searchable. Users can search for specific words/phrases across all titles.
- **Search engine:** Powered by dtSearch Engine, capable of searching over a terabyte of data with Unicode support for Hebrew, Yiddish, and other languages.
- **Search features:** Three search boxes (title, author, full-text), with results ranked by relevance percentage.
- **Beta text versions:** Select core texts (Rambam, Shas, Meforshim, Tur/Shulchan Aruch) are available in structured text format at https://beta.hebrewbooks.org/tursa

### Key Limitation for AI Integration

The vast majority of the collection is **scanned page images in PDF format**, NOT structured digital text. This means:
- Raw text extraction requires OCR processing
- Hebrew OCR is imperfect, especially on older typeset and handwritten marginalia
- No structured markup (chapter, verse, paragraph delineation) exists for most texts
- The internal OCR index is used for search but is not directly exposed as clean text data

---

## 3. API and Programmatic Access

### Official Developer Resources

HebrewBooks.org has been developing official developer tools:

| Resource | URL | Description |
|----------|-----|-------------|
| **Developer Portal** | https://developers.hebrewbooks.org | API documentation (launched Feb 2026) |
| **Developer GitHub** | https://github.com/hebrewbooks/developers.hebrewbooks.org | Documentation repo (AGPL-3.0) |
| **Metadata Repo** | https://github.com/hebrewbooks/hebrewbooks-metadata | Book metadata (Apache-2.0) |
| **Mobile App Repo** | https://github.com/hebrewbooks/mobile_app_public | Dart-based mobile app |
| **Data Portal** | https://developers.hebrewbooks.org/data | Metadata access documentation |

### Known URL Patterns

Based on reverse-engineering and community observation:

```
# Download a book PDF by ID
https://download.hebrewbooks.org/downloadhandler.ashx?req={BOOK_ID}

# View individual pages as images (pagefeed)
https://beta.hebrewbooks.org/pagefeed/hebrewbooks_org_{BOOK_ID}_{PAGE}.pdf

# Book detail page
https://hebrewbooks.org/{BOOK_ID}

# Structured text (select works only)
https://beta.hebrewbooks.org/tursa.aspx?a={SECTION_CODE}
```

### Download Restrictions

- **10 MB file size limit** on individual downloads
- **Rate limiting** is enforced (download limit reached errors reported by users)
- **No official bulk download API** documented as of this writing
- The developer portal (launched Feb 2026) may contain new API endpoints -- check https://developers.hebrewbooks.org for the latest

### Hard Drive Product (Historical)

HebrewBooks.org previously sold a physical hard drive containing the entire collection:
- **Content:** ~40,000 seforim (as of end of 2009)
- **Price:** $100 USD ($120 in Israel)
- **Format:** 500GB hard drive with browsing/search software
- **FAQ:** https://data.hebrewbooks.org/hd/faq.html
- **Status:** This product appears to be discontinued or not updated since ~2010

### Internet Archive Mirror

A partial mirror exists on the Internet Archive:
- https://archive.org/details/HebrewbooksOrg40009
- Contains subset of the collection in downloadable format

---

## 4. Copyright and Licensing Terms

**Terms of Use:** https://hebrewbooks.org/media/terms.html

### Key Terms

| Aspect | Details |
|--------|---------|
| **License type** | Limited, nonexclusive, personal use license |
| **Personal/educational use** | Permitted |
| **Commercial use** | Prohibited |
| **Resale** | Prohibited -- cannot sell or bundle with paid products |
| **Free redistribution** | Permitted -- print or electronic copies may be distributed to third parties free of charge for personal use |
| **Copyright status** | Mixed: some works are public domain; others are posted with copyright holder permission on limited terms |
| **Modification** | No right to modify, adapt, or create derivative works (implied) |

### Implications for Halacha AI

**CRITICAL:** The terms explicitly prohibit commercial use and resale. For Halacha AI integration:

1. **If Halacha AI is free/non-commercial:** Redistribution of the PDFs for personal/educational use is likely permissible under the terms
2. **If Halacha AI has any commercial component:** Direct use of HebrewBooks content would violate the terms
3. **Public domain works:** Many older texts (pre-1928 publications, or works with expired copyrights) can be freely used regardless of HebrewBooks terms -- the terms only apply to HebrewBooks' scanned reproductions
4. **OCR-extracted text:** Creating OCR text from their PDFs and redistributing it commercially may violate terms; legal review recommended
5. **Contact HebrewBooks directly** for a special licensing arrangement if commercial use is intended

---

## 5. Open-Source Tools and Community Projects

### HebrewBooks-Specific Tools

| Tool | URL | Description |
|------|-----|-------------|
| **hebrewbooksbot** | https://github.com/david-lev/hebrewbooksbot | Telegram/WhatsApp bot for searching and browsing HebrewBooks (Python/Docker) |
| **HebrewBooks Mobile App** | https://github.com/hebrewbooks/mobile_app_public | Official mobile app (Dart/Flutter) |

### Hebrew OCR Tools (for processing scanned PDFs)

| Tool | Description | Notes |
|------|-------------|-------|
| **Tesseract OCR** | Open-source OCR engine with Hebrew support | Best general-purpose option; `heb` and `heb_old` trained data available |
| **Google Cloud Vision API** | Commercial OCR with strong Hebrew support | High accuracy, pay-per-use |
| **Kraken OCR** | Open-source OCR for historical documents | Good for older typefaces, trainable on custom fonts |
| **eScriptorium** | Web-based platform for HTR/OCR of historical documents | Used in academic Hebrew manuscript digitization projects |
| **i2OCR** | Free online Hebrew OCR | https://www.i2ocr.com/free-online-hebrew-ocr |

### Related Jewish Text Tools

| Tool | URL | Description |
|------|-----|-------------|
| **Sefaria Export** | https://github.com/Sefaria/Sefaria-Export | Structured Jewish texts as JSON/CSV |
| **Sefaria Project** | https://github.com/Sefaria/Sefaria-Project | Full Sefaria platform with API |

---

## 6. Texts on HebrewBooks NOT on Sefaria

This is where HebrewBooks provides the greatest value for Halacha AI. Sefaria's library, while excellent, has significant gaps that HebrewBooks fills.

### 6.1 Responsa Literature (She'elot u-Teshuvot)

Sefaria has ~60-70 responsa collections. HebrewBooks has **thousands**. Key works on HebrewBooks but NOT on Sefaria include:

**Major Modern Poskim:**
- Shut Igrot Moshe (R. Moshe Feinstein) -- the most important 20th-century American posek
- Shut Yabi'a Omer / Yechaveh Da'at (R. Ovadia Yosef) -- most important Sephardic posek
- Shut Minchat Yitzchak (R. Yitzchak Yaakov Weiss)
- Shut Shevet HaLevi (R. Shmuel HaLevi Wosner)
- Shut Tzitz Eliezer (R. Eliezer Waldenberg)
- Shut Chelkat Ya'akov (R. Mordechai Yaakov Breisch)
- Shut Be'er Moshe (R. Moshe Stern)
- Shut Mishneh Halachot (R. Menashe Klein)

**Classic Responsa Collections:**
- Shut Noda BiYehuda (expanded edition with additional responsa)
- Shut Chatam Sofer (complete multi-volume set)
- Shut Maharsham (R. Shalom Mordechai Schwadron)
- Shut Avnei Nezer / Eglei Tal (R. Avraham Bornsztain)
- Shut Divrei Chaim (R. Chaim Halberstam of Sanz)
- Shut Marcheshet (R. Chanoch Henoch Eigis)
- Hundreds of other lesser-known but valuable responsa collections

### 6.2 Chassidic Texts

Sefaria has a limited selection of Chassidic works. HebrewBooks contains a vastly larger collection:

**Foundational Works:**
- Toldot Yaakov Yosef (first published Chassidic work)
- Kedushat Levi (R. Levi Yitzchak of Berditchev) -- expanded editions
- Mei HaShiloach (R. Mordechai Yosef Leiner of Izhbitz)
- Sefat Emet (R. Yehudah Aryeh Leib Alter of Ger)
- Divrei Yoel (Satmar Rebbe)
- Beit Aharon (Karlin)
- Imrei Emet (Ger)

**Chabad Library:**
- Likkutei Sichot (R. Menachem Mendel Schneerson)
- Igrot Kodesh
- Sefer HaMaamarim
- Reshimot

**Various Dynasties:**
- Breslov: Likkutei Moharan, Sichot HaRan (expanded editions)
- Belz, Vizhnitz, Bobov, Munkacz, Klausenburg -- court publications
- Hundreds of drashos and Torah collections from lesser-known rebbes

### 6.3 Kabbalah Works

Sefaria's Kabbalah section is minimal. HebrewBooks has:

- Etz Chaim (R. Chaim Vital) -- multiple editions
- Pri Etz Chaim
- Sha'ar HaKavanot
- Sha'arei Kedusha (R. Chaim Vital)
- Kitvei HaAri (collected writings of the Arizal)
- Sefer HaBahir
- Pardes Rimonim (R. Moshe Cordovero)
- Tomer Devorah
- Megaleh Amukot
- Yosher Divrei Emet
- Nefesh HaChaim (R. Chaim of Volozhin) -- various editions
- Leshem Shvo v'Achlama (R. Shlomo Elyashiv)
- Ben Ish Chai (R. Yosef Chaim of Baghdad) -- halachic/kabbalistic works
- Kaf HaChaim (R. Yaakov Chaim Sofer)

### 6.4 Modern Halakhic Works

- Mishnah Berurah (multiple editions with additional commentaries)
- Aruch HaShulchan (R. Yechiel Michel Epstein)
- Kitzur Shulchan Aruch (various editions and commentaries)
- Shemirat Shabbat Kehilchata
- Piskei Teshuvot
- Yalkut Yosef
- Hundreds of specialized halakhic monographs on specific topics

### 6.5 Rare and Out-of-Print Sefarim

This is HebrewBooks' unique strength:
- Works of American rabbis from the late 19th/early 20th century
- Pre-Holocaust European publications
- Small-press publications from Israel and worldwide
- Rabbinical journals and periodicals
- Works that had only one or two print runs
- Manuscripts and rare editions of classic works

---

## 7. Technical Integration Plan

### Phase 1: Metadata Acquisition (Weeks 1-2)

**Goal:** Build a complete catalog of HebrewBooks content

1. **Clone the metadata repo:**
   ```bash
   git clone https://github.com/hebrewbooks/hebrewbooks-metadata.git
   ```

2. **Explore the developer API** at https://developers.hebrewbooks.org for metadata endpoints

3. **Build a catalog database** mapping:
   - Book ID -> Title, Author, Subject, Year, Pages
   - Cross-reference with Sefaria's text index to identify unique works
   - Prioritize by halakhic relevance

### Phase 2: Priority Text Selection (Weeks 2-3)

**Goal:** Identify the highest-value texts for Halacha AI

**Tier 1 -- Critical (must have):**
- Major responsa: Igrot Moshe, Yabia Omer, Minchat Yitzchak, Tzitz Eliezer, Shevet HaLevi
- Shulchan Aruch with major commentaries not on Sefaria
- Mishnah Berurah with Biur Halacha and Sha'ar HaTziyun

**Tier 2 -- High Value:**
- Additional 50-100 responsa collections from major poskim
- Key Chassidic works with halakhic content
- Aruch HaShulchan
- Kaf HaChaim

**Tier 3 -- Broad Coverage:**
- Remaining responsa literature
- Specialized halakhic monographs
- Kabbalah works relevant to halachic practice
- Rabbinical journals

### Phase 3: PDF Acquisition Pipeline (Weeks 3-6)

**Goal:** Download and organize priority PDFs

```python
# Conceptual pipeline (respect rate limits and terms)
import requests
import time
import os

DOWNLOAD_URL = "https://download.hebrewbooks.org/downloadhandler.ashx"
OUTPUT_DIR = "corpus/hebrewbooks/pdfs"
DELAY_SECONDS = 5  # respect rate limits

def download_book(book_id: int, output_dir: str) -> str:
    """Download a single book PDF from HebrewBooks."""
    filepath = os.path.join(output_dir, f"hb_{book_id}.pdf")
    if os.path.exists(filepath):
        return filepath

    resp = requests.get(f"{DOWNLOAD_URL}?req={book_id}", timeout=60)
    resp.raise_for_status()

    with open(filepath, "wb") as f:
        f.write(resp.content)

    time.sleep(DELAY_SECONDS)
    return filepath
```

**Important considerations:**
- Respect the 10MB download limit per file
- Implement exponential backoff for rate limit errors
- Store book metadata alongside PDFs
- Check the developer API first for a sanctioned download method
- Contact HebrewBooks.org to discuss bulk access for the project

### Phase 4: OCR Processing Pipeline (Weeks 6-12)

**Goal:** Extract searchable text from scanned PDFs

```
PDF -> Page Images -> OCR Engine -> Raw Text -> Post-Processing -> Structured Text
```

**Recommended OCR stack:**

1. **PDF to images:** Use `pdf2image` (Python) or `poppler` to extract page images
2. **OCR engine:** Tesseract 5.x with Hebrew model (`heb` + `heb_old`)
   - For higher accuracy: Google Cloud Vision API or Azure Computer Vision
   - For historical typefaces: Fine-tuned Kraken models
3. **Post-processing pipeline:**
   - Spell-checking against Hebrew word lists
   - Biblical/Talmudic reference detection and normalization
   - Paragraph and section boundary detection
   - Nikud (vowel marks) handling
4. **Quality scoring:** Rate OCR confidence per page; flag low-confidence pages for manual review

```python
# Conceptual OCR pipeline
import pytesseract
from pdf2image import convert_from_path

def ocr_book(pdf_path: str) -> list[dict]:
    """OCR a HebrewBooks PDF into page-level text."""
    pages = convert_from_path(pdf_path, dpi=300)
    results = []
    for i, page_img in enumerate(pages):
        text = pytesseract.image_to_string(page_img, lang="heb")
        confidence = pytesseract.image_to_data(
            page_img, lang="heb", output_type=pytesseract.Output.DICT
        )
        avg_conf = sum(
            c for c in confidence["conf"] if c > 0
        ) / max(len([c for c in confidence["conf"] if c > 0]), 1)
        results.append({
            "page": i + 1,
            "text": text,
            "confidence": avg_conf,
        })
    return results
```

### Phase 5: Text Structuring and Indexing (Weeks 10-16)

**Goal:** Convert raw OCR text into structured, queryable format

1. **Section detection:** Identify siman/se'if/teshuvah boundaries using pattern matching
2. **Reference extraction:** Detect citations to Talmud, Shulchan Aruch, other poskim
3. **Metadata enrichment:** Link to author, topic, time period
4. **Index building:** Create vector embeddings for semantic search (for the AI retrieval layer)
5. **Cross-referencing:** Link HebrewBooks texts to Sefaria texts where overlapping references exist

### Phase 6: Quality Assurance (Ongoing)

- Manual spot-checking of OCR output against original scans
- Community review for critical halakhic texts
- Automated cross-validation against known digital texts (where available)
- Track OCR error patterns and retrain/adjust pipeline

---

## 8. Recommended Approach for Halacha AI

### Contact HebrewBooks.org First

Before any large-scale integration:
1. Email HebrewBooks.org explaining the Halacha AI project
2. Ask about:
   - Bulk access or API availability beyond the developer portal
   - Licensing terms for AI/educational use
   - Whether they can provide OCR text directly (avoiding duplicate OCR work)
   - Partnership possibilities
3. Contact: app@hebrewbooks.org or via their feedback form

### Hybrid Approach

Given the challenges of OCR on Hebrew texts, consider a **hybrid approach**:

1. **Sefaria first:** Use Sefaria's structured, clean text for everything they have (via their API and export)
2. **HebrewBooks for gaps:** Focus OCR efforts only on texts NOT available on Sefaria
3. **Bar Ilan Responsa Project:** If budget allows, license the Bar Ilan database for the highest-quality digital text of responsa (considered the gold standard)
4. **Community contribution:** Open-source the OCR pipeline so the community can help improve text quality

### Estimated Effort

| Phase | Duration | Resources |
|-------|----------|-----------|
| Metadata & cataloging | 2-3 weeks | 1 developer |
| Priority selection | 1 week | 1 developer + rabbinic consultant |
| PDF acquisition | 2-4 weeks | Automated (with rate limiting) |
| OCR pipeline setup | 2-3 weeks | 1 ML engineer |
| OCR processing | 4-8 weeks | GPU compute (cloud) |
| Text structuring | 4-6 weeks | 1 developer + rabbinic consultant |
| QA and refinement | Ongoing | Community + 1 developer |

**Total estimated timeline:** 4-6 months for initial integration of Tier 1 texts

---

## 9. Key URLs and Resources

| Resource | URL |
|----------|-----|
| HebrewBooks.org main site | https://hebrewbooks.org |
| HebrewBooks.org beta | https://beta.hebrewbooks.org |
| Browse seforim | https://hebrewbooks.org/browse |
| Developer portal | https://developers.hebrewbooks.org |
| GitHub organization | https://github.com/hebrewbooks |
| Metadata repository | https://github.com/hebrewbooks/hebrewbooks-metadata |
| Developer docs repo | https://github.com/hebrewbooks/developers.hebrewbooks.org |
| Mobile app repo | https://github.com/hebrewbooks/mobile_app_public |
| Terms of use | https://hebrewbooks.org/media/terms.html |
| Q&A forum | https://qa.hebrewbooks.org |
| Official blog | https://blog.hebrewbooks.org |
| HebrewBooksBot (community) | https://github.com/david-lev/hebrewbooksbot |
| Internet Archive mirror | https://archive.org/details/HebrewbooksOrg40009 |
| Hard drive FAQ | https://data.hebrewbooks.org/hd/faq.html |
| Sefaria API docs | https://github.com/Sefaria/Sefaria-Project/wiki/API-Documentation |
| Sefaria Export | https://github.com/Sefaria/Sefaria-Export |

---

## 10. Risks and Mitigations

| Risk | Impact | Mitigation |
|------|--------|------------|
| **Terms of use violation** | Legal liability | Contact HebrewBooks for permission; focus on public domain texts |
| **Poor OCR quality** | Inaccurate halakhic content | Multi-engine OCR, manual review for critical texts, confidence scoring |
| **Rate limiting** | Slow acquisition | Respect limits, contact for bulk access, use hard drive if available |
| **Copyright on modern works** | Cannot redistribute | Provide citations and links rather than full text for copyrighted works |
| **Hebrew OCR challenges** | Low accuracy on old typefaces | Fine-tune OCR models on Hebrew fonts, use Google Vision for difficult pages |
| **Scale of collection** | Overwhelming volume | Strict prioritization by halakhic relevance using Tier system |

---

*Report generated: March 2026*
*For Halacha AI integration planning*
