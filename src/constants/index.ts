import type {
  ArbitrumBundleInfo,
  ArbitrumStrategiesInfo,
  BundlesInfo,
  EthereumAddress,
  Interfaces,
  MainnetBundleInfo,
  MainnetStrategiesInfo,
  OptimismBundleInfo,
  OptimismStrategiesInfo,
  BaseBundleInfo,
  BaseStrategiesInfo,
  StrategiesInfo,
} from '../types';

import {
  ChainId, ProtocolIdentifiers, Strategies, Bundles, BundleProtocols,
} from '../types/enums';

import Protocol from '../automation/private/Protocol';
import LegacyProtocol from '../automation/private/LegacyProtocol';

// General
export const ZERO_ADDRESS: EthereumAddress = '0x0000000000000000000000000000000000000000';

export const AAVE_V3_VARIABLE_BORROW_RATE = 2;

export const PROTOCOLS: Record<keyof typeof ProtocolIdentifiers.StrategiesAutomation, Interfaces.Protocol> = (() => {
  const protocolsMapping: any = {};
  Object.entries(ProtocolIdentifiers.StrategiesAutomation).forEach(([id, value]) => {
    protocolsMapping[id] = new Protocol({ id: value });
  });
  return protocolsMapping;
})();

export const LEGACY_PROTOCOLS: Record<keyof typeof ProtocolIdentifiers.LegacyAutomation, Interfaces.LegacyProtocol> = (() => {
  const protocolsMapping: any = {};
  Object.entries(ProtocolIdentifiers.LegacyAutomation).forEach(([id, value]) => {
    protocolsMapping[id] = new LegacyProtocol({ id: value });
  });
  return protocolsMapping;
})();

// Strategies info
export const MAINNET_STRATEGIES_INFO: MainnetStrategiesInfo = {
  [Strategies.MainnetIds.MAKER_CLOSE_ON_PRICE_TO_DAI]: {
    strategyOrBundleId: Strategies.MainnetIds.MAKER_CLOSE_ON_PRICE_TO_DAI,
    strategyId: Strategies.Identifiers.CloseOnPriceToDebt,
    protocol: PROTOCOLS.MakerDAO,
  },
  [Strategies.MainnetIds.MAKER_CLOSE_ON_PRICE_TO_COLL]: {
    strategyOrBundleId: Strategies.MainnetIds.MAKER_CLOSE_ON_PRICE_TO_COLL,
    strategyId: Strategies.Identifiers.CloseOnPriceToColl,
    protocol: PROTOCOLS.MakerDAO,
  },
  [Strategies.MainnetIds.LIQUITY_CLOSE_ON_PRICE_TO_COLL_DEPRECATED]: {
    strategyOrBundleId: Strategies.MainnetIds.LIQUITY_CLOSE_ON_PRICE_TO_COLL_DEPRECATED,
    strategyId: Strategies.Identifiers.CloseOnPriceToColl,
    protocol: PROTOCOLS.Liquity,
  },
  [Strategies.MainnetIds.LIQUITY_CLOSE_ON_PRICE_TO_COLL]: {
    strategyOrBundleId: Strategies.MainnetIds.LIQUITY_CLOSE_ON_PRICE_TO_COLL,
    strategyId: Strategies.Identifiers.CloseOnPriceToColl,
    protocol: PROTOCOLS.Liquity,
  },
  [Strategies.MainnetIds.MAKER_TRAILING_STOP_LOSS_TO_COLL]: {
    strategyOrBundleId: Strategies.MainnetIds.MAKER_TRAILING_STOP_LOSS_TO_COLL,
    strategyId: Strategies.Identifiers.TrailingStopToColl,
    protocol: PROTOCOLS.MakerDAO,
  },
  [Strategies.MainnetIds.MAKER_TRAILING_STOP_LOSS_TO_DAI]: {
    strategyOrBundleId: Strategies.MainnetIds.MAKER_TRAILING_STOP_LOSS_TO_DAI,
    strategyId: Strategies.Identifiers.TrailingStopToDebt,
    protocol: PROTOCOLS.MakerDAO,
  },
  [Strategies.MainnetIds.LIQUITY_TRAILING_STOP_LOSS_TO_COLL]: {
    strategyOrBundleId: Strategies.MainnetIds.LIQUITY_TRAILING_STOP_LOSS_TO_COLL,
    strategyId: Strategies.Identifiers.TrailingStopToColl,
    protocol: PROTOCOLS.Liquity,
  },
  [Strategies.MainnetIds.CHICKEN_BONDS_REBOND]: {
    strategyOrBundleId: Strategies.MainnetIds.CHICKEN_BONDS_REBOND,
    strategyId: Strategies.Identifiers.Rebond,
    protocol: PROTOCOLS.ChickenBonds,
  },
  [Strategies.MainnetIds.EXCHANGE_DCA]: {
    strategyOrBundleId: Strategies.MainnetIds.EXCHANGE_DCA,
    strategyId: Strategies.Identifiers.Dca,
    protocol: PROTOCOLS.Exchange,
  },
  [Strategies.MainnetIds.EXCHANGE_LIMIT_ORDER]: {
    strategyOrBundleId: Strategies.MainnetIds.EXCHANGE_LIMIT_ORDER,
    strategyId: Strategies.Identifiers.LimitOrder,
    protocol: PROTOCOLS.Exchange,
  },
  [Strategies.MainnetIds.LIQUITY_DSR_PAYBACK]: {
    strategyOrBundleId: Strategies.MainnetIds.LIQUITY_DSR_PAYBACK,
    strategyId: Strategies.Identifiers.SavingsDsrPayback,
    protocol: PROTOCOLS.Liquity,
  },
  [Strategies.MainnetIds.LIQUITY_DSR_SUPPLY]: {
    strategyOrBundleId: Strategies.MainnetIds.LIQUITY_DSR_SUPPLY,
    strategyId: Strategies.Identifiers.SavingsDsrSupply,
    protocol: PROTOCOLS.Liquity,
  },
  [Strategies.MainnetIds.LIQUITY_DEBT_IN_FRONT_REPAY]: {
    strategyOrBundleId: Strategies.MainnetIds.LIQUITY_DEBT_IN_FRONT_REPAY,
    strategyId: Strategies.Identifiers.DebtInFrontRepay,
    protocol: PROTOCOLS.Liquity,
  },
  [Strategies.MainnetIds.CURVEUSD_PAYBACK]: {
    strategyOrBundleId: Strategies.MainnetIds.CURVEUSD_PAYBACK,
    strategyId: Strategies.Identifiers.Payback,
    protocol: PROTOCOLS.CrvUSD,
  },
  [Strategies.MainnetIds.LIQUITY_V2_PAYBACK]: {
    strategyOrBundleId: Strategies.MainnetIds.LIQUITY_V2_PAYBACK,
    strategyId: Strategies.Identifiers.Payback,
    protocol: PROTOCOLS.LiquityV2,
  },
};

