# Implementation Plan - Virus Eater Lab UI

This plan outlines the steps to build the "Virus Eater Lab" game dashboard with a cinematic video intro.

## User Requirements
- **Theme**: Sci-fi emerald virus lab (Dark, Neon Green, Glassmorphism).
- **Layout**: Center Tank, Left Controls, Right Leaderboard.
- **Intro**: Play specific video (`Game_Intro_Creation_VI₹US_COOK.mp4`) before showing UI.
- **Tech**: Next.js (App Router), Tailwind CSS.
- **State**: Mocked local state (no backend).

## Step 1: Asset Management
- **Action**: Copy the intro video from `C:\Users\PC\Downloads\Game_Intro_Creation_VI₹US_COOK.mp4` to `./public/intro.mp4`.
- **Validation**: Verify file exists in `public/`.

## Step 2: Styling Setup (`tailwind.config.ts` & `globals.css`)
- **Tailwind Config**:
    - Add custom colors: `emerald-950` (background), `neon-green` (accents).
    - Add animations: `pulse-slow`, `float`, `bubble-rise`.
- **Global CSS**:
    - Set default body background to dark emerald/black.
    - Add utility classes for glassmorphism if needed.

## Step 3: Components
Create a folder `components/VirusLab/` for organization.

### 3.1 `components/IntroVideo.tsx`
- Fullscreen `<video>` element.
- Props: `onComplete: () => void`.
- Auto-play, muted (initially, maybe unmuted if possible, but web policies often require interaction), playsinline.
- "Skip" button (optional but good UX).

### 3.2 `components/VirusLab/Tank.tsx`
- **Visuals**:
    - Glowing glass cylinder CSS.
    - Inside: Animated "virus" SVG/Div.
    - Bubbles animation using CSS keyframes.

### 3.3 `components/VirusLab/Controls.tsx`
- **UI**:
    - "Active Bots" counter.
    - Buttons: "Deploy Bot", "Remove Bot".
    - Stats: "Total Kills", "Combo", "P&L".
- **Props**: Receives state and handlers from Dashboard.

### 3.4 `components/VirusLab/Leaderboard.tsx`
- **UI**:
    - Table with columns: Rank, Player, Kills, P&L.
    - Mocked data rows.

### 3.5 `components/VirusLab/Dashboard.tsx`
- **Layout**:
    - 3-column grid (or Flexbox for responsiveness).
    - Manages state: `bots`, `kills`, `money`.
    - Composes Tank, Controls, and Leaderboard.

## Step 4: Page Integration (`app/page.tsx`)
- **Logic**:
    - State `showIntro` (true initially).
    - Render `IntroVideo` if `showIntro` is true.
    - Render `Dashboard` when `onComplete` is fired.

## Step 5: Verification
- Run `pnpm dev`.
- Verify video plays on load.
- Verify transition to Dashboard.
- Verify UI matches "Virus Eater Lab" aesthetic (Green/Neon/Dark).
