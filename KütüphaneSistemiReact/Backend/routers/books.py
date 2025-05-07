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

@router.post("/")
def add_book(book: dict, db: Session = Depends(get_db)):
    new_book = Book(
        Title=book.get("title"),
        Author=book.get("author"),
        Description=book.get("description"),
        CoverImage=book.get("coverImage"),
        ISBN=book.get("isbn"),
        PublishYear=book.get("publishYear"),
        Category=book.get("category"),
        Available=book.get("available"),
        TotalCopies=book.get("totalCopies"),
        AvailableCopies=book.get("availableCopies"),
        AddedAt=book.get("addedAt"),
    )
    db.add(new_book)
    db.commit()
    db.refresh(new_book)
    return {
        "id": new_book.Id,
        "title": new_book.Title,
        "author": new_book.Author,
        "description": new_book.Description,
        "coverImage": new_book.CoverImage,
        "isbn": new_book.ISBN,
        "publishYear": new_book.PublishYear,
        "category": new_book.Category,
        "available": new_book.Available,
        "totalCopies": new_book.TotalCopies,
        "availableCopies": new_book.AvailableCopies,
        "addedAt": new_book.AddedAt,
    }

@router.put("/{book_id}")
def update_book(book_id: int, updates: dict, db: Session = Depends(get_db)):
    book = db.query(Book).filter(Book.Id == book_id).first()
    if not book:
        raise HTTPException(status_code=404, detail="Book not found")
    for key, value in updates.items():
        if hasattr(book, key):
            setattr(book, key, value)
    db.commit()
    db.refresh(book)
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

@router.delete("/{book_id}")
def delete_book(book_id: int, db: Session = Depends(get_db)):
    book = db.query(Book).filter(Book.Id == book_id).first()
    if not book:
        raise HTTPException(status_code=404, detail="Book not found")
    db.delete(book)
    db.commit()
    return {"message": "Kitap silindi"}
