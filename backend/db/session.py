"""
Anansi Watchdog - Database Session Management
SQLAlchemy session and connection management
"""

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, Session
from sqlalchemy.pool import QueuePool
from typing import Generator
import logging

from config.settings import settings
from models.database import Base


logger = logging.getLogger(__name__)


# Create engine with connection pooling
engine = create_engine(
    settings.DATABASE_URL,
    echo=settings.DB_ECHO,
    poolclass=QueuePool,
    pool_size=settings.DB_POOL_SIZE,
    max_overflow=settings.DB_MAX_OVERFLOW,
    pool_pre_ping=True,  # Verify connections before using
    pool_recycle=3600,   # Recycle connections after 1 hour
)


# Create session factory
SessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine
)


async def init_db():
    """Initialize database - create all tables"""
    try:
        Base.metadata.create_all(bind=engine)
        logger.info("Database tables created successfully")
    except Exception as e:
        logger.error(f"Error creating database tables: {e}")
        raise


async def close_db():
    """Close database connections"""
    try:
        engine.dispose()
        logger.info("Database connections closed")
    except Exception as e:
        logger.error(f"Error closing database: {e}")


def get_db() -> Generator[Session, None, None]:
    """
    Dependency for getting database session
    
    Usage:
        @app.get("/users")
        def get_users(db: Session = Depends(get_db)):
            return db.query(User).all()
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


class DatabaseManager:
    """Database manager for advanced operations"""
    
    @staticmethod
    def get_session() -> Session:
        """Get a new database session"""
        return SessionLocal()
    
    @staticmethod
    def execute_raw(query: str, params: dict = None):
        """Execute raw SQL query"""
        with SessionLocal() as session:
            result = session.execute(query, params or {})
            session.commit()
            return result
    
    @staticmethod
    def bulk_insert(model_class, data: list):
        """Bulk insert records for performance"""
        with SessionLocal() as session:
            session.bulk_insert_mappings(model_class, data)
            session.commit()
    
    @staticmethod
    def bulk_update(model_class, data: list):
        """Bulk update records for performance"""
        with SessionLocal() as session:
            session.bulk_update_mappings(model_class, data)
            session.commit()
