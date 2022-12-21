import { cloneDeep } from 'lodash';
import {
  BUNDLES_INFO, STRATEGIES_INFO,


} from '../constants';
import type {
  AutomatedPosition, ParseData, StrategiesToProtocolVersionMapping, BundleOrStrategy, StrategyOrBundleIds,
} from '../types';

import { getRatioStateInfoForAaveCloseStrategy, wethToEthByAddress } from './utils';
import * as subDataService from './subDataService';
import * as triggerService from './triggerService';
import {
  ProtocolIdentifiers, RatioState, Strategies,
} from '../types/enums';

function parseMakerSavingsLiqProtection(position: AutomatedPosition, parseData: ParseData): AutomatedPosition {
  const _position = cloneDeep(position);

  const { subStruct } = parseData.subscriptionEventData;

  const triggerData = triggerService.makerRatioTrigger.decode(subStruct.triggerData);
  const subData = subDataService.makerRepayFromSavingsSubData.decode(subStruct.subData);

  _position.strategyData.decoded.triggerData = triggerData;
  _position.strategyData.decoded.subData = subData;

  _position.specific = {
    minRatio: +triggerData.ratio,
    minOptimalRatio: +subData.targetRatio,
    repayEnabled: true,
    boostEnabled: false,
    strategyName: _position.strategy.strategyId,
  };

  return _position;
}

function parseMakerCloseOnPrice(position: AutomatedPosition, parseData: ParseData): AutomatedPosition {
  const _position = cloneDeep(position);

  const { subStruct } = parseData.subscriptionEventData;

  const triggerData = triggerService.chainlinkPriceTrigger.decode(subStruct.triggerData);
  const subData = subDataService.makerCloseSubData.decode(subStruct.subData);

  _position.strategyData.decoded.triggerData = triggerData;
  _position.strategyData.decoded.subData = subData;

  const isTakeProfit = +triggerData.state === RatioState.OVER;

  _position.specific = {
    price: +triggerData.price,
    closeToAssetAddr: subData.closeToAssetAddr,
    repayEnabled: false,
    boostEnabled: false,
    strategyName: isTakeProfit ? Strategies.Names.TakeProfit : Strategies.Names.StopLoss,
  };

  return _position;
}

function parseMakerTrailingStop(position: AutomatedPosition, parseData: ParseData): AutomatedPosition {
  const _position = cloneDeep(position);

  const { subStruct } = parseData.subscriptionEventData;

  const triggerData = triggerService.trailingStopTrigger.decode(subStruct.triggerData);
  const subData = subDataService.makerCloseSubData.decode(subStruct.subData);

  _position.strategyData.decoded.triggerData = triggerData;
  _position.strategyData.decoded.subData = subData;

  _position.specific = {
    triggerPercentage: +triggerData.triggerPercentage,
    roundId: +triggerData.roundId,
    closeToAssetAddr: subData.closeToAssetAddr,
    strategyName: Strategies.Names.TrailingStop,
  };

  return _position;
}

function parseLiquityCloseOnPrice(position: AutomatedPosition, parseData: ParseData): AutomatedPosition {
  const _position = cloneDeep(position);

  const { subStruct } = parseData.subscriptionEventData;

  const triggerData = triggerService.chainlinkPriceTrigger.decode(subStruct.triggerData);
  const subData = subDataService.liquityCloseSubData.decode(subStruct.subData);

  _position.strategyData.decoded.triggerData = triggerData;
  _position.strategyData.decoded.subData = subData;

  const isTakeProfit = +triggerData.state === RatioState.OVER;

  _position.specific = {
    price: +triggerData.price,
    closeToAssetAddr: subData.closeToAssetAddr,
    repayEnabled: false,
    boostEnabled: false,
    strategyName: isTakeProfit ? Strategies.Names.TakeProfit : Strategies.Names.StopLoss,
  };

  return _position;
}

