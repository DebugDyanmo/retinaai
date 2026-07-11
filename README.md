# RetinaAI — Explainable AI-Based Diabetic Retinopathy Detection

RetinaAI analyzes retinal fundus images, predicts diabetic retinopathy (DR)
severity across 5 clinical classes, and explains its predictions using
Grad-CAM so the model's reasoning is visible, not a black box.

## 🎥 Watch the Demo Video

<video src="Demo.mp4" controls width="100%"></video>
---

## Overview

| | |
|---|---|
| **Task** | 5-class DR severity classification |
| **Model** | EfficientNet-B3 (fine-tuned), via `timm` |
| **Dataset** | [APTOS 2019 Blindness Detection](https://www.kaggle.com/c/aptos2019-blindness-detection) (3,505 images after cleaning) |
| **Explainability** | Grad-CAM heatmaps on every prediction |
| **Quadratic Kappa** | 0.773 (fine-tuned) vs. 0.664 (frozen-backbone baseline) |
| **Accuracy** | 70.5% (fine-tuned) vs. 59.5% (baseline) |

## DR Severity Classes

| Label | Class | Clinical meaning |
|---|---|---|
| 0 | No DR | No visible signs |
| 1 | Mild | Microaneurysms only |
| 2 | Moderate | More extensive retinal damage |
| 3 | Severe | Widespread hemorrhages/exudates |
| 4 | Proliferative DR | Abnormal new blood vessel growth |

## Results

**Baseline (frozen backbone) vs. Fine-tuned:**

| Metric | Baseline | Fine-tuned | Change |
|---|---|---|---|
| Accuracy | 59.5% | 70.5% | +11 pts |
| Quadratic Kappa | 0.664 | 0.773 | +0.109 |
| Severe class recall | 26% | 37% | +11 pts |
| Severe class precision | 11% | 30% | +19 pts |

Full fine-tuning (unfreezing the EfficientNet-B3 backbone, with mixed-precision
training and early stopping) produced the largest gains on the clinically
critical minority classes — Severe and Proliferative DR — which a naive
frozen-backbone approach underserved due to class imbalance.

## Key Engineering Decisions

- **Duplicate detection**: found 128 exact-duplicate image pairs (MD5 hash
  match) in the raw dataset; 31 pairs had *conflicting* diagnosis labels
  (inter-rater disagreement) and were dropped entirely; the remaining 97
  redundant copies were deduplicated to prevent train/val data leakage.
- **Preprocessing pipeline**: border cropping → circular field-of-view
  masking → CLAHE contrast enhancement → aspect-ratio-preserving padding →
  resize. Compared against Ben Graham's illumination normalization, which
  underperformed at high resolution without per-image sigma tuning — CLAHE
  was selected based on this comparison, not by default.
- **Class imbalance**: quantified severity (No DR is 9.4x more common than
  Severe) and addressed it with weighted cross-entropy loss rather than
  ignoring it, since accuracy alone is misleading on this dataset.
- **Blur detection recalibration**: a standard Laplacian-variance blur
  threshold flagged 99.5% of images as "blurry" — investigation showed this
  threshold is miscalibrated for low-texture fundus photography, not that
  the data was actually poor quality. Verified visually instead of trusting
  a generic threshold blindly.

## Architecture

```
Raw Fundus Image
      │
      ▼
Preprocessing (OpenCV: crop, mask, CLAHE, pad, resize)
      │
      ▼
EfficientNet-B3 (fine-tuned, 5-class output)
      │
      ├──► Prediction + confidence
      │
      ▼
Grad-CAM (heatmap over predictive regions)
      │
      ▼
FastAPI (/predict endpoint)
      │
      ▼
React + Tailwind frontend
```

## Project Structure

```
retinaai/
├── backend/
│   ├── api/
│   │   ├── main.py          # FastAPI app, /predict endpoint
│   │   ├── inference.py     # preprocessing, model loading, prediction
│   │   └── schemas.py       # request/response models
│   ├── checkpoints/
│   │   └── best_model.pth   # fine-tuned model weights
│   ├── tests/
│   │   └── test_api.py      # API tests incl. edge cases
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   └── App.jsx          # upload UI, prediction display, Grad-CAM view
│   └── package.json
├── notebooks/
│   ├── 01_eda_preprocessing.ipynb
│   └── 02_training.ipynb
└── README.md
```

## Setup

### Backend
```bash
cd backend
python -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate
pip install -r requirements.txt
python -m uvicorn api.main:app --reload --host 0.0.0.0 --port 8000
```
API docs available at `http://localhost:8000/docs`.

### Frontend
```bash
cd frontend
npm install
npm run dev
```
Open `http://localhost:5173`.

### Tests
```bash
cd backend
python -m pytest tests/test_api.py -v
```

## Tech Stack

- **Model**: PyTorch, EfficientNet-B3 (`timm`)
- **Explainability**: Grad-CAM (`pytorch-grad-cam`)
- **Preprocessing**: OpenCV, Albumentations
- **Backend**: FastAPI, Pydantic
- **Frontend**: React, Vite, Tailwind CSS
- **Training**: Google Colab (T4 GPU), mixed-precision training

## Known Limitations

- Trained on a single dataset (APTOS 2019); generalization to other camera
  types/populations is untested.
- Mild and Severe classes still have precision below 50% — more training
  data or focal loss could further improve minority-class performance.
- No patient-level metadata; deduplication was image-hash-based, not
  patient-ID-based.
- This is a research/educational project, not a validated clinical tool.

## Roadmap

- [x] EDA and data cleaning
- [x] Preprocessing pipeline
- [x] Baseline model
- [x] Class-imbalance handling (weighted loss)
- [x] Full fine-tuning
- [x] Evaluation and error analysis
- [x] Grad-CAM explainability
- [x] FastAPI backend with input validation
- [x] Automated API tests
- [x] React + Tailwind frontend
- [ ] Deployment (backend + frontend live links)
- [ ] Patient-level data splitting
- [ ] Focal loss / additional imbalance techniques

## Acknowledgments

Dataset: [APTOS 2019 Blindness Detection](https://www.kaggle.com/c/aptos2019-blindness-detection) (Kaggle/Asia Pacific Tele-Ophthalmology Society).
