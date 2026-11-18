import React from 'react';

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
  if (!active) return <div className={className}>{children}</div>;

  return (
    <div
      className={`av-protected relative ${className}`}
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
    </div>
  );
};
