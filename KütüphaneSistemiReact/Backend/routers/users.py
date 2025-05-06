from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import SessionLocal
from models import User
from pydantic import BaseModel
from datetime import datetime

router = APIRouter()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

class UserLogin(BaseModel):
    email: str
    password: str

class UserRegister(BaseModel):
    username: str
    email: str
    password: str

@router.post("/login")
def login(user: UserLogin, db: Session = Depends(get_db)):
    db_user = db.query(User).filter(
        User.Email == user.email,
        User.Password == user.password
    ).first()
    if not db_user:
        raise HTTPException(status_code=400, detail="Geçersiz e-posta veya şifre")
    return {
        "id": db_user.Id,
        "username": db_user.Username,
        "email": db_user.Email,
        "role": db_user.Role
    }

@router.post("/register")
def register(user: UserRegister, db: Session = Depends(get_db)):
    # E-posta kontrolü
    existing_user = db.query(User).filter(User.Email == user.email).first()
    if existing_user:
        raise HTTPException(status_code=400, detail="Email already exists")
    # Yeni kullanıcı oluştur
    new_user = User(
        Username=user.username,
        Email=user.email,
        Password=user.password,  # Gerçek projede hash kullanın!
        Role="user",
        CreatedAt=datetime.utcnow()
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return {
        "id": new_user.Id,
        "username": new_user.Username,
        "email": new_user.Email,
        "role": new_user.Role
    }
