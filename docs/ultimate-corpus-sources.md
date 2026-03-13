# Ultimate Comprehensive Jewish Digital Library: Corpus Sources Report

*Compiled: March 2, 2026*
*Goal: Absolute completeness -- the most comprehensive Jewish digital library ever assembled*

---

## Table of Contents

1. [Already Integrated](#already-integrated)
2. [Category 1: Dead Sea Scrolls / Qumran](#category-1-dead-sea-scrolls--qumran)
3. [Category 2: Kabbalah & Mysticism](#category-2-kabbalah--mysticism)
4. [Category 3: Talismans & Practical Kabbalah](#category-3-talismans--practical-kabbalah)
5. [Category 4: Pseudepigrapha & Apocrypha](#category-4-pseudepigrapha--apocrypha)
6. [Category 5: Samaritan Texts](#category-5-samaritan-texts)
7. [Category 6: Karaite Texts](#category-6-karaite-texts)
8. [Category 7: Genizah Materials](#category-7-genizah-materials)
9. [Category 8: Responsa Literature](#category-8-responsa-literature)
10. [Category 9: Manuscripts & Rare Prints](#category-9-manuscripts--rare-prints)
11. [Category 10: Targumim](#category-10-targumim)
12. [Category 11: Liturgy](#category-11-liturgy)
13. [Category 12: Philosophy & Ethics](#category-12-philosophy--ethics)
14. [Category 13: Biblical Manuscripts & Versions](#category-13-biblical-manuscripts--versions)
15. [Category 14: Commentaries](#category-14-commentaries)
16. [Category 15: Academic & Scholarly](#category-15-academic--scholarly)
17. [Category 16: Modern Halakhic](#category-16-modern-halakhic)
18. [Category 17: Chassidic Texts](#category-17-chassidic-texts)
19. [Category 18: Translations](#category-18-translations)
20. [Category 19: Audio/Video](#category-19-audiovideo)
21. [Category 20: Related Ancient Texts](#category-20-related-ancient-texts)
22. [TOP 10 Highest-Impact Sources to Integrate Next](#top-10-highest-impact-sources-to-integrate-next)
23. [Master Source Summary Table](#master-source-summary-table)

---

## Already Integrated

### Sefaria-Export (COMPLETE)
- **Status:** Ingested, 4M+ chunks
- **Content:** Tanakh, Mishnah, Talmud Bavli (William Davidson edition), Talmud Yerushalmi (partial), Midrash Rabbah (all), Tanchuma, Sifra, Sifrei, Mechilta, Tosefta, Zohar + Zohar Chadash + Tikkunei Zohar, Mishneh Torah, Shulchan Arukh (all 4 sections with Rema), Mishnah Berurah, Tur + Beit Yosef, Rishonim on Talmud (Rashba, Ritva, Ran, Meiri, Rosh, Nimukei Yosef), Responsa collections (Rashba, Rosh, Ran, Rivash, Rambam), Kabbalistic works (Sefer Yetzirah, Bahir, Heikhalot Rabbati, Etz Chaim, complete Sha'arim of Arizal, Pardes Rimmonim, Zohar commentaries including Sulam), ~95 Chassidic works, Musar collection, Jewish Thought works

### Otzaria (PARTIAL)
- **Status:** Partial integration
- **Content:** Kabbalah, Chasidut, Jewish Thought, Musar texts from Dicta and Torat Emet sources not on Sefaria

---

## Category 1: Dead Sea Scrolls / Qumran

### 1.1 Leon Levy Dead Sea Scrolls Digital Library

| Field | Details |
|-------|---------|
| **Name** | Leon Levy Dead Sea Scrolls Digital Library |
| **Description** | Complete digitization of the Dead Sea Scrolls collection -- 930+ manuscripts, 25,000+ fragments with multi-spectral imaging. Partnership between Israel Antiquities Authority (IAA) and Google. |
| **URL** | https://www.deadseascrolls.org.il |
| **Format** | High-resolution multi-spectral images; web interface with search. No bulk download API. |
| **Estimated Size** | 930 manuscripts, 25,000+ fragment images |
| **Languages** | Hebrew, Aramaic, Greek (original manuscripts); English (interface/metadata) |
| **License** | Free access for viewing. Images copyrighted by IAA. Reuse requires permission. |
| **Priority** | 2 (Important) |
| **Integration Difficulty** | Hard -- images only, no parsed text. Requires OCR or academic transcription pairing. |

### 1.2 Scripta Qumranica Electronica (SQE)

| Field | Details |
|-------|---------|
| **Name** | Scripta Qumranica Electronica |
| **Description** | Digital scholarly editions platform for Dead Sea Scrolls. Combines IAA images with Qumran Worterbuch (QWB) database -- full transcriptions with lexical, morphological, and bibliographical data. German-Israeli cooperation (DIP/DFG funded). |
| **URL** | https://www.qumranica.org / https://sqe.deadseascrolls.org.il |
| **API** | YES -- SQE_API on GitHub (https://github.com/Scripta-Qumranica-Electronica/SQE_API). Public API + Scrollery-specific API. Database also on GitHub (https://github.com/Scripta-Qumranica-Electronica/SQE_Database). |
| **Format** | JSON via API, MySQL database dump |
| **Estimated Size** | All DSS transcriptions with variant readings, lexical parsing |
| **Languages** | Hebrew, Aramaic, Greek; English metadata |
| **License** | Free/open access for research. Code open source. |
| **Priority** | 1 (Essential) |
| **Integration Difficulty** | Medium -- has API and database dump, but complex data structure |

### 1.3 Orion Center for Study of the Dead Sea Scrolls

| Field | Details |
|-------|---------|
| **Name** | Orion Center, Hebrew University |
| **Description** | Academic hub for DSS research. Maintains comprehensive online bibliography, links to digital resources, and scholarly tools. |
| **URL** | http://orion.huji.ac.il/resources/DSS_online.shtml |
| **Format** | HTML, bibliographic data |
| **Estimated Size** | Bibliography and resource links |
| **Languages** | English, Hebrew |
| **License** | Free access |
| **Priority** | 3 (Nice-to-have -- reference/bibliography) |
| **Integration Difficulty** | Easy -- metadata only |

### 1.4 Dead Sea Scrolls Electronic Library (Brill)

| Field | Details |
|-------|---------|
| **Name** | Dead Sea Scrolls Electronic Library -- Biblical Texts |
| **Description** | Complete Hebrew transcription and English translation of all biblical and non-biblical DSS texts with high-resolution images. Published by Brill. |
| **URL** | https://scholarlyeditions.brill.com/dsbo/ |
| **Format** | Web-based scholarly edition |
| **Estimated Size** | Entire DSS corpus with transcriptions |
| **Languages** | Hebrew, Aramaic, English |
| **License** | PAID subscription (Brill institutional/individual). Copyrighted. |
| **Priority** | 2 (Important but blocked by licensing) |
| **Integration Difficulty** | Hard -- commercial, no API |

### 1.5 Dead Sea Scrolls Translations (Archive.org)

| Field | Details |
|-------|---------|
| **Name** | "The Dead Sea Scrolls Translated" (Florentino Garcia Martinez) |
| **Description** | Complete English translation of all non-biblical Qumran texts including Temple Scroll, Damascus Document, Community Rule, War Scroll, pesharim, and sectarian texts. |
| **URL** | https://archive.org/details/B-001-001-920 |
| **Format** | PDF |
| **Languages** | English |
| **License** | Copyrighted work; available on Archive.org for borrowing |
| **Priority** | 2 (Important) |
| **Integration Difficulty** | Medium -- PDF requires OCR |

---

## Category 2: Kabbalah & Mysticism

*Note: See KABBALAH-RESOURCES.md for the complete gap analysis. Below are the SOURCES to fill those gaps.*

### 2.1 HebrewBooks.org -- Kabbalistic Works

| Field | Details |
|-------|---------|
| **Name** | HebrewBooks.org Kabbalah Collection |
| **Description** | Thousands of scanned kabbalistic texts including all major works not on Sefaria: Sefer HaTemunah, Sefer HaPeliah, Emek HaMelekh, Adir BaMarom (Ramchal), additional Arizal/Vital works (Otzrot Chaim, Mevo She'arim, Etz HaDaat Tov), Ramak works (Eilima Rabbati, Or Yakar 16 vols), Leshem Shevo VeAchlama, Komarna Rebbe works, GRA kabbalistic commentaries. |
| **URL** | https://hebrewbooks.org |
| **Format** | PDF (scanned pages, some with OCR layer) |
| **Estimated Size** | 500+ kabbalistic volumes |
| **Languages** | Hebrew, Aramaic |
| **License** | Free access; individual copyright varies but most pre-1928 texts are public domain |
| **Priority** | 1 (Essential -- fills major gaps) |
| **Integration Difficulty** | Hard -- requires OCR pipeline (Dicta recommended) |

**Key texts available with confirmed HebrewBooks IDs:**
- Sefer HaPeliah + HaKanah: ID 6355
- Megaleh Amukot: ID 33146, 33148
- Etz Chaim (Vital): ID 14183
- Reshit Chokhmah: ID 14032

### 2.2 Kabbalah.info (Bnei Baruch)

| Field | Details |
|-------|---------|
| **Name** | Kabbalah.info -- Ashlag/Rabash Texts |
| **Description** | Complete works of Baal HaSulam (R. Yehuda Ashlag) and Rabash (R. Baruch Ashlag) with translations. Includes Shamati ("I Heard"), additional TES commentary, Pri Chakham letters, and Rabash articles not on Sefaria. |
| **URL** | https://www.kabbalah.info |
| **Format** | HTML |
| **Estimated Size** | ~50-100 texts |
| **Languages** | Hebrew, English, Russian, Spanish (40+ languages) |
| **License** | Free educational use; verify terms for RAG integration |
| **Priority** | 2 (Important -- unique Ashlag school content) |
| **Integration Difficulty** | Medium -- HTML scraping, need to verify ToS |

### 2.3 Sefer Yetzirah Commentaries (Multiple Sources)

| Field | Details |
|-------|---------|
| **Name** | Complete Sefer Yetzirah Commentary Tradition |
| **Description** | Commentaries NOT on Sefaria: R. Saadia Gaon, R. Yehuda Barceloni, R. Elazar of Worms, R. Moshe Botarel, R. Shabbatai Donnolo. Available across HebrewBooks and academic editions. |
| **URL** | HebrewBooks.org (search by title), academic publishers |
| **Format** | PDF (HebrewBooks), various |
| **Languages** | Hebrew, Aramaic, Judeo-Arabic (Saadia) |
| **License** | Public domain (all pre-1928) |
| **Priority** | 2 (Important) |
| **Integration Difficulty** | Hard -- scattered across sources, OCR needed |

### 2.4 Hekhalot/Merkavah Literature

| Field | Details |
|-------|---------|
| **Name** | Hekhalot Literature Corpus |
| **Description** | Beyond Heikhalot Rabbati (on Sefaria): Hekhalot Zutarti, Ma'aseh Merkavah, Merkavah Rabba, Shi'ur Komah, 3 Enoch/Sefer Hekhalot, Sar Torah, Re'uyot Yehezkel. Academic edition by Peter Schafer (Synopse zur Hekhalot-Literatur) is the standard text. |
| **URL** | HebrewBooks.org; academic editions (Schafer: TSAJ series, Mohr Siebeck); Archive.org for older editions |
| **Format** | PDF (HebrewBooks), academic print (Schafer) |
| **Estimated Size** | ~15-20 major texts |
| **Languages** | Hebrew, Aramaic |
| **License** | Original texts: public domain. Schafer edition: copyrighted. |
| **Priority** | 2 (Important) |
| **Integration Difficulty** | Hard -- academic editions copyrighted; need public domain versions |

### 2.5 Abulafia Corpus (Expanded)

| Field | Details |
|-------|---------|
| **Name** | Complete Abraham Abulafia Works |
| **Description** | Beyond the 5 works on Sefaria: Chayei HaOlam HaBa, Imrei Shefer, Sefer HaOt, Mafteach HaRa'ayon, Sitrei Torah, Otzar Eden Ganuz, Galei Razaya. Most from manuscripts (Vatican, Oxford, Paris). Published collected editions by Amnon Gross. |
| **URL** | HebrewBooks.org, NLI/Ktiv manuscripts, academic editions |
| **Format** | PDF, manuscript images |
| **Languages** | Hebrew |
| **License** | Public domain (medieval texts) |
| **Priority** | 2 (Important) |
| **Integration Difficulty** | Hard -- many from manuscripts requiring specialized transcription |

---

## Category 3: Talismans & Practical Kabbalah

### 3.1 Sefer Raziel HaMalakh

| Field | Details |
|-------|---------|
| **Name** | Sefer Raziel HaMalakh |
| **Description** | Major grimoire of Practical Kabbalah (published 1701 Amsterdam). Contains angel names, magical seals, prayers, and cosmological teachings. Multiple recensions exist. |
| **URL** | https://www.emol.org/kabbalah/seferraziel/ (free text download), https://hebrewbooks.org (scanned editions), https://archive.org/details/sepherrezialheme00stev (Savedow English translation), https://openn.library.upenn.edu/Data/0002/html/mscodex1674.html (UPenn manuscript) |
| **Format** | HTML (emol.org), PDF (HebrewBooks, Archive.org), manuscript images (OPenn) |
| **Estimated Size** | 1 major work with multiple sections (7 books) |
| **Languages** | Hebrew, Aramaic; English translations available |
| **License** | Public domain (first printed 1701). UPenn manuscript: free of copyright restrictions. |
| **Priority** | 2 (Important) |
| **Integration Difficulty** | Easy (emol.org text) to Medium (manuscript variants) |

### 3.2 Shimmush Tehillim

| Field | Details |
|-------|---------|
| **Name** | Sefer Shimmush Tehillim (Magical Use of Psalms) |
| **Description** | Late antique/early medieval manual assigning magical purposes to biblical psalms. Attributed to Hai Gaon. Multiple manuscript traditions. |
| **URL** | https://halakhah.com/rst/tehillim.pdf (PDF), https://archive.org/details/ShimushTehillimEliasKleinBekescsaba1936 (1936 edition on Archive.org) |
| **Format** | PDF |
| **Languages** | Hebrew |
| **License** | Public domain |
| **Priority** | 3 (Nice-to-have) |
| **Integration Difficulty** | Medium -- PDF/OCR |

### 3.3 Sefer HaRazim

| Field | Details |
|-------|---------|
| **Name** | Sefer HaRazim (Book of Mysteries) |
| **Description** | Jewish magical text from late antiquity describing angelic hierarchies and magical practices. Critical edition by Mordechai Margalioth (1966). |
| **URL** | HebrewBooks.org (search "ספר הרזים"), Archive.org |
| **Format** | PDF |
| **Languages** | Hebrew, Greek loanwords |
| **License** | Original text: public domain. Margalioth edition: likely copyrighted. |
| **Priority** | 3 (Nice-to-have) |
| **Integration Difficulty** | Medium -- need public domain edition |

### 3.4 Harba de-Moshe (Sword of Moses)

| Field | Details |
|-------|---------|
| **Name** | Harba de-Moshe (Sword of Moses) |
| **Description** | Medieval Jewish magical text containing divine names and incantations. Published by Moses Gaster (1896). |
| **URL** | Archive.org (Gaster edition), HebrewBooks.org |
| **Format** | PDF |
| **Languages** | Hebrew, Aramaic |
| **License** | Public domain (Gaster edition 1896) |
| **Priority** | 3 (Nice-to-have) |
| **Integration Difficulty** | Medium -- OCR of old print |

### 3.5 Practical Kabbalah Manuscript Collections

| Field | Details |
|-------|---------|
| **Name** | Amulet texts, segulot collections, practical kabbalah manuscripts |
| **Description** | Scattered across NLI/Ktiv, British Library, Bodleian, and Genizah collections. Include protective amulet formulas, healing texts, dream interpretation manuals. |
| **URL** | https://ktiv.nli.org.il, https://cudl.lib.cam.ac.uk/collections/genizah |
| **Format** | Manuscript images |
| **Languages** | Hebrew, Aramaic, Judeo-Arabic |
| **License** | Free access for research; varies by collection |
| **Priority** | 3 (Nice-to-have) |
| **Integration Difficulty** | Very Hard -- manuscripts requiring paleographic expertise |

---

## Category 4: Pseudepigrapha & Apocrypha

### 4.1 Online Critical Pseudepigrapha (OCP)

| Field | Details |
|-------|---------|
| **Name** | Online Critical Pseudepigrapha |
| **Description** | Free-access critical editions of Old Testament Pseudepigrapha. Includes 1 Enoch, 2 Baruch, and growing collection of additional texts with full critical apparatus. |
| **URL** | https://pseudepigrapha.org |
| **Format** | HTML (web-based critical editions) |
| **Estimated Size** | Growing collection; 15+ texts |
| **Languages** | Original languages (Ethiopic, Syriac, Greek, Hebrew) with English translations |
| **License** | Free access, academic |
| **Priority** | 1 (Essential) |
| **Integration Difficulty** | Medium -- HTML scraping, well-structured |

### 4.2 Pseudepigrapha.com Collection

| Field | Details |
|-------|---------|
| **Name** | Pseudepigrapha.com |
| **Description** | Comprehensive collection of pseudepigraphic texts in English translation. Includes 1 Enoch, 2 Enoch (Secrets of Enoch), 2 Baruch, Jubilees, Testaments of the Twelve Patriarchs, 4 Ezra, Psalms of Solomon, Letter of Aristeas, and many more. |
| **URL** | https://www.pseudepigrapha.com |
| **Format** | HTML |
| **Estimated Size** | 50+ texts |
| **Languages** | English (translations from Charles, Charlesworth editions) |
| **License** | Older translations (R.H. Charles 1913) are public domain |
| **Priority** | 2 (Important) |
| **Integration Difficulty** | Easy -- static HTML pages |

### 4.3 Charlesworth Old Testament Pseudepigrapha (Archive.org)

| Field | Details |
|-------|---------|
| **Name** | The Old Testament Pseudepigrapha, Vols. 1-2 (James H. Charlesworth, ed.) |
| **Description** | The standard scholarly collection. Vol. 1: Apocalyptic Literature and Testaments. Vol. 2: Expansions of the OT, Wisdom/Philosophical Literature, Prayers/Psalms/Odes, Fragments. 65 pseudepigraphic documents total. |
| **URL** | https://archive.org/details/the-old-testament-pseudepigrapha-vol.-1-charlesworth-1983 |
| **Format** | PDF |
| **Estimated Size** | ~1,800 pages across 2 volumes, 65 texts |
| **Languages** | English translations with original language notes |
| **License** | Copyrighted (Doubleday 1983/1985). Available on Archive.org for controlled digital lending. |
| **Priority** | 2 (Important -- but copyrighted) |
| **Integration Difficulty** | Hard -- copyrighted, PDF format |

### 4.4 R.H. Charles Apocrypha and Pseudepigrapha (Public Domain)

| Field | Details |
|-------|---------|
| **Name** | The Apocrypha and Pseudepigrapha of the Old Testament (R.H. Charles, 1913) |
| **Description** | Classic two-volume scholarly edition. Vol. 1: Apocrypha (1 Esdras, Tobit, Judith, Additions to Esther/Daniel, Wisdom of Solomon, Ben Sira/Ecclesiasticus, Baruch, Letter of Jeremiah, 1-4 Maccabees). Vol. 2: Pseudepigrapha (Jubilees, 1 Enoch, Testaments of XII Patriarchs, Sibylline Oracles, Assumption of Moses, 2 Baruch, 4 Ezra, Psalms of Solomon, many more). |
| **URL** | https://archive.org/details/apocryphapseudep0002unse_e0a8, https://sacred-texts.com |
| **Format** | PDF (Archive.org), HTML (sacred-texts.com) |
| **Estimated Size** | 1,500+ pages, 40+ texts |
| **Languages** | English |
| **License** | PUBLIC DOMAIN (1913 publication) |
| **Priority** | 1 (Essential -- public domain comprehensive collection) |
| **Integration Difficulty** | Easy (sacred-texts HTML) to Medium (Archive.org PDF/OCR) |

### 4.5 Sefaria Apocrypha Section

| Field | Details |
|-------|---------|
| **Name** | Sefaria Second Temple / Apocrypha |
| **Description** | Some Second Temple texts already in Sefaria-Export including Ben Sira fragments. |
| **URL** | https://www.sefaria.org/texts |
| **Format** | JSON (already in Sefaria-Export) |
| **Languages** | Hebrew, English |
| **License** | CC licenses |
| **Priority** | 1 (Essential -- already partially integrated) |
| **Integration Difficulty** | Easy -- already in pipeline |

### 4.6 NETS (New English Translation of the Septuagint) Apocrypha

| Field | Details |
|-------|---------|
| **Name** | NETS Apocryphal/Deuterocanonical books |
| **Description** | Modern scholarly English translations of all LXX books including Tobit, Judith, Additions to Esther, Wisdom of Solomon, Sirach, Baruch, Letter of Jeremiah, Additions to Daniel (Susanna, Bel and the Dragon), 1-4 Maccabees, 1 Esdras. |
| **URL** | https://ccat.sas.upenn.edu/nets/ |
| **Format** | PDF downloads |
| **Languages** | English |
| **License** | Free for personal/academic use |
| **Priority** | 2 (Important) |
| **Integration Difficulty** | Easy -- PDF downloads available |

---

## Category 5: Samaritan Texts

### 5.1 Samaritan Pentateuch -- Tal/Florentin Critical Edition

| Field | Details |
|-------|---------|
| **Name** | The Samaritan Pentateuch: An English Translation with Parallel Annotated Hebrew Text |
| **Description** | Critical scholarly edition based on MS Nablus 6 (1204 CE), one of the most ancient Samaritan Pentateuch manuscripts. Parallel Hebrew text with English translation by Abraham Tal and Moshe Florentin. |
| **URL** | https://www.openbookpublishers.com/books/10.11647/obp.0415 (Open Book Publishers), https://archive.org/details/c626ab74-3df2-4291-a871-030f76c129b5 |
| **Format** | PDF, EPUB, HTML (Open Access) |
| **Languages** | Samaritan Hebrew, English |
| **License** | Open Access |
| **Priority** | 2 (Important) |
| **Integration Difficulty** | Easy -- open access PDF/EPUB |

### 5.2 Samaritan Pentateuch Digital Text (STEP Bible)

| Field | Details |
|-------|---------|
| **Name** | Samaritan Pentateuch English (SPE) on STEP Bible |
| **Description** | Digital English translation of the Samaritan Pentateuch. |
| **URL** | https://www.stepbible.org/version.jsp?version=SPE |
| **Format** | Web-based, downloadable via STEPBible-Data |
| **Languages** | English |
| **License** | CC-BY 4.0 (STEPBible data) |
| **Priority** | 2 (Important) |
| **Integration Difficulty** | Easy |

### 5.3 Cambridge Samaritan Pentateuch Manuscript

| Field | Details |
|-------|---------|
| **Name** | Cambridge Add.1846 -- Earliest Samaritan Pentateuch MS |
| **Description** | Believed to be the earliest extant manuscript of the Samaritan Pentateuch (early 12th century CE). Fully digitized. |
| **URL** | https://cudl.lib.cam.ac.uk/view/MS-ADD-01846 |
| **Format** | High-resolution manuscript images (IIIF) |
| **Languages** | Samaritan Hebrew |
| **License** | Free access for research |
| **Priority** | 3 (Nice-to-have -- manuscript images) |
| **Integration Difficulty** | Very Hard -- manuscript images, no text |

### 5.4 Samaritan Targum and Chronicles

| Field | Details |
|-------|---------|
| **Name** | Samaritan Aramaic Targum, Samaritan Chronicles (Tulida, Chronicle II) |
| **Description** | Aramaic translation of the Samaritan Pentateuch, plus Samaritan historical chronicles and liturgical texts. Scattered across academic publications and manuscript collections. |
| **URL** | HebrewBooks.org (search), academic publishers, manuscript collections |
| **Format** | PDF, manuscript images |
| **Languages** | Samaritan Aramaic, Arabic, Samaritan Hebrew |
| **License** | Academic editions copyrighted; original texts public domain |
| **Priority** | 3 (Nice-to-have) |
| **Integration Difficulty** | Very Hard -- specialized, scattered |

---

## Category 6: Karaite Texts

### 6.1 Karaite Anthology (Leon Nemoy)

| Field | Details |
|-------|---------|
| **Name** | Karaite Anthology: Excerpts from the Early Literature |
| **Description** | Translated excerpts from major Karaite authors including Anan ben David (Sefer HaMitzvot fragments), Benjamin al-Nahawendi, Daniel al-Qumisi, Sahl ben Masliah, Yaqub al-Qirqisani (Kitab al-Anwar), Yefet ben Ali. |
| **URL** | Archive.org, academic libraries |
| **Format** | PDF |
| **Languages** | English translations from Hebrew, Judeo-Arabic |
| **License** | Copyrighted (Yale Judaica Series, 1952) |
| **Priority** | 2 (Important) |
| **Integration Difficulty** | Medium -- copyrighted PDF |

### 6.2 Karaite Halakhic Works on HebrewBooks/NLI

| Field | Details |
|-------|---------|
| **Name** | Karaite Legal Literature |
| **Description** | Anan ben David's Sefer HaMitzvot fragments, Aaron ben Elijah's Gan Eden (Karaite legal code), Elijah Bashyazi's Aderet Eliyahu. |
| **URL** | HebrewBooks.org, NLI Ktiv manuscripts, Genizah fragments |
| **Format** | PDF, manuscript images |
| **Languages** | Hebrew, Judeo-Arabic |
| **License** | Public domain (medieval texts) |
| **Priority** | 3 (Nice-to-have) |
| **Integration Difficulty** | Hard -- manuscripts, OCR, Judeo-Arabic |

### 6.3 Karaite Siddur

| Field | Details |
|-------|---------|
| **Name** | Karaite Prayer Book |
| **Description** | Karaite liturgical texts differ significantly from Rabbanite versions. Multiple traditions exist. |
| **URL** | Karaite Jews of America website, academic editions |
| **Format** | PDF, HTML |
| **Languages** | Hebrew |
| **License** | Varies |
| **Priority** | 3 (Nice-to-have) |
| **Integration Difficulty** | Medium |

---

## Category 7: Genizah Materials

### 7.1 Friedberg Genizah Project (FGP)

| Field | Details |
|-------|---------|
| **Name** | Friedberg Genizah Project |
| **Description** | Centralized database of 739,868 digital images of Cairo Genizah fragments from 60 libraries worldwide. The most comprehensive Genizah resource. Now enhanced by the MiDRASH project (2023-2029, EU ERC funded, 10M euros) which has produced first machine-readable transcriptions of the full corpus using AI. |
| **URL** | https://genizah.org, https://pr.genizah.org |
| **Format** | High-resolution images, metadata, emerging machine transcriptions |
| **Estimated Size** | 739,868 images, ~400,000 fragments |
| **Languages** | Hebrew, Aramaic, Judeo-Arabic |
| **License** | Free access for research (registration required via FJMS) |
| **Priority** | 1 (Essential) |
| **Integration Difficulty** | Hard -- primarily images; MiDRASH transcriptions may change this |

### 7.2 Cambridge Genizah Collection (Cambridge Digital Library)

| Field | Details |
|-------|---------|
| **Name** | Taylor-Schechter Cairo Genizah Collection |
| **Description** | World's largest single Genizah collection -- 193,000 manuscripts. 21,000+ fragments digitized and online, with hundreds added monthly. Includes halakhic fragments, liturgy, biblical texts, letters, business documents. |
| **URL** | https://cudl.lib.cam.ac.uk/collections/genizah |
| **Format** | High-resolution images, IIIF API |
| **Estimated Size** | 193,000 manuscripts; 21,000+ digitized |
| **Languages** | Hebrew, Aramaic, Judeo-Arabic |
| **License** | Free access for research |
| **Priority** | 2 (Important) |
| **Integration Difficulty** | Hard -- images, no bulk text |

### 7.3 Princeton Geniza Lab

| Field | Details |
|-------|---------|
| **Name** | Princeton Geniza Lab |
| **Description** | Academic project cataloging and studying Genizah documents. Works with Friedberg Genizah Project data. |
| **URL** | https://dpul.princeton.edu/cairo_geniza |
| **Format** | Catalog metadata, images |
| **Languages** | English metadata, Hebrew/Arabic/Judeo-Arabic originals |
| **License** | Academic access |
| **Priority** | 3 (Nice-to-have) |
| **Integration Difficulty** | Hard |

---

## Category 8: Responsa Literature

### 8.1 Bar-Ilan Responsa Project (Global Jewish Database)

| Field | Details |
|-------|---------|
| **Name** | Bar-Ilan Responsa Project |
| **Description** | The gold standard. 200+ million words. Most complete digital collection of Jewish legal literature. Includes complete Tanakh with commentaries, both Talmuds, all Midrash, Zohar, Mishneh Torah, Shulchan Aruch with ALL commentaries, massive responsa collection, Talmudic Encyclopedia, 360,000+ cross-references. |
| **URL** | https://www.responsa.co.il |
| **Format** | Proprietary web interface, searchable text |
| **Estimated Size** | 200+ million words |
| **Languages** | Hebrew, Aramaic |
| **License** | PAID -- USB/download ~$1,300. Institutional pricing varies. |
| **Priority** | 1 (Essential content, but BLOCKED by licensing) |
| **Integration Difficulty** | Very Hard -- commercial, no API, explicit redistribution prohibition |

### 8.2 HebrewBooks.org Responsa Collection

| Field | Details |
|-------|---------|
| **Name** | HebrewBooks.org Responsa Volumes |
| **Description** | Thousands of scanned responsa collections including: Igrot Moshe (8 vols), Yabia Omer (10 vols), Tzitz Eliezer (22 vols), Minchat Yitzchak (10 vols), Shevet HaLevi (10 vols), Chelkat Yaakov, Teshuvot VeHanhagot, hundreds more. |
| **URL** | https://hebrewbooks.org |
| **Format** | PDF (scanned pages) |
| **Estimated Size** | 5,000+ responsa volumes |
| **Languages** | Hebrew |
| **License** | Free access; copyright varies (modern responsa still under copyright) |
| **Priority** | 1 (Essential) |
| **Integration Difficulty** | Hard -- OCR pipeline needed for each volume |

### 8.3 Otzar HaChochmah

| Field | Details |
|-------|---------|
| **Name** | Otzar HaChochmah (Treasury of Wisdom) |
| **Description** | World's largest digital Judaica library: 156,000+ volumes. Page-image based with search. Comprehensive responsa coverage. |
| **URL** | https://www.otzar.org |
| **Format** | Page images with search overlay |
| **Estimated Size** | 156,000+ volumes |
| **Languages** | Hebrew, Aramaic, Yiddish |
| **License** | PAID subscription. Terms explicitly prohibit public redistribution. |
| **Priority** | 2 (Important content, BLOCKED by licensing) |
| **Integration Difficulty** | Very Hard -- commercial, explicit prohibition |

### 8.4 DBS (Darchei Breslov Software)

| Field | Details |
|-------|---------|
| **Name** | DBS Torah Database |
| **Description** | Rivals Bar-Ilan in size. Strong in Jewish philosophy, Musar, and some areas of responsa. |
| **URL** | Various -- search DBS Torah software |
| **Format** | Proprietary software |
| **Languages** | Hebrew |
| **License** | PAID |
| **Priority** | 3 (Nice-to-have -- overlaps with other sources) |
| **Integration Difficulty** | Hard -- proprietary |

### 8.5 CCAR Reform Responsa

| Field | Details |
|-------|---------|
| **Name** | Central Conference of American Rabbis Responsa |
| **Description** | Complete collection of Reform movement responsa. |
| **URL** | https://www.ccarnet.org/rabbinic-voice/reform-responsa/ |
| **Format** | HTML, PDF/EPUB ebooks |
| **Languages** | English |
| **License** | Published by CCAR Press; copyright restrictions likely |
| **Priority** | 3 (Nice-to-have) |
| **Integration Difficulty** | Medium |

### 8.6 Conservative (Masorti) Responsa

| Field | Details |
|-------|---------|
| **Name** | Rabbinical Assembly Responsa |
| **Description** | Committee on Jewish Law and Standards (CJLS) responsa and the Schechter Institute publications. |
| **URL** | https://www.rabbinicalassembly.org |
| **Format** | Web/PDF |
| **Languages** | English, Hebrew |
| **License** | Varies |
| **Priority** | 3 (Nice-to-have) |
| **Integration Difficulty** | Medium |

---

## Category 9: Manuscripts & Rare Prints

### 9.1 Ktiv -- National Library of Israel Manuscripts

| Field | Details |
|-------|---------|
| **Name** | Ktiv: International Collection of Digitized Hebrew Manuscripts |
| **Description** | Largest digital collection of Hebrew manuscripts: 4.5 million images from 45,000 manuscripts. Includes Leningrad Codex, Maimonides autographs, Aleppo Codex fragments, oldest Talmud manuscripts, prayer books, biblical texts, Kabbalah, philosophy, science. Joint venture of Friedberg/FJMS and NLI. |
| **URL** | https://ktiv.nli.org.il |
| **Format** | High-resolution manuscript images, catalog metadata |
| **Estimated Size** | 4.5 million images, 45,000 manuscripts |
| **Languages** | Hebrew, Aramaic, Yiddish, Ladino, Judeo-Arabic |
| **License** | Free access (registration via FJMS). Image reuse terms vary. |
| **Priority** | 1 (Essential) |
| **Integration Difficulty** | Very Hard -- images only, no parsed text at scale |

### 9.2 British Library Hebrew Manuscripts (Polonsky Project)

| Field | Details |
|-------|---------|
| **Name** | British Library Digitised Hebrew Manuscripts |
| **Description** | ~800 fully digitized Hebrew manuscripts (435,000 images), possibly the finest Hebrew manuscript collection in the world. Includes Hispano-Moresque Haggadah (13th c.), illustrated Maimonides Code of Law (15th c.), Lisbon Bible (1482). Funded by Polonsky Foundation. |
| **URL** | https://www.bl.uk/manuscripts/ (Digitised Manuscripts viewer) |
| **Format** | High-resolution images |
| **Estimated Size** | 800+ manuscripts, 435,000 images |
| **Languages** | Hebrew, Aramaic, Yiddish |
| **License** | Free access for research |
| **Priority** | 2 (Important) |
| **Integration Difficulty** | Very Hard -- images only |

### 9.3 Bodleian Library Hebrew Manuscripts (Oxford)

| Field | Details |
|-------|---------|
| **Name** | Digital Bodleian Hebrew Collection |
| **Description** | Nearly 800 fully-digitized Hebrew manuscripts and printed books from medieval/early modern periods. Combined Polonsky Foundation Digitization Project with Vatican Library. Regarded as one of the best Hebrew manuscript collections globally. |
| **URL** | https://digital.bodleian.ox.ac.uk/collections/hebrew/, https://bav.bodleian.ox.ac.uk/ |
| **Format** | High-resolution images (IIIF) |
| **Estimated Size** | 800 manuscripts |
| **Languages** | Hebrew, Aramaic, Yiddish |
| **License** | Free access, CC-BY-NC-SA for images |
| **Priority** | 2 (Important) |
| **Integration Difficulty** | Very Hard -- images only |

### 9.4 Vatican Library Hebrew Manuscripts (DigiVatLib)

| Field | Details |
|-------|---------|
| **Name** | Biblioteca Apostolica Vaticana -- Hebrew Manuscripts |
| **Description** | Major collection of Hebrew manuscripts. Part of Polonsky digitization project with Bodleian. |
| **URL** | https://digi.vatlib.it/ |
| **Format** | High-resolution manuscript images (IIIF) |
| **Estimated Size** | Hundreds of Hebrew manuscripts |
| **Languages** | Hebrew, Aramaic |
| **License** | Free access for viewing |
| **Priority** | 2 (Important) |
| **Integration Difficulty** | Very Hard -- images only |

### 9.5 OPenn (University of Pennsylvania)

| Field | Details |
|-------|---------|
| **Name** | OPenn: Primary Digital Resources at Penn Libraries |
| **Description** | Open-access high-resolution images of cultural heritage materials. Includes Hebrew manuscripts from Kislak Center, Cairo Genizah fragments, and Samaritan texts. |
| **URL** | https://openn.library.upenn.edu/ |
| **Format** | TIFF/JPEG images, TEI XML metadata |
| **Languages** | Hebrew, Aramaic, various |
| **License** | Creative Commons (varies; many CC0/public domain) |
| **Priority** | 3 (Nice-to-have) |
| **Integration Difficulty** | Hard -- images primarily |

---

## Category 10: Targumim

### 10.1 Comprehensive Aramaic Lexicon (CAL)

| Field | Details |
|-------|---------|
| **Name** | Comprehensive Aramaic Lexicon -- Targum Module |
| **Description** | Complete digitized and parsed Targum corpus: Targum Onkelos (fully pointed), Targum Jonathan (fully pointed), Targum Neofiti (complete), Targum Pseudo-Jonathan, Fragment Targum, Targum to Writings. 3+ million lexically parsed words across all Aramaic dialects. Maintained by Hebrew Union College. |
| **URL** | https://cal.huc.edu/ |
| **Format** | Web-based database, searchable text. Targum studies module allows parallel verse comparison. |
| **Estimated Size** | 3+ million parsed words; complete Pentateuch Targumim |
| **Languages** | Aramaic (multiple dialects), Hebrew |
| **License** | Free academic access. Terms for bulk data extraction unclear. |
| **Priority** | 1 (Essential) |
| **Integration Difficulty** | Medium -- web-based, no documented bulk export API, but structured data |

### 10.2 Sefaria Targumim (Already Partial)

| Field | Details |
|-------|---------|
| **Name** | Sefaria Targum Collection |
| **Description** | Targum Onkelos, Targum Jonathan, Targum Pseudo-Jonathan on Torah already available in Sefaria-Export. |
| **URL** | https://www.sefaria.org |
| **Format** | JSON |
| **Languages** | Aramaic, English |
| **License** | CC licenses |
| **Priority** | 1 (Essential -- verify completeness) |
| **Integration Difficulty** | Easy -- already in pipeline |

### 10.3 Etheridge Targum Translation (Public Domain)

| Field | Details |
|-------|---------|
| **Name** | Targums of Onkelos and Jonathan ben Uzziel on the Pentateuch (J.W. Etheridge, 1862) |
| **Description** | Classic English translation of Onkelos and Pseudo-Jonathan with Jerusalem Targum fragments. |
| **URL** | https://archive.org/details/cu31924074296975 |
| **Format** | PDF, full text |
| **Languages** | English |
| **License** | PUBLIC DOMAIN (1862) |
| **Priority** | 2 (Important -- public domain English Targum) |
| **Integration Difficulty** | Easy -- full text on Archive.org |

### 10.4 Targumim to Ketuvim

| Field | Details |
|-------|---------|
| **Name** | Targumim to Writings (Psalms, Proverbs, Job, Five Megillot, Chronicles) |
| **Description** | Aramaic translations of the Hagiographa. Less commonly digitized than Pentateuch Targumim. Available through CAL and some on Sefaria. |
| **URL** | CAL (https://cal.huc.edu/), HebrewBooks.org, academic editions |
| **Format** | Database (CAL), PDF (HebrewBooks) |
| **Languages** | Aramaic |
| **License** | Public domain (original texts) |
| **Priority** | 2 (Important) |
| **Integration Difficulty** | Medium |

---

## Category 11: Liturgy

### 11.1 Open Siddur Project

| Field | Details |
|-------|---------|
| **Name** | Open Siddur Project |
| **Description** | Non-denominational, non-prescriptive open-access archive of Jewish prayers from every era, region, and language. Includes prayers from all nusachot, piyyutim, and historical liturgical texts. REST API available. |
| **URL** | https://opensiddur.org, https://github.com/opensiddur |
| **Format** | TEI XML (Text Encoding Initiative), REST API |
| **Estimated Size** | Thousands of prayers and liturgical texts |
| **Languages** | Hebrew, Aramaic, English, many others |
| **License** | CC-BY-SA 4.0; Code: LGPL |
| **Priority** | 1 (Essential) |
| **Integration Difficulty** | Easy -- has API, structured XML, open license |

### 11.2 Sefaria Liturgy Section

| Field | Details |
|-------|---------|
| **Name** | Sefaria Siddur/Liturgy |
| **Description** | Siddur Ashkenaz, Siddur Sefard, Haggadah, and other liturgical texts. |
| **URL** | https://www.sefaria.org/texts/Liturgy |
| **Format** | JSON (already in Sefaria-Export) |
| **Languages** | Hebrew, English |
| **License** | CC licenses |
| **Priority** | 1 (Essential -- already integrated) |
| **Integration Difficulty** | Easy |

### 11.3 Online Siddur (onlinesiddur.com)

| Field | Details |
|-------|---------|
| **Name** | Online Siddur |
| **Description** | Traditional Jewish Hebrew prayer book online with multiple nusachot available in various download formats. Includes Ashkenaz, Sefard, Edot HaMizrach. |
| **URL** | https://www.onlinesiddur.com |
| **Format** | HTML, downloadable formats |
| **Languages** | Hebrew (with vowels) |
| **License** | Free access; terms unclear for data reuse |
| **Priority** | 2 (Important) |
| **Integration Difficulty** | Medium |

### 11.4 Yemenite Liturgy (Baladi/Shami)

| Field | Details |
|-------|---------|
| **Name** | Yemenite Jewish Prayer Traditions |
| **Description** | Tiklal (Baladi Yemenite siddur) and Shami traditions. Available through specialist publications, HebrewBooks.org scans, and some online resources. |
| **URL** | HebrewBooks.org (search "תכלאל"), specialized Yemenite Jewish websites |
| **Format** | PDF (HebrewBooks), HTML |
| **Languages** | Hebrew (Yemenite pronunciation tradition) |
| **License** | Varies; older editions public domain |
| **Priority** | 2 (Important) |
| **Integration Difficulty** | Hard -- scattered, OCR needed for scans |

### 11.5 Italian, Romaniote, Ethiopian Rites

| Field | Details |
|-------|---------|
| **Name** | Minor Jewish Liturgical Rites |
| **Description** | Minhag Roma (Italian rite), Minhag Romania (Romaniote/Greek rite), Beta Israel liturgy. These are rare and poorly digitized. Some manuscripts in NLI/Ktiv. |
| **URL** | Ktiv (https://ktiv.nli.org.il), academic publications, HebrewBooks.org |
| **Format** | Manuscript images, PDF, academic editions |
| **Languages** | Hebrew, Ge'ez (Ethiopian) |
| **License** | Varies |
| **Priority** | 3 (Nice-to-have) |
| **Integration Difficulty** | Very Hard -- rare, scattered |

### 11.6 Piyyutim Collections

| Field | Details |
|-------|---------|
| **Name** | Hebrew Liturgical Poetry Collections |
| **Description** | Major piyyutim by Yannai, Eleazar Kalir, Yehuda HaLevi, Solomon ibn Gabirol, and others. Scattered across Genizah fragments, printed editions, and academic publications. National Sound Archive of Israel has cantorial recordings. |
| **URL** | HebrewBooks.org, Genizah collections, academic databases, Library of Congress collection |
| **Format** | PDF, manuscript images, HTML |
| **Estimated Size** | Thousands of piyyutim across centuries |
| **Languages** | Hebrew |
| **License** | Public domain (medieval texts); modern editions copyrighted |
| **Priority** | 2 (Important) |
| **Integration Difficulty** | Hard -- highly scattered, needs compilation |

---

## Category 12: Philosophy & Ethics

### 12.1 Already on Sefaria (Verify Completeness)

The following are already in Sefaria-Export and should be verified for completeness:
- **Saadia Gaon -- Emunot v'Deot**: Check if on Sefaria (may be partial)
- **Kuzari (Yehuda HaLevi)**: YES -- on Sefaria
- **Moreh Nevuchim (Rambam)**: Check -- some editions on Sefaria
- **Sefer HaIkkarim (R. Yosef Albo)**: Check Sefaria status
- **Chovot HaLevavot (Duties of the Heart)**: YES -- on Sefaria
- **Mesillat Yesharim (Ramchal)**: YES -- on Sefaria
- **Orchot Tzadikim**: YES -- on Sefaria
- **Sha'arei Teshuvah (Rabbeinu Yonah)**: YES -- on Sefaria

### 12.2 Missing Philosophy Works

| Field | Details |
|-------|---------|
| **Name** | Major Jewish Philosophy NOT on Sefaria |
| **Description** | Includes: Milchamot Hashem (Gersonides/Ralbag), Ohr Hashem (Crescas, partial on Sefaria), Sefer HaMada (as standalone), Iggeret HaKodesh (attributed to Ramban), complete Emunot v'Deot with Arabic original. |
| **URL** | HebrewBooks.org, Archive.org |
| **Format** | PDF |
| **Languages** | Hebrew, Judeo-Arabic (Saadia) |
| **License** | Public domain |
| **Priority** | 2 (Important) |
| **Integration Difficulty** | Hard -- OCR for HebrewBooks PDFs |

### 12.3 Complete Musar Corpus

| Field | Details |
|-------|---------|
| **Name** | Comprehensive Musar Literature |
| **Description** | Beyond what Sefaria has: Ma'alot HaMiddot, Sefer HaYashar (attributed to Rabbeinu Tam), Menorah HaMaor (R. Yisrael al-Nakawa and R. Yitzchak Aboab versions), Reshit Chokhmah (full -- already on Sefaria), Kav HaYashar (on Sefaria), Peleh Yo'etz, Cheshbon HaNefesh (R. Mendel of Satanov), Sefer HaMiddot (Breslov). |
| **URL** | HebrewBooks.org, Sefaria (verify), Archive.org |
| **Format** | PDF, JSON (Sefaria) |
| **Languages** | Hebrew |
| **License** | Public domain (pre-1928 texts) |
| **Priority** | 2 (Important) |
| **Integration Difficulty** | Medium |

---

## Category 13: Biblical Manuscripts & Versions

### 13.1 Westminster Leningrad Codex (WLC)

| Field | Details |
|-------|---------|
| **Name** | Westminster Leningrad Codex + Westminster Hebrew Morphology |
| **Description** | Digital version of the oldest complete Hebrew Bible manuscript (Leningrad Codex / Codex Leningradensis, 1009 CE). Fully verified transcription with complete morphological analysis of every word. Maintained by J. Alan Groves Center for Advanced Biblical Research. |
| **URL** | https://grovescenter.org/file-downloads/ (download), https://github.com/openscriptures/morphhb (GitHub) |
| **Format** | OSIS XML, JSON (npm package), downloadable files |
| **Estimated Size** | Complete Hebrew Bible + word-by-word morphology |
| **Languages** | Hebrew |
| **License** | CC-BY 4.0 (morphology/lemma data). Text based on BHS (Deutsche Bibelgesellschaft). |
| **Priority** | 1 (Essential) |
| **Integration Difficulty** | Easy -- structured XML/JSON, open license |

### 13.2 ETCBC/BHSA Hebrew Bible

| Field | Details |
|-------|---------|
| **Name** | ETCBC Biblia Hebraica Stuttgartensia Amstelodamensis |
| **Description** | Hebrew Bible with comprehensive linguistic annotations (morphology, syntax, discourse) in text-fabric format. Maintained by Eep Talstra Centre for Bible and Computer, VU Amsterdam. |
| **URL** | https://github.com/ETCBC/bhsa, https://shebanq.ancient-data.org/ |
| **Format** | Text-Fabric format, MQL, MySQL, R/Pandas export |
| **Estimated Size** | Complete Hebrew Bible with multi-layer annotation |
| **Languages** | Hebrew |
| **License** | CC-BY-NC 4.0 |
| **Priority** | 2 (Important) |
| **Integration Difficulty** | Medium -- needs text-fabric library or export |

### 13.3 Open Scriptures Hebrew Bible (OSHB/morphhb)

| Field | Details |
|-------|---------|
| **Name** | Open Scriptures Hebrew Bible |
| **Description** | Complete Hebrew Bible (WLC base) with morphological markup in OSIS XML. Open source alternative to commercial tagged Bibles. |
| **URL** | https://github.com/openscriptures/morphhb |
| **Format** | OSIS XML, JSON (npm: morphhb) |
| **Languages** | Hebrew |
| **License** | CC-BY 4.0 |
| **Priority** | 1 (Essential) |
| **Integration Difficulty** | Easy |

### 13.4 STEPBible Data

| Field | Details |
|-------|---------|
| **Name** | STEPBible Tagged Hebrew Text (Tyndale House, Cambridge) |
| **Description** | TOTHT: Tyndale OT Hebrew Tagged text based on Leningrad Codex with full morphological and semantic tags. TBESH: Translators Brief lexicon of Extended Strongs for Hebrew. |
| **URL** | https://github.com/STEPBible/STEPBible-Data |
| **Format** | TSV (tab-separated values) |
| **Languages** | Hebrew, English (280 translation languages on stepbible.org) |
| **License** | CC-BY 4.0 |
| **Priority** | 2 (Important) |
| **Integration Difficulty** | Easy -- TSV download from GitHub |

### 13.5 Aleppo Codex Online

| Field | Details |
|-------|---------|
| **Name** | Aleppo Codex (Keter Aram Tzova) |
| **Description** | Earliest known complete Hebrew Bible manuscript (10th century, partially damaged 1947). Most authoritative Masoretic text. Digital images available; the Aleppo Codex Project digitized surviving portions. |
| **URL** | https://www.aleppocodex.org, https://archive.org/details/Aleppo_Codex, NLI |
| **Format** | Images, partial transcription |
| **Languages** | Hebrew |
| **License** | Complex -- Ben-Zvi Institute holds rights. Images viewable online. |
| **Priority** | 2 (Important) |
| **Integration Difficulty** | Hard -- partial text, complex rights |

### 13.6 Septuagint (LXX)

| Field | Details |
|-------|---------|
| **Name** | Septuagint / Greek Old Testament |
| **Description** | Ancient Greek translation of the Hebrew Bible (3rd-1st century BCE). Essential for textual criticism and comparison. Multiple digital editions available. |
| **URL** | https://www.septuagint.bible, https://www.ellopos.net/elpenor/greek-texts/septuagint/, https://github.com/PerseusDL/canonical-greekLit (Perseus XML), CCAT Morphological LXX |
| **Format** | HTML, XML (Perseus), Unicode text |
| **Languages** | Greek, English translations |
| **License** | Rahlfs/Swete editions: public domain. NETS translation: free for academic use. Perseus XML: CC-BY-SA 3.0. |
| **Priority** | 2 (Important -- for comparison) |
| **Integration Difficulty** | Easy (Perseus XML) to Medium (other sources) |

### 13.7 Peshitta (Syriac)

| Field | Details |
|-------|---------|
| **Name** | Peshitta -- Syriac Bible |
| **Description** | Syriac translation of the Bible, important for textual comparison especially for Aramaic-language scholarship. |
| **URL** | https://peshitta.org, CAL (https://cal.huc.edu/), Archive.org |
| **Format** | HTML, database (CAL), PDF |
| **Languages** | Syriac (Aramaic), English |
| **License** | Varies; older editions public domain |
| **Priority** | 3 (Nice-to-have -- for comparison) |
| **Integration Difficulty** | Medium |

### 13.8 Vulgate (Latin)

| Field | Details |
|-------|---------|
| **Name** | Latin Vulgate |
| **Description** | Jerome's Latin translation (4th-5th century CE). Available in multiple digital editions for comparison purposes. |
| **URL** | https://www.sacred-texts.com/bib/vul/, various online Bible tools |
| **Format** | HTML, XML |
| **Languages** | Latin, English |
| **License** | Public domain (ancient text) |
| **Priority** | 3 (Nice-to-have -- for comparison only) |
| **Integration Difficulty** | Easy |

---

## Category 14: Commentaries

### 14.1 Sefaria Commentaries (Already Integrated -- Verify Gaps)

Already in Sefaria-Export (verify completeness):
- **Tanakh commentaries:** Rashi, Ibn Ezra, Ramban, Radak, Sforno, Or HaChaim, Kli Yakar, Malbim, Metzudat David/Tzion, Abarbanel, Chizkuni, Rabbeinu Bachya, Siftei Chakhamim, Targum Onkelos, Targum Jonathan
- **Talmud commentaries:** Rashi, Tosafot, Rashba, Ritva, Ran, Meiri, Rosh, Nimukei Yosef
- **Shulchan Arukh commentaries:** Rema, Mishnah Berurah + Beur Halacha + Sha'ar HaTziyun
- **Mishneh Torah commentaries:** Kesef Mishneh, Maggid Mishneh, Lechem Mishneh (partial)

### 14.2 Al-Hatorah.org Commentaries

| Field | Details |
|-------|---------|
| **Name** | Al-Hatorah.org Commentary Library |
| **Description** | 40+ Tanakh commentaries including some not on Sefaria: Meshech Chochmah, Netziv (Ha'amek Davar), additional Rishonim and Acharonim. Also has Talmud, Mishneh Torah, and Tur-Shulchan Arukh with multiple commentaries. |
| **URL** | https://alhatorah.org, https://library.alhatorah.org |
| **Format** | HTML (web-only) |
| **Languages** | Hebrew, Aramaic |
| **License** | Free access for reading. No explicit open license for data reuse. No API. |
| **Priority** | 2 (Important) |
| **Integration Difficulty** | Hard -- no API, web scraping needed, unclear ToS |

### 14.3 HebrewBooks.org Complete Commentary Collections

| Field | Details |
|-------|---------|
| **Name** | HebrewBooks Commentary Scans |
| **Description** | Complete Mikraot Gedolot (Rabbinic Bible) editions, all Tosafot variants (Tosafot Rid, Tosafot Rosh, Tosafot HaRash), Shulchan Arukh commentaries (Taz, Shakh, Magen Avraham, Be'er HaGolah, Ba'er Heitev, Pithei Teshuvah), Mishneh Torah commentaries not on Sefaria. |
| **URL** | https://hebrewbooks.org |
| **Format** | PDF (scanned) |
| **Languages** | Hebrew, Aramaic |
| **License** | Free access; mostly public domain |
| **Priority** | 1 (Essential) |
| **Integration Difficulty** | Hard -- OCR pipeline needed |

### 14.4 Mikraot Gedolot HaKeter Project

| Field | Details |
|-------|---------|
| **Name** | Mikraot Gedolot HaKeter |
| **Description** | Modern critical edition of the Rabbinic Bible based on the Aleppo Codex, with critical editions of medieval commentaries (Rashi, Ibn Ezra, Ramban, Radak, etc. from best manuscripts). Bar-Ilan University project. |
| **URL** | Academic publication; some volumes available via Bar-Ilan |
| **Format** | Print/PDF |
| **Languages** | Hebrew |
| **License** | Copyrighted (Bar-Ilan University Press) |
| **Priority** | 2 (Important -- best critical text) |
| **Integration Difficulty** | Hard -- copyrighted |

---

## Category 15: Academic & Scholarly

### 15.1 JSTOR Jewish Studies

| Field | Details |
|-------|---------|
| **Name** | JSTOR Jewish Studies Collection |
| **Description** | 58+ academic journals in Jewish Studies including: Hebrew Studies, Jewish Studies Quarterly, Jewish History, AJS Review, Daat, Aleph, Cathedra. |
| **URL** | https://www.jstor.org/subject/jewishstudies |
| **Format** | PDF (individual articles) |
| **Estimated Size** | 58+ journal titles, thousands of articles |
| **Languages** | English, Hebrew |
| **License** | PAID subscription / institutional access. Individual articles sometimes open access. |
| **Priority** | 3 (Nice-to-have -- supplementary scholarship) |
| **Integration Difficulty** | Very Hard -- copyrighted, no bulk access |

### 15.2 Hebrew University Scholarship

| Field | Details |
|-------|---------|
| **Name** | Hebrew University of Jerusalem -- Jewish Studies Publications |
| **Description** | Academic publications from the premier Jewish studies institution. Includes publications from the Institute of Jewish Studies, Mandel Institute of Jewish Studies. |
| **URL** | https://huji.ac.il, various department pages |
| **Format** | PDF, HTML |
| **Languages** | Hebrew, English |
| **License** | Academic copyright |
| **Priority** | 3 (Nice-to-have) |
| **Integration Difficulty** | Hard |

### 15.3 Academia.edu / ResearchGate Jewish Studies

| Field | Details |
|-------|---------|
| **Name** | Academic Social Networks -- Jewish Studies Papers |
| **Description** | Thousands of freely uploaded academic papers on Jewish texts, history, and law. |
| **URL** | https://www.academia.edu, https://www.researchgate.net |
| **Format** | PDF |
| **Languages** | English, Hebrew |
| **License** | Author-uploaded; varies per paper |
| **Priority** | 3 (Nice-to-have) |
| **Integration Difficulty** | Hard -- case-by-case licensing |

### 15.4 Talmudic Encyclopedia (Entziklopedya Talmudit)

| Field | Details |
|-------|---------|
| **Name** | Talmudic Encyclopedia |
| **Description** | Comprehensive encyclopedia of halakhic topics organized alphabetically. 50+ volumes published. Only available digitally through Bar-Ilan Responsa Project. |
| **URL** | Only via Bar-Ilan Responsa Project (https://www.responsa.co.il) |
| **Format** | Proprietary (Bar-Ilan) |
| **Languages** | Hebrew |
| **License** | PAID (part of Bar-Ilan subscription) |
| **Priority** | 2 (Important -- unique reference, blocked by licensing) |
| **Integration Difficulty** | Very Hard -- commercial |

---

## Category 16: Modern Halakhic

### 16.1 Major Modern Responsa on HebrewBooks

| Field | Details |
|-------|---------|
| **Name** | Core Modern Responsa Collections |
| **Description** | The most important modern halakhic works, available as scanned PDFs: |

| Work | Author | Volumes | HebrewBooks |
|------|--------|---------|-------------|
| Igrot Moshe | R. Moshe Feinstein | 8 | YES |
| Yabia Omer | R. Ovadia Yosef | 10 | YES |
| Yechaveh Da'at | R. Ovadia Yosef | 6 | YES |
| Tzitz Eliezer | R. Eliezer Waldenberg | 22 | YES |
| Minchat Yitzchak | R. Yitzchak Yaakov Weiss | 10 | YES |
| Shevet HaLevi | R. Shmuel Wosner | 10 | YES |
| Chelkat Yaakov | R. Mordechai Yaakov Breisch | 3 | YES |
| Mishne Halachot | R. Menashe Klein | 20 | YES |
| Teshuvot VeHanhagot | R. Moshe Sternbuch | 5 | YES |
| Be'er Moshe | R. Moshe Stern | 8 | YES |

| **URL** | https://hebrewbooks.org |
| **Format** | PDF (scanned) |
| **Languages** | Hebrew |
| **License** | Copyright status varies; many modern authors' estates assert copyright. HebrewBooks hosts with implied permission. |
| **Priority** | 1 (Essential) |
| **Integration Difficulty** | Hard -- OCR pipeline, copyright considerations |

### 16.2 Yalkut Yosef (Digital)

| Field | Details |
|-------|---------|
| **Name** | Yalkut Yosef |
| **Description** | Comprehensive halakhic work by R. Yitzchak Yosef (current Sephardic Chief Rabbi of Israel), based on rulings of R. Ovadia Yosef. Widely used among Sephardic communities. |
| **URL** | HebrewBooks.org, dedicated websites |
| **Format** | PDF, web |
| **Languages** | Hebrew |
| **License** | Copyrighted (actively publishing) |
| **Priority** | 2 (Important) |
| **Integration Difficulty** | Hard -- copyrighted, active publication |

---

## Category 17: Chassidic Texts

### 17.1 Sefaria Chassidut (Already ~95 Works)

Already integrated via Sefaria-Export. Key works present:
- **Chabad:** Tanya, Torah Ohr, Likkutei Torah
- **Breslov:** Likutey Moharan, Likutey Halakhot, Sichot HaRan, Sipurei Ma'asiot
- **Ger:** Sfat Emet
- **Izhbitz:** Mei HaShiloach
- **Piaseczno:** Aish Kodesh, Chovas HaTalmidim, + 5 more
- **R. Tzadok HaKohen:** 18 works
- Kedushat Levi, Noam Elimelech, Me'or Einayim, Degel Machaneh Ephraim, Bnei Yissaschar, Maor VaShemesh, Toldot Yaakov Yosef, and many more

### 17.2 Missing Chassidic Works (HebrewBooks)

| Field | Details |
|-------|---------|
| **Name** | Chassidic Texts NOT on Sefaria |
| **Description** | Komarna Rebbe works (Heikhal HaBracha, Zohar Chai, Netiv Mitzvotekha, Notzer Chesed), Divrei Chaim (Tzanz), Imrei Chaim (Vizhnitz), Kedushat Tzion (Bobov), Likutei Torah of the Maggid of Mezeritch, Ateret Tzvi (Zidichov), Or HaMeir, Bnei Yissaschar commentaries, additional Chabad maamarim. |
| **URL** | HebrewBooks.org |
| **Format** | PDF |
| **Languages** | Hebrew, Yiddish |
| **License** | Mostly public domain (pre-1928). Some later works copyrighted. |
| **Priority** | 2 (Important) |
| **Integration Difficulty** | Hard -- OCR needed |

### 17.3 Chabad.org Chassidic Library

| Field | Details |
|-------|---------|
| **Name** | Chabad.org Torah Texts / Chassidut |
| **Description** | Extensive Chabad-Lubavitch library including Shulchan Aruch HaRav (complete), Tanya with English commentary, Torah Ohr, Likkutei Torah, Likkutei Sichos (partial), Maamarim. Some unique English translations. |
| **URL** | https://www.chabad.org/library/article_cdo/aid/144466/jewish/Tanya.htm |
| **Format** | HTML (bilingual Hebrew/English side-by-side) |
| **Languages** | Hebrew, English, Yiddish |
| **License** | Copyrighted by Chabad.org. Partnership would be needed. |
| **Priority** | 2 (Important -- unique translations) |
| **Integration Difficulty** | Medium (scraping) but Hard (legal -- copyrighted) |

---

## Category 18: Translations

### 18.1 William Davidson Talmud (Steinsaltz/Koren) -- ALREADY INTEGRATED

| Field | Details |
|-------|---------|
| **Name** | William Davidson Talmud |
| **Description** | Complete English translation of Talmud Bavli by Rabbi Adin Even-Israel Steinsaltz, published by Koren. Already on Sefaria under CC-BY-NC license. |
| **URL** | https://www.sefaria.org/william-davidson-talmud |
| **Format** | JSON (Sefaria-Export) |
| **Languages** | English, Hebrew |
| **License** | CC-BY-NC (William Davidson Foundation) |
| **Priority** | 1 (Essential -- ALREADY INTEGRATED) |
| **Integration Difficulty** | N/A -- already done |

### 18.2 ArtScroll Schottenstein Talmud

| Field | Details |
|-------|---------|
| **Name** | ArtScroll Schottenstein Talmud |
| **Description** | Complete English elucidation of Talmud Bavli (73 volumes). Digital version available only in ArtScroll app ecosystem. Complete Digital Library: ~$600. |
| **URL** | https://www.artscroll.com/Categories/DTE.html |
| **Format** | Proprietary app format (no export) |
| **Languages** | English, Hebrew |
| **License** | COPYRIGHTED. All rights reserved. No printing. No data extraction. |
| **Priority** | 3 (Nice-to-have -- but completely blocked) |
| **Integration Difficulty** | Impossible -- locked ecosystem, copyright |

### 18.3 Soncino Talmud

| Field | Details |
|-------|---------|
| **Name** | Soncino Talmud Translation |
| **Description** | Classic English Talmud translation (1935-1952). Available on Internet Archive. Copyright status complex -- originally published without copyright notices. |
| **URL** | https://archive.org/details/CompleteBabylonianTalmudSoncino |
| **Format** | PDF/HTML |
| **Languages** | English |
| **License** | Complex copyright -- Nezikin public domain 2030, Nashim 2032, Moed 2033, others 2045. Currently available on Archive.org. |
| **Priority** | 2 (Important -- classic translation, partially accessible) |
| **Integration Difficulty** | Medium -- on Archive.org but copyright uncertain |

### 18.4 JPS (Jewish Publication Society) Translations

| Field | Details |
|-------|---------|
| **Name** | JPS Tanakh Translation |
| **Description** | 1917 JPS translation is public domain. 1985 NJPS translation is copyrighted. The 1917 version is widely available digitally. |
| **URL** | Sefaria (has 1917 JPS), Archive.org, Mechon Mamre |
| **Format** | JSON (Sefaria), HTML (Mechon Mamre), PDF (Archive.org) |
| **Languages** | English |
| **License** | 1917: PUBLIC DOMAIN. 1985 NJPS: Copyrighted. |
| **Priority** | 2 (Important -- 1917 is public domain) |
| **Integration Difficulty** | Easy (1917 already on Sefaria) |

---

## Category 19: Audio/Video

### 19.1 TorahAnytime

| Field | Details |
|-------|---------|
| **Name** | TorahAnytime |
| **Description** | 100,000+ free Torah video and audio lectures by hundreds of rabbis and speakers. |
| **URL** | https://www.torahanytime.com |
| **Format** | Streaming audio/video |
| **Estimated Size** | 100,000+ lectures |
| **Languages** | English, Hebrew |
| **License** | Free access; redistribution terms unclear |
| **Priority** | 3 (Nice-to-have -- future feature: transcription) |
| **Integration Difficulty** | Hard -- audio/video requires transcription pipeline |

### 19.2 YUTorah

| Field | Details |
|-------|---------|
| **Name** | YU Torah Online |
| **Description** | 240,000+ shiurim via webcast in audio, video, and text formats by Yeshiva University Roshei Yeshiva and faculty. |
| **URL** | https://www.yutorah.org |
| **Format** | Streaming audio/video, some text |
| **Estimated Size** | 240,000+ shiurim |
| **Languages** | English, Hebrew |
| **License** | Free access; YU copyright |
| **Priority** | 3 (Nice-to-have -- future feature) |
| **Integration Difficulty** | Hard -- audio/video transcription |

### 19.3 torah-dl (Open Source Downloader)

| Field | Details |
|-------|---------|
| **Name** | torah-dl by Sofer.AI |
| **Description** | Open-source library and CLI tools for downloading media from Torah websites. Supports YUTorah, TorahAnytime, TorahApp, OUTorah, and more. |
| **URL** | https://github.com/SoferAi/torah-dl |
| **Format** | Audio/video download tool |
| **Languages** | N/A (tool) |
| **License** | Open source |
| **Priority** | 3 (Nice-to-have -- tooling for future audio feature) |
| **Integration Difficulty** | Easy (tool), Hard (transcription pipeline) |

---

## Category 20: Related Ancient Texts

### 20.1 Josephus (Complete Works)

| Field | Details |
|-------|---------|
| **Name** | Flavius Josephus -- Complete Works |
| **Description** | Jewish Antiquities (Antiquitates Judaicae), The Jewish War (Bellum Judaicum), Against Apion (Contra Apionem), Life (Vita). Essential historical sources for Second Temple Judaism. |
| **URL** | https://www.perseus.tufts.edu/hopper/text?doc=Perseus:text:1999.01.0146 (Greek+English), https://github.com/PerseusDL/canonical-greekLit (XML), https://archive.org/details/worksofjosephusc0000jose (Whiston translation) |
| **Format** | XML (Perseus, CC-BY-SA 3.0), HTML, PDF |
| **Estimated Size** | ~800,000 words across all works |
| **Languages** | Greek (original), English (Whiston public domain; Loeb copyrighted) |
| **License** | Perseus XML: CC-BY-SA 3.0. Whiston translation: PUBLIC DOMAIN. |
| **Priority** | 2 (Important) |
| **Integration Difficulty** | Easy -- Perseus XML downloadable from GitHub |

### 20.2 Philo of Alexandria (Complete Works)

| Field | Details |
|-------|---------|
| **Name** | Philo Judaeus -- Complete Works |
| **Description** | Hellenistic Jewish philosopher's complete works including On the Creation, On Abraham, On the Life of Moses, On the Contemplative Life, Allegorical Interpretation, and dozens more. Essential for understanding Hellenistic Jewish thought. |
| **URL** | https://scaife.perseus.org/library/urn:cts:greekLit:tlg0018/ (Perseus/Scaife), https://archive.org/details/worksphilojudaeu01philuoft (C.D. Yonge translation) |
| **Format** | XML (Perseus), HTML, PDF |
| **Estimated Size** | ~40 treatises |
| **Languages** | Greek (original), English (Yonge translation public domain) |
| **License** | Perseus: CC-BY-SA 3.0. Yonge translation: PUBLIC DOMAIN. |
| **Priority** | 2 (Important) |
| **Integration Difficulty** | Easy -- Perseus XML |

### 20.3 Church Fathers Quoting Jewish Texts

| Field | Details |
|-------|---------|
| **Name** | Ante-Nicene, Nicene, and Post-Nicene Fathers |
| **Description** | Complete collection of early Church Fathers writings (38 volumes). Many contain extensive quotations from and references to Jewish texts, traditions, and interpretations. Key authors: Justin Martyr (Dialogue with Trypho), Origen (Commentary on Song of Songs, Hexapla fragments), Jerome (Hebrew Questions on Genesis, Vulgate prefaces), Eusebius (Ecclesiastical History, Praeparatio Evangelica). |
| **URL** | https://ccel.org/fathers (CCEL), https://www.holybooks.com/ante-nicene-fathers-vol-i-ix/ (PDF), https://archive.org/details/the-complete-ante-nicene-nicene-and-post-nicene-church-fathers |
| **Format** | HTML (CCEL), PDF (HolyBooks, Archive.org), ThML format (CCEL) |
| **Estimated Size** | 38 volumes, ~11,000 pages |
| **Languages** | English (translations from Greek/Latin) |
| **License** | PUBLIC DOMAIN (translations from 1885-1900) |
| **Priority** | 3 (Nice-to-have) |
| **Integration Difficulty** | Easy -- well-structured, public domain |

### 20.4 Nag Hammadi Library

| Field | Details |
|-------|---------|
| **Name** | Nag Hammadi Library / Gnostic Texts with Jewish Elements |
| **Description** | 52 treatises from 13 codices (discovered 1945). Several texts have significant Jewish elements: Apocryphon of John, On the Origin of the World, Hypostasis of the Archons, Thunder Perfect Mind. |
| **URL** | http://www.gnosis.org/naghamm/nhl.html (Gnostic Society Library -- complete), https://archive.org/details/naghammadiscript0000unse_o3v1, https://ccdl.claremont.edu/digital/collection/nha (Claremont Nag Hammadi Archive -- manuscript images) |
| **Format** | HTML (gnosis.org), PDF (Archive.org), manuscript images (Claremont) |
| **Estimated Size** | 52 treatises |
| **Languages** | English translations (from Coptic originals) |
| **License** | gnosis.org texts: freely available online. Robinson/Meyer translations: copyrighted. |
| **Priority** | 3 (Nice-to-have) |
| **Integration Difficulty** | Easy (gnosis.org HTML) |

### 20.5 Samaritan Literature (Additional)

Already covered in Category 5.

---

## TOP 10 Highest-Impact Sources to Integrate Next

Ranked by: (a) uniqueness of content, (b) ease of integration, (c) scholarly importance.

### Rank 1: Scripta Qumranica Electronica (SQE)

| Criterion | Score |
|-----------|-------|
| **Uniqueness** | VERY HIGH -- only structured, machine-readable Dead Sea Scrolls corpus |
| **Ease of Integration** | MEDIUM -- has public API and GitHub database dump |
| **Scholarly Importance** | VERY HIGH -- foundational ancient Jewish texts |
| **What it adds** | Complete transcriptions of ALL Dead Sea Scrolls with lexical/morphological data, variant readings, and bibliographic references. Nothing else provides this. |
| **Action** | Clone SQE_Database from GitHub, study schema, build ingestion pipeline. |

### Rank 2: Open Siddur Project

| Criterion | Score |
|-----------|-------|
| **Uniqueness** | HIGH -- only structured, open-licensed comprehensive liturgy collection |
| **Ease of Integration** | EASY -- has REST API, TEI XML format, CC-BY-SA license |
| **Scholarly Importance** | HIGH -- covers ALL nusachot including rare traditions |
| **What it adds** | Complete liturgical corpus across all Jewish traditions not covered by Sefaria's limited liturgy section. |
| **Action** | Use REST API to pull complete text corpus. Convert TEI XML to JSON. |

### Rank 3: Comprehensive Aramaic Lexicon (CAL) Targum Module

| Criterion | Score |
|-----------|-------|
| **Uniqueness** | VERY HIGH -- only fully parsed Aramaic Targum corpus (3M+ words) |
| **Ease of Integration** | MEDIUM -- web-based, need to work with structured data extraction |
| **Scholarly Importance** | VERY HIGH -- complete Targumim with morphological analysis |
| **What it adds** | Complete, parsed Targum Onkelos, Jonathan, Neofiti, Pseudo-Jonathan, Fragment Targum, and Targumim to Ketuvim. No other source has all of these in parsed form. |
| **Action** | Contact CAL (HUC) about data access. Extract via Targum module. |

### Rank 4: Westminster Leningrad Codex + OSHB Morphology

| Criterion | Score |
|-----------|-------|
| **Uniqueness** | HIGH -- authoritative morphologically tagged Hebrew Bible |
| **Ease of Integration** | VERY EASY -- OSIS XML and JSON on GitHub, CC-BY 4.0 |
| **Scholarly Importance** | VERY HIGH -- gold-standard Hebrew Bible text |
| **What it adds** | Word-by-word morphological analysis of entire Hebrew Bible from the oldest complete manuscript. Essential for any serious biblical text analysis. |
| **Action** | Download from GitHub, parse OSIS XML, ingest with morphological tags. |

### Rank 5: Online Critical Pseudepigrapha + R.H. Charles Collection

| Criterion | Score |
|-----------|-------|
| **Uniqueness** | HIGH -- complete corpus of Jewish pseudepigraphic literature |
| **Ease of Integration** | EASY -- HTML scraping (pseudepigrapha.org, sacred-texts.com), public domain |
| **Scholarly Importance** | HIGH -- essential Second Temple literature |
| **What it adds** | 1 Enoch, 2 Enoch, Jubilees, Testaments of XII Patriarchs, 4 Ezra, 2 Baruch, Psalms of Solomon, Letter of Aristeas, and 30+ more texts. Critical for understanding the full spectrum of ancient Jewish thought. |
| **Action** | Scrape pseudepigrapha.org and sacred-texts.com. Parse and structure. |

### Rank 6: Perseus Digital Library -- Josephus + Philo XML

| Criterion | Score |
|-----------|-------|
| **Uniqueness** | MEDIUM -- translations exist elsewhere, but Perseus XML is uniquely structured |
| **Ease of Integration** | VERY EASY -- XML on GitHub, CC-BY-SA 3.0 |
| **Scholarly Importance** | VERY HIGH -- essential primary sources for Second Temple Judaism |
| **What it adds** | Complete works of Josephus and Philo in structured XML with CTS URN referencing. Both are foundational for understanding Jewish history, law, and philosophy in antiquity. |
| **Action** | Clone canonical-greekLit from GitHub. Parse XML. Ingest. |

### Rank 7: Otzaria Library (Full Download)

| Criterion | Score |
|-----------|-------|
| **Uniqueness** | MEDIUM -- overlaps with Sefaria but includes Dicta/Torat Emet texts |
| **Ease of Integration** | VERY EASY -- plain text files, public domain/Unlicense |
| **Scholarly Importance** | HIGH -- fills gaps in Kabbalah, Chassidut, and Jewish Thought |
| **What it adds** | Texts from Dicta and Torat Emet that are NOT in Sefaria-Export. Already in plain text format -- no OCR needed. Quick wins for gap-filling. |
| **Action** | Download latest release from GitHub. Cross-reference against Sefaria-Export. Ingest unique texts. |

### Rank 8: Samaritan Pentateuch (Open Book Publishers)

| Criterion | Score |
|-----------|-------|
| **Uniqueness** | VERY HIGH -- unique textual tradition not found elsewhere in the corpus |
| **Ease of Integration** | EASY -- open access PDF/EPUB from Open Book Publishers |
| **Scholarly Importance** | HIGH -- important for biblical textual criticism |
| **What it adds** | The Samaritan Torah tradition with critical apparatus. No other source provides this in an accessible digital format. |
| **Action** | Download from Open Book Publishers. Parse parallel Hebrew/English text. |

### Rank 9: Sefer Raziel HaMalakh + Practical Kabbalah Core Texts

| Criterion | Score |
|-----------|-------|
| **Uniqueness** | VERY HIGH -- practical kabbalah is almost entirely absent from our corpus |
| **Ease of Integration** | EASY (emol.org text download) to MEDIUM (HebrewBooks OCR) |
| **Scholarly Importance** | MEDIUM -- specialized but important for completeness |
| **What it adds** | An entire genre of Jewish literature (practical/magical kabbalah) currently missing: Sefer Raziel, Shimmush Tehillim, Sefer HaRazim, Harba de-Moshe. |
| **Action** | Download from emol.org. Supplement with HebrewBooks PDFs and Archive.org. |

### Rank 10: Friedberg Genizah Project (MiDRASH Transcriptions)

| Criterion | Score |
|-----------|-------|
| **Uniqueness** | VERY HIGH -- 400,000 manuscript fragments being machine-transcribed |
| **Ease of Integration** | HARD -- transcriptions emerging; need to track MiDRASH project releases |
| **Scholarly Importance** | VERY HIGH -- unprecedented primary source material |
| **What it adds** | Machine-readable transcriptions of the entire Cairo Genizah corpus. Previously only 10% was transcribed. The MiDRASH project (2023-2029, EU ERC 10M euro) is changing this. |
| **Action** | Monitor MiDRASH project releases. Register for FGP access. Plan integration when transcriptions become available. |

---

## Master Source Summary Table

| # | Source | URL | Format | Size | License | Priority | Difficulty | Category |
|---|--------|-----|--------|------|---------|----------|------------|----------|
| 1 | Sefaria-Export | github.com/Sefaria/Sefaria-Export | JSON | 4M+ chunks | CC (varies) | 1 | Easy | INTEGRATED |
| 2 | Otzaria Library | github.com/Sivan22/otzaria-library | TXT | Large | Unlicense | 1 | Easy | 2,17 |
| 3 | HebrewBooks.org | hebrewbooks.org | PDF | 65,000+ vols | Free/varies | 1 | Hard (OCR) | 2,8,14,16,17 |
| 4 | SQE Dead Sea Scrolls | qumranica.org | JSON/API/SQL | All DSS | Open | 1 | Medium | 1 |
| 5 | Leon Levy DSS | deadseascrolls.org.il | Images | 25,000 frags | Free/IAA | 2 | Hard | 1 |
| 6 | CAL Targum Module | cal.huc.edu | Web DB | 3M+ words | Academic | 1 | Medium | 10 |
| 7 | Open Siddur Project | opensiddur.org | TEI XML/API | Thousands | CC-BY-SA 4.0 | 1 | Easy | 11 |
| 8 | WLC + OSHB | github.com/openscriptures/morphhb | XML/JSON | Full Bible | CC-BY 4.0 | 1 | Easy | 13 |
| 9 | Online Critical Pseudepigrapha | pseudepigrapha.org | HTML | 15+ texts | Free | 1 | Medium | 4 |
| 10 | R.H. Charles Collection | sacred-texts.com, archive.org | HTML/PDF | 40+ texts | Public domain | 1 | Easy | 4 |
| 11 | Perseus (Josephus/Philo) | github.com/PerseusDL | XML | Complete | CC-BY-SA 3.0 | 2 | Easy | 20 |
| 12 | Friedberg Genizah Project | genizah.org | Images/metadata | 739,868 imgs | Free/research | 1 | Hard | 7 |
| 13 | Cambridge Genizah | cudl.lib.cam.ac.uk | Images/IIIF | 193,000 MSS | Free | 2 | Hard | 7 |
| 14 | Ktiv (NLI Manuscripts) | ktiv.nli.org.il | Images | 4.5M images | Free | 1 | Very Hard | 9 |
| 15 | British Library Hebrew MSS | bl.uk/manuscripts | Images | 800 MSS | Free | 2 | Very Hard | 9 |
| 16 | Bodleian Hebrew MSS | digital.bodleian.ox.ac.uk | Images/IIIF | 800 MSS | CC-BY-NC-SA | 2 | Very Hard | 9 |
| 17 | Vatican Hebrew MSS | digi.vatlib.it | Images/IIIF | Hundreds | Free | 2 | Very Hard | 9 |
| 18 | Bar-Ilan Responsa | responsa.co.il | Proprietary | 200M+ words | PAID ($1,300) | 1 | BLOCKED | 8 |
| 19 | Otzar HaChochmah | otzar.org | Images | 156,000 vols | PAID | 2 | BLOCKED | 8 |
| 20 | ETCBC/BHSA | github.com/ETCBC/bhsa | Text-Fabric | Full Bible | CC-BY-NC 4.0 | 2 | Medium | 13 |
| 21 | STEPBible Data | github.com/STEPBible/STEPBible-Data | TSV | Full Bible | CC-BY 4.0 | 2 | Easy | 13 |
| 22 | Samaritan Pentateuch | openbookpublishers.com | PDF/EPUB | Pentateuch | Open Access | 2 | Easy | 5 |
| 23 | Kabbalah.info | kabbalah.info | HTML | ~100 texts | Free/verify | 2 | Medium | 2 |
| 24 | Mechon Mamre | mechon-mamre.org | HTML/text | Core texts | Free/copyright | 2 | Easy | 13,14 |
| 25 | Al-Hatorah | alhatorah.org | HTML | 40+ commentaries | Free/no API | 2 | Hard | 14 |
| 26 | Chabad.org | chabad.org | HTML | Large | Copyrighted | 2 | Hard | 17,18 |
| 27 | Sefer Raziel (emol.org) | emol.org/kabbalah/seferraziel/ | HTML/text | 1 work | Free/PD | 2 | Easy | 3 |
| 28 | Pseudepigrapha.com | pseudepigrapha.com | HTML | 50+ texts | PD translations | 2 | Easy | 4 |
| 29 | Septuagint (Perseus) | github.com/PerseusDL | XML | Full LXX | CC-BY-SA 3.0 | 2 | Easy | 13 |
| 30 | Church Fathers (CCEL) | ccel.org/fathers | HTML/ThML | 38 volumes | Public domain | 3 | Easy | 20 |
| 31 | Nag Hammadi (gnosis.org) | gnosis.org/naghamm/nhl.html | HTML | 52 treatises | Free online | 3 | Easy | 20 |
| 32 | Soncino Talmud | archive.org (CompleteBabylonianTalmudSoncino) | PDF | Complete | Complex (PD 2030-2045) | 2 | Medium | 18 |
| 33 | TorahAnytime | torahanytime.com | Audio/video | 100,000+ | Free | 3 | Hard | 19 |
| 34 | YUTorah | yutorah.org | Audio/video | 240,000+ | Free/YU | 3 | Hard | 19 |
| 35 | torah-dl | github.com/SoferAi/torah-dl | Tool | N/A | Open source | 3 | Easy | 19 |
| 36 | JSTOR Jewish Studies | jstor.org/subject/jewishstudies | PDF | 58+ journals | PAID | 3 | Very Hard | 15 |
| 37 | Halachipedia | halachipedia.com | Wiki/HTML | ~500 pages | Unclear | 2 | Easy | 8 |
| 38 | Hebrew Wikisource | he.wikisource.org | Wiki API | Partial | CC-BY-SA | 2 | Easy | Various |
| 39 | Dicta NLP Tools | dicta.org.il | API/tools | Infrastructure | Free | 1 | Medium | TOOLING |
| 40 | Peshitta (CAL/peshitta.org) | peshitta.org, cal.huc.edu | HTML/DB | Syriac Bible | Free/varies | 3 | Medium | 13 |
| 41 | Brill DSS Electronic Library | scholarlyeditions.brill.com | Web | Complete DSS | PAID | 2 | BLOCKED | 1 |
| 42 | DBS Torah Software | Various | Proprietary | Massive | PAID | 3 | Hard | 8 |
| 43 | CCAR Reform Responsa | ccarnet.org | HTML/PDF | Collection | Copyrighted | 3 | Medium | 8 |
| 44 | Karaite Anthology | Archive.org | PDF | 1 volume | Copyrighted | 2 | Medium | 6 |
| 45 | Archive.org (various) | archive.org | PDF/text | Massive | Varies | 2 | Medium | Various |

---

## Integration Roadmap

### Phase 1: Quick Wins (1-2 weeks)
1. Download and cross-reference Otzaria Library against Sefaria-Export
2. Ingest Westminster Leningrad Codex / OSHB from GitHub
3. Ingest Perseus Josephus + Philo XML from GitHub
4. Scrape Online Critical Pseudepigrapha
5. Scrape sacred-texts.com public domain collections (Charles Pseudepigrapha, Zohar Mathers)
6. Download Open Siddur Project via API

### Phase 2: Structured Sources (2-4 weeks)
7. Build SQE Dead Sea Scrolls integration
8. Build CAL Targum data extraction
9. Ingest STEPBible morphological data
10. Download Samaritan Pentateuch (Open Book Publishers)
11. Ingest Sefer Raziel from emol.org
12. Scrape pseudepigrapha.com collection
13. Ingest Septuagint from Perseus
14. Ingest Church Fathers from CCEL (Jewish-relevant selections)

### Phase 3: OCR Pipeline (1-3 months)
15. Deploy Dicta OCR pipeline
16. OCR priority modern responsa from HebrewBooks (Igrot Moshe, Yabia Omer, Tzitz Eliezer)
17. OCR Kabbalah gap texts (Ramchal, Arizal, Ramak works)
18. OCR missing Chassidic texts
19. OCR Hekhalot/Merkavah literature
20. OCR practical Kabbalah texts

### Phase 4: Partnerships & Advanced (3-12 months)
21. Contact Friedberg Genizah Project about MiDRASH transcription access
22. Explore Bar-Ilan Responsa Project licensing
23. Contact Chabad.org about partnership
24. Contact Kabbalah.info about Ashlag school texts
25. Develop audio transcription pipeline for TorahAnytime/YUTorah (future feature)

---

*Last updated: March 2, 2026*
*This document should be updated as new sources are discovered and integrations are completed.*
