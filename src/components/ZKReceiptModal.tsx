import React, { useState } from 'react';
import { useWeb3Wallet } from '../context/WalletContext';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FileText,
  X,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Copy,
  Check,
  ExternalLink,
  Printer,
  Download,
  Shield,
  Sparkles,
  HardDrive,
  QrCode,
  Database,
} from 'lucide-react';

export const ZKReceiptModal: React.FC = () => {
  const {
    selectedReceiptTx,
    setSelectedReceiptTx,
    isReceiptModalOpen,
    setIsReceiptModalOpen,
    setSelectedExplorerTx,
    setIsExplorerModalOpen,
  } = useWeb3Wallet();
  const [copiedField, setCopiedField] = useState<string | null>(null);

  if (!isReceiptModalOpen || !selectedReceiptTx) return null;

  const openExplorer = () => {
    setSelectedExplorerTx(selectedReceiptTx);
    setIsExplorerModalOpen(true);
  };

  const tx = selectedReceiptTx;
  const isSuccess = tx.status === 'success';
  const isFailed = tx.status === 'failed';
  const isPending = tx.status === 'pending';

  const copyToClipboard = (text: string, fieldName: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(fieldName);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadJSON = () => {
    const jsonStr = JSON.stringify(tx, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `receipt-${tx.receiptId || tx.id}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(() => URL.revokeObjectURL(url), 2000);
  };

  const formattedDate = new Date(tx.timestamp).toLocaleDateString(undefined, {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
  const formattedTime = new Date(tx.timestamp).toLocaleTimeString(undefined, {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md overflow-y-auto print:bg-white print:p-0">
        <motion.div
          initial={{ opacity: 0, scale: 0.94, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.94, y: 15 }}
          className="cloud-card w-full max-w-2xl rounded-3xl p-5 sm:p-7 border border-sky-500/40 shadow-2xl relative my-6 print:border-none print:shadow-none print:bg-white print:text-black"
        >
          {/* Close Button */}
          <button
            onClick={() => {
              setIsReceiptModalOpen(false);
              setSelectedReceiptTx(null);
            }}
            className="absolute top-4 right-4 p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors print:hidden"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Receipt Header */}
          <div className="border-b border-slate-800 pb-5 mb-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-2xl bg-sky-500/20 border border-sky-500/40 flex items-center justify-center text-sky-400">
                <FileText className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <h3 className="text-lg font-bold font-display text-white">Cryptographic Transaction Receipt</h3>
                </div>
                <p className="text-xs text-slate-400 font-mono">
                  Receipt ID: <span className="text-sky-300 font-bold">{tx.receiptId}</span>
                </p>
              </div>
            </div>

            {/* Status Pill */}
            <div>
              {isSuccess && (
                <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-emerald-950/80 border border-emerald-500/50 text-emerald-300 text-xs font-mono font-bold shadow-[0_0_12px_rgba(16,185,129,0.3)]">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>SETTLED & CONFIRMED</span>
                </span>
              )}
              {isFailed && (
                <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-rose-950/80 border border-rose-500/50 text-rose-300 text-xs font-mono font-bold">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  <span>PAYMENT REVERTED / FAILED</span>
                </span>
              )}
              {isPending && (
                <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-amber-950/80 border border-amber-500/50 text-amber-300 text-xs font-mono font-bold">
                  <Clock className="w-3.5 h-3.5 animate-spin" />
                  <span>PENDING CONFIRMATION</span>
                </span>
              )}
            </div>
          </div>

          {/* Key Receipt Overview Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-5 text-xs font-mono">
            <div className="p-3 rounded-2xl bg-[#080D1A] border border-slate-800/80">
              <span className="text-slate-400 block text-[10px] uppercase tracking-wider">Date & Time</span>
              <span className="text-white font-semibold block mt-0.5">{formattedDate}</span>
              <span className="text-slate-400 text-[10px] block">{formattedTime}</span>
            </div>

            <div className="p-3 rounded-2xl bg-[#080D1A] border border-slate-800/80">
              <span className="text-slate-400 block text-[10px] uppercase tracking-wider">Amount Paid</span>
              <span className={`text-base font-bold block mt-0.5 ${tx.token === 'FREE' ? 'text-amber-400' : 'text-emerald-400'}`}>
                {tx.amount === 0 ? 'FREE (ZK Grant)' : `${tx.amount} ${tx.token}`}
              </span>
              <span className="text-slate-400 text-[10px] block">
                {tx.billingCycle ? `Term: ${tx.billingCycle}` : 'One-time Settlement'}
              </span>
            </div>

            <div className="col-span-2 sm:col-span-1 p-3 rounded-2xl bg-[#080D1A] border border-slate-800/80">
              <span className="text-slate-400 block text-[10px] uppercase tracking-wider">Storage Capacity</span>
              <div className="flex items-center space-x-1.5 mt-0.5">
                <HardDrive className="w-4 h-4 text-sky-400" />
                <span className="text-white font-bold text-sm">+{tx.capacityGB || 20} GB</span>
              </div>
              <span className="text-sky-400/80 text-[10px] block">AES-256 Pinned Shard</span>
            </div>
          </div>

          {/* Detailed Metadata Table */}
          <div className="bg-[#080D1A] rounded-2xl border border-slate-800 p-4 space-y-3 font-mono text-xs mb-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 pb-2.5 border-b border-slate-800/80">
              <span className="text-slate-400">Plan / Action:</span>
              <span className="text-white font-semibold flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                {tx.planName}
              </span>
            </div>

            {tx.failureReason && (
              <div className="p-2.5 rounded-xl bg-rose-950/40 border border-rose-500/40 text-rose-300 text-xs">
                <span className="font-bold block mb-0.5">Reversion Reason:</span>
                <span>{tx.failureReason}</span>
              </div>
            )}

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 pb-2.5 border-b border-slate-800/80">
              <span className="text-slate-400">Ledger Network:</span>
              <span className="text-sky-300 font-semibold">{tx.network}</span>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 pb-2.5 border-b border-slate-800/80">
              <span className="text-slate-400">Block Height:</span>
              <span className="text-slate-200">#{tx.blockHeight || 849225}</span>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 pb-2.5 border-b border-slate-800/80">
              <span className="text-slate-400">Network Gas Fee:</span>
              <span className="text-slate-200">{tx.gasFee || '0.0035 tDUST'}</span>
            </div>

            {/* Transaction Hash */}
            <div className="space-y-1 pb-2.5 border-b border-slate-800/80">
              <div className="flex items-center justify-between">
                <span className="text-slate-400">On-Chain Transaction Hash:</span>
                <button
                  onClick={() => copyToClipboard(tx.txHash, 'txHash')}
                  className="inline-flex items-center space-x-1 text-[11px] text-sky-400 hover:text-sky-300"
                >
                  {copiedField === 'txHash' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                  <span>{copiedField === 'txHash' ? 'Copied' : 'Copy'}</span>
                </button>
              </div>
              <div className="p-2 rounded-xl bg-[#030712] border border-slate-800 text-[11px] text-sky-300 break-all">
                {tx.txHash}
              </div>
            </div>

            {/* Sender Address */}
            <div className="space-y-1 pb-2.5 border-b border-slate-800/80">
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Sender / User Account:</span>
                <button
                  onClick={() => copyToClipboard(tx.senderAddress, 'sender')}
                  className="inline-flex items-center space-x-1 text-[11px] text-sky-400 hover:text-sky-300"
                >
                  {copiedField === 'sender' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                  <span>{copiedField === 'sender' ? 'Copied' : 'Copy'}</span>
                </button>
              </div>
              <div className="p-2 rounded-xl bg-[#030712] border border-slate-800 text-[11px] text-slate-300 break-all">
                {tx.senderAddress}
              </div>
            </div>

            {/* Receiver Treasury Address */}
            <div className="space-y-1 pb-2.5 border-b border-slate-800/80">
              <div className="flex items-center justify-between">
                <span className="text-slate-400">VoidCloud Treasury Receiver:</span>
                <button
                  onClick={() => copyToClipboard(tx.receiverAddress, 'receiver')}
                  className="inline-flex items-center space-x-1 text-[11px] text-sky-400 hover:text-sky-300"
                >
                  {copiedField === 'receiver' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                  <span>{copiedField === 'receiver' ? 'Copied' : 'Copy'}</span>
                </button>
              </div>
              <div className="p-2 rounded-xl bg-[#030712] border border-slate-800 text-[11px] text-slate-300 break-all">
                {tx.receiverAddress}
              </div>
            </div>

            {/* ZK Nullifier if present */}
            {tx.zkProofNullifier && (
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-slate-400 flex items-center gap-1">
                    <Shield className="w-3 h-3 text-emerald-400" />
                    Midnight ZK Nullifier Hash:
                  </span>
                  <button
                    onClick={() => copyToClipboard(tx.zkProofNullifier!, 'nullifier')}
                    className="inline-flex items-center space-x-1 text-[11px] text-sky-400 hover:text-sky-300"
                  >
                    {copiedField === 'nullifier' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    <span>{copiedField === 'nullifier' ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>
                <div className="p-2 rounded-xl bg-[#030712] border border-emerald-500/30 text-[11px] text-emerald-300 break-all">
                  {tx.zkProofNullifier}
                </div>
              </div>
            )}
          </div>

          {/* Action Buttons Footer */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2 print:hidden">
            <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
              <button
                onClick={openExplorer}
                className="inline-flex items-center justify-center space-x-1.5 px-3.5 py-2 rounded-xl bg-gradient-to-r from-emerald-500/20 to-sky-500/20 hover:from-emerald-500/30 hover:to-sky-500/30 border border-emerald-500/50 text-emerald-300 hover:text-emerald-200 text-xs font-mono font-semibold transition-all hover:scale-105 shadow-sm"
              >
                <Database className="w-3.5 h-3.5 text-emerald-400" />
                <span>Open in Midnight Explorer</span>
              </button>

              <button
                onClick={handlePrint}
                className="inline-flex items-center justify-center space-x-1.5 px-3 py-2 rounded-xl bg-[#080D1A] hover:bg-[#10172A] border border-slate-700 text-slate-300 hover:text-white text-xs font-mono transition-colors"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print</span>
              </button>

              <button
                onClick={handleDownloadJSON}
                className="inline-flex items-center justify-center space-x-1.5 px-3 py-2 rounded-xl bg-[#080D1A] hover:bg-[#10172A] border border-slate-700 text-slate-300 hover:text-white text-xs font-mono transition-colors"
              >
                <Download className="w-3.5 h-3.5" />
                <span>JSON</span>
              </button>
            </div>

            <button
              onClick={() => {
                setIsReceiptModalOpen(false);
                setSelectedReceiptTx(null);
              }}
              className="w-full sm:w-auto px-5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-mono font-semibold transition-all"
            >
              Close Receipt
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default ZKReceiptModal;
