import type { Interfaces } from '../../types';

import StrategiesAutomation from '../private/StrategiesAutomation';
import { ChainId } from '../../types/enums';

export default class BaseStrategies extends StrategiesAutomation {
  constructor(args: Interfaces.Automation) {
    super({ ...args, chainId: ChainId.Base });
  }
}
