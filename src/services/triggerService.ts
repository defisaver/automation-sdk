import Dec from 'decimal.js';
import { MAXUINT } from '@defisaver/tokens';
import AbiCoder from 'web3-eth-abi';
import * as web3Utils from 'web3-utils';

import type {
  EthereumAddress, TriggerData,
} from '../types';
import type { RatioState, OrderType } from '../types/enums';

import { ratioPercentageToWei, weiToRatioPercentage } from './utils';

export const chainlinkPriceTrigger = {
  encode(tokenAddr: EthereumAddress, price: string, state: RatioState) {
    const _price = new Dec(price).mul(1e8).floor().toString();
    return [AbiCoder.encodeParameters(['address', 'uint256', 'uint8'], [tokenAddr, _price, state])];
  },
  decode(triggerData: TriggerData): { price: string, state: RatioState, tokenAddr: EthereumAddress } {
    const decodedData = AbiCoder.decodeParameters(['address', 'uint256', 'uint8'], triggerData[0]);
    return { tokenAddr: decodedData[0] as EthereumAddress, price: new Dec(decodedData[1] as string).div(1e8).toString(), state: +decodedData[2]! };
  },
};

export const trailingStopTrigger = {
  encode(tokenAddr: EthereumAddress, percentage: number, roundId: number) {
    const _percentage = new Dec(percentage).mul(1e8).toString();
    return [AbiCoder.encodeParameters(['address', 'uint256', 'uint80'], [tokenAddr, _percentage, roundId])];
  },
  decode(triggerData: TriggerData):{ triggerPercentage: number, tokenAddr: EthereumAddress, roundId: string } {
    const decodedData = AbiCoder.decodeParameters(['address', 'uint256', 'uint80'], triggerData[0]);
    const triggerPercentage = new Dec(decodedData[1] as string).div(1e8).toNumber();
    return { tokenAddr: decodedData[0] as EthereumAddress, triggerPercentage, roundId: decodedData[2] as string };
  },
};

export const makerRatioTrigger = {
  encode(vaultId: number, ratioPercentage: number, ratioState: RatioState) {
    const ratioWei = ratioPercentageToWei(ratioPercentage);
    return [AbiCoder.encodeParameters(['uint256', 'uint256', 'uint8'], [vaultId, ratioWei, ratioState])];
  },
  decode(triggerData: TriggerData): { vaultId: number, ratioState: number, ratio: number } {
    const decodedData = AbiCoder.decodeParameters(['uint256', 'uint256', 'uint8'], triggerData[0]);
    return { vaultId: +decodedData[0]!, ratio: weiToRatioPercentage(decodedData[1] as string), ratioState: +decodedData[2]! };
  },
};

export const aaveV3RatioTrigger = {
  encode(owner: EthereumAddress, market: EthereumAddress, ratioPercentage: number, ratioState: RatioState) {
    const ratioWei = ratioPercentageToWei(ratioPercentage);
    return [AbiCoder.encodeParameters(['address', 'address', 'uint256', 'uint8'], [owner, market, ratioWei, ratioState])];
  },
  decode(triggerData: TriggerData) {
    const decodedData = AbiCoder.decodeParameters(['address', 'address', 'uint256', 'uint8'], triggerData[0]);
    return {
      owner: decodedData[0],
      market: decodedData[1],
      ratio: weiToRatioPercentage(decodedData[2] as string),
      ratioState: Number(decodedData[3]),
    };
  },
};

export const morphoAaveV2RatioTrigger = {
  encode(owner: EthereumAddress, ratioPercentage: number, ratioState: RatioState) {
    const ratioWei = new Dec(ratioPercentage).mul(1e16).toString();
    return [AbiCoder.encodeParameters(['address', 'uint128', 'uint8'], [owner, ratioWei, ratioState])];
  },
  decode(triggerData: TriggerData) {
    const decodedData = AbiCoder.decodeParameters(['address', 'uint128', 'uint8'], triggerData[0]);
    return {
      owner: decodedData[0],
      ratio: new Dec(decodedData[1] as string).div(1e16).toNumber(),
      ratioState: Number(decodedData[2]),
    };
  },
};