export const OPTIMISM_STRATEGIES_INFO: OptimismStrategiesInfo = {
  [Strategies.OptimismIds.EXCHANGE_DCA]: {
    strategyOrBundleId: Strategies.OptimismIds.EXCHANGE_DCA,
    strategyId: Strategies.Identifiers.Dca,
    protocol: PROTOCOLS.Exchange,
  },
  [Strategies.OptimismIds.EXCHANGE_LIMIT_ORDER]: {
    strategyOrBundleId: Strategies.OptimismIds.EXCHANGE_LIMIT_ORDER,
    strategyId: Strategies.Identifiers.LimitOrder,
    protocol: PROTOCOLS.Exchange,
  },
};

export const BASE_STRATEGIES_INFO: BaseStrategiesInfo = {
  [Strategies.BaseIds.EXCHANGE_DCA]: {
    strategyOrBundleId: Strategies.BaseIds.EXCHANGE_DCA,
    strategyId: Strategies.Identifiers.Dca,
    protocol: PROTOCOLS.Exchange,
  },
  [Strategies.BaseIds.EXCHANGE_LIMIT_ORDER]: {
    strategyOrBundleId: Strategies.BaseIds.EXCHANGE_LIMIT_ORDER,
    strategyId: Strategies.Identifiers.LimitOrder,
    protocol: PROTOCOLS.Exchange,
  },
};

export const ARBITRUM_STRATEGIES_INFO: ArbitrumStrategiesInfo = {
  [Strategies.ArbitrumIds.EXCHANGE_DCA]: {
    strategyOrBundleId: Strategies.ArbitrumIds.EXCHANGE_DCA,
    strategyId: Strategies.Identifiers.Dca,
    protocol: PROTOCOLS.Exchange,
  },
  [Strategies.ArbitrumIds.EXCHANGE_LIMIT_ORDER]: {
    strategyOrBundleId: Strategies.ArbitrumIds.EXCHANGE_LIMIT_ORDER,
    strategyId: Strategies.Identifiers.LimitOrder,
    protocol: PROTOCOLS.Exchange,
  },
};

export const STRATEGIES_INFO: StrategiesInfo = {
  [ChainId.Ethereum]: MAINNET_STRATEGIES_INFO,
  [ChainId.Optimism]: OPTIMISM_STRATEGIES_INFO,
  [ChainId.Arbitrum]: ARBITRUM_STRATEGIES_INFO,
  [ChainId.Base]: BASE_STRATEGIES_INFO,
};

export const STRATEGY_IDS = {
  [ChainId.Ethereum]: Strategies.MainnetIds,
  [ChainId.Optimism]: Strategies.OptimismIds,
  [ChainId.Arbitrum]: Strategies.ArbitrumIds,
  [ChainId.Base]: Strategies.BaseIds,
};

