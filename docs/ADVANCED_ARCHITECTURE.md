# 🏗️ Anansi Watchdog - Advanced Architecture
## Enterprise-Grade System Design

---

## 📐 System Architecture Overview

### High-Level Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────┐
│                          CLIENT LAYER                               │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐          │
│  │   Web    │  │  Mobile  │  │ Browser  │  │   CLI    │          │
│  │   App    │  │   Apps   │  │Extension │  │   Tool   │          │
│  └────┬─────┘  └────┬─────┘  └────┬─────┘  └────┬─────┘          │
└───────┼─────────────┼─────────────┼─────────────┼────────────────┘
        │             │             │             │
        └─────────────┴─────────────┴─────────────┘
                      │
                ┌─────▼─────┐
                │   CDN     │ (Static Assets)
                │ Cloudflare│
                └─────┬─────┘
                      │
        ┌─────────────▼─────────────┐
        │     LOAD BALANCER         │
        │   (NGINX + HAProxy)       │
        └─────────────┬─────────────┘
                      │
        ┌─────────────▼─────────────────────┐
        │        API GATEWAY                │
        │   (Kong / AWS API Gateway)        │
        │  • Rate Limiting                  │
        │  • Authentication (JWT)           │
        │  • Request Routing                │
        │  • API Versioning                 │
        └─────────────┬─────────────────────┘
                      │
        ┌─────────────▼─────────────────────┐
        │   SERVICE MESH (Istio/Linkerd)    │
        │  • Service Discovery              │
        │  • Load Balancing                 │
        │  • Encryption (mTLS)              │
        │  • Observability                  │
        └─────────────┬─────────────────────┘
                      │
     ┌────────────────┼────────────────┐
     │                │                │
┌────▼─────┐   ┌─────▼──────┐   ┌────▼─────┐
│ FastAPI  │   │  GraphQL   │   │WebSocket │
│  REST    │   │   Apollo   │   │  Server  │
│  API     │   │   Server   │   │  (async) │
└────┬─────┘   └─────┬──────┘   └────┬─────┘
     │               │               │
     └───────────────┼───────────────┘
                     │
    ┌────────────────┴─────────────────────────────────┐
    │                                                   │
┌───▼──────────┐  ┌──────────────┐  ┌───────────────┐ │
│ Test Runner  │  │  Evaluator   │  │  Analytics    │ │
│  Service     │  │   Service    │  │   Service     │ │
│  (Python)    │  │  (Python+ML) │  │  (Python)     │ │
└───┬──────────┘  └──────┬───────┘  └───────┬───────┘ │
    │                    │                   │         │
┌───▼──────────┐  ┌──────▼───────┐  ┌───────▼───────┐ │
│ Monitoring   │  │  Compliance  │  │  Community    │ │
│  Service     │  │   Service    │  │   Service     │ │
│ (Go/Python)  │  │  (Python)    │  │  (Node.js)    │ │
└───┬──────────┘  └──────┬───────┘  └───────┬───────┘ │
    │                    │                   │         │
    └────────────────────┴───────────────────┘         │
                         │                             │
                         │  MICROSERVICES LAYER        │
                         └─────────────────────────────┘
                         │
    ┌────────────────────┴──────────────────────┐
    │                                            │
┌───▼──────────┐  ┌──────────────┐  ┌──────────▼────┐
│   Celery     │  │ Redis Streams│  │   RabbitMQ    │
│ Task Queue   │  │ Event Stream │  │  Message Bus  │
└───┬──────────┘  └──────┬───────┘  └──────┬────────┘
    │                    │                  │
    └────────────────────┴──────────────────┘
                         │
                         │  MESSAGE QUEUE LAYER
                         │
    ┌────────────────────┴──────────────────────────────┐
    │                                                    │
┌───▼─────────┐ ┌──────────┐ ┌────────┐ ┌────────────┐ │
│ PostgreSQL  │ │ MongoDB  │ │ Redis  │ │Elasticsearch│ │
│ (Primary)   │ │ (Logs)   │ │(Cache) │ │  (Search)  │ │
└─────────────┘ └──────────┘ └────────┘ └────────────┘ │
                                                        │
┌───────────────┐ ┌──────────────┐                     │
│  ClickHouse   │ │   S3/MinIO   │                     │
│ (Time-Series) │ │(File Storage)│                     │
└───────────────┘ └──────────────┘                     │
                                                        │
    DATA LAYER                                          │
    └───────────────────────────────────────────────────┘
                         │
    ┌────────────────────┴──────────────────────┐
    │                                            │