export const aaveV3QuotePriceTrigger = {
  encode(
    baseTokenAddress: EthereumAddress,
    quoteTokenAddress: EthereumAddress,
    price: number,
    ratioState: RatioState,
  ) {
    // Price is always in 8 decimals
    const _price = new Dec(price.toString()).mul(10 ** 8).floor().toString();
    return [AbiCoder.encodeParameters(['address', 'address', 'uint256', 'uint8'], [baseTokenAddress, quoteTokenAddress, _price, ratioState])];
  },
  decode(
    triggerData: TriggerData,
  ): { baseTokenAddress: EthereumAddress, quoteTokenAddress: EthereumAddress, price: string, ratioState: RatioState } {
    const decodedData = AbiCoder.decodeParameters(['address', 'address', 'uint256', 'uint8'], triggerData[0]);
    // Price is always in 8 decimals
    const price = new Dec(decodedData[2] as string).div(10 ** 8).toDP(8).toString();
    return {
      price,
      baseTokenAddress: decodedData[0] as EthereumAddress,
      quoteTokenAddress: decodedData[1] as EthereumAddress,
      ratioState: +decodedData[3]!,
    };
  },
};

export const aaveV3QuotePriceWithMaximumGasPriceTrigger = {
  encode(
    baseTokenAddress: EthereumAddress,
    quoteTokenAddress: EthereumAddress,
    price: number,
    ratioState: RatioState,
    maximumGasPriceInGwei?: number,
  ) {
    // Price is always in 8 decimals
    const _price = new Dec(price.toString()).mul(10 ** 8).floor().toString();

    const _maximumGasPrice = maximumGasPriceInGwei
      ? new Dec(maximumGasPriceInGwei.toString()).mul(10 ** 9).floor().toString() // We convert it to WEI
      : MAXUINT; // If undefined than set to MAXUINT

    return [
      AbiCoder.encodeParameters(['address', 'address', 'uint256', 'uint8'], [baseTokenAddress, quoteTokenAddress, _price, ratioState]),
      AbiCoder.encodeParameters(['uint256'], [_maximumGasPrice]),
    ];
  },
  decode(
    triggerData: TriggerData,
  ): { baseTokenAddress: EthereumAddress, quoteTokenAddress: EthereumAddress, price: string, ratioState: RatioState, maximumGasPrice: string } {
    const decodedPriceTrigger = AbiCoder.decodeParameters(['address', 'address', 'uint256', 'uint8'], triggerData[0]) as Array<string>;
    const decodedMaximumGasPriceTrigger = AbiCoder.decodeParameters(['uint256'], triggerData[1]) as Array<string>;
    // Price is always in 8 decimals
    const price = new Dec(decodedPriceTrigger[2]).div(10 ** 8).toDP(8).toString();

    const maximumGasPrice = new Dec(decodedMaximumGasPriceTrigger[0]).div(10 ** 9).toDP(9).toString();

    return {
      baseTokenAddress: decodedPriceTrigger[0],
      quoteTokenAddress: decodedPriceTrigger[1],
      price,
      ratioState: +decodedPriceTrigger[3],
      maximumGasPrice,
    };
  },
};

export const compoundV2RatioTrigger = {
  encode(owner: EthereumAddress, ratioPercentage: number, ratioState: RatioState) {
    const ratioWei = ratioPercentageToWei(ratioPercentage);
    return [AbiCoder.encodeParameters(['address', 'uint256', 'uint8'], [owner, ratioWei, ratioState])];
  },
  decode(triggerData: TriggerData): { owner: EthereumAddress, ratioState: RatioState, ratio: number } {
    const decodedData = AbiCoder.decodeParameters(['address', 'uint256', 'uint8'], triggerData[0]);
    return {
      owner: decodedData[0] as EthereumAddress,
      ratio: weiToRatioPercentage(decodedData[1] as string),
      ratioState: +decodedData[2]!,
    };
  },
};

export const liquityRatioTrigger = {
  encode(owner: EthereumAddress, ratioPercentage: number, ratioState: RatioState) {
    const ratioWei = ratioPercentageToWei(ratioPercentage);
    return [AbiCoder.encodeParameters(['address', 'uint256', 'uint8'], [owner, ratioWei, ratioState])];
  },
  decode(triggerData: TriggerData): { owner: EthereumAddress, ratioState: RatioState, ratio: number } {
    const decodedData = AbiCoder.decodeParameters(['address', 'uint256', 'uint8'], triggerData[0]);
    return {
      owner: decodedData[0] as EthereumAddress,
      ratio: weiToRatioPercentage(decodedData[1] as string),
      ratioState: +decodedData[2]!,
    };
  },
};

