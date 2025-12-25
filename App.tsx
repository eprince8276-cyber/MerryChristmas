
import React, { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera, Environment } from '@react-three/drei';
import Scene from './components/Scene';

const App: React.FC = () => {
  return (
    <div className="relative w-full h-screen bg-[#050103]">
      {/* 3D Scene */}
      <Canvas
        shadows
        gl={{ 
          antialias: true, 
          stencil: false, 
          depth: true, 
          alpha: false,
          powerPreference: "high-performance" 
        }}
        dpr={[1, 2]}
      >
        <Suspense fallback={null}>
          <PerspectiveCamera 
            makeDefault 
            position={[0, 4, 25]} 
            fov={45} 
            near={0.1}
            far={1000}
          />
          <color attach="background" args={['#050103']} />
          
          <Scene />
          
          <OrbitControls 
            makeDefault
            enablePan={true}      // Enable Right-Click/Two-Finger Pan
            enableZoom={true}     // Enable Scroll Zoom
            enableRotate={true}   // Enable Left-Click Rotate
            enableDamping={true}  // Smooth transition
            dampingFactor={0.05}
            rotateSpeed={0.7}
            zoomSpeed={1.2}
            panSpeed={0.8}
            target={[0, 2, 0]}    // Focus on the middle-upper part of the tree
            screenSpacePanning={true}
            maxPolarAngle={Math.PI / 1.2} 
            minPolarAngle={Math.PI / 12}
            minDistance={5} 
            maxDistance={60} 
            autoRotate={true} 
            autoRotateSpeed={0.4}
          />
          
          <Environment preset="city" />
        </Suspense>
      </Canvas>

      {/* Typography Overlay - Interactive events passed through to Canvas */}
      <div className="absolute top-12 left-0 w-full pointer-events-none flex flex-col items-center justify-center select-none">
        <h1 
          className="text-7xl md:text-9xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-[#FF69B4] to-[#FFB7C5] drop-shadow-[0_0_25px_rgba(255,105,180,0.6)]"
          style={{ fontFamily: "'Cinzel Decorative', cursive" }}
        >
          Merry
        </h1>
        <h1 
          className="text-7xl md:text-9xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-t from-[#FF69B4] to-white -mt-4 drop-shadow-[0_0_25px_rgba(255,255,255,0.4)]"
          style={{ fontFamily: "'Cinzel Decorative', cursive" }}
        >
          Christmas
        </h1>
      </div>

      <div className="absolute bottom-8 left-0 w-full flex justify-center pointer-events-none opacity-40 select-none">
        <p className="text-[#FF69B4] font-light tracking-[0.4em] uppercase text-[10px]" style={{ fontFamily: "'Montserrat', sans-serif" }}>
          Cyberpunk Fantasy Edition • 2024
        </p>
      </div>
    </div>
  );
};

export default App;
