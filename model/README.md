# Text-to-Image Model for Clothing Generation

This directory contains a text-to-image model fine-tuned on the [H&M Clothes Descriptions dataset](https://huggingface.co/datasets/wbensvage/clothes_desc) from Hugging Face. The model can generate clothing images based on text descriptions.

## Features

- Fine-tuned Stable Diffusion model on clothing dataset
- Text-to-image generation API
- Support for custom prompts and parameters
- GPU acceleration support (CUDA)

## Setup

### 1. Install Dependencies

```bash
cd model
pip install -r requirements.txt
```

**Note:** For GPU support, make sure you have CUDA installed and PyTorch with CUDA support. You may need to install PyTorch separately:

```bash
# For CUDA 11.8
pip install torch torchvision --index-url https://download.pytorch.org/whl/cu118

# For CUDA 12.1
pip install torch torchvision --index-url https://download.pytorch.org/whl/cu121
```

### 2. Load Dataset (Optional - for verification)

```bash
python load_dataset.py
```

This will download and cache the dataset from Hugging Face.

## Training the Model

### Step 1: Pre-process Dataset (Recommended - Much Faster!)

**IMPORTANT:** Pre-processing the dataset will make training **10-100x faster** by encoding all images to latent space upfront instead of doing it on-the-fly during training.

```bash
python preprocess_dataset.py \
    --cache_dir ./data/cached_latents \
    --batch_size 8 \
    --resolution 512
```

This will:
- Load all images from the dataset
- Encode them to latent space using the VAE
- Save the encoded latents to disk
- Takes ~5-15 minutes depending on your hardware

### Step 2: Train the Model

**With pre-processed cache (fast):**
```bash
python train_model.py \
    --pretrained_model runwayml/stable-diffusion-v1-5 \
    --output_dir ./models/clothes-diffusion \
    --batch_size 1 \
    --learning_rate 1e-5 \
    --max_steps 1000 \
    --resolution 512 \
    --cache_dir ./data/cached_latents
```

**Without cache (slow - not recommended):**
```bash
python train_model.py \
    --pretrained_model runwayml/stable-diffusion-v1-5 \
    --output_dir ./models/clothes-diffusion \
    --batch_size 1 \
    --learning_rate 1e-5 \
    --max_steps 1000 \
    --resolution 512
```

**Pre-processing Parameters:**
- `--cache_dir`: Directory to save cached latents (default: `./data/cached_latents`)
- `--batch_size`: Batch size for encoding (default: 8, increase if you have more GPU memory)
- `--resolution`: Image resolution (default: 512)

**Training Parameters:**
- `--pretrained_model`: Base model to fine-tune (default: `runwayml/stable-diffusion-v1-5`)
- `--output_dir`: Directory to save the fine-tuned model
- `--batch_size`: Training batch size (default: 1, increase if you have more GPU memory)
- `--learning_rate`: Learning rate (default: 1e-5)
- `--max_steps`: Maximum training steps (default: 1000)
- `--resolution`: Image resolution (default: 512)
- `--cache_dir`: Directory with pre-cached latents (default: `./data/cached_latents`)

**Note:** Training requires significant GPU memory (at least 16GB VRAM recommended). For systems with limited memory, use gradient checkpointing and smaller batch sizes.

## Generating Images

### Using Any Hugging Face Model

You can use any text-to-image model from Hugging Face:

```bash
# Using a Hugging Face model ID
python inference_hf_model.py \
    --prompt "a beautiful landscape with mountains" \
    --model_id "runwayml/stable-diffusion-v1-5" \
    --steps 50

# Using a local trained model
python inference_hf_model.py \
    --prompt "Pink calf-length kaftan with V-neck" \
    --model_path ./models/clothes-diffusion \
    --steps 50
```

**Quick generation:**
```bash
python quick_inference.py "a cat wearing sunglasses"
```

**List popular models:**
```bash
python popular_models.py
```

### Using Your Trained Model

Generate an image from a text prompt using your fine-tuned model:

```bash
python generate.py \
    --prompt "Pink calf-length kaftan with V-neck and concealed buttons" \
    --model_path ./models/clothes-diffusion \
    --output_path ./outputs \
    --steps 50 \
    --guidance 7.5
```

**Parameters for `inference_hf_model.py`:**
- `--prompt`: Text description of the image (required)
- `--model_id`: Hugging Face model ID (e.g., "runwayml/stable-diffusion-v1-5")
- `--model_path`: Local path to model directory (optional, overrides model_id)
- `--output_path`: Directory to save generated images (default: `./outputs`)
- `--steps`: Number of inference steps (default: 50, higher = better quality but slower)
- `--guidance`: Guidance scale (default: 7.5, higher = more adherence to prompt)
- `--height`: Image height in pixels (default: 512)
- `--width`: Image width in pixels (default: 512)
- `--seed`: Random seed for reproducibility (optional)
- `--negative_prompt`: Negative prompt to avoid certain features (optional)

**Parameters for `generate.py` (your trained model):**
- `--prompt`: Text description of the clothing item (required)
- `--model_path`: Path to fine-tuned model (default: `./models/clothes-diffusion`)
- `--output_path`: Directory to save generated images (default: `./outputs`)
- `--steps`: Number of inference steps (default: 50)
- `--guidance`: Guidance scale (default: 7.5)
- `--height`: Image height in pixels (default: 512)
- `--width`: Image width in pixels (default: 512)
- `--seed`: Random seed for reproducibility (optional)

### Example Prompts

**For clothing (with your trained model):**
- "Black boxer briefs with elasticated waist"
- "Light orange rib-knit jumper in soft cashmere with stand-up collar"
- "Greenish khaki lightly padded parka with detachable hood"
- "Red playsuit in patterned crêpe weave with frill-trimmed V-neck"

**For general images (with any Hugging Face model):**
- "a beautiful sunset over mountains, photorealistic"
- "a futuristic city at night, cyberpunk style"
- "a cute cat wearing sunglasses, digital art"
- "anime style character, detailed, high quality"

## API Server

Start the Flask API server:

```bash
python api.py
```

The server will run on `http://localhost:5001` by default.

### API Endpoints

#### 1. Health Check
```
GET /health
```

#### 2. Generate Image
```
POST /generate

Request Body:
{
    "prompt": "Text description of clothing",
    "steps": 50,
    "guidance_scale": 7.5,
    "height": 512,
    "width": 512,
    "seed": null
}

Response:
{
    "success": true,
    "image_url": "/generated/generated_1234567890.png",
    "filename": "generated_1234567890.png",
    "prompt": "user prompt"
}
```

#### 3. Get Generated Image
```
GET /generated/<filename>
```

Returns the generated image file.

#### 4. Generate and Stream (Base64)
```
POST /generate/stream

Request Body: Same as /generate

Response:
{
    "success": true,
    "image_base64": "base64_encoded_string",
    "prompt": "user prompt"
}
```

### Environment Variables

You can configure the API using environment variables:

```bash
export MODEL_PATH=./models/clothes-diffusion
export OUTPUT_DIR=./outputs
export DEFAULT_STEPS=50
export DEFAULT_GUIDANCE=7.5
export PORT=5001
export DEBUG=False
```

## Integration with Main Server

To integrate with your Express server, you can make HTTP requests to the Flask API:

```javascript
// Example: Generate image from Express server
const axios = require('axios');

async function generateClothingImage(prompt) {
    try {
        const response = await axios.post('http://localhost:5001/generate', {
            prompt: prompt,
            steps: 50,
            guidance_scale: 7.5
        });
        
        const imageUrl = `http://localhost:5001${response.data.image_url}`;
        return imageUrl;
    } catch (error) {
        console.error('Error generating image:', error);
        throw error;
    }
}
```

## Model Architecture

The model is based on Stable Diffusion v1.5, which consists of:
- **VAE (Variational Autoencoder)**: Encodes/decodes images to/from latent space
- **U-Net**: Denoising network that generates images in latent space
- **CLIP Text Encoder**: Encodes text prompts into embeddings

During fine-tuning, only the U-Net is trained while the VAE and text encoder remain frozen.

## Performance Tips

1. **GPU Memory**: Use gradient checkpointing and smaller batch sizes if you encounter OOM errors
2. **Inference Speed**: Reduce `num_inference_steps` for faster generation (minimum 20-30 steps)
3. **Quality**: Increase `guidance_scale` for better prompt adherence (range: 1-20)
4. **Resolution**: Higher resolutions require more memory and time

## Troubleshooting

### CUDA Out of Memory
- Reduce batch size
- Use gradient checkpointing
- Use mixed precision training (fp16)
- Reduce image resolution

### Model Not Found
- Make sure you've trained the model first, or the script will fall back to the base Stable Diffusion model
- Check that the model path is correct

### Slow Generation
- Use GPU if available
- Reduce number of inference steps
- Use smaller image resolution

## License

The model uses Stable Diffusion which is licensed under the CreativeML Open RAIL-M License. The dataset is licensed under Apache 2.0.

## References

- [Stable Diffusion](https://github.com/StableDiffusion/StableDiffusion)
- [Hugging Face Diffusers](https://github.com/huggingface/diffusers)
- [Dataset: wbensvage/clothes_desc](https://huggingface.co/datasets/wbensvage/clothes_desc)

