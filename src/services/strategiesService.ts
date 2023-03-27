import { getAssetInfoByAddress } from '@defisaver/tokens';
import { cloneDeep } from 'lodash';

import { BUNDLES_INFO, STRATEGIES_INFO } from '../constants';
import type {
  Position, ParseData, StrategiesToProtocolVersionMapping, BundleOrStrategy, StrategyOrBundleIds,
} from '../types';
import type { ChainId } from '../types/enums';
import { ProtocolIdentifiers, Strategies } from '../types/enums';

import { getRatioStateInfoForAaveCloseStrategy, isRatioStateOver, wethToEthByAddress } from './utils';
import * as subDataService from './subDataService';
import * as triggerService from './triggerService';

function parseMakerSavingsLiqProtection(position: Position.Automated, parseData: ParseData): Position.Automated {
  const _position = cloneDeep(position);

  const { subStruct } = parseData.subscriptionEventData;

  const triggerData = triggerService.makerRatioTrigger.decode(subStruct.triggerData);
  const subData = subDataService.makerRepayFromSavingsSubData.decode(subStruct.subData);

  _position.strategyData.decoded.triggerData = triggerData;
  _position.strategyData.decoded.subData = subData;

  _position.specific = {
    minRatio: Number(triggerData.ratio),
    minOptimalRatio: Number(subData.targetRatio),
    repayEnabled: true,
    boostEnabled: false,
  };

  return _position;
}

function parseMakerCloseOnPrice(position: Position.Automated, parseData: ParseData): Position.Automated {
  const _position = cloneDeep(position);

  const { subStruct } = parseData.subscriptionEventData;

  const triggerData = triggerService.chainlinkPriceTrigger.decode(subStruct.triggerData);
  const subData = subDataService.makerCloseSubData.decode(subStruct.subData);

  _position.strategyData.decoded.triggerData = triggerData;
  _position.strategyData.decoded.subData = subData;

  const isTakeProfit = isRatioStateOver(Number(triggerData.state));

  _position.strategy.strategyId = isTakeProfit ? Strategies.IdOverrides.TakeProfit : Strategies.IdOverrides.StopLoss;

  _position.specific = {
    price: triggerData.price,
    closeToAssetAddr: subData.closeToAssetAddr,
  };

  return _position;
}

function parseMakerTrailingStop(position: Position.Automated, parseData: ParseData): Position.Automated {
  const _position = cloneDeep(position);

  const { subStruct } = parseData.subscriptionEventData;

  const triggerData = triggerService.trailingStopTrigger.decode(subStruct.triggerData);
  const subData = subDataService.makerCloseSubData.decode(subStruct.subData);

  _position.strategyData.decoded.triggerData = triggerData;
  _position.strategyData.decoded.subData = subData;

  _position.strategy.strategyId = Strategies.IdOverrides.TrailingStop;

  _position.specific = {
    triggerPercentage: Number(triggerData.triggerPercentage),
    roundId: Number(triggerData.roundId),
    closeToAssetAddr: subData.closeToAssetAddr,
  };

  return _position;
}
function parseMakerLeverageManagement(position: Position.Automated, parseData: ParseData): Position.Automated {
  const _position = cloneDeep(position);

  const { subStruct, subId } = parseData.subscriptionEventData;
  const { isEnabled } = parseData.strategiesSubsData;

  const triggerData = triggerService.makerRatioTrigger.decode(subStruct.triggerData);
  const subData = subDataService.makerLeverageManagementSubData.decode(subStruct.subData);

  _position.strategyData.decoded.triggerData = triggerData;
  _position.strategyData.decoded.subData = subData;

  const isRepay = _position.strategy.strategyId === Strategies.Identifiers.Repay;

  if (isRepay) {
    _position.specific = {
      minRatio: triggerData.ratio,
      minOptimalRatio: subData.targetRatio,
      repayEnabled: true,
      subId1: Number(subId),
    };
  } else {
    _position.specific = {
      maxRatio: triggerData.ratio,
      maxOptimalRatio: subData.targetRatio,
      boostEnabled: isEnabled,
      subId2: Number(subId),
    };
  }

  _position.strategy.strategyId = Strategies.IdOverrides.LeverageManagement;
  _position.specific.mergeWithSameId = true;

  return _position;
}
function parseLiquityCloseOnPrice(position: Position.Automated, parseData: ParseData): Position.Automated {
  const _position = cloneDeep(position);

  const { subStruct } = parseData.subscriptionEventData;

  const triggerData = triggerService.chainlinkPriceTrigger.decode(subStruct.triggerData);
  const subData = subDataService.liquityCloseSubData.decode(subStruct.subData);

  _position.strategyData.decoded.triggerData = triggerData;
  _position.strategyData.decoded.subData = subData;

  const isTakeProfit = isRatioStateOver(Number(triggerData.state));

  _position.strategy.strategyId = isTakeProfit ? Strategies.IdOverrides.TakeProfit : Strategies.IdOverrides.StopLoss;

  _position.specific = {
    price: triggerData.price,
    closeToAssetAddr: subData.closeToAssetAddr,
  };

  return _position;
}

