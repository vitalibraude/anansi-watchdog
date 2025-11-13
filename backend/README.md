# Anansi Watchdog - Backend API

Enterprise-grade FastAPI backend for AI safety evaluation platform.

## 🏗️ Architecture

```
backend/
├── api/
│   └── v1/
│       ├── auth.py          # Authentication endpoints
│       ├── tests.py         # Test execution endpoints
│       ├── models.py        # AI model registry
│       ├── analytics.py     # Analytics and insights
│       └── community.py     # Community features
├── services/
│   ├── auth.py             # Auth helper functions
│   └── test_runner.py      # Test execution service
├── models/
│   └── database.py         # SQLAlchemy ORM models
├── db/
│   └── session.py          # Database session management
├── ml_evaluators/
│   └── (ML model evaluators)
├── utils/
│   └── logger.py           # Logging configuration
├── config/
│   └── settings.py         # Application settings
├── main.py                 # FastAPI application
└── requirements.txt        # Python dependencies
```

## 🚀 Quick Start

### Prerequisites

- Python 3.11+
- PostgreSQL 15+
- Redis 7+
- (Optional) GPU for ML evaluators

### Installation

```bash
# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Set up environment variables
cp .env.example .env
# Edit .env with your configuration
```

### Environment Variables

Create a `.env` file:

```env
# Application
DEBUG=true
ENVIRONMENT=development

# Database
DATABASE_URL=postgresql://anansi:password@localhost:5432/anansi_watchdog

# Redis
REDIS_URL=redis://localhost:6379/0

# AI API Keys
OPENAI_API_KEY=sk-...
ANTHROPIC_API_KEY=sk-ant-...
GOOGLE_API_KEY=AIza...

# Security
SECRET_KEY=your-super-secret-key-change-this
```

### Database Setup

```bash
# Initialize database (creates tables)
python -c "from db.session import init_db; import asyncio; asyncio.run(init_db())"

# Or use Alembic for migrations
alembic init alembic
alembic revision --autogenerate -m "Initial migration"
alembic upgrade head
```

### Run Development Server

```bash
# Run with uvicorn
uvicorn main:app --reload --host 0.0.0.0 --port 8000

# Or run directly
python main.py
```

API will be available at:
- **API**: http://localhost:8000
- **Docs**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc

## 📚 API Endpoints

### Authentication

```
POST   /api/v1/auth/register       - Register new user
POST   /api/v1/auth/login          - Login user
POST   /api/v1/auth/refresh        - Refresh access token
GET    /api/v1/auth/me             - Get current user
GET    /api/v1/auth/api-key        - Get API key
POST   /api/v1/auth/api-key/regenerate - Regenerate API key
```

### Tests

```
POST   /api/v1/tests/run           - Run test batch
GET    /api/v1/tests/{id}/status   - Get test status
GET    /api/v1/tests/{id}/results  - Get test results
GET    /api/v1/tests/{id}/stream   - Stream results (SSE)
DELETE /api/v1/tests/{id}          - Cancel test
GET    /api/v1/tests/scenarios     - List test scenarios
GET    /api/v1/tests/scenarios/categories - Get categories
```

### Models

```
GET    /api/v1/models/             - List AI models
GET    /api/v1/models/scores/latest - Get latest scores
GET    /api/v1/models/{id}/scores  - Get model history
```

### Analytics

```
GET    /api/v1/analytics/dashboard - Dashboard data
GET    /api/v1/analytics/trends    - Trend analysis
GET    /api/v1/analytics/compare   - Model comparison
```

### Community

```
POST   /api/v1/community/submit    - Submit test scenario
POST   /api/v1/community/vote/{id} - Vote on submission
GET    /api/v1/community/submissions - List submissions
```

## 🔐 Authentication

### JWT Token Authentication

```bash
# Register
curl -X POST http://localhost:8000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "username": "testuser",
    "password": "securepassword123"
  }'

# Login
curl -X POST http://localhost:8000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "securepassword123"
  }'

# Use token
curl -X GET http://localhost:8000/api/v1/auth/me \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

### API Key Authentication

```bash
curl -X GET http://localhost:8000/api/v1/tests/scenarios \
  -H "X-API-Key: your-api-key-here"
```

## 🧪 Running Tests

Execute a test run:

```bash
curl -X POST http://localhost:8000/api/v1/tests/run \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "model_provider": "openai",
    "model_name": "gpt-4",
    "categories": ["safety", "bias"],
    "parallel": true,
    "max_concurrent": 10
  }'
```

Check status:

```bash
curl -X GET http://localhost:8000/api/v1/tests/{test_run_id}/status \
  -H "Authorization: Bearer YOUR_TOKEN"
```

Get results:

```bash
curl -X GET http://localhost:8000/api/v1/tests/{test_run_id}/results \
  -H "Authorization: Bearer YOUR_TOKEN"
```

## 🔄 Background Tasks

The application uses background tasks for:
- Async test execution
- Result processing
- Score calculation
- Email notifications

For production, use Celery:

```bash
# Start Celery worker
celery -A tasks worker --loglevel=info

# Start Celery beat (scheduled tasks)
celery -A tasks beat --loglevel=info

# Monitor with Flower
celery -A tasks flower
```

## 📊 Monitoring

### Health Checks

```bash
# Health check
curl http://localhost:8000/health

# Readiness check
curl http://localhost:8000/ready
```

### Metrics

Prometheus metrics available at:
```
http://localhost:9090/metrics
```

## 🐳 Docker Deployment

```bash
# Build image
docker build -t anansi-backend .

# Run container
docker run -d \
  -p 8000:8000 \
  --env-file .env \
  --name anansi-api \
  anansi-backend

# Run with Docker Compose
docker-compose up -d
```

## 🚀 Production Deployment

### Using Kubernetes

```bash
# Apply configurations
kubectl apply -f k8s/

# Check status
kubectl get pods -n anansi-production

# View logs
kubectl logs -f deployment/api-gateway -n anansi-production
```

### Using Gunicorn

```bash
# Production WSGI server
gunicorn main:app \
  --workers 4 \
  --worker-class uvicorn.workers.UvicornWorker \
  --bind 0.0.0.0:8000 \
  --access-logfile - \
  --error-logfile -
```

## 🔧 Development

### Code Style

```bash
# Format code
black backend/

# Lint code
flake8 backend/

# Type checking
mypy backend/
```

### Database Migrations

```bash
# Create migration
alembic revision --autogenerate -m "Add new column"

# Apply migrations
alembic upgrade head

# Rollback
alembic downgrade -1
```

## 📈 Performance

- **Response Time**: < 100ms (p95)
- **Throughput**: 1000+ req/sec
- **Concurrent Tests**: 100+ simultaneous
- **Database Pool**: 20 connections
- **Max Overflow**: 40 connections

## 🛡️ Security

- JWT token-based authentication
- API key support
- Rate limiting
- Input validation
- SQL injection prevention
- XSS protection
- CORS configuration
- Secrets management

## 📝 License

MIT License - see LICENSE file

## 🤝 Contributing

See CONTRIBUTING.md for guidelines

## 📞 Support

- **Documentation**: https://docs.anansi-watchdog.com
- **Issues**: https://github.com/anansi/watchdog/issues
- **Discord**: https://discord.gg/anansi
- **Email**: support@anansi-watchdog.com
