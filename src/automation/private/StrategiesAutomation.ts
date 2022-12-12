import type Web3 from 'web3';
import type { PastEventOptions } from 'web3-eth-contract';
import type {
  AutomatedPosition, BundleOrStrategy, StrategyOrBundleIds, PlaceholderType, EthereumAddress, AutomationConstructorParams,
} from '../../types';

import type { ChainId } from '../../constants';
import SubStorage from '../../abis/SubStorage.json';
import { ProtocolIds, BUNDLES_INFO, STRATEGIES_INFO } from '../../constants';

import { addToObjectIf, isDefined } from '../../services/utils';
import { getAbiItem, makeContract } from '../../services/contractService';
import * as encodingService from '../../services/encodingService';

import Automation from './Automation';
import { multicall } from '../../services/ethereumService';

interface ConstructorParams extends AutomationConstructorParams {
  chainId: ChainId,
}

export default class StrategiesAutomation extends Automation {
  protected chainId: ChainId;

  protected web3: Web3;

  constructor(args: ConstructorParams) {
    super();

    this.web3 = args.provider;
    this.chainId = args.chainId;

    this.assert();
  }

  protected getSubStorageContract() {
    // @ts-ignore // TODO - Contract typing
    return makeContract(this.web3, SubStorage, this.chainId);
  }

  protected getEventFromSubStorage(event: string, options?: PastEventOptions) { // TODO Event names type? Generated?
    const subStorageContract = this.getSubStorageContract();

    return subStorageContract.get().getPastEvents(
      event,
      {
        ...addToObjectIf(isDefined(options), options),
        fromBlock: subStorageContract.createdBlock,
      },
    );
  }

  protected async getStrategiesSubs(subIds: number[]): Promise<PlaceholderType> {
    const subStorageContract = this.getSubStorageContract();

    const defaultOptions = {
      target: subStorageContract.address,
      abiItem: getAbiItem(subStorageContract.abi, 'strategiesSubs'),
    };

    const multicallCalls = subIds.map((subId) => ({ ...defaultOptions, params: [subId] }));

    // @ts-ignore
    return multicall(this.web3, this.chainId, multicallCalls);
  }

  protected getSubscriptionEventsFromSubStorage(options?: PastEventOptions) {
    return this.getEventFromSubStorage('Subscribe', options);
  }

  protected getUpdateDataEventsFromSubStorage(options?: PastEventOptions) {
    return this.getEventFromSubStorage('UpdateData', options);
  }

  // TODO - [] Arg types
  //        [] Parsing strategies specific info

