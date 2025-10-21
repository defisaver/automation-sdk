import { getAssetInfoByAddress } from '@defisaver/tokens';
import { cloneDeep } from 'lodash';

import Web3 from 'web3';
import { BUNDLES_INFO, STRATEGIES_INFO } from '../constants';
import type {
  Position, ParseData, StrategiesToProtocolVersionMapping, BundleOrStrategy, StrategyOrBundleIds,
  BundleInfoUnion, StrategyInfoUnion,
} from '../types';
import { ChainId, ProtocolIdentifiers, Strategies } from '../types/enums';

import {
  getPositionId, getRatioStateInfoForAaveCloseStrategy, getStopLossAndTakeProfitTypeByCloseStrategyType, isRatioStateOver, wethToEthByAddress,
} from './utils';
import * as subDataService from './subDataService';
import * as triggerService from './triggerService';

const web3 = new Web3();

const SPARK_MARKET_ADDRESSES = {
  [ChainId.Ethereum]: '0x02C3eA4e34C0cBd694D2adFa2c690EECbC1793eE',
};

const AAVE_V3_MARKET_ADDRESSES = {
  [ChainId.Ethereum]: '0x2f39d218133AFaB8F2B819B1066c7E434Ad94E9e',
  [ChainId.Optimism]: '0xa97684ead0e402dC232d5A977953DF7ECBaB3CDb',
  [ChainId.Arbitrum]: '0xa97684ead0e402dC232d5A977953DF7ECBaB3CDb',
  [ChainId.Base]: '0xe20fCBdBfFC4Dd138cE8b2E6FBb6CB49777ad64D',

};

