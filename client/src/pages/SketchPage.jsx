// src/pages/SketchPage.jsx
import React, { useRef, useState, useEffect } from "react";
import state from "../store";

const SketchPage = () => {
  const canvasRef = useRef(null);
  const overlayCanvasRef = useRef(null);
  const ctxRef = useRef(null);
  const overlayCtxRef = useRef(null);
  const fileInputRef = useRef(null);

  const [isDrawing, setIsDrawing] = useState(false);
  const [color, setColor] = useState("#000000");
  const [lineWidth, setLineWidth] = useState(3);
  const [tool, setTool] = useState("pen");
  const [startPos, setStartPos] = useState(null);
  const [history, setHistory] = useState([]);
  const [darkMode, setDarkMode] = useState(false);
  const [showTextModal, setShowTextModal] = useState(false);
  const [textInput, setTextInput] = useState("");
  const [fontSize, setFontSize] = useState(24);
  const [textPosition, setTextPosition] = useState(null);

  // Objects tracking (text, images, shapes)
  const [objects, setObjects] = useState([]);
  const [selectedObject, setSelectedObject] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const canvas = canvasRef.current;
    const overlayCanvas = overlayCanvasRef.current;
    
    canvas.width = 2000;
    canvas.height = 2000;
    overlayCanvas.width = 2000;
    overlayCanvas.height = 2000;

    const ctx = canvas.getContext("2d");
    ctx.lineCap = "round";
    ctx.strokeStyle = color;
    ctx.lineWidth = lineWidth;
    ctxRef.current = ctx;

    const overlayCtx = overlayCanvas.getContext("2d");
    overlayCtx.lineCap = "round";
    overlayCtxRef.current = overlayCtx;
  }, []);

  useEffect(() => {
    if (ctxRef.current) {
      ctxRef.current.strokeStyle = color;
      ctxRef.current.lineWidth = lineWidth;
      ctxRef.current.fillStyle = color;
    }
    if (overlayCtxRef.current) {
      overlayCtxRef.current.strokeStyle = color;
      overlayCtxRef.current.lineWidth = lineWidth;
      overlayCtxRef.current.fillStyle = color;
    }
  }, [color, lineWidth]);

  // Redraw all objects
  useEffect(() => {
    redrawCanvas();
  }, [objects]);

  const redrawCanvas = () => {
    const canvas = canvasRef.current;
    const ctx = ctxRef.current;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    objects.forEach((obj) => {
      if (obj.type === "text") {
        ctx.font = `${obj.fontSize}px Arial`;
        ctx.fillStyle = obj.color;
        ctx.fillText(obj.text, obj.x, obj.y);
      } else if (obj.type === "image") {
        ctx.drawImage(obj.img, obj.x, obj.y, obj.width, obj.height);
      }
    });

    drawSelection();
  };

  const drawSelection = () => {
    const overlayCanvas = overlayCanvasRef.current;
    const ctx = overlayCtxRef.current;
    ctx.clearRect(0, 0, overlayCanvas.width, overlayCanvas.height);

    if (selectedObject) {
      ctx.strokeStyle = "#0066ff";
      ctx.lineWidth = 2;
      ctx.setLineDash([5, 5]);
      
      const bounds = getObjectBounds(selectedObject);
      ctx.strokeRect(bounds.x, bounds.y, bounds.width, bounds.height);

      // Draw resize handles
      const handleSize = 8;
      ctx.fillStyle = "#0066ff";
      ctx.fillRect(bounds.x + bounds.width - handleSize / 2, bounds.y + bounds.height - handleSize / 2, handleSize, handleSize);
      
      ctx.setLineDash([]);
    }
  };

  const getObjectBounds = (obj) => {
    if (obj.type === "text") {
      const ctx = ctxRef.current;
      ctx.font = `${obj.fontSize}px Arial`;
      const metrics = ctx.measureText(obj.text);
      return {
        x: obj.x,
        y: obj.y - obj.fontSize,
        width: metrics.width,
        height: obj.fontSize
      };
    } else if (obj.type === "image") {
      return {
        x: obj.x,
        y: obj.y,
        width: obj.width,
        height: obj.height
      };
    }
    return { x: 0, y: 0, width: 0, height: 0 };
  };

  const isPointInObject = (x, y, obj) => {
    const bounds = getObjectBounds(obj);
    return x >= bounds.x && x <= bounds.x + bounds.width &&
           y >= bounds.y && y <= bounds.y + bounds.height;
  };

  const isPointInResizeHandle = (x, y, obj) => {
    const bounds = getObjectBounds(obj);
    const handleSize = 8;
    const handleX = bounds.x + bounds.width - handleSize / 2;
    const handleY = bounds.y + bounds.height - handleSize / 2;
    return x >= handleX && x <= handleX + handleSize &&
           y >= handleY && y <= handleY + handleSize;
  };

  const saveToHistory = () => {
    const canvas = canvasRef.current;
    setHistory((prev) => [...prev, { 
      dataURL: canvas.toDataURL(),
      objects: JSON.parse(JSON.stringify(objects))
    }]);
  };

  const clearOverlay = () => {
    const overlayCanvas = overlayCanvasRef.current;
    overlayCtxRef.current.clearRect(0, 0, overlayCanvas.width, overlayCanvas.height);
  };

  const startDrawing = (e) => {
    const { offsetX, offsetY } = e.nativeEvent;
    
    // Check if clicking on an object (selection mode)
    if (tool === "select") {
      const clickedObject = objects.find(obj => isPointInObject(offsetX, offsetY, obj));
      
      if (clickedObject) {
        if (selectedObject && isPointInResizeHandle(offsetX, offsetY, selectedObject)) {
          setIsResizing(true);
          setStartPos({ x: offsetX, y: offsetY });
        } else {
          setSelectedObject(clickedObject);
          setIsDragging(true);
          const bounds = getObjectBounds(clickedObject);
          setDragOffset({ x: offsetX - bounds.x, y: offsetY - bounds.y });
        }
        return;
      } else {
        setSelectedObject(null);
        drawSelection();
      }
      return;
    }

    if (tool === "text") {
      setTextPosition({ x: offsetX, y: offsetY });
      setShowTextModal(true);
      return;
    }

    setIsDrawing(true);
    setStartPos({ x: offsetX, y: offsetY });

    if (tool === "pen" || tool === "eraser") {
      ctxRef.current.beginPath();
      ctxRef.current.moveTo(offsetX, offsetY);
    }
  };

  const draw = (e) => {
    const { offsetX, offsetY } = e.nativeEvent;

    if (isDragging && selectedObject) {
      if (selectedObject.type === "text") {
        selectedObject.x = offsetX - dragOffset.x;
        selectedObject.y = offsetY - dragOffset.y + selectedObject.fontSize;
      } else if (selectedObject.type === "image") {
        selectedObject.x = offsetX - dragOffset.x;
        selectedObject.y = offsetY - dragOffset.y;
      }
      setObjects([...objects]);
      return;
    }

    if (isResizing && selectedObject) {
      const bounds = getObjectBounds(selectedObject);
      if (selectedObject.type === "image") {
        const newWidth = Math.max(20, offsetX - bounds.x);
        const newHeight = Math.max(20, offsetY - bounds.y);
        selectedObject.width = newWidth;
        selectedObject.height = newHeight;
        setObjects([...objects]);
      } else if (selectedObject.type === "text") {
        const newSize = Math.max(12, selectedObject.fontSize + (offsetY - startPos.y));
        selectedObject.fontSize = newSize;
        setStartPos({ x: offsetX, y: offsetY });
        setObjects([...objects]);
      }
      return;
    }

    if (!isDrawing) return;

    if (tool === "pen") {
      ctxRef.current.lineTo(offsetX, offsetY);
      ctxRef.current.stroke();
    } else if (tool === "eraser") {
      ctxRef.current.globalCompositeOperation = "destination-out";
      ctxRef.current.lineTo(offsetX, offsetY);
      ctxRef.current.stroke();
      ctxRef.current.globalCompositeOperation = "source-over";
    } else if (startPos) {
      clearOverlay();
      const ctx = overlayCtxRef.current;
      ctx.strokeStyle = color;
      ctx.lineWidth = lineWidth;
      ctx.fillStyle = color;
      ctx.beginPath();

      switch (tool) {
        case "line":
          ctx.moveTo(startPos.x, startPos.y);
          ctx.lineTo(offsetX, offsetY);
          ctx.stroke();
          break;
        case "rect":
          ctx.rect(startPos.x, startPos.y, offsetX - startPos.x, offsetY - startPos.y);
          ctx.stroke();
          break;
        case "fillRect":
          ctx.fillRect(startPos.x, startPos.y, offsetX - startPos.x, offsetY - startPos.y);
          break;
        case "circle":
          const radius = Math.sqrt(
            Math.pow(offsetX - startPos.x, 2) + Math.pow(offsetY - startPos.y, 2)
          );
          ctx.arc(startPos.x, startPos.y, radius, 0, 2 * Math.PI);
          ctx.stroke();
          break;
        case "fillCircle":
          const fillRadius = Math.sqrt(
            Math.pow(offsetX - startPos.x, 2) + Math.pow(offsetY - startPos.y, 2)
          );
          ctx.arc(startPos.x, startPos.y, fillRadius, 0, 2 * Math.PI);
          ctx.fill();
          break;
        case "triangle":
          const midX = (startPos.x + offsetX) / 2;
          ctx.moveTo(midX, startPos.y);
          ctx.lineTo(startPos.x, offsetY);
          ctx.lineTo(offsetX, offsetY);
          ctx.closePath();
          ctx.stroke();
          break;
        case "fillTriangle":
          const midXFill = (startPos.x + offsetX) / 2;
          ctx.moveTo(midXFill, startPos.y);
          ctx.lineTo(startPos.x, offsetY);
          ctx.lineTo(offsetX, offsetY);
          ctx.closePath();
          ctx.fill();
          break;
        case "arrow":
          const headlen = 15;
          const angle = Math.atan2(offsetY - startPos.y, offsetX - startPos.x);
          ctx.moveTo(startPos.x, startPos.y);
          ctx.lineTo(offsetX, offsetY);
          ctx.lineTo(
            offsetX - headlen * Math.cos(angle - Math.PI / 6),
            offsetY - headlen * Math.sin(angle - Math.PI / 6)
          );
          ctx.moveTo(offsetX, offsetY);
          ctx.lineTo(
            offsetX - headlen * Math.cos(angle + Math.PI / 6),
            offsetY - headlen * Math.sin(angle + Math.PI / 6)
          );
          ctx.stroke();
          break;
      }
    }
  };

  const stopDrawing = (e) => {
    if (isDragging) {
      setIsDragging(false);
      saveToHistory();
      return;
    }

    if (isResizing) {
      setIsResizing(false);
      saveToHistory();
      return;
    }

    if (!isDrawing) return;
    setIsDrawing(false);

    const { offsetX, offsetY } = e.nativeEvent;

    if (tool !== "pen" && tool !== "eraser" && startPos) {
      const ctx = ctxRef.current;
      ctx.strokeStyle = color;
      ctx.lineWidth = lineWidth;
      ctx.fillStyle = color;
      ctx.beginPath();

      switch (tool) {
        case "line":
          ctx.moveTo(startPos.x, startPos.y);
          ctx.lineTo(offsetX, offsetY);
          ctx.stroke();
          break;
        case "rect":
          ctx.rect(startPos.x, startPos.y, offsetX - startPos.x, offsetY - startPos.y);
          ctx.stroke();
          break;
        case "fillRect":
          ctx.fillRect(startPos.x, startPos.y, offsetX - startPos.x, offsetY - startPos.y);
          break;
        case "circle":
          const radius = Math.sqrt(
            Math.pow(offsetX - startPos.x, 2) + Math.pow(offsetY - startPos.y, 2)
          );
          ctx.arc(startPos.x, startPos.y, radius, 0, 2 * Math.PI);
          ctx.stroke();
          break;
        case "fillCircle":
          const fillRadius = Math.sqrt(
            Math.pow(offsetX - startPos.x, 2) + Math.pow(offsetY - startPos.y, 2)
          );
          ctx.arc(startPos.x, startPos.y, fillRadius, 0, 2 * Math.PI);
          ctx.fill();
          break;
        case "triangle":
          const midX = (startPos.x + offsetX) / 2;
          ctx.moveTo(midX, startPos.y);
          ctx.lineTo(startPos.x, offsetY);
          ctx.lineTo(offsetX, offsetY);
          ctx.closePath();
          ctx.stroke();
          break;
        case "fillTriangle":
          const midXFill = (startPos.x + offsetX) / 2;
          ctx.moveTo(midXFill, startPos.y);
          ctx.lineTo(startPos.x, offsetY);
          ctx.lineTo(offsetX, offsetY);
          ctx.closePath();
          ctx.fill();
          break;
        case "arrow":
          const headlen = 15;
          const angle = Math.atan2(offsetY - startPos.y, offsetX - startPos.x);
          ctx.moveTo(startPos.x, startPos.y);
          ctx.lineTo(offsetX, offsetY);
          ctx.lineTo(
            offsetX - headlen * Math.cos(angle - Math.PI / 6),
            offsetY - headlen * Math.sin(angle - Math.PI / 6)
          );
          ctx.moveTo(offsetX, offsetY);
          ctx.lineTo(
            offsetX - headlen * Math.cos(angle + Math.PI / 6),
            offsetY - headlen * Math.sin(angle + Math.PI / 6)
          );
          ctx.stroke();
          break;
      }

      clearOverlay();
    }

    saveToHistory();
  };

  const handleAddText = () => {
    if (!textInput.trim() || !textPosition) return;

    const newText = {
      type: "text",
      text: textInput,
      x: textPosition.x,
      y: textPosition.y,
      fontSize: parseInt(fontSize),
      color: color,
      id: Date.now()
    };

    setObjects([...objects, newText]);
    setTextInput("");
    setShowTextModal(false);
    setTextPosition(null);
    saveToHistory();
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const maxWidth = 400;
        const scale = Math.min(1, maxWidth / img.width);
        
        const newImage = {
          type: "image",
          img: img,
          x: 100,
          y: 100,
          width: img.width * scale,
          height: img.height * scale,
          id: Date.now()
        };

        setObjects([...objects, newImage]);
        saveToHistory();
      };
      img.src = event.target.result;
    };
    reader.readAsDataURL(file);
  };

  const handleDelete = () => {
    if (selectedObject) {
      setObjects(objects.filter(obj => obj.id !== selectedObject.id));
      setSelectedObject(null);
      saveToHistory();
    }
  };

  const handleUndo = () => {
    if (history.length === 0) return;

    const newHistory = [...history];
    const lastState = newHistory.pop();
    setHistory(newHistory);

    if (newHistory.length === 0) {
      const ctx = ctxRef.current;
      const canvas = canvasRef.current;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      setObjects([]);
      return;
    }

    const prevState = newHistory[newHistory.length - 1];
    setObjects(prevState.objects);
  };

  const handleClear = () => {
    const canvas = canvasRef.current;
    const ctx = ctxRef.current;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    clearOverlay();
    setObjects([]);
    setHistory([]);
    setSelectedObject(null);
  };

  const handleDownload = () => {
    const canvas = canvasRef.current;
    const link = document.createElement("a");
    link.download = `sketch-${new Date().toISOString().slice(0, 10)}.png`;
    link.href = canvas.toDataURL();
    link.click();
  };

  const toggleDarkMode = () => {
    setDarkMode((prev) => !prev);
  };

  const goBack = () => {
    state.page = "customizer";
  };

  return (
    <div
      className={`w-full h-screen flex flex-col ${
        darkMode ? "bg-gray-900 text-white" : "bg-gray-100 text-black"
      }`}
    >
      {/* Toolbar */}
      <div
        className={`p-3 flex flex-wrap gap-3 items-center shadow ${
          darkMode ? "bg-gray-800" : "bg-white"
        }`}
      >
        <button
          onClick={goBack}
          className="px-3 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 font-medium"
        >
          ← Back
        </button>

        <div className="flex items-center gap-2">
          <label className="font-medium">Color:</label>
          <input
            type="color"
            value={color}
            onChange={(e) => setColor(e.target.value)}
            className="w-10 h-10 cursor-pointer rounded border"
          />
        </div>

        <div className="flex items-center gap-2">
          <label className="font-medium">Size: {lineWidth}px</label>
          <input
            type="range"
            min="1"
            max="30"
            value={lineWidth}
            onChange={(e) => setLineWidth(e.target.value)}
            className="w-32"
          />
        </div>

        <select
          value={tool}
          onChange={(e) => setTool(e.target.value)}
          className="border p-2 rounded text-black font-medium"
        >
          <option value="select">👆 Select</option>
          <option value="pen">✏️ Pen</option>
          <option value="eraser">🧹 Eraser</option>
          <option value="line">📏 Line</option>
          <option value="arrow">➡️ Arrow</option>
          <option value="rect">▭ Rectangle</option>
          <option value="fillRect">■ Filled Rectangle</option>
          <option value="circle">○ Circle</option>
          <option value="fillCircle">● Filled Circle</option>
          <option value="triangle">△ Triangle</option>
          <option value="fillTriangle">▲ Filled Triangle</option>
          <option value="text">📝 Text</option>
        </select>

        <button
          onClick={() => fileInputRef.current.click()}
          className="px-3 py-2 bg-purple-500 text-white rounded hover:bg-purple-600 font-medium"
        >
          📷 Add Image
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleImageUpload}
          className="hidden"
        />

        <button
          onClick={handleDelete}
          className="px-3 py-2 bg-red-600 text-white rounded hover:bg-red-700 font-medium"
          disabled={!selectedObject}
        >
          🗑️ Delete
        </button>

        <button
          onClick={handleUndo}
          className="px-3 py-2 bg-yellow-500 rounded hover:bg-yellow-600 font-medium"
          disabled={history.length === 0}
        >
          ↶ Undo
        </button>

        <button
          onClick={handleClear}
          className="px-3 py-2 bg-red-500 rounded text-white hover:bg-red-600 font-medium"
        >
          Clear All
        </button>

        <button
          onClick={handleDownload}
          className="px-3 py-2 bg-green-500 text-white rounded hover:bg-green-600 font-medium"
        >
          💾 Download
        </button>

        <button
          onClick={toggleDarkMode}
          className="px-3 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 font-medium"
        >
          {darkMode ? "☀️ Light" : "🌙 Dark"}
        </button>
      </div>

      {/* Scrollable Drawing Area */}
      <div className="flex-1 overflow-auto relative">
        <div className="relative">
          <canvas
            ref={canvasRef}
            className={`cursor-crosshair ${darkMode ? "bg-gray-900" : "bg-white"}`}
            onMouseDown={startDrawing}
            onMouseMove={draw}
            onMouseUp={stopDrawing}
            onMouseLeave={stopDrawing}
            style={{ cursor: tool === "select" ? "default" : "crosshair" }}
          />
          <canvas
            ref={overlayCanvasRef}
            className="absolute top-0 left-0 pointer-events-none"
          />
        </div>
      </div>

      {/* Text Modal */}
      {showTextModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-96 shadow-2xl">
            <h3 className="text-xl font-bold mb-4 text-gray-800">Add Text</h3>
            <input
              type="text"
              value={textInput}
              onChange={(e) => setTextInput(e.target.value)}
              placeholder="Enter text..."
              className="w-full px-3 py-2 border border-gray-300 rounded mb-3 text-black"
              autoFocus
            />
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Font Size: {fontSize}px
              </label>
              <input
                type="range"
                min="12"
                max="100"
                value={fontSize}
                onChange={(e) => setFontSize(e.target.value)}
                className="w-full"
              />
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => {
                  setShowTextModal(false);
                  setTextInput("");
                }}
                className="flex-1 px-4 py-2 border border-gray-300 rounded hover:bg-gray-100 font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleAddText}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 font-medium"
              >
                Add Text
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SketchPage;