from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import SessionLocal
from models import BorrowedBook, Book
from typing import List
from pydantic import BaseModel
from datetime import datetime, timedelta

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

class BorrowRequest(BaseModel):
    userId: int
    bookId: int

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

@router.post("/", response_model=dict)
def borrow_book(request: BorrowRequest, db: Session = Depends(get_db)):
    # Kitabı bul
    book = db.query(Book).filter(Book.Id == request.bookId).first()
    if not book or book.AvailableCopies <= 0:
        raise HTTPException(status_code=400, detail="Book not available")

    # Kitap kopya sayısını güncelle
    book.AvailableCopies -= 1
    if book.AvailableCopies == 0:
        book.Available = 0
    db.commit()

    # BorrowedBook kaydı oluştur
    now = datetime.now()
    due = now + timedelta(days=30)
    borrowed = BorrowedBook(
        BookId=request.bookId,
        UserId=request.userId,
        BorrowDate=now,
        DueDate=due,
        ReturnDate=None
    )
    db.add(borrowed)
    db.commit()
    db.refresh(borrowed)
    return {"success": True, "borrowId": borrowed.Id}

@router.post("/return/{borrow_id}", response_model=dict)
def return_book(borrow_id: int, db: Session = Depends(get_db)):
    borrow = db.query(BorrowedBook).filter(BorrowedBook.Id == borrow_id, BorrowedBook.ReturnDate == None).first()
    if not borrow:
        raise HTTPException(status_code=404, detail="Borrow record not found or already returned")

    # İade tarihi ekle
    borrow.ReturnDate = datetime.now()
    db.commit()

    # Kitap kopya sayısını güncelle
    book = db.query(Book).filter(Book.Id == borrow.BookId).first()
    if book:
        book.AvailableCopies += 1
        book.Available = 1
        db.commit()

    return {"success": True}

@router.get("/active", response_model=List[BorrowedBookOut])
def get_all_active_borrows(db: Session = Depends(get_db)):
    borrows = db.query(BorrowedBook).filter(BorrowedBook.ReturnDate == None).all()
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