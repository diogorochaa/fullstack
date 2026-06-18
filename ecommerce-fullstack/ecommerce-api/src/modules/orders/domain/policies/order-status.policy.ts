import { InvalidOrderStatusException } from '../exceptions/invalid-order-status.exception';

const ALLOWED_TRANSITIONS: Record<string, readonly string[]> = {
  PENDING: ['PAID', 'CANCELLED'],
  PAID: ['SHIPPED', 'CANCELLED'],
  SHIPPED: ['DELIVERED'],
  DELIVERED: [],
  CANCELLED: [],
};

export function assertValidOrderStatusTransition(
  fromStatus: string,
  toStatus: string,
): void {
  if (fromStatus === toStatus) {
    throw new InvalidOrderStatusException(fromStatus, toStatus);
  }

  const allowed = ALLOWED_TRANSITIONS[fromStatus] ?? [];

  if (!allowed.includes(toStatus)) {
    throw new InvalidOrderStatusException(fromStatus, toStatus);
  }
}

export function shouldRestoreStockOnCancel(
  fromStatus: string,
  toStatus: string,
): boolean {
  return toStatus === 'CANCELLED' && fromStatus !== 'CANCELLED';
}
