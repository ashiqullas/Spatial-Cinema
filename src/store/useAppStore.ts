import { create } from 'zustand';

export type TheatreView = 'frontRow' | 'middle' | 'vip' | 'balcony' | 'side' | 'top';

export interface SeatData {
  id: number;
  row: number;
  col: number;
  position: [number, number, number];
}

interface AppState {
  isFirstPerson: boolean;
  setIsFirstPerson: (isFirstPerson: boolean) => void;
  
  // Interactive Seat State
  hoveredSeat: SeatData | null;
  setHoveredSeat: (seat: SeatData | null) => void;
  isSitting: boolean;
  setIsSitting: (sitting: boolean) => void;
  lastSeatId: number | null;
  setLastSeatId: (id: number | null) => void;

  activeView: TheatreView;
  setActiveView: (view: TheatreView) => void;
  isUIVisible: boolean;
  toggleUI: () => void;
  
  // YouTube Player State
  playerRef: any;
  setPlayerRef: (ref: any) => void;
  videoId: string;
  setVideoId: (id: string) => void;
  isPlaying: boolean;
  setIsPlaying: (playing: boolean) => void;
  volume: number;
  setVolume: (volume: number) => void;
  isMuted: boolean;
  setIsMuted: (muted: boolean) => void;
  currentTime: number;
  setCurrentTime: (time: number) => void;
  duration: number;
  setDuration: (duration: number) => void;
  
  // Performance State
  performanceLevel: number;
  setPerformanceLevel: (level: number) => void;
  
  // UI State
  uiTheme: 'dark' | 'light';
  setUiTheme: (theme: 'dark' | 'light') => void;
  
  // Ambilight State
  videoColor: string;
  setVideoColor: (color: string) => void;
  ambilightStatus: string | null;
  setAmbilightStatus: (status: string | null) => void;
  
  hasSeenWelcome: boolean;
  setHasSeenWelcome: (seen: boolean) => void;
}

export const useAppStore = create<AppState>((set) => ({
  isFirstPerson: false,
  setIsFirstPerson: (isFirstPerson) => set({ isFirstPerson }),
  
  hoveredSeat: null,
  setHoveredSeat: (seat) => set({ hoveredSeat: seat }),
  isSitting: false,
  setIsSitting: (sitting) => set({ isSitting: sitting }),
  lastSeatId: null,
  setLastSeatId: (id) => set({ lastSeatId: id }),

  activeView: 'middle',
  setActiveView: (view) => set({ activeView: view }),
  isUIVisible: true,
  toggleUI: () => set((state) => ({ isUIVisible: !state.isUIVisible })),
  
  playerRef: null,
  setPlayerRef: (ref) => set({ playerRef: ref }),
  videoId: 'dQw4w9WgXcQ', // default video
  setVideoId: (id) => set({ videoId: id }),
  isPlaying: false,
  setIsPlaying: (playing) => set({ isPlaying: playing }),
  volume: 100,
  setVolume: (volume) => set({ volume }),
  isMuted: false,
  setIsMuted: (muted) => set({ isMuted: muted }),
  currentTime: 0,
  setCurrentTime: (time) => set({ currentTime: time }),
  duration: 0,
  setDuration: (duration) => set({ duration }),
  
  performanceLevel: 1, // Default to high quality
  setPerformanceLevel: (level) => set({ performanceLevel: level }),
  
  uiTheme: 'dark',
  setUiTheme: (theme) => set({ uiTheme: theme }),
  
  videoColor: '#e2f1ff',
  setVideoColor: (color) => set({ videoColor: color }),
  
  ambilightStatus: null,
  setAmbilightStatus: (status) => set({ ambilightStatus: status }),
  
  hasSeenWelcome: false,
  setHasSeenWelcome: (seen) => set({ hasSeenWelcome: seen }),
}));
