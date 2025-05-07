from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from database import SessionLocal
from models import Book

router = APIRouter(
    prefix="/books",
    tags=["books"]
)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.get("/{book_id}")
def get_book_by_id(book_id: int, db: Session = Depends(get_db)):
    book = db.query(Book).filter(Book.Id == book_id).first()
    if not book:
        raise HTTPException(status_code=404, detail="Book not found")
    return {
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
        "availableCopies": book.AvailableCopies,
        "addedAt": book.AddedAt,
    }

@router.get("/")
def get_all_books(db: Session = Depends(get_db)):
    books = db.query(Book).all()
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
            "availableCopies": book.AvailableCopies,
            "addedAt": book.AddedAt,
        }
        for book in books
    ]
