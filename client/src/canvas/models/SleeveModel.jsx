// src/canvas/models/SleeveModel.jsx
import React, { useEffect, useMemo } from "react";
import { easing } from "maath";
import { useSnapshot } from "valtio";
import { useFrame } from "@react-three/fiber";
import { Decal, useGLTF, useTexture } from "@react-three/drei";
import * as THREE from "three";

import state from "../../store";

// Helper to safely create text texture (with error handling)
function createTextTexture(textElement) {
  try {
    const canvas = document.createElement("canvas");
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext("2d");

    if (!ctx) throw new Error("2D context unavailable");

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = textElement.color || "#000000";
    ctx.font = `${textElement.fontSize || 24}px ${textElement.fontFamily || "Arial"}`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(textElement.text || "", canvas.width / 2, canvas.height / 2);

    return new THREE.CanvasTexture(canvas);
  } catch (err) {
    console.error("[SleeveModel] createTextTexture error:", err, textElement);
    // fallback 1x1 white texture to avoid crash
    const fallback = new THREE.CanvasTexture(document.createElement("canvas"));
    return fallback;
  }
}

function fmtTexInfo(tex) {
  try {
    if (!tex) return null;
    const image = tex.image;
    const src = image && (image.currentSrc || image.src || image?.dataURL || image?.url) ? (image.currentSrc || image.src || image.dataURL || image.url) : (image ? image : null);
    return { uuid: tex.uuid, hasImage: !!image, imageSrc: src, needsUpdate: tex.needsUpdate };
  } catch (err) {
    return { error: String(err) };
  }
}

