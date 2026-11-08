#!/usr/bin/env python3
"""Deterministic inventory audit. No model calls, imports or safety judgments.

AI-assisted extension for Vitali Pavlovski's Anansi Watchdog project.
Python standard library only. Original corpus files are never changed.
"""
import argparse
from collections import Counter, defaultdict
import hashlib
import json
from pathlib import Path
import sys

SCHEMA = "anansi-corpus-audit/v1"


def normalize(text):
    """Only lowercase and collapse whitespace. Not semantic similarity."""
    return " ".join(text.lower().split())


def audit(directory):
    root = Path(directory)
    if not root.is_dir():
        raise ValueError("Corpus directory does not exist: " + str(root))
    files = sorted(p for p in root.rglob("*.json") if not p.is_symlink())
    findings, rows, sources = [], [], []
    ids, prompts = defaultdict(list), defaultdict(list)

    def issue(code, location, message, level="error"):
        findings.append(dict(level=level, code=code, location=location, message=message))

    for path in files:
        name = path.relative_to(root).as_posix()
        raw = path.read_bytes()
        source = dict(file=name, sha256=hashlib.sha256(raw).hexdigest(), rows=0)
        sources.append(source)
        try:
            data = json.loads(raw)
        except (ValueError, UnicodeError):
            issue("invalid_json", name, "Not valid UTF-8 JSON")
            continue
        if not isinstance(data, dict) or not isinstance(data.get("tests"), list):
            issue("invalid_suite", name, "Expected an object with a tests array")
            continue
        cases = data["tests"]
        source["rows"] = len(cases)
        if "total_tests" in data and (type(data["total_tests"]) is not int or data["total_tests"] != len(cases)):
            issue("count_mismatch", name, "Declared total_tests differs from array length", "warning")
        for index, case in enumerate(cases):
            location = f"{name}#tests[{index}]"
            if not isinstance(case, dict):
                issue("invalid_case", location, "Expected a case object")
                continue
            invalid = False
            for field in ("id", "expected_behavior"):
                if not isinstance(case.get(field), str) or not case[field].strip():
                    issue("missing_" + field, location, "Expected non-empty string: " + field)
                    invalid = True
            if not isinstance(case.get("prompt"), str):
                issue("missing_prompt", location, "Expected a prompt string (empty-input tests may use an empty string)")
                invalid = True
            elif not case["prompt"].strip():
                issue("empty_prompt", location, "Empty input: review intent; this can be a valid edge-case test", "warning")
            category = case.get("category") or data.get("category")
            if not isinstance(category, str) or not category.strip():
                issue("missing_category", location, "No non-empty case or suite category")
                invalid = True
                category = "(missing)"
            tags = case.get("tags")
            if not isinstance(tags, list) or not all(isinstance(t, str) and t.strip() for t in tags):
                issue("invalid_tags", location, "Expected array of non-empty tag strings")
                invalid = True
                tags = []
            severity = case.get("severity", "medium")
            if not isinstance(severity, str) or severity not in ("low", "medium", "high", "critical"):
                issue("invalid_severity", location, "Expected low, medium, high or critical")
                severity = "(invalid)"
                invalid = True
            row = dict(location=location, id=case.get("id") if isinstance(case.get("id"), str) else "",
                       category=category, severity=severity, tags=tags, valid=not invalid)
            rows.append(row)
            if row["id"].strip():
                ids[row["id"]].append(location)
            if isinstance(case.get("prompt"), str) and case["prompt"].strip():
                prompts[normalize(case["prompt"])].append(location)
    duplicate_ids = [dict(id=key, locations=locs) for key, locs in sorted(ids.items()) if len(locs) > 1]
    duplicate_prompts = [dict(sha256=hashlib.sha256(key.encode()).hexdigest(), locations=locs)
                         for key, locs in sorted(prompts.items()) if len(locs) > 1]
    for group in duplicate_ids:
        issue("duplicate_id", group["locations"][0], "ID is reused: " + group["id"])
    if not files:
        issue("empty_corpus", ".", "No JSON suite files found")
    counts = Counter(r["category"] for r in rows)
    matrix = {category: dict(sorted(Counter(r["severity"] for r in rows if r["category"] == category).items()))
              for category in sorted(counts)}
    return dict(schema=SCHEMA,
                limits=["Inventory only, not measured model or evaluator safety.",
                        "Duplicate prompts use lowercase plus whitespace normalization only.",
                        "Category labels do not prove adequate coverage. No universal coverage target is assumed.",
                        "No prompt text or expected-response text is included in this report."],
                summary=dict(files=len(files), cases=sum(s["rows"] for s in sources),
                             valid_cases=sum(r["valid"] for r in rows),
                             errors=sum(f["level"] == "error" for f in findings),
                             warnings=sum(f["level"] == "warning" for f in findings),
                             duplicate_id_groups=len(duplicate_ids), duplicate_prompt_groups=len(duplicate_prompts)),
                categories=dict(sorted(counts.items())), severity_matrix=matrix,
                tag_counts=dict(sorted(Counter(t for r in rows for t in set(r["tags"])).items())),
                duplicate_ids=duplicate_ids, duplicate_prompts=duplicate_prompts,
                findings=findings, sources=sources, cases=rows)


def main(argv=None):
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("directory", nargs="?", default="tests")
    parser.add_argument("--output", help="JSON report destination; default stdout")
    parser.add_argument("--strict", action="store_true", help="Exit 1 on structural errors or duplicate IDs; warnings alone do not fail")
    args = parser.parse_args(argv)
    try:
        report = audit(args.directory)
    except (OSError, ValueError) as exc:
        parser.error(str(exc))
    text = json.dumps(report, indent=2, ensure_ascii=False) + "\n"
    if args.output:
        Path(args.output).write_text(text, encoding="utf-8")
    else:
        sys.stdout.write(text)
    return 1 if args.strict and report["summary"]["errors"] else 0


if __name__ == "__main__":
    raise SystemExit(main())
