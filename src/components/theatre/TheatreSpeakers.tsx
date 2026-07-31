import { RigidBody } from '@react-three/rapier';

export function TheatreSpeakers() {
  return (
    <group>
      {/* Left Wall Large Speakers */}
      {[-12, -2, 8].map((z, i) => (
        <RigidBody key={`surround-l-${i}`} type="fixed" colliders="cuboid">
          <group position={[-24.5, 6, z]} rotation={[0, Math.PI / 2, 0]}>
            {/* Cabinet */}
            <mesh castShadow receiveShadow>
              <boxGeometry args={[1.5, 4, 1.2]} />
              <meshStandardMaterial color="#0a0a0a" roughness={0.9} />
            </mesh>
            {/* Tweeter */}
            <mesh position={[0, 1.2, 0.61]} rotation={[Math.PI / 2, 0, 0]}>
              <cylinderGeometry args={[0.3, 0.3, 0.1, 32]} />
              <meshStandardMaterial color="#1a1a1a" roughness={0.7} />
            </mesh>
            {/* Woofer */}
            <mesh position={[0, -0.8, 0.61]} rotation={[Math.PI / 2, 0, 0]}>
              <cylinderGeometry args={[0.6, 0.6, 0.1, 32]} />
              <meshStandardMaterial color="#1a1a1a" roughness={0.7} />
            </mesh>
          </group>
        </RigidBody>
      ))}

      {/* Right Wall Large Speakers */}
      {[-12, -2, 8].map((z, i) => (
        <RigidBody key={`surround-r-${i}`} type="fixed" colliders="cuboid">
          <group position={[24.5, 6, z]} rotation={[0, -Math.PI / 2, 0]}>
            {/* Cabinet */}
            <mesh castShadow receiveShadow>
              <boxGeometry args={[1.5, 4, 1.2]} />
              <meshStandardMaterial color="#0a0a0a" roughness={0.9} />
            </mesh>
            {/* Tweeter */}
            <mesh position={[0, 1.2, 0.61]} rotation={[Math.PI / 2, 0, 0]}>
              <cylinderGeometry args={[0.3, 0.3, 0.1, 32]} />
              <meshStandardMaterial color="#1a1a1a" roughness={0.7} />
            </mesh>
            {/* Woofer */}
            <mesh position={[0, -0.8, 0.61]} rotation={[Math.PI / 2, 0, 0]}>
              <cylinderGeometry args={[0.6, 0.6, 0.1, 32]} />
              <meshStandardMaterial color="#1a1a1a" roughness={0.7} />
            </mesh>
          </group>
        </RigidBody>
      ))}
    </group>
  );
}
