import { useMemo, useRef } from 'react';
import * as THREE from 'three';
import { useGLTF } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';

const ROWS = 16;
const SEATS_PER_ROW = 30;

function AnimalNPC({ position, rotation, randomSeed }: { position: [number, number, number], rotation: [number, number, number], randomSeed: number }) {
  const { scene } = useGLTF('/animal.glb');
  
  // Clone the duck scene
  const clonedScene = useMemo(() => {
    const clone = scene.clone();
    
    // Optional: Randomize the duck colors slightly!
    const colors = ['#ffd700', '#ffcc00', '#ffaa00', '#ffffff', '#ff99cc', '#00ffcc'];
    const randomColor = colors[Math.floor(randomSeed * colors.length)];
    const sharedMaterial = new THREE.MeshStandardMaterial({
      color: new THREE.Color(randomColor),
      roughness: 0.5
    });

    clone.traverse((child: any) => {
      if (child.isMesh) {
        child.material = sharedMaterial;
        child.castShadow = true;
      }
    });
    
    return clone;
  }, [scene, randomSeed]);
  
  const groupRef = useRef<THREE.Group>(null);

  // Fun ambient animation: they bob their heads/bodies to the movie!
  useFrame((state) => {
    if (!groupRef.current) return;
    const t = state.clock.elapsedTime;
    
    // Bop up and down
    groupRef.current.position.y = position[1] + Math.sin(t * 2 + randomSeed * 10) * 0.05;
    
    // Slight side to side waddle
    groupRef.current.rotation.z = Math.sin(t * 1.5 + randomSeed * 15) * 0.1;
    
    // Look around
    groupRef.current.rotation.y = rotation[1] + Math.sin(t * 0.5 + randomSeed * 20) * 0.2;
  });

  return (
    <group ref={groupRef} position={position} rotation={rotation} scale={0.4}>
      <primitive object={clonedScene} />
    </group>
  );
}

export function TheatreNPCs() {
  const npcs = useMemo(() => {
    const arr = [];
    // Occupy about 20% of the seats randomly (~90 animals)
    for (let r = 0; r < ROWS; r++) {
      for (let s = 0; s < SEATS_PER_ROW; s++) {
        if (Math.random() > 0.20) continue; 
        
        // Exclude the absolute center VIP seats so the user has a place to sit
        if (r >= 6 && r <= 9 && s >= 12 && s <= 17) continue;

        const x = (s - SEATS_PER_ROW / 2 + 0.5) * 1.0;
        const z = -11 + r * 1.5;
        const y = Math.max(0, (r - 6) * 0.4);
        
        // Animal is seated on the seat cushion
        const posX = x;
        const posY = y + 0.5; // Seat cushion height
        const posZ = z; 
        
        // Face the screen (Math.PI)
        const rotY = Math.PI + (Math.random() - 0.5) * 0.2;
        const randomSeed = Math.random();

        arr.push({
          key: `animal_${r}_${s}`,
          position: [posX, posY, posZ],
          rotation: [0, rotY, 0],
          randomSeed
        });
      }
    }
    return arr;
  }, []);

  return (
    <group>
      {npcs.map((npc) => (
        <AnimalNPC 
          key={npc.key} 
          position={npc.position as [number, number, number]} 
          rotation={npc.rotation as [number, number, number]} 
          randomSeed={npc.randomSeed}
        />
      ))}
    </group>
  );
}

useGLTF.preload('/animal.glb');
