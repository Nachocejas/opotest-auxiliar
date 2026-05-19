from sqlalchemy import create_engine, Column, Integer, String, Text, ForeignKey, Float, event, DateTime
from sqlalchemy.sql import func
from sqlalchemy.engine import Engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, relationship
import os

# Use Environment Variable for Production (Supabase/PostgreSQL) or fallback to Local SQLite
DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./data/quiz.db")

# Fix for SQLAlchemy working with external PostgreSQL (Supabase needs sslmode)
if DATABASE_URL.startswith("postgres://"):
    DATABASE_URL = DATABASE_URL.replace("postgres://", "postgresql://", 1)

if "sqlite" in DATABASE_URL:
    engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})
else:
    # Production settings for PostgreSQL
    engine = create_engine(DATABASE_URL)

@event.listens_for(Engine, "connect")
def set_sqlite_pragma(dbapi_connection, connection_record):
    cursor = dbapi_connection.cursor()
    cursor.execute("PRAGMA foreign_keys=ON")
    cursor.close()

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

class Subject(Base):
    __tablename__ = "subjects"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, index=True)
    description = Column(String, nullable=True)
    topics = relationship("Topic", back_populates="subject", cascade="all, delete-orphan")

class Topic(Base):
    __tablename__ = "topics"
    id = Column(Integer, primary_key=True, index=True)
    subject_id = Column(Integer, ForeignKey("subjects.id"))
    name = Column(String, unique=True, index=True)
    description = Column(String, nullable=True)
    
    subject = relationship("Subject", back_populates="topics")
    questions = relationship("Question", back_populates="topic", cascade="all, delete-orphan")
    quiz_results = relationship("QuizResult", back_populates="topic", cascade="all, delete-orphan")

class Question(Base):
    __tablename__ = "questions"
    id = Column(Integer, primary_key=True, index=True)
    topic_id = Column(Integer, ForeignKey("topics.id"))
    text = Column(Text)
    option_a = Column(Text)
    option_b = Column(Text)
    option_c = Column(Text)
    option_d = Column(Text)
    correct_answer = Column(String(5))  # A, B, C, or D
    explanation = Column(Text, nullable=True)
    
    topic = relationship("Topic", back_populates="questions")

class QuizResult(Base):
    __tablename__ = "quiz_results"
    id = Column(Integer, primary_key=True, index=True)
    topic_id = Column(Integer, ForeignKey("topics.id"))
    score = Column(Integer)
    total_questions = Column(Integer)
    percentage = Column(Float)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    topic = relationship("Topic", back_populates="quiz_results")

def init_db():
    if not os.path.exists("./data"):
        os.makedirs("./data")
    Base.metadata.create_all(bind=engine)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
