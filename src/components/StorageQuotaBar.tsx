import React from 'react';
import { HardDrive, AlertCircle } from 'lucide-react';
import { formatBytes } from '../utils/formatters';

interface Props {
  usedBytes: number;
  totalBytes: number;
  className?: string;
}

export const StorageQuotaBar: React.FC<Props> = ({ usedBytes, totalBytes, className = '' }) => {
  const percentage = totalBytes > 0 ? Math.min(100, Math.round((usedBytes / totalBytes) * 100)) : 0;
  const isHigh = percentage >= 85;
  const isCritical = percentage >= 95;

  let barColor = 'bg-gradient-to-r from-cyan-500 to-indigo-500';
  if (isCritical) {
    barColor = 'bg-gradient-to-r from-red-500 to-rose-600';
  } else if (isHigh) {
    barColor = 'bg-gradient-to-r from-amber-500 to-orange-500';
  }

  return (
    <div className={`space-y-2 ${className}`}>
      <div className="flex items-center justify-between text-xs">
        <div className="flex items-center gap-1.5 text-slate-300 font-medium">
          <HardDrive className="w-3.5 h-3.5 text-indigo-400" />
          <span>Shielded Storage</span>
        </div>
        <span className="font-semibold text-slate-200">
          {formatBytes(usedBytes)} / {formatBytes(totalBytes)} ({percentage}%)
        </span>
      </div>

      <div className="w-full h-2 rounded-full bg-slate-800/80 overflow-hidden border border-slate-700/40 p-0.5">
        <div
          className={`h-full rounded-full transition-all duration-500 ${barColor}`}
          style={{ width: `${Math.max(2, percentage)}%` }}
        />
      </div>

      {isHigh && (
        <div className="flex items-center gap-1 text-[11px] text-amber-400/90 pt-0.5">
          <AlertCircle className="w-3 h-3 flex-shrink-0" />
          <span>Storage quota near capacity. Claim bonus or upgrade tier.</span>
        </div>
      )}
    </div>
  );
};
