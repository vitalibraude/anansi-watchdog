# Anansi Watchdog Architecture

## Overview

Anansi Watchdog is a modular AI evaluation framework designed to test multiple AI models for safety, bias, hallucinations, and alignment with human values.

## System Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    Anansi Watchdog                      │
│                     Main CLI (anansi.py)                │
└────────────────────┬────────────────────────────────────┘
                     │
        ┌────────────┴────────────┐
        │                         │
        ▼                         ▼
┌───────────────┐         ┌──────────────┐
│  Test Runner  │         │   Reports    │
│    Engine     │────────▶│  Generator   │
└───────┬───────┘         └──────────────┘
        │
        │ runs tests on
        ▼
┌──────────────────────────────────────────┐
│        Model Interface Layer             │
│  ┌──────────┐  ┌──────────┐  ┌────────┐ │
│  │ OpenAI   │  │Anthropic │  │ Google │ │
│  │Interface │  │Interface │  │Interface│ │
│  └──────────┘  └──────────┘  └────────┘ │
└──────────────────────────────────────────┘
        │
        │ responses evaluated by
        ▼
┌──────────────────────────────────────────┐
│          Evaluator Engine                │
│  ┌────────┐ ┌──────┐ ┌─────────────┐    │
│  │ Safety │ │ Bias │ │Hallucination│    │
│  │  Eval  │ │ Det. │ │  Detector   │    │
│  └───┬────┘ └──┬───┘ └──────┬──────┘    │
│      └──────────┴────────────┘           │
│                 │                        │
│          ┌──────▼────────┐               │
│          │  Risk Score   │               │
│          │  Calculator   │               │
│          └───────────────┘               │
└──────────────────────────────────────────┘
```

## Core Components

### 1. Model Interface Layer (`core/model_interface.py`)

**Purpose**: Provide unified interface for multiple AI models

**Key Classes**:
- `ModelInterface` - Abstract base class
- `OpenAIInterface` - ChatGPT/GPT-4
- `AnthropicInterface` - Claude
- `GoogleInterface` - Gemini
- `ModelFactory` - Factory for creating interfaces

**Features**:
- Standardized query interface
- Unified response format
- Error handling
- API key management
- Rate limiting support

**Extension Point**: Add new models by implementing `ModelInterface`

```python
class ModelInterface(ABC):
    @abstractmethod
    def query(self, prompt: str, **kwargs) -> ModelResponse:
        pass
```

### 2. Test Runner (`core/test_runner.py`)

**Purpose**: Execute test scenarios and collect responses

**Key Classes**:
- `TestCase` - Represents a single test
- `TestResult` - Results from running a test
- `TestRunner` - Orchestrates test execution

**Workflow**:
1. Load test cases from JSON files
2. For each test case:
   - Query each model
   - Record response and metadata
3. Save results to file
4. Generate summary statistics

**Features**:
- Batch test execution
- Progress tracking
- Error recovery
- Rate limit handling
- Result persistence

### 3. Evaluator Engine (`evaluators/`)

**Purpose**: Analyze AI responses for various concerns

#### Safety Evaluator (`safety_rules.py`)
- Pattern-based detection of harmful content
- Categories: violence, self-harm, hate speech, illegal activity
- Heuristic checks for detailed harmful instructions
- Safety score calculation (0-1)

#### Bias Detector (`bias_detector.py`)
- Gender bias detection
- Racial/ethnic bias
- Age bias
- Professional stereotyping
- Representation balance analysis
- Bias score calculation (0-1)

#### Hallucination Detector (`hallucination_detector.py`)
- Fabricated fact detection
- Unsourced claim identification
- Internal consistency checking
- Confidence level analysis
- Hallucination risk score (0-1)

#### Risk Score Calculator (`risk_score.py`)
- Combines all evaluation dimensions
- Weighted scoring (configurable)
- Risk level determination
- Recommendation generation
- Model comparison

**Evaluation Flow**:
```
Response Text
     │
     ├──▶ Safety Evaluator ──▶ Safety Score (0-1)
     │
     ├──▶ Bias Detector ────▶ Bias Score (0-1)
     │
     └──▶ Hallucination Det.▶ Hallucination Score (0-1)
              │
              ▼
     Risk Score Calculator
              │
              ▼
        Overall Risk Score (0-1)
        Risk Level (safe/low/medium/high/critical)
        Recommendations
