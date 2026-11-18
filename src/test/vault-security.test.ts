import { describe, expect, it } from 'vitest';
import { PurchaseOrder } from '@/types';
import { isOrderBoundToCurrentDevice } from '@/utils/vaultSecurity';

const makeOrder = (deviceId?: string): PurchaseOrder => ({
  id: 'order-1',
  refNumber: 'REF-1234',
  paymentMethod: 'telebirr',
  items: [],
  subtotalEtb: 100,
  discountEtb: 0,
  totalEtb: 100,
  deviceId,
  createdAt: '2026-01-01T00:00:00.000Z',
});

describe('device-bound purchases', () => {
  it('only unlocks an order on the matching device and rejects legacy unbound orders', () => {
    expect(isOrderBoundToCurrentDevice(makeOrder('device-a'), 'device-a')).toBe(true);
    expect(isOrderBoundToCurrentDevice(makeOrder('device-a'), 'device-b')).toBe(false);
    expect(isOrderBoundToCurrentDevice(makeOrder(), 'device-a')).toBe(false);
  });
});
