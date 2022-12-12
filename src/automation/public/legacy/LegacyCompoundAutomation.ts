import type { LegacyAutomationConstructorParams } from '../../../types';

import CompoundV2Subscriptions from '../../../abis/CompoundV2Subscriptions.json';
import { PROTOCOLS } from '../../../constants';

import LegacyAutomation from '../../private/LegacyAutomation';

export default class LegacyAaveAutomation extends LegacyAutomation {
  constructor(args: LegacyAutomationConstructorParams) {
    super({
      provider: args.provider,
      subscriptionsJson: CompoundV2Subscriptions,
      monitorAddress: '0xB1cF8DE8e791E4Ed1Bd86c03E2fc1f14389Cb10a',
      protocol: PROTOCOLS.CompoundV2,
    });
  }
}