function parseMakerSavingsLiqProtection(position: Position.Automated, parseData: ParseData): Position.Automated {
  const _position = cloneDeep(position);

  const { subStruct } = parseData.subscriptionEventData;

  const triggerData = triggerService.makerRatioTrigger.decode(subStruct.triggerData);
  const subData = subDataService.makerRepayFromSavingsSubData.decode(subStruct.subData);

  _position.strategyData.decoded.triggerData = triggerData;
  _position.strategyData.decoded.subData = subData;

  _position.positionId = getPositionId(_position.chainId, _position.protocol.id, subData.vaultId);

  _position.specific = {
    triggerRepayRatio: Number(triggerData.ratio),
    targetRepayRatio: Number(subData.targetRatio),
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

  _position.positionId = getPositionId(_position.chainId, _position.protocol.id, subData.vaultId);

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

  _position.positionId = getPositionId(_position.chainId, _position.protocol.id, subData.vaultId);

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

  _position.positionId = getPositionId(_position.chainId, _position.protocol.id, subData.vaultId);

  const isRepay = _position.strategy.strategyId === Strategies.Identifiers.Repay;

  if (isRepay) {
    _position.specific = {
      triggerRepayRatio: triggerData.ratio,
      targetRepayRatio: subData.targetRatio,
      repayEnabled: true,
      subId1: Number(subId),
      mergeWithId: Strategies.Identifiers.Boost,
    };
  } else {
    _position.specific = {
      triggerBoostRatio: triggerData.ratio,
      targetBoostRatio: subData.targetRatio,
      boostEnabled: isEnabled,
      subId2: Number(subId),
      mergeId: Strategies.Identifiers.Boost,
    };
  }

  _position.strategy.strategyId = Strategies.IdOverrides.LeverageManagement;

  return _position;
}

function parseLiquityCloseOnPrice(position: Position.Automated, parseData: ParseData): Position.Automated {
  const _position = cloneDeep(position);

  const { subStruct } = parseData.subscriptionEventData;

  const triggerData = triggerService.chainlinkPriceTrigger.decode(subStruct.triggerData);
  const subData = subDataService.liquityCloseSubData.decode(subStruct.subData);

  _position.strategyData.decoded.triggerData = triggerData;
  _position.strategyData.decoded.subData = subData;

  _position.positionId = getPositionId(_position.chainId, _position.protocol.id, _position.owner);

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

  _position.positionId = getPositionId(_position.chainId, _position.protocol.id, _position.owner);

  _position.strategy.strategyId = Strategies.IdOverrides.TrailingStop;

  _position.specific = {
    triggerPercentage: Number(triggerData.triggerPercentage),
    roundId: Number(triggerData.roundId),
    closeToAssetAddr: subData.closeToAssetAddr,
  };

  return _position;
}

function parseAaveV2LeverageManagement(position: Position.Automated, parseData: ParseData): Position.Automated {
  const _position = cloneDeep(position);

  const { subStruct, subId } = parseData.subscriptionEventData;
  const { isEnabled } = parseData.strategiesSubsData;

  const triggerData = triggerService.aaveV2RatioTrigger.decode(subStruct.triggerData);
  const subData = subDataService.aaveV2LeverageManagementSubData.decode(subStruct.subData);

  _position.strategyData.decoded.triggerData = triggerData;
  _position.strategyData.decoded.subData = subData;

  _position.positionId = getPositionId(_position.chainId, _position.protocol.id, _position.owner, triggerData.market);

  const isRepay = _position.strategy.strategyId === Strategies.Identifiers.Repay;

  if (isRepay) {
    _position.specific = {
      triggerRepayRatio: triggerData.ratio,
      targetRepayRatio: subData.targetRatio,
      repayEnabled: true,
      subId1: Number(subId),
      mergeWithId: Strategies.Identifiers.Boost,
    };
  } else {
    _position.specific = {
      triggerBoostRatio: triggerData.ratio,
      targetBoostRatio: subData.targetRatio,
      boostEnabled: isEnabled,
      subId2: Number(subId),
      mergeId: Strategies.Identifiers.Boost,
    };
  }

  _position.strategy.strategyId = Strategies.IdOverrides.LeverageManagement;

  return _position;
}

function parseAaveV3LeverageManagement(position: Position.Automated, parseData: ParseData): Position.Automated {
  const _position = cloneDeep(position);

  const { subStruct, subId, subHash } = parseData.subscriptionEventData;
  const { isEnabled } = parseData.strategiesSubsData;

  const triggerData = triggerService.aaveV3RatioTrigger.decode(subStruct.triggerData);
  const isEOA = _position.strategy.strategyId.includes('eoa');
  let subData;
  if (isEOA) {
    subData = subDataService.aaveV3LeverageManagementSubDataWithoutSubProxy.decode(subStruct.subData);
  } else {
    subData = subDataService.aaveV3LeverageManagementSubData.decode(subStruct.subData);
  }

  _position.strategyData.decoded.triggerData = triggerData;
  _position.strategyData.decoded.subData = subData;

  _position.positionId = getPositionId(_position.chainId, _position.protocol.id, _position.owner, triggerData.market);

  const isRepay = [Strategies.Identifiers.Repay, Strategies.Identifiers.EoaRepay].includes(_position.strategy.strategyId as Strategies.Identifiers);

  if (isRepay) {
    _position.specific = {
      triggerRepayRatio: triggerData.ratio,
      targetRepayRatio: subData.targetRatio,
      repayEnabled: isEnabled,
      subId1: Number(subId),
      mergeWithId: isEOA ? Strategies.Identifiers.EoaBoost : Strategies.Identifiers.Boost,
      subHashRepay: subHash,
    };
  } else {
    _position.specific = {
      triggerBoostRatio: triggerData.ratio,
      targetBoostRatio: subData.targetRatio,
      boostEnabled: isEnabled,
      subId2: Number(subId),
      mergeId: isEOA ? Strategies.Identifiers.EoaBoost : Strategies.Identifiers.Boost,
      subHashBoost: subHash,
    };
  }
  if (!isEOA) {
    _position.strategy.strategyId = Strategies.IdOverrides.LeverageManagement;
  } else {
    _position.strategy.strategyId = Strategies.IdOverrides.EoaLeverageManagement;
  }

  return _position;
}

function parseAaveV3LeverageManagementOnPrice(position: Position.Automated, parseData: ParseData): Position.Automated {
  const _position = cloneDeep(position);
  const { subStruct } = parseData.subscriptionEventData;

  const triggerData = triggerService.aaveV3QuotePriceTrigger.decode(subStruct.triggerData);
  const isEOA = _position.strategy.strategyId.includes('eoa');
  let subData;
  if (isEOA) {
    subData = subDataService.aaveV3LeverageManagementOnPriceGeneric.decode(subStruct.subData);
  } else {
    subData = subDataService.aaveV3LeverageManagementOnPriceSubData.decode(subStruct.subData);
  }

  _position.strategyData.decoded.triggerData = triggerData;
  _position.strategyData.decoded.subData = subData;
  _position.positionId = getPositionId(_position.chainId, _position.protocol.id, _position.owner, Math.random());

  _position.specific = {
    collAsset: subData.collAsset,
    debtAsset: subData.debtAsset,
    baseToken: triggerData.baseTokenAddress,
    quoteToken: triggerData.quoteTokenAddress,
    price: triggerData.price,
    ratioState: triggerData.ratioState,
    debtAssetId: subData.debtAssetId,
    collAssetId: subData.collAssetId,
    ratio: subData.targetRatio,
  };

  return _position;
}

function parseAaveV3CloseOnPrice(position: Position.Automated, parseData: ParseData): Position.Automated {
  const _position = cloneDeep(position);

  const { subStruct } = parseData.subscriptionEventData;

  const isEOA = _position.strategy.strategyId.includes('eoa');

  _position.positionId = getPositionId(_position.chainId, _position.protocol.id, _position.owner, AAVE_V3_MARKET_ADDRESSES[_position.chainId]);

  if (isEOA) {
    const triggerData = triggerService.aaveV3QuotePriceRangeTrigger.decode(subStruct.triggerData);
    const subData = subDataService.aaveV3CloseGenericSubData.decode(subStruct.subData);

    const { takeProfitType, stopLossType } = getStopLossAndTakeProfitTypeByCloseStrategyType(+subData.closeType);

    _position.strategyData.decoded.triggerData = triggerData;
    _position.strategyData.decoded.subData = subData;

    _position.specific = {
      collAsset: subData.collAsset,
      collAssetId: subData.collAssetId,
      debtAsset: subData.debtAsset,
      debtAssetId: subData.debtAssetId,
      baseToken: triggerData.collToken,
      quoteToken: triggerData.debtToken,
      stopLossPrice: triggerData.lowerPrice,
      takeProfitPrice: triggerData.upperPrice,
      stopLossType,
      takeProfitType,
    };

    _position.strategy.strategyId = Strategies.Identifiers.EoaCloseOnPrice;
  } else {
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
      wethToEthByAddress(_position.specific.collAsset, parseData.chainId),
      wethToEthByAddress(_position.specific.debtAsset, parseData.chainId),
      parseData.chainId,
    );

    _position.strategy.strategyId = isRatioStateOver(ratioState)
      ? Strategies.IdOverrides.TakeProfit
      : Strategies.IdOverrides.StopLoss;
  }

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

  _position.positionId = getPositionId(_position.chainId, _position.protocol.id, _position.owner);

  const isRepay = _position.strategy.strategyId === Strategies.Identifiers.Repay;

  if (isRepay) {
    _position.specific = {
      triggerRepayRatio: triggerData.ratio,
      targetRepayRatio: subData.targetRatio,
      repayEnabled: true,
      subId1: Number(subId),
      mergeWithId: Strategies.Identifiers.Boost,
    };
  } else {
    _position.specific = {
      triggerBoostRatio: triggerData.ratio,
      targetBoostRatio: subData.targetRatio,
      boostEnabled: isEnabled,
      subId2: Number(subId),
      mergeId: Strategies.Identifiers.Boost,
    };
  }

  _position.strategy.strategyId = Strategies.IdOverrides.LeverageManagement;

  return _position;
}