export const liquityDebtInFrontTrigger = {
  encode(owner: EthereumAddress, debtInFrontMin: string) {
    const debtInFrontMinWei = web3Utils.toWei(new Dec(debtInFrontMin).toString(), 'ether');
    return [AbiCoder.encodeParameters(['address', 'uint256'], [owner, debtInFrontMinWei])];
  },
  decode(triggerData: TriggerData): { owner: EthereumAddress, debtInFrontMin: string } {
    const decodedData = AbiCoder.decodeParameters(['address', 'uint256'], triggerData[0]);
    return {
      owner: decodedData[0] as EthereumAddress,
      debtInFrontMin: new Dec(decodedData[1] as string).div(10 ** 18).toString(),
    };
  },
};

export const liquityDebtInFrontWithLimitTrigger = liquityDebtInFrontTrigger;

export const liquityV2DebtInFrontTrigger = {
  encode(market: EthereumAddress, troveId: string, debtInFrontMin: string) {
    const debtInFrontMinWei = web3Utils.toWei(new Dec(debtInFrontMin).toString(), 'ether');
    return [AbiCoder.encodeParameters(['address', 'uint256', 'uint256'], [market, troveId, debtInFrontMinWei])];
  },
  decode(triggerData: TriggerData): { market: EthereumAddress, troveId: string, debtInFrontMin: string } {
    const decodedData = AbiCoder.decodeParameters(['address', 'uint256', 'uint256'], triggerData[0]);
    return {
      market: decodedData[0] as EthereumAddress,
      troveId: decodedData[1] as string,
      debtInFrontMin: new Dec(decodedData[2] as string).div(10 ** 18).toString(),
    };
  },
};

export const liquityV2AdjustTimeTrigger = {
  encode(market: EthereumAddress, troveId: string) {
    return [AbiCoder.encodeParameters(['address', 'uint256'], [market, troveId])];
  },
  decode(triggerData: TriggerData): { market: EthereumAddress, troveId: string } {
    const decodedData = AbiCoder.decodeParameters(['address', 'uint256'], triggerData[0]);
    return {
      market: decodedData[0] as EthereumAddress,
      troveId: decodedData[1] as string,
    };
  },
};

export const aaveV2RatioTrigger = {
  encode(owner: EthereumAddress, market: EthereumAddress, ratioPercentage: number, ratioState: RatioState) {
    const ratioWei = ratioPercentageToWei(ratioPercentage);
    return [AbiCoder.encodeParameters(['address', 'address', 'uint256', 'uint8'], [owner, market, ratioWei, ratioState])];
  },
  decode(triggerData: TriggerData): { owner: EthereumAddress, market: EthereumAddress, ratioState: RatioState, ratio: number } {
    const decodedData = AbiCoder.decodeParameters(['address', 'address', 'uint256', 'uint8'], triggerData[0]);
    return {
      owner: decodedData[0] as EthereumAddress,
      market: decodedData[1] as EthereumAddress,
      ratio: weiToRatioPercentage(decodedData[2] as string),
      ratioState: +decodedData[3]!,
    };
  },
};

export const cBondsRebondTrigger = {
  encode(bondId: number | string) {
    return [AbiCoder.encodeParameters(['uint256'], [bondId])];
  },
  decode(triggerData: TriggerData): { bondId: string } {
    const decodedData = AbiCoder.decodeParameters(['uint256'], triggerData[0]);
    return { bondId: decodedData[0] as string };
  },
};

export const compoundV3RatioTrigger = {
  encode(
    owner: EthereumAddress,
    market: EthereumAddress,
    ratioPercentage: number,
    ratioState: RatioState,
  ) {
    const ratioWei = ratioPercentageToWei(ratioPercentage);
    return [AbiCoder.encodeParameters(['address', 'address', 'uint256', 'uint8'], [owner, market, ratioWei, ratioState])];
  },
  decode(
    triggerData: TriggerData,
  ): { owner: EthereumAddress, market: EthereumAddress, ratioState: RatioState, ratio: number } {
    const decodedData = AbiCoder.decodeParameters(['address', 'address', 'uint256', 'uint8'], triggerData[0]);
    return {
      owner: decodedData[0] as EthereumAddress,
      market: decodedData[1] as EthereumAddress,
      ratio: weiToRatioPercentage(decodedData[2] as string),
      ratioState: +decodedData[3]!,
    };
  },
};

