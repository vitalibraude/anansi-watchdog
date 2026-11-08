#!/usr/bin/env python3
"""Compare two Anansi audit reports by unique case ID. Standard library only.

AI-assisted extension for Vitali Pavlovski. No model calls or safety score.
Content hashes cover exact case JSON with sorted object keys, not whitespace
in the source file. Reports never include raw prompt or expectation text.
"""
import argparse
from collections import Counter
import json
from pathlib import Path
import re
import sys


def index_report(report):
    if not isinstance(report, dict) or report.get("schema") != "anansi-corpus-audit/v1":
        raise ValueError("Expected anansi-corpus-audit/v1 report")
    cases, sources = report.get("cases"), report.get("sources")
    if not isinstance(cases, list) or not isinstance(sources, list):
        raise ValueError("Expected cases and sources arrays")
    indexed = {}
    for row in cases:
        if not isinstance(row, dict) or any(not isinstance(row.get(k), str) for k in ("id", "location", "category", "severity")):
            raise ValueError("Case is missing string identity or inventory fields")
        key = row["id"]
        if not key.strip() or key in indexed:
            raise ValueError("Cannot match missing or duplicate case IDs")
        if not isinstance(row.get("content_sha256"), str) or not re.fullmatch("[a-f0-9]{64}", row["content_sha256"]):
            raise ValueError("Missing content_sha256: regenerate both audits with the updated auditor")
        if not isinstance(row.get("tags"), list) or not all(isinstance(t, str) for t in row["tags"]):
            raise ValueError("Expected string tags")
        indexed[key] = row
    source_index = {}
    for row in sources:
        if not isinstance(row, dict) or not isinstance(row.get("file"), str) or not isinstance(row.get("sha256"), str) or not re.fullmatch("[a-f0-9]{64}", row["sha256"]):
            raise ValueError("Invalid source hash row")
        if row["file"] in source_index:
            raise ValueError("Duplicate source path")
        source_index[row["file"]] = row["sha256"]
    return indexed, source_index


def compare(before, after):
    old, old_files = index_report(before)
    new, new_files = index_report(after)
    shared = sorted(old.keys() & new.keys())
    changed = []
    for key in shared:
        fields = [k for k in ("content_sha256", "location", "category", "severity", "tags", "valid") if old[key].get(k) != new[key].get(k)]
        if fields:
            changed.append(dict(id=key, fields=fields, before={k: old[key].get(k) for k in fields}, after={k: new[key].get(k) for k in fields}))
    def delta(field):
        a, b = Counter(r[field] for r in old.values()), Counter(r[field] for r in new.values())
        return {k: b[k]-a[k] for k in sorted(a.keys() | b.keys()) if a[k] != b[k]}
    return dict(schema="anansi-corpus-comparison/v1",
                limits=["Inventory/content drift only, not safety or semantic improvement.",
                        "Case matching uses exact unique IDs; ID renames appear as removal plus addition.",
                        "Content hashes include metadata; they do not identify which hidden text field changed.",
                        "Hashes and IDs are not anonymization; review before sharing."],
                added_ids=sorted(new.keys()-old.keys()), removed_ids=sorted(old.keys()-new.keys()),
                changed_cases=changed, unchanged_cases=len(shared)-len(changed),
                category_delta=delta("category"), severity_delta=delta("severity"),
                files=dict(added=sorted(new_files.keys()-old_files.keys()), removed=sorted(old_files.keys()-new_files.keys()),
                           changed=sorted(k for k in old_files.keys() & new_files.keys() if old_files[k] != new_files[k])))


def main(argv=None):
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("before")
    parser.add_argument("after")
    parser.add_argument("--output")
    parser.add_argument("--fail-on-change", action="store_true", help="Exit 1 on any case or source-file drift")
    args = parser.parse_args(argv)
    try:
        result = compare(json.loads(Path(args.before).read_text()), json.loads(Path(args.after).read_text()))
    except (ValueError, OSError) as exc:
        parser.error(str(exc))
    text = json.dumps(result, indent=2, ensure_ascii=False) + "\n"
    if args.output:
        Path(args.output).write_text(text, encoding="utf-8")
    else:
        sys.stdout.write(text)
    drift = result["added_ids"] or result["removed_ids"] or result["changed_cases"] or any(result["files"].values())
    return 1 if args.fail_on_change and drift else 0


if __name__ == "__main__":
    raise SystemExit(main())
