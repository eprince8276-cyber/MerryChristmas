
import React, { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

const LEAF_COUNT = 4500;
const GIFT_COUNT = 200;
const BALL_COUNT = 350;

interface ChristmasTreeProps {
  isChaos: boolean;
}

const ChristmasTree: React.FC<ChristmasTreeProps> = ({ isChaos }) => {
  const leafRef = useRef<THREE.InstancedMesh>(null);
  const giftRef = useRef<THREE.InstancedMesh>(null);
  const ballRef = useRef<THREE.InstancedMesh>(null);
  const tempObject = useMemo(() => new THREE.Object3D(), []);
  
  // Track the transition factor per component
  const transitionRef = useRef({ factor: 0 });

  // Helper for spherical distribution
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

  const leafData = useMemo(() => {
    const data = [];
    const colorTop = new THREE.Color('#FFB7C5');
    const colorBottom = new THREE.Color('#FF1493');

    for (let i = 0; i < LEAF_COUNT; i++) {
      const y = Math.random() * 18 - 8;
      let r = 0;
      let scatter = 0;
      
      if (y > 0) {
        const ratio = 1 - (y / 10);
        r = ratio * 4.5;
        scatter = Math.pow(ratio, 2) * 1.5;
      } else {
        const ratio = Math.abs(y) / 8;
        r = 4.5 + ratio * 2;
        scatter = 1.5 + ratio * 8; 
      }
      
      const theta = Math.random() * Math.PI * 2;
      const finalR = r + (Math.random() - 0.5) * scatter;
      const colorRatio = (y + 8) / 18;
      const color = colorBottom.clone().lerp(colorTop, colorRatio);

      data.push({
        treePos: new THREE.Vector3(Math.cos(theta) * finalR, y - 1.2, Math.sin(theta) * finalR),
        chaosPos: getChaosPos(15),
        rotation: new THREE.Euler(Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI),
        scale: 0.05 + Math.random() * 0.12,
        color: color,
        speed: 0.04 + Math.random() * 0.08
      });
    }
    return data;
  }, []);

  const giftData = useMemo(() => {
    const data = [];
    for (let i = 0; i < GIFT_COUNT; i++) {
      const y = Math.random() * 15 - 6;
      const ratio = y > 0 ? 1 - (y / 10) : 1.1;
      const r = (y > 0 ? ratio * 4.0 : 4.4) + Math.random() * 0.4;
      const theta = Math.random() * Math.PI * 2;
      data.push({
        treePos: new THREE.Vector3(Math.cos(theta) * r, y - 1.2, Math.sin(theta) * r),
        chaosPos: getChaosPos(15),
        scale: 0.12 + Math.random() * 0.18,
        rotation: new THREE.Euler(Math.random(), Math.random(), Math.random()),
        phase: Math.random() * Math.PI * 2
      });
    }
    return data;
  }, []);

  const ballData = useMemo(() => {
    const data = [];
    const colors = ['#FFFFFF', '#A020F0', '#E6E6FA'];
    for (let i = 0; i < BALL_COUNT; i++) {
      const y = Math.random() * 16 - 7;
      const ratio = y > 0 ? 1 - (y / 10) : 1.1;
      const r = (y > 0 ? ratio * 4.1 : 4.5) + Math.random() * 0.3;
      const theta = Math.random() * Math.PI * 2;
      data.push({
        treePos: new THREE.Vector3(Math.cos(theta) * r, y - 1.2, Math.sin(theta) * r),
        chaosPos: getChaosPos(15),
        scale: 0.1 + Math.random() * 0.1,
        color: new THREE.Color(colors[Math.floor(Math.random() * colors.length)]),
        phase: Math.random() * Math.PI * 2
      });
    }
    return data;
  }, []);

  useFrame((state, delta) => {
    const time = state.clock.getElapsedTime();
    
    // Smoothly transition the lerp factor
    const targetFactor = isChaos ? 1 : 0;
    transitionRef.current.factor = THREE.MathUtils.lerp(transitionRef.current.factor, targetFactor, delta * 3);
    const t = transitionRef.current.factor;

    if (leafRef.current) {
      leafData.forEach((leaf, i) => {
        const { treePos, chaosPos, rotation, scale, speed, color } = leaf;
        
        // Base position with slight float
        const drift = new THREE.Vector3(
          Math.sin(time * speed + i) * 0.05,
          Math.cos(time * speed * 0.5 + i) * 0.03,
          Math.cos(time * speed + i) * 0.05
        );

        tempObject.position.lerpVectors(treePos, chaosPos, t).add(drift);
        
        // Add additional chaotic rotation based on t
        tempObject.rotation.set(
          rotation.x + time * speed * 0.2 + (t * time * 0.5), 
          rotation.y + time * speed * 0.2 + (t * time * 0.5), 
          rotation.z
        );
        tempObject.scale.setScalar(scale);
        tempObject.updateMatrix();
        leafRef.current!.setMatrixAt(i, tempObject.matrix);
        leafRef.current!.setColorAt(i, color);
      });
      leafRef.current.instanceMatrix.needsUpdate = true;
      if (leafRef.current.instanceColor) leafRef.current.instanceColor.needsUpdate = true;
    }

    if (giftRef.current) {
      giftData.forEach((gift, i) => {
        tempObject.position.lerpVectors(gift.treePos, gift.chaosPos, t);
        tempObject.rotation.set(gift.rotation.x + time * 0.1, gift.rotation.y + time * 0.2, gift.rotation.z);
        tempObject.scale.setScalar(gift.scale * (0.95 + Math.sin(time + gift.phase) * 0.05));
        tempObject.updateMatrix();
        giftRef.current!.setMatrixAt(i, tempObject.matrix);
      });
      giftRef.current.instanceMatrix.needsUpdate = true;
    }

    if (ballRef.current) {
      ballData.forEach((ball, i) => {
        tempObject.position.lerpVectors(ball.treePos, ball.chaosPos, t);
        tempObject.scale.setScalar(ball.scale * (1 + Math.sin(time * 2 + ball.phase) * 0.1));
        tempObject.updateMatrix();
        ballRef.current!.setMatrixAt(i, tempObject.matrix);
        ballRef.current!.setColorAt(i, ball.color);
      });
      ballRef.current.instanceMatrix.needsUpdate = true;
      if (ballRef.current.instanceColor) ballRef.current.instanceColor.needsUpdate = true;
    }
  });

  return (
    <group>
      <instancedMesh ref={leafRef} args={[undefined, undefined, LEAF_COUNT]}>
        <octahedronGeometry args={[1, 0]} />
        <meshStandardMaterial 
          metalness={0.6} 
          roughness={0.4} 
          emissive="#FF69B4"
          emissiveIntensity={0.08}
        />
      </instancedMesh>

      <instancedMesh ref={giftRef} args={[undefined, undefined, GIFT_COUNT]}>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial 
          color="#FFD700" 
          metalness={1} 
          roughness={0.1}
          emissive="#FFA500"
          emissiveIntensity={0.1}
        />
      </instancedMesh>

      <instancedMesh ref={ballRef} args={[undefined, undefined, BALL_COUNT]}>
        <icosahedronGeometry args={[1, 1]} />
        <meshPhysicalMaterial 
          metalness={0.9}
          roughness={0.05}
          envMapIntensity={1.5}
        />
      </instancedMesh>
    </group>
  );
};

export default ChristmasTree;
