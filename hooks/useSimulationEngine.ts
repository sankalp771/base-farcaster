import { useState, useEffect, useRef } from 'react';
import { GameEngine, LogMessage, VirusStatus } from '@/types/game';

export function useSimulationEngine(videoEnded: boolean = true): GameEngine {
    const [bots, setBots] = useState(1);
    const [kills, setKills] = useState(1240);
    const [money, setMoney] = useState(500);
    const [virusStatus, setVirusStatus] = useState<VirusStatus>('STABLE');
    const [logs, setLogs] = useState<LogMessage[]>([]);
    const [attackVisual, setAttackVisual] = useState(false);

    // Helper to add logs
    const addLog = (text: string, type: LogMessage['type'] = 'info') => {
        const now = new Date();
        const time = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}`;
        setLogs(prev => [...prev.slice(-20), { id: Date.now(), text, type, timestamp: time }]);
    };

    // Game Loop
    useEffect(() => {
        if (!videoEnded) return;

        const gameLoop = setInterval(() => {
            // Base Income
            if (bots > 0) {
                setKills(prev => prev + (bots * Math.floor(Math.random() * 3 + 1)));
                setMoney(prev => prev + (bots * 0.5));

                // Random Attack Animation
                if (Math.random() > 0.7) {
                    setAttackVisual(true);
                    setTimeout(() => setAttackVisual(false), 500);
                }
            }

            // --- RANDOM EVENTS ---
            const roll = Math.random();

            // Event: Virus Mutation (Danger) - 10% Chance
            if (roll < 0.10 && bots > 0) {
                setVirusStatus('MUTATING');
                addLog("⚠️ ANOMALY DETECTED: Virus strain mutating unstable!", 'warning');

                // 50% chance the mutation kills a bot
                setTimeout(() => {
                    if (Math.random() > 0.5) {
                        setBots(prev => Math.max(0, prev - 1));
                        addLog("💀 CRITICAL FAILURE: Agent unit 0x" + Math.floor(Math.random() * 1000).toString(16) + " disconnected.", 'danger');
                        addLog("Unknown entity bypassed firewall protocols.", 'danger');
                    } else {
                        addLog("🛡️ DEFENSE SUCCESS: Mutation contained.", 'success');
                    }
                    setVirusStatus('STABLE');
                }, 3000);
            }

            // Event: Encrypted Signal (Flavor) - 5% Chance
            else if (roll > 0.95) {
                const messages = [
                    "Processing neural handshake...",
                    "Signal intercepted from Sector 7...",
                    "Downloading virus schematics...",
                    "Brute forcing private key...",
                    "Packet loss detected in rendering engine..."
                ];
                addLog(messages[Math.floor(Math.random() * messages.length)], 'info');
            }

        }, 2000); // Check every 2 seconds

        return () => clearInterval(gameLoop);
    }, [bots, videoEnded]);

    const deployBot = () => {
        // Simulation Logic: Just check money
        if (money >= 100) {
            setMoney(prev => prev - 100);
            setBots(prev => prev + 1);
            addLog("Unit deployed. Syncing to network...", 'success');
            setAttackVisual(true);
            setTimeout(() => setAttackVisual(false), 500);
        } else {
            addLog("Insufficient funds for deployment.", 'warning');
        }
    };

    const removeBot = () => {
        if (bots > 0) {
            setMoney(prev => prev + 50);
            setBots(prev => prev - 1);
            addLog("Unit recalled to base station.", 'info');
        }
    };

    return {
        bots,
        kills,
        money,
        status: virusStatus,
        logs,
        attackVisual,
        deployBot,
        removeBot
    };
}
