import React, { useState } from 'react'

import CustomButton from './CustomButton';

const AIModel = ({ prompt, setPrompt, generatingImg, generatingSource, generationStatus, generatedImage, setGeneratedImage, handleSubmit, onApplyToModel }) => {
  const [selectedType, setSelectedType] = useState('logo');

  // Debug logging
  React.useEffect(() => {
    console.log('AIModel - generatedImage:', generatedImage ? 'exists' : 'null', 'generatingImg:', generatingImg);
  }, [generatedImage, generatingImg]);

  return (
    <div className="aimodel-container w-80">
      <div className="mb-3">
        <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">Generate images using your custom AI model</p>
      </div>
      
      <textarea 
        placeholder="Describe the image you want to generate..."
        rows={5}
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
        className="aipicker-textarea w-full p-3 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
        disabled={generatingImg}
      />
      
      {generatingImg && (
        <div className="mb-4 p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-200 dark:border-purple-800 mt-3">
          <div className="flex items-center gap-3 mb-2">
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-purple-600"></div>
            <span className="text-sm font-semibold text-purple-700 dark:text-purple-300">
              Generating with Custom AI Model
            </span>
          </div>
          {generationStatus && (
            <p className="text-xs text-purple-600 dark:text-purple-400 ml-8">
              {generationStatus}
            </p>
          )}
          <div className="mt-2 w-full bg-purple-200 dark:bg-purple-800 rounded-full h-1.5">
            <div className="bg-purple-600 h-1.5 rounded-full animate-pulse" style={{ width: '60%' }}></div>
          </div>
        </div>
      )}

      {/* Display Generated Image */}
      {generatedImage && !generatingImg && (
        <div className="mb-4 mt-3">
          <div className="border border-gray-300 dark:border-gray-600 rounded-lg overflow-hidden bg-white dark:bg-gray-800 p-2">
            <img 
              src={generatedImage} 
              alt="Generated" 
              className="w-full h-auto rounded-md"
              onError={(e) => {
                console.error('Image load error:', e);
                console.log('Image URL:', generatedImage?.substring(0, 50));
              }}
              onLoad={() => {
                console.log('Image loaded successfully');
              }}
            />
          </div>
          <div className="mt-3 flex flex-col gap-2">
            <div className="flex gap-2">
              <button
                onClick={() => setSelectedType('logo')}
                className={`flex-1 px-3 py-2 rounded-md text-xs font-medium transition ${
                  selectedType === 'logo'
                    ? 'bg-purple-500 text-white'
                    : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
                }`}
              >
                Apply as Logo
              </button>
              <button
                onClick={() => setSelectedType('full')}
                className={`flex-1 px-3 py-2 rounded-md text-xs font-medium transition ${
                  selectedType === 'full'
                    ? 'bg-purple-500 text-white'
                    : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
                }`}
              >
                Apply as Full
              </button>
            </div>
            <CustomButton 
              type="filled"
              title="Apply to 3D Model"
              handleClick={() => {
                onApplyToModel(generatedImage, selectedType);
              }}
              customStyles="text-xs bg-green-500 hover:bg-green-600 text-white w-full"
            />
            <button
              onClick={() => {
                const link = document.createElement('a');
                link.href = generatedImage;
                link.download = `generated-${Date.now()}.png`;
                link.click();
              }}
              className="px-3 py-2 rounded-md text-xs font-medium bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600 transition"
            >
              Download Image
            </button>
          </div>
        </div>
      )}
      
      <div className="flex flex-wrap gap-3 mt-3">
        {generatingImg ? (
          <CustomButton 
            type="outline"
            title="Generating..."
            customStyles="text-xs opacity-50 cursor-not-allowed"
            disabled={true}
          />
        ) : (
          <>
            <CustomButton 
              type="filled"
              title="Generate Image"
              handleClick={() => {
                setGeneratedImage(null); // Clear previous image
                handleSubmit('logo', 'custom');
              }}
              customStyles="text-xs bg-purple-500 hover:bg-purple-600 text-white"
            />
          </>
        )}
      </div>
    </div>
  )
}

export default AIModel

