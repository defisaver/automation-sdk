import type { LegacyAutomationConstructorParams } from '../../../types';

import { PROTOCOLS } from '../../../constants';
import { CompoundV2SubscriptionsJson } from '../../../abis';

import { makeLegacySubscriptionContract } from '../../../services/contractService';

import LegacyAutomation from '../../private/LegacyAutomation';

export default class LegacyAaveAutomation extends LegacyAutomation {
  constructor(args: LegacyAutomationConstructorParams) {
    super({
      provider: args.provider,
      subscriptionsJson: makeLegacySubscriptionContract(args.provider, CompoundV2SubscriptionsJson),
      monitorAddress: '0xB1cF8DE8e791E4Ed1Bd86c03E2fc1f14389Cb10a',
      protocol: PROTOCOLS.CompoundV2,
    });
  }
}
