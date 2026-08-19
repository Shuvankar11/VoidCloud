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
  HardDrive,
  Sparkles,
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
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/75 backdrop-blur-md overflow-y-auto print:bg-white print:p-0">
        <motion.div
          initial={{ opacity: 0, scale: 0.94, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.94, y: 15 }}
          className="w-full max-w-2xl rounded-3xl p-6 sm:p-8 bg-white/95 backdrop-blur-2xl border border-white/80 shadow-2xl relative my-6 text-slate-800 print:border-none print:shadow-none print:bg-white print:text-black"
        >
          {/* Close Button */}
          <button
            onClick={() => {
              setIsReceiptModalOpen(false);
              setSelectedReceiptTx(null);
            }}
            className="absolute top-4 right-4 p-2 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors print:hidden cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Receipt Header */}
          <div className="border-b border-slate-200 pb-5 mb-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="flex items-center space-x-3">
              <div className="w-11 h-11 rounded-2xl bg-sky-100 text-sky-600 flex items-center justify-center shadow-xs">
                <FileText className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <h3 className="text-lg font-black font-display text-slate-900">Cryptographic Receipt</h3>
                </div>
                <p className="text-xs text-slate-500 font-mono">
                  Receipt ID: <span className="text-sky-600 font-bold">{tx.receiptId || tx.id.slice(0, 16)}</span>
                </p>
              </div>
            </div>

            {/* Status Pill */}
            <div>
              {isSuccess && (
                <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>SETTLED & CONFIRMED</span>
                </span>
              )}
              {isFailed && (
                <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-rose-50 border border-rose-200 text-rose-600 text-xs font-bold">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  <span>REVERTED / FAILED</span>
                </span>
              )}
              {isPending && (
                <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-700 text-xs font-bold">
                  <Clock className="w-3.5 h-3.5 animate-spin" />
                  <span>PENDING</span>
                </span>
              )}
            </div>
          </div>

          {/* Key Receipt Overview Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-5 text-xs">
            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200">
              <span className="text-slate-400 block text-[10px] uppercase font-bold">Date & Time</span>
              <span className="text-slate-900 font-bold block mt-0.5">{formattedDate}</span>
              <span className="text-slate-500 text-[10px] block">{formattedTime}</span>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200">
              <span className="text-slate-400 block text-[10px] uppercase font-bold">Amount Settled</span>
              <span className={`text-base font-black block mt-0.5 ${tx.token === 'FREE' ? 'text-amber-600' : 'text-emerald-600'}`}>
                {tx.amount === 0 ? 'FREE (ZK Grant)' : `${tx.amount} ${tx.token}`}
              </span>
              <span className="text-slate-500 text-[10px] block">
                {tx.billingCycle ? `Term: ${tx.billingCycle}` : 'One-time Settlement'}
              </span>
            </div>

            <div className="col-span-2 sm:col-span-1 p-3.5 rounded-2xl bg-slate-50 border border-slate-200">
              <span className="text-slate-400 block text-[10px] uppercase font-bold">Storage Capacity</span>
              <div className="flex items-center space-x-1.5 mt-0.5">
                <HardDrive className="w-4 h-4 text-sky-600" />
                <span className="text-slate-900 font-black text-sm">+{tx.capacityGB || 20} GB</span>
              </div>
              <span className="text-sky-600 text-[10px] font-semibold block">AES-256 Pinned Shard</span>
            </div>
          </div>

          {/* Detailed Metadata Table */}
          <div className="bg-slate-50 rounded-2xl border border-slate-200 p-4 space-y-3 font-mono text-xs mb-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 pb-2.5 border-b border-slate-200">
              <span className="text-slate-500 font-sans">Plan / Action:</span>
              <span className="text-slate-900 font-bold flex items-center gap-1.5 font-sans">
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                {tx.planName}
              </span>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 pb-2.5 border-b border-slate-200">
              <span className="text-slate-500 font-sans">Transaction Hash:</span>
              <div className="flex items-center space-x-2">
                <span className="text-sky-600 font-bold truncate max-w-[240px]">{tx.txHash}</span>
                <button
                  onClick={() => copyToClipboard(tx.txHash, 'txHash')}
                  className="text-slate-400 hover:text-sky-600 p-1"
                >
                  {copiedField === 'txHash' ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
              <span className="text-slate-500 font-sans">Sender Address:</span>
              <div className="flex items-center space-x-2">
                <span className="text-slate-700 truncate max-w-[240px]">{tx.senderAddress}</span>
                <button
                  onClick={() => copyToClipboard(tx.senderAddress, 'sender')}
                  className="text-slate-400 hover:text-sky-600 p-1"
                >
                  {copiedField === 'sender' ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>
          </div>

          {/* Action Footer Buttons */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-2 print:hidden">
            <div className="flex items-center space-x-2">
              <button
                onClick={handlePrint}
                className="px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs transition-colors flex items-center space-x-1.5 cursor-pointer"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print</span>
              </button>

              <button
                onClick={handleDownloadJSON}
                className="px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs transition-colors flex items-center space-x-1.5 cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>JSON</span>
              </button>
            </div>

            <button
              onClick={openExplorer}
              className="px-4 py-2 rounded-xl bg-sky-500 hover:bg-sky-600 text-white font-bold text-xs shadow-md shadow-sky-500/25 transition-all flex items-center space-x-1.5 cursor-pointer"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>Inspect on Midnight Preprod Explorer</span>
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
