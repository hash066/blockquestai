import { ethers } from 'ethers';

// Placeholder ABIs - Replace with actual contract ABIs
export const CONTRACT_ABIS = {
  CommitRegistry: [
    {
      "inputs": [
        { "internalType": "bytes32", "name": "commitment", "type": "bytes32" }
      ],
      "name": "commitPrompt",
      "outputs": [],
      "stateMutability": "payable",
      "type": "function"
    }
  ],
  ModelRegistry: [
    {
      "inputs": [
        { "internalType": "string", "name": "modelHash", "type": "string" },
        { "internalType": "string", "name": "metadata", "type": "string" }
      ],
      "name": "registerModel",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    }
  ],
  StakingContract: [
    {
      "inputs": [
        { "internalType": "uint256", "name": "amount", "type": "uint256" }
      ],
      "name": "stake",
      "outputs": [],
      "stateMutability": "payable",
      "type": "function"
    }
  ],
  AnchorContract: [
    {
      "inputs": [
        { "internalType": "uint256", "name": "anchorId", "type": "uint256" }
      ],
      "name": "getAnchor",
      "outputs": [
        { "internalType": "string", "name": "data", "type": "string" }
      ],
      "stateMutability": "view",
      "type": "function"
    }
  ]
};

export const getContractAddress = (contractName: string): string => {
  const addresses = require('../smart-contracts/deployed-addresses-sepolia.json');
  return addresses[contractName];
};