function parseLiquityTrailingStop(position: AutomatedPosition, parseData: ParseData): AutomatedPosition {
  const _position = cloneDeep(position);

  const { subStruct } = parseData.subscriptionEventData;

  const triggerData = triggerService.trailingStopTrigger.decode(subStruct.triggerData);
  const subData = subDataService.liquityCloseSubData.decode(subStruct.subData);

  _position.strategyData.decoded.triggerData = triggerData;
  _position.strategyData.decoded.subData = subData;

  _position.specific = {
    triggerPercentage: +triggerData.triggerPercentage,
    roundId: +triggerData.roundId,
    closeToAssetAddr: subData.closeToAssetAddr,
    strategyName: Strategies.Names.TrailingStop,
  };

  return _position;
}

function parseAaveV3LeverageManagement(position: AutomatedPosition, parseData: ParseData): AutomatedPosition {
  const _position = cloneDeep(position);

  const { subStruct, subId } = parseData.subscriptionEventData;
  const { isEnabled } = parseData.strategiesSubsData;

  const triggerData = triggerService.aaveV3RatioTrigger.decode(subStruct.triggerData);
  const subData = subDataService.aaveLeverageManagementSubData.decode(subStruct.subData);

  _position.strategyData.decoded.triggerData = triggerData;
  _position.strategyData.decoded.subData = subData;

  const isRepay = _position.strategy.strategyId === Strategies.Identifiers.Repay;

  if (isRepay) {
    _position.specific = {
      minRatio: triggerData.ratio,
      minOptimalRatio: subData.targetRatio,
      subId1: subId,
    };
  } else {
    _position.specific = {
      maxRatio: triggerData.ratio,
      maxOptimalRatio: subData.targetRatio,
      boostEnabled: isEnabled,
      subId2: subId,
    };
  }

  _position.specific.strategyName = Strategies.Names.LeverageManagement;
  _position.specific.mergeWithOthersOfSameName = true;

  return _position;
}

function parseAaveV3CloseOnPrice(position: AutomatedPosition, parseData: ParseData): AutomatedPosition {
  const _position = cloneDeep(position);

  const { subStruct } = parseData.subscriptionEventData;

  const triggerData = triggerService.aaveV3QuotePriceTrigger.decode(subStruct.triggerData);
  const subData = subDataService.aaveV3QuotePriceSubData.decode(subStruct.subData);

  _position.strategyData.decoded.triggerData = triggerData;
  _position.strategyData.decoded.subData = subData;

  _position.specific = {
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
    _position.specific.ratioState,
    wethToEthByAddress(_position.specific.collAsset),
    wethToEthByAddress(_position.specific.debtAsset),
    parseData.chainId,
  );

  _position.specific.strategyName = ratioState === RatioState.OVER ? Strategies.Names.TakeProfit : Strategies.Names.StopLoss;

  return _position;
}

function parseCompoundV3LeverageManagement(position: AutomatedPosition, parseData: ParseData): AutomatedPosition {
  const _position = cloneDeep(position);

  const { subStruct, subId } = parseData.subscriptionEventData;
  const { isEnabled } = parseData.strategiesSubsData;

  const triggerData = triggerService.compoundV3RatioTrigger.decode(subStruct.triggerData);
  const subData = subDataService.compoundV3LeverageManagementSubData.decode(subStruct.subData);

  _position.strategyData.decoded.triggerData = triggerData;
  _position.strategyData.decoded.subData = subData;

  const isRepay = [Strategies.Identifiers.Repay, Strategies.Identifiers.EoaRepay].includes(_position.strategy.strategyId);

  if (isRepay) {
    _position.specific = {
      minRatio: triggerData.ratio,
      minOptimalRatio: subData.targetRatio,
      subId1: subId,
    };
  } else {
    _position.specific = {
      maxRatio: triggerData.ratio,
      maxOptimalRatio: subData.targetRatio,
      boostEnabled: isEnabled,
      subId2: subId,
    };
  }

  const isEOA = _position.strategy.strategyId.includes('eoa');
  _position.specific.strategyName = isEOA ? Strategies.Names.EoaLeverageManagement : Strategies.Names.LeverageManagement;
  _position.specific.mergeWithOthersOfSameName = true;

  return _position;
}

