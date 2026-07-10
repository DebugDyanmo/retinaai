from pydantic import BaseModel
from typing import Dict

class PredictionResponse(BaseModel):
    predicted_class: str
    confidence: float
    all_class_probabilities: Dict[str, float]
    low_confidence_warning: bool
    heatmap_base64: str

class ErrorResponse(BaseModel):
    error: str
    detail: str