from fastapi import FastAPI, HTTPException, Depends
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from sqlalchemy import create_engine, Column, Integer, String, Float, DateTime, ForeignKey, Text
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, Session
from sqlalchemy.dialects.postgresql import UUID
from passlib.context import CryptContext
from jose import JWTError, jwt
from datetime import datetime, timedelta
from typing import List, Optional
import uuid
import os
from dotenv import load_dotenv

load_dotenv()

app = FastAPI(title="MBE PIA Tontine SaaS API", version="1.0.0")

# CORS (Autoriser vos fronts Vercel/Local)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # Modifier selon vos besoins en prod
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Database
DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://postgres:postgres@localhost/mbe_pia")
engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

# Security
SECRET_KEY = os.getenv("SECRET_KEY", "your-super-secret-key-change-in-prod")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")

# Pydantic Models
class UserBase(BaseModel):
    username: str
    email: str
    role: str

class UserCreate(UserBase):
    password: str

class User(UserBase):
    id: uuid.UUID
    class Config:
        from_attributes = True

class MembreBase(BaseModel):
    nom: str
    telephone: str
    email: Optional[str] = None
    profession: Optional[str] = None
    cotisation_mensuelle: float = 50000
    statut: str = "actif"

class MembreCreate(MembreBase):
    pass

class Membre(MembreBase):
    id: uuid.UUID
    user_id: Optional[uuid.UUID] = None
    class Config:
        from_attributes = True

# DB Models
class UserDB(Base):
    __tablename__ = "users"
    id = Column(UUID(as_uuid=True), primary_key=True, index=True, default=uuid.uuid4)
    username = Column(String(50), unique=True, index=True, nullable=False)
    email = Column(String(255), unique=True, index=True, nullable=False)
    password_hash = Column(String(255), nullable=False)
    role = Column(String(20), default="user")
    nom = Column(String(255), nullable=False)
    telephone = Column(String(20))
    avatar = Column(Text, default="👤")
    created_at = Column(DateTime, default=datetime.utcnow)

class MembreDB(Base):
    __tablename__ = "membres"
    id = Column(UUID(as_uuid=True), primary_key=True, index=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=True)
    nom = Column(String(255), nullable=False)
    telephone = Column(String(20), unique=True, nullable=False)
    email = Column(String(255))
    profession = Column(String(255))
    cotisation_mensuelle = Column(Float, default=50000)
    statut = Column(String(20), default="actif")
    date_inscription = Column(DateTime, default=datetime.utcnow)
    avatar = Column(Text, default="👤")
    scoring = Column(Integer, default=80)
    created_at = Column(DateTime, default=datetime.utcnow)

# Dependency
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# Security Utils
def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    to_encode = data.copy()
    expire = datetime.utcnow() + (expires_delta or timedelta(minutes=15))
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

async def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    credentials_exception = HTTPException(
        status_code=401,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username: str = payload.get("sub")
        if username is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception
    user = db.query(UserDB).filter(UserDB.username == username).first()
    if user is None:
        raise credentials_exception
    return user

# Routes
@app.get("/")
def root():
    return {"status": "API MBE PIA is running"}

@app.post("/token")
async def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    user = db.query(UserDB).filter(UserDB.username == form_data.username).first()
    if not user or not verify_password(form_data.password, user.password_hash):
        raise HTTPException(status_code=400, detail="Incorrect username or password")
    
    access_token = create_access_token(
        data={"sub": user.username}, expires_delta=timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    )
    return {"access_token": access_token, "token_type": "bearer"}

@app.get("/membres", response_model=List[Membre])
async def read_membres(db: Session = Depends(get_db), skip: int = 0, limit: int = 100):
    return db.query(MembreDB).offset(skip).limit(limit).all()

@app.post("/membres", response_model=Membre)
async def create_membre(membre: MembreCreate, db: Session = Depends(get_db)):
    db_membre = MembreDB(**membre.dict())
    db.add(db_membre)
    db.commit()
    db.refresh(db_membre)
    return db_membre