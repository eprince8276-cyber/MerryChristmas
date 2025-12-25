
import React, { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

const TETRA_COUNT = 1000;

interface RibbonProps {
  isChaos: boolean;
}

const Ribbon: React.FC<RibbonProps> = ({ isChaos }) => {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const tempObject = useMemo(() => new THREE.Object3D(), []);
  const transitionRef = useRef({ factor: 0 });

  const pathData = useMemo(() => {
    const data = [];
    const turns = 3.5;
    const topY = 9.5;
    const bottomY = -10;
    const totalHeight = topY - bottomY;
    
    const getChaosPos = (radius: number) => {
      const phi = Math.random() * Math.PI * 2;
      const theta = Math.acos(2 * Math.random() - 1);
      const r = radius * Math.pow(Math.random(), 0.5);
      return new THREE.Vector3(
        r * Math.sin(theta) * Math.cos(phi),
        r * Math.sin(theta) * Math.sin(phi),
        r * Math.cos(theta)
      );
    };

    for (let i = 0; i < TETRA_COUNT; i++) {
      const t = i / TETRA_COUNT;
      const y = bottomY + t * totalHeight;
      
      let treeRadius = 0;
      if (y > 0) {
        const ratio = 1 - (y / 10);
        treeRadius = ratio * 4.5;
      } else {
        const ratio = Math.abs(y) / 8;
        treeRadius = 4.5 + ratio * 2;
      }

      const distanceOffset = 1.0 + Math.sin(t * Math.PI * 10) * 0.2;
      const radius = treeRadius + distanceOffset;
      const angle = t * Math.PI * 2 * turns;
      
      data.push({
        baseAngle: angle,
        radius: radius,
        treeY: y,
        chaosPos: getChaosPos(18),
        phase: Math.random() * Math.PI * 2,
        scale: 0.03 + Math.random() * 0.05,
        speed: 0.5 + Math.random() * 1.5
      });
    }
    return data;
  }, []);

  useFrame((state, delta) => {
    const targetFactor = isChaos ? 1 : 0;
    transitionRef.current.factor = THREE.MathUtils.lerp(transitionRef.current.factor, targetFactor, delta * 2.5);
    const tFact = transitionRef.current.factor;

    if (meshRef.current) {
      const time = state.clock.getElapsedTime();
      const globalRotationSpeed = time * 0.2;

      pathData.forEach((point, i) => {
        const { radius, treeY, chaosPos, baseAngle, phase, scale, speed } = point;
        
        const currentAngle = baseAngle + globalRotationSpeed + Math.sin(time * 0.5 + phase) * 0.1;
        
        const drift = new THREE.Vector3(
          Math.sin(time * speed + phase) * 0.15,
          Math.cos(time * speed + phase) * 0.15,
          Math.cos(time * speed + phase) * 0.15
        );

        const spiralPos = new THREE.Vector3(
          Math.cos(currentAngle) * radius,
          treeY,
          Math.sin(currentAngle) * radius
        );

        tempObject.position.lerpVectors(spiralPos, chaosPos, tFact).add(drift);
        
        tempObject.rotation.set(time * 2 + i, time * 1.5, phase);
        const pulse = scale * (1 + Math.sin(time * 3 + phase) * 0.3);
        tempObject.scale.setScalar(pulse);
        
        tempObject.updateMatrix();
        meshRef.current!.setMatrixAt(i, tempObject.matrix);
      });
      meshRef.current.instanceMatrix.needsUpdate = true;
    }
  });

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, TETRA_COUNT]}>
      <tetrahedronGeometry args={[1, 0]} />
      <meshStandardMaterial 
        color="#FFD700"
        emissive="#FFA500"
        emissiveIntensity={1.2}
        metalness={1}
        roughness={0.1}
      />
    </instancedMesh>
  );
};

export default Ribbon;
