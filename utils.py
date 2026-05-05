# ── Confusion matrix helper ────────────────────────────────────────────────
# We maintain a running confusion matrix in memory (resets on server restart).

_matrix = {"TP": 0, "TN": 0, "FP": 0, "FN": 0}

def update_matrix(predicted: int, actual: int) -> None:
    """predicted / actual: 1 = FAKE, 0 = REAL"""
    if actual == 1 and predicted == 1:
        _matrix["TP"] += 1
    elif actual == 0 and predicted == 0:
        _matrix["TN"] += 1
    elif actual == 0 and predicted == 1:
        _matrix["FP"] += 1
    elif actual == 1 and predicted == 0:
        _matrix["FN"] += 1

def matrix_string() -> str:
    m = _matrix
    return f"TP={m['TP']} TN={m['TN']} FP={m['FP']} FN={m['FN']}"

def get_matrix() -> dict:
    return dict(_matrix)

def compute_metrics() -> dict:
    tp, tn, fp, fn = _matrix["TP"], _matrix["TN"], _matrix["FP"], _matrix["FN"]
    total = tp + tn + fp + fn
    accuracy  = round((tp + tn) / total, 4)          if total          else 0.0
    precision = round(tp / (tp + fp), 4)              if (tp + fp)      else 0.0
    recall    = round(tp / (tp + fn), 4)              if (tp + fn)      else 0.0
    f1        = round(2 * precision * recall / (precision + recall), 4) \
                if (precision + recall) else 0.0
    return {
        "accuracy":  accuracy,
        "precision": precision,
        "recall":    recall,
        "f1_score":  f1,
        "total_predictions": total,
        **get_matrix(),
    }
