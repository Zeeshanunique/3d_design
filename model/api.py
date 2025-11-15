"""
Flask API server for text-to-image generation
"""
from flask import Flask, request, jsonify, send_file
from flask_cors import CORS
from inference_hf_model import generate_image
import os
import io
from PIL import Image
import uuid

app = Flask(__name__)
CORS(app)

# Configuration
MODEL_ID = os.getenv("MODEL_ID", "runwayml/stable-diffusion-v1-5")  # Hugging Face model ID
MODEL_PATH = os.getenv("MODEL_PATH", None)  # Local model path (optional, overrides MODEL_ID)
OUTPUT_DIR = os.getenv("OUTPUT_DIR", "./outputs")
DEFAULT_STEPS = int(os.getenv("DEFAULT_STEPS", "30"))  # Reduced for faster generation
DEFAULT_GUIDANCE = float(os.getenv("DEFAULT_GUIDANCE", "7.5"))

@app.route("/health", methods=["GET"])
def health():
    """Health check endpoint"""
    return jsonify({"status": "healthy"})

@app.route("/generate", methods=["POST"])
def generate():
    """
    Generate image from text prompt
    
    Request body:
    {
        "prompt": "Text description of clothing",
        "steps": 50 (optional),
        "guidance_scale": 7.5 (optional),
        "height": 512 (optional),
        "width": 512 (optional),
        "seed": null (optional)
    }
    
    Returns:
    {
        "success": true,
        "image_url": "/generated/{filename}",
        "filename": "generated_{timestamp}.png"
    }
    """
    try:
        data = request.get_json()
        
        if not data or "prompt" not in data:
            return jsonify({"success": False, "error": "Missing 'prompt' in request body"}), 400
        
        prompt = data["prompt"]
        steps = data.get("steps", DEFAULT_STEPS)
        guidance_scale = data.get("guidance_scale", DEFAULT_GUIDANCE)
        height = data.get("height", 512)
        width = data.get("width", 512)
        seed = data.get("seed", None)
        
        # Generate image using inference_hf_model
        image = generate_image(
            prompt=prompt,
            model_id=MODEL_ID if not MODEL_PATH else None,
            model_path=MODEL_PATH,
            output_path=OUTPUT_DIR,
            num_inference_steps=steps,
            guidance_scale=guidance_scale,
            height=height,
            width=width,
            seed=seed,
        )
        
        # Get the filename from the generated image
        import time
        timestamp = int(time.time())
        filename = f"generated_{timestamp}.png"
        
        return jsonify({
            "success": True,
            "image_url": f"/generated/{filename}",
            "filename": filename,
            "prompt": prompt
        })
    
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500

@app.route("/generated/<filename>", methods=["GET"])
def get_image(filename):
    """Serve generated images"""
    try:
        filepath = os.path.join(OUTPUT_DIR, filename)
        if not os.path.exists(filepath):
            return jsonify({"error": "Image not found"}), 404
        
        return send_file(filepath, mimetype="image/png")
    
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/generate/stream", methods=["POST"])
def generate_stream():
    """
    Generate image and return as base64 encoded string
    
    Request body: Same as /generate
    
    Returns:
    {
        "success": true,
        "image_base64": "base64_encoded_string",
        "prompt": "user prompt"
    }
    """
    try:
        data = request.get_json()
        
        if not data or "prompt" not in data:
            return jsonify({"success": False, "error": "Missing 'prompt' in request body"}), 400
        
        prompt = data["prompt"]
        steps = data.get("steps", DEFAULT_STEPS)
        guidance_scale = data.get("guidance_scale", DEFAULT_GUIDANCE)
        height = data.get("height", 512)
        width = data.get("width", 512)
        seed = data.get("seed", None)
        
        # Generate image using inference_hf_model
        image = generate_image(
            prompt=prompt,
            model_id=MODEL_ID if not MODEL_PATH else None,
            model_path=MODEL_PATH,
            output_path=OUTPUT_DIR,
            num_inference_steps=steps,
            guidance_scale=guidance_scale,
            height=height,
            width=width,
            seed=seed,
        )
        
        # Convert to base64
        import base64
        buffer = io.BytesIO()
        image.save(buffer, format="PNG")
        image_base64 = base64.b64encode(buffer.getvalue()).decode("utf-8")
        
        return jsonify({
            "success": True,
            "image_base64": image_base64,
            "prompt": prompt
        })
    
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500

if __name__ == "__main__":
    port = int(os.getenv("PORT", 5001))
    debug = os.getenv("DEBUG", "False").lower() == "true"
    
    print(f"Starting text-to-image API server on port {port}...")
    print(f"Model ID: {MODEL_ID}")
    if MODEL_PATH:
        print(f"Model path: {MODEL_PATH}")
    print(f"Output directory: {OUTPUT_DIR}")
    
    app.run(host="0.0.0.0", port=port, debug=debug)