┌───▼──────────┐  ┌──────────────┐  ┌──────────▼────┐
│  HuggingFace │  │   MLflow     │  │   Ray Serve   │
│ Transformers │  │  (Model Reg) │  │ (ML Serving)  │
└──────────────┘  └──────────────┘  └───────────────┘
                         │
                         │  ML/AI LAYER
                         │
    ┌────────────────────┴──────────────────────┐
    │                                            │
┌───▼──────────┐  ┌──────────────┐  ┌──────────▼────┐
│  OpenAI API  │  │Anthropic API │  │ Google AI API │
└──────────────┘  └──────────────┘  └───────────────┘

    EXTERNAL AI PROVIDERS
```

---

## 🔧 Core Services Detailed Design

### 1. Test Runner Service

**Responsibility**: Execute test scenarios against AI models

**Technology**: Python 3.11+, AsyncIO, aiohttp

**Architecture**:
```python
# Pseudo-Architecture
TestRunnerService
├── TestScheduler (orchestrates test execution)
├── TestExecutor (runs individual tests)
├── ResultCollector (aggregates results)
├── CacheManager (Redis integration)
└── ErrorHandler (retry logic, circuit breaker)

# Scaling Strategy
- Horizontal scaling via Kubernetes
- Worker pool pattern (100 concurrent tests)
- Rate limiting per AI provider
- Intelligent queuing (priority-based)
```

**API Endpoints**:
```
POST   /api/v1/tests/run           # Run test batch
GET    /api/v1/tests/{id}/status   # Check status
GET    /api/v1/tests/{id}/results  # Get results
DELETE /api/v1/tests/{id}          # Cancel test
WS     /ws/tests/{id}              # Real-time updates
```

**Database Schema**:
```sql
CREATE TABLE test_runs (
    id UUID PRIMARY KEY,
    user_id UUID REFERENCES users(id),
    status VARCHAR(20), -- pending, running, completed, failed
    total_tests INT,
    completed_tests INT,
    created_at TIMESTAMP,
    started_at TIMESTAMP,
    completed_at TIMESTAMP,
    config JSONB, -- test configuration
    metadata JSONB -- additional data
);

CREATE TABLE test_results (
    id UUID PRIMARY KEY,
    test_run_id UUID REFERENCES test_runs(id),
    test_id VARCHAR(50), -- e.g., 'racial_001'
    model_provider VARCHAR(50),
    model_name VARCHAR(100),
    prompt TEXT,
    response TEXT,
    safety_score DECIMAL(5,2),
    is_safe BOOLEAN,
    violations JSONB, -- array of violations
    latency_ms INT,
    tokens_used INT,
    created_at TIMESTAMP
);

CREATE INDEX idx_test_results_run ON test_results(test_run_id);
CREATE INDEX idx_test_results_model ON test_results(model_provider, model_name);
CREATE INDEX idx_test_results_safe ON test_results(is_safe);
CREATE INDEX idx_test_results_date ON test_results(created_at);
```

---

### 2. Evaluator Service

**Responsibility**: Evaluate AI responses using ML models

**Technology**: Python 3.11+, PyTorch, Transformers, Ray

**Architecture**:
```python
EvaluatorService
├── ModelRegistry (manage ML models)
│   ├── ToxicityClassifier (BERT-based)
│   ├── BiasDetector (RoBERTa-based)
│   ├── HallucinationDetector (RAG-based)
│   └── JailbreakDetector (GPT-2 fine-tuned)
├── EvaluationEngine (orchestrates evaluation)
├── FeatureExtractor (prepare inputs)
└── ScoreAggregator (combine scores)

# Model Serving with Ray
ray.init(address="auto")

@ray.remote(num_gpus=1)
class ToxicityEvaluator:
    def __init__(self):
        self.model = AutoModelForSequenceClassification.from_pretrained(
            "anansi/toxicity-classifier-v1"
        )
        
    def evaluate(self, text: str) -> Dict[str, float]:
        # Model inference
        pass
```

**Model Specifications**:
```yaml
toxicity_classifier:
  base_model: distilbert-base-uncased
  fine_tuned_on: 
    - jigsaw_toxic_comments (159k)
    - hate_speech_dataset (100k)
    - custom_labeled (50k)
  metrics:
    accuracy: 0.943
    precision: 0.921
    recall: 0.907
    f1: 0.914
  inference_time: 45ms (GPU) / 180ms (CPU)
  model_size: 268MB

bias_detector:
  base_model: roberta-large
  fine_tuned_on:
    - stereoset (16k)
    - bold (23k)
    - custom_intersectional (30k)
  metrics:
    accuracy: 0.897
    f1_macro: 0.891
  inference_time: 120ms (GPU)
  model_size: 1.4GB

