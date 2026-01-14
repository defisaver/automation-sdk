import Dec from 'decimal.js';
import { getAssetInfo } from '@defisaver/tokens';

import type { OrderType } from '../types/enums';
import {
  CloseToAssetType,
  Bundles,
  ChainId,
  RatioState,
  Strategies,
} from '../types/enums';
import type { EthereumAddress, StrategyOrBundleIds } from '../types';

import { STRATEGY_IDS } from '../constants';

import * as subDataService from './subDataService';
import * as triggerService from './triggerService';
import {
  compareAddresses, getCloseStrategyType, requireAddress, requireAddresses,
} from './utils';

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
  leverageManagementWithoutSubProxy(
    vaultId: number,
    triggerRatio: number,
    targetRatio: number,
    ratioState: RatioState,
    isBoost: boolean,
    daiAddr?: EthereumAddress,
  ) {
    const bundleId = isBoost ? Bundles.MainnetIds.MAKER_BOOST : Bundles.MainnetIds.MAKER_REPAY;

    const triggerData = triggerService.makerRatioTrigger.encode(vaultId, triggerRatio, ratioState);

    const subData = subDataService.makerLeverageManagementWithoutSubProxy.encode(vaultId, targetRatio, daiAddr);

    return [
      bundleId,
      true,
      triggerData,
      subData,
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
  leverageManagementOnPrice(
    strategyOrBundleId: number,
    isBundle: boolean = true,
    triggerData: {
      baseTokenAddress: EthereumAddress, quoteTokenAddress: EthereumAddress, price: number, state: RatioState.UNDER
    },
    subData: {
      collAsset: EthereumAddress, collAssetId: number, debtAsset: EthereumAddress, debtAssetId: number, marketAddr: EthereumAddress, targetRatio: number,
    },
  ) {
    const {
      collAsset, collAssetId, debtAsset, debtAssetId, marketAddr, targetRatio,
    } = subData;
    const subDataEncoded = subDataService.aaveV3LeverageManagementOnPriceSubData.encode(collAsset, collAssetId, debtAsset, debtAssetId, marketAddr, targetRatio);

    const {
      baseTokenAddress, quoteTokenAddress, price, state,
    } = triggerData;
    const triggerDataEncoded = triggerService.aaveV3QuotePriceTrigger.encode(baseTokenAddress, quoteTokenAddress, price, state);

    return [strategyOrBundleId, isBundle, triggerDataEncoded, subDataEncoded];
  },
  leverageManagementWithoutSubProxy(
    strategyOrBundleId: number,
    market: EthereumAddress,
    user: EthereumAddress,
    ratioState: RatioState,
    targetRatio: number,
    triggerRatio: number,
    isGeneric: boolean = false, // added later, isGeneric should be `false` for old strategies (if some are using this). For EOA should be `TRUE` !!! In the future, if we switch new SW subs to generic strategies too, then all new strategies should go with `isGeneric = true`. Old ones should stay the same
  ) {
    const isBundle = true;

    const subData = subDataService.aaveV3LeverageManagementSubDataWithoutSubProxy.encode(
      targetRatio,
      ratioState,
      market,
      user,
      isGeneric,
    );
    const triggerData = triggerService.aaveV3RatioTrigger.encode(user, market, triggerRatio, ratioState);

    return [strategyOrBundleId, isBundle, triggerData, subData];
  },

  leverageManagementOnPriceGeneric(
    strategyOrBundleId: number,
    price: number,
    ratioState: RatioState,
    collAsset: EthereumAddress,
    collAssetId: number,
    debtAsset: EthereumAddress,
    debtAssetId: number,
    marketAddr: EthereumAddress,
    targetRatio: number,
    user: EthereumAddress,
  ) {
    const isBundle = true;
    const subDataEncoded = subDataService.aaveV3LeverageManagementOnPriceGeneric.encode(
      collAsset,
      collAssetId,
      debtAsset,
      debtAssetId,
      marketAddr,
      targetRatio,
      user,
    );
    const triggerDataEncoded = triggerService.aaveV3QuotePriceTrigger.encode(collAsset, debtAsset, price, ratioState);
    return [strategyOrBundleId, isBundle, triggerDataEncoded, subDataEncoded];
  },

  closeOnPriceGeneric(
    strategyOrBundleId: number,
    collAsset: EthereumAddress,
    collAssetId: number,
    debtAsset: EthereumAddress,
    debtAssetId: number,
    marketAddr: EthereumAddress,
    user: EthereumAddress,
    stopLossPrice: number = 0,
    stopLossType: CloseToAssetType = CloseToAssetType.DEBT,
    takeProfitPrice: number = 0,
    takeProfitType: CloseToAssetType = CloseToAssetType.COLLATERAL,
  ) {
    const isBundle = true;
    const closeType = getCloseStrategyType(stopLossPrice, stopLossType, takeProfitPrice, takeProfitType);

    const subDataEncoded = subDataService.aaveV3CloseGenericSubData.encode(collAsset, collAssetId, debtAsset, debtAssetId, closeType, marketAddr, user);
    const triggerDataEncoded = triggerService.aaveV3QuotePriceRangeTrigger.encode(collAsset, debtAsset, stopLossPrice, takeProfitPrice);

    return [strategyOrBundleId, isBundle, triggerDataEncoded, subDataEncoded];
  },

  collateralSwitch(
    strategyOrBundleId: number,
    fromAsset: EthereumAddress,
    fromAssetId: number,
    toAsset: EthereumAddress,
    toAssetId: number,
    marketAddr: EthereumAddress,
    amountToSwitch: string,
    baseTokenAddress: EthereumAddress,
    quoteTokenAddress: EthereumAddress,
    price: number,
    state: RatioState,
  ) {
    const isBundle = false;

    const subDataEncoded = subDataService.aaveV3CollateralSwitchSubData.encode(fromAsset, fromAssetId, toAsset, toAssetId, marketAddr, amountToSwitch);
    const triggerDataEncoded = triggerService.aaveV3QuotePriceTrigger.encode(baseTokenAddress, quoteTokenAddress, price, state);

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
  leverageManagementOnPrice(
    strategyOrBundleId: number,
    market: EthereumAddress,
    collToken: EthereumAddress,
    baseToken: EthereumAddress,
    targetRatio: number,
    price: number,
    priceState: RatioState,
    ratioState: RatioState, // REPAY for repay on price, BOOST for boost on price
    user: EthereumAddress,
  ) {
    const isBundle = true;
    const subDataEncoded = subDataService.compoundV3LeverageManagementOnPriceSubData.encode(market, collToken, baseToken, targetRatio, ratioState, user);
    const triggerDataEncoded = triggerService.compoundV3PriceTrigger.encode(market, collToken, user, price, priceState);

    return [strategyOrBundleId, isBundle, triggerDataEncoded, subDataEncoded];
  },
  closeOnPrice(
    strategyOrBundleId: number,
    market: EthereumAddress,
    collToken: EthereumAddress,
    baseToken: EthereumAddress,
    stopLossPrice: number = 0,
    stopLossType: CloseToAssetType = CloseToAssetType.DEBT,
    takeProfitPrice: number = 0,
    takeProfitType: CloseToAssetType = CloseToAssetType.COLLATERAL,
    user: EthereumAddress,
  ) {
    const isBundle = true;
    const closeType = getCloseStrategyType(stopLossPrice, stopLossType, takeProfitPrice, takeProfitType);

    const subDataEncoded = subDataService.compoundV3CloseSubData.encode(market, collToken, baseToken, closeType, user);
    const triggerDataEncoded = triggerService.compoundV3PriceRangeTrigger.encode(market, collToken, stopLossPrice, takeProfitPrice);

    return [strategyOrBundleId, isBundle, triggerDataEncoded, subDataEncoded];
  },
};

export const compoundV3L2Encode = {
  leverageManagement(
    market: EthereumAddress,
    baseToken: EthereumAddress,
    triggerRepayRatio: number,
    triggerBoostRatio: number,
    targetBoostRatio: number,
    targetRepayRatio: number,
    boostEnabled: boolean,
    isEOA: boolean = false,
  ) {
    return subDataService.compoundV3L2LeverageManagementSubData.encode(market, baseToken, triggerRepayRatio, triggerBoostRatio, targetBoostRatio, targetRepayRatio, boostEnabled, isEOA);
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
  closeOnPriceGeneric(
    strategyOrBundleId: number,
    collAsset: EthereumAddress,
    collAssetId: number,
    debtAsset: EthereumAddress,
    debtAssetId: number,
    marketAddr: EthereumAddress,
    user: EthereumAddress,
    stopLossPrice: number = 0,
    stopLossType: CloseToAssetType = CloseToAssetType.DEBT,
    takeProfitPrice: number = 0,
    takeProfitType: CloseToAssetType = CloseToAssetType.COLLATERAL,
  ) {
    const isBundle = true;
    const closeType = getCloseStrategyType(stopLossPrice, stopLossType, takeProfitPrice, takeProfitType);

    const subDataEncoded = subDataService.sparkCloseGenericSubData.encode(collAsset, collAssetId, debtAsset, debtAssetId, closeType, marketAddr, user);
    const triggerDataEncoded = triggerService.sparkQuotePriceRangeTrigger.encode(collAsset, debtAsset, stopLossPrice, takeProfitPrice);

    return [strategyOrBundleId, isBundle, triggerDataEncoded, subDataEncoded];
  },
  leverageManagementWithoutSubProxy(
    strategyOrBundleId: number,
    market: EthereumAddress,
    user: EthereumAddress,
    ratioState: RatioState,
    targetRatio: number,
    triggerRatio: number,
  ) {
    const isBundle = true;

    const subData = subDataService.sparkLeverageManagementSubDataWithoutSubProxy.encode(
      targetRatio,
      ratioState,
    );
    const triggerData = triggerService.sparkRatioTrigger.encode(user, market, triggerRatio, ratioState);

    return [strategyOrBundleId, isBundle, triggerData, subData];
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
  payback(
    proxyAddress: EthereumAddress,
    addressToPullTokensFrom: EthereumAddress,
    positionOwner: EthereumAddress,
    paybackAmount: string,
    crvUSDAddr: EthereumAddress,
    controllerAddr: EthereumAddress,
    minHealthRatio: number,
  ) {
    const subData = subDataService.crvUSDPaybackSubData.encode(controllerAddr, addressToPullTokensFrom, positionOwner, paybackAmount, crvUSDAddr);
    const triggerData = triggerService.crvUsdHealthRatioTrigger.encode(proxyAddress, controllerAddr, minHealthRatio);

    const strategyId = Strategies.MainnetIds.CURVEUSD_PAYBACK;
    const isBundle = false;

    return [strategyId, isBundle, triggerData, subData];
  },
};

export const morphoBlueEncode = {
  leverageManagement(
    marketId: string,
    loanToken: EthereumAddress,
    collToken: EthereumAddress,
    oracle: EthereumAddress,
    irm: EthereumAddress,
    lltv: string,
    ratioState: RatioState,
    targetRatio: number,
    triggerRatio: number,
    user: EthereumAddress,
    isEOA: boolean,
    network: ChainId,
  ) {
    const subData = subDataService.morphoBlueLeverageManagementSubData.encode(loanToken, collToken, oracle, irm, lltv, ratioState, targetRatio, user, isEOA);

    const triggerData = triggerService.morphoBlueRatioTrigger.encode(marketId, user, triggerRatio, ratioState);

    // over is boost, under is repay
    const isBoost = ratioState === RatioState.OVER;
    let strategyOrBundleId;

    if (network === ChainId.Base) {
      return [isBoost ? Bundles.BaseIds.MORPHO_BLUE_BOOST : Bundles.BaseIds.MORPHO_BLUE_REPAY, true, triggerData, subData];
    }

    const bundlesIds = network === ChainId.Arbitrum ? Bundles.ArbitrumIds : Bundles.MainnetIds;

    if (isBoost) strategyOrBundleId = isEOA ? bundlesIds.MORPHO_BLUE_EOA_BOOST : bundlesIds.MORPHO_BLUE_BOOST;
    else strategyOrBundleId = isEOA ? bundlesIds.MORPHO_BLUE_EOA_REPAY : bundlesIds.MORPHO_BLUE_REPAY;
    const isBundle = true;

    return [strategyOrBundleId, isBundle, triggerData, subData];
  },
  leverageManagementOnPrice(
    strategyOrBundleId: number,
    isBundle: boolean = true,
    loanToken: EthereumAddress,
    collToken: EthereumAddress,
    oracle: EthereumAddress,
    irm: EthereumAddress,
    lltv: string,
    user: EthereumAddress,
    targetRatio: number,
    price: number,
    priceState: RatioState,
  ) {
    const subData = subDataService.morphoBlueLeverageManagementOnPriceSubData.encode(loanToken, collToken, oracle, irm, lltv, targetRatio, user);
    const triggerData = triggerService.morphoBluePriceTrigger.encode(oracle, collToken, loanToken, price, priceState);
    return [strategyOrBundleId, isBundle, triggerData, subData];
  },
  closeOnPrice(
    strategyOrBundleId: number,
    loanToken: EthereumAddress,
    collToken: EthereumAddress,
    oracle: EthereumAddress,
    irm: EthereumAddress,
    lltv: string,
    user: EthereumAddress,
    stopLossPrice: number = 0,
    stopLossType: CloseToAssetType = CloseToAssetType.DEBT,
    takeProfitPrice: number = 0,
    takeProfitType: CloseToAssetType = CloseToAssetType.COLLATERAL,
  ) {
    const isBundle = true;
    const closeType = getCloseStrategyType(stopLossPrice, stopLossType, takeProfitPrice, takeProfitType);

    const subDataEncoded = subDataService.morphoBlueCloseOnPriceSubData.encode(loanToken, collToken, oracle, irm, lltv, user, closeType);
    const triggerDataEncoded = triggerService.morphoBluePriceRangeTrigger.encode(oracle, collToken, loanToken, stopLossPrice, takeProfitPrice);

    return [strategyOrBundleId, isBundle, triggerDataEncoded, subDataEncoded];
  },
};

export const liquityV2Encode = {
  leverageManagement(
    market: EthereumAddress,
    troveId: string,
    collToken: EthereumAddress,
    boldToken: EthereumAddress,
    ratioState: RatioState,
    targetRatio: number,
    triggerRatio: number,
    strategyOrBundleId: number,
  ) {
    const isBundle = true;
    const subData = subDataService.liquityV2LeverageManagementSubData.encode(market, troveId, collToken, boldToken, ratioState, targetRatio);
    const triggerData = triggerService.liquityV2RatioTrigger.encode(market, troveId, triggerRatio, ratioState);

    return [strategyOrBundleId, isBundle, triggerData, subData];
  },
  closeOnPrice(
    strategyOrBundleId: number,
    market: EthereumAddress,
    troveId: string,
    collToken: EthereumAddress,
    boldToken: EthereumAddress,
    stopLossPrice: number = 0,
    stopLossType: CloseToAssetType = CloseToAssetType.DEBT,
    takeProfitPrice: number = 0,
    takeProfitType: CloseToAssetType = CloseToAssetType.COLLATERAL,
  ) {
    const isBundle = true;
    const closeType = getCloseStrategyType(stopLossPrice, stopLossType, takeProfitPrice, takeProfitType);

    const subData = subDataService.liquityV2CloseSubData.encode(market, troveId, collToken, boldToken, closeType);
    const triggerData = triggerService.closePriceTrigger.encode(collToken, stopLossPrice, takeProfitPrice);

    return [strategyOrBundleId, isBundle, triggerData, subData];
  },
  leverageManagementOnPrice(
    strategyOrBundleId: number,
    market: EthereumAddress,
    price: number,
    state: RatioState,
    troveId: string,
    collToken: EthereumAddress,
    boldToken: EthereumAddress,
    targetRatio: number,
    isRepayOnPrice: boolean,
  ) {
    const subDataEncoded = subDataService.liquityV2LeverageManagementOnPriceSubData.encode(
      market, troveId, collToken, boldToken, targetRatio, isRepayOnPrice,
    );

    const triggerDataEncoded = triggerService.liquityV2QuotePriceTrigger.encode(market, price, state);
    const isBundle = true;
    return [strategyOrBundleId, isBundle, triggerDataEncoded, subDataEncoded];
  },
  payback(
    market: EthereumAddress,
    troveId: string,
    boldToken: EthereumAddress,
    targetRatio: number,
    ratioState: RatioState,
    triggerRatio: number,
  ) {
    const strategyId = Strategies.MainnetIds.LIQUITY_V2_PAYBACK;
    const isBundle = false;

    const subData = subDataService.liquityV2PaybackSubData.encode(market, troveId, boldToken, targetRatio, ratioState);
    const triggerData = triggerService.liquityV2RatioTrigger.encode(market, troveId, triggerRatio, ratioState);

    return [strategyId, isBundle, triggerData, subData];
  },
};

export const fluidEncode = {
  leverageManagement(
    nftId: string,
    vault: EthereumAddress,
    ratioState: RatioState,
    targetRatio: number,
    triggerRatio: number,
    strategyOrBundleId: number,
  ) {
    const isBundle = true;
    const subData = subDataService.fluidLeverageManagementSubData.encode(nftId, vault, ratioState, targetRatio);
    const triggerData = triggerService.fluidRatioTrigger.encode(nftId, triggerRatio, ratioState);

    return [strategyOrBundleId, isBundle, triggerData, subData];
  },
};
