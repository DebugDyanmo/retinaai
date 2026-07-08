# RetinaAI — Explainable AI-Based Diabetic Retinopathy Detection

Deep learning system that analyzes retinal fundus images, predicts diabetic
retinopathy (DR) severity, and explains its predictions using Grad-CAM.

## Status
🚧 Milestone 1 — project scaffolding complete. Model training not yet started.

## Tech Stack
- **Model:** PyTorch + EfficientNet-B3 (via `timm`)
- **Explainability:** Grad-CAM (`pytorch-grad-cam`)
- **Preprocessing:** OpenCV, Albumentations
- **Serving:** FastAPI
- **Dataset:** [Kaggle Diabetic Retinopathy Detection](https://www.kaggle.com/c/diabetic-retinopathy-detection)

## DR Severity Classes
| Label | Class |
|---|---|
| 0 | No DR |
| 1 | Mild |
| 2 | Moderate |
| 3 | Severe |
| 4 | Proliferative DR |

## Project Structure
```
retinaai/
├── data/            # raw + processed images (gitignored)
├── src/             # dataset, model, training, Grad-CAM code
├── api/             # FastAPI serving layer
├── notebooks/        # EDA
├── configs/          # config.yaml — all hyperparameters live here
├── checkpoints/       # saved model weights (gitignored)
└── tests/
```

## Setup
```bash
python -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env            # fill in your Kaggle credentials
```

## Roadmap
- [x] Milestone 1: Architecture + project scaffolding
- [ ] Milestone 2: Data pipeline (download, preprocess, EDA)
- [ ] Milestone 3: Dataset + DataLoader + augmentations
- [ ] Milestone 4: EfficientNet model + training loop
- [ ] Milestone 5: Evaluation (accuracy, quadratic-weighted kappa, confusion matrix)
- [ ] Milestone 6: Grad-CAM explainability module
- [ ] Milestone 7: FastAPI inference endpoint
- [ ] Milestone 8: Frontend / mobile integration
