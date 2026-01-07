import type Web3 from 'web3';
import type { AbiItem } from 'web3-utils';
import type { BaseContract, BlockType } from './contracts/generated/types';
import type { Subscribe, StrategyModel } from './contracts/generated/SubStorage';
import type {
  ChainId, Strategies, Bundles, ProtocolIdentifiers,
  RatioState,
  CloseToAssetType,
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

interface _SubscriptionOptions {
  toBlock: BlockNumber,
  fromBlock: BlockNumber,
  mergeSubs: boolean,
  enabledOnly: boolean,
  unexpiredOnly: boolean,
}

export type SubscriptionOptions = Partial<_SubscriptionOptions>;

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
    providerFork?: Web3,
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
      mergeWithId?: Strategies.Identifiers,
      mergeId?: Strategies.Identifiers
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

    interface AaveV3CloseOnPriceGeneric extends Base {
      collAsset: EthereumAddress,
      collAssetId: number,
      debtAsset: EthereumAddress,
      debtAssetId: number,
      baseToken: EthereumAddress,
      quoteToken: EthereumAddress,
      stopLossPrice: string,
      takeProfitPrice: string,
    }

    interface BoostOnPriceAave extends CloseOnPriceAave {
      ratio: number,
    }

    interface BoostOnPriceMorpho extends Base {
      marketId: string;
      subHash: string;
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

    interface CloseOnPriceLiquityV2 extends Base {
      market: EthereumAddress,
      troveId: string,
      stopLossPrice: string,
      takeProfitPrice: string,
      closeToAssetAddr: EthereumAddress,
      stopLossType: CloseToAssetType | undefined,
      takeProfitType: CloseToAssetType | undefined,
    }

    interface BoostOnPriceLiquityV2 extends Base {
      market: EthereumAddress,
      troveId: string,
      subHash: string;
    }

    interface PaybackLiquityV2 extends Base {
      market: EthereumAddress,
      troveId: string,
      targetRatio: number;
      triggerRatio: number;
    }

    interface TrailingStop extends Base {
      roundId: number,
      triggerPercentage: number,
      closeToAssetAddr: EthereumAddress,
    }

    interface DebtInFrontRepay extends Base {
      debtInFrontMin: string,
      targetRepayRatioIncrease: number,
    }

    interface LeverageManagementCrvUSD extends Base {
      subHashBoost?: string,
      subHashRepay?: string,
    }

    interface CompoundV3Base extends Base {
      market: EthereumAddress,
      collToken: EthereumAddress,
      baseToken: EthereumAddress,
    }

    interface CompoundV3LeverageManagementOnPrice extends CompoundV3Base {
      ratio: number,
      price: string,
      priceState: RatioState,
    }

    interface CompoundV3CloseOnPrice extends CompoundV3Base {
      stopLossPrice: string,
      takeProfitPrice: string,
      stopLossType: CloseToAssetType | undefined,
      takeProfitType: CloseToAssetType | undefined,
    }

    interface SparkOnPrice extends Base {
      collAsset: EthereumAddress,
      collAssetId: number,
      debtAsset: EthereumAddress,
      debtAssetId: number,
      baseToken: EthereumAddress,
      quoteToken: EthereumAddress,
      price: string,
      ratioState: RatioState,
      ratio: number,
    }
  }

  type SpecificAny =
    Specific.CloseOnPrice
    | Specific.TrailingStop
    | Specific.RatioProtection
    | Specific.CloseOnPriceAave
    | Specific.BoostOnPriceAave
    | Specific.CloseOnPriceWithMaximumGasPriceAave
    | Specific.DebtInFrontRepay
    | Specific.LeverageManagementCrvUSD
    | Specific.CloseOnPriceLiquityV2
    | Specific.BoostOnPriceMorpho
    | Specific.BoostOnPriceLiquityV2
    | Specific.PaybackLiquityV2
    | Specific.CompoundV3LeverageManagementOnPrice
    | Specific.CompoundV3CloseOnPrice
    | Specific.AaveV3CloseOnPriceGeneric
    | Specific.SparkOnPrice;

  export interface Automated {
    chainId: ChainId,
    positionId: string, // Helps to unify all strategies connected to a specific position
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
export type BaseStrategiesInfo = StrategyInfo<Strategies.BaseIds>;
export type StrategyInfoUnion = MainnetStrategiesInfo | OptimismStrategiesInfo | ArbitrumStrategiesInfo | BaseStrategiesInfo;

type BundleInfo<T extends number> = Record<T, BundleOrStrategy<T>>;
export type MainnetBundleInfo = BundleInfo<Bundles.MainnetIds>;
export type OptimismBundleInfo = BundleInfo<Bundles.OptimismIds>;
export type ArbitrumBundleInfo = BundleInfo<Bundles.ArbitrumIds>;
export type BaseBundleInfo = BundleInfo<Bundles.BaseIds>;
export type BundleInfoUnion = MainnetBundleInfo | OptimismBundleInfo | ArbitrumBundleInfo | BaseBundleInfo;

export interface StrategiesInfo {
  [ChainId.Ethereum]: MainnetStrategiesInfo,
  [ChainId.Optimism]: OptimismStrategiesInfo,
  [ChainId.Arbitrum]: ArbitrumStrategiesInfo,
  [ChainId.Base]: BaseStrategiesInfo,
}

export interface BundlesInfo {
  [ChainId.Ethereum]: MainnetBundleInfo,
  [ChainId.Optimism]: OptimismBundleInfo,
  [ChainId.Arbitrum]: ArbitrumBundleInfo,
  [ChainId.Base]: BaseBundleInfo,
}

export type StrategyOrBundleIds =
  typeof Strategies.MainnetIds[keyof typeof Strategies.MainnetIds]
  | typeof Strategies.OptimismIds[keyof typeof Strategies.OptimismIds]
  | typeof Strategies.ArbitrumIds[keyof typeof Strategies.ArbitrumIds]
  | typeof Strategies.BaseIds[keyof typeof Strategies.BaseIds]
  | typeof Bundles.MainnetIds[keyof typeof Bundles.MainnetIds]
  | typeof Bundles.OptimismIds[keyof typeof Bundles.OptimismIds]
  | typeof Bundles.ArbitrumIds[keyof typeof Bundles.ArbitrumIds]
  | typeof Bundles.BaseIds[keyof typeof Bundles.BaseIds];

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
