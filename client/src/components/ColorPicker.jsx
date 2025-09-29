import React, { useState } from "react";
import { SketchPicker } from "react-color";
import { useSnapshot } from "valtio";
import state from "../store";

const ColorPicker = () => {
  const snap = useSnapshot(state);
  const [selectedPart, setSelectedPart] = useState(null);
  const [showPartSelector, setShowPartSelector] = useState(false);
  
  const modelId = snap.selectedModel;
  const availableParts = state.modelParts[modelId] || [];
  
  // Check if current model supports multi-part coloring (only long sleeve for now)
  const isMultiPartModel = modelId === "tshirt_longsleeve";

  const handleColorChange = (color) => {
    if (selectedPart && isMultiPartModel) {
      // Color a specific part
      if (!state.modelCustomizations[modelId].partColors) {
        state.modelCustomizations[modelId].partColors = {};
      }
      state.modelCustomizations[modelId].partColors[selectedPart] = color.hex;
    } else {
      // Default full-model color
      state.modelCustomizations[modelId].color = color.hex;
    }
  };

  const togglePartSelection = (materialName) => {
    const parts = state.modelParts[modelId] || [];
    const updatedParts = parts.map(part => 
      part.materialName === materialName 
        ? { ...part, selected: !part.selected }
        : part
    );
    state.modelParts[modelId] = updatedParts;

    // Set this part as selected for color changing
    if (updatedParts.find(p => p.materialName === materialName)?.selected) {
      setSelectedPart(materialName);
    } else if (selectedPart === materialName) {
      setSelectedPart(null);
    }
  };

  const getPartColor = (materialName) => {
    return snap.modelCustomizations[modelId]?.partColors?.[materialName] || snap.color;
  };

  const getCurrentColor = () => {
    if (selectedPart && isMultiPartModel) {
      return getPartColor(selectedPart);
    }
    return snap.color;
  };

  const resetAllPartColors = () => {
    if (state.modelCustomizations[modelId].partColors) {
      state.modelCustomizations[modelId].partColors = {};
    }
    setSelectedPart(null);
    // Reset all selections
    if (state.modelParts[modelId]) {
      state.modelParts[modelId] = state.modelParts[modelId].map(part => ({
        ...part,
        selected: false
      }));
    }
  };

  // Regular single-color picker for non-multi-part models
  if (!isMultiPartModel) {
    return (
      <div className="absolute left-full ml-3">
        <SketchPicker
          color={snap.color}
          disableAlpha
          onChange={handleColorChange}
        />
      </div>
    );
  }

  // Multi-part color picker for long sleeve model
  return (
    <div className="absolute left-full ml-3 max-w-xs">
      <div className="bg-white rounded-lg shadow-lg p-4 border">
        {/* Header */}
        <div className="mb-4">
          <h3 className="text-sm font-semibold text-gray-800 mb-2">
            Long Sleeve Multi-Part Coloring
          </h3>
          <div className="flex gap-2 mb-3">
            <button
              onClick={() => setShowPartSelector(!showPartSelector)}
              className={`px-3 py-1 text-xs rounded font-medium ${
                showPartSelector 
                  ? 'bg-blue-500 text-white' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {showPartSelector ? 'Hide Parts' : 'Select Parts'}
            </button>
            <button
              onClick={resetAllPartColors}
              className="px-3 py-1 text-xs rounded font-medium bg-red-100 text-red-700 hover:bg-red-200"
            >
              Reset All
            </button>
          </div>
        </div>

        {/* Part Selector */}
        {showPartSelector && (
          <div className="mb-4">
            <h4 className="text-xs font-medium text-gray-600 mb-2">Available Parts:</h4>
            <div className="space-y-2 max-h-40 overflow-y-auto">
              {availableParts.map((part) => (
                <div
                  key={part.materialName}
                  className={`flex items-center justify-between p-2 rounded border ${
                    part.selected
                      ? 'border-blue-300 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={part.selected || false}
                      onChange={() => togglePartSelection(part.materialName)}
                      className="text-blue-500 rounded"
                    />
                    <span className="text-xs font-medium text-gray-700">
                      {part.displayName}
                    </span>
                  </div>
                  {part.selected && (
                    <div 
                      className="w-4 h-4 rounded border border-gray-300"
                      style={{ 
                        backgroundColor: getPartColor(part.materialName)
                      }}
                    />
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Color Selection Info */}
        <div className="mb-3">
          {selectedPart ? (
            <div className="text-xs text-gray-600">
              <span className="font-medium">Coloring:</span>{' '}
              {availableParts.find(p => p.materialName === selectedPart)?.displayName || selectedPart}
            </div>
          ) : (
            <div className="text-xs text-gray-600">
              <span className="font-medium">Coloring:</span> Whole Model
            </div>
          )}
        </div>

        {/* Selected Parts List */}
        {availableParts.some(p => p.selected) && (
          <div className="mb-4">
            <h4 className="text-xs font-medium text-gray-600 mb-2">Selected Parts:</h4>
            <div className="space-y-1">
              {availableParts
                .filter(p => p.selected)
                .map((part) => (
                  <button
                    key={part.materialName}
                    onClick={() => setSelectedPart(part.materialName)}
                    className={`w-full text-left px-2 py-1 rounded text-xs flex items-center justify-between ${
                      selectedPart === part.materialName
                        ? 'bg-blue-100 text-blue-800 border border-blue-300'
                        : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <span>{part.displayName}</span>
                    <div 
                      className="w-3 h-3 rounded border"
                      style={{ 
                        backgroundColor: getPartColor(part.materialName)
                      }}
                    />
                  </button>
                ))}
            </div>
          </div>
        )}

        {/* Color Picker */}
        <SketchPicker
          color={getCurrentColor()}
          disableAlpha
          onChange={handleColorChange}
          width="100%"
        />

        {/* Instructions */}
        <div className="mt-3 text-xs text-gray-500 space-y-1">
          <p>• Select parts to enable individual coloring</p>
          <p>• Uncheck parts to use default model color</p>
          <p>• Click on selected parts to change their color</p>
        </div>
      </div>
    </div>
  );
};

export default ColorPicker;