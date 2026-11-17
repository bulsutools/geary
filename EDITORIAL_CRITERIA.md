# Editorial Criteria & Handbook Audit Standard (`EDITORIAL_CRITERIA.md`)

Use these criteria before authoring or updating any Geary guide from source documents such as the *BulSU Undergraduate Student Manual (BOR Resolution No. 85, s. 2016)*.

---

## 1. Inclusion Gate (Must Satisfy All 3)

A handbook topic qualifies for a standalone Geary article only when it passes every gate below:

1. **Direct Student Action, Risk, or Entitlement:** The section tells an undergraduate what to do, what to submit, what deadline or threshold applies, what penalty results from non-compliance, or what campus service/right they can claim.
2. **Verifiable Concrete Specifics:** The source supplies hard facts—numbers, grade cutoffs, fees, waiting times, signature chains, required documents, offices, or explicit exceptions—rather than abstract policy aspirations.
3. **Cohesive Standalone Scope:** The subject resolves one unified student task or problem cleanly without needing a 4-line stub (merge small related subsections sharing one workflow or office).

---

## 2. Exclusion Gate (Skip Outright)

Do not turn these handbook sections into standalone articles:

- **Internal Office Charters & Staff Mandates:** "Objectives", "Functions of the Office", and employee duty lists (e.g., internal admin duties of SAS, OSW, OSD, OSOA, CarDSI, or PPESO staff) that govern university employees rather than student actions.
- **Ceremonial, Historical & Template Pages:** Title pages, Quality Policy, Foreword, University President's Message, University History essay, tear-sheet Acknowledgement forms, and lyrics (`BSU Hymn`, `BSU March`).
- **Non-Procedural Statutory / Policy Preambles:** Standalone Constitutional rights lists (`Art. III` restatements), generic `Norms of Conduct` trait lists, or list-of-laws headings (`Obedience to the Laws of the Land`) that lack BulSU-specific steps, unless folded briefly into an actionable student-rights/grievance guide.
- **Administrative Annexes Directed at HEIs/CHED:** Compliance report templates (`Annex B`/`C` forms for CHEDRO), CHED cover memorandums (`Oct 27, 2015` orientation memo), or unlabelled blank forms.

---

## 3. Merging & Splitting Guidelines

- **Merge micro-sections:** Combine closely linked clauses into one high-utility guide (e.g., *Load Changes + Subject Substitution + Tutorial/Special Classes*; *Graduation Requirements + Commencement*; *TOR + Transfer Credentials + Name Changes*; *Medical/Dental Certificates + Student Accident Insurance*).
- **Split overloaded chapters:** Separate distinct workflows inside large chapters (e.g., split *Offenses & Penalties* from *Hearing & Appeals Procedures*; split *Org Recognition & Advisers* from *Events, Postings & Fundraising*; split *Admissions & BSUAT* from *Shifting & Transferring*).
- **Category & Subcategory Discipline:** Every article uses one of the 7 slugs in `src/data/categories.ts` (`enrollment`, `academics`, `documents`, `scholarships`, `policies`, `organizations`, `campus`) and matches existing `subcategory` names inside that category to avoid duplicate headings.

---

## 4. Quality & Voice Standard (`humanizer` + Source Card)

- **Required Source Card:** Every article derived from a source document must populate both `source` and `sourceUrl` (when a public link exists) in YAML frontmatter so `ArticleLayout.astro` renders the source citation card at the end of the page.
- **Factual Fidelity:** Keep all numbers, grade thresholds, fees, office names, waiting times, and eligibility exclusions exact to the source. Never invent missing hotline numbers, current fees omitted from the PDF, or unstated office hours.
- **Readable Human Prose (`humanizer`):** Write directly for students using active verbs. Remove chatbot openings, restated section closers, forced triads, stock AI adjectives (`crucial`, `pivotal`, `enhance`, `ensure`, `valuable`), unnecessary bold-label bullet formatting, and em/en dashes (`—`, `–`) in prose.
