import type { LegacyAutomationConstructorParams } from '../../../types';

import MakerSubscriptions from '../../../abis/MakerSubscriptions.json';
import { PROTOCOLS } from '../../../constants';

import LegacyAutomation from '../../private/LegacyAutomation';

export default class LegacyMakerAutomation extends LegacyAutomation {
  constructor(args: LegacyAutomationConstructorParams) {
    super({
      provider: args.provider,
      subscriptionsJson: MakerSubscriptions,
      monitorAddress: '0x1816A86C4DA59395522a42b871bf11A4E96A1C7a',
      protocol: PROTOCOLS.MakerDao,
    });
  }
}
