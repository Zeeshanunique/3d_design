// src/canvas/Shirt.jsx
import React, { Suspense } from "react";
import { useSnapshot } from "valtio";
import { useGLTF, useTexture, Decal } from "@react-three/drei";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { easing } from "maath";


import state from "../store";
import { AvailableModels } from "../config/constants";
import { SleeveModel } from "./models/SleeveModel";

// ---------- Text Decal Component ----------
function TextDecal({ textElement }) {
  const texture = new THREE.CanvasTexture(
    (() => {
      const canvas = document.createElement("canvas");
      canvas.width = 512;
      canvas.height = 512;
      const ctx = canvas.getContext("2d");
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = textElement.color || "#000000";
      ctx.font = `${textElement.fontSize || 24}px ${textElement.fontFamily || "Arial"}`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(textElement.text || "", canvas.width / 2, canvas.height / 2);
      return canvas;
    })()
  );

  return (
    <Decal
      position={[textElement.position?.x || 0, textElement.position?.y || 0.15, textElement.position?.z || 0.25]}
      rotation={[0, 0, 0]}
      scale={0.3}
      map={texture}
      depthTest={false}
      depthWrite={true}
    />
  );
}

// ---------- Generic Shirt Mesh ----------
function GenericShirtMesh({ currentModel, snap }) {
  const { nodes, materials } = useGLTF(currentModel.modelPath);
  const geometryInfo = nodes?.[currentModel.geometryNode]?.geometry || Object.values(nodes)[0]?.geometry;
  const material = materials?.[currentModel.materialName] || Object.values(materials)[0];

  if (!geometryInfo || !material) return null;

  
// Animate material color to match snap.color
useFrame((_, delta) => {
  if (material && material.color) {
    const targetColor = snap.modelCustomizations?.[snap.selectedModel]?.partColors?.[currentModel.materialName] || snap.color;
    easing.dampC(material.color, targetColor, 0.25, delta);
  }
});

  const logoTexture = useTexture(snap.logoDecal || "/threejs.png");
  const logoLeftTexture = useTexture(snap.logoLeftDecal || "/threejs.png");
  const logoRightTexture = useTexture(snap.logoRightDecal || "/threejs.png");
  const fullTexture = useTexture(snap.fullDecal || "/threejs.png");

  const patternCenter = snap.modelCustomizations?.[snap.selectedModel]?.patternCenter;
  const patternFull = snap.modelCustomizations?.[snap.selectedModel]?.patternFull;
  const patternLeft = snap.modelCustomizations?.[snap.selectedModel]?.patternLeft;
  const patternRight = snap.modelCustomizations?.[snap.selectedModel]?.patternRight;

  const patternCenterTex = useTexture(patternCenter || "/threejs.png");
  const patternFullTex = useTexture(patternFull || "/threejs.png");
  const patternLeftTex = useTexture(patternLeft || "/threejs.png");
  const patternRightTex = useTexture(patternRight || "/threejs.png");

  const logoPosition = currentModel.decalPositions?.logo || [0, 0.04, 0.15];
  const fullPosition = currentModel.decalPositions?.full || [0, 0, 0];

  return (
    <mesh castShadow geometry={geometryInfo} material={material} material-roughness={1} dispose={null}>
      {/* FULL */}
      {snap.isFullTexture && snap.fullDecal && <Decal position={fullPosition} rotation={[0,0,0]} scale={1} map={fullTexture} />}
      {snap.isFullTexture && patternFull && <Decal position={fullPosition} rotation={[0,0,0]} scale={1} map={patternFullTex} depthTest={false} depthWrite={true}/>}

      {/* CENTER LOGO */}
      {snap.isLogoTexture && snap.logoDecal && <Decal position={snap.logoCenterPosition || logoPosition} rotation={[0,0,0]} scale={snap.logoCenterScale || 0.15} map={logoTexture} depthTest={false} depthWrite={true}/>}
      {snap.isLogoTexture && patternCenter && <Decal position={snap.logoCenterPosition || logoPosition} rotation={[0,0,0]} scale={snap.logoCenterScale || 0.15} map={patternCenterTex} depthTest={false} depthWrite={true}/>}

      {/* LEFT LOGO */}
      {snap.isLogoLeftTexture && snap.logoLeftDecal && <Decal position={snap.logoLeftPosition || [-0.13,0.1,0.1]} rotation={[0,0,0]} scale={snap.logoLeftScale || 0.1} map={logoLeftTexture} depthTest={false} depthWrite={true}/>}
      {snap.isLogoLeftTexture && patternLeft && <Decal position={snap.logoLeftPosition || [-0.13,0.1,0.1]} rotation={[0,0,0]} scale={snap.logoLeftScale || 0.1} map={patternLeftTex} depthTest={false} depthWrite={true}/>}

      {/* RIGHT LOGO */}
      {snap.isLogoRightTexture && snap.logoRightDecal && <Decal position={snap.logoRightPosition || [0.13,0.1,0.1]} rotation={[0,0,0]} scale={snap.logoRightScale || 0.1} map={logoRightTexture} depthTest={false} depthWrite={true}/>}
      {snap.isLogoRightTexture && patternRight && <Decal position={snap.logoRightPosition || [0.13,0.1,0.1]} rotation={[0,0,0]} scale={snap.logoRightScale || 0.1} map={patternRightTex} depthTest={false} depthWrite={true}/>}

      {/* TEXT */}
      {Array.isArray(snap.textElements) && snap.textElements.map(t => <TextDecal key={t.id} textElement={t} />)}
    </mesh>
  );
}

// ---------- Main Shirt Component ----------
const Shirt = () => {
  const snap = useSnapshot(state);

  const categoryModels = AvailableModels[snap.selectedCategory] || [];
  const currentModel = categoryModels.find(m => m.id === snap.selectedModel) || categoryModels[0];

  // Determine if the selected shirt is a sleeve model
  const isSleeveModel = currentModel?.modelPath?.includes("lengan");

  return (
    <group>
      <Suspense fallback={<mesh><boxGeometry args={[1,1,1]}/><meshStandardMaterial color={snap.color}/></mesh>}>
        {isSleeveModel ? <SleeveModel /> : <GenericShirtMesh currentModel={currentModel} snap={snap} />}
      </Suspense>
    </group>
  );
};

export default Shirt;
