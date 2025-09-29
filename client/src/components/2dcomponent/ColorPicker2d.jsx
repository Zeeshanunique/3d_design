// components/2dcomponent/ColorPicker2D.jsx
import React from "react";
import { SketchPicker } from "react-color";

const ColorPicker2D = ({ color, onChange }) => {
  return (
    <div className="ml-3">
      <SketchPicker
        color={color}
        disableAlpha
        onChange={(c) => onChange(c.hex)}
      />
    </div>
  );
};

export default ColorPicker2D;
