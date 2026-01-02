"use client";

import React, { useState, useEffect, useRef } from 'react';
import { useAppKit } from '@reown/appkit/react';
import { useAccount } from 'wagmi';


// --- Types ---

import { useSimulationEngine } from '@/hooks/useSimulationEngine';
import { useOnChainEngine } from '@/hooks/useOnChainEngine';
import { LogMessage } from '@/types/game';

// --- Sub-components ---


const VirusTank = ({ kills, status, attackActive }: { kills: number, status: 'STABLE' | 'UNSTABLE' | 'MUTATING', attackActive: boolean }) => {
  return (
    <div className="relative group perspective-1000">
      {/* Tank Container */}
      <div className={`w-80 h-[500px] border-4 bg-black/40 rounded-full relative overflow-hidden backdrop-blur-sm transition-all duration-500
        ${status === 'MUTATING' ? 'border-red-500/50 shadow-[0_0_80px_rgba(239,68,68,0.4)]' : 'border-emerald-900/50 shadow-[0_0_50px_rgba(0,255,65,0.1)]'}
      `}>

        {/* Glass Reflection */}
        <div className="absolute top-4 left-4 right-8 h-full bg-gradient-to-b from-white/10 to-transparent rounded-full pointer-events-none z-20" />

        {/* Fluid/Slime */}
        <div className={`absolute bottom-0 left-0 right-0 h-3/4 z-10 transition-colors duration-1000 ${status === 'MUTATING' ? 'bg-red-900/40' : 'bg-emerald-900/40'} animate-pulse-slow`}>
          <div className={`absolute top-0 left-0 w-full h-4 blur-md transition-colors ${status === 'MUTATING' ? 'bg-red-500/20' : 'bg-emerald-500/20'}`} />
        </div>

        {/* The Virus */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10 animate-float">
          <div className="relative">
            <div className={`w-32 h-32 rounded-full blur-[40px] opacity-40 animate-pulse transition-colors duration-500 ${status === 'MUTATING' ? 'bg-red-600' : 'bg-emerald-500'}`}></div>

            {/* Main Virus SVG */}
            <svg
              viewBox="0 0 200 200"
              className={`w-40 h-40 drop-shadow-[0_0_15px_rgba(0,255,65,0.8)] transition-all duration-300 transform
                ${status === 'MUTATING' ? 'text-red-500 scale-125 shake-animation' : 'text-neon-green scale-100'}
                ${kills % 2 === 0 ? 'scale-100' : 'scale-105'}
              `}
            >
              <path fill="currentColor" d="M100 20C60 20 20 60 20 100s40 80 80 80 80-40 80-80-40-80-80-80zm0 140c-33.1 0-60-26.9-60-60s26.9-60 60-60 60 26.9 60 60-26.9 60-60 60z" opacity="0.5" />
              <circle cx="100" cy="100" r="40" fill="currentColor" className="animate-pulse" />

              {/* Eyes change when mutating */}
              <circle cx="80" cy="90" r={status === 'MUTATING' ? 8 : 5} fill="#000" />
              <circle cx="120" cy="90" r={status === 'MUTATING' ? 8 : 5} fill="#000" />

              <path d={status === 'MUTATING' ? "M80 130 Q100 110 120 130" : "M80 120 Q100 130 120 120"} stroke="#000" strokeWidth="3" fill="none" />

              {/* Spikes */}
              {[...Array(8)].map((_, i) => (
                <rect key={i} x="95" y="5" width="10" height="30" transform={`rotate(${i * 45} 100 100)`} fill="currentColor" />
              ))}
            </svg>
          </div>
        </div>

        {/* Attack Lasers (Overlay) */}
        {attackActive && (
          <div className="absolute inset-0 z-30 pointer-events-none">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="absolute w-1 h-20 bg-yellow-400 blur-sm animate-laser"
                style={{
                  left: `${20 + Math.random() * 60}%`,
                  top: '-20px',
                  animationDelay: `${i * 0.1}s`
                }}
              />
            ))}
          </div>
        )}

        {/* Scanning Line */}
        <div className={`absolute top-0 left-0 w-full h-1 shadow-[0_0_20px] z-30 animate-[scan_4s_ease-in-out_infinite] ${status === 'MUTATING' ? 'bg-red-500/50 shadow-red-500' : 'bg-neon-green/50 shadow-neon-green'}`} />

        {/* Bubbles */}
        {[...Array(5)].map((_, i) => (
          <div
            key={i}
            className={`absolute rounded-full w-2 h-2 z-10 animate-[rise_4s_infinite] ${status === 'MUTATING' ? 'bg-red-400/30' : 'bg-emerald-400/30'}`}
            style={{
              left: `${20 + Math.random() * 60}%`,
              bottom: '-10px',
              animationDelay: `${Math.random() * 2}s`,
              animationDuration: `${3 + Math.random() * 2}s`
            }}
          />
        ))}

      </div>

      {/* Base Platform */}
      <div className={`w-64 h-12 bg-gray-900 mx-auto -mt-6 rounded-[50%] border-t relative z-0 shadow-2xl transition-colors ${status === 'MUTATING' ? 'border-red-500/30' : 'border-emerald-500/30'}`}></div>
    </div>
  );
};

