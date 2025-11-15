"""
Script to load and prepare the clothes_desc dataset from Hugging Face
"""
from datasets import load_dataset
from PIL import Image
import os

def load_clothes_dataset(cache_dir="./data"):
    """
    Load the clothes_desc dataset from Hugging Face
    
    Args:
        cache_dir: Directory to cache the dataset
        
    Returns:
        Dataset object
    """
    print("Loading clothes_desc dataset from Hugging Face...")
    dataset = load_dataset("wbensvage/clothes_desc", cache_dir=cache_dir)
    
    print(f"Dataset loaded successfully!")
    print(f"Train split size: {len(dataset['train'])}")
    print(f"Sample keys: {dataset['train'][0].keys()}")
    
    # Show a sample
    sample = dataset['train'][0]
    print(f"\nSample text: {sample['text'][:100]}...")
    print(f"Sample image size: {sample['image'].size}")
    
    return dataset

if __name__ == "__main__":
    dataset = load_clothes_dataset()
    print("\nDataset is ready for training!")





