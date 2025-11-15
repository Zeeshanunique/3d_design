"""
Example usage of the text-to-image model
"""
from generate import generate_image

# Example 1: Simple generation
print("Example 1: Generating a simple clothing item...")
image1 = generate_image(
    prompt="Black boxer briefs with elasticated waist",
    output_path="./outputs",
    num_inference_steps=30,  # Faster generation
    guidance_scale=7.5,
)

# Example 2: Detailed description
print("\nExample 2: Generating with detailed description...")
image2 = generate_image(
    prompt="Pink calf-length kaftan woven in a Tencel lyocell blend with a V-neck and concealed buttons down the front. Double-layered yoke that continues down the sleeves, pleats at the front and a tie belt at the waist.",
    output_path="./outputs",
    num_inference_steps=50,  # Higher quality
    guidance_scale=8.0,
)

# Example 3: With seed for reproducibility
print("\nExample 3: Generating with fixed seed...")
image3 = generate_image(
    prompt="Light orange rib-knit jumper in soft cashmere with stand-up collar",
    output_path="./outputs",
    num_inference_steps=40,
    guidance_scale=7.5,
    seed=42,  # Same seed = same result
)

print("\nAll examples completed! Check the ./outputs directory for generated images.")





