import { Injectable } from '@nestjs/common';

export type Override = 'GRANTED' | 'DENIED';

export interface EntitlementInput {
  override?: Override;
  planFeatureEnabled?: boolean;
  subscriptionActive?: boolean;
  freeFeatureEnabled?: boolean;
}

@Injectable()
export class EntitlementsService {
  resolve(input: EntitlementInput): boolean {
    if (input.override === 'DENIED') return false;
    if (input.override === 'GRANTED') return true;
    if (input.subscriptionActive && input.planFeatureEnabled) return true;
    return input.freeFeatureEnabled ?? false;
  }
}
