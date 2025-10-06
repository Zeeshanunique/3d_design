import React, { useState } from "react";
import { useSnapshot } from "valtio";
import state from "../store";
import TwoDCanvas from "../components/2dcomponent/TwoDCanvas";
import ColorPicker2D from "../components/2dcomponent/ColorPicker2d";
import { PatternPicker, CustomButton } from "../components";
import { ArrowLeft } from "lucide-react"; // icon for back button

const Designer2D = () => {
  const snap = useSnapshot(state);
  const [color, setColor] = useState("#EFBD48");
  const [pattern, setPattern] = useState(null);
  const [logo, setLogo] = useState(null);

  return (
    <div className="flex flex-col items-center gap-4 p-4">
      {/* Header with small Back button */}
      <div className="w-full flex justify-between items-center mb-2">
        {/* Small Back Button */}
        <button
          onClick={() => (state.page = "customizer")}
          className="flex items-center gap-1 px-2 py-1 rounded-full bg-gray-200 hover:bg-gray-300 transition"
        >
          <ArrowLeft size={16} />
        </button>

        <h1 className="text-lg font-semibold">2D Shirt Designer</h1>
        <div className="w-6" /> {/* Spacer for symmetry */}
      </div>

      {/* 2D Canvas */}
      <TwoDCanvas
        shirtSrc="/2d/2d-tshirt.png"
        color={color}
        patternSrc={pattern}
        //logoSrc={logo}
        logoPos={{ x: 150, y: 100, width: 200, height: 200 }}
      />

      {/* Controls */}
      <div className="flex flex-row gap-4 mt-4">
        {/* Color picker */}
        <div>
          <h2 className="font-bold mb-1">Pick Color</h2>
          <ColorPicker2D color={color} onChange={setColor} />
        </div>

        {/* Pattern picker */}
        <PatternPicker onSelectPattern={setPattern} />

        {/* Download button */}
        <CustomButton
          type="filled"
          title="Download Design"
          handleClick={() => {
            const canvas = document.querySelector("canvas");
            if (!canvas) return alert("Canvas not found");
            const link = document.createElement("a");
            link.download = "my-shirt.png";
            link.href = canvas.toDataURL("image/png");
            link.click();
          }}
        />
      </div>
    </div>
  );
};

export default Designer2D;
