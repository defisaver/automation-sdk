import type { ContractJson, LegacyAutomationConstructorParams } from '../../../types';

import AaveV2Subscriptions from '../../../abis/legacy_AaveV2Subscriptions.json';
import { PROTOCOLS } from '../../../constants';

import LegacyAutomation from '../../private/LegacyAutomation';

export default class LegacyAaveAutomation extends LegacyAutomation {
  constructor(args: LegacyAutomationConstructorParams) {
    super({
      provider: args.provider,
      subscriptionsJson: AaveV2Subscriptions as ContractJson,
      monitorAddress: '0x380982902872836ceC629171DaeAF42EcC02226e',
      protocol: PROTOCOLS.AaveV2,
    });
  }
}
