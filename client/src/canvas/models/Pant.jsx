import React from 'react';
import { useGLTF } from '@react-three/drei';

// Jeans Denim Model
// Jeans Denim Model
export function JeansDenim(props) {
  const { nodes, materials } = useGLTF('/jeans_denim_pants.glb');
  return (
    <group {...props} dispose={null}>
      {/* Adjust position and scale so it's consistent with PantBaked */}
      <group position={[0, -0.4, 0]} scale={0.0008} rotation={[-Math.PI / 2, 0, 0]}>
        <mesh
          castShadow
          receiveShadow
          geometry={nodes.Object_2.geometry}
          material={materials.BTN_FABRIC_FRONT_7363545}
        />
        <mesh
          castShadow
          receiveShadow
          geometry={nodes.Object_3.geometry}
          material={materials.BTN_FABRIC_FRONT_7363562}
        />
        <mesh
          castShadow
          receiveShadow
          geometry={nodes.Object_4.geometry}
          material={materials.Denim_Raw_FRONT_7645157}
        />
        <mesh
          castShadow
          receiveShadow
          geometry={nodes.Object_5.geometry}
          material={materials.Denim_Raw_FRONT_7645157}
        />
        <mesh
          castShadow
          receiveShadow
          geometry={nodes.Object_6.geometry}
          material={materials.Denim_Raw_FRONT_7645157}
        />
      </group>
    </group>
  );
}


// Pants Baked Model
export function PantBaked(props) {
  const { nodes, materials } = useGLTF('/pants_baked.glb');
  return (
    <group {...props} dispose={null}>
      <group position={[0, -0.5, 0]} scale={0.0008}>
        <mesh
          castShadow
          receiveShadow
          geometry={nodes.Object_4.geometry}
          material={materials.SSC_Grey_Sweatpants}
        />
        <mesh
          castShadow
          receiveShadow
          geometry={nodes.Object_5.geometry}
          material={materials.SSC_Grey_Sweatpants}
        />
      </group>
    </group>
  );
}

useGLTF.preload('/pants_baked.glb');
