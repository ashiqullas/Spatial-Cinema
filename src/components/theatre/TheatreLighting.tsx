import { useMemo, useRef } from 'react';
import * as THREE from 'three';
import { Environment, SpotLight } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import { useAppStore } from '@/store/useAppStore';

export function TheatreLighting() {
  const isPlaying = useAppStore(state => state.isPlaying);
  
  const screenLightRef = useRef<THREE.RectAreaLight>(null);
  const ambientLightRef = useRef<THREE.AmbientLight>(null);
  const houseLightRef = useRef<THREE.DirectionalLight>(null);
  const projectorLightRef = useRef<THREE.SpotLight>(null);
  const aisleLeftRef = useRef<THREE.MeshStandardMaterial>(null);
  const aisleRightRef = useRef<THREE.MeshStandardMaterial>(null);
  
  const spotTarget = useMemo(() => {
    const target = new THREE.Object3D();
    target.position.set(0, 8, -25);
    return target;
  }, []);

  // Smooth cinematic lighting transitions
  useFrame((state) => {
    const t = state.clock.elapsedTime;
    const lerpSpeed = 0.02; // Slow, dramatic fade

    if (!isPlaying) {
      // INTERMISSION STATE (Paused)
      if (screenLightRef.current) screenLightRef.current.intensity = THREE.MathUtils.lerp(screenLightRef.current.intensity, 0.5, lerpSpeed);
      if (ambientLightRef.current) ambientLightRef.current.intensity = THREE.MathUtils.lerp(ambientLightRef.current.intensity, 2.5, lerpSpeed);
      if (houseLightRef.current) houseLightRef.current.intensity = THREE.MathUtils.lerp(houseLightRef.current.intensity, 2.0, lerpSpeed);
      if (projectorLightRef.current) projectorLightRef.current.intensity = THREE.MathUtils.lerp(projectorLightRef.current.intensity, 0, lerpSpeed * 2);
      if (aisleLeftRef.current) aisleLeftRef.current.emissiveIntensity = THREE.MathUtils.lerp(aisleLeftRef.current.emissiveIntensity, 2.0, lerpSpeed);
      if (aisleRightRef.current) aisleRightRef.current.emissiveIntensity = THREE.MathUtils.lerp(aisleRightRef.current.emissiveIntensity, 2.0, lerpSpeed);
    } else {
      // MOVIE MODE STATE (Playing)
      // Flicker intensity (fast)
      const flicker = Math.sin(t * 15) * 0.1 + Math.sin(t * 23) * 0.05 + Math.sin(t * 5) * 0.2;
      const r = Math.sin(t * 0.5) * 0.5 + 0.5;
      
      if (screenLightRef.current) {
        const targetIntensity = 2.0 + flicker * 1.5;
        screenLightRef.current.intensity = THREE.MathUtils.lerp(screenLightRef.current.intensity, targetIntensity, 0.1);
        screenLightRef.current.color.setHSL(r * 0.1 + 0.5, 0.8, 0.6); // Shifts hue slightly
      }
      
      if (ambientLightRef.current) ambientLightRef.current.intensity = THREE.MathUtils.lerp(ambientLightRef.current.intensity, 0.1, lerpSpeed);
      if (houseLightRef.current) houseLightRef.current.intensity = THREE.MathUtils.lerp(houseLightRef.current.intensity, 0, lerpSpeed);
      if (projectorLightRef.current) projectorLightRef.current.intensity = THREE.MathUtils.lerp(projectorLightRef.current.intensity, 2.5, lerpSpeed * 2);
      if (aisleLeftRef.current) aisleLeftRef.current.emissiveIntensity = THREE.MathUtils.lerp(aisleLeftRef.current.emissiveIntensity, 0.2, lerpSpeed);
      if (aisleRightRef.current) aisleRightRef.current.emissiveIntensity = THREE.MathUtils.lerp(aisleRightRef.current.emissiveIntensity, 0.2, lerpSpeed);
    }
  });

  return (
    <group>
      <primitive object={spotTarget} />
      
      {/* Global Ambient */}
      <ambientLight ref={ambientLightRef} intensity={2.5} />
      
      {/* House Lights (Bright for visibility, but warm) */}
      <directionalLight ref={houseLightRef} position={[0, 20, 0]} intensity={2.0} color="#ffeedd" castShadow={false} />

      {/* Very faint HDR for realistic specular reflections on materials */}
      <Environment preset="night" environmentIntensity={1.0} />

      {/* Screen Light Bounce (Simulating the screen illuminating the room) */}
      <rectAreaLight 
        ref={screenLightRef}
        width={50} 
        height={30} 
        color="#e2f1ff" 
        intensity={2} 
        position={[0, 10, -18]} 
        rotation={[-Math.PI, 0, 0]} 
      />
      
      {/* Projector Beam (Volumetric cone of light) */}
      <SpotLight
        ref={projectorLightRef}
        position={[0, 14.5, 38]}
        target={spotTarget}
        color="#aaddff"
        intensity={0} // Starts at 0 (assuming paused by default)
        angle={0.35}
        penumbra={0.8}
        distance={100}
        castShadow
        shadow-mapSize={[1024, 1024]}
        volumetric
        opacity={0.8} 
        attenuation={50} 
        anglePower={5} 
        radiusTop={0.2}
        radiusBottom={16} 
      />

      {/* Left Aisle Neon */}
      <mesh position={[-16.5, 0.1, 5]}>
        <boxGeometry args={[0.1, 0.1, 30]} />
        <meshStandardMaterial ref={aisleLeftRef} color="#ff2222" emissive="#ff2222" emissiveIntensity={2} />
      </mesh>
      
      {/* Right Aisle Neon */}
      <mesh position={[16.5, 0.1, 5]}>
        <boxGeometry args={[0.1, 0.1, 30]} />
        <meshStandardMaterial ref={aisleRightRef} color="#ff2222" emissive="#ff2222" emissiveIntensity={2} />
      </mesh>

    </group>
  );
}
