
import React, { useRef } from 'react'
import { useGLTF } from '@react-three/drei'

export function WomenModel(props) {
  const { nodes, materials } = useGLTF('/white_grace.glb')
  return (
    <group {...props} dispose={null}>
      <group scale={0.0006}  position={[0, -0.3, 0]} >
        <mesh
          castShadow
          receiveShadow
          geometry={nodes.Pattern_5947_0.geometry}
          material={materials.Unified_Material_575185}
        />
        <mesh
          castShadow
          receiveShadow
          geometry={nodes.Pattern_49271_0.geometry}
          material={materials.Unified_Material_575185}
        />
        <mesh
          castShadow
          receiveShadow
          geometry={nodes.Pattern_56511_0.geometry}
          material={materials.Unified_Material_575185}
        />
        <mesh
          castShadow
          receiveShadow
          geometry={nodes.Pattern_78981_0.geometry}
          material={materials.Unified_Material_575185}
        />
        <mesh
          castShadow
          receiveShadow
          geometry={nodes.Pattern_81858_0.geometry}
          material={materials.Unified_Material_575185}
        />
        <mesh
          castShadow
          receiveShadow
          geometry={nodes.Pattern_118342_0.geometry}
          material={materials.Unified_Material_575185}
        />
        <mesh
          castShadow
          receiveShadow
          geometry={nodes.Pattern_118342_0_1.geometry}
          material={materials.Unified_Material_575185}
        />
        <mesh
          castShadow
          receiveShadow
          geometry={nodes.Pattern_130160_0.geometry}
          material={materials.Unified_Material_575185}
        />
        <mesh
          castShadow
          receiveShadow
          geometry={nodes.Pattern_130160_0_1.geometry}
          material={materials.Unified_Material_575185}
        />
        <mesh
          castShadow
          receiveShadow
          geometry={nodes.Pattern_352561_0.geometry}
          material={materials.Unified_Material_575185}
        />
        <mesh
          castShadow
          receiveShadow
          geometry={nodes.Pattern_525393_0.geometry}
          material={materials.Unified_Material_575185}
        />
        <mesh
          castShadow
          receiveShadow
          geometry={nodes.Pattern_525393_0_1.geometry}
          material={materials.Unified_Material_575185}
        />
        <mesh
          castShadow
          receiveShadow
          geometry={nodes.Pattern_531516_0.geometry}
          material={materials.Unified_Material_575185}
        />
        <mesh
          castShadow
          receiveShadow
          geometry={nodes.Pattern_531516_0_1.geometry}
          material={materials.Unified_Material_575185}
        />
        <mesh
          castShadow
          receiveShadow
          geometry={nodes.Pattern_10922_0.geometry}
          material={materials.Unified_Material_575185}
        />
      </group>
    </group>
  )
}

useGLTF.preload('/white_grace.glb')
