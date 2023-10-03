import type Web3 from 'web3';
import type { AbiItem } from 'web3-utils';
import type { BaseContract, BlockType } from './contracts/generated/types';
import type { Subscribe, StrategyModel } from './contracts/generated/SubStorage';
import type {
  ChainId, Strategies, Bundles, ProtocolIdentifiers,
  RatioState,
} from './enums';

export type PlaceholderType = any; // TODO - fix any types

export type EthereumAddress = string;

export type BlockNumber = BlockType;

export declare namespace Utils {
  type WithOptional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

  type WithRequired<T, K extends keyof T> = Partial<Omit<T, K>> & Required<Pick<T, K>>;

  type ValuesOf<E> = E[keyof E];

  type EnumUnion<T> = {
    [k in keyof T]: ValuesOf<T[k]>;
  }[keyof T];
}

export declare namespace Contract {
  interface Json {
    abi: AbiItem[],
    networks?: {
      [key in ChainId as string]: {
        createdBlock?: number,
        address: EthereumAddress,
      }
    }
  }

  interface WithMeta<T> {
    abi: AbiItem[],
    address: EthereumAddress,
    createdBlock: BlockNumber,
    contract: T,
  }
}

export declare namespace Multicall {
  interface Calls {
    abiItem: AbiItem,
    target: EthereumAddress,
    gasLimit?: number,
    params: any[],
  }

  interface FormattedCalls {
    callData: string,
    target: EthereumAddress,
    gasLimit: number,
  }

  type Payload = any[];
}

export interface SubscriptionOptions {
  toBlock: BlockNumber,
  fromBlock: BlockNumber,
  mergeWithSameId?: boolean,
}

export declare namespace Interfaces {
  interface ProtocolBase {
    id: ProtocolIdentifiers.StrategiesAutomation | ProtocolIdentifiers.LegacyAutomation,
    name: string,
    slug: string,
    fullName: string,
    version: string,
  }

  interface Protocol extends ProtocolBase {
    id: ProtocolIdentifiers.StrategiesAutomation,
  }

  interface LegacyProtocol extends ProtocolBase {
    id: ProtocolIdentifiers.LegacyAutomation,
  }

  interface Automation {
    provider: Web3,
    providerFork: Web3,
  }
  interface LegacyAutomation<T extends BaseContract> {
    provider: Web3,
    monitorAddress: EthereumAddress,
    protocol: Interfaces.LegacyProtocol,
    subscriptionsJson: Contract.WithMeta<T>,
  }
}

export interface Strategy<T = StrategyOrBundleIds> {
  strategyOrBundleId: T,
  strategyId: Strategies.Identifiers | Strategies.IdOverrides,
  protocol: Interfaces.Protocol,
  isBundle?: boolean,
}

export interface BundleOrStrategy<T = StrategyOrBundleIds> extends Strategy<T> {
  bundleId?: string,
  bundleName?: string,
}

export type TriggerData = StrategyModel.StrategySubStructOutputStruct['triggerData'];
export type SubData = StrategyModel.StrategySubStructOutputStruct['subData'];

export declare namespace Position {
  namespace Specific {
    interface Base {
      subId1?: number,
      subId2?: number,
      mergeWithSameId?: boolean
    }
    interface RatioProtection extends Base {
      triggerRepayRatio?: number,
      targetRepayRatio?: number,
      repayEnabled?: boolean,
      triggerBoostRatio?: number,
      targetBoostRatio?: number,
      boostEnabled?: boolean,
    }
    interface CloseOnPrice extends Base {
      price: string,
      closeToAssetAddr: EthereumAddress,
    }
    interface CloseOnPriceAave extends Base {
      collAsset: EthereumAddress,
      collAssetId: number,
      debtAsset: EthereumAddress,
      debtAssetId: number,
      baseToken: EthereumAddress,
      quoteToken: EthereumAddress,
      price: string,
      ratioState: RatioState,
    }

    interface CloseOnPriceWithMaximumGasPriceAave extends Base {
      collAsset: EthereumAddress,
      collAssetId: number,
      debtAsset: EthereumAddress,
      debtAssetId: number,
      baseToken: EthereumAddress,
      quoteToken: EthereumAddress,
      price: string,
      maximumGasPrice: string,
      ratioState: RatioState,
    }

    interface TrailingStop extends Base {
      roundId: number,
      triggerPercentage: number,
      closeToAssetAddr: EthereumAddress,
    }
  }

  type SpecificAny = Specific.CloseOnPrice | Specific.TrailingStop | Specific.RatioProtection | Specific.CloseOnPriceAave | Specific.CloseOnPriceWithMaximumGasPriceAave;

  export interface Automated {
    chainId: ChainId,
    owner: EthereumAddress,
    subId: number,
    subIds?: number[],
    isEnabled?: boolean,
    subHash: string,
    blockNumber: BlockNumber,
    protocol: Interfaces.Protocol,
    strategy: BundleOrStrategy,
    strategyData: {
      encoded: {
        triggerData: TriggerData,
        subData: SubData,
      },
      decoded: { // TODO type this?
        triggerData: PlaceholderType,
        subData: PlaceholderType,
      },
    },
    specific: SpecificAny,
  }

  export interface LegacyAutomated {
    chainId: ChainId,
    owner: EthereumAddress,
    isEnabled: boolean,
    protocol: Interfaces.LegacyProtocol,
    strategy: {
      strategyId: string,
      protocol: Interfaces.Protocol,
    },
    specific: any,
  }
}

type StrategyInfo<T extends number> = Record<T, Strategy<T>>;
export type MainnetStrategiesInfo = StrategyInfo<Strategies.MainnetIds>;
export type OptimismStrategiesInfo = StrategyInfo<Strategies.OptimismIds>;
export type ArbitrumStrategiesInfo = StrategyInfo<Strategies.ArbitrumIds>;

type BundleInfo<T extends number> = Record<T, BundleOrStrategy<T>>;
export type MainnetBundleInfo = BundleInfo<Bundles.MainnetIds>;
export type OptimismBundleInfo = BundleInfo<Bundles.OptimismIds>;
export type ArbitrumBundleInfo = BundleInfo<Bundles.ArbitrumIds>;

export interface StrategiesInfo {
  [ChainId.Ethereum]: MainnetStrategiesInfo,
  [ChainId.Optimism]: OptimismStrategiesInfo,
  [ChainId.Arbitrum]: ArbitrumStrategiesInfo
}

export interface BundlesInfo {
  [ChainId.Ethereum]: MainnetBundleInfo,
  [ChainId.Optimism]: OptimismBundleInfo,
  [ChainId.Arbitrum]: ArbitrumBundleInfo
}

export type StrategyOrBundleIds =
  Strategies.MainnetIds & Strategies.OptimismIds & Strategies.ArbitrumIds
  & Bundles.MainnetIds & Bundles.OptimismIds & Bundles.ArbitrumIds;

export interface ParseData {
  chainId: ChainId,
  blockNumber: BlockNumber,
  subscriptionEventData: Subscribe['returnValues']
  strategiesSubsData: StrategyModel.StoredSubDataStructOutputStruct,
}

type MapToProtocolVersion<T> = {
  [i in ProtocolIdentifiers.StrategiesAutomation]: {
    [key in Strategies.Identifiers as string]: T
  }
};

export type StrategiesToProtocolVersionMapping = MapToProtocolVersion<(position: Position.Automated, parseData: ParseData, chainId: ChainId) => Position.Automated>;
