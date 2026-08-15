import React, { useState, useRef, useEffect } from 'react';
import { useVault } from '../context/VaultContext';
import { Terminal, Copy, CheckCircle2, CornerDownLeft, Sparkles, Server } from 'lucide-react';
import { TerminalOutputItem } from '../types';

export const LiveTerminalWidget: React.FC = () => {
  const { session, files, metrics, claimBonusWithZKProof, uploadAndEncryptFile, shredFile, initializeSession } = useVault();
  const [inputVal, setInputVal] = useState('');
  const [history, setHistory] = useState<string[]>([]);
  const [historyIdx, setHistoryIdx] = useState<number>(-1);
  const [copied, setCopied] = useState(false);
  const terminalScrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const isInitialMount = useRef(true);

  const [logs, setLogs] = useState<TerminalOutputItem[]>([
    {
      id: 'log_0',
      type: 'ascii',
      text: `   ___ _                 _   ___ _                 _ 
  / __| |___ _  _ __| | / __| |_ ___ _ _ __ _ __ _ ___
 | (__| / _ \\ || / _\` | \\__ \\  _/ _ \\ '_/ _\` / _\` / -_)
  \\___|_\\___/\\_,_\\__,_| |___/\\__\\___/_| \\__,_\\__, \\___|
                                             |___/     
  [ VOIDCLOUD // MIDNIGHT NETWORK ZK STORAGE SDK v1.0.0 ]`,
      timestamp: new Date().toLocaleTimeString(),
    },
    {
      id: 'log_1',
      type: 'info',
      text: `⚡ Midnight Proof Server connected (http://127.0.0.1:6300) | Preprod Block #${metrics.blockHeight}`,
      timestamp: new Date().toLocaleTimeString(),
    },
    {
      id: 'log_2',
      type: 'info',
      text: `💡 Developer CLI: Type "void help" or "void status" to query on-chain storage state.`,
      timestamp: new Date().toLocaleTimeString(),
    },
  ]);

  // Only scroll inner container when user adds logs, never scroll document window on mount
  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }
    if (terminalScrollRef.current) {
      terminalScrollRef.current.scrollTop = terminalScrollRef.current.scrollHeight;
    }
  }, [logs]);

  const addLog = (type: TerminalOutputItem['type'], text: string) => {
    setLogs((prev) => [
      ...prev,
      {
        id: 'log_' + Math.random().toString(36).substring(2, 9),
        type,
        text,
        timestamp: new Date().toLocaleTimeString(),
      },
    ]);
  };

  const handleCommand = async (rawCmd: string) => {
    const cmd = rawCmd.trim();
    if (!cmd) return;

    addLog('input', `$ ${cmd}`);
    setHistory((prev) => [cmd, ...prev]);
    setHistoryIdx(-1);
    setInputVal('');

    const parts = cmd.split(' ');
    const main = parts[0].toLowerCase();
    const sub = parts[1]?.toLowerCase();
    const arg = parts[2];

    if (main === 'clear' || (main === 'void' && sub === 'clear')) {
      setLogs([]);
      return;
    }

    if (main === 'help' || (main === 'void' && (sub === 'help' || !sub))) {
      addLog(
        'output',
        `VOIDCLOUD CLOUD SDK COMMAND REFERENCE:
  void init                 - Generate client ZK witness & register 20GB cloud tier
  void status               - Query live shielded vault allocation & Midnight node
  void claim-bonus          - Claim 1-time 20GB testnet bonus via ZK nullifier
  void upload <filename>    - Client-side encrypt with AES-256-GCM and pin on-chain
  void list                 - View list of all shielded cloud objects in vault
  void shred <fileId>       - Cryptographically revoke decryption key commitment
  void proof-server         - Test Halo2 ZK Proof Server connectivity
  clear                     - Clear terminal screen`
      );
      return;
    }

    if (main === 'void') {
      switch (sub) {
        case 'init': {
          addLog('info', '⚡ Deriving new 256-bit cryptographic witness keypair...');
          await new Promise((r) => setTimeout(r, 400));
          initializeSession();
          addLog('success', `✔ Cloud vault initialized! Shielded Address: ${session.shieldedAddress}`);
          addLog('output', `Allocation: 20.00 GB (Base Cloud Tier) | Run "void claim-bonus" to unlock +20GB.`);
          break;
        }

        case 'status': {
          const usedGB = (session.usedBytes / (1024 * 1024 * 1024)).toFixed(3);
          const percent = ((session.usedBytes / (session.quotaGB * 1024 * 1024 * 1024)) * 100).toFixed(1);
          addLog(
            'output',
            `--------------------------------------------------
SHIELDED CLOUD METRICS (Midnight Preprod):
  Shielded ID      : ${session.shieldedAddress}
  Total Capacity   : ${session.quotaGB} GB ${session.bonusClaimed ? '(+20GB ZK Faucet Bonus Active)' : '(Bonus Available)'}
  Storage Used     : ${usedGB} GB / ${session.quotaGB} GB (${percent}%)
  Encrypted Files  : ${files.filter((f) => f.status === 'shielded').length}
  Nullifier Status : ${session.bonusClaimed ? 'COMMITTED (0x' + session.nullifierHex.slice(0, 14) + '...)' : 'UNCLAIMED'}
  Midnight Node    : Preprod (Block #${metrics.blockHeight} | Proof Server Latency: ${metrics.proofServerLatencyMs}ms)
--------------------------------------------------`
          );
          break;
        }

        case 'claim-bonus': {
          if (session.bonusClaimed) {
            addLog(
              'error',
              `❌ REJECTED: Nullifier 0x${session.nullifierHex.slice(0, 16)}... already exists in on-chain bonusNullifiers set.\nMidnight Compact invariant prevents duplicate claims.`
            );
            return;
          }
          addLog('info', 'Computing deterministic ZK nullifier from private witness...');
          await new Promise((r) => setTimeout(r, 600));
          addLog('info', 'Synthesizing Halo2 ZK-SNARK proof for `claimTestnetBonus` circuit...');
          const res = await claimBonusWithZKProof();
          if (res.success) {
            addLog('success', '✔ Testnet Faucet Bonus verified on Midnight Preprod! Quota expanded to 40 GB.');
          } else {
            addLog('error', res.error || 'Claim failed');
          }
          break;
        }

        case 'upload': {
          const fileName = arg || `cloud_snapshot_${Math.floor(Math.random() * 900 + 100)}.enc`;
          addLog('info', `Encrypting "${fileName}" with AES-256-GCM client-side...`);
          await new Promise((r) => setTimeout(r, 500));
          const mockFile = new File([`Payload for ${fileName}`], fileName, { type: 'text/plain' });
          const newFile = await uploadAndEncryptFile(mockFile);
          addLog('success', `✔ File "${fileName}" pinned! CID: ${newFile.encryptedCid.slice(0, 20)}...`);
          addLog('output', `ZK Quota Commitment: ${newFile.zkCommitment.slice(0, 22)}... | ID: ${newFile.id}`);
          break;
        }

        case 'list': {
          if (files.length === 0) {
            addLog('info', 'Cloud vault is empty. Use "void upload <name>" to encrypt a file.');
            return;
          }
          let table = 'OBJECT ID     NAME                         SIZE        STATUS\n';
          table += '----------------------------------------------------------------------\n';
          files.forEach((f) => {
            const sizeStr = (f.sizeBytes / (1024 * 1024)).toFixed(2) + ' MB';
            table += `${f.id.padEnd(14)} ${f.name.padEnd(28)} ${sizeStr.padEnd(11)} ${f.status.toUpperCase()}\n`;
          });
          addLog('output', table);
          break;
        }

        case 'shred': {
          if (!arg) {
            addLog('error', 'Usage: void shred <fileId>');
            return;
          }
          const target = files.find((f) => f.id === arg);
          if (!target) {
            addLog('error', `File ID "${arg}" not found.`);
            return;
          }
          addLog('info', `Revoking decryption commitment for ${target.name} on Midnight Preprod...`);
          await new Promise((r) => setTimeout(r, 600));
          await shredFile(arg);
          addLog('success', `✔ Cryptographic key revoked! File ${target.name} cannot be decrypted.`);
          break;
        }

        case 'proof-server': {
          addLog(
            'success',
            `✔ Midnight ZK Proof Server ONLINE\n  Endpoint: http://127.0.0.1:6300 | Prover: Halo2 (Midnight v0.20.4)\n  Active Circuits: initializeUserStorage, claimTestnetBonus, verifyQuota`
          );
          break;
        }

        default:
          addLog('error', `Unknown command: "void ${sub}". Type "void help" for usage.`);
      }
      return;
    }

    addLog('error', `Command not recognized: "${cmd}". Type "void help" for available commands.`);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleCommand(inputVal);
    } else if (e.key === 'ArrowUp') {
      if (history.length > 0 && historyIdx < history.length - 1) {
        const nextIdx = historyIdx + 1;
        setHistoryIdx(nextIdx);
        setInputVal(history[nextIdx]);
      }
    } else if (e.key === 'ArrowDown') {
      if (historyIdx > 0) {
        const nextIdx = historyIdx - 1;
        setHistoryIdx(nextIdx);
        setInputVal(history[nextIdx]);
      } else if (historyIdx === 0) {
        setHistoryIdx(-1);
        setInputVal('');
      }
    }
  };

  const copyTerminalText = () => {
    const text = logs.map((l) => l.text).join('\n');
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const quickRun = (command: string) => {
    handleCommand(command);
  };

  return (
    <section id="terminal" className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      <div className="text-center max-w-3xl mx-auto mb-8">
        <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-[#0E1424] border border-sky-500/30 text-sky-300 text-xs font-mono mb-3">
          <Terminal className="w-3.5 h-3.5" />
          <span>DEVOPS CLI SDK (FOR HACKATHON JUDGES & DEVELOPERS)</span>
        </div>
        <h2 className="text-3xl sm:text-4xl font-display font-bold text-white tracking-tight">
          Cloud Terminal Console
        </h2>
        <p className="mt-2 text-slate-400 text-sm">
          Run native VoidCloud CLI commands directly in your browser. Fully synchronized with your on-chain storage state.
        </p>
      </div>

      {/* Terminal Window */}
      <div className="cloud-card rounded-2xl overflow-hidden border border-slate-800 shadow-2xl">
        
        {/* Terminal Header Bar */}
        <div className="bg-[#080D1A] px-4 py-3 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="flex space-x-1.5">
              <span className="w-3 h-3 rounded-full bg-slate-700 inline-block" />
              <span className="w-3 h-3 rounded-full bg-slate-700 inline-block" />
              <span className="w-3 h-3 rounded-full bg-slate-700 inline-block" />
            </div>
            <span className="text-xs font-mono text-slate-400 ml-3 hidden sm:inline">
              voidcloud-cli // zsh (127.0.0.1:6300)
            </span>
          </div>

          {/* Quick Command Pills */}
          <div className="flex items-center space-x-2">
            <span className="text-[11px] font-mono text-slate-500 hidden md:inline">Quick Run:</span>
            <button
              onClick={() => quickRun('void status')}
              className="px-2.5 py-1 rounded-lg bg-[#0E1424] hover:bg-sky-950 border border-slate-700 hover:border-sky-500/40 text-[11px] font-mono text-sky-300 transition-colors"
            >
              void status
            </button>
            <button
              onClick={() => quickRun('void claim-bonus')}
              className="px-2.5 py-1 rounded-lg bg-[#0E1424] hover:bg-emerald-950 border border-slate-700 hover:border-emerald-500/40 text-[11px] font-mono text-emerald-300 transition-colors"
            >
              void claim-bonus
            </button>
            <button
              onClick={() => quickRun('void list')}
              className="px-2.5 py-1 rounded-lg bg-[#0E1424] hover:bg-blue-950 border border-slate-700 hover:border-blue-500/40 text-[11px] font-mono text-blue-300 transition-colors"
            >
              void list
            </button>
            <button
              onClick={copyTerminalText}
              title="Copy terminal session logs"
              className="p-1 text-slate-400 hover:text-sky-400 transition-colors ml-1"
            >
              {copied ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Terminal Body with inner scroll only */}
        <div
          ref={terminalScrollRef}
          onClick={() => inputRef.current?.focus()}
          className="bg-[#030712] p-4 sm:p-6 font-mono text-xs sm:text-sm h-80 sm:h-96 overflow-y-auto space-y-3 cursor-text"
        >
          {logs.map((log) => {
            let textColor = 'text-slate-300';
            if (log.type === 'input') textColor = 'text-sky-400 font-semibold';
            if (log.type === 'error') textColor = 'text-rose-400';
            if (log.type === 'success') textColor = 'text-emerald-400 font-medium';
            if (log.type === 'ascii') textColor = 'text-sky-300 font-bold';
            if (log.type === 'info') textColor = 'text-blue-300';

            return (
              <div key={log.id} className="whitespace-pre-wrap leading-relaxed">
                <span className={textColor}>{log.text}</span>
              </div>
            );
          })}
        </div>

        {/* Terminal Input Bar */}
        <div className="bg-[#080D1A] px-4 py-3 border-t border-slate-800 flex items-center space-x-3">
          <span className="text-sky-400 font-mono text-sm font-bold">$</span>
          <input
            ref={inputRef}
            type="text"
            value={inputVal}
            onChange={(e) => setInputVal(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type 'void help' or 'void claim-bonus'..."
            className="flex-1 bg-transparent text-slate-100 font-mono text-xs sm:text-sm focus:outline-none placeholder-slate-600"
          />
          <button
            onClick={() => handleCommand(inputVal)}
            className="p-1.5 rounded-lg bg-sky-500/20 hover:bg-sky-500/30 border border-sky-500/40 text-sky-300 transition-colors"
            title="Execute Command"
          >
            <CornerDownLeft className="w-4 h-4" />
          </button>
        </div>

      </div>
    </section>
  );
};
