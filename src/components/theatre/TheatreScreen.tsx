import { YouTubePlayer } from './YouTubePlayer';
import { RigidBody } from '@react-three/rapier';

export function TheatreScreen() {
  // A massive flat LED-style cinema screen
  return (
    <group position={[0, 10, -20]}>
      {/* Screen Frame / Backing */}
      <RigidBody type="fixed" colliders="cuboid">
        <mesh position={[0, 0, -0.5]} castShadow receiveShadow>
          <boxGeometry args={[36.5, 21, 1]} />
          <meshStandardMaterial 
            color="#0a0a0a" 
            roughness={0.4}
            metalness={0.8}
          />
        </mesh>
      </RigidBody>

      {/* Subtle ambient screen glow behind the frame */}
      <mesh position={[0, 0, -0.6]}>
        <planeGeometry args={[40, 24]} />
        <meshBasicMaterial color="#e2f1ff" transparent opacity={0.03} />
      </mesh>

      {/* YouTube Flat Screen Overlay positioned completely flush with the frame */}
      <group position={[0, 0, 0.01]}>
        <YouTubePlayer />
      </group>
    </group>
  );
}
