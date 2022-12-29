import type { Interfaces } from '../../types';

import StrategiesAutomation from '../private/StrategiesAutomation';
import { ChainId } from '../../types/enums';

export default class EthereumStrategies extends StrategiesAutomation {
  constructor(args: Interfaces.Automation) {
    super({ ...args, chainId: ChainId.Ethereum });
  }
}
