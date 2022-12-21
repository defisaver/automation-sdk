import type { Interfaces } from '../../types';

import StrategiesAutomation from '../private/StrategiesAutomation';
import { ChainId } from '../../types/enums';

export default class OptimismStrategies extends StrategiesAutomation {
  constructor(args: Interfaces.Automation) {
    super({ provider: args.provider, chainId: ChainId.Optimism });
  }
}