function parseAaveV3CloseOnPriceWithMaximumGasPrice(position: Position.Automated, parseData: ParseData): Position.Automated {
  const _position = cloneDeep(position);

  const { subStruct } = parseData.subscriptionEventData;

  const triggerData = triggerService.aaveV3QuotePriceWithMaximumGasPriceTrigger.decode(subStruct.triggerData);
  const subData = subDataService.aaveV3QuotePriceSubData.decode(subStruct.subData);

  _position.strategyData.decoded.triggerData = triggerData;
  _position.strategyData.decoded.subData = subData;

  _position.positionId = getPositionId(_position.chainId, _position.protocol.id, _position.owner, AAVE_V3_MARKET_ADDRESSES[_position.chainId]);

  _position.specific = {
    collAsset: subData.collAsset,
    collAssetId: subData.collAssetId,
    debtAsset: subData.debtAsset,
    debtAssetId: subData.debtAssetId,
    baseToken: triggerData.baseTokenAddress,
    quoteToken: triggerData.quoteTokenAddress,
    price: triggerData.price,
    maximumGasPrice: triggerData.maximumGasPrice,
    ratioState: triggerData.ratioState,
  };

  const { ratioState } = getRatioStateInfoForAaveCloseStrategy(
    _position.specific.ratioState,
    wethToEthByAddress(_position.specific.collAsset, parseData.chainId),
    wethToEthByAddress(_position.specific.debtAsset, parseData.chainId),
    parseData.chainId,
  );

  _position.strategy.strategyId = isRatioStateOver(ratioState)
    ? Strategies.IdOverrides.TakeProfitWithGasPrice
    : Strategies.IdOverrides.StopLossWithGasPrice;

  return _position;
}

function parseCompoundV2LeverageManagement(position: Position.Automated, parseData: ParseData): Position.Automated {
  const _position = cloneDeep(position);

  const { subStruct, subId } = parseData.subscriptionEventData;
  const { isEnabled } = parseData.strategiesSubsData;

  const triggerData = triggerService.compoundV2RatioTrigger.decode(subStruct.triggerData);
  const subData = subDataService.compoundV2LeverageManagementSubData.decode(subStruct.subData);

  _position.strategyData.decoded.triggerData = triggerData;
  _position.strategyData.decoded.subData = subData;
  _position.owner = triggerData.owner.toLowerCase();

  _position.positionId = getPositionId(_position.chainId, _position.protocol.id, _position.owner);

  const isRepay = [Strategies.Identifiers.Repay, Strategies.Identifiers.EoaRepay].includes(_position.strategy.strategyId as Strategies.Identifiers);

  if (isRepay) {
    _position.specific = {
      triggerRepayRatio: triggerData.ratio,
      targetRepayRatio: subData.targetRatio,
      repayEnabled: true,
      subId1: Number(subId),
      mergeWithId: Strategies.Identifiers.Boost,
    };
  } else {
    _position.specific = {
      triggerBoostRatio: triggerData.ratio,
      targetBoostRatio: subData.targetRatio,
      boostEnabled: isEnabled,
      subId2: Number(subId),
      mergeId: Strategies.Identifiers.Boost,
    };
  }

  const isEOA = _position.strategy.strategyId.includes('eoa');
  _position.strategy.strategyId = isEOA ? Strategies.IdOverrides.EoaLeverageManagement : Strategies.IdOverrides.LeverageManagement;

  return _position;
}

function parseCompoundV3LeverageManagement(position: Position.Automated, parseData: ParseData): Position.Automated {
  const _position = cloneDeep(position);

  const { subStruct, subId } = parseData.subscriptionEventData;
  const { isEnabled } = parseData.strategiesSubsData;

  const subDataDecoder = position.chainId !== 1
    ? subDataService.compoundV3L2LeverageManagementSubData
    : subDataService.compoundV3LeverageManagementSubData;

  const triggerData = triggerService.compoundV3RatioTrigger.decode(subStruct.triggerData);
  const subData = subDataDecoder.decode(subStruct.subData);

  _position.strategyData.decoded.triggerData = triggerData;
  _position.strategyData.decoded.subData = subData;

  _position.positionId = getPositionId(_position.chainId, _position.protocol.id, triggerData.owner.toLowerCase(), triggerData.market);

  const isRepay = [Strategies.Identifiers.Repay, Strategies.Identifiers.EoaRepay].includes(_position.strategy.strategyId as Strategies.Identifiers);

  const isEOA = _position.strategy.strategyId.includes('eoa');

  if (isRepay) {
    _position.specific = {
      triggerRepayRatio: triggerData.ratio,
      targetRepayRatio: subData.targetRatio,
      repayEnabled: true,
      subId1: Number(subId),
      mergeWithId: isEOA ? Strategies.Identifiers.EoaBoost : Strategies.Identifiers.Boost,
    };
  } else {
    _position.specific = {
      triggerBoostRatio: triggerData.ratio,
      targetBoostRatio: subData.targetRatio,
      boostEnabled: isEnabled,
      subId2: Number(subId),
      mergeId: isEOA ? Strategies.Identifiers.EoaBoost : Strategies.Identifiers.Boost,
    };
  }

  _position.strategy.strategyId = isEOA ? Strategies.IdOverrides.EoaLeverageManagement : Strategies.IdOverrides.LeverageManagement;

  return _position;
}

