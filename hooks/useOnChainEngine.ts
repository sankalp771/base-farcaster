import { useState, useEffect } from 'react';
import { useAccount, useReadContract, useWriteContract, useWatchContractEvent, useWaitForTransactionReceipt } from 'wagmi';
import { parseEther, formatEther } from 'viem';
import { GameEngine, LogMessage, VirusStatus } from '@/types/game';
import VirusLabABI from '@/abis/VirusLab.json';

// REPLACE WITH REAL DEPLOYED ADDRESS
const CONTRACT_ADDRESS = '0x0f5729cde0d347fb24c9230d7680ee39ef880c24';

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
            refetchInterval: 2000, // Poll every 2s for real-time feel
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

    // --- State Mapping ---
    // Mapping on-chain data to generic GameEngine Interface
    const units = playerState ? Number((playerState as any)[0]) : 0;
    const pendingRewardsWei = playerState ? (playerState as any)[1] : 0n;

    // We treat "Money" as the Pending Rewards in this view (or we could show wallet balance)
    // Let's show Pending Rewards as "Money" to verify the loop
    const moneyDisplay = parseFloat(formatEther(pendingRewardsWei));

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
        removeBot
    };
}
