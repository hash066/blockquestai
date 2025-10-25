'use client';

import React from 'react';
import { useWallet } from '../contexts/WalletContext';
import { Button } from '../../components/ui/button';
import { Alert, AlertDescription } from '../../components/ui/alert';
import { AlertTriangle } from 'lucide-react';

const NetworkIndicator: React.FC = () => {
  const { chainId, switchNetwork } = useWallet();

  const getNetworkName = (id: number | null) => {
    switch (id) {
      case 1: return 'Ethereum Mainnet';
      case 11155111: return 'Sepolia Testnet';
      case 5: return 'Goerli Testnet';
      default: return 'Unknown Network';
    }
  };

  const isCorrectNetwork = chainId === 11155111;

  if (isCorrectNetwork) {
    return (
      <div className="flex items-center gap-2 text-green-600">
        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
        <span>{getNetworkName(chainId)}</span>
      </div>
    );
  }

  return (
    <Alert className="border-yellow-500">
      <AlertTriangle className="h-4 w-4" />
      <AlertDescription className="flex items-center justify-between">
        <span>Wrong network: {getNetworkName(chainId)}. Please switch to Sepolia Testnet.</span>
        <Button onClick={switchNetwork} size="sm" variant="outline">
          Switch Network
        </Button>
      </AlertDescription>
    </Alert>
  );
};

export default NetworkIndicator;
