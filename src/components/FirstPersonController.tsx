import { useEffect, useRef, useMemo } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { RigidBody, RapierRigidBody, CapsuleCollider } from '@react-three/rapier';
import { useAppStore } from '@/store/useAppStore';
import * as THREE from 'three';
import gsap from 'gsap';

const SPEED = 5;
const SPRINT_MULTIPLIER = 1.8;
const HEAD_BOB_FREQ = 8;
const HEAD_BOB_AMP = 0.05;

export function FirstPersonController() {
  const isFirstPerson = useAppStore((state) => state.isFirstPerson);
  const { isSitting } = useAppStore();
  const { camera, gl } = useThree();
  
  const bodyRef = useRef<RapierRigidBody>(null);
  
  const keys = useRef<{ [key: string]: boolean }>({});
  const mouseMove = useRef({ movementX: 0, movementY: 0 });
  const euler = useRef(new THREE.Euler(0, 0, 0, 'YXZ'));
  const bobTime = useRef(0);
  
  const cameraYOffset = useRef({ value: 0.8 }); // Lowered slightly so they don't feel like a giant

  const sitTransition = useRef(false);
  
  const raycaster = useMemo(() => new THREE.Raycaster(), []);
  const centerScreen = useMemo(() => new THREE.Vector2(0, 0), []);

  const targetLookRef = useRef<{ x: number, y: number } | null>(null);
  const startLookRef = useRef<{ x: number, y: number } | null>(null);
  const slerpProgress = useRef(0);

  // Input listeners
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => { 
      keys.current[e.code] = true; 
      
      const state = useAppStore.getState();
      
      // Sit Down (KeyE)
      if (e.code === 'KeyE' && state.hoveredSeat && !state.isSitting && !sitTransition.current) {
        if (!bodyRef.current) return;
        
        state.setIsSitting(true);
        state.setLastSeatId(state.hoveredSeat.id);
        sitTransition.current = true;
        
        bodyRef.current.setLinvel({ x: 0, y: 0, z: 0 }, true);
        bodyRef.current.setBodyType(1, true); // 1 = kinematicPosition
        
        // Calculate explicit Euler angles to point precisely at the IMAX screen
        const seatPos = new THREE.Vector3(...state.hoveredSeat.position);
        const finalEyePos = new THREE.Vector3(seatPos.x, seatPos.y + 0.5 + 0.7, seatPos.z - 0.1);
        
        const dx = 0 - finalEyePos.x;
        const dy = 10 - finalEyePos.y;
        const dz = -20 - finalEyePos.z;
        
        // Math.atan2(dx, -dz): 
        // When looking exactly down the -Z axis (towards screen), dx=0, dz=-30, so -dz=30.
        // Math.atan2(0, 30) = 0. Yaw=0 is standard forward in Three.js cameras.
        const targetYaw = Math.atan2(dx, -dz);
        const distXZ = Math.sqrt(dx * dx + dz * dz);
        const targetPitch = Math.atan2(dy, distXZ);

        // Normalize current yaw to [-PI, PI] to prevent spinning
        let cy = euler.current.y % (Math.PI * 2);
        if (cy > Math.PI) cy -= Math.PI * 2;
        if (cy < -Math.PI) cy += Math.PI * 2;
        euler.current.y = cy;
        
        // Find shortest path to target yaw
        let ty = targetYaw;
        let dyYaw = ty - cy;
        if (dyYaw > Math.PI) ty -= Math.PI * 2;
        if (dyYaw < -Math.PI) ty += Math.PI * 2;
        
        targetLookRef.current = { x: targetPitch, y: ty };
        startLookRef.current = { x: euler.current.x, y: euler.current.y };
        slerpProgress.current = 0;
        
        // Master Timeline for realistic multi-phase sitting
        const tl = gsap.timeline({
          onComplete: () => { sitTransition.current = false; }
        });

        // 1. Move to seat X/Z position while turning to face screen
        const startTrans = bodyRef.current.translation();
        const proxyTrans = { x: startTrans.x, y: startTrans.y, z: startTrans.z };
        
        tl.to(proxyTrans, {
          x: seatPos.x,
          z: seatPos.z - 0.1,
          duration: 0.8,
          ease: "power2.inOut",
          onUpdate: () => {
            if (bodyRef.current) bodyRef.current.setNextKinematicTranslation(proxyTrans);
          }
        }, 0);

        // 2. Squat down into the seat
        tl.to(cameraYOffset.current, {
          value: 0.7, // Increased seated height
          duration: 0.8,
          ease: "back.out(1.2)"
        }, 0.8);

        tl.to(proxyTrans, {
          y: seatPos.y + 0.5,
          duration: 0.8,
          ease: "power2.inOut",
          onUpdate: () => {
            if (bodyRef.current) bodyRef.current.setNextKinematicTranslation(proxyTrans);
          }
        }, 0.8);

        // Cinematic FOV zoom runs across both phases
        gsap.to(camera, {
          fov: 65,
          duration: 1.6,
          ease: "power2.inOut",
          onUpdate: () => camera.updateProjectionMatrix()
        });
      }

      // Stand Up (Escape or Space)
      if ((e.code === 'Escape' || e.code === 'Space') && state.isSitting && !sitTransition.current) {
        state.setIsSitting(false);
        sitTransition.current = true;
        
        // Smoothly return camera to standing height with an upward heave
        gsap.to(cameraYOffset.current, {
          value: 0.8, // Increased standing height
          duration: 1.5,
          ease: "back.out(1.2)"
        });
        
        // Return to peripheral FOV
        gsap.to(camera, {
          fov: 75,
          duration: 1.5,
          ease: "power2.inOut",
          onUpdate: () => camera.updateProjectionMatrix()
        });
        
        // Add a slight head roll for standing effort
        gsap.to(euler.current, {
          z: -0.03,
          duration: 0.7,
          ease: "power1.inOut",
          yoyo: true,
          repeat: 1
        });
        
        // Smoothly move the body slightly out of the chair
        if (bodyRef.current) {
          const currentPos = bodyRef.current.translation();
          const proxyTrans = { x: currentPos.x, y: currentPos.y, z: currentPos.z };
          
          gsap.to(proxyTrans, {
            y: currentPos.y + 0.5,
            z: currentPos.z - 0.6, // Move into the legroom
            duration: 1.5,
            ease: "power2.inOut",
            onUpdate: () => {
              if (bodyRef.current) {
                bodyRef.current.setNextKinematicTranslation(proxyTrans);
              }
            },
            onComplete: () => {
              sitTransition.current = false;
              // Re-enable dynamic physics after standing up
              if (bodyRef.current) bodyRef.current.setBodyType(0, true); // 0 = dynamic
            }
          });
        }
      }
    };
    
    const handleKeyUp = (e: KeyboardEvent) => { keys.current[e.code] = false; };
    
    const handleMouseMove = (e: MouseEvent) => {
      // Allow looking around even while sitting, just disable it during the transition!
      if (document.pointerLockElement === gl.domElement && !sitTransition.current) {
        mouseMove.current.movementX = e.movementX;
        mouseMove.current.movementY = e.movementY;
      }
    };
    
    const handleMouseDown = (e: MouseEvent) => {
      if (e.button === 0 && document.pointerLockElement !== gl.domElement && isFirstPerson) {
        // Request pointer lock if clicking while in FP mode but unlocked (e.g., after using UI)
        gl.domElement.requestPointerLock();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mousedown', handleMouseDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mousedown', handleMouseDown);
    };
  }, [gl.domElement, isFirstPerson]);

  // Handle entering/exiting first person
  useEffect(() => {
    if (isFirstPerson) {
      if (!isSitting) {
        euler.current.setFromQuaternion(camera.quaternion, 'YXZ');
        euler.current.z = 0; 
        gl.domElement.requestPointerLock();
      }
      
      if (bodyRef.current && !isSitting) {
        bodyRef.current.setTranslation({ x: camera.position.x, y: camera.position.y - 1, z: camera.position.z }, true);
      }
    } else {
      document.exitPointerLock();
      mouseMove.current = { movementX: 0, movementY: 0 };
    }
  }, [isFirstPerson, camera, isSitting, gl.domElement]);

  const { scene } = useThree();

  useFrame((_, delta) => {
    if (!isFirstPerson || !bodyRef.current) return;

    // Apply mouse look if we are not in a sitting transition
    if (!sitTransition.current) {
      euler.current.y -= mouseMove.current.movementX * 0.002;
      euler.current.x -= mouseMove.current.movementY * 0.002;
      euler.current.x = Math.max(-Math.PI / 2 + 0.1, Math.min(Math.PI / 2 - 0.1, euler.current.x));
      mouseMove.current = { movementX: 0, movementY: 0 };
    }

    const currentVel = bodyRef.current.linvel();
    let smoothVelX = 0;
    let smoothVelZ = 0;
    
    if (!isSitting && !sitTransition.current) {
      const input = new THREE.Vector3();
      if (keys.current['KeyW']) input.z -= 1;
      if (keys.current['KeyS']) input.z += 1;
      if (keys.current['KeyA']) input.x -= 1;
      if (keys.current['KeyD']) input.x += 1;
      if (input.length() > 0) input.normalize();

      input.applyEuler(new THREE.Euler(0, euler.current.y, 0));

      const speedMultiplier = keys.current['ShiftLeft'] ? SPRINT_MULTIPLIER : 1;
      const targetVelocity = input.multiplyScalar(SPEED * speedMultiplier);

      smoothVelX = THREE.MathUtils.lerp(currentVel.x, targetVelocity.x, delta * 10);
      smoothVelZ = THREE.MathUtils.lerp(currentVel.z, targetVelocity.z, delta * 10);

      bodyRef.current.setLinvel({ x: smoothVelX, y: currentVel.y, z: smoothVelZ }, true);
    }

    const pos = bodyRef.current.translation();
    const speed = Math.sqrt(smoothVelX * smoothVelX + smoothVelZ * smoothVelZ);
    
    if (speed > 1 && Math.abs(currentVel.y) < 0.1 && !isSitting && !sitTransition.current) {
      bobTime.current += delta * HEAD_BOB_FREQ * (keys.current['ShiftLeft'] ? SPRINT_MULTIPLIER : 1);
    } else {
      bobTime.current = THREE.MathUtils.lerp(bobTime.current, 0, delta * 5);
    }

    const bobOffset = Math.sin(bobTime.current) * HEAD_BOB_AMP;
    
    // Position camera at head height (slightly above center of physics capsule)
    camera.position.set(pos.x, pos.y + cameraYOffset.current.value + bobOffset, pos.z);
    
    // Manually handle rotation transition in useFrame to bypass any GSAP proxy limitations
    const state = useAppStore.getState();
    if (sitTransition.current && state.isSitting && targetLookRef.current && startLookRef.current) {
      // 0.8 seconds duration
      slerpProgress.current = Math.min(1, slerpProgress.current + delta / 0.8);
      
      // Use smoothstep/easeInOut math for buttery smooth camera transition
      const easeT = slerpProgress.current < 0.5 
        ? 2 * slerpProgress.current * slerpProgress.current 
        : 1 - Math.pow(-2 * slerpProgress.current + 2, 2) / 2;

      euler.current.x = THREE.MathUtils.lerp(startLookRef.current.x, targetLookRef.current.x, easeT);
      euler.current.y = THREE.MathUtils.lerp(startLookRef.current.y, targetLookRef.current.y, easeT);
      euler.current.z = 0; // Prevent weird neck rolling
      
      camera.quaternion.setFromEuler(euler.current);
    } else {
      camera.quaternion.setFromEuler(euler.current);
    }

    // Continuous Raycasting for Seats
    if (isFirstPerson && !isSitting && !sitTransition.current) {
      raycaster.setFromCamera(centerScreen, camera);
      
      const intersects = raycaster.intersectObjects(scene.children, true);
      const hit = intersects.find(i => i.object.name && i.object.name.startsWith('TheatreSeats'));
      
      const debugEl = document.getElementById('raycast-debug');
      if (debugEl) {
        if (intersects.length === 0) {
          debugEl.innerText = 'No intersections at all';
        } else if (!hit) {
          debugEl.innerText = `Hit ${intersects[0].object.name || 'unnamed'} at ${intersects[0].distance.toFixed(1)}m. No seats found.`;
        } else {
          debugEl.innerText = `Hit ${hit.object.name} id:${hit.instanceId} dist:${hit.distance.toFixed(1)}m`;
        }
      }

      if (hit) {
        const instanceId = hit.instanceId;
        
        // Increased distance to 10 to ensure it's not a distance issue
        if (instanceId !== undefined && hit.distance < 10) {
          // Read exact world position from the instanced mesh matrix to bypass Rapier instanceId shuffling
          // We can read from ANY of the instanced meshes, so we just use the hit object
          const hitMesh = hit.object as THREE.InstancedMesh;
          const matrix = new THREE.Matrix4();
          hitMesh.getMatrixAt(instanceId, matrix);
          const position = new THREE.Vector3().setFromMatrixPosition(matrix);
            
          // Reverse engineer row and col for UI tooltips
          const r = Math.round((position.z + 11) / 1.5);
          const s = Math.round(position.x + 14.5);

          const state = useAppStore.getState();
          if (!state.hoveredSeat || state.hoveredSeat.id !== instanceId) {
            state.setHoveredSeat({
              id: instanceId,
              row: r + 1,
              col: s + 1,
              position: [position.x, position.y, position.z]
            });
          }
        } else {
          const state = useAppStore.getState();
          if (state.hoveredSeat) state.setHoveredSeat(null);
        }
      } else {
        const state = useAppStore.getState();
        if (state.hoveredSeat) state.setHoveredSeat(null);
      }
    } else {
      const state = useAppStore.getState();
      if (state.hoveredSeat) state.setHoveredSeat(null);
    }
  });

  if (!isFirstPerson) return null;

  return (
    <RigidBody 
      ref={bodyRef} 
      position={[0, 8, 10]} 
      colliders={false} 
      mass={1} 
      type={(isSitting || sitTransition.current) ? "kinematicPosition" : "dynamic"}
      enabledRotations={[false, false, false]} 
      linearDamping={0.5}
    >
      <CapsuleCollider args={[0.5, 0.4]} />
    </RigidBody>
  );
}
