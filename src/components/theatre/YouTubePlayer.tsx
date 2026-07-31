import { useEffect, useRef } from 'react';
import { Html } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import YouTube, { type YouTubeEvent, type YouTubeProps } from 'react-youtube';
import { useAppStore } from '@/store/useAppStore';

export function YouTubePlayer() {
  const { videoId, setPlayerRef, setIsPlaying, setDuration, setCurrentTime, isPlaying, volume, isMuted } = useAppStore();
  const playerRef = useRef<any>(null);

  // Sync state with store on mount/update
  useEffect(() => {
    if (playerRef.current) {
      if (isPlaying) playerRef.current.playVideo();
      else playerRef.current.pauseVideo();
      
      playerRef.current.setVolume(volume);
      if (isMuted) playerRef.current.mute();
      else playerRef.current.unMute();
    }
  }, [isPlaying, volume, isMuted]);

  // Polling for current time
  useEffect(() => {
    const interval = setInterval(() => {
      if (playerRef.current && isPlaying) {
        setCurrentTime(playerRef.current.getCurrentTime());
      }
    }, 500);
    return () => clearInterval(interval);
  }, [isPlaying, setCurrentTime]);

  // Spatial Audio Simulation
  const lastVolumeUpdate = useRef(0);
  const screenPos = useRef(new THREE.Vector3(0, 5, -20)); // Center of screen/speakers

  useFrame(({ camera, clock }) => {
    if (!playerRef.current || !isPlaying || isMuted) return;
    
    // Throttle volume updates to avoid spamming the iframe API
    if (clock.elapsedTime - lastVolumeUpdate.current > 0.3) {
      lastVolumeUpdate.current = clock.elapsedTime;
      
      const dist = camera.position.distanceTo(screenPos.current);
      
      // Calculate multiplier (1.0 at screen, drops to 0.3 at the back wall Z=16)
      const maxDist = 38; // Approx max distance from front to back of room
      let mult = 1.0 - (dist / maxDist) * 0.7; 
      mult = Math.max(0.3, Math.min(1.0, mult)); // Clamp between 0.3 and 1.0
      
      const targetVolume = volume * mult;
      
      // The iframe API expects an integer between 0 and 100
      playerRef.current.setVolume(Math.round(targetVolume));
    }
  });

  const onReady: YouTubeProps['onReady'] = (event: YouTubeEvent) => {
    playerRef.current = event.target;
    setPlayerRef(event.target);
    setDuration(event.target.getDuration());
    event.target.setVolume(volume);
    if (isMuted) event.target.mute();
  };

  const onStateChange: YouTubeProps['onStateChange'] = (event: YouTubeEvent) => {
    // 1 = playing, 2 = paused
    if (event.data === 1) setIsPlaying(true);
    else if (event.data === 2) setIsPlaying(false);
  };

  const opts = {
    width: 1920,
    height: 1080,
    playerVars: {
      autoplay: 0,
      controls: 0,
      modestbranding: 1,
      rel: 0,
      disablekb: 1,
      fs: 0,
      iv_load_policy: 3,
    },
  };

  return (
    // Transform to match the size and position of the screen surface
    <Html
      transform
      occlude="blending"
      position={[0, 0, 0]}
      scale={0.73}
      zIndexRange={[100, 0]}
    >
      <div style={{
        width: '1920px',
        height: '1080px',
        minWidth: '1920px',
        minHeight: '1080px',
        background: 'black',
        borderRadius: '12px',
        overflow: 'hidden',
        boxShadow: '0 0 50px rgba(255,255,255,0.1)',
        position: 'relative'
      }}>
        <YouTube 
          videoId={videoId} 
          opts={opts} 
          onReady={onReady} 
          onStateChange={onStateChange} 
          style={{ width: '1920px', height: '1080px' }}
        />
        
        {/* Anti-click overlay to prevent user from clicking iframe directly and pausing video outside our controls */}
        <div style={{
          position: 'absolute',
          top: 0, left: 0, width: '1920px', height: '1080px',
          zIndex: 10
        }} />
      </div>
    </Html>
  );
}
