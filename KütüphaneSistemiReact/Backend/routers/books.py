from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from database import SessionLocal
from models import Book
from datetime import datetime

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

@router.get("/categories")
def get_book_categories(db: Session = Depends(get_db)):
    # Tüm kitapları çek
    books = db.query(Book).all()
    # Kategorileri ve sayıları hesapla
    category_counts = {}
    for book in books:
        category = book.Category
        if category in category_counts:
            category_counts[category] += 1
        else:
            category_counts[category] = 1
    # Sonucu uygun formatta döndür
    return [
        {"name": category, "count": count}
        for category, count in category_counts.items()
    ]

@router.get("/available")
def get_available_books(db: Session = Depends(get_db)):
    books = db.query(Book).filter(Book.Available == True, Book.AvailableCopies > 0).all()
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

    # Frontend ile model alanları arasındaki eşleşme
    field_map = {
        "title": "Title",
        "author": "Author",
        "description": "Description",
        "coverImage": "CoverImage",
        "isbn": "ISBN",
        "publishYear": "PublishYear",
        "category": "Category",
        "available": "Available",
        "totalCopies": "TotalCopies",
        "availableCopies": "AvailableCopies",
        "addedAt": "AddedAt",
    }

    for key, value in updates.items():
        model_key = field_map.get(key)
        if model_key and hasattr(book, model_key):
            # Eğer AddedAt alanı güncelleniyorsa, stringi datetime'a çevir
            if model_key == "AddedAt" and isinstance(value, str):
                try:
                    value = datetime.fromisoformat(value)
                except ValueError:
                    raise HTTPException(status_code=400, detail="Invalid date format for AddedAt")
            setattr(book, model_key, value)

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
