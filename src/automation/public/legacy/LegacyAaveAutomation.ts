import type { LegacyAutomationConstructorParams } from '../../../types';

import AaveV2Subscriptions from '../../../abis/AaveV2Subscriptions.json';
import { PROTOCOLS } from '../../../constants';

import LegacyAutomation from '../../private/LegacyAutomation';

export default class LegacyAaveAutomation extends LegacyAutomation {
  constructor(args: LegacyAutomationConstructorParams) {
    super({
      provider: args.provider,
      subscriptionsJson: AaveV2Subscriptions,
      monitorAddress: '0x380982902872836ceC629171DaeAF42EcC02226e',
      protocol: PROTOCOLS.AaveV2,
    });
  }
}
