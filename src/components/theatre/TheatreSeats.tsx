import { useMemo, useRef, useEffect } from 'react';
import * as THREE from 'three';
import { InstancedRigidBodies } from '@react-three/rapier';

export function TheatreSeats() {
  const seatCount = 480;
  const rows = 16;
  const seatsPerRow = 30;

  const baseRef = useRef<THREE.InstancedMesh>(null);
  const backRef = useRef<THREE.InstancedMesh>(null);
  
  const instances = useMemo(() => {
    const arr = [];
    for (let r = 0; r < rows; r++) {
      for (let s = 0; s < seatsPerRow; s++) {
        // Straight rows, massive central block
        // X goes from -14.5 to 14.5 (spacing of 1.0)
        const x = (s - seatsPerRow / 2 + 0.5) * 1.0;
        
        // Push first row back from screen (starts at z = -11)
        const z = -11 + r * 1.5;
        
        // Start elevating after the 6th row for a large flat front area
        const y = Math.max(0, (r - 6) * 0.4);
        
        arr.push({
          key: `seat_${r}_${s}`,
          position: [x, y, z],
          rotation: [0, 0, 0], // Straight facing screen
        });
      }
    }
    return arr;
  }, [rows, seatsPerRow]);

  useEffect(() => {
    if (!baseRef.current || !backRef.current) return;
    const dummy = new THREE.Object3D();
    let index = 0;
    for (let i = 0; i < instances.length; i++) {
      const inst = instances[i];
      dummy.position.set(inst.position[0] as number, inst.position[1] as number, inst.position[2] as number);
      dummy.rotation.set(inst.rotation[0] as number, inst.rotation[1] as number, inst.rotation[2] as number);
      dummy.updateMatrix();
      baseRef.current.setMatrixAt(index, dummy.matrix);
      backRef.current.setMatrixAt(index, dummy.matrix);
      index++;
    }
    baseRef.current.instanceMatrix.needsUpdate = true;
    backRef.current.instanceMatrix.needsUpdate = true;
    baseRef.current.computeBoundingSphere();
    backRef.current.computeBoundingSphere();
  }, [instances]);

  const { baseGeo, backGeo } = useMemo(() => {
    const bg = new THREE.BoxGeometry(0.7, 0.4, 0.6);
    bg.translate(0, 0.2, 0); 
    const bk = new THREE.BoxGeometry(0.7, 0.6, 0.2); // Shorter backrest (1.0m total height instead of 1.2m)
    bk.translate(0, 0.7, 0.2); // +0.2 Z puts the backrest BEHIND the seated player, not in front!
    return { baseGeo: bg, backGeo: bk };
  }, []);

  return (
    <group name="TheatreSeatsGroup">
      <InstancedRigidBodies instances={instances as any} colliders="cuboid" type="fixed">
        <instancedMesh 
          name="TheatreSeatsBase"
          ref={baseRef} 
          args={[baseGeo, undefined, seatCount]} 
          frustumCulled={false}
        >
          {/* Classic Indian cinema red seats */}
          <meshStandardMaterial color="#4a0815" roughness={0.9} metalness={0.1} />
        </instancedMesh>
      </InstancedRigidBodies>
      
      <InstancedRigidBodies instances={instances as any} colliders="cuboid" type="fixed">
        <instancedMesh 
          name="TheatreSeatsBack"
          ref={backRef} 
          args={[backGeo, undefined, seatCount]} 
          frustumCulled={false}
        >
          <meshStandardMaterial color="#6b0d1e" roughness={0.8} metalness={0.1} />
        </instancedMesh>
      </InstancedRigidBodies>
    </group>
  );
}