export const exchangeTimestampTrigger = {
  encode(
    timestamp: number,
    interval: number,
  ) {
    const timestampWei = new Dec(timestamp).toString();
    const intervalWei = new Dec(interval).toString();
    return [AbiCoder.encodeParameters(['uint256', 'uint256'], [timestampWei, intervalWei])];
  },
  decode(
    triggerData: TriggerData,
  ): { timestamp: number, interval: number } {
    const decodedData = AbiCoder.decodeParameters(['uint256', 'uint256'], triggerData[0]);
    return {
      timestamp: Number(decodedData[0]) as number,
      interval: Number(decodedData[1]) as number,
    };
  },
};

export const exchangeOffchainPriceTrigger = {
  encode(
    targetPrice: string,
    goodUntil: number,
    orderType: OrderType,
    fromTokenDecimals: number,
    toTokenDecimals: number,
  ) {
    const decimals = new Dec(toTokenDecimals).plus(18).minus(fromTokenDecimals).toNumber();
    const price = new Dec(targetPrice.toString()).mul(10 ** decimals).floor().toString();
    return [AbiCoder.encodeParameters(['uint256', 'uint256', 'uint8'], [price, goodUntil, orderType])];
  },
  decode(
    triggerData: TriggerData,
    fromTokenDecimals: number,
    toTokenDecimals: number,
  ): { orderType: OrderType; targetPrice: string; goodUntil: any } {
    const decodedData = AbiCoder.decodeParameters(['uint256', 'uint256', 'uint8'], triggerData[0]);
    const decimals = new Dec(toTokenDecimals).plus(18).minus(fromTokenDecimals).toString();
    const price = new Dec(decodedData[0] as string).div(new Dec(10).pow(decimals)).toDP(fromTokenDecimals).toString();
    return {
      targetPrice: price,
      goodUntil: +decodedData[1],
      orderType: +decodedData[2]!,
    };
  },
};

export const sparkRatioTrigger = {
  encode(owner: EthereumAddress, market: EthereumAddress, ratioPercentage: number, ratioState: RatioState) {
    const ratioWei = ratioPercentageToWei(ratioPercentage);
    return [AbiCoder.encodeParameters(['address', 'address', 'uint256', 'uint8'], [owner, market, ratioWei, ratioState])];
  },
  decode(triggerData: TriggerData) {
    const decodedData = AbiCoder.decodeParameters(['address', 'address', 'uint256', 'uint8'], triggerData[0]);
    return {
      owner: decodedData[0],
      market: decodedData[1],
      ratio: weiToRatioPercentage(decodedData[2] as string),
      ratioState: Number(decodedData[3]),
    };
  },
};

export const curveUsdBorrowRateTrigger = {
  encode(
    market: EthereumAddress,
    targetRate: string,
    rateState: RatioState,
  ) {
    // the form is x = (e**(rate*365*86400))-1 where x*100 is number in %
    // we reverse engineer that so we can calculate rate = ln(y/100 + 1) / 365*86400 where y is input in %
    const rate = new Dec(new Dec(new Dec(targetRate).div(100)).plus(1)).ln().div(365).div(86400)
      .toString();
    const rateWei = new Dec(rate).mul(10 ** 18).floor().toString(); // 18 decimals

    return [AbiCoder.encodeParameters(['address', 'uint256', 'uint8'], [market, rateWei, rateState])];
  },
  decode(
    triggerData: TriggerData,
  ): { market: EthereumAddress, targetRate: string, rateState: RatioState } {
    const decodedData = AbiCoder.decodeParameters(['address', 'uint256', 'uint8'], triggerData[0]);
    const rateEth = web3Utils.fromWei(decodedData[1] as string, 'ether');

    // the form is x = (e**(rate*365*86400))-1 where x*100 is number in %
    const exponentRate = new Dec(rateEth).mul(365).mul(86400);
    const targetRate = new Dec(new Dec(2.718281828459).pow(exponentRate).minus(1)).mul(100)
      .toString();
    return {
      market: decodedData[0] as EthereumAddress,
      targetRate,
      rateState: +decodedData[2]!,
    };
  },
};

