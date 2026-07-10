import pytest
from fastapi.testclient import TestClient
from api.main import app
import io
from PIL import Image
import numpy as np

client = TestClient(app)

def make_test_image():
    img = Image.fromarray(np.random.randint(0, 255, (300,300,3), dtype=np.uint8))
    buf = io.BytesIO()
    img.save(buf, format='PNG')
    buf.seek(0)
    return buf

def test_health_check():
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json()["status"] == "ok"

def test_predict_valid_image():
    img_buf = make_test_image()
    response = client.post("/predict", files={"file": ("test.png", img_buf, "image/png")})
    assert response.status_code == 200
    data = response.json()
    assert "predicted_class" in data
    assert "confidence" in data
    assert 0 <= data["confidence"] <= 1
    assert data["predicted_class"] in ['No DR','Mild','Moderate','Severe','Proliferative DR']

def test_predict_rejects_wrong_content_type():
    fake_file = io.BytesIO(b"not an image")
    response = client.post("/predict", files={"file": ("test.txt", fake_file, "text/plain")})
    assert response.status_code == 400

def test_predict_rejects_corrupt_image():
    corrupt_bytes = io.BytesIO(b"this is not valid image data at all")
    response = client.post("/predict", files={"file": ("fake.png", corrupt_bytes, "image/png")})
    assert response.status_code == 400

def test_predict_missing_file():
    response = client.post("/predict")
    assert response.status_code == 422