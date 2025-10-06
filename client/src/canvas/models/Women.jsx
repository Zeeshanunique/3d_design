// src/canvas/models/WomenModel.jsx
import React, { useEffect } from "react";
import { useGLTF, Decal, useTexture } from "@react-three/drei";
import { useSnapshot } from "valtio";
import { useFrame } from "@react-three/fiber";
import { easing } from "maath";
import * as THREE from "three";

import state from "../../store";

// Optional: Text decal support
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

export function WomenModel(props) {
  let nodes, materials;
  try {
    ({ nodes, materials } = useGLTF("/white_grace.glb"));
     useEffect(() => {
    if (!state.modelCustomizations["women_model"]) {
      state.modelCustomizations["women_model"] = {
        patternFull: null,
        patternCenter: null,
        patternLeft: null,
        patternRight: null,
        partColors: {},
      };
      console.log("✅ Initialized women_model customization in state:", state.modelCustomizations["women_model"]);
    }
  }, []);
  } catch (e) {
    console.error("Failed to load GLTF:", e);
    return null;
  }

  const snap = useSnapshot(state);

  // Early check
  if (!nodes) {
    console.error("WomenModel: GLTF nodes not loaded!");
    return null;
  }
  console.log("GLTF nodes loaded:", Object.keys(nodes));

  const materialNames = Object.keys(nodes).filter((n) => n.startsWith("Pattern_"));
  console.log("Pattern nodes found:", materialNames);

  const patternFullTex = useTexture(
    snap.modelCustomizations["women_model"]?.patternFull || "/threejs.png"
  );
  const patternCenterTex = useTexture(
    snap.modelCustomizations["women_model"]?.patternCenter || "/threejs.png"
  );

  // Log what textures are applied
  console.log("Full Texture:", snap.modelCustomizations["women_model"]?.patternFull);
  console.log("Center Texture:", snap.modelCustomizations["women_model"]?.patternCenter);
  console.log("Women model customization:", state.modelCustomizations["women_model"]);


  useFrame((_, delta) => {
    materialNames.forEach((materialName) => {
      const mesh = nodes[materialName];
      if (!mesh) return;

      const colorHex =
        snap.modelCustomizations["women_model"]?.partColors?.[materialName] ||
        snap.color ||
        "#ffffff";

      if (mesh.material && mesh.material.color) {
        easing.dampC(mesh.material.color, new THREE.Color(colorHex), 0.25, delta);
      }
    });
  });

  return (
    <group {...props} dispose={null}>
      <group scale={0.0006} position={[0, -0.3, 0]}>
        {materialNames.map((materialName) => {
          const meshNode = nodes[materialName];
          if (!meshNode) {
            console.warn("Missing meshNode:", materialName);
            return null;
          }

          console.log("Rendering mesh:", materialName);

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
              {/* FULL PATTERN */}
              {snap.isFullTexture && patternFullTex && (
                <Decal
                  position={[0, 0, 0]}
                  rotation={[0, 0, 0]}
                  scale={1}
                  map={patternFullTex}
                  depthTest={false}
                  depthWrite={true}
                  onUpdate={() => console.log("Applied FULL pattern to:", materialName)}
                />
              )}

              {/* CENTER PATTERN */}
              {snap.isLogoTexture && patternCenterTex && (
                <Decal
                  position={[0, 0.15, 0.25]}
                  rotation={[0, 0, 0]}
                  scale={0.2}
                  map={patternCenterTex}
                  depthTest={false}
                  depthWrite={true}
                  onUpdate={() => console.log("Applied CENTER pattern to:", materialName)}
                />
              )}

              {/* TEXT */}
              {Array.isArray(snap.textElements) &&
                snap.textElements.map((t) => <TextDecal key={t.id} textElement={t} />)}
            </mesh>
          );
        })}
      </group>
    </group>
  );
}

useGLTF.preload("/white_grace.glb");
