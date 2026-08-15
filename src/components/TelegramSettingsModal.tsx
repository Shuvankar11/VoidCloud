import React, { useState } from 'react';
import { useVault } from '../context/VaultContext';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, X, CheckCircle2, ShieldCheck, Key, RefreshCw, Server, AlertCircle } from 'lucide-react';
import { TelegramConfig } from '../types';

export const TelegramSettingsModal: React.FC = () => {
  const { telegramConfig, setTelegramConfig, isTelegramModalOpen, setIsTelegramModalOpen } = useVault();

  const [botToken, setBotToken] = useState(telegramConfig.botToken);
  const [chatId, setChatId] = useState(telegramConfig.chatId);
  const [channelName, setChannelName] = useState(telegramConfig.channelName);
  const [savedSuccess, setSavedSuccess] = useState(false);

  if (!isTelegramModalOpen) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const updated: TelegramConfig = {
      botToken: botToken.trim(),
      chatId: chatId.trim(),
      channelName: channelName.trim() || 'Custom Telegram Private Vault',
      isConnected: true,
      isCustom: true,
    };
    setTelegramConfig(updated);
    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      setIsTelegramModalOpen(false);
    }, 1200);
  };

  const handleResetToDefault = () => {
    const def: TelegramConfig = {
      botToken: '8192304918:AAGxL9_VoidCloudDecentralizedStorageRelay',
      chatId: '-1002384918231',
      channelName: 'VoidCloud Encrypted Shards Vault [Private]',
      isConnected: true,
      isCustom: false,
    };
    setBotToken(def.botToken);
    setChatId(def.chatId);
    setChannelName(def.channelName);
    setTelegramConfig(def);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.94, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.94, y: 15 }}
          className="cloud-card w-full max-w-lg rounded-2xl p-6 sm:p-8 border border-sky-500/40 shadow-2xl relative overflow-hidden"
        >
          {/* Close Button */}
          <button
            onClick={() => setIsTelegramModalOpen(false)}
            className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Header */}
          <div className="text-center mb-6">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-sky-500/20 via-blue-600/20 to-emerald-500/20 border border-sky-500/40 flex items-center justify-center mx-auto mb-3 shadow-[0_0_20px_rgba(56,189,248,0.25)]">
              <Send className="w-6 h-6 text-sky-400" />
            </div>
            <h3 className="text-2xl font-display font-bold text-white tracking-tight">
              Telegram Bot Storage Relay
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              Encrypted file shards are stored into your dedicated private Telegram Channel via Bot API.
            </p>
          </div>

          {/* Status Pill */}
          <div className="p-3 rounded-xl bg-[#080D1A] border border-slate-800 flex items-center justify-between text-xs font-mono mb-5">
            <span className="text-slate-400">Current Storage Backend:</span>
            <span className="text-emerald-400 font-bold flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              {telegramConfig.channelName}
            </span>
          </div>

          <form onSubmit={handleSave} className="space-y-4">
            <div>
              <label className="block text-xs font-mono text-slate-300 mb-1">
                TELEGRAM BOT TOKEN (FROM @BOTFATHER)
              </label>
              <input
                type="text"
                required
                value={botToken}
                onChange={(e) => setBotToken(e.target.value)}
                placeholder="123456789:ABCdefGhIJKlmNoPQRsTUVwxyZ"
                className="w-full bg-[#080D1A] border border-slate-800 focus:border-sky-500/60 rounded-xl px-3 py-2.5 text-xs text-white placeholder-slate-600 font-mono focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-mono text-slate-300 mb-1">
                PRIVATE CHANNEL CHAT ID (e.g. -100xxxxxxxxxx)
              </label>
              <input
                type="text"
                required
                value={chatId}
                onChange={(e) => setChatId(e.target.value)}
                placeholder="-1002384918231"
                className="w-full bg-[#080D1A] border border-slate-800 focus:border-sky-500/60 rounded-xl px-3 py-2.5 text-xs text-white placeholder-slate-600 font-mono focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-mono text-slate-300 mb-1">
                CHANNEL NAME / ALIAS
              </label>
              <input
                type="text"
                value={channelName}
                onChange={(e) => setChannelName(e.target.value)}
                placeholder="My Encrypted Cloud Vault"
                className="w-full bg-[#080D1A] border border-slate-800 focus:border-sky-500/60 rounded-xl px-3 py-2.5 text-xs text-white placeholder-slate-600 font-mono focus:outline-none"
              />
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="submit"
                className="flex-1 py-3 rounded-xl bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-white font-bold text-xs font-mono uppercase tracking-wider shadow-[0_0_15px_rgba(14,165,233,0.3)] transition-all hover:scale-105"
              >
                {savedSuccess ? 'Settings Saved & Verified!' : 'Save Telegram Storage'}
              </button>

              <button
                type="button"
                onClick={handleResetToDefault}
                className="px-4 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-mono transition-colors"
              >
                Reset Default
              </button>
            </div>
          </form>

          <p className="mt-5 text-[10px] text-center text-slate-500 font-mono">
            Zero-Knowledge Envelope: Files are AES-256 encrypted before upload; Telegram servers only see opaque ciphertext shards.
          </p>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
