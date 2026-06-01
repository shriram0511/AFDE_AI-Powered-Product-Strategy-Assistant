import os
import shutil
from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel
from ingest import ingest_file, query_collection
from graph import run_pipeline
from llm_client import chat

app = FastAPI(title="Product Strategy Assistant", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

UPLOAD_DIR   = "./uploads"
FRONTEND_DIR = "../frontend/dist"
os.makedirs(UPLOAD_DIR, exist_ok=True)
os.makedirs("./reports", exist_ok=True)

# Serve React frontend if built
if os.path.exists(FRONTEND_DIR):
    app.mount("/assets", StaticFiles(directory=f"{FRONTEND_DIR}/assets"), name="assets")

    @app.get("/")
    def serve_frontend():
        return FileResponse(f"{FRONTEND_DIR}/index.html")

    @app.get("/{full_path:path}")
    def serve_spa(full_path: str):
        file_path = os.path.join(FRONTEND_DIR, full_path)
        if os.path.exists(file_path):
            return FileResponse(file_path)
        return FileResponse(f"{FRONTEND_DIR}/index.html")


@app.get("/health")
def health():
    return {"status": "ok", "message": "Product Strategy Assistant is running"}


@app.post("/analyze")
async def analyze(file: UploadFile = File(...)):
    # Save uploaded file
    file_path = os.path.join(UPLOAD_DIR, file.filename)
    with open(file_path, "wb") as f:
        shutil.copyfileobj(file.file, f)

    # Ingest into ChromaDB
    try:
        row_count = ingest_file(file_path)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Ingestion failed: {str(e)}")

    # Run all 6 agents via LangGraph
    try:
        result = run_pipeline(file_path)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Pipeline failed: {str(e)}")

    return {
        "status":                   "success",
        "rows_ingested":            row_count,
        "sales_insights":           result.get("sales_insights"),
        "feedback_insights":        result.get("feedback_insights"),
        "swot_analysis":            result.get("swot_analysis"),
        "feature_priorities":       result.get("feature_priorities"),
        "strategy_recommendations": result.get("strategy_recommendations"),
        "pdf_path":                 result.get("pdf_path"),
    }


class ChatRequest(BaseModel):
    question: str

@app.post("/chat")
def chat_endpoint(req: ChatRequest):
    docs    = query_collection(req.question, n_results=10)
    context = "\n".join(docs)

    prompt = f"""Answer the following question using ONLY the data provided below.
Be specific and use numbers from the data.

DATA:
{context}

QUESTION: {req.question}"""

    answer = chat(prompt, system="You are a helpful product strategy analyst.")
    return {"answer": answer}


@app.get("/report/download")
def download_report(pdf_path: str):
    if not os.path.exists(pdf_path):
        raise HTTPException(status_code=404, detail="Report not found")
    return FileResponse(
        pdf_path,
        media_type="application/pdf",
        filename="product_strategy_report.pdf"
    )
