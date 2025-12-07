# Virus Eater Lab - On-Chain Integration Plan

To turn the frontend simulation into a real dApp on **Base Sepolia**, we need to connect the UI to a Smart Contract.

## 1. Smart Contract Strategy ("The Game Engine")
We need a simple Solidity contract `VirusLab.sol` to replace the local `useState`.

### **Data Structure**
- `users[address]`: Struct containing:
    - `botCount`: uint256 (Number of active bots)
    - `lastClaimTime`: uint256 (Timestamp of last interaction)
    - `unclaimedRewards`: uint256 (Pending $VIRUS tokens)

### **Key Functions**
1.  **`deployBot()`**
    - **Input**: `msg.value` (e.g., 0.001 ETH).
    - **Logic**: Adds +1 to `users[msg.sender].botCount`.
    - **Frontend Trigger**: "Deploy Bot ($100)" button.
2.  **`recallBot()` (The "Cash Out")**
    - **Logic**: Reducing bot count securely.
    - **Frontend Trigger**: "Recall Bot" button.
3.  **`claimRewards()` (The "Risky Click")**
    - **Logic**: Calculates earnings based on time elapsed. **Rolls the dice** on-chain.
        - *Success*: Mints tokens to user.
        - *Failure*: Burns a bot.
    - **Frontend Trigger**: Not explicitly on UI yet, maybe auto-trigger or new button.

---

## 2. Configuration Setup ("The Connection")
Your project uses `@reown/appkit` and `wagmi`. It is already partially set up for Base.

**Action File**: `config/index.tsx`
- **Current**: Imports `base` (Mainnet).
- **Change**: We MUST add **`baseSepolia`** for testing.
```typescript
import { baseSepolia } from '@reown/appkit/networks'
export const networks = [baseSepolia, base] // Set Sepolia first for dev
```

---

## 3. Frontend Wiring ("Connecting the Wires")
We will replace `useState` variables with `wagmi` hooks.

### **Step A: Read Data (Status Panel)**
Instead of `const [bots, setBots] = useState(1)`, we use:
```typescript
const { data: botCount } = useReadContract({
  abi: VirusLabABI,
  address: CONTRACT_ADDRESS,
  functionName: 'getBotCount',
  args: [userAddress]
})
```
- **UI Update**: The "Active Bots" counter directly reflects the blockchain state.

### **Step B: Write Actions (Buttons)**
Instead of `setBots(prev => prev + 1)`, we use:
```typescript
const { writeContract } = useWriteContract()

// Inside "Deploy Bot" onClick:
writeContract({
  abi: VirusLabABI,
  address: CONTRACT_ADDRESS,
  functionName: 'deployBot',
  value: parseEther('0.001') // Cost of bot
})
```
- **UI Feedback**: Show a "Transaction Pending..." spinner in the "Strategy Terminal" log while waiting.

### **Step C: Event Listening (The "Battle Log")**
We listen for contract events to update the log in real-time.
- **Contract Event**: `event UnitLost(address user, uint256 timestamp);`
- **Frontend**: `useWatchContractEvent` triggers `addLog("CRITICAL FAILURE: Unit confirmed lost on-chain.", 'danger')`.

---

## 4. Execution Workflow
1.  **Switch Config**: Add `baseSepolia` to `config/index.tsx`.
2.  **Wallet Button**: Add `<appkit-button />` (or custom button) to the header so users can connect.
3.  **Deploy Contract**: (You do this externally via Remix/Hardhat).
4.  **Paste & Hook**: Paste the ABI and Address into the app, then swap the buttons.

**Ready to start with Step 1 (Config)?**
