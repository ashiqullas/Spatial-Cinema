import { useAppStore } from '@/store/useAppStore';
import { Keyboard, MousePointer2 } from 'lucide-react';

export function ControlsOverlay() {
  const { isSitting } = useAppStore();

  return (
    <div style={{
      position: 'absolute',
      top: 100,
      left: 32,
      display: 'flex',
      flexDirection: 'column',
      gap: '8px',
      pointerEvents: 'none',
      zIndex: 10
    }}>
      {isSitting ? (
        <>
          <ControlHint icon={<MousePointer2 size={16} />} text="Look Around" />
          <ControlHint icon={<kbd>SPACE</kbd>} text="Stand Up" />
        </>
      ) : (
        <>
          <ControlHint icon={<Keyboard size={16} />} text="W A S D to Move" />
          <ControlHint icon={<MousePointer2 size={16} />} text="Look Around" />
          <ControlHint icon={<MousePointer2 size={16} />} text="Click Seat to Sit" />
        </>
      )}
    </div>
  );
}

function ControlHint({ icon, text }: { icon: React.ReactNode, text: string }) {
  return (
    <div style={{
      background: 'rgba(0, 0, 0, 0.6)',
      backdropFilter: 'blur(4px)',
      border: '1px solid rgba(255, 255, 255, 0.1)',
      padding: '8px 12px',
      borderRadius: '8px',
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
      color: 'white',
      fontSize: '14px',
      fontWeight: 500,
      boxShadow: '0 4px 6px rgba(0,0,0,0.3)'
    }}>
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        background: 'rgba(255,255,255,0.1)',
        padding: '4px 8px',
        borderRadius: '4px',
        minWidth: '24px'
      }}>
        {icon}
      </div>
      <span style={{ textTransform: 'uppercase', letterSpacing: '0.5px', opacity: 0.9 }}>{text}</span>
    </div>
  );
}
