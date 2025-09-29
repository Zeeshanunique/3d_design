// src/canvas/Shirt.jsx
import React, { useMemo, Suspense } from "react";
import { easing } from "maath";
import { useSnapshot } from "valtio";
import { useFrame } from "@react-three/fiber";
import { Decal, useGLTF, useTexture, Center} from "@react-three/drei";
import * as THREE from "three";

import state from "../store";
import { AvailableModels } from "../config/constants";

// ---------- Text Decal ----------
function TextDecal({ textElement }) {
  const texture = useMemo(() => {
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
  }, [
    textElement.text,
    textElement.fontSize,
    textElement.fontFamily,
    textElement.color,
  ]);

  return (
    <Decal
      position={[
        textElement.position?.x ?? 0,
        textElement.position?.y ?? 0.15,
        textElement.position?.z ?? 0.25,
      ]}
      rotation={[0, 0, 0]}
      scale={0.3}
      map={texture}
      depthTest={false}
      depthWrite={true}
    />
  );
}

// ---------- Model Component ----------
function ModelMesh({ currentModel, snap }) {
  const modelPath = currentModel?.modelPath || "/shirt_baked.glb";
  
  // Load model with proper error handling
  const gltfData = useGLTF(modelPath, true); // Enable draco if needed
  const { nodes, materials } = gltfData;

  // ---------- Logo Textures ----------
  const logoTexture = useTexture(snap.logoDecal || "/new1.png");
  const fullTexture = useTexture(snap.fullDecal || "/new1.png");
  const logoLeftTexture = useTexture(snap.logoLeftDecal || "/new1.png");
  const logoRightTexture = useTexture(snap.logoRightDecal || "/new1.png");

  // ---------- Pattern Textures ----------
  const patternCenter =
    snap.modelCustomizations?.[snap.selectedModel]?.patternCenter || null;
  const patternFull =
    snap.modelCustomizations?.[snap.selectedModel]?.patternFull || null;
  const patternLeft =
    snap.modelCustomizations?.[snap.selectedModel]?.patternLeft || null;
  const patternRight =
    snap.modelCustomizations?.[snap.selectedModel]?.patternRight || null;

  const patternCenterTex = useTexture(patternCenter || "/new1.png");
  const patternFullTex = useTexture(patternFull || "/new1.png");
  const patternLeftTex = useTexture(patternLeft || "/new1.png");
  const patternRightTex = useTexture(patternRight || "/new1.png");

  // Improved geometry finding logic
  const findModelGeometry = () => {
    if (!nodes) return null;
    
    const nodeKeys = Object.keys(nodes);
    console.log(`Available nodes for ${currentModel.id}:`, nodeKeys);

    // If geometryNode is specified in config, try to use it
    if (currentModel?.geometryNode && currentModel.geometryNode !== "auto") {
      const configuredNodes = Array.isArray(currentModel.geometryNode)
        ? currentModel.geometryNode
        : [currentModel.geometryNode];
      
      for (const nodeKey of configuredNodes) {
        if (nodes[nodeKey]?.geometry) {
          console.log(`Using configured geometry node: ${nodeKey}`);
          return { key: nodeKey, geometry: nodes[nodeKey].geometry };
        }
      }
    }

    // Special handling for known models
    if (modelPath.includes("shirt_baked") && nodes.T_Shirt_male?.geometry) {
      console.log("Using T_Shirt_male geometry for shirt_baked");
      return { key: "T_Shirt_male", geometry: nodes.T_Shirt_male.geometry };
    }

    // Auto-detect geometry from available nodes
    const geometryNodes = nodeKeys.filter(key => nodes[key]?.geometry);
    console.log(`Found ${geometryNodes.length} nodes with geometry:`, geometryNodes);

    if (geometryNodes.length > 0) {
      const selectedNode = geometryNodes[0]; // Use the first available geometry node
      console.log(`Auto-selected geometry node: ${selectedNode}`);
      return { key: selectedNode, geometry: nodes[selectedNode].geometry };
    }

    console.warn(`No geometry found for model: ${modelPath}`);
    return null;
  };

  // Improved material finding logic
  const findModelMaterial = () => {
    if (!materials) return null;

    const materialKeys = Object.keys(materials);
    console.log(`Available materials for ${currentModel.id}:`, materialKeys);

    // Special handling for known models
    if (modelPath.includes("shirt_baked") && materials.lambert1) {
      console.log("Using lambert1 material for shirt_baked");
      return materials.lambert1;
    }

    // If materialName is specified, try to use it
    if (currentModel?.materialName && currentModel.materialName !== "auto") {
      if (materials[currentModel.materialName]) {
        console.log(`Using configured material: ${currentModel.materialName}`);
        return materials[currentModel.materialName];
      }
    }

    // If materialNames array is specified (for multi-material models)
    if (currentModel?.materialNames && Array.isArray(currentModel.materialNames)) {
      const foundMaterial = currentModel.materialNames.find(name => materials[name]);
      if (foundMaterial) {
        console.log(`Using material from materialNames array: ${foundMaterial}`);
        return materials[foundMaterial];
      }
    }

    // Auto-select first available material
    if (materialKeys.length > 0) {
      const selectedMaterial = materialKeys[0];
      console.log(`Auto-selected material: ${selectedMaterial}`);
      return materials[selectedMaterial];
    }

    console.warn(`No material found for model: ${modelPath}`);
    return null;
  };

  const geometryInfo = findModelGeometry();
  const material = findModelMaterial();

  useFrame((_, delta) => {
    if (material && material.color) {
      easing.dampC(material.color, snap.color, 0.25, delta);
    }
  });

  // Fallback if no geometry or material is found
  if (!geometryInfo || !material) {
    console.error(`Failed to load model: ${modelPath}. Using fallback geometry.`);
    return (
      <group>
        <mesh>
          <boxGeometry args={[1, 1, 1]} />
          <meshStandardMaterial color={snap.color} />
        </mesh>
      </group>
    );
  }

  

  const logoPosition = currentModel?.decalPositions?.logo || [0, 0.04, 0.15];
  const fullPosition = currentModel?.decalPositions?.full || [0, 0, 0];

  

  // Model-specific transformations from configuration
  const getModelScale = () => {
  if (currentModel?.scale) return currentModel.scale;
  if (modelPath.includes("t-shirt_-_lengan_panjang")) return [0.9, .0, 0.9]; // 👈 scale down longsleeve
  if (modelPath.includes("white_grace")) return [2, 2, 2];
  if (modelPath.includes("hoodie")) return [0.01, 0.01, 0.01];
  return [1, 1, 1];
};

const getModelPosition = () => {
  if (currentModel?.position) return currentModel.position;
  if (modelPath.includes("t-shirt_-_lengan_panjang")) return [0, -9, 0]; // 👈 move down
  if (modelPath.includes("white_grace")) return [0, 0.6, 0];
  return [0, 0, 0];
};

const getModelRotation = () => {
  if (currentModel?.rotation) return currentModel.rotation;
  if (modelPath.includes("t-shirt_-_lengan_panjang")) return [0, Math.PI, 0]; // 👈 face camera
  if (modelPath.includes("hoodie")) return [Math.PI / 2, 0, 0];
  return [0, 0, 0];
};

 if (currentModel.id === "tshirt_longsleeve") {
  const geoNodes = [
    "Object_2","Object_3","Object_4","Object_5","Object_6","Object_7","Object_8"
  ];
  const mats = [
    "Back_FRONT_2239",
    "Collar_FRONT_2229",
    "Front_FRONT_2234",
    "Lower_Left_FRONT_2224",
    "Lower_Right_FRONT_2214",
    "Upper_Left_FRONT_2219",
    "Upper_Right_FRONT_2209"
  ];

  return (
  
      <group  scale={[0.5, 0.7, 0.7]} > {/* adjust scale if needed */}
        {geoNodes.map((key, i) => (
          <mesh
            key={key}
            geometry={nodes[key]?.geometry}
            material={materials[mats[i]]}
            castShadow
            receiveShadow
          />
        ))}
      </group>
    
  );
}


  return (
    <mesh
      castShadow
      geometry={geometryInfo.geometry}
      material={material}
      material-roughness={1}
      dispose={null}
      scale={getModelScale()}
      position={getModelPosition()}
      rotation={getModelRotation()}
    >
      {/* ---------- Full Texture ---------- */}
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

      {/* ---------- Center Logo / Pattern ---------- */}
      {snap.isLogoTexture && snap.logoDecal && (
        <Decal
          position={snap.logoCenterPosition || logoPosition}
          rotation={[0, 0, 0]}
          scale={snap.logoCenterScale || 0.15}
          map={logoTexture}
          depthTest={false}
          depthWrite={true}
        />
      )}
      {snap.isLogoTexture && patternCenter && (
        <Decal
          position={snap.logoCenterPosition || logoPosition}
          rotation={[0, 0, 0]}
          scale={snap.logoCenterScale || 0.15}
          map={patternCenterTex}
          depthTest={false}
          depthWrite={true}
        />
      )}

      {/* ---------- Left Logo / Pattern ---------- */}
      {snap.isLogoLeftTexture && snap.logoLeftDecal && (
        <Decal
          position={snap.logoLeftPosition || [-0.13, 0.1, 0.1]}
          rotation={[0, 0, 0]}
          scale={snap.logoLeftScale || 0.1}
          map={logoLeftTexture}
          depthTest={false}
          depthWrite={true}
        />
      )}
      {snap.isLogoLeftTexture && patternLeft && (
        <Decal
          position={snap.logoLeftPosition || [-0.13, 0.1, 0.1]}
          rotation={[0, 0, 0]}
          scale={snap.logoLeftScale || 0.1}
          map={patternLeftTex}
          depthTest={false}
          depthWrite={true}
        />
      )}

      {/* ---------- Right Logo / Pattern ---------- */}
      {snap.isLogoRightTexture && snap.logoRightDecal && (
        <Decal
          position={snap.logoRightPosition || [0.13, 0.1, 0.1]}
          rotation={[0, 0, 0]}
          scale={snap.logoRightScale || 0.1}
          map={logoRightTexture}
          depthTest={false}
          depthWrite={true}
        />
      )}
      {snap.isLogoRightTexture && patternRight && (
        <Decal
          position={snap.logoRightPosition || [0.13, 0.1, 0.1]}
          rotation={[0, 0, 0]}
          scale={snap.logoRightScale || 0.1}
          map={patternRightTex}
          depthTest={false}
          depthWrite={true}
        />
      )}

      {/* ---------- Text decals ---------- */}
      {Array.isArray(snap.textElements) &&
        snap.textElements.map((t) => <TextDecal key={t.id} textElement={t} />)}
    </mesh>
  );
}

