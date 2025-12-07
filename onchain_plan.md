# Virus Eater Lab - Advanced Gameplay & Blockchain Plan

## Part 1: Enhanced Gameplay (Frontend Mechanics)
To make the game thrilling, we will introduce **"Virus Mutation Events"**.

### The "Infection" Mechanic
Instead of simple passive income, the Virus fights back.
- **Logic**: Every 5 seconds, there is a **random chance (e.g., 15%)** of a "Mutation Spike".
- **Consequence**:
    1.  **Bot Death**: A bot gets "corrupted" and destroyed (-1 Bot Count).
    2.  **Visuals**: Screen glitches red (CRT distortion), "SYSTEM CRASH" sound, text log updates: *"⚠️ Agent 0x4F lost signal!"*.
- **Mitigation**: Player can buy **"Firewalls"** (Shields) that block 1 attack before breaking.

### Implementation Logic (Frontend)
```javascript
useEffect(() => {
  const virusLoop = setInterval(() => {
    // 5% chance per tick to kill a bot
    if (Math.random() < 0.05 && bots > 0) {
       triggerBotDeath();
    }
  }, 1000);
}, [bots]);
```

---

## Part 2: On-Chain Architecture (Solidity Strategy)
Since blockchains are transaction-based (not real-time), we model the "risk" differently. We can't "kill" a bot on-chain without a user transaction.

### Model: "The High-Stakes Extraction"
The game becomes a **Staking with Risk** protocol.

#### 1. The Smart Contract (`VirusLab.sol`)
- **State**:
    - `mapping(address => uint256) public bots;` (Your deployed units)
    - `mapping(address => uint256) public lastClaimTime;`
- **Functions**:
    - `deployBot(){value: 0.01 ether}`: Buys a bot, starts distinct timer.
    - `claimRewards()`: The critical moment.
        - Calculates pending rewards: `(now - lastClaimTime) * bots * rate`.
        - **The Twist**: Rolls a pseudo-random number (using `block.prevrandao`).
        - **If Bad Roll (e.g., < 10%)**: You lose 1 Bot AND 50% of pending rewards.
        - **If Good Roll**: You get full rewards.
- **Why this works**: It creates "Press your luck" tension. Do you claim often (safe, but high gas fees) or wait (high rewards, but risk losing a bot)?

#### 2. Economy
- **Token**: $VIRUS (ERC-20).
- **Burn Mechanism**: Buying bots burns $VIRUS (deflationary).

### Recommended Tech Stack (Hackathon Speed)
- **Framework**: Hardhat or Foundry.
- **Randomness**: Simple `keccak256(abi.encodePacked(block.timestamp, msg.sender))` is fine for a hackathon. For mainnet, we'd use Chainlink VRF.
- **Network**: Base Sepolia (Fast, Cheap).

## Part 3: Roadmap
1.  **Frontend Randomness**: Implement the "Bot Death" visual & logic in React (No blockchain yet).
2.  **Contract Interface**: Create a `useVirusLab` hook to simulate contract calls.
3.  **Smart Contract**: Write `VirusLab.sol` with the logic above.
4.  **Integration**: Replace simulated hooks with `wagmi` calls.

**Shall we proceed with Phase 1 (Frontend Randomness) first?**
