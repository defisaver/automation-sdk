import type Web3 from 'web3';
import type {
  EthereumAddress, LegacyAutomatedPosition, LegacyAutomationConstructorParams, Protocol,
  WrappedContract, PlaceholderType,
} from '../../types';

import { ChainId, ProtocolIds } from '../../constants';

import { getAbiItem, makeAuthCheckerContract } from '../../services/contractService';
import { multicall } from '../../services/ethereumService';
import { isAddress, isUndefined } from '../../services/utils';

import Automation from './Automation';

export default class LegacyAutomation extends Automation {
  protected chainId: ChainId = ChainId.Ethereum;

  protected web3: Web3;

  protected monitorAddress: EthereumAddress;

  protected subscriptionsContract: WrappedContract<PlaceholderType>;

  protected authCheckerContract: WrappedContract<PlaceholderType>;

  protected protocol: Protocol;

  constructor(args: LegacyAutomationConstructorParams) {
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
    return this.protocol.id === ProtocolIds.MakerDAO ? 'owner' : 'user';
  }

  protected async _getSubscriptions(addresses?: EthereumAddress[]): Promise<PlaceholderType> {
    let subscriptions = await this.subscriptionsContract.contract.methods.getSubscribers().call();

    if (addresses) {
      const _addresses = addresses.map(a => a.toLowerCase());

      // @ts-ignore
      subscriptions = subscriptions.filter(s => _addresses.includes(s[this.getOwnerPropName()]));
    }

    return subscriptions;
  }

  protected async getParsedSubscriptions(addresses?: EthereumAddress[]): Promise<LegacyAutomatedPosition[]> {
    let subscriptions = await this._getSubscriptions(addresses);

    // @ts-ignore
    subscriptions = subscriptions.map(sub => ({
      chainId: this.chainId,
      owner: sub[this.getOwnerPropName()],
      isEnabled: true,
      protocol: this.protocol,
      specific: { ...sub },
    }));

    return subscriptions;
  }

  public async getSubscriptions(): Promise<LegacyAutomatedPosition[]> {
    return this.getParsedSubscriptions();
  }

  public async getSubscriptionsFor(addresses: EthereumAddress[]): Promise<LegacyAutomatedPosition[]> {
    return this.getParsedSubscriptions(addresses);
  }
}