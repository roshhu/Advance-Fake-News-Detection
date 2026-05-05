import numpy as np
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.pipeline import Pipeline

TRAIN_DATA = [
    ("Scientists confirm COVID vaccines are safe and effective based on clinical trials involving 40,000 participants", 0),
    ("NASA reports record global temperatures in 2023, citing data from thousands of weather stations worldwide", 0),
    ("Apple quarterly earnings beat analyst estimates as iPhone sales grow 8 percent in emerging markets", 0),
    ("Federal Reserve holds interest rates steady citing need for more inflation data before cutting", 0),
    ("Study published in Nature journal finds Mediterranean diet reduces cardiovascular risk by 30 percent", 0),
    ("Local government approves new budget for road infrastructure improvements across three districts", 0),
    ("Scientists discover exoplanet with liquid water in habitable zone 40 light years from Earth", 0),
    ("University researchers publish peer-reviewed analysis of economic impact of renewable energy transition", 0),
    ("SHOCKING: Government secretly adding microchips to vaccines to track citizens globally, whistleblowers reveal", 1),
    ("BREAKING: Millions of ballots stuffed in swing states! Voting machines hacked by foreign operatives!", 1),
    ("Doctors REFUSE to tell you this miracle cure destroys cancer overnight. Big Pharma is hiding the truth!", 1),
    ("URGENT SHARE: 5G towers activate nanoparticles in COVID jabs to control the population, leaked documents prove", 1),
    ("EXPOSED: Elite globalists planning to depopulate 90 percent of Earth using chemtrails and tainted water supply", 1),
    ("BOMBSHELL: Scientists secretly admit climate change is a hoax invented to control energy markets worldwide", 1),
    ("Anonymous insiders confirm deep state plot to replace world leaders with clones, share before deletion", 1),
    ("LEAKED: Pfizer documents prove vaccines contain graphene oxide to enable remote mind control of citizens", 1),
]

TEXTS  = [t for t, _ in TRAIN_DATA]
LABELS = [l for _, l in TRAIN_DATA]

pipeline = Pipeline([
    ("tfidf", TfidfVectorizer(
        ngram_range=(1, 2),
        max_features=5000,
        sublinear_tf=True,
        stop_words="english",
    )),
    ("clf", LogisticRegression(
        C=1.0,
        max_iter=1000,
        solver="lbfgs",
        random_state=42,
    )),
])

def train():
    pipeline.fit(TEXTS, LABELS)

def predict(text: str):
    proba = pipeline.predict_proba([text])[0]
    label = int(np.argmax(proba))
    return label, float(proba[label]), float(proba[0]), float(proba[1])

def explain(text: str, top_n: int = 8):
    tfidf: TfidfVectorizer = pipeline.named_steps["tfidf"]
    clf:   LogisticRegression = pipeline.named_steps["clf"]

    vec           = tfidf.transform([text])
    feature_names = tfidf.get_feature_names_out()
    coefs         = clf.coef_[0]

    nonzero_idx = vec.nonzero()[1]
    if len(nonzero_idx) == 0:
        return []

    scores = []
    for idx in nonzero_idx:
        tfidf_weight = float(vec[0, idx])
        coef         = float(coefs[idx])
        combined     = tfidf_weight * abs(coef)
        direction    = "fake" if coef > 0 else "real"
        scores.append({"word": feature_names[idx], "score": combined, "direction": direction})

    scores.sort(key=lambda x: x["score"], reverse=True)
    max_s = scores[0]["score"] if scores else 1.0
    for s in scores:
        s["score"] = round(s["score"] / max_s, 4)

    return scores[:top_n]
