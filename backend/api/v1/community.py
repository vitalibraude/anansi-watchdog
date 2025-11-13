"""
Anansi Watchdog - Community API
Community features: submissions, voting, discussions
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from uuid import UUID

from db.session import get_db
from services.auth import get_current_user
from models.database import User, TestSubmission, SubmissionVote
from pydantic import BaseModel


router = APIRouter()


class SubmissionCreate(BaseModel):
    """Create submission"""
    test_scenario: dict


class SubmissionResponse(BaseModel):
    """Submission response"""
    id: str
    user_id: str
    status: str
    votes: int
    created_at: str


@router.post("/submit", response_model=SubmissionResponse)
async def submit_test(
    submission: SubmissionCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
) -> SubmissionResponse:
    """Submit a new test scenario"""
    
    # Create submission
    db_submission = TestSubmission(
        user_id=current_user.id,
        test_scenario=submission.test_scenario,
        status="pending"
    )
    
    db.add(db_submission)
    db.commit()
    db.refresh(db_submission)
    
    return SubmissionResponse(
        id=str(db_submission.id),
        user_id=str(db_submission.user_id),
        status=db_submission.status,
        votes=db_submission.votes,
        created_at=str(db_submission.created_at)
    )


@router.post("/vote/{submission_id}")
async def vote_on_submission(
    submission_id: UUID,
    vote_type: str,  # upvote or downvote
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Vote on a submission"""
    
    # Check if already voted
    existing_vote = db.query(SubmissionVote).filter(
        SubmissionVote.user_id == current_user.id,
        SubmissionVote.submission_id == submission_id
    ).first()
    
    if existing_vote:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Already voted on this submission"
        )
    
    # Create vote
    vote = SubmissionVote(
        user_id=current_user.id,
        submission_id=submission_id,
        vote_type=vote_type
    )
    
    db.add(vote)
    
    # Update submission votes
    submission = db.query(TestSubmission).filter(
        TestSubmission.id == submission_id
    ).first()
    
    if submission:
        submission.votes += 1 if vote_type == "upvote" else -1
    
    db.commit()
    
    return {"message": "Vote recorded"}


@router.get("/submissions", response_model=List[SubmissionResponse])
async def list_submissions(
    status: str = "pending",
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db)
) -> List[SubmissionResponse]:
    """List community submissions"""
    
    submissions = db.query(TestSubmission).filter(
        TestSubmission.status == status
    ).offset(skip).limit(limit).all()
    
    return [
        SubmissionResponse(
            id=str(s.id),
            user_id=str(s.user_id),
            status=s.status,
            votes=s.votes,
            created_at=str(s.created_at)
        )
        for s in submissions
    ]
