import type Web3 from 'web3';
import type { PastEventOptions, Filter } from 'web3-eth-contract';
import type {
  AutomatedPosition, Interfaces, EthereumAddress,
  SubscriptionOptions, Contract, ParseData, PlaceholderType,
} from '../../types';
import type {
  Subscribe, StrategyModel, SubStorage, UpdateData,
} from '../../types/contracts/generated/SubStorage';

import { addToObjectIf, isDefined } from '../../services/utils';
import { getAbiItem, makeSubStorageContract } from '../../services/contractService';
import { getEventsFromContract, multicall } from '../../services/ethereumService';

import Automation from './Automation';
import { parseStrategiesAutomatedPosition } from '../../services/strategiesService';
import type { ChainId } from '../../types/enums';

interface IStrategiesAutomation extends Interfaces.Automation {
  chainId: ChainId,
}

export default class StrategiesAutomation extends Automation {
  protected chainId: ChainId;

  protected web3: Web3;

  protected subStorageContract: Contract.WithMeta<SubStorage>;

  constructor(args: IStrategiesAutomation) {
    super();

    this.web3 = args.provider;
    this.chainId = args.chainId;
    this.subStorageContract = makeSubStorageContract(this.web3, this.chainId);

    this.assert();
  }

  protected async getEventFromSubStorage(event: string, options?: PastEventOptions) {
    return getEventsFromContract<SubStorage>(this.subStorageContract, event, options);
  }

  protected async getStrategiesSubs(subIds: number[]): Promise<StrategyModel.StoredSubDataStructOutputStruct[]> {
    const subStorageContract = this.subStorageContract;

    const defaultOptions = {
      target: subStorageContract.address,
      abiItem: getAbiItem(subStorageContract.abi, 'strategiesSubs'),
    };

    const multicallCalls = subIds.map((subId) => ({ ...defaultOptions, params: [subId] }));

    return multicall(this.web3, this.chainId, multicallCalls);
  }

  protected async getSubscriptionEventsFromSubStorage(options?: PastEventOptions) {
    return this.getEventFromSubStorage('Subscribe', options);
  }

  protected async getUpdateDataEventsFromSubStorage(options?: PastEventOptions) {
    return this.getEventFromSubStorage('UpdateData', options);
  }

  protected getParsedSubscriptions(parseData: ParseData) {
    return parseStrategiesAutomatedPosition(parseData);
  }

  protected async _getSubscriptions(addresses?: EthereumAddress[], options?: PastEventOptions): Promise<(AutomatedPosition | null)[]> {
    const _options = {
      ...addToObjectIf(isDefined(options), options),
      ...addToObjectIf(isDefined(addresses), { filter: { proxy: addresses } }),
    };

    const subscriptionEvents = (await this.getSubscriptionEventsFromSubStorage(_options)).map(e => e.returnValues) as PlaceholderType; // TODO PlaceholderType

    let subscriptions: (AutomatedPosition | null)[] = [];

    if (subscriptionEvents) {
      // @ts-ignore
      const strategiesSubs = await this.getStrategiesSubs(subscriptionEvents.map((e) => e.subId));

      subscriptions = await Promise.all(strategiesSubs.map(async (sub, index: number) => {
        let latestUpdate = subscriptionEvents[index];

        if (latestUpdate.subHash !== sub?.strategySubHash) {
          const updates = await this.getUpdateDataEventsFromSubStorage({ filter: latestUpdate.subId as any as Filter });
          latestUpdate = {
            ...latestUpdate, // Update is missing proxy, hence this
            ...updates?.[updates.length - 1]?.returnValues,
          };
        }
        return this.getParsedSubscriptions({
          chainId: this.chainId,
          subscriptionEventData: latestUpdate,
          strategiesSubsData: sub,
        });
      }));
    }

    return subscriptions;
  }

  public async getSubscriptions(options?: SubscriptionOptions): Promise<(AutomatedPosition | null)[]> {
    return this._getSubscriptions(undefined, options);
  }

  public async getSubscriptionsFor(addresses: EthereumAddress[], options?: SubscriptionOptions): Promise<(AutomatedPosition | null)[]> {
    return this._getSubscriptions(addresses, options);
  }
}