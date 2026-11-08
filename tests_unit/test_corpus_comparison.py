"""Synthetic regression comparison contracts. No model calls."""
import copy
import json
from pathlib import Path
import tempfile
import unittest
from scripts.audit_corpus import audit
from scripts.compare_corpus import compare, main


class ComparisonTests(unittest.TestCase):
    def setUp(self):
        self.temp = tempfile.TemporaryDirectory()
        self.addCleanup(self.temp.cleanup)
        self.root = Path(self.temp.name)
        self.case = dict(id="a", prompt="private prompt", expected_behavior="private answer", tags=["x"], severity="low")
        self.before = self.make([self.case])

    def make(self, cases, **kwargs):
        (self.root / "suite.json").write_text(json.dumps(dict(category="example", tests=cases, **kwargs)))
        return audit(self.root)

    def test_identical(self):
        r = compare(self.before, self.before)
        self.assertEqual(r["unchanged_cases"], 1)
        self.assertFalse(r["changed_cases"])

    def test_prompt_only_edit(self):
        after = self.make([dict(self.case, prompt="new private prompt")])
        r = compare(self.before, after)
        self.assertEqual(r["changed_cases"][0]["fields"], ["content_sha256"])
        self.assertNotIn("private prompt", json.dumps(r))
        self.assertNotIn("private answer", json.dumps(r))

    def test_expectation_only_edit(self):
        self.assertTrue(compare(self.before, self.make([dict(self.case, expected_behavior="new")]))["changed_cases"])

    def test_added_removed_renamed(self):
        r = compare(self.before, self.make([dict(self.case, id="b")]))
        self.assertEqual(r["added_ids"], ["b"])
        self.assertEqual(r["removed_ids"], ["a"])

    def test_location_only(self):
        after = copy.deepcopy(self.before)
        after["cases"][0]["location"] = "moved.json#tests[0]"
        self.assertEqual(compare(self.before, after)["changed_cases"][0]["fields"], ["location"])

    def test_drift_counts(self):
        after = self.make([dict(self.case, severity="high", category="other")])
        r = compare(self.before, after)
        self.assertEqual(r["severity_delta"], {"high": 1, "low": -1})
        self.assertEqual(r["category_delta"], {"example": -1, "other": 1})

    def test_duplicate_id_refused(self):
        with self.assertRaises(ValueError):
            compare(self.before, self.make([self.case, self.case]))

    def test_old_report_hash_missing(self):
        old = copy.deepcopy(self.before)
        del old["cases"][0]["content_sha256"]
        with self.assertRaisesRegex(ValueError, "regenerate"):
            compare(old, self.before)

    def test_invalid_input(self):
        for value in (None, [], {}, {"schema": "other"}):
            with self.assertRaises(ValueError):
                compare(value, self.before)

    def test_source_whitespace_change_only(self):
        (self.root / "suite.json").write_text(json.dumps(dict(category="example", tests=[self.case]), indent=4))
        r = compare(self.before, audit(self.root))
        self.assertFalse(r["changed_cases"])
        self.assertEqual(r["files"]["changed"], ["suite.json"])

    def test_metadata_change(self):
        r = compare(self.before, self.make([dict(self.case, note="review")]))
        self.assertEqual(r["changed_cases"][0]["fields"], ["content_sha256"])

    def test_cli_change_exit(self):
        a, b, out = self.root / "a.txt", self.root / "b.txt", self.root / "out.txt"
        a.write_text(json.dumps(self.before))
        b.write_text(json.dumps(self.make([dict(self.case, prompt="new")])) )
        self.assertEqual(main([str(a), str(b), "--output", str(out), "--fail-on-change"]), 1)
        self.assertEqual(main([str(a), str(a), "--output", str(out), "--fail-on-change"]), 0)


if __name__ == "__main__":
    unittest.main()
