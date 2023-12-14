import Dec from 'decimal.js';
import { getAssetInfo } from '@defisaver/tokens';

import type { OrderType } from '../types/enums';
import {
  Bundles, ChainId, RatioState, Strategies,
} from '../types/enums';
import type { EthereumAddress, StrategyOrBundleIds } from '../types';

import { STRATEGY_IDS } from '../constants';

import * as subDataService from './subDataService';
import * as triggerService from './triggerService';
import { compareAddresses, requireAddress, requireAddresses } from './utils';

export const makerEncode = {
  repayFromSavings(
    bundleId: StrategyOrBundleIds,
    vaultId: number,
    triggerRepayRatio: number,
    targetRepayRatio: number,
    isBundle: boolean = true,
    chainId: ChainId = ChainId.Ethereum,
    daiAddr?: EthereumAddress,
    mcdCdpManagerAddr?: EthereumAddress,
  ) {
    const subData = subDataService.makerRepayFromSavingsSubData.encode(vaultId, targetRepayRatio, chainId, daiAddr, mcdCdpManagerAddr);
    const triggerData = triggerService.makerRatioTrigger.encode(vaultId, triggerRepayRatio, RatioState.UNDER);

    return [bundleId, isBundle, triggerData, subData];
  },
  closeOnPrice(
    vaultId: number,
    ratioState: RatioState,
    price: string,
    closeToAssetAddr: EthereumAddress,
    chainlinkCollAddress: EthereumAddress,
    chainId: ChainId = ChainId.Ethereum,
    daiAddr?: EthereumAddress,
    mcdCdpManagerAddr?: EthereumAddress,
  ) {
    requireAddresses([closeToAssetAddr, chainlinkCollAddress]);

    const subData = subDataService.makerCloseSubData.encode(vaultId, closeToAssetAddr, chainId, daiAddr, mcdCdpManagerAddr);
    const triggerData = triggerService.chainlinkPriceTrigger.encode(chainlinkCollAddress, price, ratioState);

    const strategyOrBundleId = compareAddresses(closeToAssetAddr, getAssetInfo('DAI', chainId).address)
      ? Strategies.MainnetIds.MAKER_CLOSE_ON_PRICE_TO_DAI
      : Strategies.MainnetIds.MAKER_CLOSE_ON_PRICE_TO_COLL;

    const isBundle = false;

    return [strategyOrBundleId, isBundle, triggerData, subData];
  },
  trailingStop(
    vaultId: number,
    triggerPercentage: number,
    closeToAssetAddr: EthereumAddress,
    chainlinkCollAddress: EthereumAddress,
    roundId: number,
    chainId: ChainId = ChainId.Ethereum,
    daiAddr?: EthereumAddress,
    mcdCdpManagerAddr?: EthereumAddress,
  ) {
    requireAddresses([closeToAssetAddr, chainlinkCollAddress]);

    const subData = subDataService.makerCloseSubData.encode(vaultId, closeToAssetAddr, chainId, daiAddr, mcdCdpManagerAddr);
    const triggerData = triggerService.trailingStopTrigger.encode(chainlinkCollAddress, triggerPercentage, roundId);

    const strategyOrBundleId = compareAddresses(closeToAssetAddr, getAssetInfo('DAI', chainId).address)
      ? Strategies.MainnetIds.MAKER_TRAILING_STOP_LOSS_TO_DAI
      : Strategies.MainnetIds.MAKER_TRAILING_STOP_LOSS_TO_COLL;

    const isBundle = false;

    return [strategyOrBundleId, isBundle, triggerData, subData];
  },
  leverageManagement(
    vaultId: number,
    triggerRepayRatio: string,
    triggerBoostRatio: string,
    targetBoostRatio: string,
    targetRepayRatio: string,
    boostEnabled: boolean,
  ) {
    return [
      vaultId,
      new Dec(triggerRepayRatio).mul(1e16).toString(),
      new Dec(triggerBoostRatio).mul(1e16).toString(),
      new Dec(targetBoostRatio).mul(1e16).toString(),
      new Dec(targetRepayRatio).mul(1e16).toString(),
      boostEnabled,
    ];
  },
};

