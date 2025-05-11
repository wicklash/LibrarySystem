from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from datetime import datetime
from pydantic import BaseModel
from database import SessionLocal
from models import Review, User, Book

router = APIRouter(
    prefix="/reviews",
    tags=["reviews"]
)

# Dependency
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# Review oluşturma için model
class ReviewCreate(BaseModel):
    book_id: int
    user_id: int
    rating: int
    comment: str

# Get all reviews for a book
@router.get("/book/{book_id}")
def get_book_reviews(book_id: int, db: Session = Depends(get_db)):
    reviews = db.query(Review, User.Username).join(User, Review.UserId == User.Id).filter(Review.BookId == book_id).all()
    return [
        {
            "Id": review.Id,
            "BookId": review.BookId,
            "UserId": review.UserId,
            "Rating": review.Rating,
            "Comment": review.Comment,
            "Likes": review.Likes,
            "Dislikes": review.Dislikes,
            "CreatedAt": review.CreatedAt,
            "Username": username
        }
        for review, username in reviews
    ]

# Add a new review
@router.post("/")
def create_review(review: ReviewCreate, db: Session = Depends(get_db)):
    # Validate rating
    if not 1 <= review.rating <= 5:
        raise HTTPException(status_code=400, detail="Rating must be between 1 and 5")
    
    # Check if book exists
    book = db.query(Book).filter(Book.Id == review.book_id).first()
    if not book:
        raise HTTPException(status_code=404, detail="Book not found")
    
    # Check if user exists
    user = db.query(User).filter(User.Id == review.user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Create new review
    new_review = Review(
        BookId=review.book_id,
        UserId=review.user_id,
        Rating=review.rating,
        Comment=review.comment,
        CreatedAt=datetime.now()
    )
    
    db.add(new_review)
    db.commit()
    db.refresh(new_review)
    
    # Return review with username
    return {
        "Id": new_review.Id,
        "BookId": new_review.BookId,
        "UserId": new_review.UserId,
        "Rating": new_review.Rating,
        "Comment": new_review.Comment,
        "Likes": new_review.Likes,
        "Dislikes": new_review.Dislikes,
        "CreatedAt": new_review.CreatedAt,
        "Username": user.Username
    }

# Update review likes/dislikes
@router.put("/{review_id}/like")
def like_review(review_id: int, db: Session = Depends(get_db)):
    review = db.query(Review).filter(Review.Id == review_id).first()
    if not review:
        raise HTTPException(status_code=404, detail="Review not found")
    
    review.Likes += 1
    db.commit()
    
    # Get username
    user = db.query(User).filter(User.Id == review.UserId).first()
    return {
        "Id": review.Id,
        "BookId": review.BookId,
        "UserId": review.UserId,
        "Rating": review.Rating,
        "Comment": review.Comment,
        "Likes": review.Likes,
        "Dislikes": review.Dislikes,
        "CreatedAt": review.CreatedAt,
        "Username": user.Username
    }

@router.put("/{review_id}/dislike")
def dislike_review(review_id: int, db: Session = Depends(get_db)):
    review = db.query(Review).filter(Review.Id == review_id).first()
    if not review:
        raise HTTPException(status_code=404, detail="Review not found")
    
    review.Dislikes += 1
    db.commit()
    
    # Get username
    user = db.query(User).filter(User.Id == review.UserId).first()
    return {
        "Id": review.Id,
        "BookId": review.BookId,
        "UserId": review.UserId,
        "Rating": review.Rating,
        "Comment": review.Comment,
        "Likes": review.Likes,
        "Dislikes": review.Dislikes,
        "CreatedAt": review.CreatedAt,
        "Username": user.Username
    }

# Delete a review
@router.delete("/{review_id}")
def delete_review(review_id: int, db: Session = Depends(get_db)):
    review = db.query(Review).filter(Review.Id == review_id).first()
    if not review:
        raise HTTPException(status_code=404, detail="Review not found")
    
    db.delete(review)
    db.commit()
    return {"message": "Review deleted successfully"} 