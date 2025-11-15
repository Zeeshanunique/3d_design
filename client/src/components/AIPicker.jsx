import React from 'react'

import CustomButton from './CustomButton';

const AIPicker = ({ prompt, setPrompt, generatingImg, generatingSource, generationStatus, handleSubmit }) => {
  return (
    <div className="aipicker-container">
      <textarea 
        placeholder="Ask AI..."
        rows={5}
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
        className="aipicker-textarea"
        disabled={generatingImg}
      />
      
      {generatingImg && (
        <div className="mb-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
          <div className="flex items-center gap-3 mb-2">
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
            <span className="text-sm font-semibold text-blue-700 dark:text-blue-300">
              {generatingSource === 'custom' ? 'Generating with Custom Model' : 'Generating with Pollinations AI'}
            </span>
          </div>
          {generationStatus && (
            <p className="text-xs text-blue-600 dark:text-blue-400 ml-8">
              {generationStatus}
            </p>
          )}
          <div className="mt-2 w-full bg-blue-200 dark:bg-blue-800 rounded-full h-1.5">
            <div className="bg-blue-600 h-1.5 rounded-full animate-pulse" style={{ width: '60%' }}></div>
          </div>
        </div>
      )}
      
      <div className="flex flex-wrap gap-3">
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
              type="outline"
              title="AI Logo"
              handleClick={() => handleSubmit('logo', 'pollinations')}
              customStyles="text-xs"
            />

            <CustomButton 
              type="filled"
              title="AI Full"
              handleClick={() => handleSubmit('full', 'pollinations')}
              customStyles="text-xs"
            />

            <CustomButton 
              type="filled"
              title="AI Custom (Logo)"
              handleClick={() => handleSubmit('logo', 'custom')}
              customStyles="text-xs bg-purple-500 hover:bg-purple-600"
            />

            <CustomButton 
              type="filled"
              title="AI Custom (Full)"
              handleClick={() => handleSubmit('full', 'custom')}
              customStyles="text-xs bg-purple-500 hover:bg-purple-600"
            />
          </>
        )}
      </div>
    </div>
  )
}

export default AIPicker