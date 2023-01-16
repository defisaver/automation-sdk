import type Web3 from 'web3';
import type { PastEventOptions } from 'web3-eth-contract';
import type {
  Position, Interfaces, EthereumAddress,
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
    const events = await this.getEventFromSubStorage('UpdateData', options);
    /** @dev - Some RPCs sort events differently */
    return events.sort((a, b) => a.blockNumber - b.blockNumber);
  }

  protected getParsedSubscriptions(parseData: ParseData) {
    return parseStrategiesAutomatedPosition(parseData);
  }

  protected async _getSubscriptions(addresses?: EthereumAddress[], options?: SubscriptionOptions): Promise<(Position.Automated | null)[]> {
    const _options = {
      ...addToObjectIf(isDefined(options), options),
      ...addToObjectIf(isDefined(addresses), { filter: { proxy: addresses } }),
    };

    const subscriptionEvents = (await this.getSubscriptionEventsFromSubStorage(_options)).map(e => e.returnValues) as PlaceholderType; // TODO PlaceholderType

    let subscriptions: (Position.Automated | null)[] = [];

    if (subscriptionEvents) {
      // @ts-ignore
      const strategiesSubs = await this.getStrategiesSubs(subscriptionEvents.map((e) => e.subId));

      subscriptions = await Promise.all(strategiesSubs.map(async (sub, index: number) => {
        let latestUpdate = subscriptionEvents[index];

        if (latestUpdate.subHash !== sub?.strategySubHash) {
          const updates = await this.getUpdateDataEventsFromSubStorage({
            ...addToObjectIf(!!_options, _options),
            filter: { subId: latestUpdate.subId },
          });
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

      if (options?.mergeWithSameId) {
        subscriptions = subscriptions.reduce((list: (Position.Automated | null)[], current) => {
          const copyList = [...list] as (Position.Automated | null)[];

          if (isDefined(current)) {
            if (current.specific.mergeWithSameId) {
              const mergePairIndex = copyList.findIndex(s => (
                s && s.specific.mergeWithSameId
                && s.strategy.strategyId === current.strategy.strategyId
                && s.protocol.id === current.protocol.id
              ));

              if (mergePairIndex !== -1) {
                const mergePair = copyList[mergePairIndex];
                if (isDefined(mergePair)) {
                  copyList[mergePairIndex] = {
                    ...mergePair,
                    ...current,
                    subIds: isDefined(mergePair.subIds) ? [...mergePair.subIds, current.subId] : undefined,
                    isEnabled: mergePair.isEnabled || current.isEnabled,
                    subId: mergePair.subId,
                    specific: {
                      ...mergePair.specific,
                      ...current.specific,
                      mergeWithSameId: false,
                    },
                  };
                  return copyList;
                }
              }
            }
          } else {
            return copyList;
          }

          copyList.push({
            ...current,
            subIds: [current.subId],
          });

          return copyList;
        }, []);
      }
    }

    return subscriptions;
  }

  public async getSubscriptions(options?: SubscriptionOptions): Promise<(Position.Automated | null)[]> {
    return this._getSubscriptions(undefined, options);
  }

  public async getSubscriptionsFor(addresses: EthereumAddress[], options?: SubscriptionOptions): Promise<(Position.Automated | null)[]> {
    return this._getSubscriptions(addresses, options);
  }
}