"""End-to-end offline tests: corpus integrity, runner, evaluation, reports."""

import json
from pathlib import Path

import pytest

from core.model_interface import ModelFactory
from core.test_runner import TestRunner
from core.report_generator import ReportGenerator
from evaluators import (
    SafetyEvaluator,
    BiasDetector,
    HallucinationDetector,
    RiskScoreCalculator,
)

REPO_ROOT = Path(__file__).resolve().parents[1]
TEST_SUITES = sorted(REPO_ROOT.glob("tests/**/*.json"))


class TestCorpusIntegrity:
    def test_expected_suite_count(self):
        assert len(TEST_SUITES) == 24

    def test_all_suites_load_and_schema_is_valid(self):
        runner = TestRunner({}, output_dir="/tmp/anansi-test-outputs")
        total = 0
        for suite in TEST_SUITES:
            cases = runner.load_test_cases(str(suite))
            assert cases, f"{suite} loaded zero test cases"
            for case in cases:
                assert case.id and case.category
                # A prompt may be blank only when the suite deliberately
                # tests empty-input handling.
                if not case.prompt.strip():
                    extra = (case.metadata or {}).get("extra_fields", {})
                    assert extra.get("test_type") == "empty_input", case.id
                assert case.expected_behavior
                assert case.severity in ("low", "medium", "high", "critical")
            total += len(cases)
        assert total == 290

    def test_every_suite_declares_metadata(self):
        # Core suites name themselves with 'test_suite'; advanced suites use
        # 'domain' or nothing. The stable contract is category + description.
        nonstandard = []
        for suite in TEST_SUITES:
            data = json.loads(suite.read_text())
            assert data.get("category"), suite
            assert data.get("description"), suite
            if not data.get("test_suite"):
                nonstandard.append(str(suite))
        # Known inconsistency: the 10 advanced suites lack 'test_suite'.
        assert len(nonstandard) == 10
        assert all("/advanced/" in s for s in nonstandard)


@pytest.fixture(scope="module")
def offline_results(tmp_path_factory):
    """Run a representative slice of the corpus against the offline model."""
    output_dir = tmp_path_factory.mktemp("anansi-e2e")
    model = ModelFactory.create("offline")
    runner = TestRunner({"anansi-offline-ref": model}, output_dir=str(output_dir))

    cases = []
    for suite in TEST_SUITES:
        loaded = runner.load_test_cases(str(suite))
        cases.append(loaded[0])  # first case of every suite: one per category area
    assert len(cases) == 24

    results = runner.run_test_suite(cases, delay_between_tests=0)

    safety, bias, hallucination = SafetyEvaluator(), BiasDetector(), HallucinationDetector()
    calculator = RiskScoreCalculator()
    assessments = []
    for result in results:
        s = safety.evaluate(result.response, result.prompt)
        b = bias.evaluate(result.response, result.prompt)
        h = hallucination.evaluate(result.response, result.prompt)
        assessments.append(calculator.calculate(s, b, h))
    return runner, results, assessments, output_dir


class TestOfflineRun:
    def test_all_results_succeed_without_errors(self, offline_results):
        _, results, _, _ = offline_results
        assert len(results) == 24
        assert all(r.error is None for r in results)
        assert all(r.response.strip() for r in results)

    def test_safety_suite_prompt_gets_refusal(self, offline_results):
        _, results, _, _ = offline_results
        safety_results = [r for r in results if r.test_category == "safety"]
        assert safety_results, "expected at least one safety-category result"
        for r in safety_results:
            assert ("can't help" in r.response
                    or "can't present that as accurate" in r.response), r.test_id

    def test_assessments_are_well_formed(self, offline_results):
        _, _, assessments, _ = offline_results
        for a in assessments:
            assert 0.0 <= a.overall_risk_score <= 1.0
            assert isinstance(a.passed, bool)
            assert a.risk_level in ("safe", "low", "medium", "high", "critical")


class TestReportGeneration:
    def test_markdown_and_json_reports(self, offline_results):
        runner, results, assessments, output_dir = offline_results
        generator = ReportGenerator(output_dir=str(output_dir))
        md_path = generator.generate_markdown_report(
            results, assessments, runner.test_suite_id)
        json_path = generator.generate_json_report(
            results, assessments, runner.test_suite_id)

        md = Path(md_path).read_text()
        assert "anansi-offline-ref" in md
        assert Path(json_path).exists()
        report = json.loads(Path(json_path).read_text())
        assert report["total_tests"] == 24
        assert len(report["results"]) == 24
        for entry in report["results"]:
            assert set(entry) == {"test_result", "risk_assessment"}

    def test_save_results_roundtrip(self, offline_results):
        runner, results, _, _ = offline_results
        path = Path(runner.save_results())
        data = json.loads(path.read_text())
        assert data["total_tests"] == 24
