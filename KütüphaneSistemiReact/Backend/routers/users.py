from fastapi import APIRouter, Depends, HTTPException, Body
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

class UserUpdate(BaseModel):
    username: str | None = None
    email: str | None = None
    password: str | None = None

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

@router.get("/users")
def get_all_users(db: Session = Depends(get_db)):
    users = db.query(User).all()
    return [
        {
            "id": user.Id,
            "username": user.Username,
            "email": user.Email,
            "role": user.Role,
            "createdAt": user.CreatedAt
        }
        for user in users
    ]

@router.get("/users/{user_id}")
def get_user(user_id: int, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.Id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="Kullanıcı bulunamadı")
    return {
        "id": user.Id,
        "username": user.Username,
        "email": user.Email,
        "role": user.Role,
        "createdAt": user.CreatedAt
    }

@router.put("/users/{user_id}")
def update_user(user_id: int, user_update: UserUpdate = Body(...), db: Session = Depends(get_db)):
    user = db.query(User).filter(User.Id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="Kullanıcı bulunamadı")
    if user_update.username is not None:
        user.Username = user_update.username
    if user_update.email is not None:
        user.Email = user_update.email
    if user_update.password is not None and user_update.password != "":
        user.Password = user_update.password
    db.commit()
    db.refresh(user)
    return {
        "id": user.Id,
        "username": user.Username,
        "email": user.Email,
        "role": user.Role,
        "createdAt": user.CreatedAt
    }
