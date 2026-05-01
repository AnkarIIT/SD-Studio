import React, { useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Float, MeshDistortMaterial, PerspectiveCamera } from '@react-three/drei';
import * as THREE from 'three';

const DragonModel = () => {
  const group = useRef<THREE.Group>(null);
  
  // Basic animation
  useFrame((state) => {
    if (group.current) {
      group.current.rotation.y = Math.sin(state.clock.getElapsedTime() * 0.5) * 0.2;
      group.current.position.y = Math.sin(state.clock.getElapsedTime() * 1.5) * 0.1;
    }
  });

  return (
    <group ref={group} scale={[1.2, 1.2, 1.2]}>
      {/* Body */}
      <mesh position={[0, 0, 0]} castShadow>
        <capsuleGeometry args={[0.5, 1, 4, 16]} />
        <meshStandardMaterial color="#f8f8f8" roughness={0.3} metalness={0.1} />
      </mesh>
      
      {/* Head */}
      <mesh position={[0, 1, 0.4]} castShadow>
        <sphereGeometry args={[0.4, 32, 32]} />
        <meshStandardMaterial color="#f8f8f8" roughness={0.3} />
      </mesh>
      
      {/* Snout */}
      <mesh position={[0, 0.9, 0.8]} castShadow>
        <boxGeometry args={[0.3, 0.2, 0.4]} />
        <meshStandardMaterial color="#f8f8f8" roughness={0.3} />
      </mesh>

      {/* Eyes */}
      <mesh position={[0.15, 1.1, 0.7]} castShadow>
        <sphereGeometry args={[0.05, 16, 16]} />
        <meshStandardMaterial color="#111" />
      </mesh>
      <mesh position={[-0.15, 1.1, 0.7]} castShadow>
        <sphereGeometry args={[0.05, 16, 16]} />
        <meshStandardMaterial color="#111" />
      </mesh>

      {/* Horns */}
      <mesh position={[0.15, 1.4, 0.3]} rotation={[0.5, 0, 0]} castShadow>
        <coneGeometry args={[0.05, 0.3, 16]} />
        <meshStandardMaterial color="#eee" />
      </mesh>
      <mesh position={[-0.15, 1.4, 0.3]} rotation={[0.5, 0, 0]} castShadow>
        <coneGeometry args={[0.05, 0.3, 16]} />
        <meshStandardMaterial color="#eee" />
      </mesh>

      {/* Tail */}
      <mesh position={[0, -0.6, -0.6]} rotation={[-1, 0, 0]} castShadow>
        <coneGeometry args={[0.2, 1, 16]} />
        <meshStandardMaterial color="#f8f8f8" roughness={0.3} />
      </mesh>

      {/* Spikes along back */}
      {[...Array(5)].map((_, i) => (
        <mesh key={i} position={[0, 0.8 - i * 0.4, -0.3]} rotation={[-0.5, 0, 0]} castShadow>
          <coneGeometry args={[0.1, 0.2, 4]} />
          <meshStandardMaterial color="#eee" />
        </mesh>
      ))}

      {/* Wings */}
      <mesh position={[0.6, 0.4, -0.2]} rotation={[0, -0.5, 0.5]} castShadow>
        <boxGeometry args={[0.8, 0.05, 0.4]} />
        <meshStandardMaterial color="#f0f0f0" />
      </mesh>
      <mesh position={[-0.6, 0.4, -0.2]} rotation={[0, 0.5, -0.5]} castShadow>
        <boxGeometry args={[0.8, 0.05, 0.4]} />
        <meshStandardMaterial color="#f0f0f0" />
      </mesh>
    </group>
  );
};

const InteractiveDragon = () => {
  return (
    <div className="w-full h-full min-h-[400px] cursor-grab active:cursor-grabbing">
      <Canvas shadows>
        <PerspectiveCamera makeDefault position={[0, 1, 4]} />
        <ambientLight intensity={0.8} />
        <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} intensity={1} castShadow />
        <pointLight position={[-10, -10, -10]} intensity={0.5} />
        
        <Float speed={2} rotationIntensity={0.5} floatIntensity={0.5}>
          <DragonModel />
        </Float>
        
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1.2, 0]} receiveShadow>
          <planeGeometry args={[10, 10]} />
          <meshStandardMaterial color="#f9fafb" />
        </mesh>

        <OrbitControls 
          enableZoom={false} 
          minPolarAngle={Math.PI / 4} 
          maxPolarAngle={Math.PI / 1.5}
          autoRotate
          autoRotateSpeed={0.5}
        />
      </Canvas>
    </div>
  );
};

export default InteractiveDragon;