  // @ts-ignore
  protected getParsedSubscriptions(subscriptionEventData, strategiesSubsData): AutomatedPosition | null {
    const { subStruct, proxy } = subscriptionEventData;
    const { isEnabled } = strategiesSubsData;

    const id = subStruct.strategyOrBundleId as StrategyOrBundleIds;

    const strategyOrBundleInfo = (
      subStruct.isBundle
        ? BUNDLES_INFO[this.chainId][id]
        : STRATEGIES_INFO[this.chainId][id]
    ) as BundleOrStrategy;

    if (!strategyOrBundleInfo) return null;

    const position: AutomatedPosition = {
      isEnabled,
      owner: proxy,
      chainId: this.chainId,
      protocol: {
        ...strategyOrBundleInfo.protocol,
      },
      strategy: {
        isBundle: subStruct.isBundle,
        ...strategyOrBundleInfo,
      },
      strategyData: {
        encoded: {
          triggerData: subStruct.triggerData,
          subData: subStruct.subData,
        },
        decoded: {
          triggerData: null,
          subData: null,
        },
      },
      specific: {},
    };

    if (position.protocol.name === ProtocolIds.MakerDAO) {
      if (position.strategy.strategyId === 'smart-savings-liquidation-protection') { // TODO - Do not use string
        position.strategyData.decoded.triggerData = encodingService.makerRatioTriggerData.decode(this.web3, subStruct.triggerData);
        position.strategyData.decoded.subData = encodingService.makerRepayFromSavingsSubData.decode(this.web3, subStruct.subData);

        // position.strategy = {
        //
        // }
        // item.graphData = {
        //   minRatio: +item.triggerData.ratio,
        //   minOptimalRatio: +item.subData.targetRatio,
        //   repayEnabled: true,
        //   boostEnabled: false,
        // };
      }
      if (['close-on-price-to-debt', 'close-on-price-to-coll'].includes(position.strategy.strategyId)) {
        position.strategyData.decoded.triggerData = encodingService.closeOnPriceTriggerData.decode(this.web3, subStruct.triggerData);
        position.strategyData.decoded.subData = encodingService.makerCloseSubData.decode(this.web3, subStruct.subData);
        // item.strategyName = isTakeProfit ? 'take-profit' : 'stop-loss';
        //     const isTakeProfit = +item.triggerData.state === strategiesConstants.RATIO_STATE_OVER;
        //     item.graphData = {
        //       price: +item.triggerData.price,
        //       closeToAssetAddr: item.subData.closeToAssetAddr,
        //       repayEnabled: false,
        //       boostEnabled: false,
        //     };
      }
      if (['trailing-stop-coll', 'trailing-stop-dai'].includes(position.strategy.strategyId)) {
        position.strategyData.decoded.triggerData = encodingService.trailingStopTriggerData.decode(this.web3, subStruct.triggerData);
        position.strategyData.decoded.subData = encodingService.makerCloseSubData.decode(this.web3, subStruct.subData);
        //     item.strategyName = 'trailing-stop';
        //     item.graphData = {
        //       triggerPercentage: +item.triggerData.triggerPercentage,
        //       roundId: +item.triggerData.roundId,
        //       closeToAssetAddr: item.subData.closeToAssetAddr,
        //     };
      }
    }

    if (position.protocol.name === ProtocolIds.Liquity) {
      if (position.strategy.strategyId === 'close-on-price-to-coll') {
        position.strategyData.decoded.triggerData = encodingService.closeOnPriceTriggerData.decode(this.web3, subStruct.triggerData);
        position.strategyData.decoded.subData = encodingService.liquityCloseSubData.decode(this.web3, subStruct.subData);

        //     const isTakeProfit = +item.triggerData.state === strategiesConstants.RATIO_STATE_OVER;
        //     item.strategyName = isTakeProfit ? 'take-profit' : 'stop-loss';
        //     item.graphData = {
        //       price: +item.triggerData.price,
        //       closeToAssetAddr: item.subData.closeToAssetAddr,
        //       repayEnabled: false,
        //       boostEnabled: false,
        //     };
      }
      if (position.strategy.strategyId === 'close-on-price-to-coll') {
        position.strategyData.decoded.triggerData = encodingService.closeOnPriceTriggerData.decode(this.web3, subStruct.triggerData);
        position.strategyData.decoded.subData = encodingService.liquityCloseSubData.decode(this.web3, subStruct.subData);
        // item.strategyName = 'trailing-stop';
        //     item.graphData = {
        //       triggerPercentage: +item.triggerData.triggerPercentage,
        //       roundId: +item.triggerData.roundId,
        //       closeToAssetAddr: item.subData.closeToAssetAddr,
        //     };
      }
    }

    if (position.protocol.name === ProtocolIds.Aave) {
      if (['aave-v3-repay', 'aave-v3-boost'].includes(position.strategy.strategyId)) {
        position.strategyData.decoded.triggerData = encodingService.aaveRatioTriggerData.decode(this.web3, subStruct.triggerData);
        position.strategyData.decoded.subData = encodingService.aaveLeverageManagementSubData.decode(this.web3, subStruct.subData);

        //     const isRepay = item.strategyName === 'aave-v3-repay';
        //     item.strategyName = 'leverage-management';
        //     item.graphData = {};
        //     if (isRepay) {
        //       item.graphData.repayFrom = item.triggerData.ratio;
        //       item.graphData.repayTo = item.subData.targetRatio;
        //       item.subId1 = subId;
        //     } else {
        //       item.graphData.boostFrom = item.triggerData.ratio;
        //       item.graphData.boostTo = item.subData.targetRatio;
        //       item.graphData.boostEnabled = isEnabled;
        //       item.subId2 = subId;
        //     }
      }
      if (['aave-v3-close-to-debt', 'aave-v3-close-to-collateral'].includes(position.strategy.strategyId)) {
        position.strategyData.decoded.triggerData = encodingService.aaveV3QuotePriceTriggerData.decode(this.web3, subStruct.triggerData);
        position.strategyData.decoded.subData = encodingService.aaveV3QuotePriceSubData.decode(this.web3, subStruct.subData);

        //     item.graphData = {
        //       collAsset: getAssetInfoByAddress(wethToEthByAddress(item.subData.collAsset)),
        //       collAssetId: item.subData.collAssetId,
        //       debtAsset: getAssetInfoByAddress(wethToEthByAddress(item.subData.debtAsset)),
        //       debtAssetId: item.subData.debtAssetId,
        //       baseToken: getAssetInfoByAddress(wethToEthByAddress(item.triggerData.baseTokenAddress)),
        //       quoteToken: getAssetInfoByAddress(wethToEthByAddress(item.triggerData.quoteTokenAddress)),
        //       price: item.triggerData.price,
        //       ratioState: item.triggerData.ratioState,
        //       strategyOrBundleId: Number(subStruct.strategyOrBundleId),
        //     };
        //     const { ratioState } = getRatioStateInfoForAaveCloseStrategy( // TODO - ?
        //       item.graphData.ratioState,
        //       item.graphData.collAsset.symbol,
        //       item.graphData.debtAsset.symbol,
        //     );
        //     item.strategyName = ratioState === strategiesConstants.RATIO_STATE_OVER ? 'take-profit' : 'stop-loss';
        //     item.title = ratioState === strategiesConstants.RATIO_STATE_OVER ? t('strategies.take_profit_title') : t('strategies.stop_loss_title');
      }
    }

    if (position.protocol.name === ProtocolIds.Compound) {
      if (['compound-v3-repay', 'compound-v3-boost', 'compound-v3-eoa-repay', 'compound-v3-eoa-boost'].includes(position.strategy.strategyId)) {
        position.strategyData.decoded.triggerData = encodingService.compoundV3RatioTriggerData.decode(this.web3, subStruct.triggerData);
        position.strategyData.decoded.subData = encodingService.compoundV3LeverageManagementSubData.decode(this.web3, subStruct.subData);

        //     const isRepay = ['compound-v3-repay', 'compound-v3-eoa-repay'].includes(position.strategy.strategyId);
        //     const isEOA = item.strategyName.includes('eoa');
        //     item.strategyName = `leverage-management${isEOA ? '-eoa' : ''}`;
        //     item.graphData = {};
        //     if (isRepay) {
        //       item.graphData.repayFrom = item.triggerData.ratio;
        //       item.graphData.repayTo = item.subData.targetRatio;
        //       item.subId1 = subId;
        //     } else {
        //       item.graphData.boostFrom = item.triggerData.ratio;
        //       item.graphData.boostTo = item.subData.targetRatio;
        //       item.graphData.boostEnabled = isEnabled;
        //       item.subId2 = subId;
        //     }
        //     item.mergeWithOthersOfSameName = true; // show both leverage-management bundles as a single strategy TODO ??
      }
    }

    if (position.protocol.name === ProtocolIds.ChickenBonds) {
      if (position.strategy.strategyId === 'rebond') {
        position.strategyData.decoded.triggerData = encodingService.cBondsRebondTriggerData.decode(this.web3, subStruct.triggerData);
        position.strategyData.decoded.subData = encodingService.cBondsRebondSubData.decode(this.web3, subStruct.subData);
      }
    }

    return position;
  }

