import React, { Suspense, useRef, useState, useEffect } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Center, Environment } from "@react-three/drei";

import Shirt from "./Shirt";

// Import all non-shirt models
import { JeansDenim, PantBaked } from "./models/Pant";
import { AdidasJacket, JacketMen } from "./models/JacketModel";
import { WomenModel } from "./models/Women";
import { ShortModel, Shortpuff } from "./models/Short";

import CameraRig from "./CameraRig";
import state from "../store";
import { useSnapshot } from "valtio";

// ✅ Mapping model IDs to their components
const ModelComponents = {
  // Pants
  jeans: JeansDenim,
  baked: PantBaked,

  // Jackets
  adidas: AdidasJacket,
  mensjacket: JacketMen,

  // Shorts
  ShortModel: ShortModel,
  Shortpuff: Shortpuff,

  // Women
  WomenModel: WomenModel,
};

const RotatableModel = () => {
  const ref = useRef();
  const snap = useSnapshot(state);
  const { camera } = useThree();

  const [isDragging, setIsDragging] = useState(false);
  const [lastX, setLastX] = useState(0);
  const [rotationY, setRotationY] = useState(0);
  const [zoom, setZoom] = useState(2.5);

  useFrame(() => {
    if (ref.current) ref.current.rotation.y = rotationY;
    camera.position.z = zoom;
  });

  const onPointerDown = (e) => {
    setIsDragging(true);
    setLastX(e.clientX);
  };

  const onPointerMove = (e) => {
    if (isDragging) {
      const deltaX = e.clientX - lastX;
      setRotationY((prev) => prev + deltaX * 0.01);
      setLastX(e.clientX);
    }
  };

  const onPointerUp = () => setIsDragging(false);

  const onWheel = (e) => {
    setZoom((prev) =>
      Math.min(Math.max(prev - e.deltaY * 0.01, 1.5), 5)
    );
  };

  const handleKeyDown = (e) => {
    switch (e.key) {
      case "ArrowLeft":
        setRotationY((prev) => prev + 0.05);
        break;
      case "ArrowRight":
        setRotationY((prev) => prev - 0.05);
        break;
      case "ArrowUp":
        setZoom((prev) => Math.max(prev - 0.1, 1.5));
        break;
      case "ArrowDown":
        setZoom((prev) => Math.min(prev + 0.1, 5));
        break;
      default:
        break;
    }
  };

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // ✅ Render active model
  const renderActiveModel = () => {
    console.log("Active category:", snap.selectedCategory, "model:", snap.selectedModel);

    if (snap.selectedCategory === "tshirts") return <Shirt />;

    const ModelComp = ModelComponents[snap.selectedModel];
    if (ModelComp){  
      console.log("RotatableModel: Rendering model component:", snap.selectedModel); 
      return <ModelComp />;}

    // 🚨 Debug fallback if model is missing
    return (
      <mesh>
        <boxGeometry />
        <meshStandardMaterial color="red" />
      </mesh>
    );
  };

  return (
    <group
      ref={ref}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerLeave={onPointerUp}
      onWheel={onWheel}
    >
      <Suspense
        fallback={
          <mesh>
            <boxGeometry args={[1, 1, 1]} />
            <meshStandardMaterial color="orange" />
          </mesh>
        }
      >
        {renderActiveModel()}
      </Suspense>
    </group>
  );
};

const CanvasModel = () => {
  return (
    <div className="absolute inset-0 z-0">
      <Canvas
        shadows
        camera={{ position: [0, 0, 2.5], fov: 25 }}
        gl={{ preserveDrawingBuffer: true }}
        className="w-full h-full"
      >
        <ambientLight intensity={0.5} />
        <Environment preset="city" />
        <CameraRig>
          <Center>
            <RotatableModel />
          </Center>
        </CameraRig>
      </Canvas>
    </div>
  );
};

export default CanvasModel;
