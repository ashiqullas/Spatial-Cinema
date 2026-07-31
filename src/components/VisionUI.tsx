import { useState, useEffect } from 'react';
import { useAppStore, type TheatreView } from '@/store/useAppStore';
import { WelcomePopup } from './WelcomePopup';
import { Play, Pause, Volume2, VolumeX, Maximize, Sun, Moon, Eye, MapPin, Video, Activity, EyeOff } from 'lucide-react';

function FPSCounter() {
  const [fps, setFps] = useState(60);

  useEffect(() => {
    let frameCount = 0;
    let lastTime = performance.now();
    let animationFrameId: number;

    const measureFPS = () => {
      const now = performance.now();
      frameCount++;
      if (now - lastTime >= 1000) {
        setFps(Math.round((frameCount * 1000) / (now - lastTime)));
        frameCount = 0;
        lastTime = now;
      }
      animationFrameId = requestAnimationFrame(measureFPS);
    };

    animationFrameId = requestAnimationFrame(measureFPS);
    return () => cancelAnimationFrame(animationFrameId);
  }, []);

  return (
    <div className="vision-panel" style={{ padding: '6px 12px', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', fontWeight: 600 }}>
      <Activity size={14} color={fps >= 50 ? '#4ade80' : fps >= 30 ? '#facc15' : '#f87171'} />
      <span>{fps} FPS</span>
    </div>
  );
}

export function VisionUI() {
  const { 
    isUIVisible,
    isPlaying, setIsPlaying,
    volume, setVolume,
    isMuted, setIsMuted,
    currentTime, duration,
    setVideoId,
    activeView, setActiveView,
    isFirstPerson, setIsFirstPerson,
    isSitting, hoveredSeat, lastSeatId,
    uiTheme, setUiTheme,
    toggleUI
  } = useAppStore();

  const [urlInput, setUrlInput] = useState('');

  const themeClass = uiTheme === 'dark' ? 'vision-theme-dark' : 'vision-theme-light';

  const formatTime = (time: number) => {
    const mins = Math.floor(time / 60);
    const secs = Math.floor(time % 60).toString().padStart(2, '0');
    return `${mins}:${secs}`;
  };

  const handleUrlSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = urlInput.match(regExp);
    if (match && match[2].length === 11) {
      setVideoId(match[2]);
      setUrlInput('');
    } else {
      alert("Please enter a valid YouTube URL");
    }
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(err => {
        console.error(`Error attempting to enable fullscreen: ${err.message}`);
      });
    } else {
      document.exitFullscreen();
    }
  };

  const views: { id: TheatreView; label: string }[] = [
    { id: 'frontRow', label: 'Front Row' },
    { id: 'middle', label: 'Middle' },
    { id: 'vip', label: 'VIP' },
    { id: 'balcony', label: 'Balcony' },
    { id: 'side', label: 'Side' },
    { id: 'top', label: 'Top' },
  ];

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if typing in input
      if (document.activeElement?.tagName === 'INPUT') return;
      
      const state = useAppStore.getState();
      if (e.code === 'KeyF') {
        if (!state.isSitting) state.setIsFirstPerson(!state.isFirstPerson);
      }
      if (e.code === 'KeyU') {
        state.toggleUI();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <div className={themeClass} style={{
      position: 'absolute',
      top: 0, left: 0, right: 0, bottom: 0,
      pointerEvents: 'none',
      zIndex: 999999
    }}>
      
      {/* Top Bar (Title, FPS, Show/Hide UI) - ALWAYS VISIBLE TO ALLOW UN-HIDING */}
      <div style={{ position: 'absolute', top: 24, left: 32, right: 32, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          <h1 className="text-gradient" style={{ margin: 0, fontSize: '24px', fontWeight: 700, pointerEvents: 'auto', opacity: isUIVisible ? 1 : 0, transition: 'opacity 0.3s' }}>Spatial Cinema</h1>
        </div>
        <div style={{ display: 'flex', gap: 12, pointerEvents: 'auto' }}>
          <FPSCounter />
          <button className="vision-pill-button" onClick={() => toggleUI()}>
            {isUIVisible ? <><EyeOff size={16} /> Hide UI (U)</> : <><Eye size={16} /> Show UI (U)</>}
          </button>
        </div>
      </div>

      {/* Crosshair / Hover Info for First Person Mode - ALWAYS VISIBLE IN FPV */}
      {isFirstPerson && (
        <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', pointerEvents: 'none' }}>
          <div style={{ width: 4, height: 4, backgroundColor: 'white', borderRadius: '50%', boxShadow: '0 0 4px rgba(0,0,0,0.5)' }} />
          {hoveredSeat && !isSitting && (
            <div className="vision-panel" style={{ position: 'absolute', top: 20, left: '50%', transform: 'translateX(-50%)', padding: '12px 24px', textAlign: 'center', minWidth: 150 }}>
              <div style={{ fontSize: 12, color: 'var(--v-text-dim)', marginBottom: 4 }}>Row {hoveredSeat.row} &middot; Seat {hoveredSeat.col}</div>
              <div style={{ fontSize: 14, fontWeight: 600 }}>Press <span style={{ color: '#4ade80' }}>[E]</span> to Sit</div>
            </div>
          )}
        </div>
      )}

      {/* Walk Hint - VISIBLE WHEN WALKING IN FPV */}
      {isFirstPerson && !isSitting && (
        <div className="vision-panel" style={{ position: 'absolute', bottom: 120, left: '50%', transform: 'translateX(-50%)', padding: '12px 24px', pointerEvents: 'auto', display: 'flex', gap: '16px', alignItems: 'center', opacity: 0.8 }}>
          <div style={{ fontSize: 14, fontWeight: 600 }}>Use <span style={{ color: '#4ade80' }}>W A S D</span> to move</div>
          <div style={{ width: 4, height: 4, borderRadius: 2, background: 'rgba(255,255,255,0.3)' }} />
          <div style={{ fontSize: 14, fontWeight: 600 }}>Click to <span style={{ color: '#4ade80' }}>Look</span></div>
          <div style={{ width: 4, height: 4, borderRadius: 2, background: 'rgba(255,255,255,0.3)' }} />
          <div style={{ fontSize: 14, fontWeight: 600 }}>Press <span style={{ color: '#4ade80' }}>ESC</span> to free mouse</div>
        </div>
      )}

      {/* Stand Up Hint - ALWAYS VISIBLE WHEN SITTING IN FPV */}
      {isFirstPerson && isSitting && (
        <div className="vision-panel" style={{ position: 'absolute', bottom: 120, left: '50%', transform: 'translateX(-50%)', padding: '12px 24px', pointerEvents: 'auto' }}>
          <div style={{ fontSize: 14, fontWeight: 600 }}>Press <span style={{ color: '#4ade80' }}>[SPACE]</span> to stand up</div>
        </div>
      )}

      {/* PANELS THAT HIDE WHEN UI IS INVISIBLE */}
      <div style={{ opacity: isUIVisible ? 1 : 0, pointerEvents: isUIVisible ? 'auto' : 'none', transition: 'opacity 0.3s ease' }}>
        
        {/* Right Side Panel (Settings & Input) */}
        <div style={{ position: 'absolute', top: 100, right: 32, width: 320, display: 'flex', flexDirection: 'column', gap: 16 }}>
          
          {/* Load Movie */}
          <div className="vision-panel" style={{ padding: 24 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16, fontWeight: 600 }}>
              <Video size={18} /> Load Movie
            </div>
            <form onSubmit={handleUrlSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <input 
                type="text" 
                className="vision-input" 
                value={urlInput} 
                onChange={e => setUrlInput(e.target.value)} 
                placeholder="Paste YouTube URL..." 
              />
              <button type="submit" className="vision-pill-button" style={{ width: '100%', justifyContent: 'center' }}>Play Video</button>
            </form>
          </div>

          {/* Seat & Camera Selector */}
          <div className="vision-panel" style={{ padding: 24, opacity: isFirstPerson ? 0.5 : 1, transition: 'opacity 0.3s' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16, fontWeight: 600 }}>
              <MapPin size={18} /> Camera Views
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
              {views.map((view) => (
                <button
                  key={view.id}
                  disabled={isFirstPerson}
                  className={`vision-pill-button ${activeView === view.id && !isFirstPerson ? 'active' : ''}`}
                  onClick={() => setActiveView(view.id)}
                  style={{ padding: '8px', fontSize: '13px' }}
                >
                  {view.label}
                </button>
              ))}
            </div>
            {lastSeatId && (
              <div style={{ marginTop: 16, fontSize: 13, color: 'var(--v-text-dim)', textAlign: 'center' }}>
                Last seated: Seat {lastSeatId}
              </div>
            )}
          </div>
        </div>

        {/* Bottom Dock (Main Controls) */}
        <div style={{ position: 'absolute', bottom: 32, left: '50%', transform: 'translateX(-50%)' }}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>
            
            {/* Progress Bar Island */}
            <div className="vision-panel vision-dock" style={{ padding: '8px 24px', gap: 16, width: 400 }}>
              <span style={{ fontSize: 12, fontWeight: 600, width: 40, textAlign: 'right' }}>{formatTime(currentTime)}</span>
              <input 
                type="range" min="0" max={duration || 100} value={currentTime}
                onChange={(e) => {
                  const time = Number(e.target.value);
                  const player = useAppStore.getState().playerRef;
                  if (player) player.seekTo(time, true);
                }}
                className="vision-slider" style={{ flex: 1 }}
              />
              <span style={{ fontSize: 12, fontWeight: 600, width: 40 }}>{formatTime(duration)}</span>
            </div>

            {/* Main Controls Dock */}
            <div className="vision-panel vision-dock" style={{ padding: '8px 16px', gap: 12 }}>
              <button className="vision-button" onClick={() => setIsPlaying(!isPlaying)} style={{ background: isPlaying ? 'var(--v-active)' : 'var(--v-hover)' }}>
                {isPlaying ? <Pause size={20} fill="currentColor" /> : <Play size={20} fill="currentColor" />}
              </button>
              
              <div style={{ width: 1, height: 24, background: 'var(--v-border)' }} />

              <button className="vision-button" onClick={() => setIsMuted(!isMuted)}>
                {isMuted || volume === 0 ? <VolumeX size={18} /> : <Volume2 size={18} />}
              </button>
              
              <input 
                type="range" min="0" max="100" value={isMuted ? 0 : volume}
                onChange={(e) => { setVolume(Number(e.target.value)); if (isMuted) setIsMuted(false); }}
                className="vision-slider" style={{ width: 80 }}
              />

              <div style={{ width: 1, height: 24, background: 'var(--v-border)' }} />

              <button 
                className={`vision-button ${isFirstPerson ? 'active' : ''}`} 
                onClick={() => {
                  if (!isSitting) setIsFirstPerson(!isFirstPerson);
                }}
                title="First Person Mode (F)"
              >
                <Eye size={18} />
              </button>

              <button 
                className="vision-button" 
                onClick={() => setUiTheme(uiTheme === 'dark' ? 'light' : 'dark')}
                title="Toggle UI Theme"
              >
                {uiTheme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
              </button>

              <button className="vision-button" onClick={toggleFullscreen} title="Fullscreen">
                <Maximize size={18} />
              </button>
            </div>
          </div>
        </div>

      </div>
      
      <WelcomePopup />
    </div>
  );
}
