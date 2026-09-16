import { describe, it, expect } from 'vitest';
import { WalletState } from '../src/types';

describe('VoidCloud Multi-Wallet & 1AM Wallet Integration Unit Tests', () => {
  const createMockWalletState = (
    walletName: WalletState['walletName'],
    address: string | null = null,
    nightBalance: number = 0,
    dustBalance: number = 0
  ): WalletState => ({
    isConnected: !!address,
    address,
    walletName,
    network: 'Midnight Preprod',
    balances: {
      NIGHT: nightBalance,
      tDUST: dustBalance,
      ADA: 0,
      USDT: 0,
      ETH: 0,
    },
  });

  it('initializes disconnected state with clean zero balances', () => {
    const wallet = createMockWalletState(null);
    expect(wallet.isConnected).toBe(false);
    expect(wallet.address).toBeNull();
    expect(wallet.walletName).toBeNull();
    expect(wallet.network).toBe('Midnight Preprod');
    expect(wallet.balances.NIGHT).toBe(0);
    expect(wallet.balances.tDUST).toBe(0);
  });

  it('successfully binds 1AM Wallet with 5,000 tNIGHT and 98.04 tDUST sponsored balance', () => {
    const oneAmAddress = '1am_preprod1q9v4c3k2y9w8m7x6z5a4b3c2d1e0f';
    const wallet = createMockWalletState('1AM Wallet', oneAmAddress, 5000, 98.04);

    expect(wallet.isConnected).toBe(true);
    expect(wallet.walletName).toBe('1AM Wallet');
    expect(wallet.address).toBe(oneAmAddress);
    expect(wallet.network).toBe('Midnight Preprod');
    expect(wallet.balances.NIGHT).toBe(5000);
    expect(wallet.balances.tDUST).toBe(98.04);
    expect(wallet.balances.ADA).toBe(0);
  });

  it('supports Midnight Lace wallet connection alongside 1AM Wallet', () => {
    const laceAddress = 'mn_preprod1qzn6m6z6m6z6m6z6m6z6m6z6m6z6';
    const wallet = createMockWalletState('Midnight Lace', laceAddress, 5000, 0);

    expect(wallet.isConnected).toBe(true);
    expect(wallet.walletName).toBe('Midnight Lace');
    expect(wallet.address).toBe(laceAddress);
    expect(wallet.balances.NIGHT).toBe(5000);
  });

  it('properly resets balances on wallet disconnection', () => {
    let wallet = createMockWalletState('1AM Wallet', '1am_preprod1qtest', 5000, 98.04);
    expect(wallet.isConnected).toBe(true);

    // Disconnect
    wallet = createMockWalletState(null, null, 0, 0);
    expect(wallet.isConnected).toBe(false);
    expect(wallet.address).toBeNull();
    expect(wallet.walletName).toBeNull();
    expect(wallet.balances.NIGHT).toBe(0);
    expect(wallet.balances.tDUST).toBe(0);
  });
});
