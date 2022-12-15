import type { AutomationConstructorParams } from '../../types';

import { ChainId } from '../../constants';

import StrategiesAutomation from '../private/StrategiesAutomation';

export default class ArbitrumStrategies extends StrategiesAutomation {
  constructor(args: AutomationConstructorParams) {
    super({ provider: args.provider, chainId: ChainId.Arbitrum });
  }
}