"""
Anansi Watchdog - Models API
AI model registry and scoring
"""

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List, Dict, Any
from datetime import datetime, timedelta

from db.session import get_db
from models.database import AIModel, ModelScore
from pydantic import BaseModel


router = APIRouter()


class ModelResponse(BaseModel):
    """Model response"""
    id: str
    provider: str
    name: str
    version: str
    is_active: bool


class ModelScoreResponse(BaseModel):
    """Model score response"""
    model_id: str
    date: datetime
    safety_score: float
    bias_score: float
    hallucination_score: float
    alignment_score: float
    overall_score: float


@router.get("/", response_model=List[ModelResponse])
async def list_models(
    provider: str = None,
    active_only: bool = True,
    db: Session = Depends(get_db)
) -> List[ModelResponse]:
    """List all AI models"""
    query = db.query(AIModel)
    
    if provider:
        query = query.filter(AIModel.provider == provider)
    
    if active_only:
        query = query.filter(AIModel.is_active == True)
    
    models = query.all()
    
    return [
        ModelResponse(
            id=str(m.id),
            provider=m.provider,
            name=m.name,
            version=m.version or "latest",
            is_active=m.is_active
        )
        for m in models
    ]


@router.get("/scores/latest")
async def get_latest_scores(
    db: Session = Depends(get_db)
) -> List[Dict[str, Any]]:
    """Get latest model scores"""
    from sqlalchemy import func
    
    # Get most recent score for each model
    subquery = db.query(
        ModelScore.model_id,
        func.max(ModelScore.date).label('max_date')
    ).group_by(ModelScore.model_id).subquery()
    
    scores = db.query(ModelScore).join(
        subquery,
        (ModelScore.model_id == subquery.c.model_id) & 
        (ModelScore.date == subquery.c.max_date)
    ).all()
    
    return [
        {
            "model_id": str(s.model_id),
            "overall_score": s.overall_score,
            "safety_score": s.safety_score,
            "bias_score": s.bias_score,
            "hallucination_score": s.hallucination_score,
            "alignment_score": s.alignment_score,
            "date": s.date
        }
        for s in scores
    ]


@router.get("/{model_id}/scores")
async def get_model_scores(
    model_id: str,
    days: int = 30,
    db: Session = Depends(get_db)
) -> List[ModelScoreResponse]:
    """Get historical scores for a model"""
    since_date = datetime.utcnow() - timedelta(days=days)
    
    scores = db.query(ModelScore).filter(
        ModelScore.model_id == model_id,
        ModelScore.date >= since_date
    ).order_by(ModelScore.date).all()
    
    return [
        ModelScoreResponse(
            model_id=str(s.model_id),
            date=s.date,
            safety_score=s.safety_score,
            bias_score=s.bias_score,
            hallucination_score=s.hallucination_score,
            alignment_score=s.alignment_score,
            overall_score=s.overall_score
        )
        for s in scores
    ]