hallucination_detector:
  architecture: RAG (Retrieval-Augmented)
  components:
    retriever: sentence-transformers/all-MiniLM-L6-v2
    knowledge_base: 
      - wikipedia (6M articles)
      - arxiv (2M papers)
      - fact_check_db (500k claims)
    verifier: google/flan-t5-large (fine-tuned)
  metrics:
    accuracy: 0.912
    precision: 0.934 (low false positives critical)
  inference_time: 300ms (includes retrieval)
  
jailbreak_detector:
  base_model: gpt2-medium
  fine_tuned_on:
    - known_jailbreaks (10k)
    - synthetic_attacks (50k)
    - red_team_examples (5k)
  metrics:
    precision: 0.967 (critical: low false positives)
    recall: 0.854
    f1: 0.907
  inference_time: 60ms
  model_size: 645MB
```

**API Endpoints**:
```
POST /api/v1/evaluate/toxicity      # Toxicity check
POST /api/v1/evaluate/bias          # Bias detection
POST /api/v1/evaluate/hallucination # Fact check
POST /api/v1/evaluate/jailbreak     # Adversarial detection
POST /api/v1/evaluate/comprehensive # All checks
GET  /api/v1/models/status          # Model health
```

---

### 3. Analytics Service

**Responsibility**: Generate insights, trends, predictions

**Technology**: Python, Pandas, NumPy, Scikit-learn, Prophet

**Architecture**:
```python
AnalyticsService
├── TrendAnalyzer (time-series analysis)
├── ComparativeAnalyzer (model vs model)
├── PredictiveEngine (forecasting)
├── ReportGenerator (PDF/HTML reports)
└── VisualizationEngine (charts, graphs)

# Example: Trend Analysis
class TrendAnalyzer:
    def analyze_model_performance(
        self, 
        model: str, 
        timeframe: str = "30d"
    ) -> TrendReport:
        # Fetch historical data
        scores = self.fetch_historical_scores(model, timeframe)
        
        # Statistical analysis
        mean_score = np.mean(scores)
        std_dev = np.std(scores)
        trend = self.calculate_trend(scores)  # linear regression
        
        # Detect anomalies
        anomalies = self.detect_anomalies(scores, threshold=2)
        
        # Forecast future
        forecast = self.forecast_performance(scores, periods=14)
        
        return TrendReport(
            model=model,
            current_score=scores[-1],
            mean_score=mean_score,
            trend=trend,  # 'improving', 'stable', 'declining'
            anomalies=anomalies,
            forecast=forecast,
            confidence=0.85
        )
```

**Database Schema (ClickHouse)**:
```sql
-- Time-series optimized for analytics
CREATE TABLE model_scores_timeseries (
    timestamp DateTime,
    model_provider String,
    model_name String,
    metric_name String,  -- 'safety', 'bias', 'hallucination', etc.
    score Float64,
    test_count UInt32,
    date Date MATERIALIZED toDate(timestamp)
) ENGINE = MergeTree()
PARTITION BY toYYYYMM(date)
ORDER BY (model_provider, model_name, metric_name, timestamp);

-- Aggregated views for performance
CREATE MATERIALIZED VIEW model_scores_daily AS
SELECT
    toDate(timestamp) as date,
    model_provider,
    model_name,
    metric_name,
    avg(score) as avg_score,
    min(score) as min_score,
    max(score) as max_score,
    sum(test_count) as total_tests
FROM model_scores_timeseries
GROUP BY date, model_provider, model_name, metric_name;
```

**API Endpoints**:
```
GET  /api/v1/analytics/trends         # Get trend data
GET  /api/v1/analytics/compare        # Compare models
GET  /api/v1/analytics/forecast       # Predictions
GET  /api/v1/analytics/report         # Generate report
POST /api/v1/analytics/custom         # Custom query
```

---

### 4. Monitoring Service

**Responsibility**: Real-time monitoring of AI models in production

**Technology**: Go (high performance), gRPC, Kafka Streams

**Architecture**:
```go
// Monitoring Service in Go for performance
type MonitoringService struct {
    eventStream   *kafka.Producer
    alertManager  *AlertManager
    metricStore   *prometheus.Registry
    anomalyDetector *AnomalyDetector
}

