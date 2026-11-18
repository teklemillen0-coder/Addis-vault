import React, { useEffect, useState } from 'react';
import { RefreshCw, WifiOff } from 'lucide-react';
import { useOnlineStatus } from '../hooks/useOnlineStatus';
import { Language } from '../types';
import { UI_TRANSLATIONS } from '../i18n/translations';
import {
  flushOfflineQueue,
  readOfflineQueue,
  subscribeOfflineQueue,
} from '../utils/offlineQueue';

interface OfflineIndicatorProps {
  lang: Language;
}

export const OfflineIndicator: React.FC<OfflineIndicatorProps> = ({ lang }) => {
  const isOnline = useOnlineStatus();
  const [queuedCount, setQueuedCount] = useState<number>(() => readOfflineQueue().length);
  const [syncing, setSyncing] = useState(false);

  useEffect(() => {
    setQueuedCount(readOfflineQueue().length);
    return subscribeOfflineQueue(() => {
      setQueuedCount(readOfflineQueue().length);
    });
  }, []);

  if (isOnline && queuedCount === 0) return null;

  const t = UI_TRANSLATIONS[lang];

  const handleManualSync = async () => {
    if (!isOnline || syncing) return;
    setSyncing(true);
    try {
      await flushOfflineQueue();
      setQueuedCount(readOfflineQueue().length);
    } finally {
      setSyncing(false);
    }
  };

  if (!isOnline) {
    return (
      <div
        role="status"
        className="fixed bottom-20 left-4 right-4 sm:right-auto sm:bottom-5 z-40 flex items-center gap-2 rounded-xl border border-amber-400/50 bg-amber-600 px-3.5 py-2 text-xs font-semibold text-white shadow-lg"
      >
        <WifiOff className="h-4 w-4 shrink-0" />
        <span>
          {t.offlineBanner}
          {queuedCount > 0 ? ` (${queuedCount} pending sync)` : ''}
        </span>
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={handleManualSync}
      disabled={syncing}
      className="fixed bottom-20 left-4 right-4 sm:right-auto sm:bottom-5 z-40 flex items-center gap-2 rounded-xl border border-emerald-400/50 bg-emerald-700 px-3.5 py-2 text-xs font-semibold text-white shadow-lg hover:bg-emerald-800 disabled:opacity-70"
    >
      <RefreshCw className={`h-4 w-4 shrink-0 ${syncing ? 'animate-spin' : ''}`} />
      <span>
        {syncing
          ? `Syncing ${queuedCount} offline submission(s)...`
          : `Sync ${queuedCount} queued offline submission(s)`}
      </span>
    </button>
  );
};

