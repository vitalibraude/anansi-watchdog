"""
Anansi Watchdog - Database Models
SQLAlchemy ORM Models
"""

from sqlalchemy import (
    Column, String, Integer, Float, Boolean, DateTime, Text, 
    ForeignKey, JSON, Enum, Index, UniqueConstraint
)
from sqlalchemy.orm import relationship, declarative_base
from sqlalchemy.dialects.postgresql import UUID, ARRAY
from datetime import datetime
import uuid
import enum


Base = declarative_base()


# Enums
class UserTier(str, enum.Enum):
    FREE = "free"
    PRO = "pro"
    TEAM = "team"
    ENTERPRISE = "enterprise"


class TestStatus(str, enum.Enum):
    PENDING = "pending"
    RUNNING = "running"
    COMPLETED = "completed"
    FAILED = "failed"
    CANCELLED = "cancelled"


class Severity(str, enum.Enum):
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    CRITICAL = "critical"


# Models
class User(Base):
    """User model"""
    __tablename__ = "users"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    email = Column(String(255), unique=True, nullable=False, index=True)
    username = Column(String(50), unique=True, nullable=False, index=True)
    password_hash = Column(String(255), nullable=False)
    api_key = Column(String(64), unique=True, index=True)
    
    tier = Column(Enum(UserTier), default=UserTier.FREE)
    credits = Column(Integer, default=100)
    karma = Column(Integer, default=0)
    level = Column(Integer, default=1)
    
    is_active = Column(Boolean, default=True)
    is_verified = Column(Boolean, default=False)
    
    created_at = Column(DateTime, default=datetime.utcnow)
    last_login = Column(DateTime)
    metadata = Column(JSON, default=dict)
    
    # Relationships
    test_runs = relationship("TestRun", back_populates="user")
    api_usage = relationship("APIUsage", back_populates="user")
    
    def __repr__(self):
        return f"<User {self.username}>"


class Organization(Base):
    """Organization model for teams"""
    __tablename__ = "organizations"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String(255), nullable=False)
    owner_id = Column(UUID(as_uuid=True), ForeignKey("users.id"))
    
    tier = Column(Enum(UserTier))
    credits = Column(Integer, default=0)
    settings = Column(JSON, default=dict)
    
    created_at = Column(DateTime, default=datetime.utcnow)


class AIModel(Base):
    """AI Model registry"""
    __tablename__ = "ai_models"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    provider = Column(String(50), nullable=False)  # openai, anthropic, google
    name = Column(String(100), nullable=False)
    version = Column(String(50))
    
    api_endpoint = Column(String(255))
    pricing_per_1k_tokens = Column(Float)
    max_tokens = Column(Integer)
    supports_streaming = Column(Boolean, default=False)
    is_active = Column(Boolean, default=True)
    
    metadata = Column(JSON, default=dict)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    __table_args__ = (
        UniqueConstraint('provider', 'name', 'version', name='uq_model_version'),
    )
    
    # Relationships
    test_results = relationship("TestResult", back_populates="model")
    model_scores = relationship("ModelScore", back_populates="model")


class TestScenario(Base):
    """Test scenario definitions"""
    __tablename__ = "test_scenarios"
    
    id = Column(String(50), primary_key=True)  # e.g., 'racial_001'
    category = Column(String(50), nullable=False, index=True)
    subcategory = Column(String(50), index=True)
    
    prompt = Column(Text, nullable=False)
    expected_behavior = Column(Text)
    severity = Column(Enum(Severity))
    tags = Column(ARRAY(String), index=True)
    
    created_by = Column(UUID(as_uuid=True), ForeignKey("users.id"))
    is_public = Column(Boolean, default=True)
    version = Column(Integer, default=1)
    
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    test_results = relationship("TestResult", back_populates="scenario")


