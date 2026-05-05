import logging
import time
import os

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from typing import Optional, List
from dotenv import load_dotenv

load_dotenv()

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s — %(message)s",
)
logger = logging.getLogger(__name__)

import model as mdl
import database as db_module

app = FastAPI(title="Fake News Detector API", version="2.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
def startup():
    mdl.train()
    logger.info("ML model trained and ready")
    # Eagerly test DB connection
    client = db_module.get_db()
    if client is None:
        logger.warning("Supabase unavailable at startup — predictions won't persist")

# ── Schemas ────────────────────────────────────────────────
class PredictRequest(BaseModel):
    text: str = Field(..., min_length=10, max_length=5000)

class WordScore(BaseModel):
    word:      str
    score:     float
    direction: str

class PredictResponse(BaseModel):
    prediction:  str
    confidence:  float
    fake_prob:   float
    real_prob:   float
    explanation: List[WordScore]
    latency_ms:  float
    db_saved:    bool

# ── Routes ─────────────────────────────────────────────────
@app.get("/")
def root():
    return {"status": "ok", "message": "Fake News Detector API v2"}

@app.get("/health")
def health():
    return {"status": "healthy"}

@app.post("/predict", response_model=PredictResponse)
def predict(req: PredictRequest):
    logger.info(f"POST /predict — text length: {len(req.text)}")
    t0 = time.perf_counter()

    label, conf, real_prob, fake_prob = mdl.predict(req.text)
    prediction = "FAKE" if label == 1 else "REAL"
    words      = mdl.explain(req.text)
    latency    = round((time.perf_counter() - t0) * 1000, 2)

    logger.info(f"Prediction: {prediction} @ {conf:.4f} in {latency}ms")

    # ── Persist to Supabase (never crashes the response) ──
    saved = False
    try:
        saved = db_module.save_prediction(req.text, prediction, conf)
        logger.info(f"DB save: {'OK' if saved else 'FAILED'}")
    except Exception as e:
        logger.error(f"Unexpected DB error: {e}")

    return PredictResponse(
        prediction=prediction,
        confidence=round(conf, 4),
        fake_prob=round(fake_prob, 4),
        real_prob=round(real_prob, 4),
        explanation=[WordScore(**w) for w in words],
        latency_ms=latency,
        db_saved=saved,
    )

@app.get("/history")
def history(limit: int = 50):
    return db_module.fetch_history(limit)

@app.get("/stats")
def stats():
    return db_module.fetch_stats()
