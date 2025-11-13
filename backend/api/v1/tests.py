"""
Anansi Watchdog - Tests API Endpoints
Comprehensive test execution and management
"""

from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks, status
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
from typing import List, Optional, Dict, Any
from uuid import UUID
from datetime import datetime
import asyncio
import json

from models.database import TestRun, TestResult, TestScenario, User
from db.session import get_db
from services.test_runner import TestRunnerService
from services.auth import get_current_user
from pydantic import BaseModel, Field


router = APIRouter()


# Pydantic models
class TestRunRequest(BaseModel):
    """Test run request"""
    model_provider: str = Field(..., description="AI provider (openai, anthropic, google)")
    model_name: Optional[str] = Field(None, description="Specific model name")
    test_ids: Optional[List[str]] = Field(None, description="Specific test IDs to run")
    categories: Optional[List[str]] = Field(None, description="Test categories to run")
    severity: Optional[List[str]] = Field(None, description="Filter by severity")
    parallel: bool = Field(True, description="Run tests in parallel")
    max_concurrent: int = Field(10, description="Max concurrent tests")


class TestRunResponse(BaseModel):
    """Test run response"""
    id: UUID
    status: str
    total_tests: int
    completed_tests: int
    created_at: datetime
    started_at: Optional[datetime]
    completed_at: Optional[datetime]


class TestResultResponse(BaseModel):
    """Test result response"""
    id: UUID
    test_id: str
    prompt: str
    response: str
    safety_score: float
    is_safe: bool
    violations: List[Dict[str, Any]]
    latency_ms: int
    created_at: datetime


class TestScenarioResponse(BaseModel):
    """Test scenario response"""
    id: str
    category: str
    subcategory: Optional[str]
    prompt: str
    expected_behavior: Optional[str]
    severity: str
    tags: List[str]


# Endpoints
@router.post("/run", response_model=TestRunResponse, status_code=status.HTTP_202_ACCEPTED)
async def run_tests(
    request: TestRunRequest,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
) -> TestRunResponse:
    """
    Run AI safety tests
    
    This endpoint initiates a test run against specified AI models.
    Tests are executed asynchronously and results can be retrieved via status endpoint.
    """
    # Check user credits
    if current_user.credits < 1:
        raise HTTPException(
            status_code=status.HTTP_402_PAYMENT_REQUIRED,
            detail="Insufficient credits. Please upgrade your plan."
        )
    
    # Create test run
    test_run = TestRun(
        user_id=current_user.id,
        status="pending",
        config={
            "model_provider": request.model_provider,
            "model_name": request.model_name,
            "test_ids": request.test_ids,
            "categories": request.categories,
            "severity": request.severity,
            "parallel": request.parallel,
            "max_concurrent": request.max_concurrent
        }
    )
    
    # Get test scenarios
    query = db.query(TestScenario)
    
    if request.test_ids:
        query = query.filter(TestScenario.id.in_(request.test_ids))
    
    if request.categories:
        query = query.filter(TestScenario.category.in_(request.categories))
    
    if request.severity:
        query = query.filter(TestScenario.severity.in_(request.severity))
    
    scenarios = query.all()
    
    if not scenarios:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No test scenarios match the criteria"
        )
    
    test_run.total_tests = len(scenarios)
    
    db.add(test_run)
    db.commit()
    db.refresh(test_run)
    
    # Execute tests in background
    background_tasks.add_task(
        execute_test_run,
        test_run.id,
        scenarios,
        request.model_provider,
        request.model_name,
        request.parallel,
        request.max_concurrent
    )
    
    return TestRunResponse(
        id=test_run.id,
        status=test_run.status,
        total_tests=test_run.total_tests,
        completed_tests=test_run.completed_tests,
        created_at=test_run.created_at,
        started_at=test_run.started_at,
        completed_at=test_run.completed_at
    )


@router.get("/{test_run_id}/status", response_model=TestRunResponse)
async def get_test_status(
    test_run_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
) -> TestRunResponse:
    """Get test run status"""
    test_run = db.query(TestRun).filter(
        TestRun.id == test_run_id,
        TestRun.user_id == current_user.id
    ).first()
    
    if not test_run:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Test run not found"
        )
    
    return TestRunResponse(
        id=test_run.id,
        status=test_run.status,
        total_tests=test_run.total_tests,
        completed_tests=test_run.completed_tests,
        created_at=test_run.created_at,
        started_at=test_run.started_at,
        completed_at=test_run.completed_at
    )


@router.get("/{test_run_id}/results", response_model=List[TestResultResponse])
async def get_test_results(
    test_run_id: UUID,
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
) -> List[TestResultResponse]:
    """Get test run results"""
    # Verify ownership
    test_run = db.query(TestRun).filter(
        TestRun.id == test_run_id,
        TestRun.user_id == current_user.id
    ).first()
    
    if not test_run:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Test run not found"
        )
    
    results = db.query(TestResult).filter(
        TestResult.test_run_id == test_run_id
    ).offset(skip).limit(limit).all()
    
    return [
        TestResultResponse(
            id=r.id,
            test_id=r.test_id,
            prompt=r.prompt,
            response=r.response,
            safety_score=r.safety_score,
            is_safe=r.is_safe,
            violations=r.violations,
            latency_ms=r.latency_ms,
            created_at=r.created_at
        )
        for r in results
    ]