// Stream processing pipeline
func (m *MonitoringService) ProcessEvent(event AIEvent) {
    // 1. Validate event
    if !m.validateEvent(event) {
        return
    }
    
    // 2. Evaluate in real-time
    evaluation := m.evaluateEvent(event)
    
    // 3. Check for violations
    if evaluation.HasViolation() {
        m.handleViolation(event, evaluation)
    }
    
    // 4. Detect anomalies
    if m.anomalyDetector.IsAnomaly(evaluation) {
        m.alertManager.TriggerAlert(anomaly)
    }
    
    // 5. Store metrics
    m.metricStore.Record(evaluation.Metrics())
    
    // 6. Forward to analytics
    m.eventStream.Produce(evaluation)
}

// Anomaly detection using statistical methods
type AnomalyDetector struct {
    historicalData []float64
    threshold      float64
}

func (a *AnomalyDetector) IsAnomaly(score float64) bool {
    mean := stats.Mean(a.historicalData)
    stdDev := stats.StdDev(a.historicalData)
    zScore := (score - mean) / stdDev
    return math.Abs(zScore) > a.threshold  // e.g., 3 sigma
}
```

**Integration SDK (Python)**:
```python
# Easy integration for developers
from anansi_watchdog import Monitor

# Initialize monitor
monitor = Monitor(api_key="your_api_key")

# Wrap AI calls
@monitor.track(model="gpt-4", category="chatbot")
def chat_with_ai(prompt: str) -> str:
    response = openai.ChatCompletion.create(
        model="gpt-4",
        messages=[{"role": "user", "content": prompt}]
    )
    return response.choices[0].message.content

# Automatic safety monitoring!
result = chat_with_ai("Hello, how are you?")

# Check safety status
if monitor.last_evaluation.is_safe:
    return result
else:
    # Handle unsafe response
    return "I apologize, I cannot provide that information."
```

**API Endpoints**:
```
POST /api/v1/monitor/event           # Report AI event
GET  /api/v1/monitor/stream          # Real-time stream (SSE)
GET  /api/v1/monitor/alerts          # Get alerts
POST /api/v1/monitor/alert/ack       # Acknowledge alert
GET  /api/v1/monitor/health          # Service health
```

---

### 5. Compliance Service

**Responsibility**: Regulatory compliance checking and reporting

**Technology**: Python, regulatory knowledge base

**Architecture**:
```python
ComplianceService
├── RegulationEngine (map tests to regulations)
├── ComplianceChecker (verify compliance)
├── ReportGenerator (audit reports)
└── UpdateMonitor (track regulatory changes)

# Regulation Mapping
REGULATION_MAPPINGS = {
    "EU_AI_ACT": {
        "high_risk_categories": [
            "biometric_identification",
            "critical_infrastructure",
            "education_training",
            "employment",
            "essential_services",
            "law_enforcement",
            "migration_asylum",
            "justice"
        ],
        "requirements": {
            "risk_management": ["safety_001", "safety_002", ...],
            "data_governance": ["privacy_001", "privacy_002", ...],
            "transparency": ["alignment_001", ...],
            "human_oversight": ["alignment_005", ...],
            "accuracy_robustness": ["hallucination_001", ...],
            "cybersecurity": ["adversarial_001", ...]
        }
    },
    "GDPR": {
        "requirements": {
            "data_minimization": ["privacy_001", "privacy_003"],
            "purpose_limitation": ["privacy_002"],
            "right_to_explanation": ["alignment_008"],
            "automated_decision_making": ["bias_001", "bias_002"]
        }
    },
    "US_AI_EXECUTIVE_ORDER": {
        "requirements": {
            "safety_testing": ["safety_*"],
            "bias_evaluation": ["bias_*"],
            "transparency": ["alignment_*"]
        }
    }
}

class ComplianceChecker:
    def check_compliance(
        self, 
        test_results: List[TestResult],
        regulation: str
    ) -> ComplianceReport:
        regulation_reqs = REGULATION_MAPPINGS[regulation]
        
        compliance_status = {}
        for req_name, test_ids in regulation_reqs["requirements"].items():
            # Check if required tests were run
            applicable_results = [
                r for r in test_results 
                if self.matches_pattern(r.test_id, test_ids)
            ]
            
            if not applicable_results:
                compliance_status[req_name] = {
                    "status": "not_tested",
                    "compliant": False
                }
            else:
                # Check pass rate
                pass_rate = sum(
                    r.is_safe for r in applicable_results
                ) / len(applicable_results)
                
                compliance_status[req_name] = {
                    "status": "tested",
                    "compliant": pass_rate >= 0.95,  # 95% threshold
                    "pass_rate": pass_rate,
                    "failed_tests": [
                        r.test_id for r in applicable_results 
                        if not r.is_safe
                    ]
                }
        
        overall_compliant = all(
            status["compliant"] 
            for status in compliance_status.values()
        )
        
        return ComplianceReport(
            regulation=regulation,
            overall_compliant=overall_compliant,
            requirements=compliance_status,
            generated_at=datetime.utcnow()
        )
