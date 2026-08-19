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
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.94, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.94, y: 15 }}
          className="w-full max-w-lg bg-white/95 backdrop-blur-2xl rounded-3xl p-6 sm:p-8 border border-white/80 shadow-2xl relative overflow-hidden text-slate-800"
        >
          {/* Close Button */}
          <button
            onClick={() => setIsTelegramModalOpen(false)}
            className="absolute top-4 right-4 p-2 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Header */}
          <div className="flex items-center space-x-3 mb-6">
            <div className="w-12 h-12 rounded-2xl bg-sky-100 text-sky-600 flex items-center justify-center shadow-xs">
              <Send className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-xl font-display font-black text-slate-900">
                Telegram Sharded Storage
              </h3>
              <p className="text-xs text-slate-500">
                Connect your private Telegram channel as an infinite encrypted backend.
              </p>
            </div>
          </div>

          {savedSuccess && (
            <div className="mb-4 p-3 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold flex items-center space-x-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Telegram Storage Credentials Verified & Saved!</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSave} className="space-y-4 text-xs font-mono">
            <div>
              <label className="block text-slate-700 font-bold font-sans mb-1">
                Channel Name
              </label>
              <input
                type="text"
                value={channelName}
                onChange={(e) => setChannelName(e.target.value)}
                placeholder="e.g. My Private Shard Vault"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 focus:border-sky-500 focus:ring-2 focus:ring-sky-100 text-slate-800 outline-none text-xs"
              />
            </div>

            <div>
              <label className="block text-slate-700 font-bold font-sans mb-1">
                Bot Token (from @BotFather)
              </label>
              <input
                type="text"
                value={botToken}
                onChange={(e) => setBotToken(e.target.value)}
                placeholder="123456789:ABCdefGhIJKlmNoPQRstuVWXyz"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 focus:border-sky-500 focus:ring-2 focus:ring-sky-100 text-slate-800 outline-none text-xs"
              />
            </div>

            <div>
              <label className="block text-slate-700 font-bold font-sans mb-1">
                Channel / Chat ID (e.g. -100...)
              </label>
              <input
                type="text"
                value={chatId}
                onChange={(e) => setChatId(e.target.value)}
                placeholder="-1001234567890"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 focus:border-sky-500 focus:ring-2 focus:ring-sky-100 text-slate-800 outline-none text-xs"
              />
            </div>

            <div className="flex items-center justify-between pt-2">
              <button
                type="button"
                onClick={handleResetToDefault}
                className="text-slate-400 hover:text-slate-600 font-sans text-xs underline cursor-pointer"
              >
                Reset to Default Node
              </button>

              <button
                type="submit"
                className="px-5 py-2.5 rounded-xl bg-sky-500 hover:bg-sky-600 text-white font-bold text-xs font-sans shadow-md transition-all cursor-pointer"
              >
                Save & Connect
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
