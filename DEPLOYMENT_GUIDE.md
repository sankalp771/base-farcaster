# ZERO TO HERO: Deploying Your First Smart Contract (Base Sepolia)

Welcome to the blockchain, fam. This guide assumes you have **Metamask** installed and have never done this before. We will use **Remix IDE**, a browser-based tool used by pros and beginners alike.

---

## ⚠️ Prerequisite: Get Test ETH
You cannot deploy without "Gas Money" (ETH).
1.  Open **Metamask**.
2.  Click the network dropdown (top-left) -> Toggle "Show test networks" -> Select **Base Sepolia**.
    *   *If you don't see Base Sepolia*: Go to [chainlist.org](https://chainlist.org/?testnets=true&search=base+sepolia), connect wallet, and click "Add to Metamask".
3.  **Get Free ETH**:
    *   Go to [https://www.alchemy.com/faucets/base-sepolia](https://www.alchemy.com/faucets/base-sepolia) (Requires login).
    *   Or [https://faucet.quicknode.com/base/sepolia](https://faucet.quicknode.com/base/sepolia).
    *   Enter your wallet address -> Click "Send Me ETH".
    *   *Wait 1 minute. Verify you have some ETH in Metamask.*

---

## Phase 1: The Code (Remix)
1.  Open [https://remix.ethereum.org](https://remix.ethereum.org) in your browser.
2.  **Cleanup**: You will see a `default_workspace` with folders like `contracts`, `scripts`. You can ignore them.
3.  **Create File**:
    *   Right-click on the `contracts` folder -> **New File**.
    *   Name it: `VirusLab.sol`.
4.  **Paste The Logic**:
    *   Copy the code block below **EXACTLY** and paste it into `VirusLab.sol` in Remix.

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract VirusLab {
    
    // --- Configuration ---
    uint256 public constant UNIT_PRICE = 0.0001 ether; // Cost to buy 1 bot
    uint256 public constant REWARD_PER_SEC = 0.0000001 ether; // Passive Income Rate
    uint256 public constant ATTACK_CHANCE = 15; // 15% Risk
    
    address public owner;
    
    struct Player {
        uint256 units;            
        uint256 lastClaimTime;    
        uint256 unclaimedRewards; 
    }
    
    mapping(address => Player) public players;
    
    event UnitDeployed(address indexed player, uint256 amount);
    event RewardsClaimed(address indexed player, uint256 amount, bool attackOccurred);
    event UnitLost(address indexed player, uint256 count);
    event AnomalyDetected(address indexed player, string message); 

    constructor() {
        owner = msg.sender;
    }

    function deployUnit(uint256 _count) external payable {
        uint256 cost = _count * UNIT_PRICE;
        require(msg.value >= cost, "Insufficient ETH sent");
        
        _updateRewards(msg.sender);
        players[msg.sender].units += _count;
        
        // 5% Dev Fee
        payable(owner).transfer((msg.value * 5) / 100);
        
        emit UnitDeployed(msg.sender, _count);
    }
    
    function recallOperation() external {
        Player storage p = players[msg.sender];
        require(p.units > 0 || p.unclaimedRewards > 0, "No active agents");
        
        _updateRewards(msg.sender);
        
        uint256 payout = p.unclaimedRewards;
        p.unclaimedRewards = 0; 
        
        if (payout == 0) return;
        
        // RNG (Pseudo-random for demo)
        uint256 seed = uint256(keccak256(abi.encodePacked(block.timestamp, msg.sender, block.prevrandao)));
        bool attack = (seed % 100) < ATTACK_CHANCE;
        
        if (attack) {
            if (p.units > 0) {
                p.units -= 1; // Kill 1 bot
                emit UnitLost(msg.sender, 1);
            }
            payout = payout / 2; // Slash rewards
            emit AnomalyDetected(msg.sender, "CRITICAL FAILURE: Signal Intercepted.");
        } 
        
        if (address(this).balance < payout) payout = address(this).balance;
        payable(msg.sender).transfer(payout);
        emit RewardsClaimed(msg.sender, payout, attack);
    }

    function _updateRewards(address _user) internal {
        Player storage p = players[_user];
        if (p.units == 0) {
            p.lastClaimTime = block.timestamp;
            return;
        }
        uint256 timeDelta = block.timestamp - p.lastClaimTime;
        if (timeDelta > 0) {
            p.unclaimedRewards += timeDelta * p.units * REWARD_PER_SEC;
            p.lastClaimTime = block.timestamp;
        }
    }
    
    function getPlayerState(address _user) external view returns (uint256 units, uint256 pendingRewards, uint256 potentialYield) {
        Player memory p = players[_user];
        uint256 timeDelta = (p.lastClaimTime == 0) ? 0 : (block.timestamp - p.lastClaimTime);
        uint256 activeYield = (p.units > 0) ? (timeDelta * p.units * REWARD_PER_SEC) : 0;
        return (p.units, p.unclaimedRewards + activeYield, REWARD_PER_SEC * p.units);
    }
    
    receive() external payable {}
}
```

---

## Phase 2: Compile (The Translation)
1.  Click the **3rd Icon** on the left sidebar (Solidity Compiler). It looks like an "S".
2.  Ensure "Compiler" version is `0.8.20` or newer.
3.  Click the blue button **"Compile VirusLab.sol"**.
4.  *Success Check*: You should see a green checkmark appear on the icon.

---

## Phase 3: The Deployment (Launch)
This is the moment.
1.  Click the **4th Icon** on the left sidebar (Deploy & Run Transactions). It looks like an Ethereum logo.
2.  **Environment Dropdown**:
    *   Change this from "Remix VM" to **"Injected Provider - MetaMask"**.
    *   *Metamask will pop up*. Approve the connection.
    *   VERIFY: Under "Account", you should see your Metamask address (e.g., `0x123...`). It should say "Base Sepolia" (ID: 84532) under the dropdown.
3.  **Deploy**:
    *   Make sure "Contract" says `VirusLab - contracts/VirusLab.sol`.
    *   Click the orange **"Deploy"** button.
4.  **Confirm**:
    *   Metamask will pop up asking to confirm the transaction.
    *   Click **Confirm**.
5.  **Wait**:
    *   Watch the "Terminal" at the bottom of Remix.
    *   In 10-20 seconds, you will see a green checkmark/log saying `creation of VirusLab pending... confirmed`.

---

## Phase 4: Integration (The Handshake)
1.  On the left sidebar (Deploy tab), under "Deployed Contracts", you will see `VirusLab at 0x...`.
2.  Click the **Copy Icon** (small squares) next to the address (e.g., `0x742...`).
3.  **Go back to VS Code**.
4.  Open `hooks/useOnChainEngine.ts`.
5.  Paste your address into line 7:
    ```typescript
    const CONTRACT_ADDRESS = 'YOUR_COPIED_ADDRESS_HERE';
    ```

**Congratulations.** You just deployed a sovereign financial application to the internet.
