# 🚀 Anansi Watchdog - Deployment Guide

Complete deployment guide for production infrastructure.

## 📋 Table of Contents

1. [Prerequisites](#prerequisites)
2. [Development Setup](#development-setup)
3. [Docker Deployment](#docker-deployment)
4. [Kubernetes Deployment](#kubernetes-deployment)
5. [Cloud Platforms](#cloud-platforms)
6. [Database Setup](#database-setup)
7. [Security Configuration](#security-configuration)
8. [Monitoring & Logging](#monitoring--logging)
9. [Scaling](#scaling)
10. [Troubleshooting](#troubleshooting)

---

## Prerequisites

### System Requirements

**Development:**
- Python 3.11+
- Node.js 20+
- PostgreSQL 15+
- Redis 7+
- 8GB RAM minimum
- 20GB disk space

**Production:**
- Kubernetes cluster (GKE, EKS, or AKS)
- PostgreSQL (managed service recommended)
- Redis (managed service recommended)
- Load balancer
- CDN (Cloudflare/CloudFront)
- 16GB+ RAM per API server
- SSD storage
- GPU instances (optional, for ML)

### Required Accounts

- GitHub (code repository)
- AWS/GCP/Azure (cloud infrastructure)
- OpenAI/Anthropic/Google AI (API keys)
- Sentry (error tracking)
- Datadog/New Relic (monitoring)

---

## Development Setup

### 1. Clone Repository

```bash
git clone https://github.com/your-org/anansi-watchdog.git
cd anansi-watchdog
```

### 2. Backend Setup

```bash
cd backend

# Create virtual environment
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Configure environment
cp .env.example .env
# Edit .env with your settings

# Initialize database
python -c "from db.session import init_db; import asyncio; asyncio.run(init_db())"

# Run server
uvicorn main:app --reload
```

### 3. Frontend Setup

```bash
cd web

# Install dependencies
npm install

# Configure environment
cp .env.example .env
# Edit .env with your API URL

# Run development server
npm run dev
```

### 4. Verify Installation

```bash
# Check backend
curl http://localhost:8000/health

# Check frontend
open http://localhost:3000
```

---

## Docker Deployment

### Quick Start with Docker Compose

```bash
# Start all services
docker-compose up -d

# Check status
docker-compose ps

# View logs
docker-compose logs -f api

# Stop services
docker-compose down
```

### Services

- **API**: http://localhost:8000
- **Frontend**: http://localhost:3000
- **Flower**: http://localhost:5555 (Celery monitoring)
- **PostgreSQL**: localhost:5432
- **Redis**: localhost:6379
- **MongoDB**: localhost:27017

### Production Docker Compose

```bash
# Use production configuration
docker-compose -f docker-compose.prod.yml up -d

# Scale services
docker-compose up -d --scale api=3 --scale celery-worker=5
```

---

## Kubernetes Deployment

### 1. Cluster Setup

**Google Kubernetes Engine (GKE):**
```bash
gcloud container clusters create anansi-cluster \
    --zone us-central1-a \
    --num-nodes 3 \
    --machine-type n1-standard-4 \
    --enable-autoscaling \
    --min-nodes 3 \
    --max-nodes 10
```

**Amazon EKS:**
```bash
eksctl create cluster \
    --name anansi-cluster \
    --region us-east-1 \
    --nodegroup-name standard-workers \
    --node-type t3.large \
    --nodes 3 \
    --nodes-min 3 \
    --nodes-max 10
```

### 2. Configure kubectl

```bash
# Get credentials
gcloud container clusters get-credentials anansi-cluster --zone us-central1-a

# Verify connection
kubectl cluster-info
```

### 3. Create Namespace

```bash
kubectl create namespace anansi-production
kubectl config set-context --current --namespace=anansi-production
```

### 4. Deploy Secrets

```bash
# Create secrets
kubectl create secret generic anansi-secrets \
    --from-literal=database-url="postgresql://..." \
    --from-literal=openai-api-key="sk-..." \
    --from-literal=anthropic-api-key="sk-ant-..." \
    --from-literal=secret-key="your-secret"

# Verify
kubectl get secrets
```

### 5. Deploy Application

```bash
# Apply configurations
kubectl apply -f k8s/

# Check deployments
kubectl get deployments

# Check pods
kubectl get pods

# Check services
kubectl get services
```

### 6. Expose Service

```bash
# Create load balancer
kubectl expose deployment api-gateway \
    --type=LoadBalancer \
    --port=80 \
    --target-port=8000

# Get external IP
kubectl get service api-gateway
```

---

## Cloud Platforms

### AWS Deployment

**1. Infrastructure with Terraform:**

```bash
cd terraform/aws

# Initialize
terraform init

# Plan
terraform plan

# Apply
terraform apply
```

**2. RDS PostgreSQL:**

```bash
aws rds create-db-instance \
    --db-instance-identifier anansi-postgres \
    --db-instance-class db.t3.large \
    --engine postgres \
    --engine-version 15.3 \
    --master-username admin \
    --master-user-password your-password \
    --allocated-storage 100 \
    --storage-type gp3 \
    --multi-az
```

**3. ElastiCache Redis:**

```bash
aws elasticache create-cache-cluster \
    --cache-cluster-id anansi-redis \
    --cache-node-type cache.r6g.large \
    --engine redis \
    --engine-version 7.0 \
    --num-cache-nodes 1
```

### GCP Deployment

**1. Cloud SQL:**

```bash
gcloud sql instances create anansi-postgres \
    --database-version=POSTGRES_15 \
    --tier=db-n1-standard-4 \
    --region=us-central1
```

**2. Cloud Memorystore:**

```bash
gcloud redis instances create anansi-redis \
    --size=5 \
    --region=us-central1 \
    --redis-version=redis_7_0
```

### Azure Deployment

**1. Azure Database for PostgreSQL:**

```bash
az postgres server create \
    --resource-group anansi-rg \
    --name anansi-postgres \
    --location eastus \
    --admin-user admin \
    --admin-password your-password \
    --sku-name GP_Gen5_4
```

**2. Azure Cache for Redis:**

```bash
az redis create \
    --resource-group anansi-rg \
    --name anansi-redis \
    --location eastus \
    --sku Standard \
    --vm-size c3
```

---

## Database Setup

### PostgreSQL Migration

```bash
cd backend

# Initialize Alembic
alembic init alembic

# Create migration
alembic revision --autogenerate -m "Initial schema"

# Apply migration
alembic upgrade head

# Rollback (if needed)
alembic downgrade -1
```

### Database Backup

```bash
# Backup
pg_dump -h localhost -U anansi anansi_watchdog > backup.sql

# Restore
psql -h localhost -U anansi anansi_watchdog < backup.sql

# Automated backups (cron)
0 2 * * * pg_dump -h localhost -U anansi anansi_watchdog > /backups/anansi_$(date +\%Y\%m\%d).sql
```

---

## Security Configuration

### 1. SSL/TLS Setup

```bash
# Generate self-signed cert (development)
openssl req -x509 -newkey rsa:4096 \
    -keyout key.pem -out cert.pem \
    -days 365 -nodes

# Production: Use Let's Encrypt
certbot certonly --standalone \
    -d api.anansi-watchdog.com \
    -d www.anansi-watchdog.com
```

### 2. Firewall Rules

```bash
# Allow HTTP/HTTPS
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp

# Allow PostgreSQL (internal only)
sudo ufw allow from 10.0.0.0/8 to any port 5432

# Enable firewall
sudo ufw enable
```

### 3. API Rate Limiting

Configure in `backend/config/settings.py`:

```python
RATE_LIMIT_PER_MINUTE = 60
RATE_LIMIT_PER_HOUR = 1000
```

### 4. Secrets Management

**AWS Secrets Manager:**
```bash
aws secretsmanager create-secret \
    --name anansi/api-keys \
    --secret-string '{"openai":"sk-...","anthropic":"sk-ant-..."}'
```

**HashiCorp Vault:**
```bash
vault kv put secret/anansi \
    openai_api_key="sk-..." \
    anthropic_api_key="sk-ant-..."
```

---

## Monitoring & Logging

### 1. Prometheus + Grafana

```bash
# Deploy Prometheus
kubectl apply -f k8s/monitoring/prometheus.yaml

# Deploy Grafana
kubectl apply -f k8s/monitoring/grafana.yaml

# Access Grafana
kubectl port-forward svc/grafana 3000:3000
```

### 2. ELK Stack (Elasticsearch, Logstash, Kibana)

```bash
# Deploy ELK
helm install elastic elastic/elasticsearch
helm install kibana elastic/kibana

# Configure log shipping
kubectl apply -f k8s/logging/filebeat.yaml
```

### 3. Application Monitoring

**Sentry Integration:**
```python
# In backend/main.py
import sentry_sdk

sentry_sdk.init(
    dsn="https://...@sentry.io/...",
    traces_sample_rate=1.0
)
```

### 4. Alerts

```yaml
# prometheus/alerts.yaml
groups:
  - name: anansi_alerts
    rules:
      - alert: HighErrorRate
        expr: rate(http_requests_total{status=~"5.."}[5m]) > 0.05
        for: 5m
        annotations:
          summary: "High error rate detected"
```

---

## Scaling

### Horizontal Pod Autoscaling

```yaml
# k8s/hpa.yaml
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: api-hpa
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
```

### Database Scaling

**Read Replicas:**
```bash
# Create read replica
aws rds create-db-instance-read-replica \
    --db-instance-identifier anansi-postgres-replica \
    --source-db-instance-identifier anansi-postgres
```

**Connection Pooling:**
```python
# Use PgBouncer
DATABASE_URL = "postgresql://pgbouncer:6432/anansi_watchdog"
```

---

## Troubleshooting

### Common Issues

**1. Database Connection Failed**
```bash
# Check connectivity
psql -h localhost -U anansi -d anansi_watchdog

# Check logs
kubectl logs deployment/api-gateway
```

**2. High Memory Usage**
```bash
# Check pod resources
kubectl top pods

# Scale down
kubectl scale deployment api-gateway --replicas=2
```

**3. Slow Response Times**
```bash
# Check Redis
redis-cli ping

# Clear cache
redis-cli FLUSHALL

# Check database queries
# Enable slow query log in PostgreSQL
```

### Health Checks

```bash
# API health
curl http://your-domain/health

# Database
pg_isready -h localhost -U anansi

# Redis
redis-cli ping

# Celery
celery -A tasks inspect active
```

---

## Performance Optimization

### 1. Database Indexing

```sql
-- Add indexes for common queries
CREATE INDEX idx_test_results_model ON test_results(model_id, created_at);
CREATE INDEX idx_test_results_safe ON test_results(is_safe);
```

### 2. Caching Strategy

```python
# Redis caching
CACHE_KEYS = {
    "model_scores": 300,  # 5 minutes
    "test_scenarios": 3600,  # 1 hour
    "leaderboard": 900  # 15 minutes
}
```

### 3. CDN Configuration

```nginx
# Nginx CDN config
location /static/ {
    expires 1y;
    add_header Cache-Control "public, immutable";
}
```

---

## Backup & Recovery

### Automated Backups

```bash
# Database backup script
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
pg_dump anansi_watchdog > /backups/db_$DATE.sql
aws s3 cp /backups/db_$DATE.sql s3://anansi-backups/

# Schedule with cron
0 */6 * * * /scripts/backup.sh
```

### Disaster Recovery

```bash
# Restore from backup
aws s3 cp s3://anansi-backups/latest.sql .
psql anansi_watchdog < latest.sql

# Verify
psql -c "SELECT COUNT(*) FROM users;"
```

---

## Cost Optimization

### Resource Right-Sizing

```bash
# Monitor actual usage
kubectl top nodes
kubectl top pods

# Adjust resources
kubectl set resources deployment api-gateway \
    --limits=cpu=1000m,memory=2Gi \
    --requests=cpu=500m,memory=1Gi
```

### Spot Instances

```yaml
# Use spot instances for workers
nodeSelector:
  cloud.google.com/gke-preemptible: "true"
```

---

## Security Checklist

- [ ] SSL/TLS certificates configured
- [ ] API rate limiting enabled
- [ ] Database encrypted at rest
- [ ] Secrets managed securely
- [ ] Network policies configured
- [ ] Regular security audits
- [ ] Dependency updates automated
- [ ] WAF configured
- [ ] DDoS protection enabled
- [ ] Backup encryption enabled

---

## Production Readiness Checklist

- [ ] All tests passing
- [ ] Performance benchmarks met
- [ ] Monitoring configured
- [ ] Alerts set up
- [ ] Backups automated
- [ ] Disaster recovery plan
- [ ] Documentation complete
- [ ] Security review passed
- [ ] Load testing completed
- [ ] Rollback procedure documented

---

## Support

For deployment issues:
- **Email**: devops@anansi-watchdog.com
- **Slack**: #deployment-support
- **On-call**: PagerDuty

---

**Last Updated**: 2025-11-13  
**Version**: 2.0.0
