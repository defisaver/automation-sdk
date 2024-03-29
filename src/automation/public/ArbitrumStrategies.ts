import type { Interfaces } from '../../types';

import StrategiesAutomation from '../private/StrategiesAutomation';
import { ChainId } from '../../types/enums';

export default class ArbitrumStrategies extends StrategiesAutomation {
  constructor(args: Interfaces.Automation) {
    super({ ...args, chainId: ChainId.Arbitrum });
  }
}
