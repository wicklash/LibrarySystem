from sqlalchemy import Column, Integer, String, DateTime, ForeignKey
from sqlalchemy.ext.declarative import declarative_base

Base = declarative_base()

class User(Base):
    __tablename__ = "Users"  # Match your table name exactly
    Id = Column(Integer, primary_key=True, autoincrement=True)
    Username = Column(String)
    Email = Column(String)
    Password = Column(String)
    Role = Column(String)
    CreatedAt = Column(DateTime)

class Book(Base):
    __tablename__ = "Books"
    Id = Column(Integer, primary_key=True, autoincrement=True)
    Title = Column(String)
    Author = Column(String)
    Description = Column(String)
    CoverImage = Column(String)
    ISBN = Column(String)
    PublishYear = Column(Integer)
    Category = Column(String)
    Available = Column(Integer)
    TotalCopies = Column(Integer)
    AvailableCopies = Column(Integer)
    AddedAt = Column(DateTime)

class BorrowedBook(Base):
    __tablename__ = "BorrowedBooks"
    Id = Column(Integer, primary_key=True, autoincrement=True)
    BookId = Column(Integer, ForeignKey("Books.Id"))
    UserId = Column(Integer, ForeignKey("Users.Id"))
    BorrowDate = Column(DateTime)
    DueDate = Column(DateTime)
    ReturnDate = Column(DateTime, nullable=True)

class Message(Base):
    __tablename__ = "Messages"
    Id = Column(Integer, primary_key=True, autoincrement=True)
    SenderId = Column(Integer, ForeignKey("Users.Id"))
    ReceiverId = Column(Integer, ForeignKey("Users.Id"))
    Content = Column(String)
    Read = Column(Integer)  # 0 veya 1 olarak tutulabilir (bool yerine int)
    CreatedAt = Column(DateTime)

class Review(Base):
    __tablename__ = "Reviews"
    Id = Column(Integer, primary_key=True, autoincrement=True)
    BookId = Column(Integer, ForeignKey("Books.Id"))
    UserId = Column(Integer, ForeignKey("Users.Id"))
    Rating = Column(Integer)  # 1-5 arası puan
    Comment = Column(String)
    Likes = Column(Integer, default=0)
    Dislikes = Column(Integer, default=0)
    CreatedAt = Column(DateTime)

class Favorite(Base):
    __tablename__ = "Favorites"
    Id = Column(Integer, primary_key=True, autoincrement=True)
    UserId = Column(Integer, ForeignKey("Users.Id"))
    BookId = Column(Integer, ForeignKey("Books.Id"))
    CreatedAt = Column(DateTime)
