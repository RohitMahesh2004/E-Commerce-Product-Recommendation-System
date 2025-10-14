import pandas as pd
import json
from typing import List, Dict
from database import KGTriple
from sqlalchemy.orm import Session
from gemini_client import call_gemini

def row_to_text(row: pd.Series, cols: List[str]) -> str:
    parts = [f"{c}: {row.get(c, '')}" for c in cols if c in row.index]
    return "\n".join(parts)

def extract_triples_from_dataframe(df: pd.DataFrame, source_file: str, use_llm: bool=True) -> List[Dict]:
    triples = []
    cols = ["name", "title", "brand", "category", "description"]

    for _, row in df.iterrows():
        text = row_to_text(row, cols)
        subj = row.get("title") or row.get("name") or f"product_{row.name}"

        # baseline structured triples
        if row.get("brand"):
            triples.append({"subject": subj, "predicate": "brand", "object": row["brand"], "confidence": 0.9, "source_file": source_file, "raw": text})
        if row.get("category"):
            triples.append({"subject": subj, "predicate": "category", "object": row["category"], "confidence": 0.9, "source_file": source_file, "raw": text})

        # optional Gemini LLM extraction
        if use_llm:
            try:
                prompt = f"""
                Extract factual triples from the following product.
                Return ONLY JSON list of objects with keys: subject, predicate, object, confidence (0–1).

                Example:
                [
                  {{"subject": "Sony WH-1000XM4", "predicate": "feature", "object": "noise cancellation", "confidence": 0.95}}
                ]

                Product data:
                {text}
                """
                raw = call_gemini(prompt, thinking_budget=512, max_tokens=256)
                data = json.loads(raw)
                for t in data:
                    t.setdefault("source_file", source_file)
                    triples.append(t)
            except Exception as e:
                print(" Gemini extraction failed:", e)
                continue
    return triples

def persist_triples(triples: List[Dict], db: Session):
    for t in triples:
        db.add(KGTriple(
            subject=t.get("subject"),
            predicate=t.get("predicate"),
            object=t.get("object"),
            confidence=float(t.get("confidence", 1.0)),
            source_file=t.get("source_file"),
            raw=t.get("raw")
        ))
    db.commit()
    print(f" Stored {len(triples)} triples in DB.")