```

**API Endpoints**:
```
GET  /api/v1/compliance/check/{regulation}   # Check compliance
GET  /api/v1/compliance/report/{regulation}  # Generate report
GET  /api/v1/compliance/regulations          # List regulations
POST /api/v1/compliance/custom               # Custom compliance
```

---

### 6. Community Service

**Responsibility**: User submissions, voting, discussions

**Technology**: Node.js, Express, Socket.io

**Architecture**:
```javascript
// Community Service (Node.js for real-time features)
class CommunityService {
    constructor() {
        this.app = express();
        this.io = socketio(server);
        this.db = new MongoDB();
    }
    
    // Test submission
    async submitTest(userId, testScenario) {
        // Validate submission
        const validation = await this.validateTestScenario(testScenario);
        if (!validation.valid) {
            throw new ValidationError(validation.errors);
        }
        
        // Create submission
        const submission = await this.db.submissions.create({
            userId,
            testScenario,
            status: 'pending_review',
            votes: 0,
            createdAt: new Date()
        });
        
        // Notify moderators
        this.io.to('moderators').emit('new_submission', submission);
        
        // Award karma
        await this.awardKarma(userId, 10);
        
        return submission;
    }
    
    // Voting system
    async voteOnSubmission(userId, submissionId, voteType) {
        // Prevent duplicate voting
        const existingVote = await this.db.votes.findOne({
            userId,
            submissionId
        });
        
        if (existingVote) {
            throw new Error('Already voted');
        }
        
        // Record vote
        await this.db.votes.create({
            userId,
            submissionId,
            voteType,  // 'upvote' or 'downvote'
            createdAt: new Date()
        });
        
        // Update submission score
        const voteValue = voteType === 'upvote' ? 1 : -1;
        await this.db.submissions.updateOne(
            { _id: submissionId },
            { $inc: { votes: voteValue } }
        );
        
        // Award/deduct karma for submitter
        const submission = await this.db.submissions.findById(submissionId);
        await this.awardKarma(submission.userId, voteValue * 2);
        
        // Check if auto-approval threshold reached
        if (submission.votes >= 10) {
            await this.autoApproveSubmission(submissionId);
        }
    }
    
    // Reputation system
    async awardKarma(userId, amount) {
        await this.db.users.updateOne(
            { _id: userId },
            { $inc: { karma: amount } }
        );
        
        // Check for level-up
        const user = await this.db.users.findById(userId);
        const newLevel = this.calculateLevel(user.karma);
        
        if (newLevel > user.level) {
            await this.levelUp(userId, newLevel);
        }
    }
    
    calculateLevel(karma) {
        // Exponential leveling
        // Level 1: 0-100 karma
        // Level 2: 100-300 karma
        // Level 3: 300-600 karma
        // Level 4: 600-1000 karma
        // Level 5: 1000+ karma
        if (karma < 100) return 1;
        if (karma < 300) return 2;
        if (karma < 600) return 3;
        if (karma < 1000) return 4;
        return 5;
    }
}
```

**API Endpoints**:
```
POST /api/v1/community/submit        # Submit test
POST /api/v1/community/vote          # Vote on submission
GET  /api/v1/community/feed          # Community feed
GET  /api/v1/community/leaderboard   # Top contributors
POST /api/v1/community/discussion    # Create discussion
GET  /api/v1/community/user/{id}     # User profile
```

---

## 🗄️ Database Schemas

### PostgreSQL (Primary Data)

```sql
-- Users
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    username VARCHAR(50) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    api_key VARCHAR(64) UNIQUE,
    tier VARCHAR(20) DEFAULT 'free',  -- free, pro, team, enterprise
    credits INT DEFAULT 100,
    karma INT DEFAULT 0,
    level INT DEFAULT 1,
    created_at TIMESTAMP DEFAULT NOW(),
    last_login TIMESTAMP,
    metadata JSONB
);

-- Organizations (for team/enterprise)
CREATE TABLE organizations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    owner_id UUID REFERENCES users(id),
    tier VARCHAR(20),
    credits INT,
    settings JSONB,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Test Scenarios
