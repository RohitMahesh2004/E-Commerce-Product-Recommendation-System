from embeddings import load_index, compute_embedding
import numpy as np

def retrieve_similar(query: str, top_k: int = 5):
    index, metas = load_index()
    if not index: return []
    qv = np.array([compute_embedding(query)], dtype="float32")
    D, I = index.search(qv, top_k)
    results = []
    for idx, dist in zip(I[0], D[0]):
        if idx >= 0 and idx < len(metas):
            m = metas[idx].copy()
            m["_score"] = float(dist)
            results.append(m)
    return results