function parseCompoundV3LeverageManagementOnPrice(position: Position.Automated, parseData: ParseData): Position.Automated {
  const _position = cloneDeep(position);

  const { subStruct } = parseData.subscriptionEventData;

  const triggerData = triggerService.compoundV3PriceTrigger.decode(subStruct.triggerData);
  const subData = subDataService.compoundV3LeverageManagementOnPriceSubData.decode(subStruct.subData);

  _position.strategyData.decoded.triggerData = triggerData;
  _position.strategyData.decoded.subData = subData;
  _position.positionId = getPositionId(_position.chainId, _position.protocol.id, triggerData.market, triggerData.user, Math.random());

  _position.specific = {
    market: subData.market,
    collToken: subData.collToken,
    baseToken: subData.baseToken,
    ratio: subData.targetRatio,
    price: triggerData.price,
    priceState: triggerData.priceState,
  };

  return _position;
}

function parseCompoundV3CloseOnPrice(position: Position.Automated, parseData: ParseData): Position.Automated {
  const _position = cloneDeep(position);

  const { subStruct } = parseData.subscriptionEventData;

  const triggerData = triggerService.compoundV3PriceRangeTrigger.decode(subStruct.triggerData);
  const subData = subDataService.compoundV3CloseSubData.decode(subStruct.subData);

  _position.strategyData.decoded.triggerData = triggerData;
  _position.strategyData.decoded.subData = subData;
  _position.positionId = getPositionId(_position.chainId, _position.protocol.id, triggerData.market, Math.random());

  const { takeProfitType, stopLossType } = getStopLossAndTakeProfitTypeByCloseStrategyType(+subData.closeType);
  const isEOA = _position.strategy.strategyId.includes('eoa');
  _position.strategy.strategyId = isEOA ? Strategies.Identifiers.EoaCloseOnPrice : Strategies.Identifiers.CloseOnPrice;

  _position.specific = {
    market: subData.market,
    collToken: subData.collToken,
    baseToken: subData.baseToken,
    stopLossPrice: triggerData.lowerPrice,
    takeProfitPrice: triggerData.upperPrice,
    takeProfitType,
    stopLossType,
  };

  return _position;
}

function parseChickenBondsRebond(position: Position.Automated, parseData: ParseData): Position.Automated {
  const _position = cloneDeep(position);

  const { subStruct } = parseData.subscriptionEventData;

  _position.strategyData.decoded.triggerData = triggerService.cBondsRebondTrigger.decode(subStruct.triggerData);
  _position.strategyData.decoded.subData = subDataService.cBondsRebondSubData.decode(subStruct.subData);

  _position.positionId = getPositionId(_position.chainId, _position.protocol.id, _position.strategyData.decoded.triggerData.bondId);

  return _position;
}

function parseLiquityBondProtection(position: Position.Automated, parseData: ParseData): Position.Automated {
  const _position = cloneDeep(position);

  const { subStruct } = parseData.subscriptionEventData;

  const triggerData = triggerService.liquityRatioTrigger.decode(subStruct.triggerData);

  _position.strategyData.decoded.triggerData = triggerData;
  _position.strategyData.decoded.subData = subDataService.liquityPaybackUsingChickenBondSubData.decode(subStruct.subData);

  _position.positionId = getPositionId(_position.chainId, _position.protocol.id, _position.owner);

  _position.specific = {
    triggerRepayRatio: Number(triggerData.ratio),
    targetRepayRatio: Infinity, // Unknown targetRepayRatio, uses all assets from chicken bond until trove min debt (2000LUSD)
    repayEnabled: true,
  };
  return _position;
}

function parseExchangeDca(position: Position.Automated, parseData: ParseData, chainId: ChainId): Position.Automated {
  const _position = cloneDeep(position);

  const { subStruct } = parseData.subscriptionEventData;

  _position.strategyData.decoded.triggerData = triggerService.exchangeTimestampTrigger.decode(subStruct.triggerData);
  _position.strategyData.decoded.subData = subDataService.exchangeDcaSubData.decode(subStruct.subData, chainId);

  _position.positionId = getPositionId(_position.chainId, _position.protocol.id, _position.owner, Math.random());

  return _position;
}

function parseExchangeLimitOrder(position: Position.Automated, parseData: ParseData, chainId: ChainId): Position.Automated {
  const _position = cloneDeep(position);

  const { subStruct } = parseData.subscriptionEventData;

  _position.strategyData.decoded.subData = subDataService.exchangeLimitOrderSubData.decode(subStruct.subData, chainId);
  const fromTokenDecimals = getAssetInfoByAddress(_position.strategyData.decoded.subData.fromToken, chainId).decimals;
  const toTokenDecimals = getAssetInfoByAddress(_position.strategyData.decoded.subData.toToken, chainId).decimals;
  _position.strategyData.decoded.triggerData = triggerService.exchangeOffchainPriceTrigger.decode(subStruct.triggerData, fromTokenDecimals, toTokenDecimals);

  _position.positionId = getPositionId(_position.chainId, _position.protocol.id, _position.owner, Math.random());

  return _position;
}

