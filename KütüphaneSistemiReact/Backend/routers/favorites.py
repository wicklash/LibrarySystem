from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from datetime import datetime
from database import SessionLocal
from models import Favorite, Book, User
from pydantic import BaseModel

router = APIRouter(
    prefix="/favorites",
    tags=["favorites"]
)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

class FavoriteCreate(BaseModel):
    user_id: int
    book_id: int

class BookInfo(BaseModel):
    id: int
    title: str
    author: str
    coverImage: str
    description: str
    isbn: str
    publishYear: int
    category: str
    available: bool
    totalCopies: int
    availableCopies: int

    class Config:
        orm_mode = True

@router.get("/user/{user_id}")
def get_user_favorites(user_id: int, db: Session = Depends(get_db)):
    # Check if user exists
    user = db.query(User).filter(User.Id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    # Get user's favorite books
    favorites = db.query(Book).join(Favorite).filter(Favorite.UserId == user_id).all()
    
    return [
        {
            "id": book.Id,
            "title": book.Title,
            "author": book.Author,
            "description": book.Description,
            "coverImage": book.CoverImage,
            "isbn": book.ISBN,
            "publishYear": book.PublishYear,
            "category": book.Category,
            "available": book.Available,
            "totalCopies": book.TotalCopies,
            "availableCopies": book.AvailableCopies
        }
        for book in favorites
    ]

@router.post("/")
def add_to_favorites(favorite: FavoriteCreate, db: Session = Depends(get_db)):
    # Check if user exists
    user = db.query(User).filter(User.Id == favorite.user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    # Check if book exists
    book = db.query(Book).filter(Book.Id == favorite.book_id).first()
    if not book:
        raise HTTPException(status_code=404, detail="Book not found")

    # Check if already in favorites
    existing_favorite = db.query(Favorite).filter(
        Favorite.UserId == favorite.user_id,
        Favorite.BookId == favorite.book_id
    ).first()
    
    if existing_favorite:
        raise HTTPException(status_code=400, detail="Book already in favorites")

    # Add to favorites
    new_favorite = Favorite(
        UserId=favorite.user_id,
        BookId=favorite.book_id,
        CreatedAt=datetime.now()
    )
    
    db.add(new_favorite)
    db.commit()
    db.refresh(new_favorite)
    
    return {"message": "Book added to favorites successfully"}

@router.delete("/{user_id}/{book_id}")
def remove_from_favorites(user_id: int, book_id: int, db: Session = Depends(get_db)):
    favorite = db.query(Favorite).filter(
        Favorite.UserId == user_id,
        Favorite.BookId == book_id
    ).first()
    
    if not favorite:
        raise HTTPException(status_code=404, detail="Favorite not found")
    
    db.delete(favorite)
    db.commit()
    
    return {"message": "Book removed from favorites successfully"}

@router.get("/check/{user_id}/{book_id}")
def check_favorite(user_id: int, book_id: int, db: Session = Depends(get_db)):
    favorite = db.query(Favorite).filter(
        Favorite.UserId == user_id,
        Favorite.BookId == book_id
    ).first()
    
    return {"is_favorite": favorite is not None} 