import type Web3 from 'web3';
import type { AbiItem } from 'web3-utils';
import type { BaseContract, BlockType } from './contracts/generated/types';
import type { Subscribe, StrategyModel } from './contracts/generated/SubStorage';
import type {
  ChainId, Strategies, Bundles, ProtocolIdentifiers,
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
}

export declare namespace Interfaces {
  interface ProtocolBase {
    id: ProtocolIdentifiers.StrategiesAutomation | ProtocolIdentifiers.LegacyAutomation,
    name: string,
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
  }
  interface LegacyAutomation<T extends BaseContract> {
    provider: Web3,
    monitorAddress: EthereumAddress,
    protocol: Interfaces.LegacyProtocol,
    subscriptionsJson: Contract.WithMeta<T>,
  }
}

export interface Strategy {
  strategyId: Strategies.Identifiers,
  protocol: Interfaces.Protocol,
  isBundle?: boolean,
}

export interface BundleOrStrategy extends Strategy {
  bundleId?: string,
  bundleName?: string,
}

export type TriggerData = StrategyModel.StrategySubStructOutputStruct['triggerData'];
export type SubData = StrategyModel.StrategySubStructOutputStruct['subData'];

export type TriggerService = {
  encode?: (...args: any) => TriggerData,
  decode: (triggerData: TriggerData) => any
};

export interface AutomatedPosition {
  chainId: ChainId,
  owner: EthereumAddress,
  isEnabled?: boolean,
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
  specific: any, // TODO type this for every strategy specific?
}

export interface LegacyAutomatedPosition {
  chainId: ChainId,
  owner: EthereumAddress,
  isEnabled: boolean,
  protocol: Interfaces.LegacyProtocol,
  specific: any, // TODO type this for every strategy specific?
}

type StrategyInfo<T extends number> = Record<T, Strategy>;
export type MainnetStrategiesInfo = StrategyInfo<Strategies.MainnetIds>;
export type OptimismStrategiesInfo = StrategyInfo<Strategies.OptimismIds>;
export type ArbitrumStrategiesInfo = StrategyInfo<Strategies.ArbitrumIds>;

type BundleInfo<T extends number> = Record<T, BundleOrStrategy>;
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
  subscriptionEventData: Subscribe['returnValues']
  strategiesSubsData: StrategyModel.StoredSubDataStructOutputStruct,
}

export type StrategiesToProtocolVersionMapping = {
  [i in ProtocolIdentifiers.StrategiesAutomation]: {
    [key in Strategies.Identifiers as string]: (position: AutomatedPosition, parseData: ParseData) => AutomatedPosition
  }
};