from fastapi import FastAPI, HTTPException, Depends
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from sqlalchemy import create_engine, Column, Integer, String, Float, Boolean, DateTime, ForeignKey, Text, ARRAY
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

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:3001"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Database (Supabase PostgreSQL)
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
  email: Optional[str]
  profession: Optional[str]
  cotisation_mensuelle: float
  statut: str

class MembreCreate(MembreBase):
  pass

class Membre(MembreBase):
  id: uuid.UUID
  user_id: uuid.UUID
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
  user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"))
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

Base.metadata.create_all(bind=engine)

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

def get_password_hash(password):
  return pwd_context.hash(password)

def create_access_token(data: dict, expires_delta: timedelta = None):
  to_encode = data.copy()
  if expires_delta:
    expire = datetime.utcnow() + expires_delta
  else:
    expire = datetime.utcnow() + timedelta(minutes=15)
  to_encode.update({"exp": expire})
  encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
  return encoded_jwt

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

# API Routes
@app.post("/token", response_model=dict)
async def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
  user = db.query(UserDB).filter(UserDB.username == form_data.username).first()
  if not user or not verify_password(form_data.password, user.password_hash):
    raise HTTPException(status_code=400, detail="Incorrect username or password")
  
  access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
  access_token = create_access_token(
    data={"sub": user.username}, expires_delta=access_token_expires
  )
  return {"access_token": access_token, "token_type": "bearer"}

@app.get("/users/me")
async def read_users_me(current_user: UserDB = Depends(get_current_user)):
  return current_user

@app.get("/membres", response_model=List[Membre])
async def read_membres(db: Session = Depends(get_db), skip: int = 0, limit: int = 100, current_user: UserDB = Depends(get_current_user)):
  membres = db.query(MembreDB).offset(skip).limit(limit).all()
  return membres

@app.post("/membres", response_model=Membre)
async def create_membre(membre: MembreCreate, db: Session = Depends(get_db), current_user: UserDB = Depends(get_current_user)):
  if current_user.role != 'admin':
    raise HTTPException(status_code=403, detail="Not authorized")
  db_membre = MembreDB(**membre.dict())
  db.add(db_membre)
  db.commit()
  db.refresh(db_membre)
  return db_membre

@app.get("/membres/{membre_id}", response_model=Membre)
async def read_membre(membre_id: uuid.UUID, db: Session = Depends(get_db), current_user: UserDB = Depends(get_current_user)):
  membre = db.query(MembreDB).filter(MembreDB.id == membre_id).first()
  if membre is None:
    raise HTTPException(status_code=404, detail="Membre not found")
  return membre

@app.put("/membres/{membre_id}", response_model=Membre)
async def update_membre(membre_id: uuid.UUID, membre: MembreBase, db: Session = Depends(get_db), current_user: UserDB = Depends(get_current_user)):
  if current_user.role != 'admin':
    raise HTTPException(status_code=403, detail="Not authorized")
  db_membre = db.query(MembreDB).filter(MembreDB.id == membre_id).first()
  if db_membre is None:
    raise HTTPException(status_code=404, detail="Membre not found")
  for key, value in membre.dict().items():
    setattr(db_membre, key, value)
  db.commit()
  db.refresh(db_membre)
  return db_membre

@app.delete("/membres/{membre_id}")
async def delete_membre(membre_id: uuid.UUID, db: Session = Depends(get_db), current_user: UserDB = Depends(get_current_user)):
  if current_user.role != 'admin':
    raise HTTPException(status_code=403, detail="Not authorized")
  db_membre = db.query(MembreDB).filter(MembreDB.id == membre_id).first()
  if db_membre is None:
    raise HTTPException(status_code=404, detail="Membre not found")
  db.delete(db_membre)
  db.commit()
  return {"message": "Membre supprimé"}

if __name__ == "__main__":
  import uvicorn
  uvicorn.run(app, host="0.0.0.0", port=8000)
