"""
List of popular text-to-image models from Hugging Face
You can use any of these model IDs with inference_hf_model.py
"""

POPULAR_MODELS = {
    # Stable Diffusion v1.x
    "stable-diffusion-v1-5": "runwayml/stable-diffusion-v1-5",
    "stable-diffusion-v1-4": "CompVis/stable-diffusion-v1-4",
    "stable-diffusion-v1-3": "CompVis/stable-diffusion-v1-3",
    "stable-diffusion-v1-2": "CompVis/stable-diffusion-v1-2",
    "stable-diffusion-v1-1": "CompVis/stable-diffusion-v1-1",
    
    # Stable Diffusion v2.x
    "stable-diffusion-v2-1": "stabilityai/stable-diffusion-2-1",
    "stable-diffusion-v2-1-base": "stabilityai/stable-diffusion-2-1-base",
    "stable-diffusion-v2": "stabilityai/stable-diffusion-2",
    "stable-diffusion-v2-base": "stabilityai/stable-diffusion-2-base",
    
    # Stable Diffusion XL
    "sdxl-base": "stabilityai/stable-diffusion-xl-base-1.0",
    "sdxl-refiner": "stabilityai/stable-diffusion-xl-refiner-1.0",
    
    # Fine-tuned models
    "dreamshaper": "Lykon/DreamShaper",
    "realistic-vision": "SG161222/Realistic_Vision_V5.1_noVAE",
    "anything-v3": "Linaqruf/anything-v3.0",
    "waifu-diffusion": "hakurei/waifu-diffusion",
    "openjourney": "prompthero/openjourney",
    "redshift-diffusion": "nitrosocke/Redshift-Diffusion",
    "inkpunk-dream": "Envvi/Inkpunk-Diffusion",
    "arcane-diffusion": "nitrosocke/Arcane-Diffusion",
    
    # Specialized models
    "protogen": "darkstorm2150/Protogen_x3.4_Official_Release",
    "deliberate": "XpucT/Deliberate",
    "chilloutmix": "Lykon/DreamShaper",
}

def list_models():
    """Print all available models"""
    print("Available Hugging Face Text-to-Image Models:")
    print("=" * 60)
    for key, model_id in POPULAR_MODELS.items():
        print(f"  {key:30s} -> {model_id}")
    print("\nUsage:")
    print("  python inference_hf_model.py --prompt 'your prompt' --model_id <model_id>")
    print("\nExample:")
    print("  python inference_hf_model.py --prompt 'a beautiful landscape' --model_id runwayml/stable-diffusion-v1-5")

if __name__ == "__main__":
    list_models()





