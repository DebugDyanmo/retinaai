import torch
import torch.nn as nn
import timm
import cv2
import numpy as np
from pytorch_grad_cam import GradCAM
from pytorch_grad_cam.utils.image import show_cam_on_image
import albumentations as A
from albumentations.pytorch import ToTensorV2

class_names = ['No DR', 'Mild', 'Moderate', 'Severe', 'Proliferative DR']
CONFIDENCE_THRESHOLD = 0.5

device = 'cuda' if torch.cuda.is_available() else 'cpu'

def crop_black_borders(img, tol=7):
    gray = cv2.cvtColor(img, cv2.COLOR_RGB2GRAY)
    mask = gray > tol
    if mask.sum() == 0:
        return img
    coords = cv2.findNonZero(mask.astype('uint8'))
    x, y, w, h = cv2.boundingRect(coords)
    return img[y:y+h, x:x+w]

def apply_circular_mask(img):
    h, w = img.shape[:2]
    mask = np.zeros((h, w), np.uint8)
    center = (w//2, h//2)
    radius = min(h, w)//2
    cv2.circle(mask, center, radius, 255, -1)
    return cv2.bitwise_and(img, img, mask=mask)

def apply_clahe(img):
    lab = cv2.cvtColor(img, cv2.COLOR_RGB2LAB)
    l, a, b = cv2.split(lab)
    clahe = cv2.createCLAHE(clipLimit=2.0, tileGridSize=(8,8))
    l = clahe.apply(l)
    lab = cv2.merge((l,a,b))
    return cv2.cvtColor(lab, cv2.COLOR_LAB2RGB)

def pad_to_square(img):
    h, w = img.shape[:2]
    size = max(h, w)
    pad_h = (size - h) // 2
    pad_w = (size - w) // 2
    return cv2.copyMakeBorder(img, pad_h, size-h-pad_h, pad_w, size-w-pad_w,
                                cv2.BORDER_CONSTANT, value=(0,0,0))

def preprocess_image(img_array, size=300):
    img = crop_black_borders(img_array)
    img = apply_circular_mask(img)
    img = apply_clahe(img)
    img = pad_to_square(img)
    img = cv2.resize(img, (size, size))
    return img

val_transform = A.Compose([
    A.Normalize(mean=(0.485,0.456,0.406), std=(0.229,0.224,0.225)),
    ToTensorV2()
])

_model = None
_cam = None

def load_model(checkpoint_path='checkpoints/best_model.pth'):
    global _model, _cam
    if _model is None:
        _model = timm.create_model('efficientnet_b3', pretrained=False, num_classes=5)
        _model.load_state_dict(torch.load(checkpoint_path, map_location=device))
        _model = _model.to(device)
        _model.eval()
        _cam = GradCAM(model=_model, target_layers=[_model.conv_head])
        print(f"Model loaded on {device}")
    return _model, _cam

def predict(img_array):
    model, cam = load_model()
    processed = preprocess_image(img_array)
    tensor = val_transform(image=processed)['image'].unsqueeze(0).to(device)

    with torch.no_grad():
        output = model(tensor)
        probs = torch.softmax(output, 1)[0]
        pred_class = probs.argmax().item()
        confidence = probs[pred_class].item()

    grayscale_cam = cam(input_tensor=tensor)[0]
    mean = np.array([0.485,0.456,0.406]); std = np.array([0.229,0.224,0.225])
    rgb_for_vis = tensor[0].permute(1,2,0).cpu().numpy()
    rgb_for_vis = np.clip(std * rgb_for_vis + mean, 0, 1)
    heatmap_vis = show_cam_on_image(rgb_for_vis, grayscale_cam, use_rgb=True)

    return {
        'predicted_class': class_names[pred_class],
        'confidence': round(confidence, 4),
        'all_class_probabilities': {class_names[i]: round(probs[i].item(), 4) for i in range(5)},
        'low_confidence_warning': confidence < CONFIDENCE_THRESHOLD,
        'heatmap_image': heatmap_vis
    }