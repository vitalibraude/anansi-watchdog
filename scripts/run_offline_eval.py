#!/usr/bin/env python3
"""
Run the full Anansi Watchdog corpus offline against the deterministic
reference model and write results + reports to a timestamped directory.

Usage:
    python3 scripts/run_offline_eval.py [output_root]

No API keys, no network access, no cost. Produces the same artifacts as a
real model run (raw results JSON, Markdown report, JSON report) so the
pipeline can be validated end to end in CI.
"""

import json
import sys
from datetime import datetime
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from core.model_interface import ModelFactory
from core.test_runner import TestRunner
from core.report_generator import ReportGenerator
from evaluators import (
    SafetyEvaluator,
    BiasDetector,
    HallucinationDetector,
    RiskScoreCalculator,
)


def main() -> int:
    root = Path(__file__).resolve().parents[1]
    output_root = Path(sys.argv[1]) if len(sys.argv) > 1 else root / "outputs"
    run_dir = output_root / ("offline_" + datetime.now().strftime("%Y%m%d_%H%M%S"))
    run_dir.mkdir(parents=True, exist_ok=True)

    suite_files = sorted(root.glob("tests/**/*.json"))
    model = ModelFactory.create("offline")
    runner = TestRunner({model.model_name: model}, output_dir=str(run_dir))

    cases = []
    for suite in suite_files:
        cases.extend(runner.load_test_cases(str(suite)))
    print(f"Loaded {len(cases)} prompts from {len(suite_files)} suites")

    results = runner.run_test_suite(cases, delay_between_tests=0)

    safety, bias = SafetyEvaluator(), BiasDetector()
    hallucination, calculator = HallucinationDetector(), RiskScoreCalculator()
    assessments = []
    for result in results:
        s = safety.evaluate(result.response, result.prompt)
        b = bias.evaluate(result.response, result.prompt)
        h = hallucination.evaluate(result.response, result.prompt)
        assessment = calculator.calculate(s, b, h)
        assessments.append(assessment)
        result.evaluation_score = assessment.overall_risk_score
        result.passed = assessment.passed

    generator = ReportGenerator(output_dir=str(run_dir))
    md_report = generator.generate_markdown_report(results, assessments, runner.test_suite_id)
    json_report = generator.generate_json_report(results, assessments, runner.test_suite_id)
    raw = runner.save_results()

    passed = sum(1 for a in assessments if a.passed)
    refusals = sum(1 for r in results if "can't help" in r.response)
    summary = {
        "run_dir": str(run_dir),
        "model": model.model_name,
        "suites": len(suite_files),
        "prompts": len(cases),
        "errors": sum(1 for r in results if r.error),
        "refusals": refusals,
        "passed": passed,
        "pass_rate": round(passed / len(assessments), 3),
        "markdown_report": md_report,
        "json_report": json_report,
        "raw_results": raw,
    }
    (run_dir / "summary.json").write_text(json.dumps(summary, indent=2))
    print(json.dumps(summary, indent=2))
    return 0


if __name__ == "__main__":
    sys.exit(main())
