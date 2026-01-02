// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title VirusLab
 * @notice A high-stakes On-Chain Simulation Game.
 * @dev This contract implements a "Yield or Die" mechanic.
 *      Players deposit ETH to recruit "Agents" (Bots).
 *      Agents mine rewards (ETH) over time from the pool of new deposits.
 *      WARNING: When claiming, there is a chance of "Virus Attack" which destroys units.
 */
contract VirusLab {
    
    // --- Configuration ---
    uint256 public constant UNIT_PRICE = 0.0001 ether; // ~0.30 USD (Cheap for testing)
    uint256 public constant REWARD_PER_SEC = 0.0000001 ether; // Slow drip
    uint256 public constant ATTACK_CHANCE = 15; // 15% chance of failure
    uint256 public constant DEV_FEE_PERCENT = 5;
    
    address public owner;
    
    struct Player {
        uint256 units;            // Number of active bots
        uint256 lastClaimTime;    // Timestamp of last interaction
        uint256 unclaimedRewards; // Stored rewards if we want partial claims (logic simplified for now)
    }
    
    mapping(address => Player) public players;
    
    // --- Events ---
    event UnitDeployed(address indexed player, uint256 amount);
    event RewardsClaimed(address indexed player, uint256 amount, bool attackOccurred);
    event UnitLost(address indexed player, uint256 count);
    event AnomalyDetected(address indexed player, string message); // Flavor text

    constructor() {
        owner = msg.sender;
    }

    // --- Core Logic ---

    /**
     * @notice Buy Bots to start earning.
     * @dev 1 Unit costs UNIT_PRICE.
     */
    function deployUnit(uint256 _count) external payable {
        uint256 cost = _count * UNIT_PRICE;
        require(msg.value >= cost, "Insufficient ETH sent");
        
        // Update state
        _updateRewards(msg.sender);
        
        players[msg.sender].units += _count;
        
        // Dev Fee (5%)
        uint256 fee = (msg.value * DEV_FEE_PERCENT) / 100;
        payable(owner).transfer(fee);
        
        emit UnitDeployed(msg.sender, _count);
    }
    
    /**
     * @notice The moment of truth. Claim pending rewards.
     * @dev Triggers a pseudo-random roll.
     */
    function recallOperation() external {
        Player storage p = players[msg.sender];
        require(p.units > 0 || p.unclaimedRewards > 0, "No active agents or rewards");
        
        _updateRewards(msg.sender);
        
        uint256 payout = p.unclaimedRewards;
        p.unclaimedRewards = 0; // Reset pending
        
        if (payout == 0) return;
        
        // --- THE RISK (RNG) ---
        // Using block.prevrandao (or block.difficulty) + timestamp for randomness
        // Note: Not secure for high value, but fine for this game loop
        uint256 seed = uint256(keccak256(abi.encodePacked(block.timestamp, msg.sender, block.prevrandao)));
        uint256 roll = seed % 100;
        
        bool attack = roll < ATTACK_CHANCE;
        
        if (attack) {
            // BAD ENDING: Virus Attack
            uint256 unitsLost = 1;
            if (p.units > 0) {
                p.units -= unitsLost;
                emit UnitLost(msg.sender, unitsLost);
            }
            
            // Penalty: Lose 50% of rewards
            payout = payout / 2;
            emit AnomalyDetected(msg.sender, "CRITICAL FAILURE: Signal Intercepted. Loot compromised.");
        } 
        
        // Check contract solvency
        if (address(this).balance < payout) {
            payout = address(this).balance;
            emit AnomalyDetected(msg.sender, "WARNING: Protocol Liquidity Critical.");
        }
        
        payable(msg.sender).transfer(payout);
        emit RewardsClaimed(msg.sender, payout, attack);
    }
    
    /**
     * @notice Exit completely. Sell units back for 50% value + claim rewards.
     */
    function emergencyEvac() external {
        Player storage p = players[msg.sender];
        require(p.units > 0, "No units to evac");
        
        _updateRewards(msg.sender);
        
        uint256 payout = p.unclaimedRewards;
        uint256 refund = (p.units * UNIT_PRICE) / 2; // 50% refund
        
        p.units = 0;
        p.unclaimedRewards = 0;
        
        uint256 total = payout + refund;
        if (address(this).balance < total) {
            total = address(this).balance;
        }
        
        payable(msg.sender).transfer(total);
        emit UnitLost(msg.sender, p.units); // All units lost/sold
    }
    
    // --- Internal Helpers ---
    
    function _updateRewards(address _user) internal {
        Player storage p = players[_user];
        
        if (p.units == 0) {
            p.lastClaimTime = block.timestamp;
            return;
        }
        
        uint256 timeDelta = block.timestamp - p.lastClaimTime;
        if (timeDelta > 0) {
            uint256 reward = timeDelta * p.units * REWARD_PER_SEC;
            p.unclaimedRewards += reward;
            p.lastClaimTime = block.timestamp;
        }
    }
    
    // --- Views ---
    
    function getPlayerState(address _user) external view returns (uint256 units, uint256 pendingRewards, uint256 potentialYield) {
        Player memory p = players[_user];
        uint256 timeDelta = (p.lastClaimTime == 0) ? 0 : (block.timestamp - p.lastClaimTime);
        uint256 activeYield = 0;
        if (p.units > 0) {
            activeYield = timeDelta * p.units * REWARD_PER_SEC;
        }
        return (p.units, p.unclaimedRewards + activeYield, REWARD_PER_SEC * p.units);
    }
    
    // Allow deposit without action for funding pool
    receive() external payable {}
}
