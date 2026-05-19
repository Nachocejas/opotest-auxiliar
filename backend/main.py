from fastapi import FastAPI, UploadFile, File, Depends, HTTPException, Form
from sqlalchemy.orm import Session
from .database import init_db, get_db, Topic, Question, Subject, QuizResult
from .parser import extract_questions_from_pdf
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import os
import logging
from contextlib import asynccontextmanager

# Configure structured logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
)
logger = logging.getLogger("quiz-master")

class PasswordRequest(BaseModel):
    password: str

class SubjectCreate(BaseModel):
    name: str
    description: str = ""

class QuizResultCreate(BaseModel):
    topic_id: int
    score: int
    total_questions: int

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: Initialize database
    logger.info("Initializing database...")
    init_db()
    yield
    # Shutdown logic if needed can go here
    logger.info("Shutting down server...")

app = FastAPI(title="Quiz Master API", lifespan=lifespan)

# Password for access - Default if not set
APP_PASSWORD = os.getenv("APP_PASSWORD", "admin123")

# CORS setup
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.post("/verify-password")
async def verify_password(req: PasswordRequest):
    if req.password == APP_PASSWORD:
        logger.info("Successful login attempt")
        return {"status": "ok"}
    logger.warning("Failed login attempt")
    raise HTTPException(status_code=401, detail="Incorrect password")

@app.post("/upload")
async def upload_pdf(
    file: UploadFile = File(...),
    subject_id: int = Form(...),
    db: Session = Depends(get_db)
):
    if not file.filename.endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Only PDF files are allowed")
    
    try:
        content = await file.read()
        questions_data = extract_questions_from_pdf(content)
        
        if not questions_data:
            logger.warning(f"No questions found in PDF: {file.filename}")
            raise HTTPException(status_code=400, detail="No questions found in PDF")
    except Exception as e:
        logger.error(f"Failed to process PDF {file.filename}: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Error processing PDF: {str(e)}")
    
    # Create topic from filename
    topic_name = os.path.splitext(file.filename)[0]
    
    # Handle duplicates: Remove old topic if it exists to avoid mixing questions
    existing_topic = db.query(Topic).filter(Topic.name == topic_name).first()
    if existing_topic:
        db.delete(existing_topic)
        db.commit()
    
    topic = Topic(name=topic_name, subject_id=subject_id)
    db.add(topic)
    db.commit()
    db.refresh(topic)
    
    for q in questions_data:
        new_q = Question(
            topic_id=topic.id,
            text=q["text"],
            option_a=q["options"].get("A", ""),
            option_b=q["options"].get("B", ""),
            option_c=q["options"].get("C", ""),
            option_d=q["options"].get("D", ""),
            correct_answer=q["correct_answer"],
            explanation=q.get("explanation", "")
        )
        db.add(new_q)
    
    db.commit()
    return {"message": f"Uploaded {len(questions_data)} questions to topic {topic_name}", "topic_id": topic.id}

@app.get("/topics")
def list_topics(db: Session = Depends(get_db)):
    topics = db.query(Topic).all()
    results = []
    for t in topics:
        qr = db.query(QuizResult).filter(QuizResult.topic_id == t.id).order_by(QuizResult.created_at.desc()).all()
        attempts = len(qr)
        last_score = qr[0].percentage if attempts > 0 else None
        
        results.append({
            "id": t.id,
            "subject_id": t.subject_id,
            "name": t.name,
            "description": t.description,
            "attempts": attempts,
            "last_score": last_score
        })
    return results

@app.get("/subjects")
def list_subjects(db: Session = Depends(get_db)):
    return db.query(Subject).all()

@app.post("/subjects")
def create_subject(subject: SubjectCreate, db: Session = Depends(get_db)):
    try:
        new_sub = Subject(name=subject.name, description=subject.description)
        db.add(new_sub)
        db.commit()
        db.refresh(new_sub)
        return new_sub
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=400, detail="Subject already exists or error")

@app.get("/subjects/{subject_id}/topics")
def list_subject_topics(subject_id: int, db: Session = Depends(get_db)):
    return db.query(Topic).filter(Topic.subject_id == subject_id).all()

@app.get("/questions/{topic_id}")
def get_questions(topic_id: int, db: Session = Depends(get_db)):
    questions = db.query(Question).filter(Question.topic_id == topic_id).all()
    if not questions:
        raise HTTPException(status_code=404, detail="Topic not found")
    return questions

@app.delete("/topics/{topic_id}")
def delete_topic(topic_id: int, db: Session = Depends(get_db)):
    logger.info(f"Attempting to delete topic {topic_id}")
    topic = db.query(Topic).filter(Topic.id == topic_id).first()
    if not topic:
        logger.warning(f"Topic {topic_id} not found for deletion")
        raise HTTPException(status_code=404, detail="Topic not found")
    db.delete(topic)
    db.commit()
    logger.info(f"Topic {topic_id} deleted successfully")
    return {"message": "Topic deleted successfully"}

@app.post("/results")
def save_result(result: QuizResultCreate, db: Session = Depends(get_db)):
    percentage = (result.score / result.total_questions) * 100 if result.total_questions > 0 else 0
    new_res = QuizResult(
        topic_id=result.topic_id,
        score=result.score,
        total_questions=result.total_questions,
        percentage=percentage
    )
    db.add(new_res)
    db.commit()
    return {"status": "ok"}

@app.get("/stats")
def get_stats(db: Session = Depends(get_db)):
    results = db.query(QuizResult).order_by(QuizResult.created_at.desc()).all()
    stats = []
    for r in results:
        topic_name = r.topic.name if r.topic else "Desconocido"
        subject_name = r.topic.subject.name if r.topic and r.topic.subject else "Sin Asignatura"
        stats.append({
            "id": r.id,
            "topic_name": topic_name,
            "subject_name": subject_name,
            "score": r.score,
            "total_questions": r.total_questions,
            "percentage": r.percentage,
            "created_at": r.created_at
        })
    return stats

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
