from sentence_transformers import SentenceTransformer
import numpy as np
import faiss, os, pickle

MODEL_NAME = "all-MiniLM-L6-v2"
model = SentenceTransformer(MODEL_NAME)

INDEX_PATH = "uploads/faiss.index"
META_PATH = "uploads/faiss_meta.pkl"

def compute_embedding(text: str) -> np.ndarray:
    return model.encode([text], convert_to_numpy=True)[0].astype("float32")

def build_faiss_index(texts, metas):
    os.makedirs(os.path.dirname(INDEX_PATH), exist_ok=True)
    vectors = np.array([compute_embedding(t) for t in texts])
    index = faiss.IndexFlatL2(vectors.shape[1])
    index.add(vectors)
    faiss.write_index(index, INDEX_PATH)
    with open(META_PATH, "wb") as f: pickle.dump(metas, f)
    print(f" FAISS index built with {len(texts)} entries.")
    return index

def load_index():
    if not os.path.exists(INDEX_PATH): return None, None
    return faiss.read_index(INDEX_PATH), pickle.load(open(META_PATH, "rb"))

def add_to_index(text, meta):
    index, metas = load_index()
    vec = np.array([compute_embedding(text)])
    if index is None:
        return build_faiss_index([text], [meta])
    index.add(vec)
    metas.append(meta)
    faiss.write_index(index, INDEX_PATH)
    with open(META_PATH, "wb") as f: pickle.dump(metas, f)
