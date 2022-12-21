export enum ChainId {
  Ethereum = 1,
  Optimism = 10,
  Arbitrum = 42161,
}

export const enum RatioState {
  OVER = 0,
  UNDER = 1,
}

export const enum BundleProtocols {
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
    MakerDAO = 'MakerDAO__MCD',
    Liquity = 'Liquity',
    ChickenBonds = 'ChickenBonds',
    CompoundV3 = 'Compound__V3',
    AaveV3 = 'Aave__V3',
  }

  export enum LegacyAutomation {
    MakerDAO = 'MakerDAO__MCD',
    CompoundV2 = 'Compound__V2',
    AaveV2 = 'Aave__V2',
  }
}

export namespace Strategies {
  export const enum MainnetIds {
    MAKER_CLOSE_ON_PRICE_TO_DAI = 7,
    MAKER_CLOSE_ON_PRICE_TO_COLL = 9,
    LIQUITY_CLOSE_ON_PRICE_TO_COLL_DEPRECATED = 10, // replaced with 14
    MAKER_TRAILING_STOP_LOSS_TO_COLL = 11,
    MAKER_TRAILING_STOP_LOSS_TO_DAI = 12,
    LIQUITY_TRAILING_STOP_LOSS_TO_COLL = 13,
    LIQUITY_CLOSE_ON_PRICE_TO_COLL = 14,
    CHICKEN_BONDS_REBOND = 31,
  }

  export const enum OptimismIds {}

  export const enum ArbitrumIds {}

  export const enum Identifiers {
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
  export const enum Names {
    TakeProfit = 'take-profit',
    StopLoss = 'stop-loss',
    TrailingStop = 'trailing-stop',
    LeverageManagement = 'leverage-management',
    EoaLeverageManagement = 'leverage-management-eoa',
  }
}

export namespace Bundles {
  export const enum MainnetIds {
    MAKER_REPAY_FROM_SMART_SAVINGS_YEARN = 0,
    MAKER_REPAY_FROM_SMART_SAVINGS_MSTABLE = 1,
    MAKER_REPAY_FROM_SMART_SAVINGS_RARI = 2,
    COMP_V3_SW_REPAY_BUNDLE = 3,
    COMP_V3_SW_BOOST_BUNDLE = 4,
    COMP_V3_EOA_REPAY_BUNDLE = 5,
    COMP_V3_EOA_BOOST_BUNDLE = 6,
  }

  export const enum OptimismIds {
    AAVE_V3_REPAY = 0,
    AAVE_V3_BOOST = 1,
    AAVE_V3_CLOSE_TO_DEBT = 2,
    AAVE_V3_CLOSE_TO_COLLATERAL = 3,
  }

  export const enum ArbitrumIds {
    AAVE_V3_REPAY = 0,
    AAVE_V3_BOOST = 1,
    AAVE_V3_CLOSE_TO_DEBT = 2,
    AAVE_V3_CLOSE_TO_COLLATERAL = 3,
  }
}


