import { RigidBody } from '@react-three/rapier';
import { MeshReflectorMaterial } from '@react-three/drei';
import { useAppStore } from '@/store/useAppStore';

export function TheatreRoom() {
  const performanceLevel = useAppStore((state) => state.performanceLevel);

  return (
    <group>
      {/* Carpet Floor */}
      <RigidBody type="fixed" colliders="cuboid">
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.1, 0]} receiveShadow>
          <planeGeometry args={[100, 100]} />
          {performanceLevel > 0.5 ? (
            <MeshReflectorMaterial
              blur={[300, 100]}
              resolution={1024}
              mixBlur={1}
              mixStrength={15}
              roughness={0.9}
              depthScale={1.2}
              minDepthThreshold={0.4}
              maxDepthThreshold={1.4}
              color="#2a050d"
              metalness={0.5}
              mirror={0.2}
            />
          ) : (
            <meshStandardMaterial 
              color="#2a050d"
              roughness={0.9} 
              metalness={0.0} 
            />
          )}
        </mesh>
      </RigidBody>

      {/* Ceiling */}
      <RigidBody type="fixed" colliders="cuboid">
        <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, 20, 0]} receiveShadow>
          <planeGeometry args={[100, 100]} />
          <meshStandardMaterial color="#1a0a0d" roughness={1} />
        </mesh>
      </RigidBody>

      {/* Acoustic Walls with Gold Accents */}
      {/* Left Wall */}
      <RigidBody type="fixed" colliders="cuboid">
        <mesh position={[-25, 10, 0]} rotation={[0, Math.PI / 2, 0]} receiveShadow>
          <planeGeometry args={[100, 20]} />
          <meshStandardMaterial color="#3a0510" roughness={0.8} />
        </mesh>
      </RigidBody>
      
      {/* Gold Trim Left */}
      <mesh position={[-24.9, 10, 0]} rotation={[0, Math.PI / 2, 0]}>
        <boxGeometry args={[100, 0.2, 0.1]} />
        <meshStandardMaterial color="#d4af37" metalness={0.8} roughness={0.2} />
      </mesh>

      {/* Right Wall */}
      <RigidBody type="fixed" colliders="cuboid">
        <mesh position={[25, 10, 0]} rotation={[0, -Math.PI / 2, 0]} receiveShadow>
          <planeGeometry args={[100, 20]} />
          <meshStandardMaterial color="#3a0510" roughness={0.8} />
        </mesh>
      </RigidBody>
      
      {/* Gold Trim Right */}
      <mesh position={[24.9, 10, 0]} rotation={[0, -Math.PI / 2, 0]}>
        <boxGeometry args={[100, 0.2, 0.1]} />
        <meshStandardMaterial color="#d4af37" metalness={0.8} roughness={0.2} />
      </mesh>

      {/* Back Wall */}
      <RigidBody type="fixed" colliders="cuboid">
        <mesh position={[0, 10, 40]} rotation={[0, Math.PI, 0]} receiveShadow>
          <planeGeometry args={[50, 20]} />
          <meshStandardMaterial color="#2a050d" roughness={0.9} />
        </mesh>
      </RigidBody>

      {/* 3D Projector Booth Box */}
      <RigidBody type="fixed" colliders="cuboid">
        <mesh position={[0, 14.5, 39]}>
          <boxGeometry args={[4, 2.5, 2]} />
          <meshStandardMaterial color="#111111" metalness={0.8} roughness={0.2} />
        </mesh>
      </RigidBody>

      {/* Projector Window/Glass */}
      <mesh position={[0, 14.5, 37.99]}>
        <planeGeometry args={[3.5, 2]} />
        <meshStandardMaterial color="#050505" metalness={1} roughness={0} transparent opacity={0.8} />
      </mesh>

      {/* Actual Projector Lens Inside */}
      <mesh position={[0, 14.5, 38.5]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.3, 0.3, 1, 32]} />
        <meshStandardMaterial color="#222222" metalness={0.9} roughness={0.1} />
      </mesh>
      
      {/* Glowing Lens Element */}
      <mesh position={[0, 14.5, 38]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.25, 0.25, 1.05, 32]} />
        <meshStandardMaterial color="#ffffff" emissive="#aaddff" emissiveIntensity={5} />
      </mesh>

      {/* Left Aisle Stairs */}
      <group position={[-16.5, 0, 0]}>
        {Array.from({ length: 16 }).map((_, i) => {
          const y = Math.max(0, (i - 6) * 0.4);
          const z = -11 + i * 1.5;
          if (y > 0) {
            return (
              <RigidBody key={`l-stair-${i}`} type="fixed" colliders="cuboid">
                <mesh position={[0, y / 2, z]} receiveShadow>
                  <boxGeometry args={[3, y, 1.5]} />
                  <meshStandardMaterial color="#1a0a0a" roughness={0.9} />
                </mesh>
              </RigidBody>
            );
          }
          return null;
        })}
      </group>

      {/* Right Aisle Stairs */}
      <group position={[16.5, 0, 0]}>
        {Array.from({ length: 16 }).map((_, i) => {
          const y = Math.max(0, (i - 6) * 0.4);
          const z = -11 + i * 1.5;
          if (y > 0) {
            return (
              <RigidBody key={`r-stair-${i}`} type="fixed" colliders="cuboid">
                <mesh position={[0, y / 2, z]} receiveShadow>
                  <boxGeometry args={[3, y, 1.5]} />
                  <meshStandardMaterial color="#1a0a0a" roughness={0.9} />
                </mesh>
              </RigidBody>
            );
          }
          return null;
        })}
      </group>

      {/* Center Aisle Stairs */}
      <group position={[0, 0, 0]}>
        {Array.from({ length: 16 }).map((_, i) => {
          const y = Math.max(0, (i - 6) * 0.4);
          const z = -11 + i * 1.5;
          if (y > 0) {
            return (
              <RigidBody key={`c-stair-${i}`} type="fixed" colliders="cuboid">
                <mesh position={[0, y / 2, z]} receiveShadow>
                  <boxGeometry args={[3, y, 1.5]} />
                  <meshStandardMaterial color="#1a0a0a" roughness={0.9} />
                </mesh>
              </RigidBody>
            );
          }
          return null;
        })}
      </group>

      {/* Solid platforms under the seats to prevent falling between aisles */}
      <group position={[0, 0, 0]}>
        {Array.from({ length: 16 }).map((_, i) => {
          const y = Math.max(0, (i - 6) * 0.4);
          const z = -11 + i * 1.5;
          if (y > 0) {
            return (
              <RigidBody key={`platform-${i}`} type="fixed" colliders="cuboid">
                <mesh position={[0, y / 2, z]} receiveShadow>
                  <boxGeometry args={[30, y, 1.5]} />
                  <meshStandardMaterial color="#1a0a0a" roughness={0.9} />
                </mesh>
              </RigidBody>
            );
          }
          return null;
        })}
      </group>
    </group>
  );
}
