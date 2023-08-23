import Dec from 'decimal.js';
import { getAssetInfo } from '@defisaver/tokens';

import {
  Bundles, ChainId, RatioState, Strategies,
} from '../types/enums';
import type { EthereumAddress, StrategyOrBundleIds } from '../types';

import * as subDataService from './subDataService';
import * as triggerService from './triggerService';
import { compareAddresses, requireAddress, requireAddresses } from './utils';

export const makerEncode = {
  repayFromSavings(
    bundleId: StrategyOrBundleIds,
    vaultId: number,
    minRatio: number,
    minOptimalRatio: number,
    isBundle: boolean = true,
    chainId: ChainId = ChainId.Ethereum,
    daiAddr?: EthereumAddress,
    mcdCdpManagerAddr?: EthereumAddress,
  ) {
    const subData = subDataService.makerRepayFromSavingsSubData.encode(vaultId, minOptimalRatio, chainId, daiAddr, mcdCdpManagerAddr);
    const triggerData = triggerService.makerRatioTrigger.encode(vaultId, minRatio, RatioState.UNDER);

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
    vaultId:number,
    minRatio:string,
    maxRatio:string,
    maxOptimalRatio:string,
    minOptimalRatio:string,
    boostEnabled:boolean,
  ) {
    return [
      vaultId,
      new Dec(minRatio).mul(1e16).toString(),
      new Dec(maxRatio).mul(1e16).toString(),
      new Dec(maxOptimalRatio).mul(1e16).toString(),
      new Dec(minOptimalRatio).mul(1e16).toString(),
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
    minRatio:string,
    maxRatio:string,
    maxOptimalRatio:string,
    minOptimalRatio:string,
    boostEnabled:boolean,
  ) {
    return [
      new Dec(minRatio).mul(1e16).toString(),
      new Dec(maxRatio).mul(1e16).toString(),
      new Dec(maxOptimalRatio).mul(1e16).toString(),
      new Dec(minOptimalRatio).mul(1e16).toString(),
      boostEnabled,
    ];
  },
};

export const chickenBondsEncode = {
  rebond(bondId: number) {
    return subDataService.cBondsRebondSubData.encode(bondId);
  },
};

export const aaveV2Encode = {
  leverageManagement(
    minRatio: number,
    maxRatio: number,
    maxOptimalRatio: number,
    minOptimalRatio: number,
    boostEnabled: boolean,
  ) {
    return subDataService.aaveV2LeverageManagementSubData.encode(minRatio, maxRatio, maxOptimalRatio, minOptimalRatio, boostEnabled);
  },
};

export const aaveV3Encode = {
  leverageManagement(
    minRatio: number,
    maxRatio: number,
    maxOptimalRatio: number,
    minOptimalRatio: number,
    boostEnabled: boolean,
  ) {
    let subInput = '0x';

    subInput = subInput.concat(new Dec(minRatio).mul(1e16).toHex().slice(2)
      .padStart(32, '0'));
    subInput = subInput.concat(new Dec(maxRatio).mul(1e16).toHex().slice(2)
      .padStart(32, '0'));
    subInput = subInput.concat(new Dec(maxOptimalRatio).mul(1e16).toHex().slice(2)
      .padStart(32, '0'));
    subInput = subInput.concat(new Dec(minOptimalRatio).mul(1e16).toHex().slice(2)
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
};

export const compoundV3Encode = {
  leverageManagement(
    market: EthereumAddress,
    baseToken: EthereumAddress,
    minRatio: number,
    maxRatio: number,
    maxOptimalRatio: number,
    minOptimalRatio: number,
    boostEnabled: boolean,
    isEOA: boolean,
  ) {
    return subDataService.compoundV3LeverageManagementSubData.encode(market, baseToken, minRatio, maxRatio, maxOptimalRatio, minOptimalRatio, boostEnabled, isEOA);
  },
};

export const morphoAaveV2Encode = {
  leverageManagement(
    minRatio: number,
    maxRatio: number,
    maxOptimalRatio: number,
    minOptimalRatio: number,
    boostEnabled: boolean,
  ) {
    return subDataService.morphoAaveV2LeverageManagementSubData.encode(minRatio, maxRatio, maxOptimalRatio, minOptimalRatio, boostEnabled);
  },
};

export const exchangeEncode = {
  dca(
    fromToken: EthereumAddress,
    toToken: EthereumAddress,
    amount: string,
    timestamp: number,
    interval: number,
    network: number,
  ) {
    requireAddresses([fromToken, toToken]);
    const subData = subDataService.exchangeDcaSubData.encode(fromToken, toToken, amount, interval);
    const triggerData = triggerService.exchangeTimestampTrigger.encode(timestamp, interval);
    const selectedNetwork = network === 1
      ? 'MainnetIds'
      : network === 10
        ? 'OptimismIds'
        : 'ArbitrumIds';

    const strategyId = Strategies[selectedNetwork].EXCHANGE_DCA;

    return [strategyId, false, triggerData, subData];
  },
  limitOrder(
    fromToken: EthereumAddress,
    toToken: EthereumAddress,
    amount: string,
    targetPrice: string,
    goodUntil: string,
    orderType: number,
  ) {
    return subDataService.exchangeLimitOrderSubData.encode(fromToken, toToken, amount, targetPrice, goodUntil, orderType);
  },
};

export const sparkEncode = {
  leverageManagement(
    minRatio: number,
    maxRatio: number,
    maxOptimalRatio: number,
    minOptimalRatio: number,
    boostEnabled: boolean,
  ) {
    let subInput = '0x';

    subInput = subInput.concat(new Dec(minRatio).mul(1e16).toHex().slice(2)
      .padStart(32, '0'));
    subInput = subInput.concat(new Dec(maxRatio).mul(1e16).toHex().slice(2)
      .padStart(32, '0'));
    subInput = subInput.concat(new Dec(maxOptimalRatio).mul(1e16).toHex().slice(2)
      .padStart(32, '0'));
    subInput = subInput.concat(new Dec(minOptimalRatio).mul(1e16).toHex().slice(2)
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
