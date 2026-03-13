# Ancient Texts & DSS Sources for Halacha AI

> Research date: March 2, 2026
> Purpose: Identify downloadable, machine-readable sources for Dead Sea Scrolls, Pseudepigrapha, Aramaic texts, and related ancient Jewish literature for RAG integration.

---

## Table of Contents

1. [Dead Sea Scrolls Digital Library (Leon Levy)](#1-dead-sea-scrolls-digital-library-leon-levy)
2. [SQE - Scripta Qumranica Electronica](#2-sqe---scripta-qumranica-electronica)
3. [ETCBC Dead Sea Scrolls (Text-Fabric)](#3-etcbc-dead-sea-scrolls-text-fabric)
4. [Online Critical Pseudepigrapha (OCP)](#4-online-critical-pseudepigrapha-ocp)
5. [R.H. Charles Pseudepigrapha (1913)](#5-rh-charles-pseudepigrapha-1913)
6. [Comprehensive Aramaic Lexicon (CAL)](#6-comprehensive-aramaic-lexicon-cal)
7. [Perseus Digital Library - Josephus & Philo](#7-perseus-digital-library---josephus--philo)
8. [Open Greek and Latin / First1KGreek](#8-open-greek-and-latin--first1kgreek)
9. [Nag Hammadi Library](#9-nag-hammadi-library)
10. [Samaritan Pentateuch](#10-samaritan-pentateuch)
11. [Cairo Genizah Fragments](#11-cairo-genizah-fragments)
12. [Church Fathers Referencing Jewish Texts](#12-church-fathers-referencing-jewish-texts)
13. [Integration Priority Matrix](#13-integration-priority-matrix)

---

## 1. Dead Sea Scrolls Digital Library (Leon Levy)

| Field | Details |
|-------|---------|
| **URL** | https://www.deadseascrolls.org.il/ |
| **Content** | 25,000+ scroll fragments, including oldest known copies of biblical texts. High-resolution spectral images of manuscript fragments and scans of 1950s negatives (PAM). Accompanied by transcriptions, translations, and bibliography. |
| **Format** | High-resolution images (spectral/multispectral). Interactive transcriptions and translations available on the web platform. |
| **License** | Israel Antiquities Authority (IAA). Images viewable online for free; no explicit bulk download or open license stated. |
| **Download** | **No bulk download or API available.** Web-based viewing only. Individual fragment pages include transcription text that could be scraped (check ToS). |
| **Size** | Thousands of fragments, tens of thousands of images. |
| **RAG Viability** | LOW for direct ingestion. The transcriptions are embedded in the web UI. Would require scraping or partnering with IAA. Best used as a reference/verification layer. |

### Notes
- The SQE project (below) is the machine-readable companion to this library.
- The images are partnership between IAA and Google.
- Contact: contact@deadseascrolls.org.il

---

## 2. SQE - Scripta Qumranica Electronica

| Field | Details |
|-------|---------|
| **URL** | https://www.qumranica.org/ |
| **Platform** | https://sqe.deadseascrolls.org.il/ |
| **GitHub** | https://github.com/Scripta-Qumranica-Electronica |
| **Content** | The only comprehensive machine-readable DSS corpus. Contains transcriptions of Dead Sea Scrolls fragments with lexical, morphological, and bibliographical data. Links to Leon Levy digital images. |
| **Format** | MariaDB database (Docker container). Individual SQL table dumps on GitHub. The database grew beyond 1GB uncompressed, so full dumps are delivered via Docker Hub. |
| **License** | Open access (project states free access for scholars and public). |
| **Download** | Pull the Docker image from Docker Hub for the complete database. GitHub repos contain schema, tools, and individual table exports. |
| **API** | REST API with Swagger docs at https://sqe-api.deadseascrolls.org.il/swagger/index.html |
| **Size** | 1GB+ uncompressed database |
| **RAG Viability** | **HIGH** - This is the primary machine-readable DSS source. |

### Key Repositories
- `SQE_Database` - Database schema, Docker image build tools
- `SQE_API` - C# data access API
- `Data-Processing` - Tools for data processing/population
- `ScrollEditor` - Vue-based virtual scroll editor
- `Scrollery-website` - Original web interface (archived)

### Integration Plan
1. Pull Docker image, spin up MariaDB instance
2. Export transcription tables to JSON/text
3. Use the REST API for structured queries
4. Cross-reference with Leon Levy images for verification

---

## 3. ETCBC Dead Sea Scrolls (Text-Fabric)

| Field | Details |
|-------|---------|
| **URL** | https://github.com/ETCBC/dss |
| **Content** | Transcriptions of biblical and non-biblical Dead Sea Scrolls with linguistic annotations. Based on Martin Abegg's transcription data (the standard scholarly transcription corpus). |
| **Format** | Text-Fabric (.tf) format - a graph-based text annotation format. Python API for querying. |
| **License** | Code: MIT. Data (.tf files): **CC-BY-NC** (non-commercial). |
| **Download** | `git clone https://github.com/ETCBC/dss` |
| **Size** | Moderate (text transcriptions + morphological tagging) |
| **RAG Viability** | **HIGH** - Pre-parsed, linguistically annotated, immediately usable with Python. |

### Notes
- Source data from Martin Abegg's transcriptions (Discoveries in the Judean Desert series, Oxford: Clarendon Press, 1955-)
- Converted to Text-Fabric by Dirk Roorda via `tfFromAbegg.py`
- Includes morphological tagging, word-level annotations
- CC-BY-NC license means we can use for non-commercial RAG but need to verify if Halacha AI qualifies
- Related repo: `ETCBC/DSS2ETCBC` - conversion scripts

### Integration Plan
1. Clone repo, install text-fabric Python package
2. Export transcriptions to plain text / JSON
3. Include morphological data as metadata for enhanced search

---

## 4. Online Critical Pseudepigrapha (OCP)

| Field | Details |
|-------|---------|
| **URL** | https://pseudepigrapha.org/ (note: SSL cert expired as of research date) |
| **GitHub** | https://github.com/OnlineCriticalPseudepigrapha/Online-Critical-Pseudepigrapha |
| **Content** | Critical editions of Old Testament Pseudepigrapha in original languages with critical apparatus. |
| **Format** | **TEI XML** files in `static/docs/` directory |
| **License** | Open source (GitHub public repository). Specific license TBD from repo. |
| **Download** | `git clone https://github.com/OnlineCriticalPseudepigrapha/Online-Critical-Pseudepigrapha` |
| **Size** | Small-moderate (text files) |
| **RAG Viability** | **HIGH** - TEI XML is structured and parseable. |

### Available Texts (confirmed in repo)
- `1En.xml` - 1 Enoch (Ethiopic Apocalypse of Enoch)
- `Jubi.xml` - Jubilees
- 2 Syriac Apocalypse of Baruch (with critical apparatus)
- Testament of Job (with critical apparatus)
- Testament of Abraham
- Life of Adam and Eve
- Additional texts in various stages of completion

### Integration Plan
1. Clone repo, parse TEI XML files
2. Extract text content, critical notes, and variant readings
3. Structure by chapter/verse for RAG chunking
4. Original language texts will need translation layer

---

## 5. R.H. Charles Pseudepigrapha (1913)

| Field | Details |
|-------|---------|
| **URL (Internet Archive)** | Vol 1: https://archive.org/details/Charles_The-Apocrypha-of-the-Old-Testament-vol-1_1913 |
| | Vol 2: https://archive.org/details/Charles_The-Apocrypha-of-the-Old-Testament-vol-2_1913 |
| **URL (CCEL)** | https://ccel.org/c/charles/otpseudepig/home.html |
| **Content** | "The Apocrypha and Pseudepigrapha of the Old Testament in English" - the foundational English translation collection. Includes introductions, critical notes, and explanatory notes. |
| **Texts Included** | Vol 1: Apocrypha (1 Esdras, Tobit, Judith, Wisdom, Sirach, Baruch, 1-4 Maccabees, etc.). Vol 2: Pseudepigrapha (1 Enoch, Jubilees, Testaments of the Twelve Patriarchs, Psalms of Solomon, Sibylline Oracles, Assumption of Moses, 2 Baruch, 4 Ezra, etc.) |
| **Format** | Internet Archive: PDF, EPUB, Kindle, DjVu, plain text, DAISY. CCEL: HTML, XML (ThML), PDF, Word. |
| **License** | **Public domain** (published 1913, Oxford: Clarendon Press). |
| **Download** | Bulk download from Internet Archive. CCEL provides individual format downloads. |
| **Size** | ~50MB per volume (PDF). Text versions much smaller. |
| **RAG Viability** | **VERY HIGH** - Public domain, English translations, structured text. |

### Additional Archive.org Copies
- https://archive.org/details/apocryphapseudep02charuoft
- https://archive.org/details/apocryphapseudep00char

### Integration Plan
1. Download plain text versions from Internet Archive
2. Parse into individual books/chapters
3. Cross-reference with OCP critical editions for variant readings
4. Use CCEL XML for structured extraction

---

## 6. Comprehensive Aramaic Lexicon (CAL)

| Field | Details |
|-------|---------|
| **URL** | http://cal.huc.edu/ |
| **Content** | Searchable dictionary and text corpora of all Aramaic dialects from 9th century BCE through 13th century CE. ~3 million lexically parsed words. |
| **Texts Include** | Targum Onkelos, Targum Pseudo-Jonathan, Targums to Hagiographa, Targum Jonathan to Prophets, Biblical Aramaic, Syriac texts, Babylonian Aramaic, Late Jewish Literary Aramaic, Old Aramaic inscriptions, Imperial Aramaic. |
| **Format** | Web-based search interface. No documented API or bulk download. |
| **License** | Academic project at Hebrew Union College. No explicit open data license. |
| **Download** | **No bulk download available.** Web interface only. Partial incorporation into BibleWorks software. |
| **Size** | ~3 million parsed words |
| **RAG Viability** | **MEDIUM-LOW** - Would require scraping or institutional partnership. The Targum texts specifically are high value for Halacha AI. |

### Workarounds for Targum Access
- Sefaria already has Targum Onkelos and Targum Jonathan (check their API)
- The `mechon-mamre.org` site has some Targumim
- Academic request to CAL project for data export
- Logos Bible Software has "The Targums from the Files of the Comprehensive Aramaic Lexicon Project" (commercial)

### Integration Plan
1. Check Sefaria API first for Targum coverage
2. Contact CAL project at HUC for academic data sharing
3. Scraping as last resort (check ToS first)

---

## 7. Perseus Digital Library - Josephus & Philo

| Field | Details |
|-------|---------|
| **URL** | https://www.perseus.tufts.edu/ |
| **GitHub** | https://github.com/PerseusDL/canonical-greekLit |
| **Content** | Greek and English texts of Classical and Hellenistic literature including Josephus and Philo. |
| **Format** | **TEI XML** following CTS (Canonical Text Services) protocol. |
| **License** | **CC-BY-SA 4.0** (Creative Commons Attribution-ShareAlike). |
| **Download** | `git clone https://github.com/PerseusDL/canonical-greekLit` |
| **Size** | Full repo ~500MB+ (all Greek literature). Josephus/Philo subset much smaller. |
| **RAG Viability** | **VERY HIGH** - Structured XML, open license, well-maintained. |

### Josephus (TLG 0526)
CTS URN: `urn:cts:greekLit:tlg0526`
- `tlg0526.tlg001` - Antiquities of the Jews (Greek + English)
- `tlg0526.tlg004` - The Jewish War (Greek + English)
- Against Apion
- Life of Josephus

### Philo of Alexandria
Available in both Perseus canonical-greekLit and First1KGreek (see below).
- De Vita Mosis
- De Specialibus Legibus
- De Decalogo
- Legatio ad Gaium
- And many more treatises

### Scaife Viewer
Browse texts online: https://scaife.perseus.org/library/urn:cts:greekLit:tlg0526/

### Integration Plan
1. Clone canonical-greekLit repo
2. Extract Josephus files (tlg0526.*) and Philo files
3. Parse TEI XML to extract English translations and Greek text
4. Chunk by book/chapter/section for RAG

---

## 8. Open Greek and Latin / First1KGreek

| Field | Details |
|-------|---------|
| **URL** | https://www.opengreekandlatin.org/ |
| **GitHub** | https://github.com/OpenGreekAndLatin/First1KGreek |
| **Catalog** | https://opengreekandlatin.github.io/First1KGreek/ |
| **Content** | At least one edition of every Greek work composed between Homer and 250 CE. Focuses on texts not already in other open-source environments. Includes Philo and potentially Josephus. |
| **Format** | TEI XML |
| **License** | Open source (varies by text, mostly CC-BY-SA) |
| **Download** | `git clone https://github.com/OpenGreekAndLatin/First1KGreek` |
| **Size** | Large repo (thousands of texts) |
| **RAG Viability** | **HIGH** - Supplements Perseus with additional texts and editions. |

### Notes
- Harvard Center for Hellenic Studies project
- Useful for texts not in Perseus (additional Philo works, fragments)
- Also see: `github.com/pthu/greek_literature` - Text-Fabric conversion of all Perseus + First1KGreek texts

---

## 9. Nag Hammadi Library

| Field | Details |
|-------|---------|
| **URL (gnosis.org)** | http://www.gnosis.org/naghamm/nhl.html |
| **Codex Index** | http://www.gnosis.org/naghamm/nhlcodex.html |
| **Alpha Index** | http://www.gnosis.org/naghamm/nhlalpha.html |
| **Content** | 52 Gnostic treatises discovered 1945 in Nag Hammadi, Egypt. Includes Gospel of Thomas, Gospel of Philip, Gospel of Truth, Apocryphon of John, Thunder Perfect Mind, and more. 46 works in 55 versions across 13 codices. |
| **Format** | HTML pages on gnosis.org (individual texts as separate pages). English translations. |
| **License** | gnosis.org states materials are copyrighted. The Robinson translation (1977/1988) may still be under copyright. Coptic originals are public domain. |
| **Download** | No bulk download. Individual HTML pages can be saved. Internet Archive has PDF of "The Nag Hammadi Library in English" (James M. Robinson, ed.). |
| **Size** | ~52 texts, relatively compact |
| **RAG Viability** | **MEDIUM** - Relevance to Halacha is limited but provides important context for Second Temple Judaism and early Jewish-Christian interaction. |

### Alternative Sources
- Internet Archive: Full PDF of Robinson edition (borrow only)
- Brill Scholarly Editions: Coptic Gnostic Library Online (https://scholarlyeditions.brill.com/cglo/) - academic, likely paywalled
- Individual texts available on Early Christian Writings (earlychristianwritings.com)

### Relevance to Halacha AI
- Gospel of Thomas may preserve independent Jewish sayings traditions
- Apocryphon of John relates to Genesis interpretation traditions
- Some texts reference Jewish law and practice
- Low priority compared to DSS and Pseudepigrapha

---

## 10. Samaritan Pentateuch

| Field | Details |
|-------|---------|
| **Open Book Publishers** | https://www.openbookpublishers.com/books/10.11647/obp.0415 |
| **Internet Archive** | https://archive.org/details/samaritan_pentateuch (Benyamim Tsedaka edition) |
| **Internet Archive** | https://archive.org/details/IsraeliteSamaritanTorah (Israelite Samaritan Torah) |
| **StepBible** | https://www.stepbible.org/version.jsp?version=SPE (Samaritan Pentateuch in English) |
| **Cambridge Digital Library** | https://cudl.lib.cam.ac.uk/view/MS-ADD-01846 (MS Add.1846, earliest extant manuscript, 12th century) |
| **Content** | The Samaritan version of the Torah/Pentateuch. Differs from Masoretic Text in ~6,000 places. Some differences align with LXX or DSS readings. |
| **Format** | Open Book Publishers: PDF, EPUB, HTML (parallel Hebrew/English). Internet Archive: PDF, text. StepBible: online reader. |
| **License** | Open Book Publishers edition: **Open Access** (CC license). Tsedaka editions on Internet Archive vary. |
| **Size** | Single Torah-length text (~80,000 words Hebrew) |
| **RAG Viability** | **HIGH** - Important for textual comparison. Open access editions available. |

### Key Edition
- Moshe Florentin, "The Samaritan Pentateuch: An English Translation with a Parallel Annotated Hebrew Text" - based on MS Nablus 6 (1204 CE). Differences from MT marked in red. Open Access from Open Book Publishers.

### Integration Plan
1. Download Open Book Publishers PDF/EPUB
2. Extract parallel text (Samaritan Hebrew + English translation)
3. Create verse-level alignment with Masoretic Text
4. Use for variant reading annotations in Torah sections

---

## 11. Cairo Genizah Fragments

### 11a. Friedberg Genizah Project (FGP)

| Field | Details |
|-------|---------|
| **URL** | https://pr.genizah.org/ |
| **Content** | 739,868 digital images of genizah fragments from 60 libraries worldwide. The largest virtual collection of medieval Hebrew manuscripts. Includes catalog entries, bibliographical references, translations, transcriptions, and citations. |
| **Format** | Digital images with metadata. MARC tagging for cataloging. Web-based search and viewing. |
| **License** | Free access for research. No explicit open data license. |
| **Download** | **No bulk download or public API.** Web platform with search tools, "puzzle function" for connecting fragments, and visual recognition (wordspotting). Mobile app "Genazim" for viewing. |
| **Size** | 400,000+ images, 500,000+ data items |
| **Note** | Data is being migrated to the **Ktiv database** (National Library of Israel). |
| **RAG Viability** | **LOW** for direct ingestion. Image-based, no bulk text export. |

### 11b. Cambridge Taylor-Schechter Collection

| Field | Details |
|-------|---------|
| **URL** | https://cudl.lib.cam.ac.uk/collections/genizah |
| **Research Unit** | https://www.lib.cam.ac.uk/collections/departments/taylor-schechter-genizah-research-unit |
| **Content** | 193,000 manuscript fragments, mainly in Hebrew, Judaeo-Arabic, Aramaic, and Arabic. World's largest single collection of medieval Jewish manuscripts. |
| **Format** | High-resolution images with metadata on Cambridge Digital Library. Some transcriptions available through individual research projects. |
| **License** | Cambridge University Library. Images viewable online. |
| **Download** | Individual images downloadable from CUDL. No bulk text corpus. |
| **Size** | 193,000 fragments |
| **RAG Viability** | **LOW** for text, but HIGH scholarly value. Some specific fragments (e.g., Ben Sira, Damascus Document) have published transcriptions elsewhere. |

### Genizah Integration Strategy
- Focus on **published transcriptions** of major Genizah texts rather than raw fragments
- Key Genizah texts already available elsewhere:
  - Damascus Document (CD) - available via DSS sources
  - Ben Sira (Ecclesiasticus) - published critical editions exist
  - Maimonides autographs - specialized editions
  - Genizah halakhic fragments - published in academic journals
- For Halacha AI, published Genizah halakhic material is more useful than raw images

---

## 12. Church Fathers Referencing Jewish Texts

### 12a. CCEL - Ante-Nicene, Nicene, and Post-Nicene Fathers

| Field | Details |
|-------|---------|
| **URL** | https://ccel.org/fathers |
| **Content** | Complete digital edition of the Early Church Fathers series. 38 volumes total: Ante-Nicene Fathers (10 vols), Nicene & Post-Nicene Fathers Series 1 (14 vols), Series 2 (14 vols). |
| **Format** | HTML, **XML (ThML/Theological Markup Language)**, PDF, Word, plain text (UTF-8). XML URL pattern: `ccel.org/ccel/s/schaff/anf01.xml` |
| **License** | **Public domain** (original 1885-1890 editions). CCEL digital editions freely available. |
| **Download** | Individual volumes downloadable in multiple formats. XML files directly accessible. |
| **Size** | ~10 volumes ANF alone, each 500-1000 pages. Full set ~38 volumes. |
| **RAG Viability** | **HIGH** - Public domain, XML structured, bulk downloadable. |

### 12b. Key Texts for Jewish Law References

| Author | Work | Volume | Relevance |
|--------|------|--------|-----------|
| Justin Martyr | Dialogue with Trypho | ANF01 | Extended discussion of Jewish law with a Jewish interlocutor |
| Origen | Contra Celsum | ANF04 | References Jewish biblical interpretation |
| Origen | Commentary on Matthew/Romans | ANF/NPNF | Discusses Jewish law extensively |
| Tertullian | Adversus Judaeos | ANF03 | Direct engagement with Jewish legal arguments |
| Eusebius | Praeparatio Evangelica | NPNF2-01 | Preserves extensive quotes from Philo and other Jewish sources |
| Jerome | Commentary on Isaiah/Ezekiel | NPNF2-06 | Frequently cites Jewish traditions ("Hebraica veritas") |
| Epiphanius | Panarion | (partial in NPNF) | Describes Jewish-Christian sects, preserves otherwise lost texts |
| Aphrahat | Demonstrations | NPNF2-13 | Syriac Father engaging directly with Talmudic-era rabbis |
| Chrysostom | Adversus Judaeos | NPNF1-09 | Describes contemporary Jewish practices |

### 12c. Additional Sources

- **Internet Archive**: Complete Ante-Nicene + Nicene Fathers: https://archive.org/details/the-complete-ante-nicene-nicene-and-post-nicene-church-fathers
- **HolyBooks.com**: ANF Vols I-IX as PDF: https://www.holybooks.com/ante-nicene-fathers-vol-i-ix/
- **Early Christian Writings**: https://www.earlychristianwritings.com/ (links to online texts)
- **New Advent**: https://www.newadvent.org/fathers/ (HTML versions of all Fathers)

### Integration Plan
1. Download XML from CCEL for key volumes (ANF01, ANF03, ANF04 especially)
2. Extract sections that reference Jewish law, practice, or interpretation
3. Create a "Patristic Jewish References" sub-corpus
4. Cross-reference with Talmudic passages they discuss

---

## 13. Integration Priority Matrix

### Tier 1: Immediate Integration (high value, easy access)

| Source | Format | License | Effort |
|--------|--------|---------|--------|
| ETCBC/dss (Text-Fabric) | .tf (Python) | CC-BY-NC | Low - git clone + Python export |
| R.H. Charles Pseudepigrapha | PDF/text | Public domain | Low - download + parse |
| Perseus Josephus & Philo | TEI XML | CC-BY-SA 4.0 | Low - git clone + XML parse |
| Church Fathers (CCEL) | XML/PDF | Public domain | Medium - extract relevant sections |
| OCP Pseudepigrapha | TEI XML | Open source | Low - git clone + XML parse |

### Tier 2: Moderate Effort (high value, some complexity)

| Source | Format | License | Effort |
|--------|--------|---------|--------|
| SQE Database | MariaDB (Docker) | Open access | Medium - Docker + SQL export |
| Samaritan Pentateuch | PDF/EPUB | Open Access (CC) | Medium - OCR/parse parallel text |
| First1KGreek | TEI XML | CC-BY-SA | Medium - large repo, filter needed |
| Nag Hammadi (gnosis.org) | HTML | Copyrighted translations | Medium - scrape HTML + license issues |

### Tier 3: Requires Partnership/Special Access

| Source | Format | License | Effort |
|--------|--------|---------|--------|
| CAL Targumim | Web only | No open license | High - need institutional agreement |
| Leon Levy DSS Images | Web viewer | IAA restricted | High - no text export |
| Friedberg Genizah | Images + metadata | Restricted | High - no bulk text |
| Cambridge Genizah | Images | Cambridge UL | High - no bulk text |

### Estimated Total Corpus Size (Tier 1 + 2)

| Category | Estimated Words |
|----------|----------------|
| Dead Sea Scrolls (ETCBC + SQE) | ~500,000 |
| Pseudepigrapha (Charles + OCP) | ~400,000 |
| Josephus (all works) | ~500,000 |
| Philo (all works) | ~600,000 |
| Church Fathers (relevant sections) | ~200,000 |
| Samaritan Pentateuch | ~80,000 |
| Nag Hammadi (selected) | ~100,000 |
| **Total** | **~2.4 million words** |

---

## Quick-Start Commands

```bash
# 1. ETCBC Dead Sea Scrolls
git clone https://github.com/ETCBC/dss.git
pip install text-fabric

# 2. Online Critical Pseudepigrapha
git clone https://github.com/OnlineCriticalPseudepigrapha/Online-Critical-Pseudepigrapha.git

# 3. Perseus Greek Literature (Josephus, Philo)
git clone https://github.com/PerseusDL/canonical-greekLit.git

# 4. First1KGreek (additional Philo, etc.)
git clone https://github.com/OpenGreekAndLatin/First1KGreek.git

# 5. SQE Database (Docker)
docker pull [check Docker Hub for exact image name from SQE_Database repo]

# 6. R.H. Charles - download from Internet Archive
# Vol 1: https://archive.org/download/Charles_The-Apocrypha-of-the-Old-Testament-vol-1_1913/
# Vol 2: https://archive.org/download/Charles_The-Apocrypha-of-the-Old-Testament-vol-2_1913/

# 7. Church Fathers XML from CCEL
# ANF Volume 1: https://ccel.org/ccel/s/schaff/anf01.xml
# Pattern: https://ccel.org/ccel/s/schaff/anf{NN}.xml
```

---

## License Summary

| Source | License | Commercial Use |
|--------|---------|----------------|
| ETCBC/dss | CC-BY-NC | No (non-commercial only) |
| OCP | Open source (check repo) | Likely yes |
| R.H. Charles | Public domain | Yes |
| Perseus | CC-BY-SA 4.0 | Yes (with attribution + share-alike) |
| First1KGreek | CC-BY-SA (varies) | Yes (with attribution) |
| SQE | Open access | Check specific terms |
| CCEL/Church Fathers | Public domain | Yes |
| Samaritan Pentateuch (OBP) | CC (Open Access) | Check specific CC variant |
| Nag Hammadi (gnosis.org) | Copyrighted | No (without permission) |
| CAL | No open license | No |
| Leon Levy DSS | IAA restricted | No |

---

## Next Steps

1. **Clone Tier 1 repos** and begin parsing pipelines
2. **Build TEI XML parser** (reusable for Perseus, OCP, First1KGreek)
3. **Build Text-Fabric exporter** for ETCBC/dss
4. **Download R.H. Charles** from Internet Archive, build book-level splitter
5. **Set up SQE Docker** instance and explore database schema
6. **Contact CAL project** at HUC for academic data sharing agreement
7. **Create Patristic extract** from CCEL XML focusing on Jewish law references
8. **Check Sefaria coverage** of Targumim before pursuing CAL separately
