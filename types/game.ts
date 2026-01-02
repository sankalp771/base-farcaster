
export type LogMessage = {
    id: number;
    text: string;
    type: 'info' | 'danger' | 'success' | 'warning';
    timestamp: string;
};

export type VirusStatus = 'STABLE' | 'UNSTABLE' | 'MUTATING';

export interface GameState {
    bots: number;
    kills: number;
    money: number;
    status: VirusStatus;
    logs: LogMessage[];
    attackVisual: boolean; // For triggering animations
}

export interface GameActions {
    deployBot: () => void;
    removeBot: () => void;
}

export interface GameEngine extends GameState, GameActions { }