function parseLiquityLeverageManagement(position: Position.Automated, parseData: ParseData): Position.Automated {
  const _position = cloneDeep(position);

  const { subStruct, subId } = parseData.subscriptionEventData;
  const { isEnabled } = parseData.strategiesSubsData;

  const triggerData = triggerService.liquityRatioTrigger.decode(subStruct.triggerData);
  const subData = subDataService.liquityLeverageManagementSubData.decode(subStruct.subData);

  _position.strategyData.decoded.triggerData = triggerData;
  _position.strategyData.decoded.subData = subData;

  _position.positionId = getPositionId(_position.chainId, _position.protocol.id, _position.owner);

  const isRepay = _position.strategy.strategyId === Strategies.Identifiers.Repay;

  if (isRepay) {
    _position.specific = {
      triggerRepayRatio: triggerData.ratio,
      targetRepayRatio: subData.targetRatio,
      repayEnabled: true,
      subId1: Number(subId),
      mergeWithId: Strategies.Identifiers.Boost,
    };
  } else {
    _position.specific = {
      triggerBoostRatio: triggerData.ratio,
      targetBoostRatio: subData.targetRatio,
      boostEnabled: isEnabled,
      subId2: Number(subId),
      mergeId: Strategies.Identifiers.Boost,
    };
  }

  _position.strategy.strategyId = Strategies.IdOverrides.LeverageManagement;

  return _position;
}

function parseLiquityV2LeverageManagement(position: Position.Automated, parseData: ParseData): Position.Automated {
  const _position = cloneDeep(position);

  const { subStruct, subId, subHash } = parseData.subscriptionEventData;
  const { isEnabled } = parseData.strategiesSubsData;

  const triggerData = triggerService.liquityV2RatioTrigger.decode(subStruct.triggerData);
  const subData = subDataService.liquityV2LeverageManagementSubData.decode(subStruct.subData);

  _position.strategyData.decoded.triggerData = triggerData;
  _position.strategyData.decoded.subData = subData;

  _position.positionId = getPositionId(
    _position.chainId, _position.protocol.id, _position.owner, triggerData.troveId, triggerData.market,
  );

  const isRepay = _position.strategy.strategyId === Strategies.Identifiers.Repay;

  if (isRepay) {
    _position.specific = {
      triggerRepayRatio: triggerData.ratio,
      targetRepayRatio: subData.targetRatio,
      repayEnabled: isEnabled,
      subId1: Number(subId),
      subHashRepay: subHash,
      mergeWithId: Strategies.Identifiers.Boost,
    };
  } else {
    _position.specific = {
      triggerBoostRatio: triggerData.ratio,
      targetBoostRatio: subData.targetRatio,
      boostEnabled: isEnabled,
      subId2: Number(subId),
      subHashBoost: subHash,
      mergeId: Strategies.Identifiers.Boost,
    };
  }

  _position.strategy.strategyId = Strategies.IdOverrides.LeverageManagement;

  return _position;
}

function parseSparkLeverageManagement(position: Position.Automated, parseData: ParseData): Position.Automated {
  const _position = cloneDeep(position);

  const { subStruct, subId } = parseData.subscriptionEventData;
  const { isEnabled } = parseData.strategiesSubsData;

  const triggerData = triggerService.sparkRatioTrigger.decode(subStruct.triggerData);
  const subData = subDataService.sparkLeverageManagementSubData.decode(subStruct.subData);

  _position.strategyData.decoded.triggerData = triggerData;
  _position.strategyData.decoded.subData = subData;

  _position.positionId = getPositionId(_position.chainId, _position.protocol.id, _position.owner, triggerData.market);

  const isRepay = _position.strategy.strategyId === Strategies.Identifiers.Repay;

  if (isRepay) {
    _position.specific = {
      triggerRepayRatio: triggerData.ratio,
      targetRepayRatio: subData.targetRatio,
      repayEnabled: true,
      subId1: Number(subId),
      mergeWithId: Strategies.Identifiers.Boost,
    };
  } else {
    _position.specific = {
      triggerBoostRatio: triggerData.ratio,
      targetBoostRatio: subData.targetRatio,
      boostEnabled: isEnabled,
      subId2: Number(subId),
      mergeId: Strategies.Identifiers.Boost,
    };
  }

  _position.strategy.strategyId = Strategies.IdOverrides.LeverageManagement;

  return _position;
}

function parseSparkCloseOnPrice(position: Position.Automated, parseData: ParseData): Position.Automated {
  const _position = cloneDeep(position);

  const { subStruct } = parseData.subscriptionEventData;

  const triggerData = triggerService.sparkQuotePriceTrigger.decode(subStruct.triggerData);
  const subData = subDataService.sparkQuotePriceSubData.decode(subStruct.subData);

  _position.strategyData.decoded.triggerData = triggerData;
  _position.strategyData.decoded.subData = subData;

  _position.positionId = getPositionId(_position.chainId, _position.protocol.id, _position.owner, SPARK_MARKET_ADDRESSES[_position.chainId as ChainId.Ethereum]);

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
    wethToEthByAddress(_position.specific.collAsset, parseData.chainId),
    wethToEthByAddress(_position.specific.debtAsset, parseData.chainId),
    parseData.chainId,
  );

  _position.strategy.strategyId = isRatioStateOver(ratioState) ? Strategies.IdOverrides.TakeProfit : Strategies.IdOverrides.StopLoss;

  return _position;
}

function parseLiquitySavingsLiqProtection(position: Position.Automated, parseData: ParseData): Position.Automated {
  const _position = cloneDeep(position);

  const { subStruct } = parseData.subscriptionEventData;

  const triggerData = triggerService.liquityRatioTrigger.decode(subStruct.triggerData);
  const subData = subDataService.liquityRepayFromSavingsSubData.decode(subStruct.subData);

  _position.strategyData.decoded.triggerData = triggerData;
  _position.strategyData.decoded.subData = subData;

  _position.positionId = getPositionId(_position.chainId, _position.protocol.id, _position.owner);

  _position.specific = {
    triggerRepayRatio: triggerData.ratio,
    targetRepayRatio: subData.targetRatio,
    repayEnabled: true,
    boostEnabled: false,
  };

  return _position;
}

