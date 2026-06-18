import { InvalidOrderStatusException } from '../exceptions/invalid-order-status.exception';
import {
  assertValidOrderStatusTransition,
  shouldRestoreStockOnCancel,
} from './order-status.policy';

describe('OrderStatusPolicy', () => {
  it('allows PENDING → PAID', () => {
    expect(() =>
      assertValidOrderStatusTransition('PENDING', 'PAID'),
    ).not.toThrow();
  });

  it('allows PENDING → CANCELLED', () => {
    expect(() =>
      assertValidOrderStatusTransition('PENDING', 'CANCELLED'),
    ).not.toThrow();
  });

  it('rejects PENDING → DELIVERED', () => {
    expect(() =>
      assertValidOrderStatusTransition('PENDING', 'DELIVERED'),
    ).toThrow(InvalidOrderStatusException);
  });

  it('rejects DELIVERED → any status', () => {
    expect(() =>
      assertValidOrderStatusTransition('DELIVERED', 'CANCELLED'),
    ).toThrow(InvalidOrderStatusException);
  });

  it('detects stock restore on cancel', () => {
    expect(shouldRestoreStockOnCancel('PENDING', 'CANCELLED')).toBe(true);
    expect(shouldRestoreStockOnCancel('PAID', 'CANCELLED')).toBe(true);
    expect(shouldRestoreStockOnCancel('CANCELLED', 'CANCELLED')).toBe(false);
    expect(shouldRestoreStockOnCancel('PENDING', 'PAID')).toBe(false);
  });
});
