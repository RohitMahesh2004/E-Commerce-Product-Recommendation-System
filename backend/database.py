from sqlalchemy import create_engine, Column, Integer, String, Float, DateTime, Text
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from datetime import datetime

# PostgreSQL configuration
DATABASE_URL = "postgresql+psycopg2://myuser:mypassword@localhost:5432/product_db"

try:
    engine = create_engine(DATABASE_URL)
    print("✅ Connected to PostgreSQL successfully!")
except Exception as e:
    print("❌ Failed to connect to PostgreSQL:", e)
    raise e

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

# ===================== MODELS ======================
class UploadedFile(Base):
    __tablename__ = "uploaded_files"
    id = Column(Integer, primary_key=True, index=True)
    filename = Column(String, index=True)
    filetype = Column(String)
    filepath = Column(String)
    upload_time = Column(DateTime, default=datetime.utcnow)

class Product(Base):
    __tablename__ = "products"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String)
    brand = Column(String)
    category = Column(String)
    price = Column(Float)
    description = Column(String)
    rating = Column(Float)
    source_file = Column(String)

class KGTriple(Base):
    __tablename__ = "kg_triples"
    id = Column(Integer, primary_key=True, index=True)
    subject = Column(String, index=True)
    predicate = Column(String, index=True)
    object = Column(String, index=True)
    confidence = Column(Float, default=1.0)
    source_file = Column(String)
    created_at = Column(DateTime, default=datetime.utcnow)
    raw = Column(Text)

def init_db():
    Base.metadata.create_all(bind=engine)
    print("✅ Database tables created successfully!")
