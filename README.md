<div align="center">
  <h1>🍿 Spatial Cinema</h1>
  <p>A photorealistic 3D IMAX-style virtual cinema experience built with React Three Fiber, featuring a working YouTube player, spatial audio, and an Apple Vision Pro inspired interface.</p>
</div>

---

## ✨ Features

- **📺 Working 3D Cinema Screen:** Paste any YouTube URL and watch it directly inside the 3D theatre.
- **🕶️ Spatial UI:** An Apple Vision Pro inspired user interface featuring heavy glassmorphism, completely rounded aesthetics, and smooth animations that never block the screen.
- **🦆 Dynamic Audience:** A fun, animated audience of bouncy rubber ducks that dynamically react and idle while you watch the movie.
- **💡 "Movie Mode" Lighting:** Pressing play seamlessly plunges the room into darkness, illuminates a volumetric projector beam, and boosts the screen's cinematic bloom effect.
- **🔊 Spatial 3D Audio:** Sound is fully spatialized. The audio originates from the screen and bounces dynamically based on your physical location in the room.
- **🏃‍♂️ First-Person Immersion:** Walk around the theatre with WASD and Mouse controls, physically sit down in any available seat, and look around.

## 🛠️ Tech Stack

- **Framework:** React 19 + TypeScript + Vite
- **3D Engine:** Three.js + React Three Fiber (`@react-three/fiber`)
- **3D Helpers:** `@react-three/drei`
- **Post-Processing:** `@react-three/postprocessing` (Bloom, N8AO, Vignette)
- **Physics:** Rapier (`@react-three/rapier`) for First-Person collision and gravity
- **Animation:** GSAP for cinematic camera and sitting transitions
- **State Management:** Zustand

## 🚀 Getting Started

### Prerequisites
Make sure you have [Node.js](https://nodejs.org/) installed on your machine.

### Installation

1. Clone the repository:
```bash
git clone https://github.com/your-username/spatial-cinema.git
cd spatial-cinema
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Open your browser and navigate to `http://localhost:5173`.

## 🎮 Controls

### First Person Mode
- **F**: Enter / Exit First-Person walking mode
- **W, A, S, D**: Walk around the theatre
- **Mouse**: Look around
- **Shift**: Sprint

### Interaction
- **E**: Sit down in the currently highlighted seat
- **ESC**: Stand up from your seat
- **U**: Show / Hide the Spatial UI interface

## 🎨 UI Theme
The interface includes a built-in UI theme toggle, allowing you to seamlessly swap the glass panels between a sleek "Dark Glass" and a frosted "Light Glass" aesthetic without breaking immersion.

## 📄 License
This project is open source and available under the [MIT License](LICENSE).
