"""
Fine-tune Stable Diffusion model on clothes_desc dataset
"""
import torch
from diffusers import StableDiffusionPipeline, DDPMScheduler, UNet2DConditionModel, AutoencoderKL
from diffusers.optimization import get_scheduler
from transformers import CLIPTextModel, CLIPTokenizer
from datasets import load_dataset
from torch.utils.data import Dataset, DataLoader
from PIL import Image
import torch.nn.functional as F
from accelerate import Accelerator
from tqdm.auto import tqdm
import os
from pathlib import Path
import numpy as np
import pickle

class ClothesDataset(Dataset):
    """Dataset class for clothes images and text descriptions"""
    
    def __init__(self, dataset, tokenizer, vae=None, size=512, device="cpu", cached_latents=None, cached_texts=None):
        """
        Args:
            dataset: Hugging Face dataset (only used if cached_latents is None)
            tokenizer: CLIP tokenizer
            vae: VAE encoder (only needed if cached_latents is None)
            size: Image size
            device: Device for encoding (only needed if cached_latents is None)
            cached_latents: Pre-encoded latents tensor (if available, much faster)
            cached_texts: List of text descriptions (if using cached_latents)
        """
        self.tokenizer = tokenizer
        self.size = size
        
        # Use cached latents if available (much faster!)
        if cached_latents is not None and cached_texts is not None:
            print("Using pre-cached latents (fast mode)")
            self.latents = cached_latents
            self.texts = cached_texts
            self.use_cache = True
        else:
            print("Using on-the-fly encoding (slower, consider pre-processing)")
            self.dataset = dataset
            self.vae = vae
            self.device = device
            self.use_cache = False
        
    def __len__(self):
        if self.use_cache:
            return len(self.texts)
        return len(self.dataset)
    
    def __getitem__(self, idx):
        if self.use_cache:
            # Fast path: use pre-cached latents
            latents = self.latents[idx]
            text = self.texts[idx]
        else:
            # Slow path: encode on-the-fly
            item = self.dataset[idx]
            
            # Get image and text
            image = item['image']
            text = item['text']
            
            # Convert to RGB if needed
            if image.mode != "RGB":
                image = image.convert("RGB")
            
            # Resize image if needed
            if image.size != (self.size, self.size):
                image = image.resize((self.size, self.size), Image.LANCZOS)
            
            # Convert to tensor and normalize
            image = np.array(image).astype(np.float32) / 255.0
            image = (image - 0.5) / 0.5  # Normalize to [-1, 1]
            image = torch.from_numpy(image).permute(2, 0, 1)  # CHW format
            
            # Encode image to latent space using VAE
            with torch.no_grad():
                # Add batch dimension
                image_batch = image.unsqueeze(0).to(self.device)
                # Encode to latent space
                latents = self.vae.encode(image_batch).latent_dist.sample()
                # Scale by VAE scaling factor
                latents = latents * self.vae.config.scaling_factor
                # Remove batch dimension
                latents = latents.squeeze(0)
        
        # Tokenize text
        text_inputs = self.tokenizer(
            text,
            padding="max_length",
            max_length=self.tokenizer.model_max_length,
            truncation=True,
            return_tensors="pt"
        )
        
        return {
            "latents": latents.cpu() if not self.use_cache else latents,
            "input_ids": text_inputs.input_ids.flatten(),
        }

def collate_fn(examples):
    """Collate function for DataLoader"""
    latents = [example["latents"] for example in examples]
    input_ids = [example["input_ids"] for example in examples]
    
    latents = torch.stack(latents)
    latents = latents.to(memory_format=torch.contiguous_format).float()
    
    input_ids = torch.stack(input_ids)
    
    batch = {
        "latents": latents,
        "input_ids": input_ids,
    }
    return batch

