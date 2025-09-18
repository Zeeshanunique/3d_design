// src/models/JacketModel.jsx
import React from "react";
import { useGLTF } from "@react-three/drei";
import AutoFitModel from "../../components/AutoFitModel";



// ---------------- Adidas Jacket ----------------
export function AdidasJacket({ color = "#ffffff", ...props }) {
  const { nodes, materials } = useGLTF("/adidas_jacket.glb");

  // Clone material to avoid modifying original GLB material
  const jacketMaterial = materials.Jacket.clone();
  jacketMaterial.color.set(color);

  return (
    <AutoFitModel {...props}>
      <group dispose={null} >
        <group rotation={[-Math.PI / 2, 0, 0]}>
          <group rotation={[Math.PI / 2, 0, 0]}>
            <mesh geometry={nodes.defaultMaterial.geometry} material={jacketMaterial} />
            <mesh geometry={nodes.defaultMaterial_1.geometry} material={jacketMaterial} />
            <mesh geometry={nodes.defaultMaterial_2.geometry} material={jacketMaterial} />
          </group>
        </group>
      </group>
    </AutoFitModel>
  );
}
useGLTF.preload("/adidas_jacket.glb");


// ---------------- Men's Jacket ----------------
export function JacketMen(props) {
  const { nodes, materials } = useGLTF("/men_jacket_baked.glb");

  return (
    <AutoFitModel  {...props}>
      <mesh geometry={nodes.Object_5.geometry} material={materials.Muslin_32X38_FRONT_6164} />
      <mesh geometry={nodes.Object_6.geometry} material={materials.Muslin_32X38_FRONT_6164} />
      <mesh geometry={nodes.Object_7.geometry} material={materials.Muslin_32X38_FRONT_6164} />
      <mesh geometry={nodes.Object_8.geometry} material={materials.Muslin_32X38_FRONT_6164} />
      <mesh geometry={nodes.Object_9.geometry} material={materials.Muslin_32X38_FRONT_6164} />
      <mesh geometry={nodes.Object_10.geometry} material={materials.Muslin_32X38_FRONT_6164} />
      <mesh geometry={nodes.Object_11.geometry} material={materials.Muslin_32X38_FRONT_6164} />
      <mesh geometry={nodes.Object_12.geometry} material={materials.Muslin_32X38_FRONT_6164} />

      <mesh geometry={nodes.Object_13.geometry} material={materials.Muslin_32X38_BACK_6164} />
      <mesh geometry={nodes.Object_14.geometry} material={materials.Muslin_32X38_BACK_6164} />
      <mesh geometry={nodes.Object_15.geometry} material={materials.Muslin_32X38_BACK_6164} />
      <mesh geometry={nodes.Object_16.geometry} material={materials.Muslin_32X38_BACK_6164} />

      <mesh geometry={nodes.Object_17.geometry} material={materials.Muslin_32X38_FRONT_81341} />
      <mesh geometry={nodes.Object_18.geometry} material={materials.Muslin_32X38_FRONT_81341} />
      <mesh geometry={nodes.Object_19.geometry} material={materials.Muslin_32X38_FRONT_81341} />

      <mesh geometry={nodes.Object_20.geometry} material={materials.Muslin_32X38_Copy_1_FRONT_128969} />
      <mesh geometry={nodes.Object_21.geometry} material={materials.Muslin_32X38_Copy_1_FRONT_128969} />
      <mesh geometry={nodes.Object_22.geometry} material={materials.Muslin_32X38_Copy_1_FRONT_128969} />
      <mesh geometry={nodes.Object_23.geometry} material={materials.Muslin_32X38_Copy_1_FRONT_128969} />
      <mesh geometry={nodes.Object_24.geometry} material={materials.Muslin_32X38_Copy_1_FRONT_128969} />
      <mesh geometry={nodes.Object_25.geometry} material={materials.Muslin_32X38_Copy_1_FRONT_128969} />

      <mesh geometry={nodes.Object_26.geometry} material={materials.Material128972} />
      <mesh geometry={nodes.Object_27.geometry} material={materials.Material128972} />
      <mesh geometry={nodes.Object_28.geometry} material={materials.Material128972} />
    </AutoFitModel>
  );
}
useGLTF.preload("/men_jacket_baked.glb");
