from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from database import SessionLocal
from models import BorrowedBook, Book
from typing import List
from pydantic import BaseModel

router = APIRouter(
    prefix="/borrowed",
    tags=["borrowed"]
)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

class BookInfo(BaseModel):
    id: int
    title: str
    author: str
    coverImage: str

class BorrowedBookOut(BaseModel):
    id: int
    bookId: int
    userId: int
    borrowDate: str
    dueDate: str
    returnDate: str | None
    book: BookInfo

    class Config:
        orm_mode = True

@router.get("/user/{user_id}", response_model=List[BorrowedBookOut])
def get_user_borrowed_books(user_id: int, db: Session = Depends(get_db)):
    borrows = db.query(BorrowedBook).filter(
        BorrowedBook.UserId == user_id,
        BorrowedBook.ReturnDate == None
    ).all()
    result = []
    for borrow in borrows:
        book = db.query(Book).filter(Book.Id == borrow.BookId).first()
        result.append({
            "id": borrow.Id,
            "bookId": borrow.BookId,
            "userId": borrow.UserId,
            "borrowDate": borrow.BorrowDate.isoformat(),
            "dueDate": borrow.DueDate.isoformat(),
            "returnDate": borrow.ReturnDate.isoformat() if borrow.ReturnDate else None,
            "book": {
                "id": book.Id,
                "title": book.Title,
                "author": book.Author,
                "coverImage": book.CoverImage
            }
        })
    return result

@router.get("/history/{user_id}", response_model=List[BorrowedBookOut])
def get_user_borrow_history(user_id: int, db: Session = Depends(get_db)):
    borrows = db.query(BorrowedBook).filter(
        BorrowedBook.UserId == user_id,
        BorrowedBook.ReturnDate != None
    ).all()
    result = []
    for borrow in borrows:
        book = db.query(Book).filter(Book.Id == borrow.BookId).first()
        result.append({
            "id": borrow.Id,
            "bookId": borrow.BookId,
            "userId": borrow.UserId,
            "borrowDate": borrow.BorrowDate.isoformat(),
            "dueDate": borrow.DueDate.isoformat(),
            "returnDate": borrow.ReturnDate.isoformat() if borrow.ReturnDate else None,
            "book": {
                "id": book.Id,
                "title": book.Title,
                "author": book.Author,
                "coverImage": book.CoverImage
            }
        })
    return result