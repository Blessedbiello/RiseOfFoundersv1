'use client';

import { BlockchainTester } from '../../components/test/BlockchainTester';
import { Toaster } from 'react-hot-toast';

export default function TestBlockchainPage() {
  return (
    <>
      <BlockchainTester />
      <Toaster position="top-right" />
    </>
  );
}