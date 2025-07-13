import torch
import torchvision.transforms as transforms
from PIL import Image
import os

class RockClassifier:
    def __init__(self):
        # Path to your trained model
        model_path = "app/entity/ml/rocknet.pt"

        # Safety check
        if not os.path.exists(model_path):
            raise FileNotFoundError(f"Model file not found at: {model_path}")

        # Load model (be sure this is a trusted .pt file)
        self.model = torch.load(model_path, map_location=torch.device("cpu"), weights_only=False)
        self.model.eval()

        # Rock class labels (53 from your dataset)
        self.class_names = [
            'Amphibolite', 'Andesite', 'Anthracite', 'Basalt', 'Blueschist',
            'Breccia', 'Carbonatite', 'Chalk', 'Chert', 'Coal',
            'Conglomerate', 'Diamictite', 'Dolomite', 'Eclogite', 'Evaporite',
            'Flint', 'Gabbro', 'Gneiss', 'Granite', 'Granulite',
            'Greenschist', 'Greywacke', 'Hornfels', 'Komatiite', 'Limestone',
            'Marble', 'Migmatite', 'Mudstone', 'Obsidian', 'Oil_shale',
            'Oolite', 'Pegmatite', 'Phyllite', 'Porphyry', 'Pumice',
            'Pyroxenite', 'Quartz_diorite', 'Quartz_monzonite', 'Quartzite', 'Quartzolite',
            'Rhyolite', 'Sandstone', 'Scoria', 'Serpentinite', 'Shale',
            'Siltstone', 'Slate', 'Talc_carbonate', 'Tephrite', 'Travertine',
            'Tuff', 'Turbidite', 'Wackestone'
        ]

        # Image preprocessing (should match what was used in training)
        self.transform = transforms.Compose([
            transforms.Resize((224, 224)),
            transforms.ToTensor(),
            transforms.Normalize(
                mean=[0.485, 0.456, 0.406],
                std=[0.229, 0.224, 0.225]
            )
        ])

    def transform_image(self, image_path):
        image = Image.open(image_path).convert("RGB")
        return self.transform(image)

    def predict(self, image_path):
        try:
            # Preprocess image
            image_tensor = self.transform_image(image_path).unsqueeze(0)

            # Run prediction
            with torch.no_grad():
                output = self.model(image_tensor)

            # Get predicted index
            predicted_idx = output.argmax(dim=1).item()

            # Safeguard against out-of-range index
            if predicted_idx < 0 or predicted_idx >= len(self.class_names):
                raise IndexError(f"Prediction index {predicted_idx} out of range")

            predicted_class = self.class_names[predicted_idx]

            print(f"[Prediction] Index: {predicted_idx} | Class: {predicted_class}")
            return predicted_class

        except Exception as e:
            print(f"[Error] Prediction failed: {str(e)}")
            return "Unknown"
