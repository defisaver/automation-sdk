import type { Interfaces } from '../../../types';
import type { Legacy_AaveV2Subscriptions } from '../../../types/contracts/generated';

import { LEGACY_PROTOCOLS } from '../../../constants';
import { AaveV2SubscriptionsJson } from '../../../abis';

import { makeLegacySubscriptionContract } from '../../../services/contractService';

import LegacyAutomation from '../../private/LegacyAutomation';

export default class LegacyAaveAutomation extends LegacyAutomation {
  constructor(args: Interfaces.LegacyAutomation<Legacy_AaveV2Subscriptions>) {
    super({
      provider: args.provider,
      subscriptionsJson: makeLegacySubscriptionContract(args.provider, AaveV2SubscriptionsJson),
      monitorAddress: '0x380982902872836ceC629171DaeAF42EcC02226e',
      protocol: LEGACY_PROTOCOLS.AaveV2,
    });
  }
}
