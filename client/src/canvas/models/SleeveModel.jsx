// src/canvas/models/SleeveModel.jsx
import React, { useEffect, useMemo } from "react";
import { easing } from "maath";
import { useSnapshot } from "valtio";
import { useFrame } from "@react-three/fiber";
import { Decal, useGLTF, useTexture } from "@react-three/drei";
import * as THREE from "three";

import state from "../../store";

// Helper function to create text texture
function createTextTexture(textElement) {
  const canvas = document.createElement("canvas");
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext("2d");

  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = textElement.color || "#000000";
  ctx.font = `${textElement.fontSize || 24}px ${
    textElement.fontFamily || "Arial"
  }`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(textElement.text || "", canvas.width / 2, canvas.height / 2);

  return new THREE.CanvasTexture(canvas);
}

export function SleeveModel(props) {
  const { nodes, materials } = useGLTF("/t-shirt_-_lengan_panjang.glb");
  const snap = useSnapshot(state);

  // Material names from the long sleeve model
  const materialNames = [
    "Back_FRONT_2239",
    "Collar_FRONT_2229",
    "Front_FRONT_2234",
    "Lower_Left_FRONT_2224",
    "Lower_Right_FRONT_2214",
    "Upper_Left_FRONT_2219",
    "Upper_Right_FRONT_2209",
  ];

  console.log("SleeveModel - Available nodes:", Object.keys(nodes || {}));
  console.log("SleeveModel - Available materials:", Object.keys(materials || {}));

  // Initialize model parts when component mounts
  useEffect(() => {
    if (!materials) return;

    const availableParts = materialNames
      .filter((materialName) => materials[materialName]) // Only include materials that exist
      .map((materialName) => {
        let displayName = materialName;
        if (materialName.includes("Back_")) displayName = "Back";
        else if (materialName.includes("Collar_")) displayName = "Collar";
        else if (materialName.includes("Front_")) displayName = "Front";
        else if (materialName.includes("Lower_Left_"))
          displayName = "Lower Left Sleeve";
        else if (materialName.includes("Lower_Right_"))
          displayName = "Lower Right Sleeve";
        else if (materialName.includes("Upper_Left_"))
          displayName = "Upper Left Sleeve";
        else if (materialName.includes("Upper_Right_"))
          displayName = "Upper Right Sleeve";

        return {
          materialName: materialName,
          displayName: displayName,
          selected: false,
        };
      });

    console.log("SleeveModel - Initialized parts:", availableParts);

    state.modelParts[snap.selectedModel] = availableParts;

    if (!state.modelCustomizations[snap.selectedModel].partColors) {
      state.modelCustomizations[snap.selectedModel].partColors = {};
    }
  }, [snap.selectedModel, materials]);

  // Load textures with error handling
  const logoTexture = useTexture(snap.logoDecal || "/threejs.png");
  const fullTexture = useTexture(snap.fullDecal || "/threejs.png");
  const logoLeftTexture = useTexture(snap.logoLeftDecal || "/threejs.png");
  const logoRightTexture = useTexture(snap.logoRightDecal || "/threejs.png");

  // Pattern Textures (with null checks)
  const patternCenter = snap.modelCustomizations?.[snap.selectedModel]?.patternCenter;
  const patternFull = snap.modelCustomizations?.[snap.selectedModel]?.patternFull;
  const patternLeft = snap.modelCustomizations?.[snap.selectedModel]?.patternLeft;
  const patternRight = snap.modelCustomizations?.[snap.selectedModel]?.patternRight;

  const patternCenterTex = useTexture(patternCenter || "/threejs.png");
  const patternFullTex = useTexture(patternFull || "/threejs.png");
  const patternLeftTex = useTexture(patternLeft || "/threejs.png");
  const patternRightTex = useTexture(patternRight || "/threejs.png");

  // Animation frame for individual part colors
  useFrame((_, delta) => {
    if (!materials) return;

    materialNames.forEach((materialName) => {
      const material = materials[materialName];
      if (material && material.color) {
        const customColor =
          snap.modelCustomizations?.[snap.selectedModel]?.partColors?.[
            materialName
          ];
        const targetColor = customColor || snap.color;
        easing.dampC(material.color, targetColor, 0.25, delta);
      }
    });
  });

  const logoPosition = [0, 0.04, 0.15];
  const fullPosition = [0, 0, 0];

  const existingMaterials = materialNames.filter((name) => materials[name]);

  console.log("SleeveModel - Rendering with materials:", existingMaterials);

  return (
    <group
      {...props}
      dispose={null}
      scale={0.0009}
      position={[0, -1.2, 0]}
      rotation={[-Math.PI / 2, 0, 0]}
    >
      {existingMaterials.map((materialName) => {
        const material = materials[materialName];

        // ✅ FIX: Use node-specific geometry instead of one geometry for all
        const node =
          nodes[materialName] ||
          Object.values(nodes).find((n) => n.material === material);

        if (!node?.geometry) {
          console.warn(`No geometry found for material: ${materialName}`);
          return null;
        }

        return (
          <mesh
            key={materialName}
            castShadow
            receiveShadow
            geometry={node.geometry} // ✅ now uses correct geometry
            material={material}
            material-roughness={1}
            dispose={null}
          >
            {/* Full Texture Decals */}
            {snap.isFullTexture && snap.fullDecal && (
              <Decal
                position={fullPosition}
                rotation={[0, 0, 0]}
                scale={1}
                map={fullTexture}
              />
            )}
            {snap.isFullTexture && patternFull && (
              <Decal
                position={fullPosition}
                rotation={[0, 0, 0]}
                scale={1}
                map={patternFullTex}
                material-transparent={true}
                material-toneMapped={false}
                material-color={snap.color}
                depthTest={false}
                depthWrite={true}
              />
            )}

          {/* Center Logo - only on Front material */}
{snap.isLogoTexture &&
  snap.logoDecal &&
  materialName.includes("Front_") && (
    <Decal
      position={snap.logoCenterPosition || [0, 0.2, 0.25]} // moved outward a bit
      rotation={[0, 0, 0]}
      scale={snap.logoCenterScale || 0.4} // larger so it's visible
      map={logoTexture}
      transparent={true} // ✅ allow logo alpha
      toneMapped={false} // ✅ prevent darkening
      depthTest={false}
      depthWrite={true}
    />
  )}

{snap.isLogoTexture &&
  patternCenter &&
  materialName.includes("Front_") && (
    <Decal
      position={snap.logoCenterPosition || [0, 0.2, 0.25]}
      rotation={[0, 0, 0]}
      scale={snap.logoCenterScale || 0.4}
      map={patternCenterTex}
      transparent={true}
      toneMapped={false}
      depthTest={false}
      depthWrite={true}
    />
  )}


            {/* Left Logo */}
            {snap.isLogoLeftTexture &&
              snap.logoLeftDecal &&
              materialName.includes("Left_") && (
                <Decal
                  position={snap.logoLeftPosition || [-0.13, 0.1, 0.1]}
                  rotation={[0, 0, 0]}
                  scale={snap.logoLeftScale || 0.1}
                  map={logoLeftTexture}
                  depthTest={false}
                  depthWrite={true}
                />
              )}
            {snap.isLogoLeftTexture &&
              patternLeft &&
              materialName.includes("Left_") && (
                <Decal
                  position={snap.logoLeftPosition || [-0.13, 0.1, 0.1]}
                  rotation={[0, 0, 0]}
                  scale={snap.logoLeftScale || 0.1}
                  map={patternLeftTex}
                  depthTest={false}
                  depthWrite={true}
                />
              )}

            {/* Right Logo */}
            {snap.isLogoRightTexture &&
              snap.logoRightDecal &&
              materialName.includes("Right_") && (
                <Decal
                  position={snap.logoRightPosition || [0.13, 0.1, 0.1]}
                  rotation={[0, 0, 0]}
                  scale={snap.logoRightScale || 0.1}
                  map={logoRightTexture}
                  depthTest={false}
                  depthWrite={true}
                />
              )}
            {snap.isLogoRightTexture &&
              patternRight &&
              materialName.includes("Right_") && (
                <Decal
                  position={snap.logoRightPosition || [0.13, 0.1, 0.1]}
                  rotation={[0, 0, 0]}
                  scale={snap.logoRightScale || 0.1}
                  map={patternRightTex}
                  depthTest={false}
                  depthWrite={true}
                />
              )}

            {/* Text decals */}
            {materialName.includes("Front_") &&
              Array.isArray(snap.textElements) &&
              snap.textElements.map((textElement) => {
                const textTexture = useMemo(
                  () => createTextTexture(textElement),
                  [
                    textElement.text,
                    textElement.fontSize,
                    textElement.fontFamily,
                    textElement.color,
                  ]
                );

                return (
                  <Decal
                    key={textElement.id}
                    position={[
                      textElement.position?.x ?? 0,
                      textElement.position?.y ?? 0.15,
                      textElement.position?.z ?? 0.25,
                    ]}
                    rotation={[0, 0, 0]}
                    scale={0.3}
                    map={textTexture}
                    depthTest={false}
                    depthWrite={true}
                  />
                );
              })}
          </mesh>
        );
      })}
    </group>
  );
}

useGLTF.preload("/t-shirt_-_lengan_panjang.glb");
