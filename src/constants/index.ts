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
  MAKER_CLOSE_ON_PRICE_TO_DAI_STRATEGY = 7,
  MAKER_CLOSE_ON_PRICE_TO_COLL_STRATEGY = 9,
  LIQUITY_CLOSE_ON_PRICE_TO_COLL_STRATEGY_DEPRECATED = 10, // replaced with 14
  MAKER_TRAILING_STOP_LOSS_TO_COLL_STRATEGY = 11,
  MAKER_TRAILING_STOP_LOSS_TO_DAI_STRATEGY = 12,
  LIQUITY_TRAILING_STOP_LOSS_TO_COLL_STRATEGY = 13,
  LIQUITY_CLOSE_ON_PRICE_TO_COLL_STRATEGY = 14,
  CHICKEN_BONDS_REBOND_STRATEGY = 31,
}

export const enum OptimismStrategies {}
export const enum ArbitrumStrategies {}

// Strategies info
export const MAINNET_STRATEGIES_INFO: MainnetStrategiesInfo = {
  [MainnetStrategies.MAKER_CLOSE_ON_PRICE_TO_DAI_STRATEGY]: {
    strategyId: 'close-on-price-to-debt',
    protocol: PROTOCOLS.MakerDao,
  },
  [MainnetStrategies.MAKER_CLOSE_ON_PRICE_TO_COLL_STRATEGY]: {
    strategyId: 'close-on-price-to-coll',
    protocol: PROTOCOLS.MakerDao,
  },
  [MainnetStrategies.LIQUITY_CLOSE_ON_PRICE_TO_COLL_STRATEGY_DEPRECATED]: {
    strategyId: 'close-on-price-to-coll',
    protocol: PROTOCOLS.Liquity,
  },
  [MainnetStrategies.LIQUITY_CLOSE_ON_PRICE_TO_COLL_STRATEGY]: {
    strategyId: 'close-on-price-to-coll',
    protocol: PROTOCOLS.MakerDao,
  },
  [MainnetStrategies.MAKER_TRAILING_STOP_LOSS_TO_COLL_STRATEGY]: {
    strategyId: 'trailing-stop-coll',
    protocol: PROTOCOLS.MakerDao,
  },
  [MainnetStrategies.MAKER_TRAILING_STOP_LOSS_TO_DAI_STRATEGY]: {
    strategyId: 'trailing-stop-dai',
    protocol: PROTOCOLS.MakerDao,
  },
  [MainnetStrategies.LIQUITY_TRAILING_STOP_LOSS_TO_COLL_STRATEGY]: {
    strategyId: 'trailing-stop-coll',
    protocol: PROTOCOLS.Liquity,
  },
  [MainnetStrategies.CHICKEN_BONDS_REBOND_STRATEGY]: {
    strategyId: 'rebond',
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
  AAVE_V3_CLOSE_BUNDLE_TO_DEBT = 2,
  AAVE_V3_CLOSE_BUNDLE_TO_COLLATERAL = 3,
}

export const enum ArbitrumBundles {
  AAVE_V3_REPAY = 0,
  AAVE_V3_BOOST = 1,
  AAVE_V3_CLOSE_BUNDLE_TO_DEBT = 2,
  AAVE_V3_CLOSE_BUNDLE_TO_COLLATERAL = 3,
}

// Bundles info
export const MAINNET_BUNDLES_INFO: MainnetBundleInfo = {
  [MainnetBundles.MAKER_REPAY_FROM_SMART_SAVINGS_YEARN]: {
    bundleId: ProtocolIds.Yearn,
    bundleName: 'Yearn',
    strategyId: 'smart-savings-liquidation-protection',
    protocol: PROTOCOLS.MakerDao,
  },
  [MainnetBundles.MAKER_REPAY_FROM_SMART_SAVINGS_MSTABLE]: {
    bundleId: ProtocolIds.MStable,
    bundleName: 'mStable',
    strategyId: 'smart-savings-liquidation-protection',
    protocol: PROTOCOLS.MakerDao,
  },
  [MainnetBundles.MAKER_REPAY_FROM_SMART_SAVINGS_RARI]: {
    bundleId: ProtocolIds.Rari,
    bundleName: 'Rari',
    strategyId: 'smart-savings-liquidation-protection',
    protocol: PROTOCOLS.MakerDao,
  },
  [MainnetBundles.COMP_V3_SW_REPAY_BUNDLE]: {
    strategyId: 'compound-v3-repay',
    protocol: PROTOCOLS.CompoundV3,
  },
  [MainnetBundles.COMP_V3_SW_BOOST_BUNDLE]: {
    strategyId: 'compound-v3-boost',
    protocol: PROTOCOLS.CompoundV3,
  },
  [MainnetBundles.COMP_V3_EOA_REPAY_BUNDLE]: {
    strategyId: 'compound-v3-eoa-repay',
    protocol: PROTOCOLS.CompoundV3,
  },
  [MainnetBundles.COMP_V3_EOA_BOOST_BUNDLE]: {
    strategyId: 'compound-v3-eoa-boost',
    protocol: PROTOCOLS.CompoundV3,
  },
};

export const OPTIMISM_BUNDLES_INFO: OptimismBundleInfo = {
  [OptimismBundles.AAVE_V3_REPAY]: {
    strategyId: 'aave-v3-repay',
    protocol: PROTOCOLS.AaveV3,
  },
  [OptimismBundles.AAVE_V3_BOOST]: {
    strategyId: 'aave-v3-boost',
    protocol: PROTOCOLS.AaveV3,
  },
  [OptimismBundles.AAVE_V3_CLOSE_BUNDLE_TO_DEBT]: {
    strategyId: 'aave-v3-close-to-debt',
    protocol: PROTOCOLS.AaveV3,
  },
  [OptimismBundles.AAVE_V3_CLOSE_BUNDLE_TO_COLLATERAL]: {
    strategyId: 'aave-v3-close-to-collateral',
    protocol: PROTOCOLS.AaveV3,
  },
};

export const ARBITRUM_BUNDLES_INFO: ArbitrumBundleInfo = {
  [ArbitrumBundles.AAVE_V3_REPAY]: {
    strategyId: 'aave-v3-repay',
    protocol: PROTOCOLS.AaveV3,
  },
  [ArbitrumBundles.AAVE_V3_BOOST]: {
    strategyId: 'aave-v3-boost',
    protocol: PROTOCOLS.AaveV3,
  },
  [ArbitrumBundles.AAVE_V3_CLOSE_BUNDLE_TO_DEBT]: {
    strategyId: 'aave-v3-close-to-debt',
    protocol: PROTOCOLS.AaveV3,
  },
  [ArbitrumBundles.AAVE_V3_CLOSE_BUNDLE_TO_COLLATERAL]: {
    strategyId: 'aave-v3-close-to-collateral',
    protocol: PROTOCOLS.AaveV3,
  },
};

export const BUNDLES_INFO: BundlesInfo = {
  [ChainId.Ethereum]: MAINNET_BUNDLES_INFO,
  [ChainId.Optimism]: OPTIMISM_BUNDLES_INFO,
  [ChainId.Arbitrum]: ARBITRUM_BUNDLES_INFO,
};
