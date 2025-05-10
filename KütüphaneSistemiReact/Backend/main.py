from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routers import users
from routers import borowed
from routers import books
from routers import messages
from routers import reviews
from routers import favorites
from models import Base
from database import engine

# Create database tables
Base.metadata.create_all(bind=engine)

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(users.router)
app.include_router(borowed.router)
app.include_router(books.router)
app.include_router(messages.router)
app.include_router(reviews.router)
app.include_router(favorites.router)
