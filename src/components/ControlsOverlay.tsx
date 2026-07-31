import { useAppStore } from '@/store/useAppStore';
import { Keyboard, MousePointer2 } from 'lucide-react';

export function ControlsOverlay() {
  const { isSitting } = useAppStore();

  return (
    <div style={{
      position: 'absolute',
      top: 100,
      left: 32,
      pointerEvents: 'none',
      zIndex: 10,
      animation: 'fadeIn 0.5s ease-out'
    }}>
      <div style={{
        background: 'rgba(0, 0, 0, 0.45)',
        backdropFilter: 'blur(8px)',
        borderLeft: '3px solid rgba(255, 255, 255, 0.8)',
        padding: '16px 20px',
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
        minWidth: '220px',
        boxShadow: '0 10px 30px rgba(0,0,0,0.3)'
      }}>
        {isSitting ? (
          <>
            <ControlRow icon={<MousePointer2 size={16} strokeWidth={2.5} />} text="Look Around" />
            <ControlRow icon={<span style={{ fontWeight: 800, fontSize: '12px', letterSpacing: '1px' }}>SPACE</span>} text="Stand Up" />
          </>
        ) : (
          <>
            <ControlRow icon={<Keyboard size={16} strokeWidth={2.5} />} text="Walk" />
            <ControlRow icon={<MousePointer2 size={16} strokeWidth={2.5} />} text="Look Around" />
            <ControlRow icon={<MousePointer2 size={16} strokeWidth={2.5} />} text="Sit Down" />
          </>
        )}
      </div>
    </div>
  );
}

function ControlRow({ icon, text }: { icon: React.ReactNode, text: string }) {
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: '16px',
      color: 'rgba(255, 255, 255, 0.9)',
      fontSize: '13px',
      fontWeight: 600,
      letterSpacing: '0.5px',
      textTransform: 'uppercase'
    }}>
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        width: '28px',
        height: '28px',
        background: 'rgba(255, 255, 255, 0.15)',
        borderRadius: '4px',
        color: '#fff'
      }}>
        {icon}
      </div>
      <span>{text}</span>
    </div>
  );
}
