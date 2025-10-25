import { useMemo } from 'react';
import { ethers } from 'ethers';
import { useWallet } from '../src/contexts/WalletContext';
import { CONTRACT_ABIS, getContractAddress } from '../lib/contracts';

type ContractName = 'CommitRegistry' | 'ModelRegistry' | 'StakingContract' | 'AnchorContract';

export const useContract = (contractName: ContractName) => {
  const { signer, provider } = useWallet();

  const contract = useMemo(() => {
    if (!signer || !provider) return null;

    const address = getContractAddress(contractName);
    const abi = CONTRACT_ABIS[contractName];

    return new ethers.Contract(address, abi, signer);
  }, [signer, provider, contractName]);

  return contract;
};
