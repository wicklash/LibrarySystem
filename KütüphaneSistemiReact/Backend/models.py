from sqlalchemy import Column, Integer, String, DateTime
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