```

### 4. Report Generator (`core/report_generator.py`)

**Purpose**: Create human-readable and machine-readable reports

**Output Formats**:
- **Markdown** - Human-readable reports with:
  - Executive summary
  - Model rankings
  - Detailed results
  - Risk analysis
  - Recommendations
  
- **JSON** - Machine-readable data with:
  - Complete test results
  - Evaluation scores
  - Metadata
  - Timestamps

**Report Sections**:
1. Executive Summary - High-level statistics
2. Model Rankings - Comparative performance
3. Detailed Results - Per-model breakdown
4. Risk Analysis - Common issues
5. Recommendations - Actionable insights

## Data Flow

### 1. Test Execution Flow
```
JSON Test File
     ↓
Load TestCases
     ↓
For each Model:
  For each TestCase:
    ↓
    Query Model
    ↓
    Get Response
    ↓
    Create TestResult
    ↓
Save All Results
```

### 2. Evaluation Flow
```
TestResult with Response
     ↓
Parallel Evaluation:
├─→ SafetyEvaluator
├─→ BiasDetector
└─→ HallucinationDetector
     ↓
Collect Scores
     ↓
RiskScoreCalculator
     ↓
RiskAssessment
```

### 3. Reporting Flow
```
TestResults + RiskAssessments
     ↓
Group by Model
     ↓
Calculate Statistics
     ↓
Generate Report Sections
     ↓
Format (Markdown/JSON)
     ↓
Save Report Files
```

## Configuration System

### Environment Variables (`.env`)
- API keys for different models
- Service endpoints (if needed)

### Config Module (`config/config.py`)
- Risk score weights
- Default models
- Test runner settings
- Evaluation thresholds

## Extension Points

### Adding New Models
1. Create interface class extending `ModelInterface`
2. Implement `query()` method
3. Add to `ModelFactory`
4. Document API key requirements

### Adding New Evaluators
1. Create evaluator class in `evaluators/`
2. Implement evaluation logic
3. Return standardized score (0-1)
4. Update `RiskScoreCalculator` if needed

### Adding New Test Categories
1. Create directory in `tests/`
2. Add JSON test files
3. Document test structure
4. Consider new evaluation criteria

### Adding New Report Formats
1. Add method to `ReportGenerator`
2. Implement format-specific logic
3. Save to appropriate location
4. Document format specification

## Design Principles

### 1. Modularity
Each component has clear responsibilities and interfaces

### 2. Extensibility
Easy to add new models, tests, and evaluators

### 3. Transparency
All evaluations are rule-based and explainable

### 4. Reproducibility
Test results are stored with full metadata

### 5. Community-Driven
Open format for test contributions

## Performance Considerations

### Rate Limiting
- Configurable delay between API calls
- Respect model provider rate limits
- Exponential backoff on errors

### Batching
- Run multiple tests in sequence
- Batch evaluations for efficiency
- Parallel evaluation of different dimensions

### Caching
- Store raw responses to avoid re-querying
- Enable re-evaluation without re-testing
- Save costs on iterative development

## Security Considerations

### API Keys
- Never commit API keys to repository
- Use environment variables
- Document key management

### Test Safety
- Tests should never actually cause harm
- Designed to elicit refusals, not harmful responses
- Ethical construction of safety tests

### Data Privacy
- No personal data in tests
- Results contain only test data
- Configurable output redaction (future)

## Future Enhancements

### Planned Features
1. **ML-Based Evaluation**
   - Train classifiers on labeled data
   - Improve detection accuracy
   - Reduce false positives

2. **Continuous Monitoring**
   - Scheduled test runs
   - Drift detection
   - Historical trend analysis

3. **Public Dashboard**
   - Web-based interface
   - Live test results
   - Community contributions

4. **Advanced Analytics**
   - Cross-model comparison
   - Category-specific insights
   - Time-series analysis

### Architecture Evolution
- Plugin system for evaluators
- Distributed test execution
- Real-time monitoring
- API for external tools

## Conclusion

Anansi Watchdog is designed to be a flexible, transparent, and community-driven AI evaluation framework. The modular architecture allows for easy extension while maintaining clear separation of concerns.

The focus on transparency and reproducibility ensures that all evaluations can be understood, verified, and improved by the community.
