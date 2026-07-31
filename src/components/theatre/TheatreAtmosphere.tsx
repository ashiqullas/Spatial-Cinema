import { Sparkles } from '@react-three/drei';

export function TheatreAtmosphere() {
  return (
    <group>
      {/* Global floating dust - slow and sparse */}
      <Sparkles 
        count={800} 
        scale={[60, 30, 60]} 
        position={[0, 10, 0]}
        size={2.5} 
        speed={0.2} 
        opacity={0.3}
        color="#ffffff"
        noise={1}
      />
      
      {/* Projector Beam Dust - denser and faster, angled towards screen */}
      <group position={[0, 14, 10]}>
        <Sparkles 
          count={500} 
          scale={[8, 6, 50]} 
          size={5} 
          speed={0.8} 
          opacity={0.8}
          color="#aaddff"
          noise={1.5}
        />
      </group>
    </group>
  );
}
