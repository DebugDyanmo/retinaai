from fastapi import FastAPI, File, UploadFile, HTTPException
import numpy as np
import cv2
import base64
from api.inference import predict, load_model
from api.schemas import PredictionResponse, ErrorResponse

app = FastAPI(title="RetinaAI", description="Explainable DR Detection API")
from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_methods=["*"],
    allow_headers=["*"],
)

ALLOWED_CONTENT_TYPES = {'image/jpeg', 'image/png', 'image/jpg'}
MAX_FILE_SIZE_MB = 10

@app.on_event("startup")
def startup_event():
    load_model()
    print("Model loaded and ready")

@app.get("/")
def root():
    return {"message": "RetinaAI API is running", "docs": "/docs"}

@app.get("/health")
def health():
    return {"status": "ok"}

@app.post("/predict", response_model=PredictionResponse, responses={400: {"model": ErrorResponse}})
async def predict_endpoint(file: UploadFile = File(...)):
    if file.content_type not in ALLOWED_CONTENT_TYPES:
        raise HTTPException(status_code=400, detail=f"Unsupported file type: {file.content_type}. Upload JPEG or PNG.")

    contents = await file.read()

    if len(contents) > MAX_FILE_SIZE_MB * 1024 * 1024:
        raise HTTPException(status_code=400, detail=f"File too large. Max {MAX_FILE_SIZE_MB}MB.")

    nparr = np.frombuffer(contents, np.uint8)
    img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
    if img is None:
        raise HTTPException(status_code=400, detail="Could not decode image — file may be corrupt.")

    img_rgb = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)

    try:
        result = predict(img_rgb)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Inference failed: {str(e)}")

    heatmap_bgr = cv2.cvtColor(result['heatmap_image'], cv2.COLOR_RGB2BGR)
    _, buffer = cv2.imencode('.png', heatmap_bgr)
    heatmap_b64 = base64.b64encode(buffer).decode('utf-8')

    return PredictionResponse(
        predicted_class=result['predicted_class'],
        confidence=result['confidence'],
        all_class_probabilities=result['all_class_probabilities'],
        low_confidence_warning=result['low_confidence_warning'],
        heatmap_base64=heatmap_b64
    )