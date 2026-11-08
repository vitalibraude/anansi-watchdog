# 🕷️ Anansi Watchdog - AI Safety & Fraud Detection Platform

> **Evidence update (November 8, 2026):** The new [corpus audit and
> browser explorer](docs/CORPUS_AUDIT.md) makes the existing 290 scenarios
> inspectable without model calls. Inventory is not safety validation.
> The broad production, coverage and commercial claims below are historical
> project descriptions, not results established by this audit.


**The world's most comprehensive AI safety evaluation and fraud detection platform**

[![Version](https://img.shields.io/badge/version-4.0.0-blue.svg)](https://github.com/vitalibraude/anansi-watchdog)
[![License](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)
[![Status](https://img.shields.io/badge/status-production%20ready-brightgreen.svg)]()

---

## 🎯 What is Anansi Watchdog?

Anansi Watchdog is a **dual-platform AI safety solution** that provides:

1. **🌐 Chrome Extension** - Real-time fraud detection for consumers
2. **🐍 Python Backend** - Enterprise-grade AI testing platform

Together, they create a complete AI safety ecosystem protecting both individual users and enterprises.

---

## 📦 Quick Links

| Component | Description | Link |
|-----------|-------------|------|
| **Chrome Extension V4** | Consumer fraud detection | [📁 View](./anansi-chrome-extension-v4/) |
| **Python Backend** | Enterprise AI testing | [📁 View](./backend/) |
| **Documentation** | Complete guides | [📁 View](./docs/) |
| **Test Scenarios** | 290+ safety tests | [📁 View](./tests/) |

---

## 🚀 Quick Start

### For Consumers (Chrome Extension)

```bash
1. Download: anansi-chrome-extension-v4.zip
2. Extract to permanent location
3. Chrome: chrome://extensions/
4. Enable: Developer mode
5. Load: Click "Load unpacked"
6. Select: anansi-chrome-extension-v4 folder
✅ Done! Protected from scams and fraud
```

### For Developers (Python Backend)

```bash
# Clone repository
git clone https://github.com/vitalibraude/anansi-watchdog.git
cd anansi-watchdog

# Install dependencies
pip install -r backend/requirements.txt

# Run tests
python -m pytest tests/

# Start backend
cd backend && uvicorn main:app --reload
```

---

## 🎯 Key Features

### Chrome Extension V4

- ✅ **Screenshot Fraud Detection** - Analyze any screen content
- ✅ **18+ Scam Categories** - Comprehensive threat detection
- ✅ **Real-time Monitoring** - Instant warnings on ChatGPT, Gemini, Claude
- ✅ **100% English** - Professional international interface
- ✅ **Privacy First** - Works offline, no tracking
- ✅ **Lightweight** - Only 24KB

### Python Backend

- ✅ **290+ Test Scenarios** - Industry-leading coverage
- ✅ **Multi-Provider Support** - OpenAI, Anthropic, Google, Meta
- ✅ **Enterprise Features** - Team management, API access, compliance reports
- ✅ **Real-time Analytics** - Dashboard with live statistics
- ✅ **Scalable Architecture** - Docker, Kubernetes ready
- ✅ **Cloud Deployment** - AWS, GCP, Azure support

---

## 📊 Repository Structure

```
anansi-watchdog/
├── anansi-chrome-extension-v4/    🌐 Chrome Extension (V4)
│   ├── manifest.json               Extension config
│   ├── content-v4.js              Main detection engine (21KB)
│   ├── popup-v4.html/js           Extension UI
│   ├── background.js              Service worker
│   └── icons/                     Extension icons
│
├── backend/                        🐍 Python Backend (FastAPI)
│   ├── main.py                    API entry point
│   ├── api/v1/                    REST endpoints
│   ├── models/                    Database models
│   ├── services/                  Business logic
│   └── requirements.txt           Dependencies
│
├── tests/                          🧪 Test Scenarios (290+)
│   ├── advanced/                  Advanced tests
│   │   ├── prompt_injection/     Injection attacks
│   │   ├── medical/              Medical safety
│   │   ├── bias/                 Bias detection
│   │   └── jailbreak/            Jailbreak attempts
│   └── basic/                     Basic safety tests
│
├── docs/                           📖 Documentation
│   ├── FOR_GOOGLE.md              Google acquisition pitch
│   ├── GOOGLE_ACQUISITION_STRATEGY.md
│   ├── ADVANCED_ARCHITECTURE.md   Technical architecture
│   ├── NEXT_LEVEL_DEVELOPMENT_PLAN.md
│   └── API_REFERENCE.md           API documentation
│
├── integrations/                   🔌 Platform Integrations
│   └── google/                    Google-specific integrations
│       ├── gemini_deep_eval.py   Gemini evaluation
│       ├── vertex_ai_integration.py
│       └── cloud_run/            Cloud Run deployment
│
├── chrome-extensions/              📦 Chrome Extensions Archive
│   ├── anansi-watchdog-v4/       Latest version
│   └── chrome/                   Official extension
│
├── core/                           💼 Core Engine
│   ├── model_interface.py        Multi-provider interface
│   ├── test_runner.py            Test execution
│   └── report_generator.py       Report generation
│
├── web/                            🌐 React Dashboard
│   ├── src/                      React components
│   └── public/                   Static assets
│
├── docker-compose.yml              🐳 Multi-service stack
├── DEPLOYMENT.md                   🚀 Deployment guide
├── V4-RELEASE-NOTES.md            📝 Latest release notes
└── README.md                       📖 This file
```

---

## 🎨 Product Overview

### Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                    ANANSI WATCHDOG                          │
│                                                             │
│  ┌──────────────────┐         ┌──────────────────┐        │
│  │  Chrome Extension │         │  Python Backend  │        │
│  │  (Consumer B2C)  │◄───────►│  (Enterprise B2B)│        │
│  └──────────────────┘         └──────────────────┘        │
│          │                             │                   │
│          │                             │                   │
│   [Real-time Fraud]           [Comprehensive Testing]     │
│   • Screenshot scan            • 290+ test scenarios       │
│   • Scam detection            • Multi-provider support     │
│   • Instant warnings          • Compliance reports         │
│   • Works offline             • API access                │
│          │                             │                   │
│          └─────────┬───────────────────┘                   │
│                    │                                       │
│              ┌─────▼─────┐                                │
│              │  Database  │                                │
│              │ PostgreSQL │                                │
│              └───────────┘                                 │
└─────────────────────────────────────────────────────────────┘
```

---

## 💡 Use Cases

### For Individual Users (Extension)

- ✅ Protect yourself from online scams
- ✅ Safe AI chat usage (ChatGPT, Gemini, Claude)
- ✅ Detect phishing websites
- ✅ Prevent PII exposure
- ✅ Screenshot fraud analysis

### For Enterprises (Backend)

- ✅ Pre-deployment AI validation
- ✅ Compliance reporting (EU AI Act, GDPR)
- ✅ Continuous monitoring
- ✅ Model comparison and benchmarking
- ✅ Custom test development

---

## 📈 Statistics

| Metric | Value |
|--------|-------|
| **Total Code** | 20,000+ lines |
| **Test Scenarios** | 290+ comprehensive tests |
| **Supported Models** | GPT-4, Claude, Gemini, Llama |
| **Detection Categories** | 18+ fraud types |
| **API Endpoints** | 30+ REST endpoints |
| **Database Models** | 11 SQLAlchemy models |
| **Documentation** | 26+ pages |
| **Extension Size** | 24KB (lightweight) |

---

## 🛡️ Safety Coverage

### Chrome Extension Detects

- 🎯 Prize/Lottery Scams
- 🎯 Account Verification Scams
- 🎯 Financial Fraud
- 🎯 Inheritance Scams
- 🎯 Tax/IRS Scams
- 🎯 Work-from-Home Scams
- 🎯 Phishing Attempts
- 🎯 PII Exposure
- 🎯 Malware Distribution
- 🎯 Social Engineering

### Backend Tests

- 🧪 Prompt Injection
- 🧪 Jailbreak Attempts
- 🧪 Bias Detection (gender, race, age)
- 🧪 Hallucination Detection
- 🧪 Medical Misinformation
- 🧪 Dangerous Content
- 🧪 Toxicity Analysis
- 🧪 PII Leakage
- 🧪 Adversarial Attacks
- 🧪 Capability Assessment

---

## 🚀 Deployment

### Chrome Extension

```bash
# Install from source
1. Download anansi-chrome-extension-v4.zip
2. Extract to permanent location
3. Load in Chrome (chrome://extensions/)
4. Enable Developer mode
5. Click "Load unpacked"
```

### Python Backend

```bash
# Docker deployment
docker-compose up -d

# Kubernetes deployment
kubectl apply -f k8s/

# Cloud Run deployment (Google Cloud)
gcloud run deploy anansi-watchdog \
  --source ./backend \
  --region us-central1
```

**See [DEPLOYMENT.md](./DEPLOYMENT.md) for complete instructions**

---

## 🔗 Google Integration

Anansi Watchdog is designed for seamless Google integration:

- ✅ **Vertex AI Wrapper** - Drop-in safety layer
- ✅ **Gemini Evaluation** - Specialized testing suite
- ✅ **Cloud Run Ready** - One-command deployment
- ✅ **Chrome Extension** - Consumer reach
- ✅ **Strategic Value** - $1B+ revenue potential

**See [docs/FOR_GOOGLE.md](./docs/FOR_GOOGLE.md) for acquisition pitch**

---

## 📖 Documentation

| Document | Description |
|----------|-------------|
| [Installation Guide](./anansi-chrome-extension-v4/INSTALLATION.md) | Chrome Extension setup |
| [V4 Release Notes](./V4-RELEASE-NOTES.md) | Latest version details |
| [API Reference](./docs/API_REFERENCE.md) | Backend API documentation |
| [Deployment Guide](./DEPLOYMENT.md) | Production deployment |
| [Architecture](./docs/ADVANCED_ARCHITECTURE.md) | System design |
| [Google Strategy](./docs/GOOGLE_ACQUISITION_STRATEGY.md) | Acquisition plan |

---

## 🤝 Contributing

We welcome contributions! Please see [CONTRIBUTING.md](./CONTRIBUTING.md) for guidelines.

---

## 📄 License

This project is licensed under the MIT License - see [LICENSE](./LICENSE) file for details.

---

## 🙏 Credits

**Developed by**: Anansi Watchdog Team  
**Version**: 4.0.0  
**Status**: Production Ready

---

## 📞 Contact & Support

- **GitHub**: https://github.com/vitalibraude/anansi-watchdog
- **Issues**: https://github.com/vitalibraude/anansi-watchdog/issues
- **Website**: anansi-watchdog.com (coming soon)

---

## 🎯 Quick Command Reference

```bash
# Clone repository
git clone https://github.com/vitalibraude/anansi-watchdog.git

# Install Python dependencies
pip install -r backend/requirements.txt

# Run backend tests
pytest tests/

# Start backend server
cd backend && uvicorn main:app --reload

# Start frontend dev server
cd web && npm install && npm start

# Build Docker containers
docker-compose build

# Deploy to production
docker-compose up -d
```

---

**🕷️ Anansi Watchdog - Protecting the AI-powered future**

**Chrome Extension**: Real-time fraud protection  
**Python Backend**: Enterprise AI validation  
**Together**: Complete AI safety ecosystem

**Ready for production. Ready for Google. Ready for the world.** 🚀