  // TODO revise and improve this
  protected async _getSubscriptions(addresses?: EthereumAddress[], options?: PastEventOptions): Promise<AutomatedPosition[]> {
    const _options = {
      ...addToObjectIf(isDefined(options), options),
      ...addToObjectIf(isDefined(addresses), { filter: { proxy: addresses } }),
    };

    const subscriptionEvents = (await this.getSubscriptionEventsFromSubStorage(_options)).map(e => e.returnValues) as PlaceholderType;

    let subscriptions: AutomatedPosition[] = [];

    // TODO - check why some owners have empty address?

    if (subscriptionEvents) {
      const strategiesSubs = await this.getStrategiesSubs(subscriptionEvents.map((e: PlaceholderType) => e.subId));

      subscriptions = await Promise.all(strategiesSubs.map(async (sub: PlaceholderType, index: number) => {
        let latestUpdate = subscriptionEvents[index] as PlaceholderType;

        if (latestUpdate.subHash !== sub?.strategySubHash) {
          const updates = await this.getUpdateDataEventsFromSubStorage({ filter: latestUpdate.subId });
          latestUpdate = updates?.[updates.length - 1]?.returnValues;
        }
        return this.getParsedSubscriptions(latestUpdate, sub);
      }));
    }

    return subscriptions;
  }

  public async getSubscriptions(options?: PastEventOptions): Promise<AutomatedPosition[]> { // TODO - extend type filter?
    return this._getSubscriptions(undefined, options);
  }

  public async getSubscriptionsFor(addresses: EthereumAddress[], options?: PastEventOptions): Promise<AutomatedPosition[]> {
    return this._getSubscriptions(addresses, options);
  }
}