export const curveUsdSoftLiquidationTrigger = {
  encode(
    market: EthereumAddress,
    owner: EthereumAddress,
    percentage: string,
  ) {
    // 100% = 1e18 => 1% = 1e16
    const _percentage = new Dec(percentage).mul(10 ** 16).floor().toString();
    return [AbiCoder.encodeParameters(['address', 'address', 'uint256'], [market, owner, _percentage])];
  },
  decode(
    triggerData: TriggerData,
  ): { market: EthereumAddress, owner: EthereumAddress, percentage: string } {
    const decodedData = AbiCoder.decodeParameters(['address', 'address', 'uint256'], triggerData[0]);

    return {
      market: decodedData[0] as EthereumAddress,
      owner: decodedData[1] as EthereumAddress,
      percentage: new Dec(decodedData[2] as string).div(10 ** 16).toString(),
    };
  },
};

export const crvUSDRatioTrigger = {
  encode(
    owner: EthereumAddress,
    controller: EthereumAddress,
    ratioPercentage: number,
    ratioState: RatioState,
  ) {
    const ratioWei = ratioPercentageToWei(ratioPercentage);
    return [AbiCoder.encodeParameters(['address', 'address', 'uint256', 'uint8'], [owner, controller, ratioWei, ratioState])];
  },
  decode(
    triggerData: TriggerData,
  ) {
    const decodedData = AbiCoder.decodeParameters(['address', 'address', 'uint256', 'uint8'], triggerData[0]);
    return {
      owner: decodedData[0] as EthereumAddress,
      controller: decodedData[1] as EthereumAddress,
      ratio: weiToRatioPercentage(decodedData[2] as string),
      ratioState: Number(decodedData[3]),
    };
  },
};

export const crvUsdHealthRatioTrigger = {
  encode(
    owner: EthereumAddress,
    controller: EthereumAddress,
    ratioPercentage: number,
  ) {
    const ratioWei = ratioPercentageToWei(ratioPercentage);
    return [AbiCoder.encodeParameters(['address', 'address', 'uint256'], [owner, controller, ratioWei])];
  },
  decode(
    triggerData: TriggerData,
  ) {
    const decodedData = AbiCoder.decodeParameters(['address', 'address', 'uint256'], triggerData[0]);
    return {
      owner: decodedData[0] as EthereumAddress,
      controller: decodedData[1] as EthereumAddress,
      ratio: weiToRatioPercentage(decodedData[2] as string),
    };
  },
};

export const morphoBlueRatioTrigger = {
  encode(
    marketId: string, // bytes32
    owner: EthereumAddress,
    ratioPercentage: number,
    ratioState: RatioState,
  ) {
    const ratioWei = ratioPercentageToWei(ratioPercentage);
    return [AbiCoder.encodeParameters(['bytes32', 'address', 'uint256', 'uint8'], [marketId, owner, ratioWei, ratioState])];
  },
  decode(
    triggerData: TriggerData,
  ) {
    const decodedData = AbiCoder.decodeParameters(['bytes32', 'address', 'uint256', 'uint8'], triggerData[0]);
    return {
      marketId: decodedData[0] as string,
      owner: decodedData[1] as EthereumAddress,
      ratio: weiToRatioPercentage(decodedData[2] as string),
      ratioState: Number(decodedData[3]),
    };
  },
};

export const liquityV2RatioTrigger = {
  encode(
    market: EthereumAddress,
    troveId: string,
    ratioPercentage: number,
    ratioState: RatioState,
  ) {
    const ratioWei = ratioPercentageToWei(ratioPercentage);
    return [AbiCoder.encodeParameters(['address', 'uint256', 'uint256', 'uint8'], [market, troveId, ratioWei, ratioState])];
  },
  decode(
    triggerData: TriggerData,
  ) {
    const decodedData = AbiCoder.decodeParameters(['address', 'uint256', 'uint256', 'uint8'], triggerData[0]);
    return {
      market: decodedData[0] as EthereumAddress,
      troveId: decodedData[1] as string,
      ratio: weiToRatioPercentage(decodedData[2] as string),
      ratioState: Number(decodedData[3]),
    };
  },
};

export const liquityV2QuotePriceTrigger = {
  encode(
    market: EthereumAddress,
    price: number,
    ratioState: RatioState,
  ) {
    // Price is always in 18 decimals
    const _price = new Dec(price.toString()).mul(10 ** 18).floor().toString();
    return [AbiCoder.encodeParameters(['address', 'uint256', 'uint8'], [market, _price, ratioState])];
  },
  decode(
    triggerData: TriggerData,
  ) {
    const decodedData = AbiCoder.decodeParameters(['address', 'uint256', 'uint8'], triggerData[0]);
    const price = new Dec(decodedData[1] as string).div(10 ** 18).toDP(18).toString();
    return {
      market: decodedData[0] as EthereumAddress,
      price,
      ratioState: Number(decodedData[2]),
    };
  },
};