// Bundles info
export const MAINNET_BUNDLES_INFO: MainnetBundleInfo = {
  [Bundles.MainnetIds.MAKER_REPAY_FROM_SMART_SAVINGS_YEARN]: {
    strategyOrBundleId: Bundles.MainnetIds.MAKER_REPAY_FROM_SMART_SAVINGS_YEARN,
    bundleId: BundleProtocols.Yearn,
    bundleName: 'Yearn',
    strategyId: Strategies.Identifiers.SavingsLiqProtection,
    protocol: PROTOCOLS.MakerDAO,
  },
  [Bundles.MainnetIds.MAKER_REPAY_FROM_SMART_SAVINGS_MSTABLE]: {
    strategyOrBundleId: Bundles.MainnetIds.MAKER_REPAY_FROM_SMART_SAVINGS_MSTABLE,
    bundleId: BundleProtocols.MStable,
    bundleName: 'mStable',
    strategyId: Strategies.Identifiers.SavingsLiqProtection,
    protocol: PROTOCOLS.MakerDAO,
  },
  [Bundles.MainnetIds.MAKER_REPAY_FROM_SMART_SAVINGS_RARI]: {
    strategyOrBundleId: Bundles.MainnetIds.MAKER_REPAY_FROM_SMART_SAVINGS_RARI,
    bundleId: BundleProtocols.Rari,
    bundleName: 'Rari',
    strategyId: Strategies.Identifiers.SavingsLiqProtection,
    protocol: PROTOCOLS.MakerDAO,
  },
  [Bundles.MainnetIds.COMP_V3_SW_REPAY_BUNDLE]: {
    strategyOrBundleId: Bundles.MainnetIds.COMP_V3_SW_REPAY_BUNDLE,
    strategyId: Strategies.Identifiers.Repay,
    protocol: PROTOCOLS.CompoundV3,
  },
  [Bundles.MainnetIds.COMP_V3_SW_BOOST_BUNDLE]: {
    strategyOrBundleId: Bundles.MainnetIds.COMP_V3_SW_BOOST_BUNDLE,
    strategyId: Strategies.Identifiers.Boost,
    protocol: PROTOCOLS.CompoundV3,
  },
  [Bundles.MainnetIds.COMP_V3_EOA_REPAY_BUNDLE]: {
    strategyOrBundleId: Bundles.MainnetIds.COMP_V3_EOA_REPAY_BUNDLE,
    strategyId: Strategies.Identifiers.EoaRepay,
    protocol: PROTOCOLS.CompoundV3,
  },
  [Bundles.MainnetIds.COMP_V3_EOA_BOOST_BUNDLE]: {
    strategyOrBundleId: Bundles.MainnetIds.COMP_V3_EOA_BOOST_BUNDLE,
    strategyId: Strategies.Identifiers.EoaBoost,
    protocol: PROTOCOLS.CompoundV3,
  },
  [Bundles.MainnetIds.COMP_V3_SW_REPAY_V2_BUNDLE]: {
    strategyOrBundleId: Bundles.MainnetIds.COMP_V3_SW_REPAY_V2_BUNDLE,
    strategyId: Strategies.Identifiers.Repay,
    protocol: PROTOCOLS.CompoundV3,
  },
  [Bundles.MainnetIds.COMP_V3_SW_BOOST_V2_BUNDLE]: {
    strategyOrBundleId: Bundles.MainnetIds.COMP_V3_SW_BOOST_V2_BUNDLE,
    strategyId: Strategies.Identifiers.Boost,
    protocol: PROTOCOLS.CompoundV3,
  },
  [Bundles.MainnetIds.COMP_V3_EOA_REPAY_V2_BUNDLE]: {
    strategyOrBundleId: Bundles.MainnetIds.COMP_V3_EOA_REPAY_V2_BUNDLE,
    strategyId: Strategies.Identifiers.EoaRepay,
    protocol: PROTOCOLS.CompoundV3,
  },
  [Bundles.MainnetIds.COMP_V3_EOA_BOOST_V2_BUNDLE]: {
    strategyOrBundleId: Bundles.MainnetIds.COMP_V3_EOA_BOOST_V2_BUNDLE,
    strategyId: Strategies.Identifiers.EoaBoost,
    protocol: PROTOCOLS.CompoundV3,
  },
  [Bundles.MainnetIds.LIQUITY_PAYBACK_USING_CHICKEN_BOND]: {
    strategyOrBundleId: Bundles.MainnetIds.LIQUITY_PAYBACK_USING_CHICKEN_BOND,
    strategyId: Strategies.Identifiers.BondProtection,
    protocol: PROTOCOLS.Liquity,
  },
  [Bundles.MainnetIds.AAVE_V3_REPAY]: {
    strategyOrBundleId: Bundles.MainnetIds.AAVE_V3_REPAY,
    strategyId: Strategies.Identifiers.Repay,
    protocol: PROTOCOLS.AaveV3,
  },
  [Bundles.MainnetIds.AAVE_V3_BOOST]: {
    strategyOrBundleId: Bundles.MainnetIds.AAVE_V3_BOOST,
    strategyId: Strategies.Identifiers.Boost,
    protocol: PROTOCOLS.AaveV3,
  },
  [Bundles.MainnetIds.MAKER_REPAY]: {
    strategyOrBundleId: Bundles.MainnetIds.MAKER_REPAY,
    strategyId: Strategies.Identifiers.Repay,
    protocol: PROTOCOLS.MakerDAO,
  },
  [Bundles.MainnetIds.MAKER_BOOST]: {
    strategyOrBundleId: Bundles.MainnetIds.MAKER_BOOST,
    strategyId: Strategies.Identifiers.Boost,
    protocol: PROTOCOLS.MakerDAO,
  },
  [Bundles.MainnetIds.AAVE_V3_CLOSE_TO_DEBT]: {
    strategyOrBundleId: Bundles.MainnetIds.AAVE_V3_CLOSE_TO_DEBT,
    strategyId: Strategies.Identifiers.CloseToDebt,
    protocol: PROTOCOLS.AaveV3,
  },
  [Bundles.MainnetIds.AAVE_V3_CLOSE_TO_DEBT_WITH_GAS_PRICE]: {
    strategyOrBundleId: Bundles.MainnetIds.AAVE_V3_CLOSE_TO_DEBT_WITH_GAS_PRICE,
    strategyId: Strategies.Identifiers.CloseToDebtWithGasPrice,
    protocol: PROTOCOLS.AaveV3,
  },
  [Bundles.MainnetIds.AAVE_V3_CLOSE_TO_COLLATERAL]: {
    strategyOrBundleId: Bundles.MainnetIds.AAVE_V3_CLOSE_TO_COLLATERAL,
    strategyId: Strategies.Identifiers.CloseToCollateral,
    protocol: PROTOCOLS.AaveV3,
  },
  [Bundles.MainnetIds.AAVE_V3_CLOSE_TO_COLLATERAL_WITH_GAS_PRICE]: {
    strategyOrBundleId: Bundles.MainnetIds.AAVE_V3_CLOSE_TO_COLLATERAL_WITH_GAS_PRICE,
    strategyId: Strategies.Identifiers.CloseToCollateralWithGasPrice,
    protocol: PROTOCOLS.AaveV3,
  },
  [Bundles.MainnetIds.MORPHO_AAVE_V2_REPAY]: {
    strategyOrBundleId: Bundles.MainnetIds.MORPHO_AAVE_V2_REPAY,
    strategyId: Strategies.Identifiers.Repay,
    protocol: PROTOCOLS.MorphoAaveV2,
  },
  [Bundles.MainnetIds.MORPHO_AAVE_V2_BOOST]: {
    strategyOrBundleId: Bundles.MainnetIds.MORPHO_AAVE_V2_BOOST,
    strategyId: Strategies.Identifiers.Boost,
    protocol: PROTOCOLS.MorphoAaveV2,
  },
  [Bundles.MainnetIds.LIQUITY_REPAY]: {
    strategyOrBundleId: Bundles.MainnetIds.LIQUITY_REPAY,
    strategyId: Strategies.Identifiers.Repay,
    protocol: PROTOCOLS.Liquity,
  },
  [Bundles.MainnetIds.LIQUITY_BOOST]: {
    strategyOrBundleId: Bundles.MainnetIds.LIQUITY_BOOST,
    strategyId: Strategies.Identifiers.Boost,
    protocol: PROTOCOLS.Liquity,
  },
  [Bundles.MainnetIds.SPARK_REPAY]: {
    strategyOrBundleId: Bundles.MainnetIds.SPARK_REPAY,
    strategyId: Strategies.Identifiers.Repay,
    protocol: PROTOCOLS.Spark,
  },
  [Bundles.MainnetIds.SPARK_BOOST]: {
    strategyOrBundleId: Bundles.MainnetIds.SPARK_BOOST,
    strategyId: Strategies.Identifiers.Boost,
    protocol: PROTOCOLS.Spark,
  },
  [Bundles.MainnetIds.AAVE_V2_REPAY]: {
    strategyOrBundleId: Bundles.MainnetIds.AAVE_V2_REPAY,
    strategyId: Strategies.Identifiers.Repay,
    protocol: PROTOCOLS.AaveV2,
  },
  [Bundles.MainnetIds.AAVE_V2_BOOST]: {
    strategyOrBundleId: Bundles.MainnetIds.AAVE_V2_BOOST,
    strategyId: Strategies.Identifiers.Boost,
    protocol: PROTOCOLS.AaveV2,
  },
  [Bundles.MainnetIds.COMP_V2_REPAY]: {
    strategyOrBundleId: Bundles.MainnetIds.COMP_V2_REPAY,
    strategyId: Strategies.Identifiers.Repay,
    protocol: PROTOCOLS.CompoundV2,
  },
  [Bundles.MainnetIds.COMP_V2_BOOST]: {
    strategyOrBundleId: Bundles.MainnetIds.COMP_V2_BOOST,
    strategyId: Strategies.Identifiers.Boost,
    protocol: PROTOCOLS.CompoundV2,
  },
  [Bundles.MainnetIds.CRVUSD_REPAY]: {
    strategyOrBundleId: Bundles.MainnetIds.CRVUSD_REPAY,
    strategyId: Strategies.Identifiers.Repay,
    protocol: PROTOCOLS.CrvUSD,
  },
  [Bundles.MainnetIds.CRVUSD_BOOST]: {
    strategyOrBundleId: Bundles.MainnetIds.CRVUSD_BOOST,
    strategyId: Strategies.Identifiers.Boost,
    protocol: PROTOCOLS.CrvUSD,
  },
  [Bundles.MainnetIds.MORPHO_BLUE_REPAY]: {
    strategyOrBundleId: Bundles.MainnetIds.MORPHO_BLUE_REPAY,
    strategyId: Strategies.Identifiers.Repay,
    protocol: PROTOCOLS.MorphoBlue,
  },
  [Bundles.MainnetIds.MORPHO_BLUE_BOOST]: {
    strategyOrBundleId: Bundles.MainnetIds.MORPHO_BLUE_BOOST,
    strategyId: Strategies.Identifiers.Boost,
    protocol: PROTOCOLS.MorphoBlue,
  },
  [Bundles.MainnetIds.MORPHO_BLUE_EOA_REPAY]: {
    strategyOrBundleId: Bundles.MainnetIds.MORPHO_BLUE_EOA_REPAY,
    strategyId: Strategies.Identifiers.EoaRepay,
    protocol: PROTOCOLS.MorphoBlue,
  },
  [Bundles.MainnetIds.MORPHO_BLUE_EOA_BOOST]: {
    strategyOrBundleId: Bundles.MainnetIds.MORPHO_BLUE_EOA_BOOST,
    strategyId: Strategies.Identifiers.EoaBoost,
    protocol: PROTOCOLS.MorphoBlue,
  },
  [Bundles.MainnetIds.AAVE_V3_OPEN_ORDER_FROM_COLLATERAL]: {
    strategyOrBundleId: Bundles.MainnetIds.AAVE_V3_OPEN_ORDER_FROM_COLLATERAL,
    strategyId: Strategies.Identifiers.OpenOrderFromCollateral,
    protocol: PROTOCOLS.AaveV3,
  },
  [Bundles.MainnetIds.AAVE_V3_REPAY_ON_PRICE]: {
    strategyOrBundleId: Bundles.MainnetIds.AAVE_V3_REPAY_ON_PRICE,
    strategyId: Strategies.Identifiers.RepayOnPrice,
    protocol: PROTOCOLS.AaveV3,
  },
  [Bundles.MainnetIds.LIQUITY_V2_REPAY]: {
    strategyOrBundleId: Bundles.MainnetIds.LIQUITY_V2_REPAY,
    strategyId: Strategies.Identifiers.Repay,
    protocol: PROTOCOLS.LiquityV2,
  },
  [Bundles.MainnetIds.LIQUITY_V2_BOOST]: {
    strategyOrBundleId: Bundles.MainnetIds.LIQUITY_V2_BOOST,
    strategyId: Strategies.Identifiers.Boost,
    protocol: PROTOCOLS.LiquityV2,
  },
  [Bundles.MainnetIds.LIQUITY_V2_CLOSE]: {
    strategyOrBundleId: Bundles.MainnetIds.LIQUITY_V2_CLOSE,
    strategyId: Strategies.Identifiers.CloseOnPrice,
    protocol: PROTOCOLS.LiquityV2,
  },
  [Bundles.MainnetIds.LIQUITY_V2_REPAY_ON_PRICE]: {
    strategyOrBundleId: Bundles.MainnetIds.LIQUITY_V2_REPAY_ON_PRICE,
    strategyId: Strategies.Identifiers.RepayOnPrice,
    protocol: PROTOCOLS.LiquityV2,
  },
  [Bundles.MainnetIds.LIQUITY_V2_BOOST_ON_PRICE]: {
    strategyOrBundleId: Bundles.MainnetIds.LIQUITY_V2_BOOST_ON_PRICE,
    strategyId: Strategies.Identifiers.BoostOnPrice,
    protocol: PROTOCOLS.LiquityV2,
  },
  [Bundles.MainnetIds.MORPHO_BLUE_BOOST_ON_PRICE]: {
    strategyOrBundleId: Bundles.MainnetIds.MORPHO_BLUE_BOOST_ON_PRICE,
    strategyId: Strategies.Identifiers.BoostOnPrice,
    protocol: PROTOCOLS.MorphoBlue,
  },
  [Bundles.MainnetIds.FLUID_T1_REPAY]: {
    strategyOrBundleId: Bundles.MainnetIds.FLUID_T1_REPAY,
    strategyId: Strategies.Identifiers.Repay,
    protocol: PROTOCOLS.FluidT1,
  },
  [Bundles.MainnetIds.FLUID_T1_BOOST]: {
    strategyOrBundleId: Bundles.MainnetIds.FLUID_T1_BOOST,
    strategyId: Strategies.Identifiers.Boost,
    protocol: PROTOCOLS.FluidT1,
  },
  [Bundles.MainnetIds.COMP_V3_SW_REPAY_ON_PRICE]: {
    strategyOrBundleId: Bundles.MainnetIds.COMP_V3_SW_REPAY_ON_PRICE,
    strategyId: Strategies.Identifiers.RepayOnPrice,
    protocol: PROTOCOLS.CompoundV3,
  },
  [Bundles.MainnetIds.COMP_V3_SW_BOOST_ON_PRICE]: {
    strategyOrBundleId: Bundles.MainnetIds.COMP_V3_SW_BOOST_ON_PRICE,
    strategyId: Strategies.Identifiers.BoostOnPrice,
    protocol: PROTOCOLS.CompoundV3,
  },
  [Bundles.MainnetIds.COMP_V3_SW_CLOSE]: {
    strategyOrBundleId: Bundles.MainnetIds.COMP_V3_SW_CLOSE,
    strategyId: Strategies.Identifiers.CloseOnPrice,
    protocol: PROTOCOLS.CompoundV3,
  },
  [Bundles.MainnetIds.COMP_V3_EOA_REPAY_ON_PRICE]: {
    strategyOrBundleId: Bundles.MainnetIds.COMP_V3_EOA_REPAY_ON_PRICE,
    strategyId: Strategies.Identifiers.EoaRepayOnPrice,
    protocol: PROTOCOLS.CompoundV3,
  },
  [Bundles.MainnetIds.COMP_V3_EOA_BOOST_ON_PRICE]: {
    strategyOrBundleId: Bundles.MainnetIds.COMP_V3_EOA_BOOST_ON_PRICE,
    strategyId: Strategies.Identifiers.EoaBoostOnPrice,
    protocol: PROTOCOLS.CompoundV3,
  },
  [Bundles.MainnetIds.COMP_V3_EOA_CLOSE]: {
    strategyOrBundleId: Bundles.MainnetIds.COMP_V3_EOA_CLOSE,
    strategyId: Strategies.Identifiers.EoaCloseOnPrice,
    protocol: PROTOCOLS.CompoundV3,
  },
  [Bundles.MainnetIds.AAVE_V3_EOA_REPAY]: {
    strategyOrBundleId: Bundles.MainnetIds.AAVE_V3_EOA_REPAY,
    strategyId: Strategies.Identifiers.EoaRepay,
    protocol: PROTOCOLS.AaveV3,
  },
  [Bundles.MainnetIds.AAVE_V3_EOA_BOOST]: {
    strategyOrBundleId: Bundles.MainnetIds.AAVE_V3_EOA_BOOST,
    strategyId: Strategies.Identifiers.EoaBoost,
    protocol: PROTOCOLS.AaveV3,
  },
  [Bundles.MainnetIds.AAVE_V3_EOA_REPAY_ON_PRICE]: {
    strategyOrBundleId: Bundles.MainnetIds.AAVE_V3_EOA_REPAY_ON_PRICE,
    strategyId: Strategies.Identifiers.EoaRepayOnPrice,
    protocol: PROTOCOLS.AaveV3,
  },
  [Bundles.MainnetIds.AAVE_V3_EOA_BOOST_ON_PRICE]: {
    strategyOrBundleId: Bundles.MainnetIds.AAVE_V3_EOA_BOOST_ON_PRICE,
    strategyId: Strategies.Identifiers.EoaBoostOnPrice,
    protocol: PROTOCOLS.AaveV3,
  },
  [Bundles.MainnetIds.AAVE_V3_EOA_CLOSE]: {
    strategyOrBundleId: Bundles.MainnetIds.AAVE_V3_EOA_CLOSE,
    strategyId: Strategies.Identifiers.EoaCloseOnPrice,
    protocol: PROTOCOLS.AaveV3,
  },

};

