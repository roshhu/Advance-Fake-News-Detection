import os
import logging

logger = logging.getLogger(__name__)

_client = None

def get_db():
    global _client
    if _client is not None:
        return _client

    url = os.getenv("SUPABASE_URL", "").strip()
    key = os.getenv("SUPABASE_KEY", "").strip()

    if not url or not key:
        logger.error("SUPABASE_URL or SUPABASE_KEY is missing")
        return None

    try:
        from supabase import create_client
        _client = create_client(url, key)
        logger.info("Supabase client initialised OK")
        return _client
    except Exception as e:
        logger.error(f"Supabase init failed: {e}")
        return None


def save_prediction(text: str, prediction: str, confidence: float) -> bool:
    db = get_db()
    if db is None:
        logger.error("DB insert skipped — no Supabase client")
        return False
    try:
        payload = {
            "text":       text[:2000],
            "prediction": prediction,
            "confidence": round(float(confidence), 4),
        }
        logger.info(f"Inserting into Supabase: {payload}")
        res = db.table("predictions").insert(payload).execute()
        if res.data:
            logger.info(f"Insert OK — id: {res.data[0].get('id')}")
            return True
        logger.warning(f"Insert returned no data: {res}")
        return False
    except Exception as e:
        logger.error(f"DB insert error: {e}")
        return False


def fetch_history(limit: int = 50) -> list:
    db = get_db()
    if db is None:
        return []
    try:
        res = (
            db.table("predictions")
            .select("id, text, prediction, confidence, created_at")
            .order("created_at", desc=True)
            .limit(limit)
            .execute()
        )
        return res.data or []
    except Exception as e:
        logger.error(f"fetch_history error: {e}")
        return []


def fetch_stats() -> dict:
    db = get_db()
    if db is None:
        return {"total": 0, "fake": 0, "real": 0}
    try:
        total = db.table("predictions").select("id", count="exact").execute().count or 0
        fake  = db.table("predictions").select("id", count="exact").eq("prediction", "FAKE").execute().count or 0
        real  = db.table("predictions").select("id", count="exact").eq("prediction", "REAL").execute().count or 0
        return {"total": total, "fake": fake, "real": real}
    except Exception as e:
        logger.error(f"fetch_stats error: {e}")
        return {"total": 0, "fake": 0, "real": 0}