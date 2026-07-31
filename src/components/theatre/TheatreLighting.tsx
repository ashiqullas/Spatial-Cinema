import { useMemo, useRef, useEffect } from 'react';
import * as THREE from 'three';
import { Environment, SpotLight } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import { useAppStore } from '@/store/useAppStore';

export function TheatreLighting() {
  const isPlaying = useAppStore(state => state.isPlaying);
  const videoId = useAppStore(state => state.videoId);
  const videoColor = useAppStore(state => state.videoColor);
  const setVideoColor = useAppStore(state => state.setVideoColor);
  const setAmbilightStatus = useAppStore(state => state.setAmbilightStatus);
  
  const baseColorRef = useRef(new THREE.Color('#e2f1ff'));

  useEffect(() => {
    baseColorRef.current.set(videoColor);
  }, [videoColor]);

  // Extract dominant color from video thumbnail
  useEffect(() => {
    if (!videoId) return;

    setAmbilightStatus('Extracting color...');
    
    // We use mqdefault.jpg because it is guaranteed to exist for all videos (unlike hqdefault)
    const ytUrl = `https://img.youtube.com/vi/${videoId}/mqdefault.jpg`;
    
    // Fallback chain of reliable image CORS proxies
    const proxies = [
      `https://images.weserv.nl/?url=${encodeURIComponent(ytUrl)}`,
      `https://api.allorigins.win/raw?url=${encodeURIComponent(ytUrl)}`,
      `https://corsproxy.io/?${encodeURIComponent(ytUrl)}`
    ];
    
    let proxyIndex = 0;
    const img = new Image();
    img.crossOrigin = "Anonymous";

    const loadNextProxy = () => {
      if (proxyIndex >= proxies.length) {
        setAmbilightStatus('Error: All proxies failed.');
        return;
      }
      setAmbilightStatus(`Trying proxy ${proxyIndex + 1}...`);
      img.src = proxies[proxyIndex];
    };

    img.onload = () => {
      try {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;
        
        ctx.drawImage(img, 0, 0);
        
        // Sample the center chunk to avoid black bars
        const cropWidth = Math.min(img.width, 200);
        const cropHeight = Math.min(img.height, 100);
        const x = (img.width - cropWidth) / 2;
        const y = (img.height - cropHeight) / 2;

        const imageData = ctx.getImageData(x, y, cropWidth, cropHeight);
        const data = imageData.data;
        
        let r = 0, g = 0, b = 0, count = 0;
        const step = 4 * 10; // Sample every 10th pixel for speed
        
        for (let i = 0; i < data.length; i += step) {
          r += data[i];
          g += data[i+1];
          b += data[i+2];
          count++;
        }
        
        if (count === 0) {
          setAmbilightStatus('Error: Failed to process image data.');
          return;
        }

        r = Math.floor(r / count);
        g = Math.floor(g / count);
        b = Math.floor(b / count);

        const color = new THREE.Color(`rgb(${r}, ${g}, ${b})`);
        const hsl = { h: 0, s: 0, l: 0 };
        color.getHSL(hsl);
        
        // Boost saturation and clamp lightness for a vivid cinema glow
        color.setHSL(hsl.h, Math.max(0.6, hsl.s * 1.5), Math.max(0.4, Math.min(0.8, hsl.l)));
        
        const hex = `#${color.getHexString()}`;
        console.log("Ambilight successfully extracted color:", hex);
        setVideoColor(hex);
        setAmbilightStatus(`Active: ${hex}`);
      } catch (err) {
        console.error("Ambilight canvas error (likely CORS):", err);
        proxyIndex++;
        loadNextProxy(); // Try next proxy if canvas is tainted
      }
    };
    
    img.onerror = () => {
      console.error("Ambilight proxy failed to load image.");
      proxyIndex++;
      loadNextProxy();
    };
    
    // Start loading
    loadNextProxy();
    
  }, [videoId, setVideoColor, setAmbilightStatus]);
  
  const screenLightRef = useRef<THREE.RectAreaLight>(null);
  const ambientLightRef = useRef<THREE.AmbientLight>(null);
  const houseLightRef = useRef<THREE.DirectionalLight>(null);
  const projectorLightRef = useRef<THREE.SpotLight>(null);
  const aisleLeftRef = useRef<THREE.MeshStandardMaterial>(null);
  const aisleRightRef = useRef<THREE.MeshStandardMaterial>(null);
  
  const spotTarget = useMemo(() => {
    const target = new THREE.Object3D();
    target.position.set(0, 8, -25);
    return target;
  }, []);

  // Smooth cinematic lighting transitions
  useFrame((state) => {
    const t = state.clock.elapsedTime;
    const lerpSpeed = 0.02; // Slow, dramatic fade

    if (!isPlaying) {
      // INTERMISSION STATE (Paused)
      if (screenLightRef.current) screenLightRef.current.intensity = THREE.MathUtils.lerp(screenLightRef.current.intensity, 0.5, lerpSpeed);
      if (ambientLightRef.current) ambientLightRef.current.intensity = THREE.MathUtils.lerp(ambientLightRef.current.intensity, 2.5, lerpSpeed);
      if (houseLightRef.current) houseLightRef.current.intensity = THREE.MathUtils.lerp(houseLightRef.current.intensity, 2.0, lerpSpeed);
      if (projectorLightRef.current) projectorLightRef.current.intensity = THREE.MathUtils.lerp(projectorLightRef.current.intensity, 0, lerpSpeed * 2);
      if (aisleLeftRef.current) aisleLeftRef.current.emissiveIntensity = THREE.MathUtils.lerp(aisleLeftRef.current.emissiveIntensity, 2.0, lerpSpeed);
      if (aisleRightRef.current) aisleRightRef.current.emissiveIntensity = THREE.MathUtils.lerp(aisleRightRef.current.emissiveIntensity, 2.0, lerpSpeed);
    } else {
      // MOVIE MODE STATE (Playing)
      // Flicker intensity (fast)
      const flicker = Math.sin(t * 15) * 0.1 + Math.sin(t * 23) * 0.05 + Math.sin(t * 5) * 0.2;
      const r = Math.sin(t * 0.5) * 0.5 + 0.5;
      
      if (screenLightRef.current) {
        const targetIntensity = 2.0 + flicker * 1.5;
        screenLightRef.current.intensity = THREE.MathUtils.lerp(screenLightRef.current.intensity, targetIntensity, 0.1);
        
        // Ambilight: smoothly approach the extracted video color
        screenLightRef.current.color.lerp(baseColorRef.current, 0.05);
        
        // Faked dynamic scene changes: gently modulate the hue/brightness
        const hsl = { h: 0, s: 0, l: 0 };
        screenLightRef.current.color.getHSL(hsl);
        screenLightRef.current.color.setHSL(hsl.h + (r - 0.5) * 0.01, hsl.s, hsl.l);
      }
      
      if (projectorLightRef.current) {
        projectorLightRef.current.intensity = THREE.MathUtils.lerp(projectorLightRef.current.intensity, 2.5, lerpSpeed * 2);
        // Projector beam matches the screen light color
        if (screenLightRef.current) {
          projectorLightRef.current.color.copy(screenLightRef.current.color);
        }
      }
      
      if (ambientLightRef.current) ambientLightRef.current.intensity = THREE.MathUtils.lerp(ambientLightRef.current.intensity, 0.1, lerpSpeed);
      if (houseLightRef.current) houseLightRef.current.intensity = THREE.MathUtils.lerp(houseLightRef.current.intensity, 0, lerpSpeed);
      if (aisleLeftRef.current) aisleLeftRef.current.emissiveIntensity = THREE.MathUtils.lerp(aisleLeftRef.current.emissiveIntensity, 0.2, lerpSpeed);
      if (aisleRightRef.current) aisleRightRef.current.emissiveIntensity = THREE.MathUtils.lerp(aisleRightRef.current.emissiveIntensity, 0.2, lerpSpeed);
    }
  });

  return (
    <group>
      <primitive object={spotTarget} />
      
      {/* Global Ambient */}
      <ambientLight ref={ambientLightRef} intensity={2.5} />
      
      {/* House Lights (Bright for visibility, but warm) */}
      <directionalLight ref={houseLightRef} position={[0, 20, 0]} intensity={2.0} color="#ffeedd" castShadow={false} />

      {/* Very faint HDR for realistic specular reflections on materials */}
      <Environment preset="night" environmentIntensity={1.0} />

      {/* Screen Light Bounce (Simulating the screen illuminating the room) */}
      <rectAreaLight 
        ref={screenLightRef}
        width={50} 
        height={30} 
        color={videoColor}
        intensity={2} 
        position={[0, 10, -18]} 
        rotation={[-Math.PI, 0, 0]} 
      />
      
      {/* Projector Beam (Volumetric cone of light) */}
      <SpotLight
        ref={projectorLightRef}
        position={[0, 14.5, 14]}
        target={spotTarget}
        color={videoColor}
        intensity={0} // Starts at 0 (assuming paused by default)
        angle={0.35}
        penumbra={0.8}
        distance={100}
        castShadow
        shadow-mapSize={[1024, 1024]}
        volumetric
        opacity={0.8} 
        attenuation={50} 
        anglePower={5} 
        radiusTop={0.2}
        radiusBottom={16} 
      />

      {/* Left Aisle Neon */}
      <mesh position={[-16.5, 0.1, 5]}>
        <boxGeometry args={[0.1, 0.1, 30]} />
        <meshStandardMaterial ref={aisleLeftRef} color="#ff2222" emissive="#ff2222" emissiveIntensity={2} />
      </mesh>
      
      {/* Right Aisle Neon */}
      <mesh position={[16.5, 0.1, 5]}>
        <boxGeometry args={[0.1, 0.1, 30]} />
        <meshStandardMaterial ref={aisleRightRef} color="#ff2222" emissive="#ff2222" emissiveIntensity={2} />
      </mesh>

    </group>
  );
}