export const liquityEncode = {
  closeOnPrice(
    priceOverOrUnder: RatioState,
    price: string,
    closeToAssetAddr: EthereumAddress,
    chainlinkCollAddress: EthereumAddress,
    chainId: ChainId = ChainId.Ethereum,
    collAddr?: EthereumAddress,
    debtAddr?: EthereumAddress,
  ) {
    requireAddresses([closeToAssetAddr, chainlinkCollAddress]);

    const subData = subDataService.liquityCloseSubData.encode(closeToAssetAddr, chainId, collAddr, debtAddr);
    const triggerData = triggerService.chainlinkPriceTrigger.encode(chainlinkCollAddress, price, priceOverOrUnder);

    const strategyOrBundleId = Strategies.MainnetIds.LIQUITY_CLOSE_ON_PRICE_TO_COLL;

    const isBundle = false;

    return [strategyOrBundleId, isBundle, triggerData, subData];
  },
  trailingStop(
    triggerPercentage: number,
    closeToAssetAddr: EthereumAddress,
    chainlinkCollAddress: EthereumAddress,
    roundId: number,
    chainId: ChainId = ChainId.Ethereum,
    collAddr?: EthereumAddress,
    debtAddr?: EthereumAddress,
  ) {
    requireAddresses([closeToAssetAddr, chainlinkCollAddress]);

    const subData = subDataService.liquityCloseSubData.encode(closeToAssetAddr, chainId, collAddr, debtAddr);
    const triggerData = triggerService.trailingStopTrigger.encode(chainlinkCollAddress, triggerPercentage, roundId);

    const strategyOrBundleId = Strategies.MainnetIds.LIQUITY_TRAILING_STOP_LOSS_TO_COLL;

    const isBundle = false;

    return [strategyOrBundleId, isBundle, triggerData, subData];
  },
  paybackFromChickenBondStrategySub(
    proxyAddress: EthereumAddress,
    ratio: number,
    sourceId: string,
    sourceType: number,
    ratioState: RatioState = RatioState.UNDER,
  ) {
    requireAddress(proxyAddress);
    const subData = subDataService.liquityPaybackUsingChickenBondSubData.encode(sourceId, sourceType);
    const triggerData = triggerService.liquityRatioTrigger.encode(proxyAddress, ratio, ratioState);

    const strategyId = Bundles.MainnetIds.LIQUITY_PAYBACK_USING_CHICKEN_BOND;

    const isBundle = true;

    return [strategyId, isBundle, triggerData, subData];
  },
  leverageManagement(
    triggerRepayRatio:string,
    triggerBoostRatio:string,
    targetBoostRatio:string,
    targetRepayRatio:string,
    boostEnabled:boolean,
  ) {
    return [
      new Dec(triggerRepayRatio).mul(1e16).toString(),
      new Dec(triggerBoostRatio).mul(1e16).toString(),
      new Dec(targetBoostRatio).mul(1e16).toString(),
      new Dec(targetRepayRatio).mul(1e16).toString(),
      boostEnabled,
    ];
  },
  dsrPayback(
    proxyAddress: EthereumAddress,
    triggerRatio: number,
    targetRatio: number,
  ) {
    requireAddress(proxyAddress);
    const subData = subDataService.liquityDsrPaybackSubData.encode(targetRatio);
    const triggerData = triggerService.liquityRatioTrigger.encode(proxyAddress, triggerRatio, RatioState.UNDER);

    const strategyOrBundleId = Strategies.MainnetIds.LIQUITY_DSR_PAYBACK;

    const isBundle = false;

    return [strategyOrBundleId, isBundle, triggerData, subData];
  },
  dsrSupply(
    proxyAddress: EthereumAddress,
    triggerRatio: number,
    targetRatio: number,
  ) {
    requireAddress(proxyAddress);
    const subData = subDataService.liquityDsrSupplySubData.encode(targetRatio);
    const triggerData = triggerService.liquityRatioTrigger.encode(proxyAddress, triggerRatio, RatioState.UNDER);

    const strategyOrBundleId = Strategies.MainnetIds.LIQUITY_DSR_SUPPLY;

    const isBundle = false;

    return [strategyOrBundleId, isBundle, triggerData, subData];
  },
  debtInFrontRepay(
    proxyAddress: EthereumAddress,
    debtInFrontMin: string,
    targetRatioIncrease: number,
  ) {
    requireAddress(proxyAddress);
    const subData = subDataService.liquityDebtInFrontRepaySubData.encode(targetRatioIncrease);
    const triggerData = triggerService.liquityDebtInFrontWithLimitTrigger.encode(proxyAddress, debtInFrontMin);

    const strategyOrBundleId = Strategies.MainnetIds.LIQUITY_DEBT_IN_FRONT_REPAY;

    const isBundle = false;

    return [strategyOrBundleId, isBundle, triggerData, subData];
  },
};

