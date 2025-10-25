'use client';

import React, { useState } from 'react';
import { useWallet } from '../contexts/WalletContext';
import { Button } from '../../components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '../../components/ui/dropdown-menu';
import { toast } from 'sonner';

const ConnectWalletButton: React.FC = () => {
  const { isConnected, address, balance, connectWallet, disconnect, chainId } = useWallet();
  const [isConnecting, setIsConnecting] = useState(false);

  const handleConnect = async () => {
    setIsConnecting(true);
    await connectWallet();
    setIsConnecting(false);
  };

  const handleCopyAddress = () => {
    if (address) {
      navigator.clipboard.writeText(address);
      toast.success('Address copied to clipboard');
    }
  };

  const handleViewOnEtherscan = () => {
    if (address) {
      window.open(`https://sepolia.etherscan.io/address/${address}`, '_blank');
    }
  };

  const handleDisconnect = () => {
    disconnect();
    toast.success('Disconnected from wallet');
  };

  const truncateAddress = (addr: string) => {
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  if (!isConnected) {
    return (
      <Button onClick={handleConnect} disabled={isConnecting} className="flex items-center gap-2">
        <img src="https://cdn.jsdelivr.net/gh/MetaMask/brand-assets@master/exports/metamask-fox.svg" alt="MetaMask" className="w-5 h-5" />
        {isConnecting ? 'Connecting...' : 'Connect Wallet'}
      </Button>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="flex items-center gap-2">
          <img src="https://cdn.jsdelivr.net/gh/MetaMask/brand-assets@master/exports/metamask-fox.svg" alt="MetaMask" className="w-5 h-5" />
          <span>{truncateAddress(address!)}</span>
          <span className="text-sm text-gray-500">{balance ? `${parseFloat(balance).toFixed(4)} ETH` : ''}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={handleCopyAddress}>
          Copy Address
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleViewOnEtherscan}>
          View on Etherscan
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleDisconnect}>
          Disconnect
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default ConnectWalletButton;
