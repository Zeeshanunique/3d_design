// src/canvas/models/WomenModel.jsx
import React, { useEffect, useMemo } from "react";
import { useGLTF, Decal, useTexture } from "@react-three/drei";
import { useSnapshot } from "valtio";
import { useFrame } from "@react-three/fiber";
import { easing } from "maath";
import * as THREE from "three";

import state from "../../store";

// Helper function for text textures (if needed in future)
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

export function WomenModel(props) {
  const { nodes, materials } = useGLTF("/white_grace.glb");
  const snap = useSnapshot(state);

  // Define part names (all geometries using same material for now)
  const materialNames = Object.keys(nodes).filter((n) =>
    n.startsWith("Pattern_")
  );

  // Initialize model parts in state
  useEffect(() => {
    if (!materials) return;

    const availableParts = materialNames.map((materialName) => ({
      materialName,
      displayName: materialName,
      selected: false,
    }));

    state.modelParts["women_model"] = availableParts;

    if (!state.modelCustomizations["women_model"]) {
      state.modelCustomizations["women_model"] = { partColors: {} };
    } else if (
      !state.modelCustomizations["women_model"].partColors
    ) {
      state.modelCustomizations["women_model"].partColors = {};
    }
  }, [materials]);

  // Load the global full pattern decal
  const fullPatternDecal = useTexture(
    snap.modelCustomizations["women_model"]?.patternFull || "/threejs.png"
  );

  // Animation frame for per-part colors
  useFrame((_, delta) => {
    materialNames.forEach((materialName) => {
      const mesh = nodes[materialName];
      if (!mesh) return;

      const colorHex =
        snap.modelCustomizations["women_model"]?.partColors?.[materialName] ||
        snap.color ||
        "#ffffff";

      if (mesh.material && mesh.material.color) {
        easing.dampC(
          mesh.material.color,
          new THREE.Color(colorHex),
          0.25,
          delta
        );
      }
    });
  });

  return (
    <group {...props} dispose={null}>
      <group scale={0.0006} position={[0, -0.3, 0]}>
        {materialNames.map((materialName) => {
          const meshNode = nodes[materialName];
          if (!meshNode) return null;

          return (
            <mesh
              key={materialName}
              castShadow
              receiveShadow
              geometry={meshNode.geometry}
              material={meshNode.material || materials.Unified_Material_575185}
              material-roughness={1}
              dispose={null}
            >
              {/* Apply full dress pattern */}
              {fullPatternDecal && (
                <Decal
                  position={[0, 0, 0]}
                  rotation={[0, 0, 0]}
                  scale={1}
                  map={fullPatternDecal}
                  material-transparent={true}
                  material-toneMapped={false}
                  depthTest={false}
                  depthWrite={true}
                />
              )}
            </mesh>
          );
        })}
      </group>
    </group>
  );
}

useGLTF.preload("/white_grace.glb");