export const OPTIMISM_BUNDLES_INFO: OptimismBundleInfo = {
  [Bundles.OptimismIds.AAVE_V3_REPAY]: {
    strategyOrBundleId: Bundles.OptimismIds.AAVE_V3_REPAY,
    strategyId: Strategies.Identifiers.Repay,
    protocol: PROTOCOLS.AaveV3,
  },
  [Bundles.OptimismIds.AAVE_V3_BOOST]: {
    strategyOrBundleId: Bundles.OptimismIds.AAVE_V3_BOOST,
    strategyId: Strategies.Identifiers.Boost,
    protocol: PROTOCOLS.AaveV3,
  },
  [Bundles.OptimismIds.AAVE_V3_CLOSE_TO_DEBT]: {
    strategyOrBundleId: Bundles.OptimismIds.AAVE_V3_CLOSE_TO_DEBT,
    strategyId: Strategies.Identifiers.CloseToDebt,
    protocol: PROTOCOLS.AaveV3,
  },
  [Bundles.OptimismIds.AAVE_V3_CLOSE_TO_COLLATERAL]: {
    strategyOrBundleId: Bundles.OptimismIds.AAVE_V3_CLOSE_TO_COLLATERAL,
    strategyId: Strategies.Identifiers.CloseToCollateral,
    protocol: PROTOCOLS.AaveV3,
  },
  [Bundles.OptimismIds.AAVE_V3_OPEN_ORDER_FROM_COLLATERAL]: {
    strategyOrBundleId: Bundles.OptimismIds.AAVE_V3_OPEN_ORDER_FROM_COLLATERAL,
    strategyId: Strategies.Identifiers.OpenOrderFromCollateral,
    protocol: PROTOCOLS.AaveV3,
  },
  [Bundles.OptimismIds.AAVE_V3_REPAY_ON_PRICE]: {
    strategyOrBundleId: Bundles.OptimismIds.AAVE_V3_REPAY_ON_PRICE,
    strategyId: Strategies.Identifiers.RepayOnPrice,
    protocol: PROTOCOLS.AaveV3,
  },
  [Bundles.OptimismIds.AAVE_V3_EOA_REPAY]: {
    strategyOrBundleId: Bundles.OptimismIds.AAVE_V3_EOA_REPAY,
    strategyId: Strategies.Identifiers.EoaRepay,
    protocol: PROTOCOLS.AaveV3,
  },
  [Bundles.OptimismIds.AAVE_V3_EOA_BOOST]: {
    strategyOrBundleId: Bundles.OptimismIds.AAVE_V3_EOA_BOOST,
    strategyId: Strategies.Identifiers.EoaBoost,
    protocol: PROTOCOLS.AaveV3,
  },
  [Bundles.OptimismIds.AAVE_V3_EOA_REPAY_ON_PRICE]: {
    strategyOrBundleId: Bundles.OptimismIds.AAVE_V3_EOA_REPAY_ON_PRICE,
    strategyId: Strategies.Identifiers.EoaRepayOnPrice,
    protocol: PROTOCOLS.AaveV3,
  },
  [Bundles.OptimismIds.AAVE_V3_EOA_BOOST_ON_PRICE]: {
    strategyOrBundleId: Bundles.OptimismIds.AAVE_V3_EOA_BOOST_ON_PRICE,
    strategyId: Strategies.Identifiers.EoaBoostOnPrice,
    protocol: PROTOCOLS.AaveV3,
  },
  [Bundles.OptimismIds.AAVE_V3_EOA_CLOSE]: {
    strategyOrBundleId: Bundles.OptimismIds.AAVE_V3_EOA_CLOSE,
    strategyId: Strategies.Identifiers.EoaCloseOnPrice,
    protocol: PROTOCOLS.AaveV3,
  },

};