export const chickenBondsEncode = {
  rebond(bondId: number) {
    return subDataService.cBondsRebondSubData.encode(bondId);
  },
};

export const aaveV2Encode = {
  leverageManagement(
    triggerRepayRatio: number,
    triggerBoostRatio: number,
    targetBoostRatio: number,
    targetRepayRatio: number,
    boostEnabled: boolean,
  ) {
    return subDataService.aaveV2LeverageManagementSubData.encode(triggerRepayRatio, triggerBoostRatio, targetBoostRatio, targetRepayRatio, boostEnabled);
  },
};

export const aaveV3Encode = {
  leverageManagement(
    triggerRepayRatio: number,
    triggerBoostRatio: number,
    targetBoostRatio: number,
    targetRepayRatio: number,
    boostEnabled: boolean,
  ) {
    let subInput = '0x';

    subInput = subInput.concat(new Dec(triggerRepayRatio).mul(1e16).toHex().slice(2)
      .padStart(32, '0'));
    subInput = subInput.concat(new Dec(triggerBoostRatio).mul(1e16).toHex().slice(2)
      .padStart(32, '0'));
    subInput = subInput.concat(new Dec(targetBoostRatio).mul(1e16).toHex().slice(2)
      .padStart(32, '0'));
    subInput = subInput.concat(new Dec(targetRepayRatio).mul(1e16).toHex().slice(2)
      .padStart(32, '0'));
    subInput = subInput.concat(boostEnabled ? '01' : '00');

    return subInput;
  },
  closeToAsset(
    strategyOrBundleId: number,
    isBundle: boolean = true,
    triggerData: {
      baseTokenAddress: EthereumAddress, quoteTokenAddress: EthereumAddress, price: number, ratioState: RatioState
    },
    subData: {
      collAsset: EthereumAddress, collAssetId: number, debtAsset: EthereumAddress, debtAssetId: number,
    },
  ) {
    const {
      collAsset, collAssetId, debtAsset, debtAssetId,
    } = subData;
    const subDataEncoded = subDataService.aaveV3QuotePriceSubData.encode(collAsset, collAssetId, debtAsset, debtAssetId);

    const {
      baseTokenAddress, quoteTokenAddress, price, ratioState,
    } = triggerData;
    const triggerDataEncoded = triggerService.aaveV3QuotePriceTrigger.encode(baseTokenAddress, quoteTokenAddress, price, ratioState);

    return [strategyOrBundleId, isBundle, triggerDataEncoded, subDataEncoded];
  },
  closeToAssetWithMaximumGasPrice(
    strategyOrBundleId: number,
    isBundle: boolean = true,
    triggerData: {
      baseTokenAddress: EthereumAddress, quoteTokenAddress: EthereumAddress, price: number, ratioState: RatioState, maximumGasPrice: number
    },
    subData: {
      collAsset: EthereumAddress, collAssetId: number, debtAsset: EthereumAddress, debtAssetId: number,
    },
  ) {
    const {
      collAsset, collAssetId, debtAsset, debtAssetId,
    } = subData;
    const subDataEncoded = subDataService.aaveV3QuotePriceSubData.encode(collAsset, collAssetId, debtAsset, debtAssetId);

    const {
      baseTokenAddress, quoteTokenAddress, price, maximumGasPrice, ratioState,
    } = triggerData;
    const triggerDataEncoded = triggerService.aaveV3QuotePriceWithMaximumGasPriceTrigger.encode(baseTokenAddress, quoteTokenAddress, price, ratioState, maximumGasPrice);

    return [strategyOrBundleId, isBundle, triggerDataEncoded, subDataEncoded];
  },
};

export const compoundV2Encode = {
  leverageManagement(
    triggerRepayRatio: number,
    triggerBoostRatio: number,
    targetBoostRatio: number,
    targetRepayRatio: number,
    boostEnabled: boolean,
  ) {
    return subDataService.compoundV2LeverageManagementSubData.encode(triggerRepayRatio, triggerBoostRatio, targetBoostRatio, targetRepayRatio, boostEnabled);
  },
};

export const compoundV3Encode = {
  leverageManagement(
    market: EthereumAddress,
    baseToken: EthereumAddress,
    triggerRepayRatio: number,
    triggerBoostRatio: number,
    targetBoostRatio: number,
    targetRepayRatio: number,
    boostEnabled: boolean,
    isEOA: boolean,
  ) {
    return subDataService.compoundV3LeverageManagementSubData.encode(market, baseToken, triggerRepayRatio, triggerBoostRatio, targetBoostRatio, targetRepayRatio, boostEnabled, isEOA);
  },
};

