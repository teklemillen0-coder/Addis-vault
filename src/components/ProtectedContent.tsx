import React, { useCallback, useEffect, useRef, useState } from 'react';
import { EyeOff, ShieldAlert } from 'lucide-react';

interface ProtectedContentProps {
  /** When false, children render normally (e.g. paid & unlocked exports). */
  active?: boolean;
  /** Buyer / preview label shown in the moving watermark. */
  watermark: string;
  children: React.ReactNode;
  className?: string;
  lang?: string;
}

const BLOCKED_COMBOS = new Set(['s', 'p', 'c', 'x', 'u', 'a']);

/**
 * Anti-piracy shield for unpaid previews and Vault files:
 *  - blocks right-click, text copy/cut, drag, save/print shortcuts and long-press menus
 *  - overlays a moving buyer/preview watermark
 *  - immediately blacks out the content on tab switch, window blur, PrintScreen,
 *    OS screenshot shortcuts, or in-page screen-capture requests.
 * Browsers cannot detect every external recorder; the blackout + watermark make leaks traceable.
 */
export const ProtectedContent: React.FC<ProtectedContentProps> = ({
  active = true,
  watermark,
  children,
  className = '',
  lang = 'en',
}) => {
  const [blackout, setBlackout] = useState(false);
  const [pos, setPos] = useState({ x: 12, y: 18 });
  const timerRef = useRef<number | null>(null);

  const triggerBlackout = useCallback((autoRestoreMs?: number) => {
    setBlackout(true);
    if (timerRef.current) window.clearTimeout(timerRef.current);
    if (autoRestoreMs) {
      timerRef.current = window.setTimeout(() => setBlackout(false), autoRestoreMs);
    }
  }, []);

  useEffect(() => {
    if (!active) return;
    const onVisibility = () => {
      if (document.visibilityState === 'hidden') triggerBlackout();
    };
    const onBlur = () => triggerBlackout();
    const onKey = (e: KeyboardEvent) => {
      const key = e.key?.toLowerCase();
      const isPrintScreen = key === 'printscreen' || e.code === 'PrintScreen';
      const macShot = e.metaKey && e.shiftKey && ['3', '4', '5', '6'].includes(key);
      const winSnip = e.metaKey && e.shiftKey && key === 's';
      const devtools = (e.ctrlKey || e.metaKey) && e.shiftKey && ['i', 'j', 'c'].includes(key);
      const combo = (e.ctrlKey || e.metaKey) && BLOCKED_COMBOS.has(key);
      if (isPrintScreen || macShot || winSnip) {
        e.preventDefault();
        triggerBlackout(4000);
        try {
          void navigator.clipboard?.writeText('Protected by AddisVault');
        } catch {
          // ignore
        }
        return;
      }
      if (combo || devtools || key === 'f12') {
        e.preventDefault();
        e.stopPropagation();
      }
    };
    const onBeforePrint = () => triggerBlackout();
    const onAfterPrint = () => setBlackout(false);

    document.addEventListener('visibilitychange', onVisibility);
    window.addEventListener('blur', onBlur);
    window.addEventListener('keydown', onKey, true);
    window.addEventListener('keyup', onKey, true);
    window.addEventListener('beforeprint', onBeforePrint);
    window.addEventListener('afterprint', onAfterPrint);

    // In-page screen capture attempts → blackout.
    const md = typeof navigator !== 'undefined' ? navigator.mediaDevices : undefined;
    const original = md?.getDisplayMedia?.bind(md);
    if (md && original) {
      md.getDisplayMedia = (...args: Parameters<typeof original>) => {
        triggerBlackout();
        return original(...args);
      };
    }

    return () => {
      document.removeEventListener('visibilitychange', onVisibility);
      window.removeEventListener('blur', onBlur);
      window.removeEventListener('keydown', onKey, true);
      window.removeEventListener('keyup', onKey, true);
      window.removeEventListener('beforeprint', onBeforePrint);
      window.removeEventListener('afterprint', onAfterPrint);
      if (md && original) md.getDisplayMedia = original;
      if (timerRef.current) window.clearTimeout(timerRef.current);
    };
  }, [active, triggerBlackout]);

  // Moving watermark
  useEffect(() => {
    if (!active) return;
    const id = window.setInterval(() => {
      setPos({ x: 5 + Math.random() * 60, y: 8 + Math.random() * 75 });
    }, 2600);
    return () => window.clearInterval(id);
  }, [active]);

  if (!active) return <div className={className}>{children}</div>;

  const block = (e: React.SyntheticEvent) => e.preventDefault();

  return (
    <div
      className={`av-protected relative select-none ${className}`}
      style={{ WebkitTouchCallout: 'none', WebkitUserSelect: 'none', userSelect: 'none' }}
      onContextMenu={block}
      onCopy={block}
      onCut={block}
      onDragStart={block}
      onSelectCapture={block}
    >
      <div className={blackout ? 'invisible' : ''} aria-hidden={blackout}>
        {children}
      </div>

      {/* Tiled faint watermark */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 overflow-hidden opacity-[0.10]"
        style={{
          backgroundImage: `url("data:image/svg+xml;utf8,${encodeURIComponent(
            `<svg xmlns='http://www.w3.org/2000/svg' width='260' height='120'><text x='0' y='70' transform='rotate(-18 130 60)' font-family='monospace' font-size='12' fill='%23000'>${watermark
              .replace(/[<>&'"]/g, '')
              .slice(0, 60)}</text></svg>`
          ).replace(/%2523/g, '%23')}")`,
        }}
      />
      {/* Moving watermark */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute z-10 rounded bg-black/45 px-2 py-0.5 font-mono text-[10px] font-semibold text-amber-200 transition-all duration-[2400ms] ease-in-out"
        style={{ left: `${pos.x}%`, top: `${pos.y}%` }}
      >
        {watermark}
      </div>

      {blackout && (
        <div className="absolute inset-0 z-20 flex flex-col items-center justify-center gap-3 bg-black p-6 text-center">
          {lang === 'am' ? <EyeOff className="h-8 w-8 text-amber-400" /> : <ShieldAlert className="h-8 w-8 text-amber-400" />}
          <p className="max-w-xs text-sm font-semibold text-stone-100">
            {lang === 'am'
              ? 'ይዘቱ ተደብቋል — ስክሪን ቀረጻ ወይም የትር መቀየር ተገኝቷል።'
              : 'Content hidden — screen capture or tab switching detected.'}
          </p>
          <button
            type="button"
            onClick={() => setBlackout(false)}
            className="min-h-[40px] rounded-lg bg-amber-500 px-4 text-xs font-bold text-black hover:bg-amber-400"
          >
            {lang === 'am' ? 'ወደ ይዘቱ ተመለስ' : 'Resume viewing'}
          </button>
        </div>
      )}
    </div>
  );
};
