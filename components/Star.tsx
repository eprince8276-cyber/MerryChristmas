
import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Sparkles, Float } from '@react-three/drei';
import * as THREE from 'three';

interface StarProps {
  position: [number, number, number];
  isChaos: boolean;
}

const Star: React.FC<StarProps> = ({ position, isChaos }) => {
  const starRef = useRef<THREE.Mesh>(null);
  const glowRef = useRef<THREE.PointLight>(null);
  const starMaterialRef = useRef<THREE.MeshStandardMaterial>(null);
  const transitionRef = useRef({ factor: 0 });

  const treePos = useMemo(() => new THREE.Vector3(...position), [position]);
  const chaosPos = useMemo(() => new THREE.Vector3(0, 5, 0), []);

  const starShape = useMemo(() => {
    const shape = new THREE.Shape();
    const points = 5;
    const outerRadius = 0.85;
    const innerRadius = 0.35;
    
    for (let i = 0; i < points * 2; i++) {
      const radius = i % 2 === 0 ? outerRadius : innerRadius;
      const angle = (i / (points * 2)) * Math.PI * 2 - Math.PI / 2;
      const x = Math.cos(angle) * radius;
      const y = Math.sin(angle) * radius;
      if (i === 0) shape.moveTo(x, y);
      else shape.lineTo(x, y);
    }
    shape.closePath();
    return shape;
  }, []);

  const extrudeSettings = {
    steps: 1,
    depth: 0.15,
    bevelEnabled: true,
    bevelThickness: 0.08,
    bevelSize: 0.08,
    bevelOffset: 0,
    bevelSegments: 4
  };

  const color1 = useMemo(() => new THREE.Color('#FFD700'), []);
  const color2 = useMemo(() => new THREE.Color('#FFA500'), []);
  const color3 = useMemo(() => new THREE.Color('#FFFACD'), []);

  useFrame((state, delta) => {
    const time = state.clock.getElapsedTime();
    const targetFactor = isChaos ? 1 : 0;
    transitionRef.current.factor = THREE.MathUtils.lerp(transitionRef.current.factor, targetFactor, delta * 2);
    const t = transitionRef.current.factor;

    if (starRef.current) {
      starRef.current.position.lerpVectors(treePos, chaosPos, t);
      starRef.current.rotation.y = time * 0.8;
      starRef.current.rotation.x = Math.PI;
      
      const pulse = 1 + Math.sin(time * 3) * 0.05;
      starRef.current.scale.set(pulse, pulse, pulse);
    }

    if (glowRef.current) {
      glowRef.current.intensity = (4 + Math.sin(time * 2) * 2) * (1 - t * 0.5);
      const cycle = (time * 0.2) % 1; 
      let targetColor;
      if (cycle < 0.33) {
        targetColor = color1.clone().lerp(color2, cycle * 3);
      } else if (cycle < 0.66) {
        targetColor = color2.clone().lerp(color3, (cycle - 0.33) * 3);
      } else {
        targetColor = color3.clone().lerp(color1, (cycle - 0.66) * 3);
      }
      
      glowRef.current.color.copy(targetColor);
      if (starMaterialRef.current) {
        starMaterialRef.current.emissive.copy(targetColor);
        starMaterialRef.current.emissiveIntensity = 2 + Math.sin(time * 2) * 1.5;
      }
    }
  });

  return (
    <group>
      <Float speed={3} rotationIntensity={0.5} floatIntensity={0.5}>
        <mesh ref={starRef}>
          <extrudeGeometry args={[starShape, extrudeSettings]} />
          <meshStandardMaterial 
            ref={starMaterialRef}
            color="#FFD700"
            emissive="#FFD700" 
            emissiveIntensity={2} 
            metalness={1} 
            roughness={0.1} 
          />
        </mesh>
      </Float>

      <pointLight ref={glowRef} intensity={5} distance={25} color="#FFD700" />
      
      <Sparkles 
        count={60} 
        scale={[3, 3, 3]} 
        size={5} 
        speed={0.8} 
        color="#FFD700" 
        noise={2} 
      />
    </group>
  );
};

export default Star;
