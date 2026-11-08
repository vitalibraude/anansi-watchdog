# Corpus audit and browser explorer

AI-assisted extension for Vitali Pavlovski's Anansi Watchdog project.
This is inventory tooling, not a new model or evidence of model safety.
It makes the existing corpus inspectable without an API key or paid calls.

## Run

From the repository root, Python 3.10+ with no additional dependencies:

```bash
python scripts/audit_corpus.py tests --strict --output audit.json
python -m unittest tests_unit.test_corpus_audit -v
```

Open `tools/corpus-explorer/index.html` in a browser and choose the generated
JSON file. A public sample from commit
`de2e27fae043dcf46066a3664adcce40d53abe11` is bundled. The explorer works
without a build step and uses no external scripts or model APIs.
Its copy of `audit_corpus.py` is byte-identical to `scripts/audit_corpus.py`
at this release, provided for convenient download from static hosting.

## What is checked

- JSON suite shape and required case metadata.
- Case-level categories, falling back to suite-level categories.
- Duplicate IDs across all files, not just within a suite.
- Duplicate prompts after lowercasing and whitespace collapsing only.
- Declared `total_tests` mismatches, category/severity counts and tag counts.
- Empty input is a review warning, not automatically an invalid scenario.
  The original `edge_001` explicitly tests empty input. Do not delete it to
  make a warning counter zero.
- SHA256 of each source file, relative path and case position for traceability.

`--strict` exits 1 for structural errors or duplicate IDs, 0 for warnings
alone. An unreadable/missing corpus directory exits 2. Symlinked JSON files
are skipped. The default corpus is `tests`, not `tests_unit`.
Write reports outside the corpus directory so the next audit does not
mistake its own output for another test suite. Input files are not changed.

The report is deterministic for the same paths and bytes, without a timestamp
or an absolute local path. It omits prompt and expected-response text.
IDs, tags, paths and file/prompt hashes may still reveal information. Review
reports before sharing; this is data minimization, not anonymization.

## Browser behavior

- Category/severity filters and search by ID, relative path or tag.
- Download all matching rows as JSON, independent of the 300-row display cap.
- Open local audit reports up to 2MB and 10,000 case rows.
- Report text is inserted as text, never interpreted as HTML.
- Local report contents are not uploaded by this app. Ordinary hosting
  requests still reach the hosting platform. No analytics code is included.
- Filters do not recalculate the whole-corpus totals or severity matrix.
- Filtered-row downloads are a different schema, not full audit reports.

## Observed sample results, November 8, 2026

On the unchanged corpus at the source commit above:

- 24 JSON files, 290 scenarios, 16 declared categories.
- 290 structurally valid scenarios, 0 structural errors.
- 0 duplicate ID groups and 0 normalized duplicate prompt groups.
- 1 review warning: the intentionally empty `edge_001` prompt.

These numbers are inventory results only. They do not mean 290 independently
validated behaviors, comprehensive coverage, semantic diversity, safety
certification, good model performance or successful real-model evaluation.
Category/severity labels were read from the corpus, not independently graded.
No prompt corpus or expected response was rewritten to improve these results.

## Verification performed

- 20 new synthetic auditor test methods passed.
- Full existing plus new Python unit suite: 47 passed, one pre-existing
  PytestCollectionWarning for the `TestRunner` class name.
- Browser checks: sample counts, category/severity/search filters, reset,
  filtered download, malformed JSON, wrong schema, HTML treated as text,
  no page errors, and no page-level horizontal overflow at 390px.
- Desktop and mobile rendering inspected. The wide table scrolls horizontally
  inside its own container on mobile.

This verifies those contracts and rendering, not every possible malformed
report or browser. No paid model calls were made. Existing offline-model
regression tests run as part of the unit suite, not a new AI benchmark.

## Scope

Original project and corpus: Vitali Pavlovski, MIT license.
This audit module, synthetic tests, explorer and documentation were written
with AI assistance. Existing detector behavior and original corpus are
unchanged. The original broad marketing claims elsewhere in this repository
are not established by this audit.