export const BASE_BUNDLES_INFO: BaseBundleInfo = {
  [Bundles.BaseIds.AAVE_V3_REPAY]: {
    strategyOrBundleId: Bundles.BaseIds.AAVE_V3_REPAY,
    strategyId: Strategies.Identifiers.Repay,
    protocol: PROTOCOLS.AaveV3,
  },
  [Bundles.BaseIds.AAVE_V3_BOOST]: {
    strategyOrBundleId: Bundles.BaseIds.AAVE_V3_BOOST,
    strategyId: Strategies.Identifiers.Boost,
    protocol: PROTOCOLS.AaveV3,
  },
  [Bundles.BaseIds.AAVE_V3_CLOSE_TO_DEBT]: {
    strategyOrBundleId: Bundles.BaseIds.AAVE_V3_CLOSE_TO_DEBT,
    strategyId: Strategies.Identifiers.CloseToDebt,
    protocol: PROTOCOLS.AaveV3,
  },
  [Bundles.BaseIds.AAVE_V3_CLOSE_TO_COLLATERAL]: {
    strategyOrBundleId: Bundles.BaseIds.AAVE_V3_CLOSE_TO_COLLATERAL,
    strategyId: Strategies.Identifiers.CloseToCollateral,
    protocol: PROTOCOLS.AaveV3,
  },
  [Bundles.BaseIds.COMP_V3_SW_BOOST_BUNDLE]: {
    strategyOrBundleId: Bundles.BaseIds.COMP_V3_SW_BOOST_BUNDLE,
    strategyId: Strategies.Identifiers.Boost,
    protocol: PROTOCOLS.CompoundV3,
  },
  [Bundles.BaseIds.COMP_V3_SW_REPAY_BUNDLE]: {
    strategyOrBundleId: Bundles.BaseIds.COMP_V3_SW_REPAY_BUNDLE,
    strategyId: Strategies.Identifiers.Repay,
    protocol: PROTOCOLS.CompoundV3,
  },
  [Bundles.BaseIds.MORPHO_BLUE_REPAY]: {
    strategyOrBundleId: Bundles.BaseIds.MORPHO_BLUE_REPAY,
    strategyId: Strategies.Identifiers.Repay,
    protocol: PROTOCOLS.MorphoBlue,
  },
  [Bundles.BaseIds.MORPHO_BLUE_BOOST]: {
    strategyOrBundleId: Bundles.BaseIds.MORPHO_BLUE_BOOST,
    strategyId: Strategies.Identifiers.Boost,
    protocol: PROTOCOLS.MorphoBlue,
  },
  [Bundles.BaseIds.AAVE_V3_OPEN_ORDER_FROM_COLLATERAL]: {
    strategyOrBundleId: Bundles.BaseIds.AAVE_V3_OPEN_ORDER_FROM_COLLATERAL,
    strategyId: Strategies.Identifiers.OpenOrderFromCollateral,
    protocol: PROTOCOLS.AaveV3,
  },
  [Bundles.BaseIds.AAVE_V3_REPAY_ON_PRICE]: {
    strategyOrBundleId: Bundles.BaseIds.AAVE_V3_REPAY_ON_PRICE,
    strategyId: Strategies.Identifiers.RepayOnPrice,
    protocol: PROTOCOLS.AaveV3,
  },
  [Bundles.BaseIds.MORPHO_BLUE_BOOST_ON_PRICE]: {
    strategyOrBundleId: Bundles.BaseIds.MORPHO_BLUE_BOOST_ON_PRICE,
    strategyId: Strategies.Identifiers.BoostOnPrice,
    protocol: PROTOCOLS.MorphoBlue,
  },
  [Bundles.BaseIds.FLUID_T1_REPAY]: {
    strategyOrBundleId: Bundles.BaseIds.FLUID_T1_REPAY,
    strategyId: Strategies.Identifiers.Repay,
    protocol: PROTOCOLS.FluidT1,
  },
  [Bundles.BaseIds.FLUID_T1_BOOST]: {
    strategyOrBundleId: Bundles.BaseIds.FLUID_T1_BOOST,
    strategyId: Strategies.Identifiers.Boost,
    protocol: PROTOCOLS.FluidT1,
  },
  [Bundles.BaseIds.COMP_V3_SW_REPAY_ON_PRICE]: {
    strategyOrBundleId: Bundles.BaseIds.COMP_V3_SW_REPAY_ON_PRICE,
    strategyId: Strategies.Identifiers.RepayOnPrice,
    protocol: PROTOCOLS.CompoundV3,
  },
  [Bundles.BaseIds.COMP_V3_SW_BOOST_ON_PRICE]: {
    strategyOrBundleId: Bundles.BaseIds.COMP_V3_SW_BOOST_ON_PRICE,
    strategyId: Strategies.Identifiers.BoostOnPrice,
    protocol: PROTOCOLS.CompoundV3,
  },
  [Bundles.BaseIds.COMP_V3_SW_CLOSE]: {
    strategyOrBundleId: Bundles.BaseIds.COMP_V3_SW_CLOSE,
    strategyId: Strategies.Identifiers.CloseOnPrice,
    protocol: PROTOCOLS.CompoundV3,
  },
  [Bundles.BaseIds.COMP_V3_EOA_REPAY_ON_PRICE]: {
    strategyOrBundleId: Bundles.BaseIds.COMP_V3_EOA_REPAY_ON_PRICE,
    strategyId: Strategies.Identifiers.EoaRepayOnPrice,
    protocol: PROTOCOLS.CompoundV3,
  },
  [Bundles.BaseIds.COMP_V3_EOA_BOOST_ON_PRICE]: {
    strategyOrBundleId: Bundles.BaseIds.COMP_V3_EOA_BOOST_ON_PRICE,
    strategyId: Strategies.Identifiers.EoaBoostOnPrice,
    protocol: PROTOCOLS.CompoundV3,
  },
  [Bundles.BaseIds.COMP_V3_EOA_CLOSE]: {
    strategyOrBundleId: Bundles.BaseIds.COMP_V3_EOA_CLOSE,
    strategyId: Strategies.Identifiers.EoaCloseOnPrice,
    protocol: PROTOCOLS.CompoundV3,
  },
  [Bundles.BaseIds.COMP_V3_EOA_REPAY]: {
    strategyOrBundleId: Bundles.BaseIds.COMP_V3_EOA_REPAY,
    strategyId: Strategies.Identifiers.EoaRepay,
    protocol: PROTOCOLS.CompoundV3,
  },
  [Bundles.BaseIds.COMP_V3_EOA_BOOST]: {
    strategyOrBundleId: Bundles.BaseIds.COMP_V3_EOA_BOOST,
    strategyId: Strategies.Identifiers.EoaBoost,
    protocol: PROTOCOLS.CompoundV3,
  },
  [Bundles.BaseIds.AAVE_V3_EOA_REPAY]: {
    strategyOrBundleId: Bundles.BaseIds.AAVE_V3_EOA_REPAY,
    strategyId: Strategies.Identifiers.EoaRepay,
    protocol: PROTOCOLS.AaveV3,
  },
  [Bundles.BaseIds.AAVE_V3_EOA_BOOST]: {
    strategyOrBundleId: Bundles.BaseIds.AAVE_V3_EOA_BOOST,
    strategyId: Strategies.Identifiers.EoaBoost,
    protocol: PROTOCOLS.AaveV3,
  },
  [Bundles.BaseIds.AAVE_V3_EOA_REPAY_ON_PRICE]: {
    strategyOrBundleId: Bundles.BaseIds.AAVE_V3_EOA_REPAY_ON_PRICE,
    strategyId: Strategies.Identifiers.EoaRepayOnPrice,
    protocol: PROTOCOLS.AaveV3,
  },
  [Bundles.BaseIds.AAVE_V3_EOA_BOOST_ON_PRICE]: {
    strategyOrBundleId: Bundles.BaseIds.AAVE_V3_EOA_BOOST_ON_PRICE,
    strategyId: Strategies.Identifiers.EoaBoostOnPrice,
    protocol: PROTOCOLS.AaveV3,
  },
  [Bundles.BaseIds.AAVE_V3_EOA_CLOSE]: {
    strategyOrBundleId: Bundles.BaseIds.AAVE_V3_EOA_CLOSE,
    strategyId: Strategies.Identifiers.EoaCloseOnPrice,
    protocol: PROTOCOLS.AaveV3,
  },

};