// ---------- Main Shirt Component ----------
const Shirt = () => {
  const snap = useSnapshot(state);

  // Get current model configuration
  const getCurrentModel = () => {
    const categoryModels = AvailableModels[snap.selectedCategory] || [];
    const foundModel = categoryModels.find(
      (model) => model.id === snap.selectedModel
    );
    
    if (!foundModel) {
      console.warn(`Model ${snap.selectedModel} not found in category ${snap.selectedCategory}, using fallback`);
      return categoryModels[0] || {
        id: "fallback",
        name: "Fallback Model",
        modelPath: "/shirt_baked.glb",
        geometryNode: "T_Shirt_male",
        materialName: "lambert1",
        preview: "/threejs.png",
        decalPositions: { logo: [0, 0.04, 0.15], full: [0, 0, 0] }
      };
    }
    
    return foundModel;
  };

  const currentModel = getCurrentModel();
  const renderKey = `${snap.selectedModel}-${snap.selectedCategory}-${currentModel.modelPath}`;

  console.log(`Rendering model: ${currentModel.id} with path: ${currentModel.modelPath}`);

  return (
    <group key={renderKey}>
      <Suspense fallback={
        <mesh>
          <boxGeometry args={[1, 1, 1]} />
          <meshStandardMaterial color={snap.color} />
        </mesh>
      }>
        <ModelMesh currentModel={currentModel} snap={snap} />
      </Suspense>
    </group>
  );
};

export default Shirt;