function parseLiquityDebtInFrontRepay(position: Position.Automated, parseData: ParseData): Position.Automated {
  const _position = cloneDeep(position);

  const { subStruct } = parseData.subscriptionEventData;

  const triggerData = triggerService.liquityDebtInFrontWithLimitTrigger.decode(subStruct.triggerData);
  const subData = subDataService.liquityDebtInFrontRepaySubData.decode(subStruct.subData);

  _position.strategyData.decoded.triggerData = triggerData;
  _position.strategyData.decoded.subData = subData;

  _position.positionId = getPositionId(_position.chainId, _position.protocol.id, _position.owner);

  _position.specific = {
    debtInFrontMin: triggerData.debtInFrontMin,
    targetRepayRatioIncrease: subData.targetRatioIncrease,
  };

  return _position;
}

function parseCrvUSDLeverageManagement(position: Position.Automated, parseData: ParseData): Position.Automated {
  const _position = cloneDeep(position);

  const { subStruct, subId, subHash } = parseData.subscriptionEventData;
  const { isEnabled } = parseData.strategiesSubsData;
  const triggerData = triggerService.crvUSDRatioTrigger.decode(subStruct.triggerData);
  const subData = subDataService.crvUSDLeverageManagementSubData.decode(subStruct.subData);

  _position.strategyData.decoded.triggerData = triggerData;
  _position.strategyData.decoded.subData = subData;

  _position.positionId = getPositionId(_position.chainId, _position.protocol.id, _position.owner, triggerData.controller);

  const isRepay = _position.strategy.strategyId === Strategies.Identifiers.Repay;

  if (isRepay) {
    _position.specific = {
      triggerRepayRatio: triggerData.ratio,
      targetRepayRatio: subData.targetRatio,
      repayEnabled: isEnabled,
      subId1: Number(subId),
      subHashRepay: subHash,
      mergeWithId: Strategies.Identifiers.Boost,
    };
  } else {
    _position.specific = {
      triggerBoostRatio: triggerData.ratio,
      targetBoostRatio: subData.targetRatio,
      boostEnabled: isEnabled,
      subId2: Number(subId),
      subHashBoost: subHash,
      mergeId: Strategies.Identifiers.Boost,
    };
  }

  _position.strategy.strategyId = Strategies.IdOverrides.LeverageManagement;

  return _position;
}

function parseCrvUSDPayback(position: Position.Automated, parseData: ParseData): Position.Automated {
  const _position = cloneDeep(position);

  const { subStruct } = parseData.subscriptionEventData;
  const triggerData = triggerService.crvUsdHealthRatioTrigger.decode(subStruct.triggerData);
  const subData = subDataService.crvUSDPaybackSubData.decode(subStruct.subData);

  _position.strategyData.decoded.triggerData = triggerData;
  _position.strategyData.decoded.subData = subData;
  _position.positionId = getPositionId(_position.chainId, _position.protocol.id, _position.owner, triggerData.controller, Math.random());
  _position.strategy.strategyId = Strategies.Identifiers.Payback;

  return _position;
}

function parseMorphoBlueLeverageManagement(position: Position.Automated, parseData: ParseData): Position.Automated {
  const _position = cloneDeep(position);

  const { subStruct, subId, subHash } = parseData.subscriptionEventData;
  const { isEnabled } = parseData.strategiesSubsData;
  const triggerData = triggerService.morphoBlueRatioTrigger.decode(subStruct.triggerData);
  const subData = subDataService.morphoBlueLeverageManagementSubData.decode(subStruct.subData);

  _position.strategyData.decoded.triggerData = triggerData;
  _position.strategyData.decoded.subData = subData;

  _position.positionId = getPositionId(_position.chainId, _position.protocol.id, triggerData.owner.toLowerCase(), triggerData.marketId);

  const isRepay = [Strategies.Identifiers.Repay, Strategies.Identifiers.EoaRepay].includes(_position.strategy.strategyId as Strategies.Identifiers);

  if (isRepay) {
    _position.specific = {
      triggerRepayRatio: triggerData.ratio,
      targetRepayRatio: subData.targetRatio,
      repayEnabled: isEnabled,
      subId1: Number(subId),
      subHashRepay: subHash,
      mergeWithId: Strategies.Identifiers.Boost,
    };
  } else {
    _position.specific = {
      triggerBoostRatio: triggerData.ratio,
      targetBoostRatio: subData.targetRatio,
      boostEnabled: isEnabled,
      subId2: Number(subId),
      subHashBoost: subHash,
      mergeId: Strategies.Identifiers.Boost,
    };
  }

  const isEOA = _position.strategy.strategyId.includes('eoa');
  _position.strategy.strategyId = isEOA ? Strategies.IdOverrides.EoaLeverageManagement : Strategies.IdOverrides.LeverageManagement;


  return _position;
}

function parseMorphoBlueLeverageManagementOnPrice(position: Position.Automated, parseData: ParseData): Position.Automated {
  const _position = cloneDeep(position);

  const { subStruct } = parseData.subscriptionEventData;
  const triggerData = triggerService.morphoBluePriceTrigger.decode(subStruct.triggerData);
  const subData = subDataService.morphoBlueLeverageManagementOnPriceSubData.decode(subStruct.subData);

  _position.strategyData.decoded.triggerData = triggerData;
  _position.strategyData.decoded.subData = subData;
  _position.positionId = getPositionId(_position.chainId, _position.protocol.id, _position.owner, Math.random());

  const marketIdEncodedData = web3.eth.abi.encodeParameters(
    ['address', 'address', 'address', 'address', 'uint256'],
    [
      subData.loanToken,
      subData.collToken,
      subData.oracle,
      subData.irm,
      subData.lltv,
    ],
  );

  const marketId = web3.utils.keccak256(marketIdEncodedData);

  _position.specific = {
    subHash: _position.subHash,
    marketId,
    collAsset: subData.collToken,
    debtAsset: subData.loanToken,
    price: triggerData.price,
    ratio: subData.targetRatio,
  };

  return _position;
}

