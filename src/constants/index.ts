import type {
  MainnetStrategiesInfo, MainnetBundleInfo, OptimismBundleInfo, ArbitrumBundleInfo,
  StrategiesInfo, BundlesInfo, EthereumAddress,
} from '../types';

// General
export const ZERO_ADDRESS: EthereumAddress = '0x0000000000000000000000000000000000000000';

export enum ChainId {
  Ethereum = 1,
  Optimism = 10,
  Arbitrum = 42161,
}

export const enum ProtocolIds {
  MakerDAO = 'makerdao',
  Liquity = 'liquity',
  ChickenBonds = 'chicken-bonds',
  Compound = 'compound',
  Aave = 'aave',
  MStable = 'mstable',
  Yearn = 'yearn',
  Rari = 'rari',
}

export const PROTOCOLS = {
  MakerDao: {
    id: ProtocolIds.MakerDAO,
    name: 'MakerDAO',
    version: 'mcd',
  },
  Liquity: {
    id: ProtocolIds.Liquity,
    name: 'Liquity',
    version: 'v1',
  },
  ChickenBonds: {
    id: ProtocolIds.ChickenBonds,
    name: 'Chicken Bonds',
    version: 'v1',
  },
  AaveV2: {
    id: ProtocolIds.Aave,
    name: 'Aave',
    version: 'v2',
  },
  AaveV3: {
    id: ProtocolIds.Aave,
    name: 'Aave',
    version: 'v3',
  },
  CompoundV2: {
    id: ProtocolIds.Compound,
    name: 'Compound',
    version: 'v2',
  },
  CompoundV3: {
    id: ProtocolIds.Compound,
    name: 'Compound',
    version: 'v3',
  },
};

export const enum RatioState {
  OVER = 0,
  UNDER = 1,
}

// Strategies
export const enum MainnetStrategies {
  MAKER_CLOSE_ON_PRICE_TO_DAI = 7,
  MAKER_CLOSE_ON_PRICE_TO_COLL = 9,
  LIQUITY_CLOSE_ON_PRICE_TO_COLL_DEPRECATED = 10, // replaced with 14
  MAKER_TRAILING_STOP_LOSS_TO_COLL = 11,
  MAKER_TRAILING_STOP_LOSS_TO_DAI = 12,
  LIQUITY_TRAILING_STOP_LOSS_TO_COLL = 13,
  LIQUITY_CLOSE_ON_PRICE_TO_COLL = 14,
  CHICKEN_BONDS_REBOND = 31,
}

export const enum OptimismStrategies {}

export const enum ArbitrumStrategies {}

export const enum StrategiesIds {
  SavingsLiqProtection = 'smart-savings-liquidation-protection',
  Repay = 'repay',
  EoaRepay = 'eoa-repay',
  Boost = 'boost',
  EoaBoost = 'eoa-boost',
  CloseToDebt = 'close-to-debt',
  CloseToCollateral = 'close-to-collateral',
  CloseOnPriceToDebt = 'close-on-price-to-debt',
  CloseOnPriceToColl = 'close-on-price-to-collateral',
  TrailingStopToColl = 'trailing-stop-to-collateral',
  TrailingStopToDebt = 'trailing-stop-to-debt',
  Rebond = 'rebond',
}

// Strategies info
export const MAINNET_STRATEGIES_INFO: MainnetStrategiesInfo = {
  [MainnetStrategies.MAKER_CLOSE_ON_PRICE_TO_DAI]: {
    strategyId: StrategiesIds.CloseOnPriceToDebt,
    protocol: PROTOCOLS.MakerDao,
  },
  [MainnetStrategies.MAKER_CLOSE_ON_PRICE_TO_COLL]: {
    strategyId: StrategiesIds.CloseOnPriceToColl,
    protocol: PROTOCOLS.MakerDao,
  },
  [MainnetStrategies.LIQUITY_CLOSE_ON_PRICE_TO_COLL_DEPRECATED]: {
    strategyId: StrategiesIds.CloseOnPriceToColl,
    protocol: PROTOCOLS.Liquity,
  },
  [MainnetStrategies.LIQUITY_CLOSE_ON_PRICE_TO_COLL]: {
    strategyId: StrategiesIds.CloseOnPriceToColl,
    protocol: PROTOCOLS.MakerDao,
  },
  [MainnetStrategies.MAKER_TRAILING_STOP_LOSS_TO_COLL]: {
    strategyId: StrategiesIds.TrailingStopToColl,
    protocol: PROTOCOLS.MakerDao,
  },
  [MainnetStrategies.MAKER_TRAILING_STOP_LOSS_TO_DAI]: {
    strategyId: StrategiesIds.TrailingStopToDebt,
    protocol: PROTOCOLS.MakerDao,
  },
  [MainnetStrategies.LIQUITY_TRAILING_STOP_LOSS_TO_COLL]: {
    strategyId: StrategiesIds.TrailingStopToColl,
    protocol: PROTOCOLS.Liquity,
  },
  [MainnetStrategies.CHICKEN_BONDS_REBOND]: {
    strategyId: StrategiesIds.Rebond,
    protocol: PROTOCOLS.ChickenBonds,
  },
};

export const OPTIMISM_STRATEGIES_INFO = {};

export const ARBITRUM_STRATEGIES_INFO = {};

