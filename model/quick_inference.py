"""
Quick inference script - Easy to use interface for generating images
"""
from inference_hf_model import generate_image
import sys

def quick_generate(prompt, model_id="runwayml/stable-diffusion-v1-5", steps=30):
    """
    Quick function to generate an image
    
    Args:
        prompt: Text description
        model_id: Hugging Face model ID (default: Stable Diffusion v1.5)
        steps: Number of inference steps (default: 30 for speed)
    
    Returns:
        PIL Image
    """
    print(f"🚀 Quick generation with {model_id}")
    return generate_image(
        prompt=prompt,
        model_id=model_id,
        num_inference_steps=steps,
        guidance_scale=7.5,
    )

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python quick_inference.py 'your prompt' [model_id] [steps]")
        print("\nExamples:")
        print("  python quick_inference.py 'a beautiful sunset over mountains'")
        print("  python quick_inference.py 'a cat wearing sunglasses' runwayml/stable-diffusion-v1-5 50")
        print("  python quick_inference.py 'anime style character' Lykon/DreamShaper 30")
        sys.exit(1)
    
    prompt = sys.argv[1]
    model_id = sys.argv[2] if len(sys.argv) > 2 else "runwayml/stable-diffusion-v1-5"
    steps = int(sys.argv[3]) if len(sys.argv) > 3 else 30
    
    image = quick_generate(prompt, model_id, steps)
    print(f"✅ Generated image saved!")





