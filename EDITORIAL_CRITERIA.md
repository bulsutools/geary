# Editorial Criteria & Content Standard (`EDITORIAL_CRITERIA.md`)

Use these criteria before writing or updating any Geary guide.

---

## 1. Content Tiers & Inclusion Gate

Every Geary article must solve a concrete student question, task, or problem within one of three tiers:

1. **Official BulSU Processes (Sourced):** Admissions, enrollment, shifting, grading (`4.00`, `INC`, `FDA`), honors, graduation, scholarships, Registrar records, campus policies, student orgs, and campus services backed by official BulSU sources (`BOR Resolution No. 85, s. 2016` or verified university advisories).
2. **Campus Life & Local Directory:** Practical student logistics around BulSU (study spots, food near campus, printing, commuting, Wi-Fi, portal help, lost and found) grounded in verifiable student knowledge without inventing official fees, schedules, or office policies.
3. **College Survival & Career Prep:** Actionable peer advice for freshmen, undergrads, and graduating students (contacting professors, thesis prep, internships, resumes, study habits) tailored to BulSU and Philippine college realities.

**Inclusion Gate (All 3 Required):**
- **Clear Student Intent:** Answers a real question or guides a specific task (`How to...`, `What Happens When...`, `Where to...`, `Can I...`).
- **Substance Over Filler:** Contains concrete steps, rules, tips, checklists, or verified facts—never generic motivational fluff.
- **Standalone Worth:** Enough depth for its own page; never ship a 3-sentence stub.

---

## 2. Exclusion Gate (Skip Outright)

- **Internal Staff Mandates:** Office charters, employee duties, and administrative checklists meant for university personnel rather than students.
- **Ceremonial & Template Pages:** History essays, quality policy statements, song lyrics, tear-sheet forms, and CHED/HEI compliance annexes.
- **Duplicate Workflows:** Never create multiple pages for the same process (e.g., separate pages for "How to File an LOA" and "How to Process a Leave of Absence", or repeating "Replacement ID" across categories). Keep one canonical guide per workflow.
- **Micro-FAQs:** Single-answer questions (`"Is There an Age Limit for Admission?"`, `"What Is a Block Section?"`) belong inside a parent FAQ or overview guide, not as thin standalone pages.

---

## 3. Title, Taxonomy & Structure Rules

- **Friendly, Search-First Titles:** Prefer plain, conversational titles matching how students search (`"How to Compute Your GWA"`, `"What Happens When You Fail a Subject?"`, `"Where to Eat Near BulSU"`). Keep titles concise (`<= 60` characters when possible) and skip stiff handbook phrasing.
- **Category & Subcategory Discipline:** Assign each article to one of the 7 canonical slugs in `src/data/categories.ts` (`enrollment`, `academics`, `documents`, `scholarships`, `policies`, `organizations`, `campus`) and reuse existing `subcategory` headings within each category.
- **Scannable Layout:** Open with a 1-2 sentence direct answer, then use short paragraphs, numbered steps, clean tables, and callouts (`>`).

---

## 4. Voice & Citation Standard

- **Peer Tone (`humanizer`):** Write like a helpful upperclassman explaining things clearly to a freshman—warm, direct, and practical. Avoid bureaucratic stiffness, chatbot intros, repeated section closers, forced triads, stock AI words (`crucial`, `pivotal`, `delve`, `enhance`, `ensure`, `valuable`), unnecessary bold-label bullet spam, and em/en dashes (`—`, `–`) in prose.
- **Honest Sourcing:** Include `source`/`sourceUrl` or a `sources` list (`- label` / `url`) in frontmatter on every guide derived from official BulSU documents or advisories so `ArticleLayout.astro` renders all references inside the Source card. Omit source frontmatter on general survival, career, or community-curated guides rather than citing an unrelated handbook section, and never invent unverified hotlines, fees, or room numbers.
