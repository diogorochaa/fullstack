import faiss
import numpy as np


class VectorStore:
    def __init__(self):
        self.index = faiss.IndexFlatL2(1536)
        self.documents = []

    def add(self, texts, embeddings):
        vectors = np.array(embeddings).astype("float32")
        self.index.add(vectors)
        self.documents.extend(texts)

    def search(self, query_embedding, k=3):
        if not self.documents:
            return []

        query_vector = np.array([query_embedding]).astype("float32")
        _, indices = self.index.search(query_vector, min(k, len(self.documents)))
        return [self.documents[i] for i in indices[0] if i != -1]
