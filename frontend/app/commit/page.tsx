'use client';

import React, { useState } from 'react';
import { useWallet } from '@/src/contexts/WalletContext';
import { useContract } from '@/hooks/useContract';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { ethers } from 'ethers';

const CommitPage: React.FC = () => {
  const { isConnected, address } = useWallet();
  const commitRegistry = useContract('CommitRegistry');
  const [prompt, setPrompt] = useState('');
  const [nonce, setNonce] = useState(0);
  const [isCommitting, setIsCommitting] = useState(false);

  const handleCommit = async () => {
    if (!isConnected || !commitRegistry) {
      toast.error('Please connect your wallet');
      return;
    }

    if (!prompt) {
      toast.error('Please enter a prompt');
      return;
    }

    setIsCommitting(true);
    try {
      const modelFingerprint = '0x1234567890abcdef'; // Placeholder
      const commitment = ethers.keccak256(ethers.toUtf8Bytes(prompt + nonce + modelFingerprint));

      const tx = await commitRegistry.commitPrompt(commitment, { value: ethers.parseEther('0.001') });
      toast.success('Commitment submitted! Transaction: ' + tx.hash);
      await tx.wait();
      toast.success('Transaction confirmed');
    } catch (error: any) {
      console.error(error);
      toast.error('Failed to commit: ' + error.message);
    } finally {
      setIsCommitting(false);
    }
  };

  if (!isConnected) {
    return (
      <div className="container mx-auto p-4">
        <Card>
          <CardHeader>
            <CardTitle>Commit to Blockchain</CardTitle>
            <CardDescription>Please connect your wallet to commit prompts.</CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <Card>
        <CardHeader>
          <CardTitle>Commit to Blockchain</CardTitle>
          <CardDescription>Enter a prompt to commit to the blockchain.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Input
            placeholder="Enter your prompt"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
          />
          <Input
            type="number"
            placeholder="Nonce"
            value={nonce}
            onChange={(e) => setNonce(Number(e.target.value))}
          />
          <Button onClick={handleCommit} disabled={isCommitting}>
            {isCommitting ? 'Committing...' : 'Commit to Blockchain'}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default CommitPage;