const StatCard = ({ label, value, color = "text-white" }: { label: string, value: string | number, color?: string }) => (
  <div className="bg-black/40 border border-emerald-500/20 p-4 rounded-xl backdrop-blur-md">
    <div className="text-emerald-500/60 text-xs font-mono uppercase tracking-wider mb-1">{label}</div>
    <div className={`text-2xl font-bold font-mono ${color} drop-shadow-[0_0_5px_rgba(0,255,65,0.4)]`}>
      {value}
    </div>
  </div>
);

const BattleLog = ({ logs }: { logs: LogMessage[] }) => {
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  return (
    <div className="h-64 bg-black/80 border border-emerald-500/30 rounded-3xl p-4 backdrop-blur-xl font-mono text-xs overflow-hidden flex flex-col">
      <div className="text-neon-green mb-2 uppercase tracking-widest border-b border-emerald-500/20 pb-2">
        Strategy Terminal // v1.0.4
      </div>
      <div className="overflow-y-auto flex-1 space-y-2 pr-2 custom-scrollbar">
        {logs.length === 0 && <div className="text-emerald-500/30 italic">Searching for signals...</div>}
        {logs.map((log) => (
          <div key={log.id} className={`flex gap-2 ${log.type === 'danger' ? 'text-red-400' :
            log.type === 'success' ? 'text-neon-green' :
              log.type === 'warning' ? 'text-yellow-400' : 'text-emerald-400/70'
            }`}>
            <span className="opacity-50">[{log.timestamp}]</span>
            <span>{log.text}</span>
          </div>
        ))}
        <div ref={endRef} />
      </div>
    </div>
  );
};

// --- Main Page Component ---

