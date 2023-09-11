export enum ChainId {
  Ethereum = 1,
  Optimism = 10,
  Arbitrum = 42161,
}

export enum RatioState {
  OVER = 0,
  UNDER = 1,
}

export enum OrderType {
  TAKE_PROFIT = 0,
  STOP_LOSS = 0,
}

export enum BundleProtocols {
  MStable = 'mstable',
  Yearn = 'yearn',
  Rari = 'rari',
}

/**
 * @dev Follow the naming convention:
 *      - Enum name consists of two parts, name and version
 *      - Name should be human-readable name of the protocol, it can include spaces or any characters needed
 *      - Version should be separated from the name with double underscores `__` (If there is no version leave it out)
 *      - Example `Name of ThePROTOCOL__v1` (Without version `Name of ThePROTOCOL`)
 */
export namespace ProtocolIdentifiers {
  export enum StrategiesAutomation {
    MakerDAO = 'MakerDAO',
    Liquity = 'Liquity',
    ChickenBonds = 'Chicken Bonds',
    CompoundV2 = 'Compound__V2',
    CompoundV3 = 'Compound__V3',
    AaveV2 = 'Aave__V2',
    AaveV3 = 'Aave__V3',
    MorphoAaveV2 = 'Morpho-Aave__V2',
    Exchange = 'Exchange',
    Spark = 'Spark',
  }

  export enum LegacyAutomation {
    MakerDAO = 'MakerDAO',
    CompoundV2 = 'Compound__V2',
    AaveV2 = 'Aave__V2',
  }
}

export namespace Strategies {
  export enum MainnetIds {
    MAKER_CLOSE_ON_PRICE_TO_DAI = 7,
    MAKER_CLOSE_ON_PRICE_TO_COLL = 9,
    LIQUITY_CLOSE_ON_PRICE_TO_COLL_DEPRECATED = 10, // replaced with 14
    MAKER_TRAILING_STOP_LOSS_TO_COLL = 11,
    MAKER_TRAILING_STOP_LOSS_TO_DAI = 12,
    LIQUITY_TRAILING_STOP_LOSS_TO_COLL = 13,
    LIQUITY_CLOSE_ON_PRICE_TO_COLL = 14,
    CHICKEN_BONDS_REBOND = 31,
    EXCHANGE_DCA = 46,
    EXCHANGE_LIMIT_ORDER = 51,
    LIQUITY_DSR_PAYBACK = 69,
    LIQUITY_DSR_SUPPLY = 70,
  }

  export enum OptimismIds {
    EXCHANGE_DCA = 8,
    EXCHANGE_LIMIT_ORDER = 9,
  }

  export enum ArbitrumIds {
    EXCHANGE_DCA = 8,
    EXCHANGE_LIMIT_ORDER = 9,
  }

  export enum Identifiers {
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
    BondProtection = 'bond-protection',
    Dca = 'dca',
    LimitOrder = 'limit-order',
  }
  export enum IdOverrides {
    TakeProfit = 'take-profit',
    StopLoss = 'stop-loss',
    TrailingStop = 'trailing-stop',
    LeverageManagement = 'leverage-management',
    EoaLeverageManagement = 'leverage-management-eoa',
  }
}

export namespace Bundles {
  export enum MainnetIds {
    MAKER_REPAY_FROM_SMART_SAVINGS_YEARN = 0,
    MAKER_REPAY_FROM_SMART_SAVINGS_MSTABLE = 1,
    MAKER_REPAY_FROM_SMART_SAVINGS_RARI = 2,
    COMP_V3_SW_REPAY_BUNDLE = 3,
    COMP_V3_SW_BOOST_BUNDLE = 4,
    COMP_V3_EOA_REPAY_BUNDLE = 5,
    COMP_V3_EOA_BOOST_BUNDLE = 6,
    LIQUITY_PAYBACK_USING_CHICKEN_BOND = 7,
    AAVE_V3_REPAY = 8,
    AAVE_V3_BOOST = 9,
    MAKER_REPAY = 10,
    MAKER_BOOST = 11,
    AAVE_V3_CLOSE_TO_DEBT = 12,
    AAVE_V3_CLOSE_TO_COLLATERAL = 13,
    MORPHO_AAVE_V2_REPAY = 14,
    MORPHO_AAVE_V2_BOOST = 15,
    LIQUITY_REPAY = 16,
    LIQUITY_BOOST = 17,
    SPARK_REPAY = 18,
    SPARK_BOOST = 19,
    SPARK_CLOSE_TO_DEBT = -21231230, // @dev This was never deployed
    SPARK_CLOSE_TO_COLLATERAL = -21231231, // @dev This was never deployed
    AAVE_V2_REPAY = 22,
    AAVE_V2_BOOST = 23,
    COMP_V2_REPAY = 20,
    COMP_V2_BOOST = 21,
  }

  export enum OptimismIds {
    AAVE_V3_REPAY = 0,
    AAVE_V3_BOOST = 1,
    AAVE_V3_CLOSE_TO_DEBT = 2,
    AAVE_V3_CLOSE_TO_COLLATERAL = 3,
  }

  export enum ArbitrumIds {
    AAVE_V3_REPAY = 0,
    AAVE_V3_BOOST = 1,
    AAVE_V3_CLOSE_TO_DEBT = 2,
    AAVE_V3_CLOSE_TO_COLLATERAL = 3,
  }
}