function parseChickenBondsRebond(position: AutomatedPosition, parseData: ParseData): AutomatedPosition {
  const _position = cloneDeep(position);

  const { subStruct } = parseData.subscriptionEventData;

  _position.strategyData.decoded.triggerData = triggerService.cBondsRebondTrigger.decode(subStruct.triggerData);
  _position.strategyData.decoded.subData = subDataService.cBondsRebondSubData.decode(subStruct.subData);

  _position.specific.mergeWithOthersOfSameName = true;

  return _position;
}

const parsingMethodsMapping: StrategiesToProtocolVersionMapping = {
  [ProtocolIdentifiers.StrategiesAutomation.MakerDAO]: {
    [Strategies.Identifiers.SavingsLiqProtection]: parseMakerSavingsLiqProtection,
    [Strategies.Identifiers.CloseOnPriceToDebt]: parseMakerCloseOnPrice,
    [Strategies.Identifiers.CloseOnPriceToColl]: parseMakerCloseOnPrice,
    [Strategies.Identifiers.TrailingStopToColl]: parseMakerTrailingStop,
    [Strategies.Identifiers.TrailingStopToDebt]: parseMakerTrailingStop,
  },
  [ProtocolIdentifiers.StrategiesAutomation.Liquity]: {
    [Strategies.Identifiers.CloseOnPriceToColl]: parseLiquityCloseOnPrice,
    [Strategies.Identifiers.TrailingStopToColl]: parseLiquityTrailingStop,
  },
  [ProtocolIdentifiers.StrategiesAutomation.AaveV3]: {
    [Strategies.Identifiers.Repay]: parseAaveV3LeverageManagement,
    [Strategies.Identifiers.Boost]: parseAaveV3LeverageManagement,
    [Strategies.Identifiers.CloseToDebt]: parseAaveV3CloseOnPrice,
    [Strategies.Identifiers.CloseToCollateral]: parseAaveV3CloseOnPrice,
  },
  [ProtocolIdentifiers.StrategiesAutomation.CompoundV3]: {
    [Strategies.Identifiers.Repay]: parseCompoundV3LeverageManagement,
    [Strategies.Identifiers.Boost]: parseCompoundV3LeverageManagement,
    [Strategies.Identifiers.EoaRepay]: parseCompoundV3LeverageManagement,
    [Strategies.Identifiers.EoaBoost]: parseCompoundV3LeverageManagement,
  },
  [ProtocolIdentifiers.StrategiesAutomation.ChickenBonds]: {
    [Strategies.Identifiers.Rebond]: parseChickenBondsRebond,
  },
};

function getParsingMethod(id: ProtocolIdentifiers.StrategiesAutomation, strategy: BundleOrStrategy) {
  return parsingMethodsMapping[id][strategy.strategyId];
}

export function parseStrategiesAutomatedPosition(parseData: ParseData): AutomatedPosition | null {
  const { chainId, subscriptionEventData, strategiesSubsData } = parseData;
  const { subStruct, proxy } = subscriptionEventData;
  const { isEnabled } = strategiesSubsData;

  const id = subStruct.strategyOrBundleId as StrategyOrBundleIds;

  const strategyOrBundleInfo = (
    subStruct.isBundle
      ? BUNDLES_INFO[chainId][id]
      : STRATEGIES_INFO[chainId][id]
  ) as BundleOrStrategy;

  if (!strategyOrBundleInfo) return null;

  const position: AutomatedPosition = {
    isEnabled,
    chainId,
    owner: proxy,
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

  return getParsingMethod(position.protocol.id, position.strategy)(position, parseData);
}