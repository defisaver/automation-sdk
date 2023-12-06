import Dec from 'decimal.js';
import type Web3 from 'web3';
import type { PastEventOptions } from 'web3-eth-contract';
import type {
  Position, Interfaces, EthereumAddress, SubscriptionOptions, Contract, ParseData, PlaceholderType, BlockNumber,
} from '../../types';
import type {
  StrategyModel, SubStorage,
} from '../../types/contracts/generated/SubStorage';
import type { ChainId } from '../../types/enums';
import { Strategies, ProtocolIdentifiers } from '../../types/enums';

import { addToObjectIf, isDefined } from '../../services/utils';
import { getAbiItem, makeSubStorageContract } from '../../services/contractService';
import { getEventsFromContract, multicall } from '../../services/ethereumService';
import { parseStrategiesAutomatedPosition } from '../../services/strategiesService';

import Automation from './Automation';

interface IStrategiesAutomation extends Interfaces.Automation {
  chainId: ChainId,
  providerFork: Web3,
}

export default class StrategiesAutomation extends Automation {
  protected chainId: ChainId;

  protected web3: Web3;

  protected web3Fork: Web3;

  protected subStorageContract: Contract.WithMeta<SubStorage>;

  protected subStorageContractFork: Contract.WithMeta<SubStorage> | null;

  constructor(args: IStrategiesAutomation) {
    super();

    this.web3 = args.provider;
    this.web3Fork = args.providerFork;
    this.chainId = args.chainId;
    this.subStorageContract = makeSubStorageContract(this.web3, this.chainId);
    this.subStorageContractFork = this.web3Fork ? makeSubStorageContract(this.web3Fork, this.chainId) : null;

    this.assert();
  }

  protected async getEventFromSubStorage(event: string, options?: PastEventOptions) {
    return getEventsFromContract<SubStorage>(this.subStorageContract, this.subStorageContractFork, event, options);
  }

  protected async getStrategiesSubs(subIds: number[], fromBlock: BlockNumber = 'latest'): Promise<StrategyModel.StoredSubDataStructOutputStruct[]> {
    let options : any;
    let web3: Web3;

    if (this.web3Fork && this.subStorageContractFork) {
      options = {
        target: this.subStorageContractFork.address,
        abiItem: getAbiItem(this.subStorageContractFork.abi, 'strategiesSubs'),
      };
      web3 = this.web3Fork;
    } else {
      options = {
        target: this.subStorageContract.address,
        abiItem: getAbiItem(this.subStorageContract.abi, 'strategiesSubs'),
      };
      web3 = this.web3;
    }

    const multicallCalls = subIds.map((subId) => ({ ...options, params: [subId] }));
    return multicall(web3, this.chainId, multicallCalls, fromBlock);
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

  /**
   * @description Removes expired Limit Order subscriptions
   */
  protected removeExpiredSubscriptions(subscriptions: (Position.Automated | null)[]) {
    return subscriptions.filter((subscription: Position.Automated | null) => {
      if (!subscription) {
        return true;
      }

      const { protocol, strategy, strategyData } = subscription;

      if (
        protocol.id === ProtocolIdentifiers.StrategiesAutomation.Exchange
        && strategy.strategyId === Strategies.Identifiers.LimitOrder
      ) {
        return new Dec(strategyData.decoded.triggerData.goodUntil).gt(new Dec(Date.now()).div(1000));
      }

      return true;
    });
  }

  protected async _getSubscriptions(addresses?: EthereumAddress[], options?: SubscriptionOptions): Promise<(Position.Automated | null)[]> {
    const _options = {
      ...addToObjectIf(isDefined(options), options),
      ...addToObjectIf(isDefined(addresses), { filter: { proxy: addresses } }),
    } as SubscriptionOptions & PastEventOptions;

    let subscriptionEvents = (await this.getSubscriptionEventsFromSubStorage(_options)) as PlaceholderType; // TODO PlaceholderType

    let subscriptions: (Position.Automated | null)[] = [];

    if (subscriptionEvents) {
      let strategiesSubs = await this.getStrategiesSubs(
        subscriptionEvents.map((e: { returnValues: { subId: number } }) => e.returnValues.subId), _options.toBlock,
      );

      if (_options.enabledOnly) {
        const filteredSubscriptionEvents = [] as PlaceholderType;

        strategiesSubs = strategiesSubs.filter((sub, index) => {
          if (sub?.isEnabled) filteredSubscriptionEvents.push(subscriptionEvents[index]);
          return sub?.isEnabled;
        });

        subscriptionEvents = filteredSubscriptionEvents;
      }

      subscriptions = await Promise.all(strategiesSubs.map(async (sub, index: number) => {
        let latestUpdate = subscriptionEvents[index].returnValues;

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
          blockNumber: subscriptionEvents[index].blockNumber,
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
                && s.owner === current.owner
                && s.strategy.strategyId === current.strategy.strategyId
                && s.protocol.id === current.protocol.id
                && (
                  s.protocol.id !== ProtocolIdentifiers.StrategiesAutomation.MakerDAO // reflexer needs to get added if we have it
                  || s.strategyData.decoded.subData.vaultId === current.strategyData.decoded.triggerData.vaultId
                )
              ));

              if (mergePairIndex !== -1) {
                const mergePair = copyList[mergePairIndex];
                if (isDefined(mergePair)) {
                  copyList[mergePairIndex] = {
                    ...mergePair,
                    ...current,
                    // @ts-ignore
                    blockNumber: Dec.max(mergePair.blockNumber, current.blockNumber).toNumber(),
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

    return _options.unexpiredOnly ? this.removeExpiredSubscriptions(subscriptions) : subscriptions;
  }

  public async getSubscriptions(options?: SubscriptionOptions): Promise<(Position.Automated | null)[]> {
    return this._getSubscriptions(undefined, options);
  }

  public async getSubscriptionsFor(addresses: EthereumAddress[], options?: SubscriptionOptions): Promise<(Position.Automated | null)[]> {
    return this._getSubscriptions(addresses, options);
  }
}
