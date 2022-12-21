import type Web3 from 'web3';
import type {
  EthereumAddress, AutomatedPosition, LegacyAutomatedPosition, SubscriptionOptions,
} from '../../types';

import { isUndefined } from '../../services/utils';
import { ChainId } from '../../types/enums';

// TODO - Improve provider assertion
export default class Automation {
  protected chainId?: ChainId;

  protected web3?: Web3;

  protected assertProvider() {
    if (isUndefined(this.web3)) {
      throw new Error(`Assertion for property 'web3' failed. \nExpected web3.js instance. Got: '${this.web3}.`);
    }
  }

  protected assertChainId() {
    const allowedChainIds = Object.values(ChainId);

    if (isUndefined(this.chainId) || !allowedChainIds.includes(this.chainId || '')) {
      throw new Error(`Assertion for property 'chainId' failed. \nExpected one of: '${allowedChainIds.join(', ')}. Got: '${this.chainId}.`);
    }
  }

  protected assert() {
    this.assertProvider();
    this.assertChainId();
  }

  public async getSubscriptions(options?: SubscriptionOptions): Promise<(AutomatedPosition | null)[] | LegacyAutomatedPosition[]> {
    throw new Error('Method \'getSubscriptions\' must be implemented.');
  }

  public async getSubscriptionsFor(
    addresses: EthereumAddress[],
    options?: SubscriptionOptions,
  ): Promise<(AutomatedPosition | null)[] | LegacyAutomatedPosition[]> {
    throw new Error('Method \'getSubscriptionsFor\' must be implemented.');
  }
}
