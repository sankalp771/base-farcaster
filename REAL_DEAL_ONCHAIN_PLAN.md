# OPERATION: REAL DEAL (On-Chain Migration Master Plan)

## 0. The Philosophy
Currently, the app performs a **simulation** (client-side `setInterval`). This is a toy.
We will transition to the **"Real Deal"** (On-Chain State), where every unit, every second, and every profit is verified by the Base blockchain.

**CRITICAL REQUIREMENT**: The current "Simulation Mode" must remain accessible as a demo/onboarding experience. The "On-Chain Mode" will be a separate, high-stakes layer unlocked by wallet connection.

---

## Phase 1: The "Clean Break" (Architecture)
We will decouple the *Game Logic* from the *UI Components*. This allows the UI to display data from either the "Matrix" (Simulation) or the "Real World" (Blockchain) without breaking.

### 1.1 The "Game Hook" Interface
We will create a standard interface that both modes must respect.
```typescript
interface GameState {
  botCount: number;
  earnings: number;
  status: 'STABLE' | 'MUTATING';
  logs: LogMessage[];
}

interface GameActions {
  deployUnit: () => Promise<void>;
  recallUnit: () => Promise<void>;
  claimRewards: () => Promise<void>;
}
```

### 1.2 The Two Engines
1.  **`hooks/useSimulationEngine.ts`**: The current pure TS logic. (Refactored from `page.tsx`).
2.  **`hooks/useOnChainEngine.ts`**: The new `wagmi` based logic.

### 1.3 The Switch
In `page.tsx`:
```typescript
const { isConnected } = useAccount();
const game = isConnected ? useOnChainEngine() : useSimulationEngine();
```

---

## Phase 2: The "Law" (Smart Contract)
We will build `VirusLab.sol` on Base Sepolia.

### 2.1 Core Mechanics
*   **Staking-Based Gameplay**: usage implies risk.
*   **The "Protocol"**:
    *   **Entrance**: `deployUnit()` requires ETH (e.g., 0.001 ETH).
    *   **The Grind**: Time-based yield accumulation.
    *   **The Exit**: `claimAndExit()` withdraws principal + rewards.
*   **The Risk (On-Chain RNG)**: Every time you interacts (claim/exit), the contract rolls a seed.
    *   *Bad Roll (5%)*: Virus attacks. You LOSE a portion of your principal or rewards. This makes it a gambling game, not just a faucet.

### 2.2 Contract Data Structure
```solidity
struct Player {
    uint256 activeUnits;
    uint256 lastInteractionTime;
    uint256 unclaimedRewards;
}
mapping(address => Player) public players;
```

---

## Phase 3: The "Wiring" (Frontend Integration)
Connecting the `useOnChainEngine` to the contract.

### 3.1 Read Operations (`useReadContract`)
*   **Sync**: Poll the contract execution every block (2s on Base) to update UI.
*   **Display**: Show "Real ETH" instead of "Fake USD".

### 3.2 Write Operations (`useWriteContract`)
*   **Deploy**: Calls `deployUnit` with `value: msg.value`.
*   **Toast Notifications**: distinct from the simulation logs. "Transaction Confirmed: Unit Deployed on Base".

---

## Phase 4: Execution Order
1.  **Refactor**: Extract code from `page.tsx` into `useSimulationEngine.ts`. **(Immediate Next Step)**
2.  **Solidity**: Write `VirusLab.sol`.
3.  **Deploy**: Push contract to Base Sepolia via Remix or Hardhat.
4.  **Integrate**: Build `useOnChainEngine.ts` with the new contract address.
5.  **Verify**: Test the switch between Simulator and Real Deal.

---

## Asset Requirements
*   **Smart Contract ABI**: JSON file after compilation.
*   **Contract Address**: The deployed address on Base Sepolia.
*   **Sepolia ETH**: For gas testing.

**STATUS**: Planning Complete. Ready to execute Phase 1 (Refactor).
