import type { Interfaces } from '../../../types';
import type { Legacy_MakerSubscriptions } from '../../../types/contracts/generated';

import { LEGACY_PROTOCOLS } from '../../../constants';
import { MakerSubscriptionsJson } from '../../../abis';

import { makeLegacySubscriptionContract } from '../../../services/contractService';

import LegacyAutomation from '../../private/LegacyAutomation';

export default class LegacyMakerAutomation extends LegacyAutomation {
  constructor(args: Interfaces.LegacyAutomation<Legacy_MakerSubscriptions>) {
    super({
      provider: args.provider,
      subscriptionsJson: makeLegacySubscriptionContract(args.provider, MakerSubscriptionsJson),
      monitorAddress: '0x1816A86C4DA59395522a42b871bf11A4E96A1C7a',
      protocol: LEGACY_PROTOCOLS.MakerDAO,
    });
  }
}