CREATE TABLE test_scenarios (
    id VARCHAR(50) PRIMARY KEY,  -- e.g., 'racial_001'
    category VARCHAR(50) NOT NULL,
    subcategory VARCHAR(50),
    prompt TEXT NOT NULL,
    expected_behavior TEXT,
    severity VARCHAR(20),  -- low, medium, high, critical
    tags TEXT[],
    created_by UUID REFERENCES users(id),
    is_public BOOLEAN DEFAULT true,
    version INT DEFAULT 1,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Test Runs (defined earlier)
-- Test Results (defined earlier)

-- Model Registry
CREATE TABLE ai_models (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    provider VARCHAR(50) NOT NULL,  -- openai, anthropic, google, etc.
    name VARCHAR(100) NOT NULL,
    version VARCHAR(50),
    api_endpoint VARCHAR(255),
    pricing_per_1k_tokens DECIMAL(10, 4),
    max_tokens INT,
    supports_streaming BOOLEAN,
    is_active BOOLEAN DEFAULT true,
    metadata JSONB,
    created_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(provider, name, version)
);

-- Model Scores (aggregated)
CREATE TABLE model_scores (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    model_id UUID REFERENCES ai_models(id),
    date DATE NOT NULL,
    safety_score DECIMAL(5,2),
    bias_score DECIMAL(5,2),
    hallucination_score DECIMAL(5,2),
    alignment_score DECIMAL(5,2),
    overall_score DECIMAL(5,2),
    total_tests INT,
    passed_tests INT,
    failed_tests INT,
    created_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(model_id, date)
);

-- API Usage Tracking
CREATE TABLE api_usage (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id),
    endpoint VARCHAR(255),
    method VARCHAR(10),
    status_code INT,
    response_time_ms INT,
    credits_used INT,
    timestamp TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_api_usage_user ON api_usage(user_id, timestamp);
CREATE INDEX idx_api_usage_timestamp ON api_usage(timestamp);

-- Community Submissions
CREATE TABLE test_submissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id),
    test_scenario JSONB NOT NULL,
    status VARCHAR(20) DEFAULT 'pending',  -- pending, approved, rejected
    votes INT DEFAULT 0,
    reviewed_by UUID REFERENCES users(id),
    review_notes TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    reviewed_at TIMESTAMP
);

-- Voting
CREATE TABLE submission_votes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id),
    submission_id UUID REFERENCES test_submissions(id),
    vote_type VARCHAR(10),  -- upvote, downvote
    created_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(user_id, submission_id)
);
```

### MongoDB (Logs & Documents)

```javascript
// Test execution logs
{
  _id: ObjectId("..."),
  test_run_id: "uuid",
  test_id: "racial_001",
  timestamp: ISODate("2025-11-13T..."),
  level: "info",  // debug, info, warning, error
  message: "Test completed successfully",
  duration_ms: 1234,
  metadata: {
    model: "gpt-4",
    tokens_used: 150,
    api_latency: 234
  }
}

// Model responses (full text)
{
  _id: ObjectId("..."),
  test_result_id: "uuid",
  prompt: "Full prompt text...",
  response: "Full response text...",
  raw_api_response: { /* complete API response */ },
  created_at: ISODate("...")
}

// Discussions
{
  _id: ObjectId("..."),
  topic: "Safety concerns with GPT-4",
  author_id: "uuid",
  content: "I've noticed that...",
  replies: [
    {
      author_id: "uuid",
      content: "Great observation...",
      created_at: ISODate("...")
    }
  ],
  votes: 42,
  tags: ["gpt-4", "safety", "discussion"],
  created_at: ISODate("...")
}
```

### Redis (Cache & Real-time)

```
# Caching patterns
test_result:{test_run_id}:{test_id} = JSON (TTL: 1 hour)
model_scores:{model_id}:latest = JSON (TTL: 5 minutes)
leaderboard:global = ZSET (sorted by score)
user_session:{session_id} = JSON (TTL: 24 hours)

# Real-time data
live_tests = LIST (active test runs)
active_users = SET (online users)

# Rate limiting
rate_limit:{user_id}:{endpoint} = COUNTER (TTL: 1 minute)

# WebSocket connections
ws_connections = HASH (socket_id -> user_id)
```

---

## 🚀 Deployment Architecture

### Kubernetes Cluster Layout

```yaml
# Namespace: anansi-production
apiVersion: v1
kind: Namespace
metadata:
  name: anansi-production

---
# API Gateway Deployment
apiVersion: apps/v1
kind: Deployment
metadata:
  name: api-gateway
  namespace: anansi-production
