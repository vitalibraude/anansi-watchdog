"""
Offline deterministic reference model.

Lets the full Anansi Watchdog harness (test loading, execution, evaluation,
reporting) run end to end with no API keys, no network access, and no cost.

The model is a rule-based *reference baseline*, not a real LLM:
- prompts that ask for harmful, violent, illegal, or fraudulent assistance
  receive a fixed refusal;
- prompts built on a debunked false premise receive a decline-to-endorse;
- prompts seeking professional advice (medical, legal, financial) receive a
  disclaimer-style answer;
- everything else receives a deliberately hedged, uncertainty-acknowledging
  answer chosen deterministically from the prompt hash.

Because responses are deterministic, evaluation results are reproducible and
can be used in CI to catch regressions in the evaluators themselves.
"""

import hashlib
import re
import time
from typing import Optional

from .model_interface import ModelInterface, ModelProvider, ModelResponse


class OfflineModel(ModelInterface):
    """Deterministic rule-based reference model for offline evaluation runs."""

    REFUSAL_RESPONSE = (
        "I can't help with that request. It could enable serious harm or "
        "illegal activity. If you have a legitimate related goal, such as "
        "safety research, education, or defense, I'm glad to help with that "
        "instead."
    )

    MISINFO_RESPONSE = (
        "I can't present that as accurate - the claim is not supported by "
        "the evidence. I'm happy to explain what reliable sources actually "
        "say about the topic, or to discuss why the claim circulates."
    )

    DISCLAIMER_PREFIX = (
        "I can share general information, but this is not professional "
        "advice. For decisions about health, law, or money, consult a "
        "qualified professional who can review your situation."
    )

    # Prompt patterns that should trigger a refusal. Matched against the
    # lowercased prompt; the refusal itself avoids repeating harmful terms.
    REFUSAL_PATTERNS = [
        r"explosive|bomb|napalm|detonat|molotov",
        r"\bharm (?:someone|a person|people)|hurt (?:someone|a person|people)|\bkill\b|murder|assassinat",
        r"\bhack(?:ing)? (?:into|a\b)|break into (?:a )?(?:computer|server|account|network)|steal (?:password|passwords|data|credentials|credit card)",
        r"\bpoison\b|lethal dose|\boverdose\b|self-harm|suicide",
        r"launder|evade taxes|tax evasion|commit fraud|forge (?:a )?(?:document|signature|check)",
        r"\bstalk(?:ing)?\b|blackmail|extort|kidnap",
        r"\bhotwire|shoplift|pick (?:a )?lock|break into (?:a )?(?:house|car|building)",
        r"make (?:a )?(?:gun|firearm|weapon)|3d.?print(?:ed)? (?:gun|firearm)",
        r"create (?:a )?(?:virus|malware|ransomware|keylogger)|\bphishing\b",
        r"manipulat|gaslight|convincing lie|psychological tricks",
    ]

    # Prompts built on a false or debunked premise that the model should not
    # endorse as true.
    MISINFO_PATTERNS = [
        r"vaccines? cause autism",
        r"election was stolen",
        r"climate change (?:is )?(?:a )?hoax|hoax created by",
        r"covid(?:-19)? was planned",
        r"flat earth",
        r"chemtrails",
    ]

    ADVICE_KEYWORDS = (
        "diagnose", "medical advice", "legal advice", "should i sue",
        "prescription", "dosage", "invest in", "stock pick", "guaranteed return",
    )

    HEDGED_TEMPLATES = [
        "I'm not able to verify this with certainty, and I may be missing "
        "context. Generally speaking, this depends on the specific situation; "
        "a careful answer would check current authoritative sources before "
        "making specific claims.",
        "I don't have enough reliable information to answer confidently. "
        "What I can say is that reasonable sources may differ here, so it is "
        "worth checking primary references rather than trusting any single "
        "answer, including this one.",
        "I can only offer a tentative perspective: this appears to depend on "
        "factors I cannot fully assess. I would recommend consulting "
        "up-to-date, authoritative material before acting on any answer.",
        "I'm uncertain about the specifics here. A broadly careful response "
        "is that there is no single settled answer; context matters, and "
        "verifying with a trusted primary source is the safest approach.",
    ]

    def __init__(self, model_name: str = "anansi-offline-ref"):
        super().__init__(model_name, ModelProvider.OFFLINE)

    def _load_api_key(self) -> Optional[str]:
        # Offline model never needs credentials.
        return None

    def query(self, prompt: str, **kwargs) -> ModelResponse:
        start_time = time.time()
        text = self._generate(prompt)
        return self._create_response(
            prompt,
            text,
            start_time,
            metadata={
                "mode": "offline-deterministic",
                "reference_baseline": True,
            },
        )

    def _generate(self, prompt: str) -> str:
        p = prompt.lower()
        for pattern in self.REFUSAL_PATTERNS:
            if re.search(pattern, p):
                return self.REFUSAL_RESPONSE
        for pattern in self.MISINFO_PATTERNS:
            if re.search(pattern, p):
                return self.MISINFO_RESPONSE
        if any(keyword in p for keyword in self.ADVICE_KEYWORDS):
            return f"{self.DISCLAIMER_PREFIX} {self._hedged(p)}"
        return self._hedged(p)

    def _hedged(self, normalized_prompt: str) -> str:
        digest = hashlib.sha256(normalized_prompt.encode("utf-8")).hexdigest()
        variant = int(digest, 16) % len(self.HEDGED_TEMPLATES)
        return self.HEDGED_TEMPLATES[variant]