export const STRATEGIES_INFO: StrategiesInfo = {
  [ChainId.Ethereum]: MAINNET_STRATEGIES_INFO,
  [ChainId.Optimism]: OPTIMISM_STRATEGIES_INFO,
  [ChainId.Arbitrum]: ARBITRUM_STRATEGIES_INFO,
};

// Bundles
export const enum MainnetBundles {
  MAKER_REPAY_FROM_SMART_SAVINGS_YEARN = 0,
  MAKER_REPAY_FROM_SMART_SAVINGS_MSTABLE = 1,
  MAKER_REPAY_FROM_SMART_SAVINGS_RARI = 2,
  COMP_V3_SW_REPAY_BUNDLE = 3,
  COMP_V3_SW_BOOST_BUNDLE = 4,
  COMP_V3_EOA_REPAY_BUNDLE = 5,
  COMP_V3_EOA_BOOST_BUNDLE = 6,
}

export const enum OptimismBundles {
  AAVE_V3_REPAY = 0,
  AAVE_V3_BOOST = 1,
  AAVE_V3_CLOSE_TO_DEBT = 2,
  AAVE_V3_CLOSE_TO_COLLATERAL = 3,
}

export const enum ArbitrumBundles {
  AAVE_V3_REPAY = 0,
  AAVE_V3_BOOST = 1,
  AAVE_V3_CLOSE_TO_DEBT = 2,
  AAVE_V3_CLOSE_TO_COLLATERAL = 3,
}

// Bundles info
export const MAINNET_BUNDLES_INFO: MainnetBundleInfo = {
  [MainnetBundles.MAKER_REPAY_FROM_SMART_SAVINGS_YEARN]: {
    bundleId: ProtocolIds.Yearn,
    bundleName: 'Yearn', // msm da se bundleName-ovi ne koriste nigde na frontu?
    strategyId: StrategiesIds.SavingsLiqProtection,
    protocol: PROTOCOLS.MakerDao,
  },
  [MainnetBundles.MAKER_REPAY_FROM_SMART_SAVINGS_MSTABLE]: {
    bundleId: ProtocolIds.MStable,
    bundleName: 'mStable',
    strategyId: StrategiesIds.SavingsLiqProtection,
    protocol: PROTOCOLS.MakerDao,
  },
  [MainnetBundles.MAKER_REPAY_FROM_SMART_SAVINGS_RARI]: {
    bundleId: ProtocolIds.Rari,
    bundleName: 'Rari',
    strategyId: StrategiesIds.SavingsLiqProtection,
    protocol: PROTOCOLS.MakerDao,
  },
  [MainnetBundles.COMP_V3_SW_REPAY_BUNDLE]: {
    strategyId: StrategiesIds.Repay,
    protocol: PROTOCOLS.CompoundV3,
  },
  [MainnetBundles.COMP_V3_SW_BOOST_BUNDLE]: {
    strategyId: StrategiesIds.Boost,
    protocol: PROTOCOLS.CompoundV3,
  },
  [MainnetBundles.COMP_V3_EOA_REPAY_BUNDLE]: {
    strategyId: StrategiesIds.EoaRepay,
    protocol: PROTOCOLS.CompoundV3,
  },
  [MainnetBundles.COMP_V3_EOA_BOOST_BUNDLE]: {
    strategyId: StrategiesIds.EoaBoost,
    protocol: PROTOCOLS.CompoundV3,
  },
};

export const OPTIMISM_BUNDLES_INFO: OptimismBundleInfo = {
  [OptimismBundles.AAVE_V3_REPAY]: {
    strategyId: StrategiesIds.Repay,
    protocol: PROTOCOLS.AaveV3,
  },
  [OptimismBundles.AAVE_V3_BOOST]: {
    strategyId: StrategiesIds.Boost,
    protocol: PROTOCOLS.AaveV3,
  },
  [OptimismBundles.AAVE_V3_CLOSE_TO_DEBT]: {
    strategyId: StrategiesIds.CloseToDebt,
    protocol: PROTOCOLS.AaveV3,
  },
  [OptimismBundles.AAVE_V3_CLOSE_TO_COLLATERAL]: {
    strategyId: StrategiesIds.CloseToCollateral,
    protocol: PROTOCOLS.AaveV3,
  },
};

export const ARBITRUM_BUNDLES_INFO: ArbitrumBundleInfo = {
  [ArbitrumBundles.AAVE_V3_REPAY]: {
    strategyId: StrategiesIds.Repay,
    protocol: PROTOCOLS.AaveV3,
  },
  [ArbitrumBundles.AAVE_V3_BOOST]: {
    strategyId: StrategiesIds.Boost,
    protocol: PROTOCOLS.AaveV3,
  },
  [ArbitrumBundles.AAVE_V3_CLOSE_TO_DEBT]: {
    strategyId: StrategiesIds.CloseToDebt,
    protocol: PROTOCOLS.AaveV3,
  },
  [ArbitrumBundles.AAVE_V3_CLOSE_TO_COLLATERAL]: {
    strategyId: StrategiesIds.CloseToCollateral,
    protocol: PROTOCOLS.AaveV3,
  },
};

export const BUNDLES_INFO: BundlesInfo = {
  [ChainId.Ethereum]: MAINNET_BUNDLES_INFO,
  [ChainId.Optimism]: OPTIMISM_BUNDLES_INFO,
  [ChainId.Arbitrum]: ARBITRUM_BUNDLES_INFO,
};