function parseLiquityV2CloseOnPrice(position: Position.Automated, parseData: ParseData): Position.Automated {
  const _position = cloneDeep(position);

  const { subStruct } = parseData.subscriptionEventData;

  const triggerData = triggerService.closePriceTrigger.decode(subStruct.triggerData);
  const subData = subDataService.liquityV2CloseSubData.decode(subStruct.subData);

  _position.strategyData.decoded.triggerData = triggerData;
  _position.strategyData.decoded.subData = subData;

  _position.positionId = getPositionId(
    _position.chainId, _position.protocol.id, _position.owner, subData.troveId, subData.market,
  );

  const { takeProfitType, stopLossType } = getStopLossAndTakeProfitTypeByCloseStrategyType(+subData.closeType);

  // User can have:
  // - Only TakeProfit
  // - Only StopLoss
  // - Both
  _position.strategy.strategyId = Strategies.Identifiers.CloseOnPrice;
  _position.specific = {
    market: subData.market,
    troveId: subData.troveId,
    stopLossPrice: triggerData.lowerPrice,
    takeProfitPrice: triggerData.upperPrice,
    closeToAssetAddr: triggerData.tokenAddr,
    takeProfitType,
    stopLossType,
  };

  return _position;
}

function parseLiquityV2LeverageManagementOnPrice(position: Position.Automated, parseData: ParseData): Position.Automated {
  const _position = cloneDeep(position);

  const { subStruct } = parseData.subscriptionEventData;

  const triggerData = triggerService.liquityV2QuotePriceTrigger.decode(subStruct.triggerData);
  const subData = subDataService.liquityV2LeverageManagementOnPriceSubData.decode(subStruct.subData);

  _position.strategyData.decoded.triggerData = triggerData;
  _position.strategyData.decoded.subData = subData;
  _position.positionId = getPositionId(_position.chainId, _position.protocol.id, _position.owner, Math.random());

  _position.specific = {
    subHash: _position.subHash,
    market: subData.market,
    troveId: subData.troveId,
    collAsset: subData.collToken,
    debtAsset: subData.boldToken,
    price: triggerData.price,
    ratio: subData.targetRatio,
    ratioState: triggerData.ratioState,
  };

  return _position;
}

function parseLiquityV2Payback(position: Position.Automated, parseData: ParseData): Position.Automated {
  const _position = cloneDeep(position);

  const { subStruct } = parseData.subscriptionEventData;
  const triggerData = triggerService.liquityV2RatioTrigger.decode(subStruct.triggerData);
  const subData = subDataService.liquityV2PaybackSubData.decode(subStruct.subData);

  _position.strategyData.decoded.triggerData = triggerData;
  _position.strategyData.decoded.subData = subData;
  _position.positionId = getPositionId(_position.chainId, _position.protocol.id, _position.owner, triggerData.troveId, triggerData.market);
  _position.strategy.strategyId = Strategies.Identifiers.Payback;

  _position.specific = {
    subHash: _position.subHash,
    market: subData.market,
    troveId: subData.troveId,
    targetRatio: subData.targetRatio,
    triggerRatio: triggerData.ratio,
  };

  return _position;
}

