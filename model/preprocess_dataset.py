"""
Pre-process dataset by encoding all images to latent space and caching them
This significantly speeds up training by avoiding on-the-fly encoding
"""
import torch
from diffusers import AutoencoderKL
from datasets import load_dataset
from PIL import Image
import numpy as np
import os
from tqdm import tqdm
import pickle

def preprocess_dataset(
    dataset_name="wbensvage/clothes_desc",
    pretrained_model_name_or_path="runwayml/stable-diffusion-v1-5",
    cache_dir="./data/cached_latents",
    resolution=512,
    batch_size=4,
):
    """
    Pre-process dataset by encoding all images to latent space
    
    Args:
        dataset_name: Name of the Hugging Face dataset
        pretrained_model_name_or_path: Path to Stable Diffusion model
        cache_dir: Directory to save cached latents
        resolution: Image resolution
        batch_size: Batch size for encoding (higher = faster but more memory)
    """
    
    print("Loading VAE encoder...")
    device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
    print(f"Using device: {device}")
    
    vae = AutoencoderKL.from_pretrained(
        pretrained_model_name_or_path, subfolder="vae"
    )
    vae = vae.to(device)
    vae.eval()
    vae.requires_grad_(False)
    
    print("Loading dataset...")
    dataset = load_dataset(dataset_name, split="train")
    
    # Create cache directory
    os.makedirs(cache_dir, exist_ok=True)
    
    # Process images in batches
    all_latents = []
    all_texts = []
    
    print(f"Encoding {len(dataset)} images to latent space...")
    print(f"This may take a while, but it will speed up training significantly!")
    
    with torch.no_grad():
        for i in tqdm(range(0, len(dataset), batch_size)):
            batch_end = min(i + batch_size, len(dataset))
            batch_images = []
            batch_texts = []
            
            # Prepare batch
            for j in range(i, batch_end):
                item = dataset[j]
                image = item['image']
                text = item['text']
                
                # Convert to RGB if needed
                if image.mode != "RGB":
                    image = image.convert("RGB")
                
                # Resize if needed
                if image.size != (resolution, resolution):
                    image = image.resize((resolution, resolution), Image.LANCZOS)
                
                # Convert to tensor and normalize
                image_array = np.array(image).astype(np.float32) / 255.0
                image_array = (image_array - 0.5) / 0.5  # Normalize to [-1, 1]
                image_tensor = torch.from_numpy(image_array).permute(2, 0, 1)  # CHW format
                
                batch_images.append(image_tensor)
                batch_texts.append(text)
            
            # Stack batch
            batch_tensor = torch.stack(batch_images).to(device)
            
            # Encode to latent space
            latents = vae.encode(batch_tensor).latent_dist.sample()
            latents = latents * vae.config.scaling_factor
            
            # Move to CPU and store
            all_latents.append(latents.cpu())
            all_texts.extend(batch_texts)
    
    # Concatenate all latents
    print("Concatenating latents...")
    all_latents = torch.cat(all_latents, dim=0)
    
    # Save cached data
    print(f"Saving cached latents to {cache_dir}...")
    torch.save(all_latents, os.path.join(cache_dir, "latents.pt"))
    
    with open(os.path.join(cache_dir, "texts.pkl"), "wb") as f:
        pickle.dump(all_texts, f)
    
    print(f"Pre-processing complete!")
    print(f"Cached {len(all_texts)} images")
    print(f"Latent shape: {all_latents.shape}")
    print(f"Cache saved to: {cache_dir}")
    
    return all_latents, all_texts

if __name__ == "__main__":
    import argparse
    
    parser = argparse.ArgumentParser()
    parser.add_argument("--dataset", type=str, default="wbensvage/clothes_desc")
    parser.add_argument("--pretrained_model", type=str, default="runwayml/stable-diffusion-v1-5")
    parser.add_argument("--cache_dir", type=str, default="./data/cached_latents")
    parser.add_argument("--resolution", type=int, default=512)
    parser.add_argument("--batch_size", type=int, default=8)
    
    args = parser.parse_args()
    
    preprocess_dataset(
        dataset_name=args.dataset,
        pretrained_model_name_or_path=args.pretrained_model,
        cache_dir=args.cache_dir,
        resolution=args.resolution,
        batch_size=args.batch_size,
    )





