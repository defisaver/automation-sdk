import type Web3 from 'web3';
import type { EventData, PastEventOptions } from 'web3-eth-contract';
import type {
  AutomatedPosition, AutomationConstructorParams, BundleOrStrategy, EthereumAddress, PlaceholderType,
  StrategyOrBundleIds, SubscriptionOptions, WrappedContract,
} from '../../types';
import type { Subscribe } from '../../types/contracts/generated/SubStorage';

import type { ChainId } from '../../constants';
import {
  BUNDLES_INFO, ProtocolIds, RatioState, STRATEGIES_INFO, StrategiesIds,
} from '../../constants';

import { addToObjectIf, isDefined, wethToEthByAddress } from '../../services/utils';
import { getAbiItem, makeSubStorageContract } from '../../services/contractService';
import { getEventsFromContract, multicall } from '../../services/ethereumService';
import { getRatioStateInfoForAaveCloseStrategy } from '../../services/encodingService';
import * as encodingService from '../../services/encodingService';

import Automation from './Automation';

interface ConstructorParams extends AutomationConstructorParams {
  chainId: ChainId,
}

export default class StrategiesAutomation extends Automation {
  protected chainId: ChainId;

  protected web3: Web3;

  protected subStorageContract: WrappedContract<PlaceholderType>;

  constructor(args: ConstructorParams) {
    super();

    this.web3 = args.provider;
    this.chainId = args.chainId;
    this.subStorageContract = makeSubStorageContract(this.web3, this.chainId);

    this.assert();
  }

  protected async getEventFromSubStorage(event: string, options?: PastEventOptions): Promise<EventData[]> {
    return getEventsFromContract(this.subStorageContract, event, options);
  }