def train(
    pretrained_model_name_or_path="runwayml/stable-diffusion-v1-5",
    dataset_name="wbensvage/clothes_desc",
    output_dir="./models/clothes-diffusion",
    resolution=512,
    train_batch_size=1,
    gradient_accumulation_steps=4,
    learning_rate=1e-5,
    max_train_steps=1000,
    gradient_checkpointing=True,
    mixed_precision="fp16",
    seed=42,
    cache_dir=None,
):
    """Main training function"""
    
    # Disable mixed precision on CPU (it doesn't help and can slow things down)
    use_cpu = not torch.cuda.is_available()
    if use_cpu and mixed_precision == "fp16":
        print("CPU detected: Disabling mixed precision (fp16 not beneficial on CPU)")
        mixed_precision = "no"
    
    # Initialize accelerator
    accelerator = Accelerator(
        gradient_accumulation_steps=gradient_accumulation_steps,
        mixed_precision=mixed_precision,
    )
    
    # Set seed
    torch.manual_seed(seed)
    
    # Load tokenizer and text encoder
    tokenizer = CLIPTokenizer.from_pretrained(
        pretrained_model_name_or_path, subfolder="tokenizer"
    )
    text_encoder = CLIPTextModel.from_pretrained(
        pretrained_model_name_or_path, subfolder="text_encoder"
    )
    
    # Load VAE for encoding images to latent space
    vae = AutoencoderKL.from_pretrained(
        pretrained_model_name_or_path, subfolder="vae"
    )
    
    # Load scheduler and UNet
    noise_scheduler = DDPMScheduler.from_pretrained(
        pretrained_model_name_or_path, subfolder="scheduler"
    )
    unet = UNet2DConditionModel.from_pretrained(
        pretrained_model_name_or_path, subfolder="unet"
    )
    
    # Enable gradient checkpointing for memory efficiency
    # On CPU, this can slow things down, so make it optional
    if gradient_checkpointing:
        if use_cpu:
            print("CPU detected: Gradient checkpointing may slow training, but helps with memory")
        unet.enable_gradient_checkpointing()
    
    # Check if cached latents exist
    cached_latents = None
    cached_texts = None
    
    if cache_dir and os.path.exists(cache_dir):
        latents_path = os.path.join(cache_dir, "latents.pt")
        texts_path = os.path.join(cache_dir, "texts.pkl")
        
        if os.path.exists(latents_path) and os.path.exists(texts_path):
            print(f"Loading pre-cached latents from {cache_dir}...")
            cached_latents = torch.load(latents_path)
            with open(texts_path, "rb") as f:
                cached_texts = pickle.load(f)
            print(f"Loaded {len(cached_texts)} pre-cached latents!")
            # Don't need VAE if using cache
            vae = None
        else:
            print(f"Cache directory exists but cache files not found. Will encode on-the-fly.")
            print(f"To speed up training, run: python preprocess_dataset.py --cache_dir {cache_dir}")
    else:
        if cache_dir:
            print(f"Cache directory {cache_dir} not found. Will encode on-the-fly.")
            print(f"To speed up training, run: python preprocess_dataset.py --cache_dir {cache_dir}")
        else:
            print("No cache directory specified. Will encode on-the-fly (slow).")
            print("To speed up training, run: python preprocess_dataset.py")
    
    # Only load VAE if not using cache
    if cached_latents is None:
        # Load VAE for encoding images to latent space
        vae = AutoencoderKL.from_pretrained(
            pretrained_model_name_or_path, subfolder="vae"
        )
        
        # Freeze VAE
        vae.requires_grad_(False)
        vae.eval()
        
        # Determine device for VAE encoding
        # Try to use GPU if available, otherwise fall back to CPU
        # The latents will be moved to GPU during training anyway
        if torch.cuda.is_available():
            encoding_device = torch.device("cuda")
            print("Using GPU for VAE encoding")
        else:
            encoding_device = torch.device("cpu")
            print("Using CPU for VAE encoding (slower but will work)")
        
        # Move VAE to encoding device
        vae = vae.to(encoding_device)
        
        # Load dataset
        print("Loading dataset...")
        dataset = load_dataset(dataset_name, split="train")
        
        # Create dataset wrapper (will encode images to latents on-the-fly)
        print("Dataset ready. Images will be encoded to latent space during training...")
        train_dataset = ClothesDataset(
            dataset, tokenizer, vae=vae, size=resolution, device=encoding_device
        )
    else:
        # Load dataset just for compatibility (not actually used)
        dataset = load_dataset(dataset_name, split="train")
        
        # Create dataset wrapper using cached latents
        train_dataset = ClothesDataset(
            dataset, tokenizer, cached_latents=cached_latents, cached_texts=cached_texts
        )
    
    # Create dataloader
    # Can use more workers if using cached latents
    num_workers = 2 if cached_latents is not None else 0
    train_dataloader = DataLoader(
        train_dataset,
        batch_size=train_batch_size,
        shuffle=True,
        collate_fn=collate_fn,
        num_workers=num_workers,
    )
    
    # Initialize optimizer
    optimizer = torch.optim.AdamW(
        unet.parameters(),
        lr=learning_rate,
    )
    
    # Create output directory
    os.makedirs(output_dir, exist_ok=True)
    
    # Prepare for training
    unet, optimizer, train_dataloader = accelerator.prepare(
        unet, optimizer, train_dataloader
    )
    
    # Freeze text encoder
    text_encoder.to(accelerator.device)
    text_encoder.requires_grad_(False)
    
    # Training loop
    print("Starting training...")
    if use_cpu:
        print("⚠️  Training on CPU - this will be slow. Consider using GPU or reducing max_steps for testing.")
    global_step = 0
    
    # Save checkpoint interval (save every N steps)
    save_interval = max(100, max_train_steps // 10)  # Save at least every 100 steps or 10% of total
    
    for epoch in range(1):
        unet.train()
        progress_bar = tqdm(total=max_train_steps, disable=not accelerator.is_local_main_process)
        progress_bar.set_description(f"Epoch {epoch}")
        
        for step, batch in enumerate(train_dataloader):
            with accelerator.accumulate(unet):
                # Get latents (already encoded by dataset)
                latents = batch["latents"].to(accelerator.device)
                
                # Sample noise
                noise = torch.randn_like(latents)
                bsz = latents.shape[0]
                timesteps = torch.randint(
                    0, noise_scheduler.config.num_train_timesteps, (bsz,), device=latents.device
                ).long()
                
                # Add noise to latents
                noisy_latents = noise_scheduler.add_noise(latents, noise, timesteps)
                
                # Get text embeddings
                with torch.no_grad():
                    encoder_hidden_states = text_encoder(batch["input_ids"].to(accelerator.device))[0]
                
                # Predict noise
                model_pred = unet(noisy_latents, timesteps, encoder_hidden_states).sample
                
                # Calculate loss
                loss = F.mse_loss(model_pred.float(), noise.float(), reduction="mean")
                
                # Backward pass
                accelerator.backward(loss)
                optimizer.step()
                optimizer.zero_grad()
            
            progress_bar.update(1)
            progress_bar.set_postfix({"loss": f"{loss.item():.4f}"})
            global_step += 1
            
            # Periodic checkpoint saving
            if global_step % save_interval == 0:
                checkpoint_dir = os.path.join(output_dir, f"checkpoint-{global_step}")
                os.makedirs(checkpoint_dir, exist_ok=True)
                unwrapped_unet = accelerator.unwrap_model(unet)
                unwrapped_unet.save_pretrained(checkpoint_dir)
                print(f"\n💾 Saved checkpoint at step {global_step} to {checkpoint_dir}")
            
            if global_step >= max_train_steps:
                break
        
        progress_bar.close()
    
    # Save the model
    print(f"\nSaving final model to {output_dir}...")
    unwrapped_unet = accelerator.unwrap_model(unet)
    unwrapped_unet.save_pretrained(output_dir)
    
    # Save tokenizer, text encoder, VAE, and scheduler
    tokenizer.save_pretrained(output_dir)
    text_encoder.save_pretrained(os.path.join(output_dir, "text_encoder"))
    
    # Only save VAE if we loaded it (not using cache)
    if cached_latents is None:
        vae.save_pretrained(os.path.join(output_dir, "vae"))
    else:
        # Load VAE just to save it
        vae = AutoencoderKL.from_pretrained(pretrained_model_name_or_path, subfolder="vae")
        vae.save_pretrained(os.path.join(output_dir, "vae"))
    
    noise_scheduler.save_pretrained(os.path.join(output_dir, "scheduler"))
    
    print("✅ Training complete!")
    print(f"Model saved to: {output_dir}")

if __name__ == "__main__":
    import argparse
    
    parser = argparse.ArgumentParser()
    parser.add_argument("--pretrained_model", type=str, default="runwayml/stable-diffusion-v1-5")
    parser.add_argument("--output_dir", type=str, default="./models/clothes-diffusion")
    parser.add_argument("--batch_size", type=int, default=1)
    parser.add_argument("--learning_rate", type=float, default=1e-5)
    parser.add_argument("--max_steps", type=int, default=1000)
    parser.add_argument("--resolution", type=int, default=512)
    parser.add_argument("--cache_dir", type=str, default="./data/cached_latents", 
                       help="Directory with pre-cached latents (run preprocess_dataset.py first)")
    
    args = parser.parse_args()
    
    train(
        pretrained_model_name_or_path=args.pretrained_model,
        output_dir=args.output_dir,
        train_batch_size=args.batch_size,
        learning_rate=args.learning_rate,
        max_train_steps=args.max_steps,
        resolution=args.resolution,
        cache_dir=args.cache_dir,
    )

