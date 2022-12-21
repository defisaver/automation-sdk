import type { Interfaces } from '../../../types';
import type { Legacy_CompoundV2Subscriptions } from '../../../types/contracts/generated';

import { LEGACY_PROTOCOLS } from '../../../constants';
import { CompoundV2SubscriptionsJson } from '../../../abis';

import { makeLegacySubscriptionContract } from '../../../services/contractService';

import LegacyAutomation from '../../private/LegacyAutomation';

export default class LegacyAaveAutomation extends LegacyAutomation {
  constructor(args: Interfaces.LegacyAutomation<Legacy_CompoundV2Subscriptions>) {
    super({
      provider: args.provider,
      subscriptionsJson: makeLegacySubscriptionContract(args.provider, CompoundV2SubscriptionsJson),
      monitorAddress: '0xB1cF8DE8e791E4Ed1Bd86c03E2fc1f14389Cb10a',
      protocol: LEGACY_PROTOCOLS.CompoundV2,
    });
  }
}
