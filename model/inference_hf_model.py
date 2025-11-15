"""
Inference script for any Hugging Face text-to-image model
Supports Stable Diffusion, SDXL, and other compatible models
"""
import torch
from diffusers import StableDiffusionPipeline, StableDiffusionXLPipeline
from PIL import Image
import argparse
import os
from pathlib import Path

def generate_image(
    prompt,
    model_id=None,
    model_path=None,
    output_path="./outputs",
    num_inference_steps=50,
    guidance_scale=7.5,
    height=512,
    width=512,
    seed=None,
    negative_prompt=None,
):
    """
    Generate an image from a text prompt using a Hugging Face model
    
    Args:
        prompt: Text description of the image
        model_id: Hugging Face model ID (e.g., "runwayml/stable-diffusion-v1-5")
        model_path: Local path to model (if None, uses model_id)
        output_path: Directory to save generated images
        num_inference_steps: Number of denoising steps
        guidance_scale: Guidance scale for classifier-free guidance
        height: Height of generated image
        width: Width of generated image
        seed: Random seed for reproducibility
        negative_prompt: Negative prompt to avoid certain features
        
    Returns:
        Generated PIL Image
    """
    
    # Determine which model to use
    if model_path and os.path.exists(model_path):
        print(f"Loading model from local path: {model_path}")
        model_to_load = model_path
    elif model_id:
        print(f"Loading model from Hugging Face: {model_id}")
        model_to_load = model_id
    else:
        # Default to Stable Diffusion v1.5
        model_id = "runwayml/stable-diffusion-v1-5"
        print(f"No model specified, using default: {model_id}")
        model_to_load = model_id
    
    # Check if it's SDXL or regular SD
    is_sdxl = "xl" in model_to_load.lower() or "sdxl" in model_to_load.lower()
    
    # Determine device and dtype
    device = "cuda" if torch.cuda.is_available() else "cpu"
    dtype = torch.float16 if device == "cuda" else torch.float32
    
    print(f"Device: {device}, Dtype: {dtype}")
    
    # Load the appropriate pipeline
    try:
        if is_sdxl:
            print("Loading SDXL pipeline...")
            pipe = StableDiffusionXLPipeline.from_pretrained(
                model_to_load,
                torch_dtype=dtype,
                safety_checker=None,
                requires_safety_checker=False,
            )
        else:
            print("Loading Stable Diffusion pipeline...")
            pipe = StableDiffusionPipeline.from_pretrained(
                model_to_load,
                torch_dtype=dtype,
                safety_checker=None,
                requires_safety_checker=False,
            )
    except Exception as e:
        print(f"Error loading model: {e}")
        print("Falling back to Stable Diffusion v1.5...")
        pipe = StableDiffusionPipeline.from_pretrained(
            "runwayml/stable-diffusion-v1-5",
            torch_dtype=dtype,
            safety_checker=None,
        )
    
    # Move to device
    pipe = pipe.to(device)
    
    # Enable memory efficient attention if available
    try:
        pipe.enable_attention_slicing()
        print("✅ Enabled attention slicing for memory efficiency")
    except:
        pass
    
    # Set seed if provided
    if seed is not None:
        generator = torch.Generator(device=device).manual_seed(seed)
    else:
        generator = None
    
    print(f"\nGenerating image for prompt: '{prompt}'...")
    print(f"Steps: {num_inference_steps}, Guidance: {guidance_scale}, Size: {width}x{height}")
    
    # Generate image
    try:
        with torch.autocast(device) if device == "cuda" else torch.no_grad():
            if is_sdxl:
                # SDXL uses different parameters
                image = pipe(
                    prompt=prompt,
                    negative_prompt=negative_prompt,
                    num_inference_steps=num_inference_steps,
                    guidance_scale=guidance_scale,
                    height=height,
                    width=width,
                    generator=generator,
                ).images[0]
            else:
                image = pipe(
                    prompt,
                    negative_prompt=negative_prompt,
                    num_inference_steps=num_inference_steps,
                    guidance_scale=guidance_scale,
                    height=height,
                    width=width,
                    generator=generator,
                ).images[0]
    except Exception as e:
        print(f"Error during generation: {e}")
        raise
    
    # Create output directory
    os.makedirs(output_path, exist_ok=True)
    
    # Save image
    import time
    timestamp = int(time.time())
    filename = f"generated_{timestamp}.png"
    filepath = os.path.join(output_path, filename)
    image.save(filepath)
    
    print(f"✅ Image saved to {filepath}")
    
    return image

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Generate images from text using Hugging Face models")
    parser.add_argument("--prompt", type=str, required=True, help="Text description of the image")
    parser.add_argument("--model_id", type=str, default=None, 
                       help="Hugging Face model ID (e.g., 'runwayml/stable-diffusion-v1-5')")
    parser.add_argument("--model_path", type=str, default=None, 
                       help="Local path to model directory")
    parser.add_argument("--output_path", type=str, default="./outputs", help="Output directory")
    parser.add_argument("--steps", type=int, default=50, help="Number of inference steps")
    parser.add_argument("--guidance", type=float, default=7.5, help="Guidance scale")
    parser.add_argument("--height", type=int, default=512, help="Image height")
    parser.add_argument("--width", type=int, default=512, help="Image width")
    parser.add_argument("--seed", type=int, default=None, help="Random seed")
    parser.add_argument("--negative_prompt", type=str, default=None, 
                       help="Negative prompt to avoid certain features")
    
    args = parser.parse_args()
    
    generate_image(
        prompt=args.prompt,
        model_id=args.model_id,
        model_path=args.model_path,
        output_path=args.output_path,
        num_inference_steps=args.steps,
        guidance_scale=args.guidance,
        height=args.height,
        width=args.width,
        seed=args.seed,
        negative_prompt=args.negative_prompt,
    )