@router.get("/{test_run_id}/stream")
async def stream_test_results(
    test_run_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Stream test results in real-time (Server-Sent Events)"""
    # Verify ownership
    test_run = db.query(TestRun).filter(
        TestRun.id == test_run_id,
        TestRun.user_id == current_user.id
    ).first()
    
    if not test_run:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Test run not found"
        )
    
    async def event_stream():
        """Generate SSE stream"""
        last_count = 0
        
        while True:
            # Check current progress
            test_run = db.query(TestRun).filter(
                TestRun.id == test_run_id
            ).first()
            
            if test_run.completed_tests > last_count:
                # New results available
                new_results = db.query(TestResult).filter(
                    TestResult.test_run_id == test_run_id
                ).offset(last_count).limit(test_run.completed_tests - last_count).all()
                
                for result in new_results:
                    data = {
                        "test_id": result.test_id,
                        "is_safe": result.is_safe,
                        "safety_score": result.safety_score,
                        "completed": test_run.completed_tests,
                        "total": test_run.total_tests
                    }
                    yield f"data: {json.dumps(data)}\n\n"
                
                last_count = test_run.completed_tests
            
            # Check if completed
            if test_run.status in ["completed", "failed", "cancelled"]:
                yield f"data: {json.dumps({'status': test_run.status, 'done': True})}\n\n"
                break
            
            await asyncio.sleep(1)
    
    return StreamingResponse(
        event_stream(),
        media_type="text/event-stream"
    )


@router.delete("/{test_run_id}")
async def cancel_test_run(
    test_run_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
) -> Dict[str, str]:
    """Cancel a running test"""
    test_run = db.query(TestRun).filter(
        TestRun.id == test_run_id,
        TestRun.user_id == current_user.id
    ).first()
    
    if not test_run:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Test run not found"
        )
    
    if test_run.status not in ["pending", "running"]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Cannot cancel test with status: {test_run.status}"
        )
    
    test_run.status = "cancelled"
    db.commit()
    
    return {"message": "Test run cancelled"}


@router.get("/scenarios", response_model=List[TestScenarioResponse])
async def list_test_scenarios(
    category: Optional[str] = None,
    severity: Optional[str] = None,
    tags: Optional[List[str]] = None,
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db)
) -> List[TestScenarioResponse]:
    """List available test scenarios"""
    query = db.query(TestScenario).filter(TestScenario.is_public == True)
    
    if category:
        query = query.filter(TestScenario.category == category)
    
    if severity:
        query = query.filter(TestScenario.severity == severity)
    
    if tags:
        # PostgreSQL array overlap operator
        query = query.filter(TestScenario.tags.overlap(tags))
    
    scenarios = query.offset(skip).limit(limit).all()
    
    return [
        TestScenarioResponse(
            id=s.id,
            category=s.category,
            subcategory=s.subcategory,
            prompt=s.prompt,
            expected_behavior=s.expected_behavior,
            severity=s.severity,
            tags=s.tags
        )
        for s in scenarios
    ]


@router.get("/scenarios/categories")
async def get_test_categories(
    db: Session = Depends(get_db)
) -> Dict[str, Any]:
    """Get all test categories with counts"""
    from sqlalchemy import func
    
    categories = db.query(
        TestScenario.category,
        func.count(TestScenario.id).label('count')
    ).filter(
        TestScenario.is_public == True
    ).group_by(
        TestScenario.category
    ).all()
    
    return {
        "categories": [
            {"name": cat, "count": count}
            for cat, count in categories
        ],
        "total": sum(count for _, count in categories)
    }


# Background task functions
async def execute_test_run(
    test_run_id: UUID,
    scenarios: List[TestScenario],
    model_provider: str,
    model_name: Optional[str],
    parallel: bool,
    max_concurrent: int
):
    """Execute test run in background"""
    from db.session import SessionLocal
    
    db = SessionLocal()
    test_runner = TestRunnerService()
    
    try:
        # Update status
        test_run = db.query(TestRun).filter(TestRun.id == test_run_id).first()
        test_run.status = "running"
        test_run.started_at = datetime.utcnow()
        db.commit()
        
        # Run tests
        results = await test_runner.run_tests(
            scenarios=scenarios,
            model_provider=model_provider,
            model_name=model_name,
            parallel=parallel,
            max_concurrent=max_concurrent
        )
        
        # Save results
        for result in results:
            db_result = TestResult(
                test_run_id=test_run_id,
                test_id=result['test_id'],
                model_id=result['model_id'],
                prompt=result['prompt'],
                response=result['response'],
                safety_score=result['safety_score'],
                is_safe=result['is_safe'],
                violations=result['violations'],
                latency_ms=result['latency_ms']
            )
            db.add(db_result)
            
            # Update progress
            test_run.completed_tests += 1
            db.commit()
        
        # Mark as completed
        test_run.status = "completed"
        test_run.completed_at = datetime.utcnow()
        db.commit()
        
    except Exception as e:
        # Mark as failed
        test_run = db.query(TestRun).filter(TestRun.id == test_run_id).first()
        test_run.status = "failed"
        test_run.metadata = {"error": str(e)}
        db.commit()
        raise
    
    finally:
        db.close()
