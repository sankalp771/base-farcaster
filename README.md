# 🦠 Virus Eater Lab
### **On-Chain AI Defense Simulation on Base Sepolia**

![Virus Lab Interface](https://github.com/user-attachments/assets/placeholder-image) 
*(Replace with actual screenshot)*

> *"The System is under attack. The Cortex is destabilizing. Only autonomous Hunter Bots can purge the viral strain."*

**Virus Eater Lab** is a fully functional **On-Chain Game (OCG)** built as a Farcaster Frame/MiniApp. It simulates a biological defense scenario where players deploy "Hunter Bots" to fight an evolving digital virus.

Players pay **ETH** to deploy units, earn yield (passive income) from the protocol, and risk their units in "Recall Operations" to claim their earnings.

---

## ⚡ Key Features

*   **Dual-Engine Architecture**:
    *   **Simulation Mode**: Runs purely in-browser for free users (visuals only).
    *   **On-Chain Mode**: Connects to **Base Sepolia** via Smart Contract for real economic stakes.
*   **Real-Time Economics**:
    *   **Entry Cost**: 0.0001 ETH per Bot.
    *   **Yield**: Bots generate `0.0000001 ETH/sec` (simulated yield).
    *   **Risk**: Recalling rewards has a **15% chance** of unit death (Burn Mechanism).
*   **High-End UX**:
    *   Glassmosphism UI with "Neon Emerald" aesthetic.
    *   Reactive animations (mutating virus, laser attacks).
    *   **Direct Wagmi Glue**: No clunky modals. Direct Ledger/MetaMask injection for speed.

---

## 🛠️ Technical Stack

This project was built during the **Base Hyperthon 2025**. It departs from standard templates to offer a high-performance, lightweight capability.

*   **Frontend**: Next.js 14, TailwindCSS (Neon/Cyberpunk Theme).
*   **Blockchain Interaction**: `wagmi` + `viem` (No heavy providers).
*   **Smart Contract**: Solidity (`VirusLab.sol`) deployed on Base Sepolia.
*   **Package Manager**: **Bun** (Lighting fast installs/scripts).

### Smart Contract Verified Address
**Base Sepolia**: [`0x0f5729cde0d347fb24c9230d7680ee39ef880c24`](https://sepolia.basescan.org/address/0x0f5729cde0d347fb24c9230d7680ee39ef880c24)

---

## 🚀 Getting Started

We use **Bun** for everything. Make sure you have it installed.

### 1. Clone & Install
```bash
git clone https://github.com/yourusername/virus-eater-lab.git
cd virus-eater-lab
bun install
```

### 2. Configure Environment
Rename `.env.example` to `.env`:
```bash
NEXT_PUBLIC_PROJECT_ID=your_reown_project_id
PRIVATE_KEY=your_testnet_wallet_private_key # Only needed for deployment
```

### 3. Run Locally
```bash
bun dev
```
Open `http://localhost:3000`.

---

## ⚔️ How to Play

1.  **Connect Wallet**: Use MetaMask or any injected wallet. Switch to **Base Sepolia**.
2.  **Deploy Bot**: Click `[ DEPLOY BOT ]`.
    *   Cost: **0.0001 ETH**.
    *   Transaction confirms on-chain → Bot Count increases.
3.  **Watch It Grow**: Your bot passively "mines" rewards in the background contract state.
4.  **Recall (Claim)**: Click `[ RECALL AGENTS ]` (feature coming in UI v2, contract supports it).
    *   **Success**: You get your accumulated ETH.
    *   **Fail (15%)**: The Virus intercepts the signal. You lose 50% rewards and 1 Bot dies.

---

## 📜 Smart Contract Logic

The game logic is enforced immutably on-chain.

**`contracts/VirusLab.sol`**:
```solidity
function deployUnit(uint256 _count) external payable {
    require(msg.value >= _count * UNIT_PRICE, "Insufficient Funds");
    // ... Updates player state & timestamp
}

function recallOperation() external {
    // ... Calculates rewards based on time difference
    // ... Runs pseudo-RNG for 15% kill chance
}
```

---

## 📦 Zero-Config Deployment

We hate complex tools. We wrote a custom TypeScript deployment script that uses `viem` and `solc` directly. No Hardhat required.

**To Deploy Your Own Version:**
```bash
bun scripts/deploy_viem.ts
```
*   Compiles Solidity on the fly.
*   Deploys to Base Sepolia using `.env` key.
*   Outputs the new Contract Address.

---

## 🔮 Farcaster Integration

This app is Farcaster-native. It includes a `/.well-known/farcaster.json` manifest (configured in `app/.well-known/farcaster.json/route.ts`).

**To Test in Warpcast:**
1.  Run `bun dev`.
2.  Use `cloudflared` or `ngrok` to tunnel localhost.
3.  Paste the URL into the [Warpcast Developer Playground](https://warpcast.com/~/developers/frames).

---

### Credits
Built with 💚 and excessive caffeine for the Base Ecosystem.
*Theme: "Bio-Digital Horror"*
