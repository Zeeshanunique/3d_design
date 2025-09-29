import React, { useRef } from 'react'
import { useGLTF } from '@react-three/drei'

export function LongModel(props) {
  const { nodes, materials } = useGLTF('/t-shirt_-_lengan_panjang.glb')
  return (
    <group {...props} dispose={null}>
      <group scale={0.0009}  position={[0, -1.2, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <mesh
          castShadow
          receiveShadow
          geometry={nodes.Object_2.geometry}
          material={materials.Back_FRONT_2239}
        />
        <mesh
          castShadow
          receiveShadow
          geometry={nodes.Object_3.geometry}
          material={materials.Collar_FRONT_2229}
        />
        <mesh
          castShadow
          receiveShadow
          geometry={nodes.Object_4.geometry}
          material={materials.Front_FRONT_2234}
        />
        <mesh
          castShadow
          receiveShadow
          geometry={nodes.Object_5.geometry}
          material={materials.Lower_Left_FRONT_2224}
        />
        <mesh
          castShadow
          receiveShadow
          geometry={nodes.Object_6.geometry}
          material={materials.Lower_Right_FRONT_2214}
        />
        <mesh
          castShadow
          receiveShadow
          geometry={nodes.Object_7.geometry}
          material={materials.Upper_Left_FRONT_2219}
        />
        <mesh
          castShadow
          receiveShadow
          geometry={nodes.Object_8.geometry}
          material={materials.Upper_Right_FRONT_2209}
        />
      </group>
    </group>
  )
}

useGLTF.preload('/t-shirt_-_lengan_panjang.glb')
