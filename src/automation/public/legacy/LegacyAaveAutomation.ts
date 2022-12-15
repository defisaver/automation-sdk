import type { LegacyAutomationConstructorParams } from '../../../types';

import { PROTOCOLS } from '../../../constants';
import { AaveV2SubscriptionsJson } from '../../../abis';

import { makeLegacySubscriptionContract } from '../../../services/contractService';

import LegacyAutomation from '../../private/LegacyAutomation';

export default class LegacyAaveAutomation extends LegacyAutomation {
  constructor(args: LegacyAutomationConstructorParams) {
    super({
      provider: args.provider,
      subscriptionsJson: makeLegacySubscriptionContract(args.provider, AaveV2SubscriptionsJson),
      monitorAddress: '0x380982902872836ceC629171DaeAF42EcC02226e',
      protocol: PROTOCOLS.AaveV2,
    });
  }
}
