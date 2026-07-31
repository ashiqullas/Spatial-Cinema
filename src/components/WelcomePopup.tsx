import { useAppStore } from '@/store/useAppStore';

export function WelcomePopup() {
  const { hasSeenWelcome, setHasSeenWelcome } = useAppStore();

  if (hasSeenWelcome) return null;

  return (
    <div style={{
      position: 'absolute',
      inset: 0,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: 'rgba(0, 0, 0, 0.75)',
      backdropFilter: 'blur(10px)',
      zIndex: 9999,
      pointerEvents: 'auto'
    }}>
      <div className="glass-panel" style={{
        maxWidth: '600px',
        width: '90%',
        padding: '40px',
        borderRadius: '24px',
        display: 'flex',
        flexDirection: 'column',
        gap: '24px',
        animation: 'fadeIn 0.5s ease-out'
      }}>
        <div style={{ textAlign: 'center' }}>
          <h1 className="text-gradient" style={{ fontSize: '36px', margin: '0 0 8px 0' }}>Spatial Cinema</h1>
          <p style={{ color: 'rgba(255, 255, 255, 0.7)', margin: 0, fontSize: '16px' }}>Coded by Ashiq Ullas</p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', color: 'rgba(255,255,255,0.9)', fontSize: '15px', lineHeight: '1.6' }}>
          <p style={{ margin: 0 }}>
            Welcome to your personal 3D interactive theatre! Paste any YouTube link into the top bar to watch it on the big screen with dynamic ambient lighting.
          </p>
          
          <div style={{ background: 'rgba(255,255,255,0.05)', padding: '16px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)' }}>
            <h3 style={{ margin: '0 0 12px 0', color: '#fff', fontSize: '16px' }}>How to Use:</h3>
            <ul style={{ margin: 0, paddingLeft: '20px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <li><strong>Look Around:</strong> Click and drag your mouse.</li>
              <li><strong>Move:</strong> Use <kbd>W</kbd><kbd>A</kbd><kbd>S</kbd><kbd>D</kbd> keys (First Person Mode).</li>
              <li><strong>Sit Down:</strong> Hover over any red seat and click to sit down. Press ESC to stand up.</li>
              <li><strong>Quick Views:</strong> Use the camera controls at the bottom of the screen to quickly jump to the VIP section or Balcony.</li>
            </ul>
          </div>
        </div>

        <button 
          className="ui-button"
          onClick={() => setHasSeenWelcome(true)}
          style={{
            padding: '16px',
            fontSize: '18px',
            fontWeight: '600',
            background: 'linear-gradient(135deg, #00C6FF, #0072FF)',
            color: 'white',
            border: 'none',
            borderRadius: '12px',
            cursor: 'pointer',
            marginTop: '8px',
            transition: 'transform 0.2s, opacity 0.2s'
          }}
          onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.02)'}
          onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
        >
          Enter Theatre
        </button>
      </div>
    </div>
  );
}