class TestRun(Base):
    """Test run execution"""
    __tablename__ = "test_runs"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    
    status = Column(Enum(TestStatus), default=TestStatus.PENDING, index=True)
    total_tests = Column(Integer)
    completed_tests = Column(Integer, default=0)
    
    created_at = Column(DateTime, default=datetime.utcnow, index=True)
    started_at = Column(DateTime)
    completed_at = Column(DateTime)
    
    config = Column(JSON, default=dict)
    metadata = Column(JSON, default=dict)
    
    # Relationships
    user = relationship("User", back_populates="test_runs")
    test_results = relationship("TestResult", back_populates="test_run")
    
    __table_args__ = (
        Index('ix_test_runs_user_created', 'user_id', 'created_at'),
    )


class TestResult(Base):
    """Individual test results"""
    __tablename__ = "test_results"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    test_run_id = Column(UUID(as_uuid=True), ForeignKey("test_runs.id"), nullable=False)
    test_id = Column(String(50), ForeignKey("test_scenarios.id"), nullable=False)
    model_id = Column(UUID(as_uuid=True), ForeignKey("ai_models.id"), nullable=False)
    
    prompt = Column(Text, nullable=False)
    response = Column(Text, nullable=False)
    
    safety_score = Column(Float)
    is_safe = Column(Boolean, index=True)
    violations = Column(JSON, default=list)
    
    latency_ms = Column(Integer)
    tokens_used = Column(Integer)
    
    created_at = Column(DateTime, default=datetime.utcnow, index=True)
    
    # Relationships
    test_run = relationship("TestRun", back_populates="test_results")
    scenario = relationship("TestScenario", back_populates="test_results")
    model = relationship("AIModel", back_populates="test_results")
    
    __table_args__ = (
        Index('ix_test_results_run', 'test_run_id'),
        Index('ix_test_results_model', 'model_id', 'created_at'),
        Index('ix_test_results_safe', 'is_safe'),
    )


class ModelScore(Base):
    """Aggregated model scores"""
    __tablename__ = "model_scores"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    model_id = Column(UUID(as_uuid=True), ForeignKey("ai_models.id"), nullable=False)
    date = Column(DateTime, nullable=False, index=True)
    
    safety_score = Column(Float)
    bias_score = Column(Float)
    hallucination_score = Column(Float)
    alignment_score = Column(Float)
    overall_score = Column(Float)
    
    total_tests = Column(Integer)
    passed_tests = Column(Integer)
    failed_tests = Column(Integer)
    
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    model = relationship("AIModel", back_populates="model_scores")
    
    __table_args__ = (
        UniqueConstraint('model_id', 'date', name='uq_model_score_date'),
    )


class APIUsage(Base):
    """API usage tracking"""
    __tablename__ = "api_usage"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    
    endpoint = Column(String(255), nullable=False)
    method = Column(String(10), nullable=False)
    status_code = Column(Integer)
    response_time_ms = Column(Integer)
    credits_used = Column(Integer, default=0)
    
    timestamp = Column(DateTime, default=datetime.utcnow, index=True)
    
    # Relationships
    user = relationship("User", back_populates="api_usage")
    
    __table_args__ = (
        Index('ix_api_usage_user_time', 'user_id', 'timestamp'),
    )


class TestSubmission(Base):
    """Community test submissions"""
    __tablename__ = "test_submissions"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    
    test_scenario = Column(JSON, nullable=False)
    status = Column(String(20), default='pending')  # pending, approved, rejected
    votes = Column(Integer, default=0)
    
    reviewed_by = Column(UUID(as_uuid=True), ForeignKey("users.id"))
    review_notes = Column(Text)
    
    created_at = Column(DateTime, default=datetime.utcnow, index=True)
    reviewed_at = Column(DateTime)


class SubmissionVote(Base):
    """Voting on test submissions"""
    __tablename__ = "submission_votes"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    submission_id = Column(UUID(as_uuid=True), ForeignKey("test_submissions.id"), nullable=False)
    vote_type = Column(String(10), nullable=False)  # upvote, downvote
    
    created_at = Column(DateTime, default=datetime.utcnow)
    
    __table_args__ = (
        UniqueConstraint('user_id', 'submission_id', name='uq_user_submission_vote'),
    )
