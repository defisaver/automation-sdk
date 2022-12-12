import type { AbiItem } from 'web3-utils';
import type Web3 from 'web3';
import type {
  ChainId, ProtocolIds,
  MainnetBundles, ArbitrumBundles, OptimismBundles,
  MainnetStrategies, OptimismStrategies, ArbitrumStrategies,
} from '../constants';

export type WithOptional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

export type WithRequired<T, K extends keyof T> = Partial<Omit<T, K>> & Required<Pick<T, K>>;

export type EthereumAddress = string;

export type BlockNumber = string | number | 'latest' | 'pending' | 'earliest' | 'genesis';

export interface ContractJson {
  abi: AbiItem[],
  networks: {
    [key in ChainId as string]: {
      createdBlock: number,
      address: EthereumAddress,
    }
  }
}

export interface Protocol {
  id: ProtocolIds,
  name: string,
  version: string,
}

export interface Strategy {
  strategyId: string,
  protocol: Protocol,
  isBundle?: boolean,
}

export interface BundleOrStrategy extends Strategy {
  bundleId?: string,
  bundleName?: string,
}

export interface AutomatedPosition {
  chainId: ChainId,
  owner: EthereumAddress,
  isEnabled?: boolean,
  protocol: Protocol,
  strategy: BundleOrStrategy,
  strategyData: {
    encoded: { // TODO type this?
      triggerData: any,
      subData: any,
    },
    decoded: { // TODO type this?
      triggerData: any,
      subData: any,
    },
  },
  specific: any, // TODO type this for every strategy specific?
}

export interface LegacyAutomatedPosition {
  chainId: ChainId,
  owner: EthereumAddress,
  isEnabled: boolean,
  protocol: Protocol,
  specific: any, // TODO type this for every strategy specific?
}

type StrategyInfo<T extends number> = Record<T, Strategy>;
export type MainnetStrategiesInfo = StrategyInfo<MainnetStrategies>;
export type OptimismStrategiesInfo = StrategyInfo<OptimismStrategies>;
export type ArbitrumStrategiesInfo = StrategyInfo<ArbitrumStrategies>;

type BundleInfo<T extends number> = Record<T, BundleOrStrategy>;
export type MainnetBundleInfo = BundleInfo<MainnetBundles>;
export type OptimismBundleInfo = BundleInfo<OptimismBundles>;
export type ArbitrumBundleInfo = BundleInfo<ArbitrumBundles>;

export type StrategiesInfo = {
  [key in ChainId]: MainnetStrategiesInfo | OptimismStrategiesInfo | ArbitrumStrategiesInfo
};

export type BundlesInfo = {
  [key in ChainId]: MainnetBundleInfo | OptimismBundleInfo | ArbitrumBundleInfo
};

export type StrategyOrBundleIds =
  MainnetStrategies & OptimismStrategies & ArbitrumStrategies
  & MainnetBundles & OptimismBundles & ArbitrumBundles;

export interface AutomationConstructorParams {
  provider: Web3,
}

export interface LegacyAutomationConstructorParams {
  provider: Web3,
  monitorAddress: EthereumAddress,
  protocol: Protocol,
  subscriptionsJson: any,
}

export type PlaceholderType = any; // TODO - fix any types