function parseLiquityTrailingStop(position: Position.Automated, parseData: ParseData): Position.Automated {
  const _position = cloneDeep(position);

  const { subStruct } = parseData.subscriptionEventData;

  const triggerData = triggerService.trailingStopTrigger.decode(subStruct.triggerData);
  const subData = subDataService.liquityCloseSubData.decode(subStruct.subData);

  _position.strategyData.decoded.triggerData = triggerData;
  _position.strategyData.decoded.subData = subData;

  _position.strategy.strategyId = Strategies.IdOverrides.TrailingStop;

  _position.specific = {
    triggerPercentage: Number(triggerData.triggerPercentage),
    roundId: Number(triggerData.roundId),
    closeToAssetAddr: subData.closeToAssetAddr,
  };

  return _position;
}

function parseAaveV3LeverageManagement(position: Position.Automated, parseData: ParseData): Position.Automated {
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
      repayEnabled: true,
      subId1: Number(subId),
    };
  } else {
    _position.specific = {
      maxRatio: triggerData.ratio,
      maxOptimalRatio: subData.targetRatio,
      boostEnabled: isEnabled,
      subId2: Number(subId),
    };
  }

  _position.strategy.strategyId = Strategies.IdOverrides.LeverageManagement;
  _position.specific.mergeWithSameId = true;

  return _position;
}

function parseMorphoAaveV2LeverageManagement(position: Position.Automated, parseData: ParseData): Position.Automated {
  const _position = cloneDeep(position);

  const { subStruct, subId } = parseData.subscriptionEventData;
  const { isEnabled } = parseData.strategiesSubsData;

  const triggerData = triggerService.morphoAaveV2RatioTrigger.decode(subStruct.triggerData);
  const subData = subDataService.morphoAaveV2LeverageManagementSubData.decode(subStruct.subData);

  _position.strategyData.decoded.triggerData = triggerData;
  _position.strategyData.decoded.subData = subData;

  const isRepay = _position.strategy.strategyId === Strategies.Identifiers.Repay;

  if (isRepay) {
    _position.specific = {
      minRatio: triggerData.ratio,
      minOptimalRatio: subData.targetRatio,
      repayEnabled: true,
      subId1: Number(subId),
    };
  } else {
    _position.specific = {
      maxRatio: triggerData.ratio,
      maxOptimalRatio: subData.targetRatio,
      boostEnabled: isEnabled,
      subId2: Number(subId),
    };
  }

  _position.strategy.strategyId = Strategies.IdOverrides.LeverageManagement;
  _position.specific.mergeWithSameId = true;

  return _position;
}

function parseAaveV3CloseOnPrice(position: Position.Automated, parseData: ParseData): Position.Automated {
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
  };

  const { ratioState } = getRatioStateInfoForAaveCloseStrategy(
    _position.specific.ratioState,
    wethToEthByAddress(_position.specific.collAsset),
    wethToEthByAddress(_position.specific.debtAsset),
    parseData.chainId,
  );

  _position.strategy.strategyId = isRatioStateOver(ratioState) ? Strategies.IdOverrides.TakeProfit : Strategies.IdOverrides.StopLoss;

  return _position;
}

function parseCompoundV3LeverageManagement(position: Position.Automated, parseData: ParseData): Position.Automated {
  const _position = cloneDeep(position);

  const { subStruct, subId } = parseData.subscriptionEventData;
  const { isEnabled } = parseData.strategiesSubsData;

  const triggerData = triggerService.compoundV3RatioTrigger.decode(subStruct.triggerData);
  const subData = subDataService.compoundV3LeverageManagementSubData.decode(subStruct.subData);

  _position.strategyData.decoded.triggerData = triggerData;
  _position.strategyData.decoded.subData = subData;
  _position.owner = triggerData.owner;
  const isRepay = [Strategies.Identifiers.Repay, Strategies.Identifiers.EoaRepay].includes(_position.strategy.strategyId as Strategies.Identifiers);

  if (isRepay) {
    _position.specific = {
      minRatio: triggerData.ratio,
      minOptimalRatio: subData.targetRatio,
      repayEnabled: true,
      subId1: Number(subId),
    };
  } else {
    _position.specific = {
      maxRatio: triggerData.ratio,
      maxOptimalRatio: subData.targetRatio,
      boostEnabled: isEnabled,
      subId2: Number(subId),
    };
  }

  const isEOA = _position.strategy.strategyId.includes('eoa');
  _position.strategy.strategyId = isEOA ? Strategies.IdOverrides.EoaLeverageManagement : Strategies.IdOverrides.LeverageManagement;

  _position.specific.mergeWithSameId = true;

  return _position;
}