export const closePriceTrigger = {
  encode(
    tokenAddr: EthereumAddress,
    lowerPrice: number,
    upperPrice: number,
  ) {
    const lowerPriceFormatted = new Dec(lowerPrice).mul(1e8).floor().toString();
    const upperPriceFormatted = new Dec(upperPrice).mul(1e8).floor().toString();

    return [
      AbiCoder.encodeParameters(
        ['address', 'uint256', 'uint256'],
        [tokenAddr, lowerPriceFormatted, upperPriceFormatted],
      ),
    ];
  },
  decode(triggerData: TriggerData): {
    tokenAddr: EthereumAddress,
    lowerPrice: string,
    upperPrice: string,
  } {
    const decodedData = AbiCoder.decodeParameters(['address', 'uint256', 'uint256'], triggerData[0]);
    return {
      tokenAddr: decodedData[0] as EthereumAddress,
      lowerPrice: new Dec(decodedData[1] as string).div(1e8).toString(),
      upperPrice: new Dec(decodedData[2] as string).div(1e8).toString(),
    };
  },
};
export const morphoBluePriceTrigger = {
  encode(
    oracle: EthereumAddress,
    collateralToken: EthereumAddress,
    loanToken: EthereumAddress,
    price: number,
    priceState: RatioState,
  ) {
    const _price = new Dec(price.toString()).mul(1e8).floor().toString();
    return [
      AbiCoder.encodeParameters(
        ['address', 'address', 'address', 'uint256', 'uint8'],
        [oracle, collateralToken, loanToken, _price, priceState]),
    ];
  },
  decode(
    triggerData: TriggerData,
  ) {
    const decodedData = AbiCoder.decodeParameters(['address', 'address', 'address', 'uint256', 'uint8'], triggerData[0]);
    return {
      oracle: decodedData[0] as EthereumAddress,
      collateralToken: decodedData[1] as EthereumAddress,
      loanToken: decodedData[2] as EthereumAddress,
      price: new Dec(decodedData[3] as string).div(1e8).toString(),
      priceState: Number(decodedData[4]),
    };
  },
};

export const fluidRatioTrigger = {
  encode(
    nftId: string,
    ratioPercentage: number,
    ratioState: RatioState,
  ) {
    const ratioWei = ratioPercentageToWei(ratioPercentage);
    return [AbiCoder.encodeParameters(['uint256', 'uint256', 'uint8'], [nftId, ratioWei, ratioState])];
  },
  decode(
    triggerData: TriggerData,
  ) {
    const decodedData = AbiCoder.decodeParameters(['uint256', 'uint256', 'uint8'], triggerData[0]);
    return {
      nftId: decodedData[0] as string,
      ratio: weiToRatioPercentage(decodedData[1] as string),
      ratioState: Number(decodedData[2]),
    };
  },
};

export const compoundV3PriceTrigger = {
  encode(
    market: EthereumAddress,
    collToken: EthereumAddress,
    user: EthereumAddress,
    price: number,
    priceState: RatioState,
  ) {
    const _price = new Dec(price.toString()).mul(1e8).floor().toString();
    return [
      AbiCoder.encodeParameters(
        ['address', 'address', 'address', 'uint256', 'uint8'],
        [market, collToken, user, _price, priceState]),
    ];
  },
  decode(
    triggerData: TriggerData,
  ) {
    const decodedData = AbiCoder.decodeParameters(['address', 'address', 'address', 'uint256', 'uint8'], triggerData[0]);
    return {
      market: decodedData[0] as EthereumAddress,
      collToken: decodedData[1] as EthereumAddress,
      user: decodedData[2] as EthereumAddress,
      price: new Dec(decodedData[3] as string).div(1e8).toString(),
      priceState: Number(decodedData[4]),
    };
  },
};

