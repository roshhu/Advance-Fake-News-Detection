from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from typing import Optional, List
import time

import model as mdl
import utils

# ── Startup ────────────────────────────────────────────────────────────────
app = FastAPI(
    title="Fake News Detector API",
    description="Hybrid TF-IDF + Logistic Regression with XAI explanations",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
def startup():
    mdl.train()

# ── Schemas ────────────────────────────────────────────────────────────────
class PredictRequest(BaseModel):
    text:  str            = Field(..., min_length=10, description="News text to classify")
    label: Optional[int]  = Field(None, ge=0, le=1, description="Ground truth: 0=REAL, 1=FAKE")

class WordScore(BaseModel):
    word:      str
    score:     float
    direction: str   # "fake" | "real"

class PredictResponse(BaseModel):
    prediction:  str          # "FAKE" | "REAL"
    confidence:  float
    fake_prob:   float
    real_prob:   float
    tp_tn_fp_fn: str          # e.g. "TP=3 TN=5 FP=1 FN=0"
    explanation: List[WordScore]
    latency_ms:  float

class MetricsResponse(BaseModel):
    accuracy:           float
    precision:          float
    recall:             float
    f1_score:           float
    total_predictions:  int
    TP: int
    TN: int
    FP: int
    FN: int

# ── Routes ─────────────────────────────────────────────────────────────────
@app.get("/", tags=["Health"])
def root():
    return {"status": "ok", "message": "Fake News Detector API is running"}

@app.get("/health", tags=["Health"])
def health():
    return {"status": "healthy"}

@app.post("/predict", response_model=PredictResponse, tags=["Detection"])
def predict(req: PredictRequest):
    t0 = time.perf_counter()

    if not req.text.strip():
        raise HTTPException(status_code=400, detail="Text cannot be empty")

    label_idx, confidence, real_prob, fake_prob = mdl.predict(req.text)
    prediction = "FAKE" if label_idx == 1 else "REAL"

    # Update confusion matrix only when ground truth is provided
    if req.label is not None:
        utils.update_matrix(predicted=label_idx, actual=req.label)

    words = mdl.explain(req.text)
    latency = round((time.perf_counter() - t0) * 1000, 2)

    return PredictResponse(
        prediction=prediction,
        confidence=round(confidence, 4),
        fake_prob=round(fake_prob, 4),
        real_prob=round(real_prob, 4),
        tp_tn_fp_fn=utils.matrix_string(),
        explanation=[WordScore(**w) for w in words],
        latency_ms=latency,
    )

@app.get("/metrics", response_model=MetricsResponse, tags=["Analytics"])
def metrics():
    return utils.compute_metrics()

@app.get("/matrix", tags=["Analytics"])
def matrix():
    return utils.get_matrix()

@app.post("/reset", tags=["Analytics"])
def reset():
    """Reset confusion matrix counters."""
    utils._matrix.update({"TP": 0, "TN": 0, "FP": 0, "FN": 0})
    return {"message": "Matrix reset successfully"}