export const morphoAaveV2Encode = {
  leverageManagement(
    triggerRepayRatio: number,
    triggerBoostRatio: number,
    targetBoostRatio: number,
    targetRepayRatio: number,
    boostEnabled: boolean,
  ) {
    return subDataService.morphoAaveV2LeverageManagementSubData.encode(triggerRepayRatio, triggerBoostRatio, targetBoostRatio, targetRepayRatio, boostEnabled);
  },
};

export const exchangeEncode = {
  dca(
    fromToken: EthereumAddress,
    toToken: EthereumAddress,
    amount: string,
    timestamp: number,
    interval: number,
    network: ChainId,
  ) {
    requireAddresses([fromToken, toToken]);
    const subData = subDataService.exchangeDcaSubData.encode(fromToken, toToken, amount, interval);
    const triggerData = triggerService.exchangeTimestampTrigger.encode(timestamp, interval);

    const strategyId = STRATEGY_IDS[network].EXCHANGE_DCA;

    return [strategyId, false, triggerData, subData];
  },
  limitOrder(
    fromToken: EthereumAddress,
    toToken: EthereumAddress,
    amount: string,
    targetPrice: string,
    goodUntil: string | number,
    orderType: OrderType,
  ) {
    return subDataService.exchangeLimitOrderSubData.encode(fromToken, toToken, amount, targetPrice, goodUntil, orderType);
  },
};

export const sparkEncode = {
  leverageManagement(
    triggerRepayRatio: number,
    triggerBoostRatio: number,
    targetBoostRatio: number,
    targetRepayRatio: number,
    boostEnabled: boolean,
  ) {
    let subInput = '0x';

    subInput = subInput.concat(new Dec(triggerRepayRatio).mul(1e16).toHex().slice(2)
      .padStart(32, '0'));
    subInput = subInput.concat(new Dec(triggerBoostRatio).mul(1e16).toHex().slice(2)
      .padStart(32, '0'));
    subInput = subInput.concat(new Dec(targetBoostRatio).mul(1e16).toHex().slice(2)
      .padStart(32, '0'));
    subInput = subInput.concat(new Dec(targetRepayRatio).mul(1e16).toHex().slice(2)
      .padStart(32, '0'));
    subInput = subInput.concat(boostEnabled ? '01' : '00');

    return subInput;
  },
  closeToAsset(
    strategyOrBundleId: number,
    isBundle: boolean = true,
    triggerData: {
      baseTokenAddress: EthereumAddress, quoteTokenAddress: EthereumAddress, price: number, ratioState: RatioState
    },
    subData: {
      collAsset: EthereumAddress, collAssetId: number, debtAsset: EthereumAddress, debtAssetId: number,
    },
  ) {
    const {
      collAsset, collAssetId, debtAsset, debtAssetId,
    } = subData;
    const subDataEncoded = subDataService.sparkQuotePriceSubData.encode(collAsset, collAssetId, debtAsset, debtAssetId);

    const {
      baseTokenAddress, quoteTokenAddress, price, ratioState,
    } = triggerData;
    const triggerDataEncoded = triggerService.sparkQuotePriceTrigger.encode(baseTokenAddress, quoteTokenAddress, price, ratioState);

    return [strategyOrBundleId, isBundle, triggerDataEncoded, subDataEncoded];
  },
};

export const crvUSDEncode = {
  leverageManagement(
    owner: EthereumAddress,
    controllerAddr: EthereumAddress,
    ratioState: RatioState,
    targetRatio: number,
    triggerRatio: number,
    collTokenAddr: EthereumAddress,
    crvUSDAddr: EthereumAddress,
  ) {
    const subData = subDataService.crvUSDLeverageManagementSubData.encode(controllerAddr, ratioState, targetRatio, collTokenAddr, crvUSDAddr);
    const triggerData = triggerService.crvUSDRatioTrigger.encode(owner, controllerAddr, triggerRatio, ratioState);

    // over is boost, under is repay
    const strategyOrBundleId = ratioState === RatioState.OVER ? Bundles.MainnetIds.CRVUSD_BOOST : Bundles.MainnetIds.CRVUSD_REPAY;
    const isBundle = true;

    return [strategyOrBundleId, isBundle, triggerData, subData];
  },
};