export default function VirusEaterLab() {
  const [videoEnded, setVideoEnded] = useState(false);
  const { open } = useAppKit();
  const { address, isConnected } = useAccount();

  /* 
   * DUAL ENGINE ARCHITECTURE
   * - Simulation: Runs purely in browser memory.
   * - OnChain: Connects to VirusLab.sol on Base.
   */
  const simEngine = useSimulationEngine(videoEnded && !isConnected); // Pause sim if connected
  const chainEngine = useOnChainEngine();

  // Select the active engine
  const game = isConnected ? chainEngine : simEngine;

  const {
    bots,
    kills,
    money,
    status: virusStatus,
    logs,
    attackVisual,
    deployBot
  } = game;

  const videoRef = useRef<HTMLVideoElement>(null);

  return (
    <main className="min-h-screen bg-emerald-950 text-white overflow-hidden font-sans selection:bg-neon-green selection:text-black">

      {/* Intro Video Layer */}
      <div
        className={`fixed inset-0 z-50 bg-black transition-opacity duration-1000 ${videoEnded ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}
      >
        {!videoEnded && (
          <div className="relative w-full h-full">
            <video
              ref={videoRef}
              src="/intro.mp4"
              className="w-full h-full object-cover"
              autoPlay
              muted
              playsInline
              onEnded={() => setVideoEnded(true)}
            />
            <button
              onClick={() => setVideoEnded(true)}
              className="absolute bottom-8 right-8 text-white/50 hover:text-white text-xs uppercase tracking-widest border border-white/20 px-4 py-2 rounded-full hover:bg-white/10 transition-all font-mono"
            >
              Target Lock [Skip]
            </button>
          </div>
        )}
      </div>

      {/* Main Dashboard UI */}
      <div className={`transition-all duration-1000 delay-300 ${videoEnded ? 'opacity-100 scale-100' : 'opacity-0 scale-95 blur-sm'}`}>
        {/* Background Grid/Effects */}
        <div className="fixed inset-0 pointer-events-none">
          <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20"></div>
          <div className="absolute inset-0 bg-[linear-gradient(rgba(0,255,65,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(0,255,65,0.03)_1px,transparent_1px)] bg-[size:40px_40px]"></div>

          {/* Screen Glitch Overlay when mutating */}
          {virusStatus === 'MUTATING' && <div className="absolute inset-0 bg-red-500/10 mix-blend-overlay z-50 pointer-events-none animate-pulse"></div>}
        </div>

        <div className="container mx-auto px-4 py-8 h-screen grid grid-cols-12 gap-8 relative z-10 items-center">

          {/* Left Panel: Controls */}
          <div className="col-span-3 flex flex-col gap-6">
            <div className="bg-black/60 border border-emerald-500/30 rounded-3xl p-6 backdrop-blur-xl">
              <h2 className="text-2xl font-bold font-mono text-neon-green mb-1">CORTEX CONTROL</h2>
              <div className="text-emerald-500/60 text-xs uppercase tracking-widest mb-6 flex justify-between items-center">
                <span>SYS: {isConnected ? 'LINKED' : 'OFFLINE'}</span>
                <span className={virusStatus === 'MUTATING' ? 'text-red-500 animate-pulse' : 'text-emerald-500'}>{virusStatus}</span>
              </div>

              {/* Wallet Connection Status */}
              <div className="mb-4">
                {isConnected ? (
                  <div className="bg-emerald-900/40 border border-emerald-500/30 rounded-lg p-2 flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-neon-green rounded-full animate-pulse"></div>
                      <span className="font-mono text-xs text-emerald-300">
                        {address?.slice(0, 6)}...{address?.slice(-4)}
                      </span>
                    </div>
                    <button onClick={() => open()} className="text-[10px] bg-black/50 hover:bg-black/80 px-2 py-1 rounded text-emerald-500/80 uppercase tracking-widest border border-emerald-500/20 transition-all">
                      Disconnect
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => open()}
                    className="w-full py-2 bg-emerald-500/10 hover:bg-emerald-500/20 border border-neon-green/50 text-neon-green rounded-lg font-mono text-xs uppercase tracking-widest transition-all animate-pulse"
                  >
                    [ Connect Wallet ]
                  </button>
                )}
              </div>

              <div className="space-y-4">
                <StatCard label="Active Bots" value={bots} color={bots === 0 ? 'text-red-500' : 'text-neon-green'} />
                <StatCard label="Kill Count" value={kills.toLocaleString()} />
                <StatCard label="P&L (USD)" value={`$${money.toFixed(2)}`} />
              </div>

              <div className="mt-8 space-y-3">
                <button
                  onClick={deployBot}
                  disabled={money < 100}
                  className={`w-full py-4 rounded-xl font-bold font-mono tracking-wider uppercase transition-all
                                ${money >= 100
                      ? 'bg-emerald-500 hover:bg-emerald-400 text-emerald-950 shadow-[0_0_20px_rgba(16,185,129,0.4)]'
                      : 'bg-emerald-900/20 text-emerald-700 cursor-not-allowed border border-emerald-900'}
                            `}
                >
                  Deploy Bot ($100)
                </button>
              </div>
            </div>
          </div>

          {/* Center Panel: The Tank */}
          <div className="col-span-5 flex flex-col items-center justify-center relative">
            <div className={`absolute inset-0 blur-[100px] rounded-full pointer-events-none transition-colors duration-500 ${virusStatus === 'MUTATING' ? 'bg-red-500/10' : 'bg-neon-green/5'}`}></div>
            <h1 className="text-4xl font-black font-mono text-transparent bg-clip-text bg-gradient-to-br from-white to-emerald-400 mb-8 tracking-tighter drop-shadow-sm uppercase">
              Virus Eater Lab
            </h1>
            <VirusTank kills={kills} status={virusStatus} attackActive={attackVisual} />

            <div className="mt-8 flex gap-4 text-xs font-mono text-emerald-500/50">
              <div className="flex items-center gap-2">
                <span className={`w-1.5 h-1.5 rounded-full animate-pulse ${virusStatus === 'MUTATING' ? 'bg-red-500' : 'bg-neon-green'}`}></span>
                STATUS: {virusStatus}
              </div>
            </div>
          </div>

          {/* Right Panel: Logs & Leaderboard */}
          <div className="col-span-4 h-[600px] flex flex-col gap-6">
            <BattleLog logs={logs} />

            {/* Leaderboard Redux */}
            <div className="bg-black/60 border border-emerald-500/30 rounded-3xl p-6 backdrop-blur-xl flex-1">
              <h3 className="text-xl font-bold text-neon-green mb-6 flex items-center gap-2 font-mono">
                TOP HUNTERS
              </h3>
              {/* Reuse table from before */}
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="text-emerald-500/50 text-xs uppercase tracking-wider border-b border-emerald-900/50">
                    <th className="pb-3 pl-2">Rank</th>
                    <th className="pb-3">Agent</th>
                    <th className="pb-3 text-right">Kills</th>
                  </tr>
                </thead>
                <tbody className="font-mono text-sm">
                  {[
                    { rank: 1, name: "CryptoViper", kills: 9842 },
                    { rank: 2, name: "NeonHunter", kills: 8750 },
                    { rank: 3, name: "0xVirus", kills: 7200 },
                  ].map((row) => (
                    <tr key={row.rank} className="hover:bg-emerald-500/5 border-b border-emerald-900/20">
                      <td className="py-3 pl-2 text-emerald-400/80">#{row.rank}</td>
                      <td className="py-3 text-white">{row.name}</td>
                      <td className="py-3 text-right text-emerald-300">{row.kills}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      </div>

      <style jsx global>{`
        @keyframes scan {
          0%, 100% { top: 10%; opacity: 0; }
          50% { opacity: 1; }
          100% { top: 90%; opacity: 0; }
        }
        @keyframes rise {
          0% { transform: translateY(0); opacity: 0; }
          50% { opacity: 1; }
          100% { transform: translateY(-300px); opacity: 0; }
        }
        @keyframes laser {
            0% { transform: translateY(0); opacity: 0; }
            10% { opacity: 1; }
            100% { transform: translateY(200px); opacity: 0; }
        }
        .shake-animation {
            animation: shake 0.5s cubic-bezier(.36,.07,.19,.97) both infinite;
        }
        @keyframes shake {
            10%, 90% { transform: translate3d(-1px, 0, 0); }
            20%, 80% { transform: translate3d(2px, 0, 0); }
            30%, 50%, 70% { transform: translate3d(-4px, 0, 0); }
            40%, 60% { transform: translate3d(4px, 0, 0); }
        }
      `}</style>
    </main>
  );
}
