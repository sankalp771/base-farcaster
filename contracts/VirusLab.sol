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
        require(_count > 0, "Cannot deploy zero units");
        uint256 cost = _count * UNIT_PRICE;
        require(msg.value >= cost, "Insufficient ETH sent");
        
        Player storage p = players[msg.sender];

        _updateRewards(msg.sender);

        // FIX: Initialize timestamp if this is their first bot
        if (p.units == 0) {
            p.lastClaimTime = block.timestamp;
        }

        p.units += _count;
        
        // 5% Dev Fee (Using call for safety)
        (bool success, ) = owner.call{value: (msg.value * 5) / 100}("");
        require(success, "Dev fee failed");
        
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
        
        // Payout to user
        (bool success, ) = msg.sender.call{value: payout}("");
        require(success, "Payout failed");
        
        emit RewardsClaimed(msg.sender, payout, attack);
    }

    // NEW: Full Exit (Sell all bots for 50% scrap value)
    function exitProtocol() external {
        Player storage p = players[msg.sender];
        require(p.units > 0, "No units to sell");

        _updateRewards(msg.sender);

        // 1. Calculate Rewards
        uint256 rewardPayout = p.unclaimedRewards;
        p.unclaimedRewards = 0;

        // 2. Calculate Scrap Value (50% of original cost)
        uint256 scrapValue = (p.units * UNIT_PRICE) / 2;
        uint256 totalPayout = rewardPayout + scrapValue;

        // 3. Reset Player
        uint256 unitsSold = p.units;
        p.units = 0;
        
        // 4. Safety Check
        if (address(this).balance < totalPayout) totalPayout = address(this).balance;

        // 5. Transfer
        (bool success, ) = msg.sender.call{value: totalPayout}("");
        require(success, "Exit failed");

        emit UnitLost(msg.sender, unitsSold);
        emit RewardsClaimed(msg.sender, totalPayout, false);
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
    
    // EMERGENCY WITHDRAW (For Owner Only)
    function withdraw() external {
        require(msg.sender == owner, "Only owner");
        (bool success, ) = owner.call{value: address(this).balance}("");
        require(success, "Withdraw failed");
    }

    // Check balance helper
    function getContractBalance() external view returns (uint256) {
        return address(this).balance;
    }

    receive() external payable {}
}