export const ARBITRUM_BUNDLES_INFO: ArbitrumBundleInfo = {
  [Bundles.ArbitrumIds.AAVE_V3_REPAY]: {
    strategyOrBundleId: Bundles.ArbitrumIds.AAVE_V3_REPAY,
    strategyId: Strategies.Identifiers.Repay,
    protocol: PROTOCOLS.AaveV3,
  },
  [Bundles.ArbitrumIds.AAVE_V3_BOOST]: {
    strategyOrBundleId: Bundles.ArbitrumIds.AAVE_V3_BOOST,
    strategyId: Strategies.Identifiers.Boost,
    protocol: PROTOCOLS.AaveV3,
  },
  [Bundles.ArbitrumIds.AAVE_V3_CLOSE_TO_DEBT]: {
    strategyOrBundleId: Bundles.ArbitrumIds.AAVE_V3_CLOSE_TO_DEBT,
    strategyId: Strategies.Identifiers.CloseToDebt,
    protocol: PROTOCOLS.AaveV3,
  },
  [Bundles.ArbitrumIds.AAVE_V3_CLOSE_TO_COLLATERAL]: {
    strategyOrBundleId: Bundles.ArbitrumIds.AAVE_V3_CLOSE_TO_COLLATERAL,
    strategyId: Strategies.Identifiers.CloseToCollateral,
    protocol: PROTOCOLS.AaveV3,
  },
  [Bundles.ArbitrumIds.COMP_V3_SW_BOOST_BUNDLE]: {
    strategyOrBundleId: Bundles.ArbitrumIds.COMP_V3_SW_BOOST_BUNDLE,
    strategyId: Strategies.Identifiers.Boost,
    protocol: PROTOCOLS.CompoundV3,
  },
  [Bundles.ArbitrumIds.COMP_V3_SW_REPAY_BUNDLE]: {
    strategyOrBundleId: Bundles.ArbitrumIds.COMP_V3_SW_REPAY_BUNDLE,
    strategyId: Strategies.Identifiers.Repay,
    protocol: PROTOCOLS.CompoundV3,
  },
  [Bundles.ArbitrumIds.AAVE_V3_OPEN_ORDER_FROM_COLLATERAL]: {
    strategyOrBundleId: Bundles.ArbitrumIds.AAVE_V3_OPEN_ORDER_FROM_COLLATERAL,
    strategyId: Strategies.Identifiers.OpenOrderFromCollateral,
    protocol: PROTOCOLS.AaveV3,
  },
  [Bundles.ArbitrumIds.AAVE_V3_REPAY_ON_PRICE]: {
    strategyOrBundleId: Bundles.ArbitrumIds.AAVE_V3_REPAY_ON_PRICE,
    strategyId: Strategies.Identifiers.RepayOnPrice,
    protocol: PROTOCOLS.AaveV3,
  },
  [Bundles.ArbitrumIds.FLUID_T1_REPAY]: {
    strategyOrBundleId: Bundles.ArbitrumIds.FLUID_T1_REPAY,
    strategyId: Strategies.Identifiers.Repay,
    protocol: PROTOCOLS.FluidT1,
  },
  [Bundles.ArbitrumIds.FLUID_T1_BOOST]: {
    strategyOrBundleId: Bundles.ArbitrumIds.FLUID_T1_BOOST,
    strategyId: Strategies.Identifiers.Boost,
    protocol: PROTOCOLS.FluidT1,
  },
  [Bundles.ArbitrumIds.COMP_V3_SW_REPAY_ON_PRICE]: {
    strategyOrBundleId: Bundles.ArbitrumIds.COMP_V3_SW_REPAY_ON_PRICE,
    strategyId: Strategies.Identifiers.RepayOnPrice,
    protocol: PROTOCOLS.CompoundV3,
  },
  [Bundles.ArbitrumIds.COMP_V3_SW_BOOST_ON_PRICE]: {
    strategyOrBundleId: Bundles.ArbitrumIds.COMP_V3_SW_BOOST_ON_PRICE,
    strategyId: Strategies.Identifiers.BoostOnPrice,
    protocol: PROTOCOLS.CompoundV3,
  },
  [Bundles.ArbitrumIds.COMP_V3_SW_CLOSE]: {
    strategyOrBundleId: Bundles.ArbitrumIds.COMP_V3_SW_CLOSE,
    strategyId: Strategies.Identifiers.CloseOnPrice,
    protocol: PROTOCOLS.CompoundV3,
  },
  [Bundles.ArbitrumIds.COMP_V3_EOA_REPAY_ON_PRICE]: {
    strategyOrBundleId: Bundles.ArbitrumIds.COMP_V3_EOA_REPAY_ON_PRICE,
    strategyId: Strategies.Identifiers.EoaRepayOnPrice,
    protocol: PROTOCOLS.CompoundV3,
  },
  [Bundles.ArbitrumIds.COMP_V3_EOA_BOOST_ON_PRICE]: {
    strategyOrBundleId: Bundles.ArbitrumIds.COMP_V3_EOA_BOOST_ON_PRICE,
    strategyId: Strategies.Identifiers.EoaBoostOnPrice,
    protocol: PROTOCOLS.CompoundV3,
  },
  [Bundles.ArbitrumIds.COMP_V3_EOA_CLOSE]: {
    strategyOrBundleId: Bundles.ArbitrumIds.COMP_V3_EOA_CLOSE,
    strategyId: Strategies.Identifiers.EoaCloseOnPrice,
    protocol: PROTOCOLS.CompoundV3,
  },
  [Bundles.ArbitrumIds.COMP_V3_EOA_REPAY]: {
    strategyOrBundleId: Bundles.ArbitrumIds.COMP_V3_EOA_REPAY,
    strategyId: Strategies.Identifiers.EoaRepay,
    protocol: PROTOCOLS.CompoundV3,
  },
  [Bundles.ArbitrumIds.COMP_V3_EOA_BOOST]: {
    strategyOrBundleId: Bundles.ArbitrumIds.COMP_V3_EOA_BOOST,
    strategyId: Strategies.Identifiers.EoaBoost,
    protocol: PROTOCOLS.CompoundV3,
  },
  [Bundles.ArbitrumIds.AAVE_V3_EOA_REPAY]: {
    strategyOrBundleId: Bundles.ArbitrumIds.AAVE_V3_EOA_REPAY,
    strategyId: Strategies.Identifiers.EoaRepay,
    protocol: PROTOCOLS.AaveV3,
  },
  [Bundles.ArbitrumIds.AAVE_V3_EOA_BOOST]: {
    strategyOrBundleId: Bundles.ArbitrumIds.AAVE_V3_EOA_BOOST,
    strategyId: Strategies.Identifiers.EoaBoost,
    protocol: PROTOCOLS.AaveV3,
  },
  [Bundles.ArbitrumIds.AAVE_V3_EOA_REPAY_ON_PRICE]: {
    strategyOrBundleId: Bundles.ArbitrumIds.AAVE_V3_EOA_REPAY_ON_PRICE,
    strategyId: Strategies.Identifiers.EoaRepayOnPrice,
    protocol: PROTOCOLS.AaveV3,
  },
  [Bundles.ArbitrumIds.AAVE_V3_EOA_BOOST_ON_PRICE]: {
    strategyOrBundleId: Bundles.ArbitrumIds.AAVE_V3_EOA_BOOST_ON_PRICE,
    strategyId: Strategies.Identifiers.EoaBoostOnPrice,
    protocol: PROTOCOLS.AaveV3,
  },
  [Bundles.ArbitrumIds.AAVE_V3_EOA_CLOSE]: {
    strategyOrBundleId: Bundles.ArbitrumIds.AAVE_V3_EOA_CLOSE,
    strategyId: Strategies.Identifiers.EoaCloseOnPrice,
    protocol: PROTOCOLS.AaveV3,
  },
  [Bundles.ArbitrumIds.MORPHO_BLUE_REPAY]: {
    strategyOrBundleId: Bundles.ArbitrumIds.MORPHO_BLUE_REPAY,
    strategyId: Strategies.Identifiers.Repay,
    protocol: PROTOCOLS.MorphoBlue,
  },
  [Bundles.ArbitrumIds.MORPHO_BLUE_BOOST]: {
    strategyOrBundleId: Bundles.ArbitrumIds.MORPHO_BLUE_BOOST,
    strategyId: Strategies.Identifiers.Boost,
    protocol: PROTOCOLS.MorphoBlue,
  },
  [Bundles.ArbitrumIds.MORPHO_BLUE_BOOST_ON_PRICE]: {
    strategyOrBundleId: Bundles.ArbitrumIds.MORPHO_BLUE_BOOST_ON_PRICE,
    strategyId: Strategies.Identifiers.BoostOnPrice,
    protocol: PROTOCOLS.MorphoBlue,
  },
  [Bundles.ArbitrumIds.MORPHO_BLUE_EOA_REPAY]: {
    strategyOrBundleId: Bundles.ArbitrumIds.MORPHO_BLUE_EOA_REPAY,
    strategyId: Strategies.Identifiers.EoaRepay,
    protocol: PROTOCOLS.MorphoBlue,
  },
  [Bundles.ArbitrumIds.MORPHO_BLUE_EOA_BOOST]: {
    strategyOrBundleId: Bundles.ArbitrumIds.MORPHO_BLUE_EOA_BOOST,
    strategyId: Strategies.Identifiers.EoaBoost,
    protocol: PROTOCOLS.MorphoBlue,
  },
};

export const BUNDLES_INFO: BundlesInfo = {
  [ChainId.Ethereum]: MAINNET_BUNDLES_INFO,
  [ChainId.Optimism]: OPTIMISM_BUNDLES_INFO,
  [ChainId.Arbitrum]: ARBITRUM_BUNDLES_INFO,
  [ChainId.Base]: BASE_BUNDLES_INFO,
};

export const BUNDLE_IDS = {
  [ChainId.Ethereum]: Bundles.MainnetIds,
  [ChainId.Optimism]: Bundles.OptimismIds,
  [ChainId.Arbitrum]: Bundles.ArbitrumIds,
  [ChainId.Base]: Bundles.BaseIds,
};
