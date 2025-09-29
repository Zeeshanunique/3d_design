// src/components/2dcomponent/TwoDCanvas.jsx
import React, { useEffect, useRef, useState } from "react";
import { useSnapshot } from "valtio";
import state from "../../store";

// Draw helper
const drawCanvas = (ctx, shirtImage, color, patternImage) => {
  ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

  // Draw base shirt
  ctx.drawImage(shirtImage, 0, 0, ctx.canvas.width, ctx.canvas.height);

  // Apply color overlay
  if (color) {
    ctx.globalCompositeOperation = "source-in";
    ctx.fillStyle = color;
    ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    ctx.globalCompositeOperation = "source-over";
  }

  // Apply pattern overlay
  if (patternImage) {
    ctx.globalCompositeOperation = "source-in";
    ctx.drawImage(patternImage, 0, 0, ctx.canvas.width, ctx.canvas.height);
    ctx.globalCompositeOperation = "source-over";
  }
};

const TwoDCanvas = ({ color }) => {
  const snap = useSnapshot(state);
  const canvasRef = useRef(null);

  const [shirtImage, setShirtImage] = useState(null);
  const patternRef = useRef(null); // keep pattern in ref to not break existing logic

  // Load base shirt once
  useEffect(() => {
    const img = new window.Image();
    img.src = "/2d/2d-tshirt.png";
    img.onload = () => setShirtImage(img);
  }, []);

  // Handle pattern loading (existing working pattern code)
  useEffect(() => {
    if (!shirtImage || !canvasRef.current) return;

    const model = snap.selectedModel;
    const customization = snap.modelCustomizations[model] || {};

    const activePattern =
      customization.patternFull ||
      customization.patternCenter ||
      customization.patternLeft ||
      customization.patternRight;

    if (activePattern) {
      const img = new window.Image();
      img.src = activePattern;
      img.onload = () => {
        patternRef.current = img;
        const ctx = canvasRef.current.getContext("2d");
        drawCanvas(ctx, shirtImage, color, img); // redraw with color & pattern
      };
    } else {
      patternRef.current = null;
      const ctx = canvasRef.current.getContext("2d");
      drawCanvas(ctx, shirtImage, color, null);
    }
  }, [snap.modelCustomizations, snap.selectedModel, shirtImage, color]);

  // Handle color changes
  useEffect(() => {
    if (!canvasRef.current || !shirtImage) return;
    const ctx = canvasRef.current.getContext("2d");
    const model = snap.selectedModel;
    const customization = snap.modelCustomizations[model] || {};
    drawCanvas(ctx, shirtImage, color, patternRef.current);
  }, [shirtImage, color, snap.modelCustomizations, snap.selectedModel]);

  return (
    <canvas
      ref={canvasRef}
      width={500}
      height={600}
      className="border shadow-md"
    />
  );
};

export default TwoDCanvas;
