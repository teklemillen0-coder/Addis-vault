import React, { useEffect, useState } from 'react';

interface ProtectedContentProps {
  /** When false, children render normally (e.g. paid & unlocked exports). */
  active?: boolean;
  /** Buyer / preview label shown in the watermark. */
  watermark: string;
  children: React.ReactNode;
  className?: string;
}

export const ProtectedContent: React.FC<ProtectedContentProps> = ({
  active = true,
  watermark,
  children,
  className = '',
}) => {
  const [curtainVisible, setCurtainVisible] = useState(false);

  useEffect(() => {
    if (!active) {
      setCurtainVisible(false);
      return;
    }

    const showCurtain = () => setCurtainVisible(true);
    const onVisibilityChange = () => {
      if (document.visibilityState === 'hidden') showCurtain();
    };
    const onKeyDown = (event: KeyboardEvent) => {
      const key = event.key.toLowerCase();
      const screenshotShortcut =
        event.key === 'PrintScreen' ||
        (event.ctrlKey && event.shiftKey && key === 's') ||
        (event.metaKey && event.shiftKey && ['Digit3', 'Digit4', 'Digit5'].includes(event.code));

      if (screenshotShortcut) {
        event.preventDefault();
        showCurtain();
      }
    };

    document.addEventListener('visibilitychange', onVisibilityChange);
    document.addEventListener('keydown', onKeyDown);
    window.addEventListener('blur', showCurtain);
    return () => {
      document.removeEventListener('visibilitychange', onVisibilityChange);
      document.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('blur', showCurtain);
    };
  }, [active]);

  if (!active) return <div className={className}>{children}</div>;

  return (
    <div
      className={`av-protected relative select-none ${className}`}
      onContextMenu={(event) => event.preventDefault()}
      onCopy={(event) => event.preventDefault()}
      onCut={(event) => event.preventDefault()}
    >
      {children}

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

      {curtainVisible && (
        <div
          className="absolute inset-0 z-30 flex items-center justify-center bg-zinc-950 p-6 text-center text-white"
          role="alert"
          aria-live="assertive"
        >
          <div className="max-w-sm">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-amber-300">Security Alert</p>
            <h2 className="mt-3 text-lg font-bold">Protected Content — Addis-Vault</h2>
            <p className="mt-2 text-sm leading-relaxed text-zinc-300">
              This view was covered after focus changed or a screenshot shortcut was detected. Browsers cannot reliably
              block screenshots or screen recording.
            </p>
            <button
              type="button"
              onClick={() => setCurtainVisible(false)}
              className="mt-5 min-h-11 rounded-xl bg-emerald-600 px-5 py-2 text-sm font-semibold text-white hover:bg-emerald-500"
            >
              Return to protected content
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
