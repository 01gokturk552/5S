import { EntitlementsService } from './entitlements.service';

describe('EntitlementsService', () => {
  const service = new EntitlementsService();

  it('uses an explicit deny override before every plan entitlement', () => {
    expect(
      service.resolve({
        override: 'DENIED',
        subscriptionActive: true,
        planFeatureEnabled: true,
        freeFeatureEnabled: true,
      }),
    ).toBe(false);
  });

  it('uses an explicit grant override', () => {
    expect(service.resolve({ override: 'GRANTED' })).toBe(true);
  });

  it('does not grant a plan feature for an inactive subscription', () => {
    expect(
      service.resolve({
        subscriptionActive: false,
        planFeatureEnabled: true,
      }),
    ).toBe(false);
  });

  it('falls back to free entitlement', () => {
    expect(service.resolve({ freeFeatureEnabled: true })).toBe(true);
  });
});
