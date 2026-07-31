import { Canvas } from '@react-three/fiber';
import { Suspense } from 'react';
import { EffectComposer, Bloom, N8AO, ToneMapping, Noise, Vignette } from '@react-three/postprocessing';
import * as THREE from 'three';
import { PerformanceMonitor } from '@react-three/drei';

import { TheatreSeats } from '@/components/theatre/TheatreSeats';
import { TheatreScreen } from '@/components/theatre/TheatreScreen';
import { TheatreRoom } from '@/components/theatre/TheatreRoom';
import { TheatreLighting } from '@/components/theatre/TheatreLighting';
import { TheatreExitSigns } from '@/components/theatre/TheatreExitSigns';

import { TheatreAtmosphere } from '@/components/theatre/TheatreAtmosphere';
import { TheatreAudio } from '@/components/theatre/TheatreAudio';
import { CameraRig } from '@/components/CameraRig';

import { Physics } from '@react-three/rapier';
import { FirstPersonController } from '@/components/FirstPersonController';
import { useAppStore } from '@/store/useAppStore';

function SceneContents() {
  const performanceLevel = useAppStore((state) => state.performanceLevel);
  const setPerformanceLevel = useAppStore((state) => state.setPerformanceLevel);

  return (
    <PerformanceMonitor onIncline={() => setPerformanceLevel(1)} onDecline={() => setPerformanceLevel(0)}>
      <color attach="background" args={['#020202']} />
      
      <Suspense fallback={null}>
        <Physics>
          <TheatreLighting />
          <TheatreRoom />
          <TheatreScreen />
          <TheatreSeats />

          <TheatreExitSigns />
          <FirstPersonController />
        </Physics>
        <TheatreAudio />
      </Suspense>
      
      <CameraRig />

      {/* Post-Processing Pipeline - Scales with performance */}
      <EffectComposer multisampling={performanceLevel > 0.5 ? 4 : 0}>
        {performanceLevel > 0.5 && <N8AO distanceFalloff={1} aoRadius={1} intensity={2} />}
        <Bloom luminanceThreshold={0.5} mipmapBlur intensity={1.5} />
        {performanceLevel > 0.5 && <Noise opacity={0.03} />}
        <Vignette eskil={false} offset={0.1} darkness={1.1} />
        <ToneMapping mode={THREE.ACESFilmicToneMapping} />
      </EffectComposer>
    </PerformanceMonitor>
  );
}

export function MainScene() {
  return (
    <div style={{ width: '100vw', height: '100vh', position: 'absolute', top: 0, left: 0, backgroundColor: '#020202' }}>
      <Canvas 
        shadows 
        camera={{ position: [0, 6, 0], fov: 75 }}
        gl={{ antialias: false, toneMapping: THREE.ACESFilmicToneMapping }}
      >
        <SceneContents />
      </Canvas>
    </div>
  );
}
