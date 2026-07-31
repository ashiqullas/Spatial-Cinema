import { useRef } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';

export function TheatreExitSigns() {
  const leftSignMatRef = useRef<THREE.MeshStandardMaterial>(null);
  const leftLightRef = useRef<THREE.RectAreaLight>(null);
  const rightSignMatRef = useRef<THREE.MeshStandardMaterial>(null);
  const rightLightRef = useRef<THREE.RectAreaLight>(null);

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    
    // Slow, subtle pulsing effect
    const pulse = Math.sin(t * 2) * 0.1 + 0.9; 
    
    // Random slight flicker every now and then
    const flicker = Math.random() > 0.98 ? Math.random() * 0.3 + 0.7 : 1;
    
    const intensity = 1.5 * pulse * flicker;
    const lightIntensity = 2 * pulse * flicker;

    if (leftSignMatRef.current) leftSignMatRef.current.emissiveIntensity = intensity;
    if (leftLightRef.current) leftLightRef.current.intensity = lightIntensity;
    
    if (rightSignMatRef.current) rightSignMatRef.current.emissiveIntensity = intensity;
    if (rightLightRef.current) rightLightRef.current.intensity = lightIntensity;
  });

  return (
    <group>
      {/* Exit Sign Left (Mounted on left wall) */}
      <group position={[-24.8, 5, -10]} rotation={[0, Math.PI / 2, 0]}>
        <mesh>
          <boxGeometry args={[2, 0.8, 0.2]} />
          <meshStandardMaterial ref={leftSignMatRef} color="#00ff00" emissive="#00ff00" emissiveIntensity={1.5} />
        </mesh>
        <rectAreaLight ref={leftLightRef} width={2} height={0.8} color="#00ff00" intensity={2} position={[0, 0, 0.2]} />
      </group>

      {/* Exit Sign Right (Mounted on right wall) */}
      <group position={[24.8, 5, -10]} rotation={[0, -Math.PI / 2, 0]}>
        <mesh>
          <boxGeometry args={[2, 0.8, 0.2]} />
          <meshStandardMaterial ref={rightSignMatRef} color="#00ff00" emissive="#00ff00" emissiveIntensity={1.5} />
        </mesh>
        <rectAreaLight ref={rightLightRef} width={2} height={0.8} color="#00ff00" intensity={2} position={[0, 0, 0.2]} />
      </group>
    </group>
  );
}
