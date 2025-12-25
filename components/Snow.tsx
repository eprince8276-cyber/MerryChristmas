
import React, { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface SnowProps {
  count: number;
}

const Snow: React.FC<SnowProps> = ({ count = 1000 }) => {
  const meshRef = useRef<THREE.Points>(null);

  // Initialize particles with random positions and attributes
  const particles = useMemo(() => {
    const temp = [];
    for (let i = 0; i < count; i++) {
      const x = THREE.MathUtils.randFloatSpread(40);
      const y = THREE.MathUtils.randFloat(0, 30);
      const z = THREE.MathUtils.randFloatSpread(40);
      
      temp.push({
        position: new THREE.Vector3(x, y, z),
        speed: 0.02 + Math.random() * 0.05,
        drift: Math.random() * 0.02,
        phase: Math.random() * Math.PI * 2
      });
    }
    return temp;
  }, [count]);

  const positions = useMemo(() => {
    return new Float32Array(count * 3);
  }, [count]);

  useFrame((state) => {
    const time = state.clock.getElapsedTime();
    if (meshRef.current) {
      particles.forEach((p, i) => {
        // Fall down
        p.position.y -= p.speed;
        
        // Lateral drift using sine waves
        p.position.x += Math.sin(time + p.phase) * p.drift;
        p.position.z += Math.cos(time + p.phase) * p.drift;

        // Reset particle to top if it goes below a certain level
        if (p.position.y < -10) {
          p.position.y = 25;
          p.position.x = THREE.MathUtils.randFloatSpread(40);
          p.position.z = THREE.MathUtils.randFloatSpread(40);
        }

        positions[i * 3] = p.position.x;
        positions[i * 3 + 1] = p.position.y;
        positions[i * 3 + 2] = p.position.z;
      });
      
      meshRef.current.geometry.attributes.position.needsUpdate = true;
    }
  });

  return (
    <points ref={meshRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={count}
          array={positions}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.08}
        color="#FFFFFF"
        transparent
        opacity={0.6}
        sizeAttenuation={true}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
};

export default Snow;
