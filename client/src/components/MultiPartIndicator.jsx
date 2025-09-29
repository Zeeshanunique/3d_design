// src/components/MultiPartIndicator.jsx
import React from 'react';
import { useSnapshot } from 'valtio';
import state from '../store';

const MultiPartIndicator = () => {
  const snap = useSnapshot(state);

  // Only show for long sleeve model
  const isMultiPartModel = snap.selectedModel === "tshirt_longsleeve";
  const availableParts = state.modelParts[snap.selectedModel] || [];
  const selectedPartsCount = availableParts.filter(p => p.selected).length;

  if (!isMultiPartModel) {
    return null;
  }

  return (
    <div className="fixed top-20 right-5 z-40 bg-white/90 backdrop-blur-sm rounded-lg shadow-lg border p-3 max-w-xs">
      <div className="flex items-center gap-2 mb-2">
        <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
        <span className="text-sm font-medium text-gray-800">
          Multi-Part Mode Active
        </span>
      </div>
      
      <div className="text-xs text-gray-600 space-y-1">
        <div>Model: Long Sleeve T-Shirt</div>
        <div>Available Parts: {availableParts.length}</div>
        <div>Selected Parts: {selectedPartsCount}</div>
      </div>

      {selectedPartsCount > 0 && (
        <div className="mt-2 text-xs">
          <div className="font-medium text-gray-700 mb-1">Active Parts:</div>
          <div className="space-y-1">
            {availableParts
              .filter(p => p.selected)
              .map(part => (
                <div key={part.materialName} className="flex items-center justify-between">
                  <span className="text-gray-600">{part.displayName}</span>
                  <div 
                    className="w-3 h-3 rounded border border-gray-300"
                    style={{ 
                      backgroundColor: snap.modelCustomizations[snap.selectedModel]?.partColors?.[part.materialName] || snap.color
                    }}
                  />
                </div>
              ))}
          </div>
        </div>
      )}

      <div className="mt-2 pt-2 border-t border-gray-200 text-xs text-gray-500">
        💡 Use Color Picker to customize individual parts
      </div>
    </div>
  );
};

export default MultiPartIndicator;