spec:
  replicas: 3
  selector:
    matchLabels:
      app: api-gateway
  template:
    metadata:
      labels:
        app: api-gateway
    spec:
      containers:
      - name: api-gateway
        image: anansi/api-gateway:latest
        ports:
        - containerPort: 8000
        env:
        - name: DATABASE_URL
          valueFrom:
            secretKeyRef:
              name: database-secrets
              key: url
        resources:
          requests:
            memory: "256Mi"
            cpu: "500m"
          limits:
            memory: "512Mi"
            cpu: "1000m"
        livenessProbe:
          httpGet:
            path: /health
            port: 8000
          initialDelaySeconds: 30
          periodSeconds: 10
        readinessProbe:
          httpGet:
            path: /ready
            port: 8000
          initialDelaySeconds: 10
          periodSeconds: 5

---
# HorizontalPodAutoscaler for API Gateway
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: api-gateway-hpa
  namespace: anansi-production
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: api-gateway
  minReplicas: 3
  maxReplicas: 10
  metrics:
  - type: Resource
    resource:
      name: cpu
      target:
        type: Utilization
        averageUtilization: 70
  - type: Resource
    resource:
      name: memory
      target:
        type: Utilization
        averageUtilization: 80

---
# Test Runner Service
apiVersion: apps/v1
kind: Deployment
metadata:
  name: test-runner
  namespace: anansi-production
spec:
  replicas: 5
  selector:
    matchLabels:
      app: test-runner
  template:
    metadata:
      labels:
        app: test-runner
    spec:
      containers:
      - name: test-runner
        image: anansi/test-runner:latest
        env:
        - name: CELERY_BROKER
          value: "redis://redis-service:6379/0"
        - name: OPENAI_API_KEY
          valueFrom:
            secretKeyRef:
              name: ai-api-keys
              key: openai
        - name: ANTHROPIC_API_KEY
          valueFrom:
            secretKeyRef:
              name: ai-api-keys
              key: anthropic
        resources:
          requests:
            memory: "512Mi"
            cpu: "1000m"
          limits:
            memory: "2Gi"
            cpu: "2000m"

---
# Evaluator Service (GPU)
apiVersion: apps/v1
kind: Deployment
metadata:
  name: evaluator
  namespace: anansi-production
spec:
  replicas: 2
  selector:
    matchLabels:
      app: evaluator
  template:
    metadata:
      labels:
        app: evaluator
    spec:
      nodeSelector:
        gpu: "true"  # Schedule on GPU nodes
      containers:
      - name: evaluator
        image: anansi/evaluator:latest
        resources:
          requests:
            memory: "4Gi"
            cpu: "2000m"
            nvidia.com/gpu: 1
          limits:
            memory: "8Gi"
            cpu: "4000m"
            nvidia.com/gpu: 1
```

### Infrastructure as Code (Terraform)

```hcl
# AWS EKS Cluster
module "eks" {
  source  = "terraform-aws-modules/eks/aws"
  version = "~> 19.0"

  cluster_name    = "anansi-production"
  cluster_version = "1.27"

  vpc_id     = module.vpc.vpc_id
  subnet_ids = module.vpc.private_subnets

  # Node groups
  eks_managed_node_groups = {
    # General purpose nodes
    general = {
      min_size     = 3
      max_size     = 10
      desired_size = 5

      instance_types = ["t3.xlarge"]
      capacity_type  = "ON_DEMAND"
    }

    # GPU nodes for ML
    gpu = {
      min_size     = 1
      max_size     = 3
      desired_size = 2

      instance_types = ["g4dn.xlarge"]
      capacity_type  = "SPOT"
      
      taints = [{
        key    = "nvidia.com/gpu"
        value  = "true"
        effect = "NO_SCHEDULE"
      }]
    }
  }
}

# RDS PostgreSQL
resource "aws_db_instance" "postgres" {
  identifier           = "anansi-postgres"
  engine              = "postgres"
  engine_version      = "15.3"
  instance_class      = "db.t3.large"
  allocated_storage   = 100
  storage_type        = "gp3"
  
  db_name  = "anansi"
  username = var.db_username
  password = var.db_password
  
  multi_az               = true
  publicly_accessible    = false
  backup_retention_period = 7
  
  vpc_security_group_ids = [aws_security_group.postgres.id]
  db_subnet_group_name   = aws_db_subnet_group.postgres.name
}

# ElastiCache Redis
resource "aws_elasticache_cluster" "redis" {
  cluster_id           = "anansi-redis"
  engine               = "redis"
  engine_version       = "7.0"
  node_type            = "cache.r6g.large"
  num_cache_nodes      = 1
  parameter_group_name = "default.redis7"
  port                 = 6379
  
  subnet_group_name    = aws_elasticache_subnet_group.redis.name
  security_group_ids   = [aws_security_group.redis.id]
}

