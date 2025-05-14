from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from database import SessionLocal
from models import Message
from datetime import datetime

router = APIRouter(
    prefix="/messages",
    tags=["messages"]
)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# 1. Kullanıcının mesajlarını getir
@router.get("/user/{user_id}")
def get_user_messages(user_id: int, db: Session = Depends(get_db)):
    messages = db.query(Message).filter(
        (Message.ReceiverId == user_id) | (Message.SenderId == user_id)
    ).order_by(Message.CreatedAt.desc()).all()
    return [
        {
            "id": msg.Id,
            "senderId": msg.SenderId,
            "receiverId": msg.ReceiverId,
            "content": msg.Content,
            "read": bool(msg.Read),
            "createdAt": msg.CreatedAt,
        }
        for msg in messages
    ]

# 2. Mesaj gönder
@router.post("/send")
def send_message(data: dict, db: Session = Depends(get_db)):
    sender_id = data.get("senderId")
    receiver_id = data.get("receiverId")
    content = data.get("content")
    if not (sender_id and receiver_id and content):
        raise HTTPException(status_code=400, detail="Eksik veri")
    new_message = Message(
        SenderId=sender_id,
        ReceiverId=receiver_id,
        Content=content,
        Read=0,
        CreatedAt=datetime.now()
    )
    db.add(new_message)
    db.commit()
    db.refresh(new_message)
    return {
        "id": new_message.Id,
        "senderId": new_message.SenderId,
        "receiverId": new_message.ReceiverId,
        "content": new_message.Content,
        "read": bool(new_message.Read),
        "createdAt": new_message.CreatedAt,
    }

# 3. Mesajı okundu olarak işaretle
@router.post("/read/{message_id}")
def mark_message_as_read(message_id: int, db: Session = Depends(get_db)):
    message = db.query(Message).filter(Message.Id == message_id).first()
    if not message:
        raise HTTPException(status_code=404, detail="Mesaj bulunamadı")
    message.Read = 1
    db.commit()
    db.refresh(message)
    return {
        "id": message.Id,
        "senderId": message.SenderId,
        "receiverId": message.ReceiverId,
        "content": message.Content,
        "read": bool(message.Read),
        "createdAt": message.CreatedAt,
    }

# 4. Okunmamış mesaj sayısı
@router.get("/unread/count/{user_id}")
def get_unread_message_count(user_id: int, db: Session = Depends(get_db)):
    count = db.query(Message).filter(
        Message.ReceiverId == user_id,
        Message.Read == 0
    ).count()
    return {"unreadCount": count}