  protected async getStrategiesSubs(subIds: number[]): Promise<PlaceholderType> {
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

  // TODO - [] Arg types
  //        [] Parsing strategies specific info

  protected getParsedSubscriptions(subscriptionEventData: Subscribe, strategiesSubsData: PlaceholderType): AutomatedPosition | null {
    // @ts-ignore
    const { subStruct, proxy, subId } = subscriptionEventData;
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
      if (position.strategy.strategyId === StrategiesIds.SavingsLiqProtection) {
        const triggerData = encodingService.makerRatioTriggerData.decode(subStruct.triggerData);
        const subData = encodingService.makerRepayFromSavingsSubData.decode(subStruct.subData);

        position.strategyData.decoded.triggerData = triggerData;
        position.strategyData.decoded.subData = subData;

        position.specific = {
          minRatio: +triggerData.ratio,
          minOptimalRatio: +subData.targetRatio,
          repayEnabled: true,
          boostEnabled: false,
          strategyName: position.strategy.strategyId,
        };
      }
      if ([StrategiesIds.CloseOnPriceToDebt, StrategiesIds.CloseOnPriceToColl].includes(position.strategy.strategyId)) {
        const triggerData = encodingService.closeOnPriceTriggerData.decode(subStruct.triggerData);
        const subData = encodingService.makerCloseSubData.decode(subStruct.subData);

        position.strategyData.decoded.triggerData = triggerData;
        position.strategyData.decoded.subData = subData;

        const isTakeProfit = +triggerData.state === RatioState.OVER;

        position.specific = {
          price: +triggerData.price,
          closeToAssetAddr: subData.closeToAssetAddr,
          repayEnabled: false,
          boostEnabled: false,
          strategyName: isTakeProfit ? StrategiesIds.TakeProfit : StrategiesIds.StopLoss,
        };
      }
      if ([StrategiesIds.TrailingStopToColl, StrategiesIds.TrailingStopToDebt].includes(position.strategy.strategyId)) {
        const triggerData = encodingService.trailingStopTriggerData.decode(subStruct.triggerData);
        const subData = encodingService.makerCloseSubData.decode(subStruct.subData);

        position.strategyData.decoded.triggerData = triggerData;
        position.strategyData.decoded.subData = subData;

        position.specific = {
          triggerPercentage: +triggerData.triggerPercentage,
          roundId: +triggerData.roundId,
          closeToAssetAddr: subData.closeToAssetAddr,
          strategyName: StrategiesIds.TrailingStop,
        };
      }
    }

    if (position.protocol.name === ProtocolIds.Liquity) {
      if (position.strategy.strategyId === StrategiesIds.CloseOnPriceToColl) {
        const triggerData = encodingService.closeOnPriceTriggerData.decode(subStruct.triggerData);
        const subData = encodingService.liquityCloseSubData.decode(subStruct.subData);

        position.strategyData.decoded.triggerData = triggerData;
        position.strategyData.decoded.subData = subData;

        const isTakeProfit = +triggerData.state === RatioState.OVER;

        position.specific = {
          price: +triggerData.price,
          closeToAssetAddr: subData.closeToAssetAddr,
          repayEnabled: false,
          boostEnabled: false,
          strategyName: isTakeProfit ? StrategiesIds.TakeProfit : StrategiesIds.StopLoss,
        };
      }
      if (position.strategy.strategyId === StrategiesIds.TrailingStopToColl) {
        const triggerData = encodingService.trailingStopTriggerData.decode(subStruct.triggerData);
        const subData = encodingService.liquityCloseSubData.decode(subStruct.subData);

        position.strategyData.decoded.triggerData = triggerData;
        position.strategyData.decoded.subData = subData;

        position.specific = {
          triggerPercentage: +triggerData.triggerPercentage,
          roundId: +triggerData.roundId,
          closeToAssetAddr: subData.closeToAssetAddr,
          strategyName: StrategiesIds.TrailingStop,
        };
      }
    }

    if (position.protocol.name === ProtocolIds.Aave) {
      if ([StrategiesIds.Repay, StrategiesIds.Boost].includes(position.strategy.strategyId)) {
        const triggerData = encodingService.aaveRatioTriggerData.decode(subStruct.triggerData);
        const subData = encodingService.aaveLeverageManagementSubData.decode(subStruct.subData);

        position.strategyData.decoded.triggerData = triggerData;
        position.strategyData.decoded.subData = subData;

        const isRepay = position.strategy.strategyId === StrategiesIds.Repay;

        if (isRepay) {
          position.specific = {
            minRatio: triggerData.ratio,
            minOptimalRatio: subData.targetRatio,
            subId1: subId,
          };
        } else {
          position.specific = {
            maxRatio: triggerData.ratio,
            maxOptimalRatio: subData.targetRatio,
            boostEnabled: isEnabled,
            subId2: subId,
          };
        }

        position.specific.strategyName = StrategiesIds.LeverageManagement;
        position.specific.mergeWithOthersOfSameName = true;
      }
      if ([StrategiesIds.CloseToDebt, StrategiesIds.CloseToCollateral].includes(position.strategy.strategyId)) {
        const triggerData = encodingService.aaveV3QuotePriceTriggerData.decode(subStruct.triggerData);
        const subData = encodingService.aaveV3QuotePriceSubData.decode(subStruct.subData);

        position.strategyData.decoded.triggerData = triggerData;
        position.strategyData.decoded.subData = subData;

        position.specific = {
          collAsset: subData.collAsset,
          collAssetId: subData.collAssetId,
          debtAsset: subData.debtAsset,
          debtAssetId: subData.debtAssetId,
          baseToken: triggerData.baseTokenAddress,
          quoteToken: triggerData.quoteTokenAddress,
          price: triggerData.price,
          ratioState: triggerData.ratioState,
          strategyOrBundleId: +subStruct.strategyOrBundleId,
        };

        const { ratioState } = getRatioStateInfoForAaveCloseStrategy(
          position.specific.ratioState,
          wethToEthByAddress(position.specific.collAsset),
          wethToEthByAddress(position.specific.debtAsset),
          this.chainId,
        );

        position.specific.strategyName = ratioState === RatioState.OVER ? StrategiesIds.TakeProfit : StrategiesIds.StopLoss;
      }
    }

    if (position.protocol.name === ProtocolIds.Compound) {
      if ([StrategiesIds.Repay, StrategiesIds.Boost, StrategiesIds.EoaRepay, StrategiesIds.EoaBoost].includes(position.strategy.strategyId)) {
        const triggerData = encodingService.compoundV3RatioTriggerData.decode(subStruct.triggerData);
        const subData = encodingService.compoundV3LeverageManagementSubData.decode(subStruct.subData);

        position.strategyData.decoded.triggerData = triggerData;
        position.strategyData.decoded.subData = subData;

        const isRepay = [StrategiesIds.Repay, StrategiesIds.EoaRepay].includes(position.strategy.strategyId);

        if (isRepay) {
          position.specific = {
            minRatio: triggerData.ratio,
            minOptimalRatio: subData.targetRatio,
            subId1: subId,
          };
        } else {
          position.specific = {
            maxRatio: triggerData.ratio,
            maxOptimalRatio: subData.targetRatio,
            boostEnabled: isEnabled,
            subId2: subId,
          };
        }

        const isEOA = position.strategy.strategyId.includes('eoa');
        position.specific.strategyName = isEOA ? StrategiesIds.EoaLeverageManagement : StrategiesIds.LeverageManagement;
        position.specific.mergeWithOthersOfSameName = true;
      }
    }

    if (position.protocol.name === ProtocolIds.ChickenBonds) {
      if (position.strategy.strategyId === StrategiesIds.Rebond) {
        position.strategyData.decoded.triggerData = encodingService.cBondsRebondTriggerData.decode(subStruct.triggerData);
        position.strategyData.decoded.subData = encodingService.cBondsRebondSubData.decode(subStruct.subData);

        position.specific.mergeWithOthersOfSameName = true;
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

    if (subscriptionEvents) {
      const strategiesSubs = await this.getStrategiesSubs(subscriptionEvents.map((e: PlaceholderType) => e.subId));

      subscriptions = await Promise.all(strategiesSubs.map(async (sub: PlaceholderType, index: number) => {
        let latestUpdate = subscriptionEvents[index] as PlaceholderType;

        if (latestUpdate.subHash !== sub?.strategySubHash) {
          const updates = await this.getUpdateDataEventsFromSubStorage({ filter: latestUpdate.subId });
          latestUpdate = {
            ...latestUpdate, // Update is missing proxy, hence this
            ...updates?.[updates.length - 1]?.returnValues,
          };
        }
        return this.getParsedSubscriptions(latestUpdate, sub);
      }));
    }

    return subscriptions;
  }

  public async getSubscriptions(options?: SubscriptionOptions): Promise<AutomatedPosition[]> { // TODO - extend type filter?
    return this._getSubscriptions(undefined, options);
  }

  public async getSubscriptionsFor(addresses: EthereumAddress[], options?: SubscriptionOptions): Promise<AutomatedPosition[]> {
    return this._getSubscriptions(addresses, options);
  }
}