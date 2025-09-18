import React, { useEffect, useRef } from "react";
import * as THREE from "three";

const AutoFitModel = ({ children, targetSize = 2, ...props }) => {
  const groupRef = useRef();

  useEffect(() => {
    if (!groupRef.current) return;

    // Collect all meshes from children
    const meshes = [];
    groupRef.current.traverse((child) => {
      if (child.isMesh) meshes.push(child);
    });

    if (meshes.length === 0) return;

    // Compute bounding box of actual geometry
    const box = new THREE.Box3();
    meshes.forEach((mesh) => box.expandByObject(mesh));

    const size = new THREE.Vector3();
    box.getSize(size);
    const center = new THREE.Vector3();
    box.getCenter(center);

    const maxDim = Math.max(size.x, size.y, size.z);
    const scale = targetSize / maxDim;

    // Center and scale only the meshes
    meshes.forEach((mesh) => {
      mesh.geometry.translate(-center.x, -center.y, -center.z);
    });

    groupRef.current.scale.set(scale, scale, scale);

    console.log("AutoFitModel:", "scale =", scale, "center =", center);
  }, [children, targetSize]);

  return <group ref={groupRef} {...props}>{children}</group>;
};

export default AutoFitModel;