function parseChickenBondsRebond(position: Position.Automated, parseData: ParseData): Position.Automated {
  const _position = cloneDeep(position);

  const { subStruct } = parseData.subscriptionEventData;

  _position.strategyData.decoded.triggerData = triggerService.cBondsRebondTrigger.decode(subStruct.triggerData);
  _position.strategyData.decoded.subData = subDataService.cBondsRebondSubData.decode(subStruct.subData);

  return _position;
}

function parseLiquityBondProtection(position: Position.Automated, parseData: ParseData): Position.Automated {
  const _position = cloneDeep(position);

  const { subStruct } = parseData.subscriptionEventData;

  const triggerData = triggerService.liquityRatioTrigger.decode(subStruct.triggerData);
  _position.strategyData.decoded.subData = subDataService.liquityPaybackUsingChickenBondSubData.decode(subStruct.subData);

  _position.strategyData.decoded.triggerData = triggerData;

  _position.specific = {
    minRatio: Number(triggerData.ratio),
    minOptimalRatio: Infinity, // Unknown minOptimalRatio, uses all assets from chicken bond until trove min debt (2000LUSD)
    repayEnabled: true,
  };
  return _position;
}

function parseExchangeDca(position: Position.Automated, parseData: ParseData, chainId: ChainId): Position.Automated {
  const _position = cloneDeep(position);

  const { subStruct } = parseData.subscriptionEventData;

  _position.strategyData.decoded.triggerData = triggerService.exchangeTimestampTrigger.decode(subStruct.triggerData);
  _position.strategyData.decoded.subData = subDataService.exchangeDcaSubData.decode(subStruct.subData, chainId);

  return _position;
}
function parseExchangeLimitOrder(position: Position.Automated, parseData: ParseData, chainId: ChainId): Position.Automated {
  const _position = cloneDeep(position);

  const { subStruct } = parseData.subscriptionEventData;

  _position.strategyData.decoded.subData = subDataService.exchangeLimitOrderSubData.decode(subStruct.subData, chainId);
  const fromTokenDecimals = getAssetInfoByAddress(_position.strategyData.decoded.subData.fromToken, chainId).decimals;
  _position.strategyData.decoded.triggerData = triggerService.exchangeOffchainPriceTrigger.decode(subStruct.triggerData, fromTokenDecimals);

  return _position;
}

const parsingMethodsMapping: StrategiesToProtocolVersionMapping = {
  [ProtocolIdentifiers.StrategiesAutomation.MakerDAO]: {
    [Strategies.Identifiers.SavingsLiqProtection]: parseMakerSavingsLiqProtection,
    [Strategies.Identifiers.CloseOnPriceToDebt]: parseMakerCloseOnPrice,
    [Strategies.Identifiers.CloseOnPriceToColl]: parseMakerCloseOnPrice,
    [Strategies.Identifiers.TrailingStopToColl]: parseMakerTrailingStop,
    [Strategies.Identifiers.TrailingStopToDebt]: parseMakerTrailingStop,
    [Strategies.Identifiers.Repay]: parseMakerLeverageManagement,
    [Strategies.Identifiers.Boost]: parseMakerLeverageManagement,
  },
  [ProtocolIdentifiers.StrategiesAutomation.Liquity]: {
    [Strategies.Identifiers.CloseOnPriceToColl]: parseLiquityCloseOnPrice,
    [Strategies.Identifiers.TrailingStopToColl]: parseLiquityTrailingStop,
    [Strategies.Identifiers.BondProtection]: parseLiquityBondProtection,
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
  [ProtocolIdentifiers.StrategiesAutomation.MorphoAaveV2]: {
    [Strategies.Identifiers.Repay]: parseMorphoAaveV2LeverageManagement,
    [Strategies.Identifiers.Boost]: parseMorphoAaveV2LeverageManagement,
  },
  [ProtocolIdentifiers.StrategiesAutomation.Exchange]: {
    [Strategies.Identifiers.Dca]: parseExchangeDca,
    [Strategies.Identifiers.LimitOrder]: parseExchangeLimitOrder,
  },
};

function getParsingMethod(id: ProtocolIdentifiers.StrategiesAutomation, strategy: BundleOrStrategy) {
  return parsingMethodsMapping[id][strategy.strategyId];
}

export function parseStrategiesAutomatedPosition(parseData: ParseData): Position.Automated | null {
  const {
    chainId, blockNumber, subscriptionEventData, strategiesSubsData,
  } = parseData;
  const {
    subStruct, proxy, subId, subHash,
  } = subscriptionEventData;
  const { isEnabled } = strategiesSubsData;

  const id = subStruct.strategyOrBundleId as StrategyOrBundleIds;

  const strategyOrBundleInfo = (
    subStruct.isBundle
      ? BUNDLES_INFO[chainId][id]
      : STRATEGIES_INFO[chainId][id]
  ) as BundleOrStrategy;

  if (!strategyOrBundleInfo) return null;

  const position: Position.Automated = {
    isEnabled,
    chainId,
    subHash,
    blockNumber,
    subId: Number(subId),
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

  return getParsingMethod(position.protocol.id, position.strategy)(position, parseData, chainId);
}
