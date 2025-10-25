'use client';

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { ethers } from 'ethers';

declare global {
  interface Window {
    ethereum: any;
  }
}

interface WalletState {
  isConnected: boolean;
  address: string | null;
  chainId: number | null;
  balance: string | null;
  signer: ethers.Signer | null;
  provider: ethers.BrowserProvider | null;
}

interface WalletContextType extends WalletState {
  connectWallet: () => Promise<void>;
  disconnect: () => void;
  switchNetwork: () => Promise<void>;
}

const WalletContext = createContext<WalletContextType | undefined>(undefined);

const SEPOLIA_CHAIN_ID = 11155111;
const STORAGE_KEY = 'wallet_connected';

export const WalletProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, setState] = useState<WalletState>({
    isConnected: false,
    address: null,
    chainId: null,
    balance: null,
    signer: null,
    provider: null,
  });

  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const initWallet = async () => {
      if (typeof window !== 'undefined' && window.ethereum) {
        const provider = new ethers.BrowserProvider(window.ethereum);
        const accounts = await provider.listAccounts();
        if (accounts.length > 0) {
          await connectWallet();
        }
      }
    };
    initWallet();

    // Event listeners
    if (typeof window !== 'undefined' && window.ethereum) {
      window.ethereum.on('accountsChanged', handleAccountsChanged);
      window.ethereum.on('chainChanged', handleChainChanged);
      window.ethereum.on('disconnect', handleDisconnect);
    }

    return () => {
      if (typeof window !== 'undefined' && window.ethereum) {
        window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
        window.ethereum.removeListener('chainChanged', handleChainChanged);
        window.ethereum.removeListener('disconnect', handleDisconnect);
      }
    };
  }, []);

  const handleAccountsChanged = async (accounts: string[]) => {
    if (accounts.length === 0) {
      disconnect();
    } else {
      await connectWallet();
    }
  };

  const handleChainChanged = (chainId: string) => {
    window.location.reload();
  };

  const handleDisconnect = () => {
    disconnect();
  };

  const connectWallet = async () => {
    if (typeof window === 'undefined' || !window.ethereum) {
      alert('Please install MetaMask extension');
      return;
    }

    setIsLoading(true);
    try {
      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const address = await signer.getAddress();
      const chainId = Number(await window.ethereum.request({ method: 'eth_chainId' }));
      const balance = ethers.formatEther(await provider.getBalance(address));

      setState({
        isConnected: true,
        address,
        chainId,
        balance,
        signer,
        provider,
      });

      localStorage.setItem(STORAGE_KEY, 'true');
    } catch (error: any) {
      if (error.code === 4001) {
        alert('Connection rejected');
      } else if (error.code === -32002) {
        alert('Please unlock MetaMask');
      } else {
        console.error('Connection error:', error);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const disconnect = () => {
    setState({
      isConnected: false,
      address: null,
      chainId: null,
      balance: null,
      signer: null,
      provider: null,
    });
    localStorage.removeItem(STORAGE_KEY);
  };

  const switchNetwork = async () => {
    if (!window.ethereum) return;

    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: `0x${SEPOLIA_CHAIN_ID.toString(16)}` }],
      });
    } catch (error: any) {
      if (error.code === 4902) {
        await window.ethereum.request({
          method: 'wallet_addEthereumChain',
          params: [{
            chainId: `0x${SEPOLIA_CHAIN_ID.toString(16)}`,
            chainName: 'Sepolia Testnet',
            rpcUrls: ['https://rpc.sepolia.org'],
            blockExplorerUrls: ['https://sepolia.etherscan.io'],
            nativeCurrency: { name: 'SepoliaETH', symbol: 'ETH', decimals: 18 },
          }],
        });
      } else {
        console.error('Network switch error:', error);
      }
    }
  };

  return (
    <WalletContext.Provider value={{ ...state, connectWallet, disconnect, switchNetwork }}>
      {children}
    </WalletContext.Provider>
  );
};

export const useWallet = (): WalletContextType => {
  const context = useContext(WalletContext);
  if (!context) {
    throw new Error('useWallet must be used within a WalletProvider');
  }
  return context;
};
