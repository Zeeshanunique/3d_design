
import React, { useRef } from 'react'
import { useGLTF } from '@react-three/drei'

export function ShortModel(props) {
  const { nodes, materials } = useGLTF('/man_shorts.glb')
  return (
    <group {...props} dispose={null}>
      <group 
        scale={0.9}           // slightly smaller
        position={[0, -0.7, 0]} // move down a bit
      >
        <mesh
          castShadow
          receiveShadow
          geometry={nodes.Object_2.geometry}
          material={materials.defaultMat}
          rotation={[-Math.PI / 2, 0, 0]}
        />
      </group>
    </group>
  )
}

useGLTF.preload('/man_shorts.glb')



export function Shortpuff(props) {
  const { nodes, materials } = useGLTF('/orange_puff_shorts.glb')
  return (
    <group {...props} dispose={null}>
      <group scale={100}>
        <mesh
          castShadow
          receiveShadow
          geometry={nodes.AAA_Pants_edit_Tassle001_0.geometry}
          material={materials['Tassle.001']}
        />
        <mesh
          castShadow
          receiveShadow
          geometry={nodes.AAA_Pants_edit_Pants001_0.geometry}
          material={materials['Pants.001']}
        />
        <mesh
          castShadow
          receiveShadow
          geometry={nodes.AAA_Pants_edit_Material005_0.geometry}
          material={materials['Material.005']}
        />
      </group>
    </group>
  )
}

useGLTF.preload('/orange_puff_shorts.glb')