export function SleeveModel(props) {
  const snap = useSnapshot(state);

  // Load gltf
  let gltf;
  try {
    gltf = useGLTF("/t-shirt_-_lengan_panjang.glb");
  } catch (err) {
    console.error("[SleeveModel] useGLTF error:", err);
    // Render nothing if gltf fails — but still return null to avoid app crash
    return null;
  }

  const { nodes = {}, materials = {} } = gltf || {};

  // Known material names for this model
  const materialNames = [
    "Back_FRONT_2239",
    "Collar_FRONT_2229",
    "Front_FRONT_2234",
    "Lower_Left_FRONT_2224",
    "Lower_Right_FRONT_2214",
    "Upper_Left_FRONT_2219",
    "Upper_Right_FRONT_2209",
  ];

  // Init modelParts for Customizer - robust guard
  useEffect(() => {
    try {
      if (!materials) {
        console.warn("[SleeveModel] materials not available yet");
        return;
      }

      const availableParts = materialNames
        .filter((name) => !!materials[name])
        .map((materialName) => {
          let displayName = materialName;
          if (materialName.includes("Back_")) displayName = "Back";
          else if (materialName.includes("Collar_")) displayName = "Collar";
          else if (materialName.includes("Front_")) displayName = "Front";
          else if (materialName.includes("Lower_Left_")) displayName = "Lower Left Sleeve";
          else if (materialName.includes("Lower_Right_")) displayName = "Lower Right Sleeve";
          else if (materialName.includes("Upper_Left_")) displayName = "Upper Left Sleeve";
          else if (materialName.includes("Upper_Right_")) displayName = "Upper Right Sleeve";

          return { materialName, displayName, selected: false };
        });

      state.modelParts[snap.selectedModel] = availableParts;

      if (!state.modelCustomizations[snap.selectedModel]) {
        // ensure customization object exists and log it
        state.modelCustomizations[snap.selectedModel] = {
          color: "#EFBD48",
          partColors: {},
        };
        console.warn(`[SleeveModel] created default modelCustomizations for ${snap.selectedModel}`);
      } else if (!state.modelCustomizations[snap.selectedModel].partColors) {
        state.modelCustomizations[snap.selectedModel].partColors = {};
      }
    } catch (err) {
      console.error("[SleeveModel] Error initializing model parts:", err);
    }
  }, [snap.selectedModel, materials]);

  // Pull model customization and fallback behavior
  const modelCustomization = snap.modelCustomizations?.[snap.selectedModel] || {};
  // Log snapshot of config for debugging
  useEffect(() => {
    console.groupCollapsed(`[SleeveModel] config snapshot for model: ${snap.selectedModel}`);
    console.log("snap keys:", {
      selectedModel: snap.selectedModel,
      color: snap.color,
      activeFilterTab: snap.activeFilterTab,
    });
    console.log("modelCustomization:", modelCustomization);
    console.groupEnd();
  }, [snap.selectedModel, snap.color, snap.activeFilterTab, modelCustomization]);

  // Determine patterns/decals (prefer modelCustomization, else fallback to snap)
  const patternCenter = modelCustomization.patternCenter ?? snap.modelCustomizations?.[snap.selectedModel]?.patternCenter ?? null;
  const patternFull = modelCustomization.patternFull ?? snap.modelCustomizations?.[snap.selectedModel]?.patternFull ?? null;
  const patternLeft = modelCustomization.patternLeft ?? snap.modelCustomizations?.[snap.selectedModel]?.patternLeft ?? null;
  const patternRight = modelCustomization.patternRight ?? snap.modelCustomizations?.[snap.selectedModel]?.patternRight ?? null;

  const isLogoTexture = (modelCustomization.isLogoTexture ?? snap.isLogoTexture) === true;
  const isFullTexture = (modelCustomization.isFullTexture ?? snap.isFullTexture) === true;
  const isLogoLeftTexture = (modelCustomization.isLogoLeftTexture ?? snap.isLogoLeftTexture) === true;
  const isLogoRightTexture = (modelCustomization.isLogoRightTexture ?? snap.isLogoRightTexture) === true;

  const logoDecal = modelCustomization.logoDecal ?? snap.logoDecal ?? null;
  const fullDecal = modelCustomization.fullDecal ?? snap.fullDecal ?? null;
  const logoLeftDecal = modelCustomization.logoLeftDecal ?? snap.logoLeftDecal ?? null;
  const logoRightDecal = modelCustomization.logoRightDecal ?? snap.logoRightDecal ?? null;

  // IMPORTANT: call hooks unconditionally and in same order
  const logoTexture = useTexture(logoDecal || "/threejs.png");
  const fullTexture = useTexture(fullDecal || "/threejs.png");
  const logoLeftTexture = useTexture(logoLeftDecal || "/threejs.png");
  const logoRightTexture = useTexture(logoRightDecal || "/threejs.png");
  const patternCenterTex = useTexture(patternCenter || "/threejs.png");
  const patternFullTex = useTexture(patternFull || "/threejs.png");
  const patternLeftTex = useTexture(patternLeft || "/threejs.png");
  const patternRightTex = useTexture(patternRight || "/threejs.png");

  // Validate textures and log useful info
  useEffect(() => {
    try {
      console.groupCollapsed("[SleeveModel] Textures info");
      console.log("logoDecal:", logoDecal);
      console.log("fullDecal:", fullDecal);
      console.log("logoLeftDecal:", logoLeftDecal);
      console.log("logoRightDecal:", logoRightDecal);
      console.log("patternCenter:", patternCenter);
      console.log("patternFull:", patternFull);
      console.log("patternLeft:", patternLeft);
      console.log("patternRight:", patternRight);

      console.log("logoTexture:", fmtTexInfo(logoTexture));
      console.log("fullTexture:", fmtTexInfo(fullTexture));
      console.log("logoLeftTexture:", fmtTexInfo(logoLeftTexture));
      console.log("logoRightTexture:", fmtTexInfo(logoRightTexture));
      console.log("patternCenterTex:", fmtTexInfo(patternCenterTex));
      console.log("patternFullTex:", fmtTexInfo(patternFullTex));
      console.log("patternLeftTex:", fmtTexInfo(patternLeftTex));
      console.log("patternRightTex:", fmtTexInfo(patternRightTex));
      console.groupEnd();
    } catch (err) {
      console.error("[SleeveModel] texture validation error:", err);
    }
  }, [
    logoDecal,
    fullDecal,
    logoLeftDecal,
    logoRightDecal,
    patternCenter,
    patternFull,
    patternLeft,
    patternRight,
    logoTexture,
    fullTexture,
    logoLeftTexture,
    logoRightTexture,
    patternCenterTex,
    patternFullTex,
    patternLeftTex,
    patternRightTex,
  ]);

  // Ensure textures are using correct settings
  useMemo(() => {
    try {
      [
        logoTexture,
        fullTexture,
        logoLeftTexture,
        logoRightTexture,
        patternCenterTex,
        patternFullTex,
        patternLeftTex,
        patternRightTex,
      ].forEach((tex) => {
        if (tex && tex instanceof THREE.Texture) {
          try { tex.encoding = THREE.sRGBEncoding; } catch {}
          tex.flipY = false;
          tex.anisotropy = Math.max(tex.anisotropy || 1, 8);
          tex.needsUpdate = true;
        }
      });
    } catch (err) {
      console.error("[SleeveModel] texture optimization error:", err);
    }
  }, [
    logoTexture,
    fullTexture,
    logoLeftTexture,
    logoRightTexture,
    patternCenterTex,
    patternFullTex,
    patternLeftTex,
    patternRightTex,
  ]);

  // Color animation (per-part or global)
  useFrame((_, delta) => {
    if (!materials) return;
    try {
      materialNames.forEach((materialName) => {
        const material = materials[materialName];
        if (material?.color) {
          const targetColor =
            snap.modelCustomizations?.[snap.selectedModel]?.partColors?.[materialName] ||
            snap.color;
          easing.dampC(material.color, targetColor, 0.25, delta);
        }
      });
    } catch (err) {
      console.error("[SleeveModel] color animation error:", err);
    }
  });

  const existingMaterials = materialNames.filter((name) => !!materials[name]);
  if (!existingMaterials.length) {
    console.warn("[SleeveModel] No matching materials found among:", materialNames, "available:", Object.keys(materials));
  } else {
    console.debug("[SleeveModel] existingMaterials:", existingMaterials);
  }

  // Helper: check if any part was marked selected by Customizer
  const partsForModel = state.modelParts?.[snap.selectedModel] || [];
  const anyPartSelected = Array.isArray(partsForModel) && partsForModel.some((p) => p.selected === true);

  return (
    <group
      {...props}
      dispose={null}
      scale={0.0009}
      position={[0, -1.2, 0]}
      rotation={[-Math.PI / 2, 0, 0]}
    >
      {existingMaterials.map((materialName) => {
        // defensive rendering per material with try/catch so a single bad part doesn't break the whole model
        return (() => {
          try {
            const material = materials[materialName];
            const node = nodes[materialName] || Object.values(nodes).find((n) => n.material === material);

            if (!node || !node.geometry) {
              console.warn(`[SleeveModel] missing node or geometry for material: ${materialName}`);
              return null;
            }

            // bbox and decal computations
            const geom = node.geometry;
            if (!geom.boundingBox) geom.computeBoundingBox();
            const bbox = geom.boundingBox;
            const center = new THREE.Vector3();
            const size = new THREE.Vector3();
            bbox.getCenter(center);
            bbox.getSize(size);

            const outward = new THREE.Vector3(0, 0, 1).multiplyScalar((size.z || 0.01) * 0.5 + 0.001);
            const decalCenterPos = [center.x + outward.x, center.y + outward.y, center.z + outward.z];
            const decalScale = Math.max(size.x || 0.01, size.y || 0.01) * (snap.logoCenterScale || 1);

            // Decide what to apply for this mesh
            const applyFullToMesh = isFullTexture || (!anyPartSelected && !!patternFull);
            const willApplyCenter = materialName.includes("Front_") && isLogoTexture && !!logoDecal;
            const willApplyCenterPattern = materialName.includes("Front_") && isLogoTexture && !!patternCenter;
            const willApplyLeft = materialName.includes("Left_") && (isLogoLeftTexture || (!anyPartSelected && (logoLeftDecal || patternLeft)));
            const willApplyRight = materialName.includes("Right_") && (isLogoRightTexture || (!anyPartSelected && (logoRightDecal || patternRight)));

            // Debug group per material
            console.groupCollapsed(`[SleeveModel] material=${materialName}`);
            console.log("node present:", !!node);
            console.log("bbox center/size:", center.toArray(), size.toArray());
            console.log("decalCenterPos:", decalCenterPos);
            console.log("decalScale:", decalScale);
            console.log("applyFullToMesh:", applyFullToMesh);
            console.log("willApplyCenter:", willApplyCenter, "willApplyCenterPattern:", willApplyCenterPattern);
            console.log("willApplyLeft:", willApplyLeft);
            console.log("willApplyRight:", willApplyRight);
            console.log("anyPartSelected:", anyPartSelected);
            console.log("textures:", {
              logo: fmtTexInfo(logoTexture),
              full: fmtTexInfo(fullTexture),
              patternFull: fmtTexInfo(patternFullTex),
              centerPattern: fmtTexInfo(patternCenterTex),
              leftPattern: fmtTexInfo(patternLeftTex),
              rightPattern: fmtTexInfo(patternRightTex),
            });
            console.groupEnd();

            return (
              <mesh
                key={materialName}
                castShadow
                receiveShadow
                geometry={node.geometry}
                material={material}
                material-roughness={1}
                dispose={null}
              >
                {/* FULL TEXTURE for whole mesh */}
                {applyFullToMesh && fullDecal && (
                  <Decal
                    position={[0, 0, 0]}
                    rotation={[0, 0, 0]}
                    scale={1}
                    map={fullTexture}
                    transparent
                    toneMapped={false}
                    depthTest
                    depthWrite={false}
                    polygonOffset
                    polygonOffsetFactor={-1}
                  />
                )}

                {applyFullToMesh && patternFull && (
                  <Decal
                    position={[0, 0, 0]}
                    rotation={[0, 0, 0]}
                    scale={1}
                    map={patternFullTex}
                    transparent
                    toneMapped={false}
                    depthTest
                    depthWrite={false}
                    polygonOffset
                    polygonOffsetFactor={-1}
                  />
                )}

                {/* CENTER LOGO & PATTERN (front parts) */}
                {willApplyCenter && (
                  <Decal
                    position={snap.logoCenterPosition || decalCenterPos}
                    rotation={snap.logoCenterRotation || [0, 0, 0]}
                    scale={snap.logoCenterScale ? Math.max(0.00001, decalScale * snap.logoCenterScale) : Math.max(0.00001, decalScale)}
                    map={logoTexture}
                    transparent
                    toneMapped={false}
                    depthTest
                    depthWrite={false}
                    polygonOffset
                    polygonOffsetFactor={-1}
                  />
                )}

                {willApplyCenterPattern && (
                  <Decal
                    position={snap.logoCenterPosition || decalCenterPos}
                    rotation={snap.logoCenterRotation || [0, 0, 0]}
                    scale={snap.logoCenterScale ? Math.max(0.00001, decalScale * snap.logoCenterScale) : Math.max(0.00001, decalScale)}
                    map={patternCenterTex}
                    transparent
                    toneMapped={false}
                    depthTest
                    depthWrite={false}
                    polygonOffset
                    polygonOffsetFactor={-1}
                  />
                )}

                {/* LEFT LOGO / PATTERN */}
                {willApplyLeft && logoLeftDecal && (
                  <Decal
                    position={snap.logoLeftPosition || [0, 0, 0.15]}
                    rotation={[0, 0, 0]}
                    scale={snap.logoLeftScale || 0.2}
                    map={logoLeftTexture}
                    transparent
                    toneMapped={false}
                    depthTest
                    depthWrite={false}
                    polygonOffset
                    polygonOffsetFactor={-1}
                  />
                )}

                {willApplyLeft && patternLeft && (
                  <Decal
                    position={snap.logoLeftPosition || [0, 0, 0.15]}
                    rotation={[0, 0, 0]}
                    scale={snap.logoLeftScale || 0.2}
                    map={patternLeftTex}
                    transparent
                    toneMapped={false}
                    depthTest
                    depthWrite={false}
                    polygonOffset
                    polygonOffsetFactor={-1}
                  />
                )}

                {/* RIGHT LOGO / PATTERN */}
                {willApplyRight && logoRightDecal && (
                  <Decal
                    position={snap.logoRightPosition || [0, 0, 0.15]}
                    rotation={[0, 0, 0]}
                    scale={snap.logoRightScale || 0.2}
                    map={logoRightTexture}
                    transparent
                    toneMapped={false}
                    depthTest
                    depthWrite={false}
                    polygonOffset
                    polygonOffsetFactor={-1}
                  />
                )}

                {willApplyRight && patternRight && (
                  <Decal
                    position={snap.logoRightPosition || [0, 0, 0.15]}
                    rotation={[0, 0, 0]}
                    scale={snap.logoRightScale || 0.2}
                    map={patternRightTex}
                    transparent
                    toneMapped={false}
                    depthTest
                    depthWrite={false}
                    polygonOffset
                    polygonOffsetFactor={-1}
                  />
                )}

                {/* TEXT DECALS (Front only) */}
                {materialName.includes("Front_") &&
                  Array.isArray(snap.textElements) &&
                  snap.textElements.map((textElement) => {
                    const textTexture = useMemo(() => createTextTexture(textElement), [textElement]);
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
                        depthTest
                        depthWrite={false}
                        polygonOffset
                        polygonOffsetFactor={-1}
                      />
                    );
                  })}
              </mesh>
            );
          } catch (err) {
            console.error(`[SleeveModel] render error for material ${materialName}:`, err);
            return null;
          }
        })();
      })}
    </group>
  );
}

useGLTF.preload("/t-shirt_-_lengan_panjang.glb");
export default SleeveModel;
