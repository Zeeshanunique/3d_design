import React, { useEffect, useRef } from "react";
import { Image } from "react-konva";

const ColorLayer = ({ color, shirtImage }) => {
  const imageRef = useRef();

  useEffect(() => {
    if (!shirtImage) return;

    const layer = imageRef.current.getLayer();
    const ctx = layer.getContext()._canvas.getContext("2d");

    // Draw color only inside the shirt
    ctx.globalCompositeOperation = "source-in";
    ctx.fillStyle = color;
    ctx.fillRect(0, 0, shirtImage.width, shirtImage.height);

    ctx.globalCompositeOperation = "source-over"; // reset
  }, [color, shirtImage]);

  return <Image ref={imageRef} image={shirtImage} />;
};

export default ColorLayer;