# S3 Buckets
resource "aws_s3_bucket" "reports" {
  bucket = "anansi-reports"
  
  versioning {
    enabled = true
  }
  
  lifecycle_rule {
    enabled = true
    
    transition {
      days          = 30
      storage_class = "STANDARD_IA"
    }
    
    transition {
      days          = 90
      storage_class = "GLACIER"
    }
  }
}

# CloudFront Distribution
resource "aws_cloudfront_distribution" "cdn" {
  enabled             = true
  default_root_object = "index.html"
  
  origin {
    domain_name = aws_s3_bucket.web_assets.bucket_regional_domain_name
    origin_id   = "S3-web-assets"
    
    s3_origin_config {
      origin_access_identity = aws_cloudfront_origin_access_identity.web.cloudfront_access_identity_path
    }
  }
  
  default_cache_behavior {
    allowed_methods  = ["GET", "HEAD", "OPTIONS"]
    cached_methods   = ["GET", "HEAD"]
    target_origin_id = "S3-web-assets"
    
    forwarded_values {
      query_string = false
      cookies {
        forward = "none"
      }
    }
    
    viewer_protocol_policy = "redirect-to-https"
    min_ttl                = 0
    default_ttl            = 3600
    max_ttl                = 86400
  }
  
  restrictions {
    geo_restriction {
      restriction_type = "none"
    }
  }
  
  viewer_certificate {
    acm_certificate_arn = aws_acm_certificate.web.arn
    ssl_support_method  = "sni-only"
  }
}
```

---

## 📊 Monitoring & Observability

### Prometheus Metrics

```yaml
# metrics.yaml
scrape_configs:
  - job_name: 'api-gateway'
    static_configs:
      - targets: ['api-gateway:9090']
    
  - job_name: 'test-runner'
    static_configs:
      - targets: ['test-runner:9090']
    
  - job_name: 'evaluator'
    static_configs:
      - targets: ['evaluator:9090']

# Custom metrics
# api_requests_total{endpoint="/api/v1/tests/run", method="POST", status="200"}
# test_execution_duration_seconds{model="gpt-4", test_category="safety"}
# model_evaluation_errors_total{evaluator="toxicity", error_type="timeout"}
# active_websocket_connections{service="monitoring"}
```

### Grafana Dashboards

```json
{
  "dashboard": {
    "title": "Anansi Watchdog - System Overview",
    "panels": [
      {
        "title": "API Request Rate",
        "targets": [
          {
            "expr": "rate(api_requests_total[5m])"
          }
        ]
      },
      {
        "title": "Test Execution Time (p95)",
        "targets": [
          {
            "expr": "histogram_quantile(0.95, rate(test_execution_duration_seconds_bucket[5m]))"
          }
        ]
      },
      {
        "title": "Model Evaluation Accuracy",
        "targets": [
          {
            "expr": "model_evaluation_accuracy{evaluator=~\"toxicity|bias|hallucination\"}"
          }
        ]
      },
      {
        "title": "Error Rate by Service",
        "targets": [
          {
            "expr": "rate(http_requests_total{status=~\"5..\"}[5m]) / rate(http_requests_total[5m])"
          }
        ]
      }
    ]
  }
}
```

---

## 🔒 Security Architecture

### Defense in Depth

```
Layer 1: Network Security
├── WAF (Web Application Firewall) - CloudFlare/AWS WAF
├── DDoS Protection - CloudFlare
├── VPC Security Groups - restrict inter-service communication
└── Network Policies - Kubernetes NetworkPolicy

Layer 2: Authentication & Authorization
├── JWT Tokens - short-lived access tokens
├── OAuth2 - third-party authentication
├── API Keys - rate-limited, scoped permissions
└── RBAC - Kubernetes Role-Based Access Control

Layer 3: Application Security
├── Input Validation - all user inputs sanitized
├── SQL Injection Prevention - parameterized queries
├── XSS Protection - Content Security Policy
└── CSRF Protection - tokens for state-changing operations

Layer 4: Data Security
├── Encryption at Rest - AES-256
├── Encryption in Transit - TLS 1.3
├── Secrets Management - HashiCorp Vault
└── Database Encryption - PostgreSQL pgcrypto

Layer 5: Monitoring & Response
├── Intrusion Detection - AWS GuardDuty
├── Log Analysis - ELK Stack
├── Anomaly Detection - custom ML models
└── Incident Response - PagerDuty integration
```

---

This is the complete advanced architecture. Ready to implement! 🚀
