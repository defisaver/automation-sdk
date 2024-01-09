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

  private _mergeCheck(s:Position.Automated, current:Position.Automated) {
    return s.owner === current.owner
      && s.strategy.strategyId === current.strategy.strategyId
      && s.protocol.id === current.protocol.id
      && s.specific.mergeId === current.specific.mergeWithId
      && (
        s.protocol.id !== ProtocolIdentifiers.StrategiesAutomation.MakerDAO // reflexer needs to get added if we have it
        || s.strategyData.decoded.subData.vaultId === current.strategyData.decoded.triggerData.vaultId
      )
      && (
        s.protocol.id !== ProtocolIdentifiers.StrategiesAutomation.CrvUSD // merge only crvUSD leverage management for the same market
        || s.strategyData.decoded.subData.controller.toLowerCase() === current.strategyData.decoded.triggerData.controller.toLowerCase()
      );
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
        const mergeBase = subscriptions.filter(s => isDefined(s) && s.specific.mergeWithId) as Position.Automated[];
        const mergeExtension = subscriptions.filter(s => isDefined(s) && s.specific.mergeId) as Position.Automated[];

        subscriptions = (subscriptions.filter(s => isDefined(s) && !s?.specific.mergeWithId && !s?.specific.mergeId) as Position.Automated[]).map((s) => ({
          ...s,
          subIds: [s.subId],
        }));
        mergeBase.forEach((current) => {
          const mergePairIndexWithEnabledCheck = mergeExtension.findIndex(s => this._mergeCheck(s, current) && s.isEnabled === current.isEnabled);
          const mergePairIndexWithoutEnabledCheck = mergeExtension.findIndex(s => this._mergeCheck(s, current));

          const mergePairIndex = mergePairIndexWithEnabledCheck !== -1 ? mergePairIndexWithEnabledCheck : mergePairIndexWithoutEnabledCheck;

          if (mergePairIndex !== -1) {
            const mergePair = mergeExtension[mergePairIndex];
            mergeExtension.splice(mergePairIndex, 1);
            subscriptions.push({
              ...mergePair,
              ...current,
              // @ts-ignore
              blockNumber: Dec.max(mergePair.blockNumber, current.blockNumber).toNumber(),
              subIds: [current.subId, mergePair.subId],
              isEnabled: mergePair.isEnabled || current.isEnabled,
              specific: {
                ...mergePair.specific,
                ...current.specific,
              },
            });
          } else {
            subscriptions.push(current);
          }
        });
        if (mergeExtension.length > 0) {
          console.error('Not all merge-able extensions were used', mergeExtension);
          subscriptions = [...subscriptions, ...mergeExtension.map((s) => ({
            ...s,
            subIds: [s.subId],
          }))];
        }
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
