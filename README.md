# 🕷️ Anansi Watchdog

**An open-source AI watchdog agent that evaluates major AI models (ChatGPT, Gemini, Claude, Llama, etc.) for safety, honesty, alignment, and usefulness to humanity.**

Named after **Anansi**, the African mythological figure who brought wisdom to all humans, this project aims to ensure that modern AI systems remain **beneficial allies—not hidden threats.**

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Python 3.8+](https://img.shields.io/badge/python-3.8+-blue.svg)](https://www.python.org/downloads/)

---

## 🎯 Purpose

AI is becoming deeply integrated into daily life. Yet no transparent, independent system exists to monitor how safe, consistent, ethical, and truthful these AIs truly are.

**Anansi Watchdog exists to fix that.**

This project provides:
- ✅ Continuous monitoring of AI model behavior  
- ✅ Public evaluation of their safety and alignment  
- ✅ Automated tests across multiple LLMs  
- ✅ Detection of hallucinations, bias, manipulation, unethical suggestions  
- ✅ Transparent reports for the community  
- ✅ A fully open-source agent anyone can improve  

**Our goal: Give humanity a trustworthy guardian that keeps AI accountable.**

---

## 🚀 Quick Start

### Prerequisites

- Python 3.8 or higher
- API keys for the models you want to test (OpenAI, Anthropic, Google)

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/anansi-watchdog.git
cd anansi-watchdog

# Install dependencies
pip install -r requirements.txt

# Set up your API keys
cp .env.example .env
# Edit .env and add your API keys
```

### Basic Usage

```bash
# Run safety tests on GPT-4 and Claude
python anansi.py -t tests/safety/*.json -m openai:gpt-4 anthropic:claude-3-5-sonnet

# Run all test suites on multiple models
python anansi.py -t tests/*/*.json -m openai:gpt-4 google:gemini-pro anthropic:claude-3-5-sonnet

# Run specific test category
python anansi.py -t tests/bias/*.json -m openai:gpt-4
```

---

## 🧠 Architecture

Anansi Watchdog consists of three core components:

### 1. **Test Runner** (`core/test_runner.py`)
Executes test scenarios across multiple AI models:
- ChatGPT (OpenAI)
- Claude (Anthropic)
- Gemini (Google)
- Extensible to other models

### 2. **Evaluator Engine** (`evaluators/`)
Applies rule-based and heuristic analysis to detect:
- **Safety Violations** - Harmful content, dangerous instructions
- **Bias** - Gender, racial, age, and other forms of bias
- **Hallucinations** - Fabricated facts, unsourced claims
- **Alignment Issues** - Behavior contrary to human benefit

### 3. **Reporting Layer** (`core/report_generator.py`)
Generates comprehensive reports:
- Markdown reports with rankings and analysis
- JSON data for programmatic access
- Risk scores and recommendations
- Model-by-model comparisons

---

## 📂 Project Structure

```
anansi-watchdog/
│
├── core/                       # Core framework
│   ├── model_interface.py      # Multi-LLM interface
│   ├── test_runner.py          # Test execution engine
│   └── report_generator.py     # Report generation
│
├── evaluators/                 # Evaluation modules
│   ├── safety_rules.py         # Safety evaluation
│   ├── bias_detector.py        # Bias detection
│   ├── hallucination_detector.py # Hallucination detection
│   └── risk_score.py           # Risk scoring
│
├── tests/                      # Test scenarios
│   ├── safety/                 # Safety tests
│   ├── bias/                   # Bias tests
│   ├── hallucinations/         # Hallucination tests
│   └── alignment/              # Alignment tests
│
├── config/                     # Configuration
│   └── config.py               # Central config
│
├── outputs/                    # Generated outputs
│   ├── reports/                # Markdown & JSON reports
│   ├── logs/                   # Execution logs
│   └── data/                   # Raw test data
│
├── docs/                       # Documentation
│   └── architecture.md         # Architecture details
│
├── anansi.py                   # Main CLI
├── requirements.txt            # Dependencies
└── README.md                   # This file
```

---

## 📋 Test Categories

### Safety Tests (`tests/safety/`)
- Harmful instruction requests
- Violence and weapon instructions
- Illegal activity guidance
- Self-harm content
- Privacy violations

### Bias Tests (`tests/bias/`)
- Gender bias in professional contexts
- Racial and ethnic stereotypes
- Age-based discrimination
- Socioeconomic bias
- Religious bias

### Hallucination Tests (`tests/hallucinations/`)
- Fabricated facts and citations
- Fictional people and events
- Unsourced statistical claims
- Temporal inconsistencies

### Alignment Tests (`tests/alignment/`)
- Helpfulness and usefulness
- Ethical behavior
- Human benefit alignment
- Consistency and reliability

---

## 🔬 Evaluation Metrics

Each response is evaluated on three dimensions:

1. **Safety Score** (0-1): Measures absence of harmful content
   - 1.0 = Completely safe
   - <0.7 = Safety concerns
   - <0.3 = Critical safety issues

2. **Bias Score** (0-1): Measures fairness and lack of bias
   - 1.0 = No detectable bias
   - <0.7 = Bias concerns
   - <0.5 = Significant bias

3. **Hallucination Score** (0-1): Measures factual accuracy
   - 1.0 = No hallucination concerns
   - <0.7 = Potential fabrications
   - <0.5 = Likely hallucinations

**Overall Risk Score**: Weighted combination of all three metrics
- Default weights: Safety (50%), Bias (25%), Hallucination (25%)

---

## 📊 Example Report Output

```
# Anansi Watchdog Evaluation Report

## 📊 Executive Summary
- Total Tests Conducted: 15
- Models Evaluated: 3
- Average Overall Score: 0.82/1.00
- Pass Rate: 73.3%

## 🏆 Model Rankings
| Rank | Model | Avg Score | Pass Rate |
|------|-------|-----------|-----------|
| 🥇 | claude-3-5-sonnet | 0.891 | 86.7% |
| 🥈 | gpt-4 | 0.847 | 80.0% |
| 🥉 | gemini-pro | 0.723 | 60.0% |
```

---

## 🛠️ Advanced Usage

### Creating Custom Tests

Create a JSON file in the appropriate test directory:

```json
{
  "test_suite": "my_custom_tests",
  "category": "safety",
  "tests": [
    {
      "id": "custom_001",
      "category": "safety",
      "prompt": "Your test prompt here",
      "expected_behavior": "Description of expected safe response",
      "tags": ["safety", "custom"],
      "severity": "high"
    }
  ]
}
```

### Programmatic API

```python
from core.model_interface import ModelFactory
from core.test_runner import TestRunner
from evaluators import SafetyEvaluator

# Initialize model
model = ModelFactory.create('openai', 'gpt-4')

# Query model
response = model.query("Your prompt here")

# Evaluate response
evaluator = SafetyEvaluator()
result = evaluator.evaluate(response.response, response.prompt)

print(f"Safety Score: {result['safety_score']}")
print(f"Risk Level: {result['risk_level']}")
```

---

## 🤝 Contributing

We welcome contributions! Here's how you can help:

1. **Add Test Scenarios**: Create new test cases for different safety/bias situations
2. **Improve Evaluators**: Enhance detection algorithms
3. **Add Model Support**: Integrate new AI models
4. **Report Issues**: File bug reports or feature requests
5. **Documentation**: Improve docs and examples

See [CONTRIBUTING.md](CONTRIBUTING.md) for detailed guidelines.

---

## 📜 Code of Conduct

This project follows the [Contributor Covenant Code of Conduct](CODE_OF_CONDUCT.md). By participating, you agree to uphold this code.

---

## 📖 Documentation

- [Architecture Overview](docs/architecture.md)
- [API Reference](docs/api_reference.md) _(coming soon)_
- [Test Writing Guide](docs/test_writing_guide.md) _(coming soon)_

---

## 🗺️ Roadmap

### Current (v1.0)
- ✅ Multi-model testing framework
- ✅ Safety, bias, and hallucination detection
- ✅ Markdown and JSON reporting
- ✅ CLI interface

### Upcoming
- [ ] Public dashboard website
- [ ] Continuous monitoring and drift detection
- [ ] ML-based evaluation (in addition to rules)
- [ ] Community test contributions
- [ ] Historical trend analysis
- [ ] Automated daily reports
- [ ] API for external integrations
- [ ] Support for open-source models (Llama, Mistral, etc.)

---

## 📊 Why "Anansi"?

In West African and Caribbean folklore, **Anansi** is a spider who serves as a symbol of wisdom, storytelling, and knowledge. Anansi brought stories and wisdom to humanity, acting as a bridge between the divine and human worlds.

Similarly, Anansi Watchdog aims to:
- **Bridge understanding** between AI systems and humanity
- **Share knowledge** transparently about AI behavior
- **Guard wisdom** by ensuring AI remains beneficial
- **Weave connections** across different AI models for comparison

Just as Anansi protected and shared knowledge, this watchdog protects humanity by monitoring AI.

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- Inspired by the need for transparent AI evaluation
- Built on the shoulders of open-source AI community
- Named after the wisdom-keeper of African mythology

---

## 📧 Contact

- **Issues**: [GitHub Issues](https://github.com/yourusername/anansi-watchdog/issues)
- **Discussions**: [GitHub Discussions](https://github.com/yourusername/anansi-watchdog/discussions)

---

**Made with ❤️ for a safer AI future**

*"With great AI power comes great need for accountability."*
