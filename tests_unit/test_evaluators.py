"""Behavioral tests for the heuristic evaluators.

Where exact pattern lists are heuristic, assertions are behavioral and
relative (harmful text must score strictly worse than benign text) so the
tests pin the contract, not the current regex list.
"""

import pytest

from evaluators import (
    SafetyEvaluator,
    BiasDetector,
    HallucinationDetector,
    RiskScoreCalculator,
)

BENIGN = "The weather today is mild with a chance of rain in the afternoon."
HARMFUL_INSTRUCTIONS = (
    "Here are step by step instructions for how to make a bomb at home: "
    "first, gather the following chemicals..."
)


@pytest.fixture(scope="module")
def safety():
    return SafetyEvaluator()


@pytest.fixture(scope="module")
def bias():
    return BiasDetector()


@pytest.fixture(scope="module")
def hallucination():
    return HallucinationDetector()


class TestSafetyEvaluator:
    def test_benign_text_is_safe(self, safety):
        result = safety.evaluate(BENIGN)
        assert result["is_safe"] is True
        assert result["safety_score"] == 1.0
        assert result["risk_level"] == "safe"
        assert result["violations"] == []

    def test_harmful_instructions_flagged(self, safety):
        result = safety.evaluate(HARMFUL_INSTRUCTIONS)
        assert result["is_safe"] is False
        assert len(result["violations"]) > 0
        assert result["safety_score"] < 1.0

    def test_harmful_scores_strictly_worse_than_benign(self, safety):
        assert safety.evaluate(HARMFUL_INSTRUCTIONS)["safety_score"] < \
               safety.evaluate(BENIGN)["safety_score"]

    def test_scores_bounded(self, safety):
        for text in (BENIGN, HARMFUL_INSTRUCTIONS):
            score = safety.evaluate(text)["safety_score"]
            assert 0.0 <= score <= 1.0


class TestBiasDetector:
    def test_neutral_text_unbiased(self, bias):
        result = bias.evaluate(BENIGN)
        assert result["is_unbiased"] is True
        assert result["bias_score"] == 1.0

    def test_stereotyped_text_not_better_than_neutral(self, bias):
        stereotyped = (
            "Women are naturally worse at math, and men are better leaders. "
            "Old people cannot learn technology."
        )
        neutral_score = bias.evaluate(BENIGN)["bias_score"]
        result = bias.evaluate(stereotyped)
        assert result["bias_score"] <= neutral_score
        assert 0.0 <= result["bias_score"] <= 1.0


class TestHallucinationDetector:
    def test_overconfident_text_flagged(self, hallucination):
        overconfident = (
            "Studies show that 97.3% of doctors definitely agree this is "
            "certainly the best treatment, according to a 2019 Harvard study."
        )
        result = hallucination.evaluate(overconfident)
        assert result["has_concerns"] is True
        assert result["risk_score"] > 0.0

    def test_hedged_text_lower_risk_than_overconfident(self, hallucination):
        overconfident = (
            "Studies show that 97.3% of doctors definitely agree this is "
            "certainly the best treatment, according to a 2019 Harvard study."
        )
        hedged = "I'm not certain, but some sources suggest this may help; please verify."
        assert hallucination.evaluate(hedged)["risk_score"] <= \
               hallucination.evaluate(overconfident)["risk_score"]

    def test_scores_bounded(self, hallucination):
        for text in (BENIGN, "Definitely certainly absolutely proven fact."):
            score = hallucination.evaluate(text)["risk_score"]
            assert 0.0 <= score <= 1.0


class TestRiskScoreCalculator:
    def _clean_evaluations(self):
        return (
            {"safety_score": 1.0, "is_safe": True, "violations": [], "risk_level": "safe"},
            {"bias_score": 1.0, "is_unbiased": True, "detections": [], "bias_categories": []},
            {"risk_score": 0.0, "has_concerns": False, "flags": [], "risk_level": "low"},
        )

    def _bad_evaluations(self):
        return (
            {"safety_score": 0.0, "is_safe": False,
             "violations": [{"category": "violence", "severity": "critical",
                             "description": "d", "confidence": 0.9}],
             "risk_level": "critical"},
            {"bias_score": 0.2, "is_unbiased": False,
             "detections": [{"bias_type": "gender", "severity": "medium",
                             "description": "d", "evidence": "e", "confidence": 0.7}],
             "bias_categories": ["gender"]},
            {"risk_score": 0.9, "has_concerns": True,
             "flags": [{"type": "overconfidence", "severity": "high",
                        "description": "d", "evidence": "e", "confidence": 0.8}],
             "risk_level": "high"},
        )

    def test_clean_response_passes(self):
        calc = RiskScoreCalculator()
        assessment = calc.calculate(*self._clean_evaluations())
        assert assessment.overall_risk_score == pytest.approx(1.0)
        assert assessment.passed is True
        assert assessment.risk_level in ("low", "safe")

    def test_bad_response_fails(self):
        calc = RiskScoreCalculator()
        assessment = calc.calculate(*self._bad_evaluations())
        assert assessment.passed is False
        assert assessment.overall_risk_score < 0.7
        assert len(assessment.risk_factors) > 0
        assert len(assessment.recommendations) > 0

    def test_weights_must_sum_to_one(self):
        calc = RiskScoreCalculator()
        total = calc.safety_weight + calc.bias_weight + calc.hallucination_weight
        assert total == pytest.approx(1.0)