function parseFluidT1LeverageManagement(position: Position.Automated, parseData: ParseData): Position.Automated {
  const _position = cloneDeep(position);

  const { subStruct, subId, subHash } = parseData.subscriptionEventData;
  const { isEnabled } = parseData.strategiesSubsData;

  const triggerData = triggerService.fluidRatioTrigger.decode(subStruct.triggerData);
  const subData = subDataService.fluidLeverageManagementSubData.decode(subStruct.subData);

  _position.strategyData.decoded.triggerData = triggerData;
  _position.strategyData.decoded.subData = subData;

  _position.positionId = getPositionId(
    _position.chainId, _position.protocol.id, _position.owner, triggerData.nftId, subData.vault,
  );

  const isRepay = _position.strategy.strategyId === Strategies.Identifiers.Repay;

  if (isRepay) {
    _position.specific = {
      triggerRepayRatio: triggerData.ratio,
      targetRepayRatio: subData.targetRatio,
      repayEnabled: isEnabled,
      subId1: Number(subId),
      subHashRepay: subHash,
      mergeWithId: Strategies.Identifiers.Boost,
    };
  } else {
    _position.specific = {
      triggerBoostRatio: triggerData.ratio,
      targetBoostRatio: subData.targetRatio,
      boostEnabled: isEnabled,
      subId2: Number(subId),
      subHashBoost: subHash,
      mergeId: Strategies.Identifiers.Boost,
    };
  }

  _position.strategy.strategyId = Strategies.IdOverrides.LeverageManagement;

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
    [Strategies.Identifiers.Repay]: parseLiquityLeverageManagement,
    [Strategies.Identifiers.Boost]: parseLiquityLeverageManagement,
    [Strategies.Identifiers.SavingsDsrPayback]: parseLiquitySavingsLiqProtection,
    [Strategies.Identifiers.SavingsDsrSupply]: parseLiquitySavingsLiqProtection,
    [Strategies.Identifiers.DebtInFrontRepay]: parseLiquityDebtInFrontRepay,
  },
  [ProtocolIdentifiers.StrategiesAutomation.LiquityV2]: {
    [Strategies.Identifiers.Repay]: parseLiquityV2LeverageManagement,
    [Strategies.Identifiers.Boost]: parseLiquityV2LeverageManagement,
    [Strategies.Identifiers.CloseOnPrice]: parseLiquityV2CloseOnPrice,
    [Strategies.Identifiers.BoostOnPrice]: parseLiquityV2LeverageManagementOnPrice,
    [Strategies.Identifiers.RepayOnPrice]: parseLiquityV2LeverageManagementOnPrice,
    [Strategies.Identifiers.Payback]: parseLiquityV2Payback,
  },
  [ProtocolIdentifiers.StrategiesAutomation.AaveV2]: {
    [Strategies.Identifiers.Repay]: parseAaveV2LeverageManagement,
    [Strategies.Identifiers.Boost]: parseAaveV2LeverageManagement,
  },
  [ProtocolIdentifiers.StrategiesAutomation.AaveV3]: {
    [Strategies.Identifiers.Repay]: parseAaveV3LeverageManagement,
    [Strategies.Identifiers.Boost]: parseAaveV3LeverageManagement,
    [Strategies.Identifiers.CloseToDebt]: parseAaveV3CloseOnPrice,
    [Strategies.Identifiers.CloseToDebtWithGasPrice]: parseAaveV3CloseOnPriceWithMaximumGasPrice,
    [Strategies.Identifiers.CloseToCollateral]: parseAaveV3CloseOnPrice,
    [Strategies.Identifiers.CloseToCollateralWithGasPrice]: parseAaveV3CloseOnPriceWithMaximumGasPrice,
    [Strategies.Identifiers.OpenOrderFromCollateral]: parseAaveV3LeverageManagementOnPrice,
    [Strategies.Identifiers.RepayOnPrice]: parseAaveV3LeverageManagementOnPrice,
    [Strategies.Identifiers.EoaRepay]: parseAaveV3LeverageManagement,
    [Strategies.Identifiers.EoaBoost]: parseAaveV3LeverageManagement,
    [Strategies.Identifiers.EoaRepayOnPrice]: parseAaveV3LeverageManagementOnPrice,
    [Strategies.Identifiers.EoaBoostOnPrice]: parseAaveV3LeverageManagementOnPrice,
    [Strategies.Identifiers.EoaCloseOnPrice]: parseAaveV3CloseOnPrice,
  },
  [ProtocolIdentifiers.StrategiesAutomation.CompoundV2]: {
    [Strategies.Identifiers.Repay]: parseCompoundV2LeverageManagement,
    [Strategies.Identifiers.Boost]: parseCompoundV2LeverageManagement,
  },
  [ProtocolIdentifiers.StrategiesAutomation.CompoundV3]: {
    [Strategies.Identifiers.Repay]: parseCompoundV3LeverageManagement,
    [Strategies.Identifiers.Boost]: parseCompoundV3LeverageManagement,
    [Strategies.Identifiers.EoaRepay]: parseCompoundV3LeverageManagement,
    [Strategies.Identifiers.EoaBoost]: parseCompoundV3LeverageManagement,
    [Strategies.Identifiers.RepayOnPrice]: parseCompoundV3LeverageManagementOnPrice,
    [Strategies.Identifiers.BoostOnPrice]: parseCompoundV3LeverageManagementOnPrice,
    [Strategies.Identifiers.EoaRepayOnPrice]: parseCompoundV3LeverageManagementOnPrice,
    [Strategies.Identifiers.EoaBoostOnPrice]: parseCompoundV3LeverageManagementOnPrice,
    [Strategies.Identifiers.CloseOnPrice]: parseCompoundV3CloseOnPrice,
    [Strategies.Identifiers.EoaCloseOnPrice]: parseCompoundV3CloseOnPrice,
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
  [ProtocolIdentifiers.StrategiesAutomation.Spark]: {
    [Strategies.Identifiers.Repay]: parseSparkLeverageManagement,
    [Strategies.Identifiers.Boost]: parseSparkLeverageManagement,
    [Strategies.Identifiers.CloseToDebt]: parseSparkCloseOnPrice,
    [Strategies.Identifiers.CloseToCollateral]: parseSparkCloseOnPrice,
  },
  [ProtocolIdentifiers.StrategiesAutomation.CrvUSD]: {
    [Strategies.Identifiers.Repay]: parseCrvUSDLeverageManagement,
    [Strategies.Identifiers.Boost]: parseCrvUSDLeverageManagement,
    [Strategies.Identifiers.Payback]: parseCrvUSDPayback,
  },
  [ProtocolIdentifiers.StrategiesAutomation.MorphoBlue]: {
    [Strategies.Identifiers.Repay]: parseMorphoBlueLeverageManagement,
    [Strategies.Identifiers.Boost]: parseMorphoBlueLeverageManagement,
    [Strategies.Identifiers.EoaRepay]: parseMorphoBlueLeverageManagement,
    [Strategies.Identifiers.EoaBoost]: parseMorphoBlueLeverageManagement,
    [Strategies.Identifiers.BoostOnPrice]: parseMorphoBlueLeverageManagementOnPrice,
  },
  [ProtocolIdentifiers.StrategiesAutomation.FluidT1]: {
    [Strategies.Identifiers.Repay]: parseFluidT1LeverageManagement,
    [Strategies.Identifiers.Boost]: parseFluidT1LeverageManagement,
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

  const id = subStruct.strategyOrBundleId as unknown as StrategyOrBundleIds;

  const strategyOrBundleInfo = (
    subStruct.isBundle
      ? BUNDLES_INFO[chainId][id as keyof BundleInfoUnion]
      : STRATEGIES_INFO[chainId][id as keyof StrategyInfoUnion]
  ) as BundleOrStrategy;

  if (!strategyOrBundleInfo) return null;

  const position: Position.Automated = {
    isEnabled,
    chainId,
    subHash,
    blockNumber,
    positionId: 'positionId parsing not implemented.',
    subId: Number(subId),
    owner: proxy.toLowerCase(),
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
