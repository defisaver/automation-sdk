import Dec from 'decimal.js';

import type Web3 from 'web3';
import type {
  EthereumAddress, Position, Interfaces, Contract, PlaceholderType, SubscriptionOptions,
} from '../../types';
import type {
  Legacy_AaveV2Subscriptions, Legacy_CompoundV2Subscriptions, Legacy_MakerSubscriptions, Legacy_AuthCheck,
} from '../../types/contracts/generated';

import { getAbiItem, makeAuthCheckerContract } from '../../services/contractService';
import { multicall } from '../../services/ethereumService';
import { isAddress, isUndefined } from '../../services/utils';

import Automation from './Automation';
import { ChainId, ProtocolIdentifiers } from '../../types/enums';

export default class LegacyAutomation extends Automation {
  protected chainId: ChainId = ChainId.Ethereum;

  protected web3: Web3;

  protected monitorAddress: EthereumAddress;

  protected subscriptionsContract: Contract.WithMeta<Legacy_MakerSubscriptions | Legacy_AaveV2Subscriptions | Legacy_CompoundV2Subscriptions>;

  protected authCheckerContract: Contract.WithMeta<Legacy_AuthCheck>;

  protected protocol: Interfaces.LegacyProtocol;

  constructor(args: Interfaces.LegacyAutomation<Legacy_MakerSubscriptions | Legacy_AaveV2Subscriptions | Legacy_CompoundV2Subscriptions>) {
    super();

    this.web3 = args.provider;
    this.subscriptionsContract = args.subscriptionsJson;
    this.monitorAddress = args.monitorAddress;
    this.protocol = args.protocol;
    this.authCheckerContract = makeAuthCheckerContract(this.web3, this.chainId);

    this.assertLegacy();
  }

  protected assertSubscriptionContract() {
    if (isUndefined(this.subscriptionsContract)) {
      throw new Error(`Assertion for property 'subscriptionsContract' failed. \nGot: '${this.subscriptionsContract}.`);
    }
  }

  protected assertProtocol() {
    if (isUndefined(this.protocol)) {
      throw new Error(`Assertion for property 'protocol' failed. \nGot: '${this.protocol}.`);
    }
  }

  protected assertMonitorAddress() {
    if (!isAddress(this.monitorAddress)) {
      throw new Error(`Assertion for property 'monitorAddress' failed. \nGot: '${this.monitorAddress}.`);
    }
  }

  protected assertLegacy() {
    this.assertProtocol();
    this.assertMonitorAddress();
    this.assertSubscriptionContract();
    this.assert();
  }

  protected async isMonitorAuthorized(address: EthereumAddress, caller: EthereumAddress): Promise<boolean> {
    return this.authCheckerContract.contract.methods.canCall(caller, address, '0x1cff79cd').call();
  }

  protected async isMonitorAuthorizedMulticall(addresses: EthereumAddress[], caller: EthereumAddress): Promise<boolean[]> {
    const authCheckerContract = this.authCheckerContract;

    const defaultOptions = {
      target: authCheckerContract.address,
      abiItem: getAbiItem(authCheckerContract.abi, 'canCall'),
    };

    const multicallCalls = addresses.map((addr) => ({ ...defaultOptions, params: [caller, addr, '0x1cff79cd'] }));

    return (await multicall(this.web3, this.chainId, multicallCalls)).map(res => res[0]);
  }

  // Aave and Compound use 'user' for property name
  private getOwnerPropName() {
    return this.protocol.id === ProtocolIdentifiers.LegacyAutomation.MakerDAO ? 'owner' : 'user';
  }

  protected async _getSubscriptions(addresses?: EthereumAddress[], options?: SubscriptionOptions): Promise<PlaceholderType> { // TODO PlaceholderType
    let subscriptions = await this.subscriptionsContract.contract.methods.getSubscribers().call({}, options?.fromBlock || 'latest');

    if (addresses) {
      const _addresses = addresses.map(a => a.toLowerCase());

      // @ts-ignore
      subscriptions = subscriptions.filter(s => _addresses.includes(s[this.getOwnerPropName()]));
    }

    return subscriptions;
  }

  protected async getParsedSubscriptions(addresses?: EthereumAddress[], options?: SubscriptionOptions): Promise<Position.LegacyAutomated[]> {
    const legacyAutomationSunset = 18213086;
    if (
      !options?.fromBlock
      || options?.fromBlock === 'latest'
      || options?.fromBlock === 'pending'
      || (options?.fromBlock && new Dec(options?.fromBlock.toString()).gte(legacyAutomationSunset))
    ) {
      return [];
    }

    const subscriptions = await this._getSubscriptions(addresses, options);

    return subscriptions.map((sub: any) => ({
      chainId: this.chainId,
      owner: sub[this.getOwnerPropName()],
      isEnabled: true,
      protocol: this.protocol,
      specific: { ...sub },
      strategy: {
        strategyId: 'legacy',
        protocol: this.protocol,
      },
    }));
  }

  public async getSubscriptions(options?: SubscriptionOptions): Promise<Position.LegacyAutomated[]> {
    return this.getParsedSubscriptions(undefined, options);
  }

  public async getSubscriptionsFor(addresses: EthereumAddress[], options?: SubscriptionOptions): Promise<Position.LegacyAutomated[]> {
    return this.getParsedSubscriptions(addresses, options);
  }
}