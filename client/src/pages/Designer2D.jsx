import React, { useState } from "react";
import TwoDCanvas from "../components/2dcomponent/TwoDCanvas";
import ColorPicker2D from "../components/2dcomponent/ColorPicker2d";
import { ChromePicker } from "react-color"; // simple color picker
import { PatternPicker, CustomButton } from "../components";

const Designer2D = () => {
  const [color, setColor] = useState("#EFBD48");
  const [pattern, setPattern] = useState(null);
  const [logo, setLogo] = useState(null);

  return (
    <div className="flex flex-col items-center gap-4 p-4">
      <h1 className="text-xl font-bold">2D Shirt Designer</h1>

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

        {/* Logo picker 
        <LogoPicker onSelectLogo={setLogo} />*/}

        {/* Download button */}
        <CustomButton
          type="filled"
          title="Download Design"
          handleClick={() => {
            const canvas = document.querySelector("canvas");
            if (!canvas) return alert("Canvas not found");
            const link = document.createElement("a");
            link.download = "my-shirt.png";
            link.href = canvas.toDataURL("imagepng");
            link.click();
          }}
        />
      </div>
    </div>
  );
};

export default Designer2D;
