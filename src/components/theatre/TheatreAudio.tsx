import { useEffect, useRef, useState } from 'react';
import { useAppStore } from '@/store/useAppStore';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';

export function TheatreAudio() {
  const { isPlaying } = useAppStore();
  const [audioEnabled, setAudioEnabled] = useState(false);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const pannerRef = useRef<PannerNode | null>(null);

  const { camera } = useThree();

  // Allow audio to start only after user interacts with the page
  useEffect(() => {
    const handleInteraction = () => setAudioEnabled(true);
    window.addEventListener('click', handleInteraction, { once: true });
    window.addEventListener('keydown', handleInteraction, { once: true });
    return () => {
      window.removeEventListener('click', handleInteraction);
      window.removeEventListener('keydown', handleInteraction);
    };
  }, []);

  useEffect(() => {
    if (!audioEnabled) return;

    const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    audioCtxRef.current = ctx;

    // Create a 2-second buffer of white noise
    const bufferSize = ctx.sampleRate * 2;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }

    const noiseSource = ctx.createBufferSource();
    noiseSource.buffer = buffer;
    noiseSource.loop = true;

    // Spatial Panner Node (anchored to the projector booth at back of theatre)
    const panner = ctx.createPanner();
    panner.panningModel = 'HRTF';
    panner.distanceModel = 'inverse';
    panner.refDistance = 10;
    panner.maxDistance = 100;
    panner.rolloffFactor = 1.5;
    
    // Projector booth position
    panner.positionX.value = 0;
    panner.positionY.value = 15;
    panner.positionZ.value = 39;
    
    pannerRef.current = panner;

    // 1. Deep Rumble (simulates large cinema HVAC / Subwoofer hum)
    const rumbleFilter = ctx.createBiquadFilter();
    rumbleFilter.type = 'lowpass';
    rumbleFilter.frequency.value = 100;
    
    const rumbleGain = ctx.createGain();
    rumbleGain.gain.value = 1.5;

    // 2. Air Vents (simulates high frequency air pushing through vents)
    const airFilter = ctx.createBiquadFilter();
    airFilter.type = 'bandpass';
    airFilter.frequency.value = 800;
    airFilter.Q.value = 0.5;

    const airGain = ctx.createGain();
    airGain.gain.value = 0.03;

    // Master Volume Control
    const masterGain = ctx.createGain();
    // When the movie is playing, the ambient noise gets slightly drowned out naturally
    masterGain.gain.value = isPlaying ? 0.2 : 0.6;
    
    // Smooth transition for master volume
    masterGain.gain.setTargetAtTime(isPlaying ? 0.2 : 0.6, ctx.currentTime, 1.5);

    // Route audio graph: Noise -> Filters -> Panner -> Master -> Destination
    noiseSource.connect(rumbleFilter);
    rumbleFilter.connect(rumbleGain);
    rumbleGain.connect(panner);

    noiseSource.connect(airFilter);
    airFilter.connect(airGain);
    airGain.connect(panner);

    panner.connect(masterGain);
    masterGain.connect(ctx.destination);

    noiseSource.start();

    return () => {
      noiseSource.stop();
      ctx.close();
    };
  }, [audioEnabled, isPlaying]);

  // Sync Web Audio listener with Three.js camera for true spatial audio
  useFrame(() => {
    const ctx = audioCtxRef.current;
    if (!ctx || !camera) return;

    const listener = ctx.listener;
    
    // Update Listener Position
    listener.positionX.value = camera.position.x;
    listener.positionY.value = camera.position.y;
    listener.positionZ.value = camera.position.z;

    // Update Listener Orientation
    const forward = new THREE.Vector3();
    camera.getWorldDirection(forward);
    
    const up = new THREE.Vector3(0, 1, 0);
    up.applyQuaternion(camera.quaternion);

    listener.forwardX.value = forward.x;
    listener.forwardY.value = forward.y;
    listener.forwardZ.value = forward.z;
    
    listener.upX.value = up.x;
    listener.upY.value = up.y;
    listener.upZ.value = up.z;
  });

  return null;
}
