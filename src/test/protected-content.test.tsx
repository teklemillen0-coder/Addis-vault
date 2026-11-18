import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { ProtectedContent } from '@/components/ProtectedContent';

describe('ProtectedContent', () => {
  it('covers protected content after a screenshot shortcut and can be dismissed', () => {
    render(
      <ProtectedContent watermark="Device TEST">
        <p>Paid document</p>
      </ProtectedContent>,
    );

    fireEvent.keyDown(document, { key: 'S', code: 'KeyS', ctrlKey: true, shiftKey: true });

    expect(screen.getByRole('alert')).toHaveTextContent('Security Alert');
    expect(screen.getByRole('alert')).toHaveTextContent('Browsers cannot reliably block screenshots');

    fireEvent.click(screen.getByRole('button', { name: 'Return to protected content' }));
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  it('blocks copy and context-menu events within protected material', () => {
    const { container } = render(
      <ProtectedContent watermark="Device TEST">
        <p>Paid document</p>
      </ProtectedContent>,
    );
    const protectedView = container.querySelector('.av-protected');

    expect(protectedView).not.toBeNull();
    expect(fireEvent.copy(protectedView!)).toBe(false);
    expect(fireEvent.contextMenu(protectedView!)).toBe(false);
  });
});
