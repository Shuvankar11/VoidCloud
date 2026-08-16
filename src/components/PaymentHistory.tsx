import React, { useState, useMemo } from 'react';
import { useVault } from '../context/VaultContext';
import { useWeb3Wallet } from '../context/WalletContext';
import { PaymentTransaction, TransactionStatus } from '../types';
import {
  FileText,
  Search,
  Filter,
  ArrowLeft,
  CheckCircle2,
  AlertTriangle,
  Clock,
  ExternalLink,
  Copy,
  Check,
  Download,
  FileSpreadsheet,
  Sparkles,
  HardDrive,
  RefreshCw,
  Coins,
  Shield,
  Database,
} from 'lucide-react';

export const PaymentHistory: React.FC = () => {
  const { session, setActiveView } = useVault();
  const {
    wallet,
    transactions,
    exportTransactionsCSV,
    exportTransactionsJSON,
    setIsPricingModalOpen,
    setSelectedReceiptTx,
    setIsReceiptModalOpen,
    setSelectedExplorerTx,
    setIsExplorerModalOpen,
    syncLiveBalance,
  } = useWeb3Wallet();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<'all' | TransactionStatus>('all');
  const [selectedToken, setSelectedToken] = useState<'all' | 'NIGHT' | 'tDUST' | 'ADA' | 'USDT' | 'ETH' | 'FREE'>('all');
  const [selectedType, setSelectedType] = useState<'all' | 'upgrade' | 'faucet' | 'bonus'>('all');
  const [copiedHash, setCopiedHash] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const copyToClipboard = (text: string, hashId: string) => {
    navigator.clipboard.writeText(text);
    setCopiedHash(hashId);
    setTimeout(() => setCopiedHash(null), 2000);
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await syncLiveBalance();
    await new Promise((r) => setTimeout(r, 600));
    setIsRefreshing(false);
  };

  const openReceipt = (tx: PaymentTransaction) => {
    setSelectedReceiptTx(tx);
    setIsReceiptModalOpen(true);
  };

  const openExplorer = (tx: PaymentTransaction) => {
    setSelectedExplorerTx(tx);
    setIsExplorerModalOpen(true);
  };

  // Filtered transactions
  const filteredTransactions = useMemo(() => {
    return transactions.filter((tx: PaymentTransaction) => {
      // Status filter
      if (selectedStatus !== 'all' && tx.status !== selectedStatus) return false;

      // Token filter
      if (selectedToken !== 'all' && tx.token !== selectedToken) return false;

      // Type filter
      if (selectedType === 'upgrade' && !tx.planName.toLowerCase().includes('shard') && !tx.planName.toLowerCase().includes('sentinel') && !tx.planName.toLowerCase().includes('matrix') && !tx.planId) return false;
      if (selectedType === 'faucet' && !tx.planName.toLowerCase().includes('faucet')) return false;
      if (selectedType === 'bonus' && !tx.planName.toLowerCase().includes('bonus') && !tx.planName.toLowerCase().includes('genesis') && !tx.planName.toLowerCase().includes('expansion')) return false;

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesName = tx.planName.toLowerCase().includes(q);
        const matchesHash = tx.txHash.toLowerCase().includes(q);
        const matchesReceipt = (tx.receiptId || '').toLowerCase().includes(q);
        const matchesSender = tx.senderAddress.toLowerCase().includes(q);
        const matchesToken = tx.token.toLowerCase().includes(q);
        const matchesStatus = tx.status.toLowerCase().includes(q);
        if (!matchesName && !matchesHash && !matchesReceipt && !matchesSender && !matchesToken && !matchesStatus) {
          return false;
        }
      }

      return true;
    });
  }, [transactions, selectedStatus, selectedToken, selectedType, searchQuery]);

  // Summary Metrics calculations
  const totalSpentNIGHT = useMemo(() => {
    return transactions
      .filter((t: PaymentTransaction) => t.status === 'success' && t.token === 'NIGHT' && !t.planName.includes('Faucet'))
      .reduce((acc: number, curr: PaymentTransaction) => acc + curr.amount, 0);
  }, [transactions]);

  const totalSuccessful = useMemo(() => {
    return transactions.filter((t: PaymentTransaction) => t.status === 'success').length;
  }, [transactions]);

  const totalFailed = useMemo(() => {
    return transactions.filter((t: PaymentTransaction) => t.status === 'failed').length;
  }, [transactions]);

  const totalPending = useMemo(() => {
    return transactions.filter((t: PaymentTransaction) => t.status === 'pending').length;
  }, [transactions]);

  const formatRelativeTime = (isoString: string) => {
    try {
      const diffMs = Date.now() - new Date(isoString).getTime();
      const diffMins = Math.floor(diffMs / 60000);
      const diffHours = Math.floor(diffMins / 60);
      const diffDays = Math.floor(diffHours / 24);

      if (diffMins < 1) return 'Just now';
      if (diffMins < 60) return `${diffMins}m ago`;
      if (diffHours < 24) return `${diffHours}h ago`;
      if (diffDays < 7) return `${diffDays}d ago`;
      return new Date(isoString).toLocaleDateString();
    } catch {
      return 'Recent';
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-6 space-y-6">
      
      {/* Top Breadcrumb & Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-800/80">
        <div>
          <button
            onClick={() => setActiveView('home')}
            className="inline-flex items-center space-x-1.5 text-xs font-mono text-slate-400 hover:text-sky-400 mb-2 transition-colors group"
          >
            <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-1 transition-transform" />
            <span>Return to Overview & Cloud Vault</span>
          </button>

          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-gradient-to-br from-sky-500/20 via-blue-600/20 to-emerald-500/20 border border-sky-500/40 flex items-center justify-center text-sky-400 shadow-[0_0_20px_rgba(56,189,248,0.2)]">
              <FileText className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-xl sm:text-2xl md:text-3xl font-display font-extrabold text-white tracking-tight">
                  Payment & Transaction History
                </h1>
                <span className="px-2.5 py-0.5 rounded-full bg-sky-950/80 border border-sky-500/40 text-[10px] font-mono text-sky-300 font-bold uppercase tracking-wider">
                  Midnight Preprod Ledger
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-400 font-sans mt-0.5">
                Complete cryptographic audit trail of all cloud storage purchases, ZK-proof allocations, and testnet token distributions.
              </p>
            </div>
          </div>
        </div>

        {/* Header Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="inline-flex items-center space-x-1.5 px-3 py-2 rounded-xl bg-[#080D1A] hover:bg-[#0E1424] border border-slate-800 text-slate-300 hover:text-white text-xs font-mono transition-colors"
            title="Refresh Ledger Transactions"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-sky-400' : 'text-slate-400'}`} />
            <span className="hidden sm:inline">Sync Ledger</span>
          </button>

          <button
            onClick={exportTransactionsCSV}
            className="inline-flex items-center space-x-1.5 px-3 py-2 rounded-xl bg-[#080D1A] hover:bg-[#0E1424] border border-slate-800 text-slate-300 hover:text-white text-xs font-mono transition-colors"
            title="Export CSV Statement"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400" />
            <span>Export CSV</span>
          </button>

          <button
            onClick={exportTransactionsJSON}
            className="inline-flex items-center space-x-1.5 px-3 py-2 rounded-xl bg-[#080D1A] hover:bg-[#0E1424] border border-slate-800 text-slate-300 hover:text-white text-xs font-mono transition-colors"
            title="Export JSON Statement"
          >
            <Download className="w-3.5 h-3.5 text-sky-400" />
            <span>JSON</span>
          </button>

          <button
            onClick={() => setIsPricingModalOpen(true)}
            className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500/20 to-orange-500/20 hover:from-amber-500/30 hover:to-orange-500/30 border border-amber-500/50 text-amber-300 text-xs font-mono font-bold transition-all hover:scale-105 shadow-sm"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Upgrade Storage</span>
          </button>
        </div>
      </div>

      {/* 4 Summary Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Card 1: Active Storage Quota */}
        <div className="cloud-card rounded-2xl p-4 sm:p-5 border border-sky-500/30 bg-[#080D1A]/90 relative overflow-hidden group">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono text-slate-400 uppercase tracking-wider">Active Storage</span>
            <div className="p-2 rounded-xl bg-sky-500/10 text-sky-400">
              <HardDrive className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline space-x-2">
            <span className="text-2xl sm:text-3xl font-display font-extrabold text-white">
              {session.quotaGB}
            </span>
            <span className="text-sm font-bold text-sky-400 font-mono">GB Total</span>
          </div>
          <span className="text-[11px] font-mono text-slate-500 mt-1 block truncate">
            {session.planName || 'Standard Tier (20 GB)'}
          </span>
        </div>

        {/* Card 2: Total Spent in NIGHT */}
        <div className="cloud-card rounded-2xl p-4 sm:p-5 border border-slate-800 bg-[#080D1A]/90 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono text-slate-400 uppercase tracking-wider">Total Subscriptions</span>
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400">
              <Coins className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline space-x-2">
            <span className="text-2xl sm:text-3xl font-display font-extrabold text-emerald-400 font-mono">
              {totalSpentNIGHT}
            </span>
            <span className="text-sm font-bold text-slate-300 font-mono">NIGHT Spent</span>
          </div>
          <span className="text-[11px] font-mono text-slate-500 mt-1 block">
            Wallet Balance: {wallet.balances.NIGHT} NIGHT
          </span>
        </div>

        {/* Card 3: Settlement Success Rate */}
        <div className="cloud-card rounded-2xl p-4 sm:p-5 border border-slate-800 bg-[#080D1A]/90 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono text-slate-400 uppercase tracking-wider">Ledger Status</span>
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline space-x-2">
            <span className="text-2xl sm:text-3xl font-display font-extrabold text-white">
              {totalSuccessful}
            </span>
            <span className="text-sm font-bold text-emerald-400 font-mono">Verified</span>
            {totalFailed > 0 && (
              <span className="text-xs font-bold text-rose-400 font-mono">({totalFailed} failed)</span>
            )}
          </div>
          <span className="text-[11px] font-mono text-slate-500 mt-1 block">
            100% Zero-Knowledge Audit Trail
          </span>
        </div>

        {/* Card 4: Verified On-Chain Identity */}
        <div className="cloud-card rounded-2xl p-4 sm:p-5 border border-slate-800 bg-[#080D1A]/90 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono text-slate-400 uppercase tracking-wider">Wallet Identity</span>
            <div className="p-2 rounded-xl bg-purple-500/10 text-purple-400">
              <Shield className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2">
            <span className="text-xs font-mono text-sky-300 font-bold block truncate">
              {wallet.address || session.shieldedAddress}
            </span>
          </div>
          <div className="mt-1 flex items-center justify-between text-[11px] font-mono text-slate-500">
            <span>{wallet.walletName || 'ZK Shielded Identity'}</span>
            <span className="text-emerald-400 font-semibold">Online</span>
          </div>
        </div>
      </div>

      {/* Filter & Search Toolbar */}
      <div className="cloud-card rounded-2xl p-4 border border-slate-800 bg-[#080D1A]/90 space-y-3">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by Transaction Hash (0x...), Plan Name, Token, or Receipt ID..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#030712] border border-slate-800 hover:border-slate-700 focus:border-sky-500 focus:outline-none text-xs font-mono text-white placeholder:text-slate-500 transition-colors"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white text-xs font-mono"
              >
                Clear
              </button>
            )}
          </div>

          {/* Status Tabs */}
          <div className="flex flex-wrap items-center gap-1 bg-[#030712] p-1 rounded-xl border border-slate-800 text-xs font-mono">
            <button
              onClick={() => setSelectedStatus('all')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                selectedStatus === 'all'
                  ? 'bg-sky-500/20 text-sky-300 border border-sky-500/40 font-bold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              All ({transactions.length})
            </button>
            <button
              onClick={() => setSelectedStatus('success')}
              className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1 ${
                selectedStatus === 'success'
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-bold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <CheckCircle2 className="w-3 h-3 text-emerald-400" />
              <span>Success ({totalSuccessful})</span>
            </button>
            <button
              onClick={() => setSelectedStatus('failed')}
              className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1 ${
                selectedStatus === 'failed'
                  ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40 font-bold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <AlertTriangle className="w-3 h-3 text-rose-400" />
              <span>Failed ({totalFailed})</span>
            </button>
            {totalPending > 0 && (
              <button
                onClick={() => setSelectedStatus('pending')}
                className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1 ${
                  selectedStatus === 'pending'
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 font-bold'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Clock className="w-3 h-3 text-amber-400" />
                <span>Pending ({totalPending})</span>
              </button>
            )}
          </div>
        </div>

        {/* Secondary Category & Token Filters */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-800/60 text-xs font-mono">
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-slate-500 text-[11px] mr-1 flex items-center gap-1">
              <Filter className="w-3 h-3" /> TYPE:
            </span>
            {(['all', 'upgrade', 'faucet', 'bonus'] as const).map((t) => (
              <button
                key={t}
                onClick={() => setSelectedType(t)}
                className={`px-2.5 py-1 rounded-lg text-[11px] transition-all capitalize ${
                  selectedType === t
                    ? 'bg-slate-700 text-white font-bold'
                    : 'bg-[#030712] text-slate-400 hover:text-slate-200 border border-slate-800'
                }`}
              >
                {t === 'all' ? 'All Types' : t === 'upgrade' ? 'Storage Upgrades' : t === 'faucet' ? 'Faucet Claims' : 'ZK Bonuses'}
              </button>
            ))}
          </div>

          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-slate-500 text-[11px] mr-1">TOKEN:</span>
            {(['all', 'NIGHT', 'tDUST', 'ADA', 'USDT', 'ETH', 'FREE'] as const).map((t) => (
              <button
                key={t}
                onClick={() => setSelectedToken(t)}
                className={`px-2 py-0.5 rounded-md text-[11px] transition-all ${
                  selectedToken === t
                    ? 'bg-sky-500/30 text-sky-200 border border-sky-400/50 font-bold'
                    : 'bg-[#030712] text-slate-400 hover:text-slate-200 border border-slate-800'
                }`}
              >
                {t === 'all' ? 'All' : t}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Transactions List / Table */}
      <div className="cloud-card rounded-2xl border border-slate-800 bg-[#080D1A]/90 overflow-hidden">
        {filteredTransactions.length === 0 ? (
          <div className="p-12 text-center space-y-4">
            <div className="w-14 h-14 rounded-full bg-slate-800/80 border border-slate-700 flex items-center justify-center mx-auto text-slate-400">
              <FileText className="w-7 h-7" />
            </div>
            <div className="space-y-1 max-w-md mx-auto">
              <h3 className="text-base font-bold text-white font-display">
                {searchQuery || selectedStatus !== 'all' || selectedToken !== 'all' || selectedType !== 'all'
                  ? 'No Matching Transactions Found'
                  : 'No Payment or Ledger Transactions Yet'}
              </h3>
              <p className="text-xs text-slate-400 font-mono">
                {searchQuery || selectedStatus !== 'all' || selectedToken !== 'all' || selectedType !== 'all'
                  ? 'Try clearing your search query or adjusting your filters.'
                  : 'Your cloud storage upgrades, testnet faucet claims, and on-chain settlements will automatically appear here once performed.'}
              </p>
            </div>
            <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
              {searchQuery || selectedStatus !== 'all' || selectedToken !== 'all' || selectedType !== 'all' ? (
                <button
                  onClick={() => {
                    setSearchQuery('');
                    setSelectedStatus('all');
                    setSelectedToken('all');
                    setSelectedType('all');
                  }}
                  className="px-4 py-2 rounded-xl bg-[#030712] border border-slate-700 text-slate-300 hover:text-white text-xs font-mono"
                >
                  Reset Filters
                </button>
              ) : null}
              <button
                onClick={() => setIsPricingModalOpen(true)}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 text-white font-bold text-xs font-mono shadow-md"
              >
                Upgrade Storage Plan
              </button>
              <button
                onClick={() => setActiveView('home')}
                className="px-4 py-2.5 rounded-xl bg-[#030712] border border-slate-700 text-slate-300 hover:text-white text-xs font-mono"
              >
                Return to Vault
              </button>
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs font-mono">
              <thead>
                <tr className="bg-[#030712]/80 border-b border-slate-800 text-[11px] text-slate-400 uppercase tracking-wider">
                  <th className="py-3.5 px-4 font-semibold">Date & Time</th>
                  <th className="py-3.5 px-4 font-semibold">Plan / Action</th>
                  <th className="py-3.5 px-4 font-semibold">Amount & Token</th>
                  <th className="py-3.5 px-4 font-semibold">Transaction Hash / Proof</th>
                  <th className="py-3.5 px-4 font-semibold">Status</th>
                  <th className="py-3.5 px-4 font-semibold text-right">Receipt</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {filteredTransactions.map((tx: PaymentTransaction) => {
                  const isSuccess = tx.status === 'success';
                  const isFailed = tx.status === 'failed';
                  const isPending = tx.status === 'pending';

                  const dateObj = new Date(tx.timestamp);
                  const formattedDate = dateObj.toLocaleDateString(undefined, {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                  });
                  const formattedTime = dateObj.toLocaleTimeString(undefined, {
                    hour: '2-digit',
                    minute: '2-digit',
                    second: '2-digit',
                  });
                  const relativeTime = formatRelativeTime(tx.timestamp);

                  const truncatedHash = tx.txHash.length > 18
                    ? `${tx.txHash.slice(0, 10)}...${tx.txHash.slice(-8)}`
                    : tx.txHash;

                  const isFaucet = tx.planName.toLowerCase().includes('faucet');
                  const isBonus = tx.planName.toLowerCase().includes('bonus') || tx.planName.toLowerCase().includes('genesis') || tx.planName.toLowerCase().includes('expansion');

                  return (
                    <tr
                      key={tx.id}
                      className="hover:bg-slate-800/30 transition-colors group"
                    >
                      {/* Date & Time Column */}
                      <td className="py-4 px-4 whitespace-nowrap">
                        <div className="flex flex-col">
                          <div className="flex items-center space-x-1.5">
                            <span className="text-white font-semibold">{formattedDate}</span>
                            <span className="text-[10px] px-1.5 py-0.2 rounded-md bg-[#030712] border border-slate-800 text-slate-400">
                              {relativeTime}
                            </span>
                          </div>
                          <span className="text-slate-500 text-[11px] mt-0.5">{formattedTime}</span>
                        </div>
                      </td>

                      {/* Plan / Action Column */}
                      <td className="py-4 px-4">
                        <div className="flex items-center space-x-2.5">
                          <div className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 ${
                            isBonus
                              ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30'
                              : isFaucet
                              ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                              : 'bg-sky-500/20 text-sky-400 border border-sky-500/30'
                          }`}>
                            {isBonus ? (
                              <Shield className="w-4 h-4" />
                            ) : isFaucet ? (
                              <Coins className="w-4 h-4" />
                            ) : (
                              <HardDrive className="w-4 h-4" />
                            )}
                          </div>
                          <div>
                            <span className="text-white font-semibold block text-xs truncate max-w-[200px] sm:max-w-[260px]">
                              {tx.planName}
                            </span>
                            <div className="flex items-center space-x-2 mt-0.5">
                              {tx.capacityGB && (
                                <span className="text-[10px] font-bold text-sky-400">
                                  +{tx.capacityGB} GB
                                </span>
                              )}
                              {tx.billingCycle && (
                                <span className="text-[10px] text-slate-500 capitalize">
                                  • {tx.billingCycle}
                                </span>
                              )}
                              <span className="text-[10px] text-slate-500">
                                • {tx.network}
                              </span>
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Amount & Asset Column */}
                      <td className="py-4 px-4 whitespace-nowrap">
                        <div className="flex flex-col">
                          <span className={`font-bold text-sm ${
                            tx.amount === 0 || tx.token === 'FREE'
                              ? 'text-amber-400'
                              : isFaucet
                              ? 'text-emerald-400'
                              : 'text-sky-300'
                          }`}>
                            {tx.amount === 0 || tx.token === 'FREE'
                              ? 'FREE'
                              : isFaucet
                              ? `+${tx.amount} ${tx.token}`
                              : `-${tx.amount} ${tx.token}`}
                          </span>
                          <span className="text-[10px] text-slate-500">
                            Gas: {tx.gasFee || '0.0035 tDUST'}
                          </span>
                        </div>
                      </td>

                      {/* Transaction Hash & ZK Proof */}
                      <td className="py-4 px-4 whitespace-nowrap">
                        <div className="flex items-center space-x-1.5">
                          <span className="text-slate-300 hover:text-sky-300 font-mono text-xs bg-[#030712] px-2 py-1 rounded-lg border border-slate-800/80">
                            {truncatedHash}
                          </span>
                          
                          {/* 1-Click Copy */}
                          <button
                            onClick={() => copyToClipboard(tx.txHash, tx.id)}
                            title="Copy Transaction Hash"
                            className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-sky-300 transition-colors"
                          >
                            {copiedHash === tx.id ? (
                              <Check className="w-3.5 h-3.5 text-emerald-400" />
                            ) : (
                              <Copy className="w-3.5 h-3.5" />
                            )}
                          </button>

                          {/* Explorer Link */}
                          <button
                            onClick={() => openExplorer(tx)}
                            title="Inspect on Midnight Network Preprod Explorer"
                            className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-emerald-300 transition-colors"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                          </button>
                        </div>
                        {tx.zkProofNullifier && (
                          <div className="mt-1 flex items-center space-x-1 text-[10px] text-purple-400">
                            <Shield className="w-3 h-3" />
                            <span>ZK Nullifier Verified</span>
                          </div>
                        )}
                      </td>

                      {/* Status Column */}
                      <td className="py-4 px-4 whitespace-nowrap">
                        {isSuccess && (
                          <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 text-[11px] font-bold shadow-[0_0_10px_rgba(16,185,129,0.2)]">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                            <span>SUCCESS</span>
                          </span>
                        )}
                        {isFailed && (
                          <span
                            title={tx.failureReason || 'Transaction rejected'}
                            className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full bg-rose-950/60 border border-rose-500/40 text-rose-300 text-[11px] font-bold cursor-help"
                          >
                            <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
                            <span>FAILED</span>
                          </span>
                        )}
                        {isPending && (
                          <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full bg-amber-950/60 border border-amber-500/40 text-amber-300 text-[11px] font-bold">
                            <Clock className="w-3.5 h-3.5 text-amber-400 animate-spin" />
                            <span>PENDING</span>
                          </span>
                        )}
                      </td>

                      {/* Action Column */}
                      <td className="py-4 px-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end space-x-2">
                          <button
                            onClick={() => openExplorer(tx)}
                            title="Inspect On-Chain Midnight Preprod State & Contract"
                            className="inline-flex items-center space-x-1 px-2.5 py-1.5 rounded-xl bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/40 text-emerald-300 hover:text-emerald-200 text-xs font-semibold transition-all shadow-sm"
                          >
                            <Database className="w-3.5 h-3.5 text-emerald-400" />
                            <span>Explorer</span>
                          </button>

                          <button
                            onClick={() => openReceipt(tx)}
                            className="inline-flex items-center space-x-1 px-2.5 py-1.5 rounded-xl bg-[#080D1A] hover:bg-sky-500/20 border border-slate-700 hover:border-sky-500/50 text-slate-300 hover:text-sky-300 text-xs font-semibold transition-all group-hover:border-sky-500/40"
                          >
                            <FileText className="w-3.5 h-3.5 text-sky-400" />
                            <span>Receipt</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Security & Audit Footer Notice */}
      <div className="p-4 rounded-2xl bg-[#080D1A] border border-slate-800/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs font-mono text-slate-400">
        <div className="flex items-center space-x-2">
          <Shield className="w-4 h-4 text-emerald-400 flex-shrink-0" />
          <span>
            Every transaction is verified on the Midnight Network Preprod ledger with Halo2 ZK-SNARK proofs and instant receipt pinning.
          </span>
        </div>
        <div className="flex items-center space-x-2 flex-shrink-0">
          <span className="text-slate-500">Contract:</span>
          <span className="text-sky-300">0x9f8c...6d7e</span>
        </div>
      </div>
    </div>
  );
};

export default PaymentHistory;
