// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.20;


import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract StakingToken is ERC20, Ownable {
    constructor() ERC20("ProofOfPrompt Token", "POP") Ownable(msg.sender) {
        _mint(msg.sender, 1000000 * 10 ** decimals());
    }

    function mint(address to, uint256 amount) external onlyOwner {
        _mint(to, amount);
    }
}

contract StakingContract {
    StakingToken public token;
    uint256 public minimumStake = 1000 * 10 ** 18;

    struct Stake {
        uint256 amount;
        uint256 timestamp;
        bool active;
    }

    mapping(address => Stake) public stakes;
    address[] public stakers;

    event Staked(address indexed staker, uint256 amount);
    event Unstaked(address indexed staker, uint256 amount);
    event Slashed(address indexed staker, uint256 amount);

    constructor(address tokenAddress) {
        token = StakingToken(tokenAddress);
    }

    function stake(uint256 amount) external {
        require(amount >= minimumStake, "Below minimum stake");
        require(token.transferFrom(msg.sender, address(this), amount), "Transfer failed");

        if (stakes[msg.sender].amount == 0) {
            stakers.push(msg.sender);
        }

        stakes[msg.sender].amount += amount;
        stakes[msg.sender].timestamp = block.timestamp;
        stakes[msg.sender].active = true;

        emit Staked(msg.sender, amount);
    }

    function unstake(uint256 amount) external {
        require(stakes[msg.sender].amount >= amount, "Insufficient stake");
        require(stakes[msg.sender].active, "Stake not active");

        stakes[msg.sender].amount -= amount;
        if (stakes[msg.sender].amount == 0) {
            stakes[msg.sender].active = false;
        }

        require(token.transfer(msg.sender, amount), "Transfer failed");
        emit Unstaked(msg.sender, amount);
    }

    function slash(address staker, uint256 amount) external {
        require(stakes[staker].amount >= amount, "Insufficient stake to slash");
        
        stakes[staker].amount -= amount;
        if (stakes[staker].amount < minimumStake) {
            stakes[staker].active = false;
        }

        emit Slashed(staker, amount);
    }

    function getStake(address staker) external view returns (Stake memory) {
        return stakes[staker];
    }

    function getTotalStakers() external view returns (uint256) {
        return stakers.length;
    }
}
