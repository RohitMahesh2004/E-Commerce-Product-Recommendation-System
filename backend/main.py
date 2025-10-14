from fastapi import FastAPI, Query, File, UploadFile, Depends
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from pydantic import BaseModel
from serpapi_client import search_amazon_products
from database import UploadedFile, SessionLocal, init_db
from gemini_client import analyze_catalog
import os
import shutil
import pandas as pd

# ============================================================
# 🚀 App Setup
# ============================================================
app = FastAPI(
    title="AI Product Recommendation + Catalog Summarizer API",
    description="Fetches top Amazon products via SerpAPI and summarizes uploaded product catalogs using Gemini 2.5 Flash.",
    version="2.0.0",
)

# ✅ Enable CORS for frontend communication
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

UPLOAD_DIR = "uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)


# =====================================================
# 🧩 Dependency: Get DB session
# =====================================================
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


# =====================================================
# 🚀 Initialize DB tables on startup
# =====================================================
@app.on_event("startup")
def startup_event():
    init_db()
    print("🚀 Server started and database initialized.")


# ============================================================
# 🚀 PHASE 1: Fetch top Amazon product recommendations
# ============================================================
@app.get("/recommendations")
def get_recommendations(query: str = Query(..., description="Product search query")):
    """
    Fetch top 10 Amazon products using SerpAPI.
    (Lightweight and fast)
    """
    try:
        print(f"🔎 Searching for: {query}")
        products = search_amazon_products(query)

        if not products:
            return {"results": [], "message": "No matching products found."}

        results = [
            {
                "title": p.get("title", "Unnamed Product"),
                "description": p.get("description", ""),
                "price": p.get("price", "N/A"),
                "image": p.get("image", ""),
                "url": p.get("url", ""),
            }
            for p in products
        ]
        print(f"🛍️ Extracted {len(results)} products.")
        return {"results": results}

    except Exception as e:
        print("❌ Error fetching recommendations:", e)
        return {"error": str(e)}


# ============================================================
# 🚀 PHASE 2: Upload user catalog → Generate Summary Context
# ============================================================
@app.post("/upload_catalog")
async def upload_catalog(file: UploadFile = File(...), db: Session = Depends(get_db)):
    try:
        file_path = os.path.join(UPLOAD_DIR, file.filename)
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)

        print(f"📁 File saved: {file.filename}")

        # 🧠 Analyze file with Gemini
        analysis_result = analyze_catalog(file_path)
        # Save file info to DB
        uploaded = UploadedFile(
            filename=file.filename,
            filetype=os.path.splitext(file.filename)[-1],
            filepath=file_path,
        )
        db.add(uploaded)
        db.commit()
        db.refresh(uploaded)

        return {
            "file_id": uploaded.id,
            "filename": uploaded.filename,
            "analysis": analysis_result,
        }

    except Exception as e:
        print("❌ Upload error:", e)
        return {"status": "error", "message": str(e)}
# ============================================================
# 🚦 Health Check
# ============================================================
@app.get("/")
def root():
    return {"message": "🚀 AI Product Recommender + Catalog Summarizer backend running!"}
