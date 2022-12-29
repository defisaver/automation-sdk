import type {
  ArbitrumBundleInfo, BundlesInfo, EthereumAddress, Interfaces, MainnetBundleInfo, MainnetStrategiesInfo, OptimismBundleInfo, StrategiesInfo,
} from '../types';

import {
  ChainId, ProtocolIdentifiers, Strategies, Bundles, BundleProtocols,
} from '../types/enums';

import Protocol from '../automation/private/Protocol';
import LegacyProtocol from '../automation/private/LegacyProtocol';

// General
export const ZERO_ADDRESS: EthereumAddress = '0x0000000000000000000000000000000000000000';

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
    strategyId: Strategies.Identifiers.CloseOnPriceToDebt,
    protocol: PROTOCOLS.MakerDAO,
  },
  [Strategies.MainnetIds.MAKER_CLOSE_ON_PRICE_TO_COLL]: {
    strategyId: Strategies.Identifiers.CloseOnPriceToColl,
    protocol: PROTOCOLS.MakerDAO,
  },
  [Strategies.MainnetIds.LIQUITY_CLOSE_ON_PRICE_TO_COLL_DEPRECATED]: {
    strategyId: Strategies.Identifiers.CloseOnPriceToColl,
    protocol: PROTOCOLS.Liquity,
  },
  [Strategies.MainnetIds.LIQUITY_CLOSE_ON_PRICE_TO_COLL]: {
    strategyId: Strategies.Identifiers.CloseOnPriceToColl,
    protocol: PROTOCOLS.MakerDAO,
  },
  [Strategies.MainnetIds.MAKER_TRAILING_STOP_LOSS_TO_COLL]: {
    strategyId: Strategies.Identifiers.TrailingStopToColl,
    protocol: PROTOCOLS.MakerDAO,
  },
  [Strategies.MainnetIds.MAKER_TRAILING_STOP_LOSS_TO_DAI]: {
    strategyId: Strategies.Identifiers.TrailingStopToDebt,
    protocol: PROTOCOLS.MakerDAO,
  },
  [Strategies.MainnetIds.LIQUITY_TRAILING_STOP_LOSS_TO_COLL]: {
    strategyId: Strategies.Identifiers.TrailingStopToColl,
    protocol: PROTOCOLS.Liquity,
  },
  [Strategies.MainnetIds.CHICKEN_BONDS_REBOND]: {
    strategyId: Strategies.Identifiers.Rebond,
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

// Bundles info
export const MAINNET_BUNDLES_INFO: MainnetBundleInfo = {
  [Bundles.MainnetIds.MAKER_REPAY_FROM_SMART_SAVINGS_YEARN]: {
    bundleId: BundleProtocols.Yearn,
    bundleName: 'Yearn',
    strategyId: Strategies.Identifiers.SavingsLiqProtection,
    protocol: PROTOCOLS.MakerDAO,
  },
  [Bundles.MainnetIds.MAKER_REPAY_FROM_SMART_SAVINGS_MSTABLE]: {
    bundleId: BundleProtocols.MStable,
    bundleName: 'mStable',
    strategyId: Strategies.Identifiers.SavingsLiqProtection,
    protocol: PROTOCOLS.MakerDAO,
  },
  [Bundles.MainnetIds.MAKER_REPAY_FROM_SMART_SAVINGS_RARI]: {
    bundleId: BundleProtocols.Rari,
    bundleName: 'Rari',
    strategyId: Strategies.Identifiers.SavingsLiqProtection,
    protocol: PROTOCOLS.MakerDAO,
  },
  [Bundles.MainnetIds.COMP_V3_SW_REPAY_BUNDLE]: {
    strategyId: Strategies.Identifiers.Repay,
    protocol: PROTOCOLS.CompoundV3,
  },
  [Bundles.MainnetIds.COMP_V3_SW_BOOST_BUNDLE]: {
    strategyId: Strategies.Identifiers.Boost,
    protocol: PROTOCOLS.CompoundV3,
  },
  [Bundles.MainnetIds.COMP_V3_EOA_REPAY_BUNDLE]: {
    strategyId: Strategies.Identifiers.EoaRepay,
    protocol: PROTOCOLS.CompoundV3,
  },
  [Bundles.MainnetIds.COMP_V3_EOA_BOOST_BUNDLE]: {
    strategyId: Strategies.Identifiers.EoaBoost,
    protocol: PROTOCOLS.CompoundV3,
  },
  [Bundles.MainnetIds.LIQUITY_PAYBACK_USING_CHICKEN_BOND]: {
    strategyId: Strategies.Identifiers.BondProtection,
    protocol: PROTOCOLS.Liquity,
  },
};

export const OPTIMISM_BUNDLES_INFO: OptimismBundleInfo = {
  [Bundles.OptimismIds.AAVE_V3_REPAY]: {
    strategyId: Strategies.Identifiers.Repay,
    protocol: PROTOCOLS.AaveV3,
  },
  [Bundles.OptimismIds.AAVE_V3_BOOST]: {
    strategyId: Strategies.Identifiers.Boost,
    protocol: PROTOCOLS.AaveV3,
  },
  [Bundles.OptimismIds.AAVE_V3_CLOSE_TO_DEBT]: {
    strategyId: Strategies.Identifiers.CloseToDebt,
    protocol: PROTOCOLS.AaveV3,
  },
  [Bundles.OptimismIds.AAVE_V3_CLOSE_TO_COLLATERAL]: {
    strategyId: Strategies.Identifiers.CloseToCollateral,
    protocol: PROTOCOLS.AaveV3,
  },
};

export const ARBITRUM_BUNDLES_INFO: ArbitrumBundleInfo = {
  [Bundles.ArbitrumIds.AAVE_V3_REPAY]: {
    strategyId: Strategies.Identifiers.Repay,
    protocol: PROTOCOLS.AaveV3,
  },
  [Bundles.ArbitrumIds.AAVE_V3_BOOST]: {
    strategyId: Strategies.Identifiers.Boost,
    protocol: PROTOCOLS.AaveV3,
  },
  [Bundles.ArbitrumIds.AAVE_V3_CLOSE_TO_DEBT]: {
    strategyId: Strategies.Identifiers.CloseToDebt,
    protocol: PROTOCOLS.AaveV3,
  },
  [Bundles.ArbitrumIds.AAVE_V3_CLOSE_TO_COLLATERAL]: {
    strategyId: Strategies.Identifiers.CloseToCollateral,
    protocol: PROTOCOLS.AaveV3,
  },
};

export const BUNDLES_INFO: BundlesInfo = {
  [ChainId.Ethereum]: MAINNET_BUNDLES_INFO,
  [ChainId.Optimism]: OPTIMISM_BUNDLES_INFO,
  [ChainId.Arbitrum]: ARBITRUM_BUNDLES_INFO,
};
