import Dec from 'decimal.js';
import type Web3 from 'web3';
import type { PastEventOptions } from 'web3-eth-contract';
import PromisePool from 'es6-promise-pool';
import type {
  Position, Interfaces, EthereumAddress, SubscriptionOptions, Contract, ParseData, PlaceholderType, BlockNumber,
} from '../../types';
import type {
  StrategyModel, Subscribe, SubStorage, UpdateData,
} from '../../types/contracts/generated/SubStorage';
import type { ChainId } from '../../types/enums';
import { Strategies, ProtocolIdentifiers } from '../../types/enums';

import { addToObjectIf, isDefined, isUndefined } from '../../services/utils';
import { getAbiItem, makeSubStorageContract } from '../../services/contractService';
import { getEventsFromContract, multicall } from '../../services/ethereumService';
import { parseStrategiesAutomatedPosition } from '../../services/strategiesService';

import Automation from './Automation';

interface IStrategiesAutomation extends Interfaces.Automation {
  chainId: ChainId,
  providerFork?: Web3,
}

export default class StrategiesAutomation extends Automation {
  protected chainId: ChainId;

  protected web3: Web3;

  protected web3Fork?: Web3;

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
    // only used for backfilling, so in case options?.fromBlock in undefined
    // (just like we omit fromBlock when we call from app when not on fork), we still want to fetch events
    if (new Dec(this.subStorageContract.createdBlock.toString()).gt(options?.fromBlock?.toString() || this.subStorageContract.createdBlock.toString())) {
      return [];
    }
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
    return this.getEventFromSubStorage('Subscribe', options) as Promise<Subscribe[]>;
  }

  protected async getUpdateDataEventsFromSubStorage(options?: PastEventOptions) {
    const events = await this.getEventFromSubStorage('UpdateData', options);
    /** @dev - Some RPCs sort events differently */
    return events.sort((a, b) => a.blockNumber - b.blockNumber) as UpdateData[];
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
      )
      && (
        s.protocol.id !== ProtocolIdentifiers.StrategiesAutomation.MorphoBlue // merge morpho blue with the same marketId
        || s.strategyData.decoded.triggerData.marketId.toLowerCase() === current.strategyData.decoded.triggerData.marketId.toLowerCase()
      );
  }

  protected mergeSubs(_subscriptions:(Position.Automated | null)[]) {
    const mergeBase = _subscriptions.filter(s => isDefined(s) && isDefined(s.specific.mergeWithId)) as Position.Automated[];
    const mergeExtension = _subscriptions.filter(s => isDefined(s) && isDefined(s.specific.mergeId)) as Position.Automated[];

    let subscriptions:Position.Automated[] = (_subscriptions.filter(s => isDefined(s) && isUndefined(s.specific.mergeWithId) && isUndefined(s.specific.mergeId)) as Position.Automated[]).map((s) => ({
      ...s,
      subIds: [s.subId],
    }));
    mergeBase.forEach((current) => {
      const mergePairIndexSubEnabled = mergeExtension.findIndex(s => this._mergeCheck(s, current) && s.isEnabled === current.isEnabled);
      const mergePairIndexSubDisabled = mergeExtension.findIndex(s => this._mergeCheck(s, current));

      const mergePairIndex = mergePairIndexSubEnabled !== -1 ? mergePairIndexSubEnabled : mergePairIndexSubDisabled;

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
        subscriptions.push({
          ...current,
          subIds: [current.subId],
        });
      }
    });
    if (mergeExtension.length > 0) {
      console.error('Not all merge-able extensions were used', mergeExtension);
      subscriptions = [...subscriptions, ...mergeExtension.map((s) => ({
        ...s,
        subIds: [s.subId],
      }))];
    }
    return subscriptions;
  }

  protected async _getSubscriptions(addresses?: EthereumAddress[], options?: SubscriptionOptions): Promise<(Position.Automated | null)[]> {
    const _options = {
      ...addToObjectIf(isDefined(options), options),
      ...addToObjectIf(isDefined(addresses), { filter: { proxy: addresses } }),
    } as SubscriptionOptions & PastEventOptions;

    let subscriptionEvents = await this.getSubscriptionEventsFromSubStorage(_options);

    let subscriptions: (Position.Automated | null)[] = [];

    if (subscriptionEvents) {
      let strategiesSubs = await this.getStrategiesSubs(
        subscriptionEvents.map((e) => +e.returnValues.subId), _options.toBlock,
      );

      if (_options.enabledOnly) {
        const filteredSubscriptionEvents = [] as PlaceholderType;

        strategiesSubs = strategiesSubs.filter((sub, index) => {
          if (sub?.isEnabled) filteredSubscriptionEvents.push(subscriptionEvents[index]);
          return sub?.isEnabled;
        });

        subscriptionEvents = filteredSubscriptionEvents;
      }

      const replaceSubWithUpdate = async (index: number) => {
        const sub = strategiesSubs[index];
        let latestUpdate = { ...subscriptionEvents[index].returnValues };

        if (latestUpdate.subHash !== sub?.strategySubHash) {
          const updates = await this.getUpdateDataEventsFromSubStorage({
            ...addToObjectIf(!!_options, _options),
            filter: { subId: latestUpdate.subId },
          });
          latestUpdate = {
            ...latestUpdate, // Update is missing proxy, hence this
            ...updates?.[updates.length - 1]?.returnValues,
            2: latestUpdate[2], // type issue
          };
        }
        subscriptions.push(
          this.getParsedSubscriptions({
            chainId: this.chainId,
            blockNumber: subscriptionEvents[index].blockNumber,
            subscriptionEventData: latestUpdate,
            strategiesSubsData: sub,
          }),
        );
      };

      // eslint-disable-next-line func-names
      const pool = new PromisePool(function* () {
        for (let index = 0; index < strategiesSubs.length; index++) {
          yield replaceSubWithUpdate(index);
        }
      } as any, 50);
      await pool.start();

      if (options?.mergeSubs) {
        subscriptions = this.mergeSubs(subscriptions);
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