export const compoundV3PriceRangeTrigger = {
  encode(
    market: EthereumAddress,
    collToken: EthereumAddress,
    lowerPrice: number,
    upperPrice: number,
  ) {
    const lowerPriceFormatted = new Dec(lowerPrice).mul(1e8).floor().toString();
    const upperPriceFormatted = new Dec(upperPrice).mul(1e8).floor().toString();
    return [
      AbiCoder.encodeParameters(
        ['address', 'address', 'uint256', 'uint256'],
        [market, collToken, lowerPriceFormatted, upperPriceFormatted]),
    ];
  },
  decode(
    triggerData: TriggerData,
  ) {
    const decodedData = AbiCoder.decodeParameters(['address', 'address', 'uint256', 'uint256'], triggerData[0]);
    return {
      market: decodedData[0] as EthereumAddress,
      collToken: decodedData[1] as EthereumAddress,
      lowerPrice: new Dec(decodedData[2] as string).div(1e8).toString(),
      upperPrice: new Dec(decodedData[3] as string).div(1e8).toString(),
    };
  },
};

export const aaveV3QuotePriceRangeTrigger = {
  encode(
    collToken: EthereumAddress,
    debtToken: EthereumAddress,
    lowerPrice: number,
    upperPrice: number,
  ) {
    // Price is scaled to 1e8
    const lowerPriceFormatted = new Dec(lowerPrice).mul(1e8).floor().toString();
    const upperPriceFormatted = new Dec(upperPrice).mul(1e8).floor().toString();
    return [
      AbiCoder.encodeParameters(
        ['address', 'address', 'uint256', 'uint256'],
        [collToken, debtToken, lowerPriceFormatted, upperPriceFormatted]),
    ];
  },
  decode(
    triggerData: TriggerData,
  ) {
    const decodedData = AbiCoder.decodeParameters(['address', 'address', 'uint256', 'uint256'], triggerData[0]);
    return {
      collToken: decodedData[0] as EthereumAddress,
      debtToken: decodedData[1] as EthereumAddress,
      lowerPrice: new Dec(decodedData[2] as string).div(1e8).toString(),
      upperPrice: new Dec(decodedData[3] as string).div(1e8).toString(),
    };
  },
};

export const sparkQuotePriceRangeTrigger = {
  encode(
    collToken: EthereumAddress,
    debtToken: EthereumAddress,
    lowerPrice: number,
    upperPrice: number,
  ) {
    // Price is scaled to 1e8
    const lowerPriceFormatted = new Dec(lowerPrice).mul(1e8).floor().toString();
    const upperPriceFormatted = new Dec(upperPrice).mul(1e8).floor().toString();
    return [
      AbiCoder.encodeParameters(
        ['address', 'address', 'uint256', 'uint256'],
        [collToken, debtToken, lowerPriceFormatted, upperPriceFormatted]),
    ];
  },
  decode(
    triggerData: TriggerData,
  ) {
    const decodedData = AbiCoder.decodeParameters(['address', 'address', 'uint256', 'uint256'], triggerData[0]);
    return {
      collToken: decodedData[0] as EthereumAddress,
      debtToken: decodedData[1] as EthereumAddress,
      lowerPrice: new Dec(decodedData[2] as string).div(1e8).toString(),
      upperPrice: new Dec(decodedData[3] as string).div(1e8).toString(),
    };
  },
};

export const morphoBluePriceRangeTrigger = {
  encode(
    oracle: EthereumAddress,
    collateralToken: EthereumAddress,
    loanToken: EthereumAddress,
    lowerPrice: number,
    upperPrice: number,
  ) {
    // Price is scaled to 1e8
    const lowerPriceFormatted = new Dec(lowerPrice).mul(1e8).floor().toString();
    const upperPriceFormatted = new Dec(upperPrice).mul(1e8).floor().toString();
    return [
      AbiCoder.encodeParameters(
        ['address', 'address', 'address', 'uint256', 'uint256'],
        [oracle, collateralToken, loanToken, lowerPriceFormatted, upperPriceFormatted],
      ),
    ];
  },
  decode(
    triggerData: TriggerData,
  ) {
    const decodedData = AbiCoder.decodeParameters(['address', 'address', 'address', 'uint256', 'uint256'], triggerData[0]);
    return {
      oracle: decodedData[0] as EthereumAddress,
      collateralToken: decodedData[1] as EthereumAddress,
      loanToken: decodedData[2] as EthereumAddress,
      lowerPrice: new Dec(decodedData[3] as string).div(1e8).toString(),
      upperPrice: new Dec(decodedData[4] as string).div(1e8).toString(),
    };
  },
};