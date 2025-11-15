"""
Generate images from text prompts using the fine-tuned model
"""
import torch
from diffusers import StableDiffusionPipeline
from PIL import Image
import argparse
import os

def generate_image(
    prompt,
    model_path="./models/clothes-diffusion",
    output_path="./outputs",
    num_inference_steps=50,
    guidance_scale=7.5,
    height=512,
    width=512,
    seed=None,
):
    """
    Generate an image from a text prompt
    
    Args:
        prompt: Text description of the clothing item
        model_path: Path to the fine-tuned model
        output_path: Directory to save generated images
        num_inference_steps: Number of denoising steps
        guidance_scale: Guidance scale for classifier-free guidance
        height: Height of generated image
        width: Width of generated image
        seed: Random seed for reproducibility
        
    Returns:
        Generated PIL Image
    """
    
    # Check if custom model exists, otherwise use base model
    if os.path.exists(model_path) and os.path.exists(os.path.join(model_path, "unet")):
        print(f"Loading fine-tuned model from {model_path}...")
        try:
            pipe = StableDiffusionPipeline.from_pretrained(
                model_path,
                torch_dtype=torch.float16 if torch.cuda.is_available() else torch.float32,
                safety_checker=None,  # Disable safety checker for clothing images
            )
        except Exception as e:
            print(f"Error loading fine-tuned model: {e}")
            print("Falling back to base Stable Diffusion model...")
            pipe = StableDiffusionPipeline.from_pretrained(
                "runwayml/stable-diffusion-v1-5",
                torch_dtype=torch.float16 if torch.cuda.is_available() else torch.float32,
            )
    else:
        print("Fine-tuned model not found. Using base Stable Diffusion model...")
        pipe = StableDiffusionPipeline.from_pretrained(
            "runwayml/stable-diffusion-v1-5",
            torch_dtype=torch.float16 if torch.cuda.is_available() else torch.float32,
        )
    
    # Move to GPU if available
    device = "cuda" if torch.cuda.is_available() else "cpu"
    pipe = pipe.to(device)
    
    # Set seed if provided
    if seed is not None:
        generator = torch.Generator(device=device).manual_seed(seed)
    else:
        generator = None
    
    print(f"Generating image for prompt: '{prompt}'...")
    print(f"Device: {device}, Steps: {num_inference_steps}, Guidance: {guidance_scale}")
    
    # Generate image
    with torch.autocast(device) if device == "cuda" else torch.no_grad():
        image = pipe(
            prompt,
            num_inference_steps=num_inference_steps,
            guidance_scale=guidance_scale,
            height=height,
            width=width,
            generator=generator,
        ).images[0]
    
    # Create output directory
    os.makedirs(output_path, exist_ok=True)
    
    # Save image
    import time
    timestamp = int(time.time())
    filename = f"generated_{timestamp}.png"
    filepath = os.path.join(output_path, filename)
    image.save(filepath)
    
    print(f"Image saved to {filepath}")
    
    return image

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Generate clothing images from text prompts")
    parser.add_argument("--prompt", type=str, required=True, help="Text description of the clothing item")
    parser.add_argument("--model_path", type=str, default="./models/clothes-diffusion", help="Path to fine-tuned model")
    parser.add_argument("--output_path", type=str, default="./outputs", help="Output directory")
    parser.add_argument("--steps", type=int, default=50, help="Number of inference steps")
    parser.add_argument("--guidance", type=float, default=7.5, help="Guidance scale")
    parser.add_argument("--height", type=int, default=512, help="Image height")
    parser.add_argument("--width", type=int, default=512, help="Image width")
    parser.add_argument("--seed", type=int, default=None, help="Random seed")
    
    args = parser.parse_args()
    
    generate_image(
        prompt=args.prompt,
        model_path=args.model_path,
        output_path=args.output_path,
        num_inference_steps=args.steps,
        guidance_scale=args.guidance,
        height=args.height,
        width=args.width,
        seed=args.seed,
    )





