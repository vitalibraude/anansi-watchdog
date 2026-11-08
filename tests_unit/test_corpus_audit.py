"""Synthetic contract tests for the inventory auditor, not safety benchmarks."""
import json
from pathlib import Path
import tempfile
import unittest
from scripts.audit_corpus import audit, main, normalize


def case(**changes):
    result = dict(id="a", prompt="Hello world", expected_behavior="Respond", tags=["basic"], severity="medium")
    result.update(changes)
    return result


class CorpusAuditTests(unittest.TestCase):
    def setUp(self):
        self.temp = tempfile.TemporaryDirectory()
        self.addCleanup(self.temp.cleanup)
        self.root = Path(self.temp.name)

    def suite(self, cases, **changes):
        data = dict(category="example", tests=cases)
        data.update(changes)
        (self.root / "suite.json").write_text(json.dumps(data))
        return audit(self.root)

    def codes(self, report):
        return [x["code"] for x in report["findings"]]

    def test_valid_inherits_category_and_default_severity(self):
        r = self.suite([case()])
        self.assertEqual(r["summary"]["valid_cases"], 1)
        self.assertEqual(r["severity_matrix"], {"example": {"medium": 1}})

    def test_empty_directory(self):
        self.assertIn("empty_corpus", self.codes(audit(self.root)))

    def test_missing_directory(self):
        with self.assertRaises(ValueError):
            audit(self.root / "missing")

    def test_invalid_json(self):
        (self.root / "bad.json").write_text("{")
        self.assertIn("invalid_json", self.codes(audit(self.root)))

    def test_invalid_utf8(self):
        (self.root / "bad.json").write_bytes(b"\xff")
        self.assertIn("invalid_json", self.codes(audit(self.root)))

    def test_invalid_suite_shape(self):
        for value in ([], None, {"tests": {}}):
            (self.root / "bad.json").write_text(json.dumps(value))
            self.assertIn("invalid_suite", self.codes(audit(self.root)))

    def test_nonobject_case_counted_but_not_valid(self):
        r = self.suite([4])
        self.assertEqual(r["summary"]["cases"], 1)
        self.assertEqual(r["summary"]["valid_cases"], 0)

    def test_required_fields(self):
        for key in ("id", "expected_behavior"):
            for bad in (None, "", "  ", [], 2):
                self.assertIn("missing_" + key, self.codes(self.suite([case(**{key: bad})])))

    def test_prompt_missing_vs_intentionally_empty(self):
        for bad in (None, [], 2):
            self.assertIn("missing_prompt", self.codes(self.suite([case(prompt=bad)])))
        r = self.suite([case(prompt="", test_type="empty_input")])
        self.assertEqual(r["summary"]["errors"], 0)
        self.assertEqual(r["summary"]["warnings"], 1)
        self.assertEqual(r["summary"]["valid_cases"], 1)

    def test_bad_tags(self):
        for value in (None, "x", [5], [""]):
            self.assertIn("invalid_tags", self.codes(self.suite([case(tags=value)])))

    def test_bad_category(self):
        self.assertIn("missing_category", self.codes(self.suite([case()], category=[])))

    def test_bad_severity(self):
        for bad in ([], "severe", 2):
            self.assertIn("invalid_severity", self.codes(self.suite([case(severity=bad)])))

    def test_count_mismatch_warning(self):
        r = self.suite([case()], total_tests=3)
        self.assertEqual(r["summary"]["warnings"], 1)
        self.assertEqual(r["summary"]["errors"], 0)

    def test_boolean_count_not_accepted(self):
        self.assertIn("count_mismatch", self.codes(self.suite([case()], total_tests=True)))

    def test_duplicate_ids_across_files(self):
        self.suite([case()])
        (self.root / "second.json").write_text(json.dumps(dict(category="x", tests=[case()])))
        self.assertEqual(audit(self.root)["summary"]["duplicate_id_groups"], 1)

    def test_normalized_duplicates_not_semantic(self):
        r = self.suite([case(), case(id="b", prompt=" HELLO\n world "), case(id="c", prompt="hello planet")])
        self.assertEqual(r["summary"]["duplicate_prompt_groups"], 1)
        self.assertEqual(normalize(" HEllo\tWORLD "), "hello world")

    def test_privacy_no_prompt_or_expectation_in_report(self):
        r = self.suite([case(prompt="private distinctive sentence", expected_behavior="private expected sentence")])
        encoded = json.dumps(r)
        self.assertNotIn("private distinctive sentence", encoded)
        self.assertNotIn("private expected sentence", encoded)

    def test_deterministic_and_content_hash_changes(self):
        r = self.suite([case()])
        self.assertEqual(r, audit(self.root))
        changed = self.suite([case(prompt="another")])
        self.assertNotEqual(r["sources"][0]["sha256"], changed["sources"][0]["sha256"])

    def test_symlink_file_ignored(self):
        self.suite([case()])
        (self.root / "link.json").symlink_to(self.root / "suite.json")
        self.assertEqual(audit(self.root)["summary"]["files"], 1)

    def test_cli_strict_and_output(self):
        self.suite([case(), case()])
        output = self.root / "report.txt"
        self.assertEqual(main([str(self.root), "--strict", "--output", str(output)]), 1)
        self.assertEqual(json.loads(output.read_text())["schema"], "anansi-corpus-audit/v1")


if __name__ == "__main__":
    unittest.main()
