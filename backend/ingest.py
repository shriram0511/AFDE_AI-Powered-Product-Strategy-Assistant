import os
import pandas as pd
import chromadb
from llm_client import embed

CHROMA_PATH = "./chroma_db"
COLLECTION  = "product_strategy"

def get_collection():
    client = chromadb.PersistentClient(path=CHROMA_PATH)
    return client.get_or_create_collection(name=COLLECTION)

def _chunk_text(text: str, chunk_size: int = 500) -> list[str]:
    words  = text.split()
    chunks = []
    for i in range(0, len(words), chunk_size):
        chunk = " ".join(words[i:i + chunk_size])
        if chunk.strip():
            chunks.append(chunk.strip())
    return chunks

def _parse_csv(path: str) -> list[str]:
    df   = pd.read_csv(path)
    docs = []
    for _, row in df.iterrows():
        parts = [f"{col}: {val}" for col, val in row.items() if str(val).strip()]
        docs.append(" | ".join(parts))
    return docs

def _parse_pdf(path: str) -> list[str]:
    from pypdf import PdfReader
    reader = PdfReader(path)
    text   = "\n".join(page.extract_text() or "" for page in reader.pages)
    return _chunk_text(text)

def _parse_txt(path: str) -> list[str]:
    with open(path, "r", encoding="utf-8", errors="ignore") as f:
        return _chunk_text(f.read())

def _parse_docx(path: str) -> list[str]:
    import docx
    doc  = docx.Document(path)
    text = "\n".join(p.text for p in doc.paragraphs if p.text.strip())
    return _chunk_text(text)

def ingest_file(file_path: str) -> int:
    ext  = os.path.splitext(file_path)[1].lower()

    if ext == ".csv":
        documents = _parse_csv(file_path)
    elif ext == ".pdf":
        documents = _parse_pdf(file_path)
    elif ext in (".txt", ".md"):
        documents = _parse_txt(file_path)
    elif ext == ".docx":
        documents = _parse_docx(file_path)
    else:
        with open(file_path, "r", encoding="utf-8", errors="ignore") as f:
            documents = _chunk_text(f.read())

    collection = get_collection()

    # Use filename + index as unique ID so multiple files coexist
    filename   = os.path.basename(file_path).replace(" ", "_")
    ids        = [f"{filename}_{i}" for i in range(len(documents))]

    # Remove only chunks from THIS file (keep other files' data)
    existing = collection.get()
    old_ids  = [id for id in existing["ids"] if id.startswith(filename)]
    if old_ids:
        collection.delete(ids=old_ids)
    batch_size = 50

    for i in range(0, len(documents), batch_size):
        batch_docs = documents[i:i + batch_size]
        batch_ids  = ids[i:i + batch_size]
        embeddings = embed(batch_docs)
        collection.add(documents=batch_docs, embeddings=embeddings, ids=batch_ids)

    return len(documents)

# Keep backward compat
def ingest_csv(csv_path: str) -> int:
    return ingest_file(csv_path)

def query_collection(query: str, n_results: int = 10) -> list[str]:
    collection = get_collection()
    query_emb  = embed([query])[0]
    results    = collection.query(query_embeddings=[query_emb], n_results=n_results)
    return results["documents"][0]
