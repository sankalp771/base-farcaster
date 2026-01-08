import { useState, useEffect } from 'react';
import { useAccount, useReadContract, useWriteContract, useWatchContractEvent, useWaitForTransactionReceipt } from 'wagmi';
import { parseEther, formatEther } from 'viem';
import { GameEngine, LogMessage, VirusStatus } from '@/types/game';
import VirusLabABI from '@/abis/VirusLab.json';

// REPLACE WITH REAL DEPLOYED ADDRESS
const CONTRACT_ADDRESS = '0x55f647642a3ac2c52aff8d7d43813f78183f0331';

export function useOnChainEngine(): GameEngine {
    const { address } = useAccount();
    const [logs, setLogs] = useState<LogMessage[]>([]);
    const [attackVisual, setAttackVisual] = useState(false);
    const [virusStatus, setVirusStatus] = useState<VirusStatus>('STABLE');

    // --- Write Hooks ---
    const { writeContract, data: txHash } = useWriteContract();

    // Wait for tx receipt to update UI immediately
    const { isSuccess: isTxSuccess } = useWaitForTransactionReceipt({
        hash: txHash,
    });

    // --- Read Hooks (Polled) ---
    const { data: playerState, refetch } = useReadContract({
        address: CONTRACT_ADDRESS,
        abi: VirusLabABI,
        functionName: 'getPlayerState',
        args: [address],
        query: {
            enabled: !!address,
            refetchInterval: 2000,
            queryKey: ['playerState', address, CONTRACT_ADDRESS], // Force reset on address change
        }
    });

    // Force refetch after transaction
    useEffect(() => {
        if (isTxSuccess) {
            refetch();
        }
    }, [isTxSuccess, refetch]);

    // --- Helper: Logging ---
    const addLog = (text: string, type: LogMessage['type'] = 'info') => {
        const now = new Date();
        const time = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}`;
        setLogs(prev => [...prev.slice(-20), { id: Date.now(), text, type, timestamp: time }]);
    };

    // --- Event Listeners ---

    // 1. Rewards Claimed / Attacks
    useWatchContractEvent({
        address: CONTRACT_ADDRESS,
        abi: VirusLabABI,
        eventName: 'RewardsClaimed',
        onLogs(events) {
            for (const event of events) {
                // Check if this event belongs to the current user
                const logIsForMe = (event as any).args.player === address;
                if (!logIsForMe) continue;

                const attacked = (event as any).args.attackOccurred;
                const amount = (event as any).args.amount;

                if (attacked) {
                    setVirusStatus('MUTATING');
                    setAttackVisual(true);
                    setTimeout(() => { setVirusStatus('STABLE'); setAttackVisual(false); }, 3000);
                    addLog(`⚠️ ATTACK CONFIRMED: Virus compromised extraction.`, 'danger');
                } else {
                    addLog(`💰 SUCCESS: Extracted ${formatEther(amount)} ETH safely.`, 'success');
                }
            }
        },
    });

    // 2. Unit Lost
    useWatchContractEvent({
        address: CONTRACT_ADDRESS,
        abi: VirusLabABI,
        eventName: 'UnitLost',
        onLogs(events) {
            for (const event of events) {
                const logIsForMe = (event as any).args.player === address;
                if (!logIsForMe) continue;

                addLog(`💀 UNIT LOST: Signal lost to ${Number((event as any).args.count)} agent(s).`, 'danger');
            }
        }
    });

    // 3. Anomaly
    useWatchContractEvent({
        address: CONTRACT_ADDRESS,
        abi: VirusLabABI,
        eventName: 'AnomalyDetected',
        onLogs(events) {
            for (const event of events) {
                const logIsForMe = (event as any).args.player === address;
                if (!logIsForMe) continue;
                addLog(`🚨 SYSTEM ALERT: ${(event as any).args.message}`, 'warning');
            }
        }
    });


    // --- Actions ---

    const deployBot = () => {
        addLog("Initiating Secure Link...", "info");
        writeContract({
            address: CONTRACT_ADDRESS,
            abi: VirusLabABI,
            functionName: 'deployUnit',
            args: [1], // Buying 1 bot for now
            value: parseEther('0.0001') // Matches contract constant
        }, {
            onSuccess: () => addLog("Tx Sent: Deploying Agent...", 'info'),
            onError: (e) => addLog(`Tx Failed: ${e.message.slice(0, 50)}...`, 'danger')
        });
    };

    const removeBot = () => {
        addLog("Initiating Recall Protocol...", "info");
        writeContract({
            address: CONTRACT_ADDRESS,
            abi: VirusLabABI,
            functionName: 'recallOperation',
            args: []
        }, {
            onSuccess: () => addLog("Tx Sent: Recalling Agents...", 'info'),
            onError: (e) => addLog(`Tx Failed: ${e.message.slice(0, 20)}...`, 'danger')
        });
    };

    const exitGame = () => {
        addLog("PROTOCOL OMEGA: Full Evacuation...", "warning");
        writeContract({
            address: CONTRACT_ADDRESS,
            abi: VirusLabABI,
            functionName: 'exitProtocol',
            args: []
        }, {
            onSuccess: () => addLog("Tx Sent: Selling Assets...", 'info'),
            onError: (e) => addLog(`Tx Failed: ${e.message.slice(0, 20)}...`, 'danger')
        });
    }

    // --- State Mapping ---
    // Mapping on-chain data to generic GameEngine Interface
    const units = playerState ? Number((playerState as any)[0]) : 0;
    const pendingRewardsWei = playerState ? (playerState as any)[1] : 0n;
    const confirmedMoney = parseFloat(formatEther(pendingRewardsWei));

    // --- Visual Projection (The "Live Action" Effect) ---
    const [visualMoney, setVisualMoney] = useState(confirmedMoney);

    // Sync visual money with real money whenever blockchain updates
    useEffect(() => {
        setVisualMoney(confirmedMoney);
    }, [confirmedMoney]);

    // Tick up visually between blockchain polls
    useEffect(() => {
        if (units === 0) return;
        const interval = setInterval(() => {
            // Reward Rate: 0.0000001 ETH per sec per bot
            // Per 100ms: 0.00000001
            setVisualMoney(prev => prev + (units * 0.00000001));
        }, 100);
        return () => clearInterval(interval);
    }, [units]);

    // --- COSMETIC "HOLLYWOOD" DRAMA LOOP ---
    // Makes the game feel alive without touching real assets
    useEffect(() => {
        if (units === 0) return;

        const dramaLoop = setInterval(() => {
            const roll = Math.random();

            // 15% Chance: Visual Glitch / Warning (No real damage)
            if (roll < 0.15) {
                setVirusStatus('UNSTABLE');
                // 50% chance of visual attack
                if (Math.random() > 0.5) setAttackVisual(true);

                setTimeout(() => {
                    setVirusStatus('STABLE');
                    setAttackVisual(false);
                }, 2000);
            }

            // 5% Chance: Scary Log Message (Flavor)
            if (roll > 0.95) {
                const messages = [
                    "Processing neural handshake...",
                    "Signal intercepted from Sector 7...",
                    "Brute forcing Private Key...",
                    "Packet loss detected in rendering engine...",
                    "⚠️ ANOMALY: Virus strain attempting mutation..."
                ];
                addLog(messages[Math.floor(Math.random() * messages.length)], 'warning');
            }

        }, 3000); // Check for drama every 3 seconds

        return () => clearInterval(dramaLoop);
    }, [units]);

    // Use the visual value for the UI (fallback to 0 if NaN)
    const moneyDisplay = visualMoney || 0;

    // Kills -> Just a flavor number based on units? Or maybe total yield? 
    // Let's make Kills = Units * 100 for now, or just 0.
    const killsDisplay = units * 1337;

    return {
        bots: units,
        kills: killsDisplay,
        money: moneyDisplay,
        status: virusStatus,
        logs,
        attackVisual,
        deployBot,
        removeBot,
        exitGame
    };
}
