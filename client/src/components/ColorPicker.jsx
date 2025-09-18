import React from "react";
import { SketchPicker } from "react-color";
import { useSnapshot } from "valtio";
import state from "../store";

const ColorPicker = () => {
  const snap = useSnapshot(state);
  const modelId = snap.selectedModel;
  const availableParts = state.modelParts[modelId] || [];

  const handleColorChange = (color, partName = null) => {
    if (partName) {
      // Color a specific mesh
      if (!state.modelCustomizations[modelId].partColors) {
        state.modelCustomizations[modelId].partColors = {};
      }
      state.modelCustomizations[modelId].partColors[partName] = color.hex;
    } else {
      // Default full-model color
      state.modelCustomizations[modelId].color = color.hex;
    }
  };

  return (
    <div className="absolute left-full ml-3">
      {availableParts.length > 0 ? (
        <div>
          {availableParts.map((part) => (
            <div key={part} className="mb-2">
              <p className="text-xs">{part}</p>
              <SketchPicker
                color={snap.modelCustomizations[modelId]?.partColors?.[part] || snap.color}
                disableAlpha
                onChange={(c) => handleColorChange(c, part)}
              />
            </div>
          ))}
        </div>
      ) : (
        <SketchPicker
          color={snap.color}
          disableAlpha
          onChange={(c) => handleColorChange(c)}
        />
      )}
    </div>
  );
};

export default ColorPicker;
