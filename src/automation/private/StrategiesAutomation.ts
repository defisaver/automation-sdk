import type Web3 from 'web3';
import type { PastEventOptions, EventData } from 'web3-eth-contract';
import type {
  AutomatedPosition,
  BundleOrStrategy,
  StrategyOrBundleIds,
  PlaceholderType,
  EthereumAddress,
  AutomationConstructorParams,
  ContractJson,
} from '../../types';

import type { ChainId } from '../../constants';
import SubStorage from '../../abis/SubStorage.json';
import {
  ProtocolIds, BUNDLES_INFO, STRATEGIES_INFO, StrategiesIds, RatioState,
} from '../../constants';

import { addToObjectIf, isDefined, wethToEthByAddress } from '../../services/utils';
import { getAbiItem, makeContract } from '../../services/contractService';
import { multicall } from '../../services/ethereumService';
import { getRatioStateInfoForAaveCloseStrategy } from '../../services/encodingService';
import * as encodingService from '../../services/encodingService';

import Automation from './Automation';

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
    const contractJson = SubStorage as ContractJson;
    return makeContract(this.web3, contractJson, this.chainId);
  }

  // TODO Event names type? Generated?
  protected async getEventFromSubStorage(event: string, options?: PastEventOptions): Promise<EventData[]> {
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

  protected async getSubscriptionEventsFromSubStorage(options?: PastEventOptions) {
    return this.getEventFromSubStorage('Subscribe', options);
  }

  protected async getUpdateDataEventsFromSubStorage(options?: PastEventOptions) {
    return this.getEventFromSubStorage('UpdateData', options);
  }

  // TODO - [] Arg types
  //        [] Parsing strategies specific info

  // @ts-ignore
  protected getParsedSubscriptions(subscriptionEventData, strategiesSubsData): AutomatedPosition | null {
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
    // ovo mi se ne svidja
    // svako ovo parsovanje bi trebalo da je funkcija, do koje se stize sa protokol name-om i strategyId-om
    // takodje svaka ta funkcija treba da bude ogranicena sa predefinisanim tipom funkcije koji vraca informacije o strategiji
    // takodje treba prodiskutovati eventualno ova imena propova, ovo specific mi cudno
    if (position.protocol.name === ProtocolIds.MakerDAO) {
      if (position.strategy.strategyId === StrategiesIds.SavingsLiqProtection) {
        const triggerData = encodingService.makerRatioTriggerData.decode(this.web3, subStruct.triggerData);
        const subData = encodingService.makerRepayFromSavingsSubData.decode(this.web3, subStruct.subData);

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
        const triggerData = encodingService.closeOnPriceTriggerData.decode(this.web3, subStruct.triggerData);
        const subData = encodingService.makerCloseSubData.decode(this.web3, subStruct.subData);

        position.strategyData.decoded.triggerData = triggerData;
        position.strategyData.decoded.subData = subData;

        const isTakeProfit = +triggerData.state === RatioState.OVER;

        position.specific = {
          price: +triggerData.price,
          closeToAssetAddr: subData.closeToAssetAddr,
          repayEnabled: false,
          boostEnabled: false,
          strategyName: isTakeProfit ? 'take-profit' : 'stop-loss', // enum-ovati ovo potencijalno, ili u AutomationData definisati strategyName
        };
      }
      if ([StrategiesIds.TrailingStopToColl, StrategiesIds.TrailingStopToDebt].includes(position.strategy.strategyId)) {
        const triggerData = encodingService.trailingStopTriggerData.decode(this.web3, subStruct.triggerData);
        const subData = encodingService.makerCloseSubData.decode(this.web3, subStruct.subData);

        position.strategyData.decoded.triggerData = triggerData;
        position.strategyData.decoded.subData = subData;

        position.specific = {
          triggerPercentage: +triggerData.triggerPercentage,
          roundId: +triggerData.roundId,
          closeToAssetAddr: subData.closeToAssetAddr,
          strategyName: 'trailing-stop',
        };
      }
    }

    if (position.protocol.name === ProtocolIds.Liquity) {
      if (position.strategy.strategyId === StrategiesIds.CloseOnPriceToColl) {
        const triggerData = encodingService.closeOnPriceTriggerData.decode(this.web3, subStruct.triggerData);
        const subData = encodingService.liquityCloseSubData.decode(this.web3, subStruct.subData);

        position.strategyData.decoded.triggerData = triggerData;
        position.strategyData.decoded.subData = subData;

        const isTakeProfit = +triggerData.state === RatioState.OVER;

        position.specific = {
          price: +triggerData.price,
          closeToAssetAddr: subData.closeToAssetAddr,
          repayEnabled: false,
          boostEnabled: false,
          strategyName: isTakeProfit ? 'take-profit' : 'stop-loss',
        };
      }
      if (position.strategy.strategyId === StrategiesIds.TrailingStopToColl) {
        const triggerData = encodingService.trailingStopTriggerData.decode(this.web3, subStruct.triggerData);
        const subData = encodingService.liquityCloseSubData.decode(this.web3, subStruct.subData);

        position.strategyData.decoded.triggerData = triggerData;
        position.strategyData.decoded.subData = subData;

        position.specific = {
          triggerPercentage: +triggerData.triggerPercentage,
          roundId: +triggerData.roundId,
          closeToAssetAddr: subData.closeToAssetAddr,
          strategyName: 'trailing-stop',
        };
      }
    }

    if (position.protocol.name === ProtocolIds.Aave) {
      if ([StrategiesIds.Repay, StrategiesIds.Boost].includes(position.strategy.strategyId)) {
        const triggerData = encodingService.aaveRatioTriggerData.decode(this.web3, subStruct.triggerData);
        const subData = encodingService.aaveLeverageManagementSubData.decode(this.web3, subStruct.subData);

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

        position.specific.strategyName = 'leverage-management';
        position.specific.mergeWithOthersOfSameName = true;
      }
      if ([StrategiesIds.CloseToDebt, StrategiesIds.CloseToCollateral].includes(position.strategy.strategyId)) {
        const triggerData = encodingService.aaveV3QuotePriceTriggerData.decode(this.web3, subStruct.triggerData);
        const subData = encodingService.aaveV3QuotePriceSubData.decode(this.web3, subStruct.subData);

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

        position.specific.strategyName = ratioState === RatioState.OVER ? 'take-profit' : 'stop-loss';
      }
    }

    if (position.protocol.name === ProtocolIds.Compound) {
      if ([StrategiesIds.Repay, StrategiesIds.Boost, StrategiesIds.EoaRepay, StrategiesIds.EoaBoost].includes(position.strategy.strategyId)) {
        const triggerData = encodingService.compoundV3RatioTriggerData.decode(this.web3, subStruct.triggerData);
        const subData = encodingService.compoundV3LeverageManagementSubData.decode(this.web3, subStruct.subData);

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
        position.specific.strategyName = `leverage-management${isEOA ? '-eoa' : ''}`;
        position.specific.mergeWithOthersOfSameName = true;
      }
    }

    if (position.protocol.name === ProtocolIds.ChickenBonds) {
      if (position.strategy.strategyId === StrategiesIds.Rebond) {
        position.strategyData.decoded.triggerData = encodingService.cBondsRebondTriggerData.decode(this.web3, subStruct.triggerData);
        position.strategyData.decoded.subData = encodingService.cBondsRebondSubData.decode(this.web3, subStruct.subData);

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
