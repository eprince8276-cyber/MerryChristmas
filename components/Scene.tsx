
import React, { useRef, useState, useCallback } from 'react';
import { useFrame } from '@react-three/fiber';
import { Bloom, EffectComposer, Noise, Vignette, ChromaticAberration } from '@react-three/postprocessing';
import * as THREE from 'three';
import ChristmasTree from './ChristmasTree';
import Star from './Star';
import Ribbon from './Ribbon';
import Snow from './Snow';

const Scene: React.FC = () => {
  const groupRef = useRef<THREE.Group>(null);
  const [isChaos, setIsChaos] = useState(false);

  // Toggle chaos state on click
  const handlePointerDown = useCallback((e: any) => {
    // Only toggle if we're not dragging significantly (OrbitControls compatibility)
    setIsChaos(prev => !prev);
  }, []);

  useFrame((state) => {
    if (groupRef.current) {
      // Gentle floating animation for the whole group
      groupRef.current.position.y = Math.sin(state.clock.elapsedTime * 0.4) * 0.3;
    }
  });

  return (
    <>
      {/* Lighting */}
      <ambientLight intensity={0.2} />
      <spotLight 
        position={[15, 25, 10]} 
        angle={0.4} 
        penumbra={1} 
        intensity={3} 
        castShadow 
        color="#FF1493"
      />
      <pointLight position={[-15, -10, -10]} intensity={1.5} color="#FF69B4" />
      <pointLight position={[0, 15, 0]} intensity={1} color="#FFFFFF" />
      <pointLight position={[5, -5, 5]} intensity={1} color="#8A2BE2" />

      {/* Invisible plane to capture clicks globally in 3D space if needed, 
          or just rely on the objects. Adding a large invisible mesh for better UX. */}
      <mesh 
        position={[0, 0, -5]} 
        onPointerDown={handlePointerDown}
        visible={false}
      >
        <planeGeometry args={[100, 100]} />
      </mesh>

      <group ref={groupRef}>
        {/* The Main Tree Body with chaos support */}
        <ChristmasTree isChaos={isChaos} />
        
        {/* The Star on top with dynamic lighting */}
        <Star position={[0, 9.5, 0]} isChaos={isChaos} />

        {/* The Spiral Ribbon with chaos support */}
        <Ribbon isChaos={isChaos} />
      </group>

      {/* Falling Snow Particles */}
      <Snow count={1200} />

      {/* Post Processing */}
      <EffectComposer disableNormalPass>
        <Bloom 
          luminanceThreshold={0.25} 
          mipmapBlur 
          intensity={1.5} 
          radius={0.4}
        />
        <ChromaticAberration offset={new THREE.Vector2(0.0006, 0.0006)} />
        <Noise opacity={0.05} />
        <Vignette eskil={false} offset={0.1} darkness={1.1} />
      </EffectComposer>
    </>
  );
};

export default Scene;
