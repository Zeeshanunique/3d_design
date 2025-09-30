// src/canvas/models/PantModel.jsx
import React, { useEffect } from "react";
import { useGLTF, Decal, useTexture } from "@react-three/drei";
import { useSnapshot } from "valtio";
import { useFrame } from "@react-three/fiber";
import { easing } from "maath";
import * as THREE from "three";

import state from "../../store";

export function JeansDenim(props) {
  const { nodes, materials } = useGLTF("/jeans_denim_pants.glb");
  const snap = useSnapshot(state);

  const materialNames = Object.keys(nodes).filter((n) =>
    n.startsWith("Object_")
  );

  // Initialize parts in state
  useEffect(() => {
    const availableParts = materialNames.map((materialName) => ({
      materialName,
      displayName: materialName,
      selected: false,
    }));
    state.modelParts["jeans_denim"] = availableParts;

    if (!state.modelCustomizations["jeans_denim"]) {
      state.modelCustomizations["jeans_denim"] = { partColors: {} };
    } else if (!state.modelCustomizations["jeans_denim"].partColors) {
      state.modelCustomizations["jeans_denim"].partColors = {};
    }
  }, [materials]);

  // Load full pattern (same for all parts)
  const fullPatternDecal = useTexture(
    snap.modelCustomizations["jeans_denim"]?.patternFull || "/threejs.png"
  );

  // Apply color changes
  useFrame((_, delta) => {
    materialNames.forEach((materialName) => {
      const mesh = nodes[materialName];
      if (!mesh) return;

      const colorHex =
        snap.modelCustomizations["jeans_denim"]?.partColors?.[materialName] ||
        snap.color ||
        "#ffffff";

      if (mesh.material && mesh.material.color) {
        easing.dampC(mesh.material.color, new THREE.Color(colorHex), 0.25, delta);
      }
    });
  });

  return (
    <group {...props} dispose={null}>
      <group position={[0, -0.4, 0]} scale={0.0008} rotation={[-Math.PI / 2, 0, 0]}>
        {materialNames.map((materialName) => {
          const meshNode = nodes[materialName];
          if (!meshNode) return null;

          return (
            <mesh
              key={materialName}
              castShadow
              receiveShadow
              geometry={meshNode.geometry}
              material={meshNode.material || materials.BTN_FABRIC_FRONT_7363545}
              material-roughness={1}
              dispose={null}
            >
              {/* Full pattern decal */}
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

export function PantBaked(props) {
  const { nodes, materials } = useGLTF("/pants_baked.glb");
  const snap = useSnapshot(state);

  const materialNames = Object.keys(nodes).filter((n) => n.startsWith("Object_"));

  useEffect(() => {
    const availableParts = materialNames.map((materialName) => ({
      materialName,
      displayName: materialName,
      selected: false,
    }));
    state.modelParts["pants_baked"] = availableParts;

    if (!state.modelCustomizations["pants_baked"]) {
      state.modelCustomizations["pants_baked"] = { partColors: {} };
    } else if (!state.modelCustomizations["pants_baked"].partColors) {
      state.modelCustomizations["pants_baked"].partColors = {};
    }
  }, [materials]);

  const fullPatternDecal = useTexture(
    snap.modelCustomizations["pants_baked"]?.patternFull || "/threejs.png"
  );

  useFrame((_, delta) => {
    materialNames.forEach((materialName) => {
      const mesh = nodes[materialName];
      if (!mesh) return;

      const colorHex =
        snap.modelCustomizations["pants_baked"]?.partColors?.[materialName] ||
        snap.color ||
        "#ffffff";

      if (mesh.material && mesh.material.color) {
        easing.dampC(mesh.material.color, new THREE.Color(colorHex), 0.25, delta);
      }
    });
  });

  return (
    <group {...props} dispose={null}>
      <group position={[0, -0.5, 0]} scale={0.0008}>
        {materialNames.map((materialName) => {
          const meshNode = nodes[materialName];
          if (!meshNode) return null;

          return (
            <mesh
              key={materialName}
              castShadow
              receiveShadow
              geometry={meshNode.geometry}
              material={meshNode.material || materials.SSC_Grey_Sweatpants}
              material-roughness={1}
              dispose={null}
            >
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

useGLTF.preload("/jeans_denim_pants.glb");
useGLTF.preload("/pants_baked.glb");
