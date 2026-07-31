import { useEffect, useRef } from 'react';
import { useThree } from '@react-three/fiber';
import gsap from 'gsap';
import { useAppStore } from '@/store/useAppStore';
import * as THREE from 'three';

export function CameraRig() {
  const { camera } = useThree();
  const activeView = useAppStore((state) => state.activeView);
  const isFirstPerson = useAppStore((state) => state.isFirstPerson);
  
  // References to smoothly interpolate position and look targets
  const currentLook = useRef(new THREE.Vector3(0, 5, -20));

  useEffect(() => {
    // Target position and look point based on view
    let targetX = 0, targetY = 6, targetZ = 0;
    let lookX = 0, lookY = 5, lookZ = -20;

    switch (activeView) {
      case 'frontRow':
        targetX = 0; targetY = 2; targetZ = -10;
        lookY = 5;
        break;
      case 'middle':
        targetX = 0; targetY = 6; targetZ = 0;
        lookY = 5;
        break;
      case 'vip':
        targetX = 0; targetY = 8; targetZ = 5;
        lookY = 5;
        break;
      case 'balcony':
        targetX = 0; targetY = 15; targetZ = 18;
        lookY = 5;
        break;
      case 'side':
        targetX = -12; targetY = 6; targetZ = 2;
        lookY = 5;
        break;
      case 'top':
        targetX = 0; targetY = 25; targetZ = 5;
        lookY = 0; lookZ = -10;
        break;
    }

    // If in first person, kill any active tweens on the camera and skip cinematic movement
    if (isFirstPerson) {
      gsap.killTweensOf(camera.position);
      gsap.killTweensOf(currentLook.current);
      return;
    }

    // Animate the lookAt target vector
    gsap.to(currentLook.current, {
      x: lookX,
      y: lookY,
      z: lookZ,
      duration: 2,
      ease: 'power3.inOut'
    });

    // Animate the camera position and apply lookAt every frame
    gsap.to(camera.position, {
      x: targetX,
      y: targetY,
      z: targetZ,
      duration: 2,
      ease: 'power3.inOut',
      onUpdate: () => {
        camera.lookAt(currentLook.current);
      }
    });
  }, [activeView, camera, isFirstPerson]);

  return null;
}
