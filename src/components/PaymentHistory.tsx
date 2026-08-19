import React, { useState, useMemo } from 'react';
import { useVault } from '../context/VaultContext';
import { useWeb3Wallet } from '../context/WalletContext';
import { PaymentTransaction, TransactionStatus } from '../types';
import {
  FileText,
  Search,
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
  Trash2,
} from 'lucide-react';

export const PaymentHistory: React.FC = () => {
  const { session, setActiveView } = useVault();
  const {
    wallet,
    transactions,
    clearTransactions,
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
      if (selectedStatus !== 'all' && tx.status !== selectedStatus) return false;
      if (selectedToken !== 'all' && tx.token !== selectedToken) return false;

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
  }, [transactions, selectedStatus, selectedToken, searchQuery]);

  // Summary Metrics calculations
  const totalSpentNIGHT = useMemo(() => {
    return transactions
      .filter((t: PaymentTransaction) => t.status === 'success' && t.token === 'NIGHT' && !t.planName.includes('Faucet'))
      .reduce((acc: number, curr: PaymentTransaction) => acc + curr.amount, 0);
  }, [transactions]);

  const totalSuccessful = useMemo(() => {
    return transactions.filter((t: PaymentTransaction) => t.status === 'success').length;
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
    <section
      className="min-h-screen py-8 px-3 sm:px-6 lg:px-8 bg-cover bg-center bg-no-repeat transition-all"
      style={{
        backgroundImage: 'url(/aurora-bg.jpg)',
        backgroundColor: '#EBF4FF',
      }}
    >
      <div className="max-w-7xl mx-auto rounded-3xl bg-white/95 backdrop-blur-2xl border border-white/80 shadow-[0_25px_80px_rgba(30,60,140,0.16)] p-6 sm:p-8 space-y-6 text-slate-800">
        
        {/* Top Header & Navigation */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-200">
          <div>
            <button
              onClick={() => setActiveView('dashboard')}
              className="inline-flex items-center space-x-1.5 text-xs font-bold text-slate-500 hover:text-sky-600 mb-2 transition-colors group cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-1 transition-transform" />
              <span>Back to Dashboard</span>
            </button>

            <div className="flex items-center space-x-3">
              <div className="w-11 h-11 rounded-2xl bg-sky-100 text-sky-600 flex items-center justify-center shadow-xs">
                <FileText className="w-5 h-5" />
              </div>
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="text-xl sm:text-2xl font-display font-black text-slate-900 tracking-tight">
                    Payment & Transaction Ledger
                  </h1>
                  <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 border border-emerald-200 text-[10px] font-bold text-emerald-700 uppercase">
                    Midnight Preprod
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-0.5">
                  Complete cryptographic audit trail of all cloud storage purchases and testnet token settlements.
                </p>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="inline-flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-colors"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-sky-500' : ''}`} />
              <span>{isRefreshing ? 'Syncing...' : 'Sync Ledger'}</span>
            </button>

            <button
              onClick={() => setIsPricingModalOpen(true)}
              className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-sky-500 hover:bg-sky-600 text-white font-bold text-xs shadow-md shadow-sky-500/25 transition-all"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Upgrade Plan</span>
            </button>
          </div>
        </div>

        {/* 4 Summary Metrics Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Card 1: Total Settled */}
          <div className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200 shadow-xs flex items-center space-x-3.5">
            <div className="w-11 h-11 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center flex-shrink-0">
              <Coins className="w-5 h-5" />
            </div>
            <div>
              <div className="text-[11px] font-semibold text-slate-400">Total Spent</div>
              <div className="text-lg sm:text-xl font-black text-slate-900 font-mono">
                {totalSpentNIGHT} <span className="text-xs font-bold text-purple-600">NIGHT</span>
              </div>
            </div>
          </div>

          {/* Card 2: Successful Transactions */}
          <div className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200 shadow-xs flex items-center space-x-3.5">
            <div className="w-11 h-11 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center flex-shrink-0">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <div className="text-[11px] font-semibold text-slate-400">Settled Receipts</div>
              <div className="text-lg sm:text-xl font-black text-slate-900 font-mono">
                {totalSuccessful} <span className="text-xs font-bold text-emerald-600">Verified</span>
              </div>
            </div>
          </div>

          {/* Card 3: Storage Quota */}
          <div className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200 shadow-xs flex items-center space-x-3.5">
            <div className="w-11 h-11 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center flex-shrink-0">
              <HardDrive className="w-5 h-5" />
            </div>
            <div>
              <div className="text-[11px] font-semibold text-slate-400">Total Storage</div>
              <div className="text-lg sm:text-xl font-black text-slate-900 font-mono">
                {session.quotaGB} <span className="text-xs font-bold text-sky-600">GB</span>
              </div>
            </div>
          </div>

          {/* Card 4: Lace Wallet Balance */}
          <div className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200 shadow-xs flex items-center space-x-3.5">
            <div className="w-11 h-11 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center flex-shrink-0">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <div className="text-[11px] font-semibold text-slate-400">Wallet Balance</div>
              <div className="text-lg sm:text-xl font-black text-slate-900 font-mono">
                {wallet.balances.NIGHT} <span className="text-xs font-bold text-amber-600">NIGHT</span>
              </div>
            </div>
          </div>
        </div>

        {/* Filter & Search Bar */}
        <div className="rounded-2xl border border-slate-200 bg-slate-50/80 p-4 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          
          {/* Status Tabs */}
          <div className="flex flex-wrap items-center bg-white p-1 rounded-xl border border-slate-200 text-xs">
            <button
              onClick={() => setSelectedStatus('all')}
              className={`px-3 py-1.5 rounded-lg transition-colors ${
                selectedStatus === 'all' ? 'bg-sky-500 text-white font-bold shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              All ({transactions.length})
            </button>
            <button
              onClick={() => setSelectedStatus('success')}
              className={`px-3 py-1.5 rounded-lg transition-colors ${
                selectedStatus === 'success' ? 'bg-sky-500 text-white font-bold shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Verified
            </button>
            <button
              onClick={() => setSelectedStatus('pending')}
              className={`px-3 py-1.5 rounded-lg transition-colors ${
                selectedStatus === 'pending' ? 'bg-sky-500 text-white font-bold shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Pending
            </button>
          </div>

          {/* Search Box & Export */}
          <div className="flex items-center space-x-2 w-full md:w-auto">
            <div className="relative flex-1 md:w-72">
              <Search className="absolute left-3.5 top-2.5 w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search Tx hash, plan name..."
                className="w-full pl-10 pr-4 py-2 rounded-xl bg-white border border-slate-200 focus:border-sky-400 focus:ring-2 focus:ring-sky-100 text-xs text-slate-800 placeholder-slate-400 outline-none transition-all shadow-xs"
              />
            </div>

            <button
              onClick={exportTransactionsCSV}
              className="p-2 rounded-xl bg-white hover:bg-slate-100 border border-slate-200 text-slate-600 transition-colors shadow-xs"
              title="Export CSV"
            >
              <Download className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Transactions Table */}
        <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-xs">
          <table className="w-full text-left border-collapse text-xs min-w-[960px]">
            <thead>
              <tr className="border-b border-slate-200 text-[11px] font-semibold text-slate-400 uppercase tracking-wider bg-slate-50/70">
                <th className="py-3.5 px-4">Transaction / Plan</th>
                <th className="py-3.5 px-4">Amount</th>
                <th className="py-3.5 px-4">Transaction Hash</th>
                <th className="py-3.5 px-4 text-center">Status</th>
                <th className="py-3.5 px-4">Date</th>
                <th className="py-3.5 px-4 text-right">Audit & Inspect</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredTransactions.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-10 text-center text-slate-400">
                    No transactions found matching your criteria.
                  </td>
                </tr>
              ) : (
                filteredTransactions.map((tx: PaymentTransaction) => (
                  <tr key={tx.id} className="hover:bg-slate-50/70 transition-colors">
                    {/* Plan Name */}
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-slate-900 text-xs">{tx.planName}</div>
                      <div className="text-[10px] text-slate-400 font-mono">
                        +{tx.capacityGB || 20} GB Quota Allocation
                      </div>
                    </td>

                    {/* Amount */}
                    <td className="py-3.5 px-4 font-mono font-bold text-slate-800">
                      {tx.amount} <span className="text-[10px] text-sky-600 font-semibold">{tx.token}</span>
                    </td>

                    {/* Hash */}
                    <td className="py-3.5 px-4 font-mono text-slate-600">
                      <div className="flex items-center space-x-1.5">
                        <span className="truncate max-w-[150px]">{tx.txHash}</span>
                        <button
                          onClick={() => copyToClipboard(tx.txHash, tx.id)}
                          className="text-slate-400 hover:text-sky-600 p-0.5"
                          title="Copy Tx Hash"
                        >
                          {copiedHash === tx.id ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
                        </button>
                      </div>
                    </td>

                    {/* Status */}
                    <td className="py-3.5 px-4 text-center whitespace-nowrap">
                      {tx.status === 'success' ? (
                        <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-bold">
                          <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                          <span>Verified</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200 text-[10px] font-bold">
                          <Clock className="w-3 h-3 text-amber-500" />
                          <span>Pending</span>
                        </span>
                      )}
                    </td>

                    {/* Date */}
                    <td className="py-3.5 px-4 text-slate-500 whitespace-nowrap">
                      {formatRelativeTime(tx.timestamp)}
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 px-4 text-right whitespace-nowrap">
                      <div className="inline-flex items-center space-x-2">
                        <button
                          onClick={() => openExplorer(tx)}
                          className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-sky-50 text-slate-700 hover:text-sky-600 border border-slate-200 text-[11px] font-semibold transition-colors flex items-center space-x-1"
                        >
                          <ExternalLink className="w-3 h-3" />
                          <span>Explorer</span>
                        </button>

                        <button
                          onClick={() => openReceipt(tx)}
                          className="px-2.5 py-1 rounded-lg bg-sky-50 hover:bg-sky-100 text-sky-700 border border-sky-200 text-[11px] font-bold transition-colors flex items-center space-x-1"
                        >
                          <FileText className="w-3 h-3" />
                          <span>Receipt</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
};
