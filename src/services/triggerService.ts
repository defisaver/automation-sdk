import Dec from 'decimal.js';

import type {
  EthereumAddress, TriggerData,
} from '../types';
import type { RatioState } from '../types/enums';

import { ratioPercentageToWei } from './utils';

const { mockedWeb3 } = process;

export const chainlinkPriceTrigger = {
  encode(tokenAddr: EthereumAddress, price: string, state: RatioState) {
    const _price = new Dec(price).mul(1e8).floor().toString();
    return [mockedWeb3.eth.abi.encodeParameters(['address', 'uint256', 'uint8'], [tokenAddr, _price, state])];
  },
  decode(triggerData: TriggerData): { price: string, state: RatioState, tokenAddr: EthereumAddress } {
    const decodedData = mockedWeb3.eth.abi.decodeParameters(['address', 'uint256', 'uint8'], triggerData[0]);
    return { tokenAddr: decodedData[0], price: new Dec(decodedData[1]).div(1e8).toString(), state: +decodedData[2] };
  },
};

export const trailingStopTrigger = {
  encode(tokenAddr: EthereumAddress, percentage: number, roundId: number) {
    const _percentage = new Dec(percentage).mul(1e8).toString();
    return [mockedWeb3.eth.abi.encodeParameters(['address', 'uint256', 'uint80'], [tokenAddr, _percentage, roundId])];
  },
  decode(triggerData: TriggerData):{ triggerPercentage: number, tokenAddr: EthereumAddress, roundId: string } {
    const decodedData = mockedWeb3.eth.abi.decodeParameters(['address', 'uint256', 'uint80'], triggerData[0]);
    const triggerPercentage = new Dec(decodedData[1]).div(1e8).toNumber();
    return { tokenAddr: decodedData[0], triggerPercentage, roundId: decodedData[2] };
  },
};

export const makerRatioTrigger = {
  encode(vaultId: number, ratioPercentage: number, ratioState: RatioState) {
    const ratioWei = ratioPercentageToWei(ratioPercentage);
    return [mockedWeb3.eth.abi.encodeParameters(['uint256', 'uint256', 'uint8'], [vaultId, ratioWei, ratioState])];
  },
  decode(triggerData: TriggerData): { vaultId: number, ratioState: number, ratio: number } {
    const decodedData = mockedWeb3.eth.abi.decodeParameters(['uint256', 'uint256', 'uint8'], triggerData[0]);
    return { vaultId: +decodedData[0], ratio: new Dec(mockedWeb3.utils.fromWei(decodedData[1])).mul(100).toNumber(), ratioState: +decodedData[2] };
  },
};

export const aaveV3RatioTrigger = {
  encode(owner: EthereumAddress, market: EthereumAddress, ratioPercentage: number, ratioState: RatioState) {
    const ratioWei = ratioPercentageToWei(ratioPercentage);
    return [mockedWeb3.eth.abi.encodeParameters(['address', 'address', 'uint256', 'uint8'], [owner, market, ratioWei, ratioState])];
  },
  decode(triggerData: TriggerData) {
    const decodedData = mockedWeb3.eth.abi.decodeParameters(['address', 'address', 'uint256', 'uint8'], triggerData[0]) as string[];
    return {
      owner: decodedData[0],
      market: decodedData[1],
      ratio: new Dec(mockedWeb3.utils.fromWei(decodedData[2])).mul(100).toNumber(),
      ratioState: Number(decodedData[3]),
    };
  },
};

export const morphoAaveV2RatioTrigger = {
  encode(owner: EthereumAddress, ratioPercentage: number, ratioState: RatioState) {
    const ratioWei = new Dec(ratioPercentage).mul(1e16).toString();
    return [mockedWeb3.eth.abi.encodeParameters(['address', 'uint128', 'uint8'], [owner, ratioWei, ratioState])];
  },
  decode(triggerData: TriggerData) {
    const decodedData = mockedWeb3.eth.abi.decodeParameters(['address', 'uint128', 'uint8'], triggerData[0]) as string[];
    return {
      owner: decodedData[0],
      ratio: new Dec(decodedData[1]).div(1e16).toNumber(),
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
    return [mockedWeb3.eth.abi.encodeParameters(['address', 'address', 'uint256', 'uint8'], [baseTokenAddress, quoteTokenAddress, _price, ratioState])];
  },
  decode(
    triggerData: TriggerData,
  ): { baseTokenAddress: EthereumAddress, quoteTokenAddress: EthereumAddress, price: string, ratioState: RatioState } {
    const decodedData = mockedWeb3.eth.abi.decodeParameters(['address', 'address', 'uint256', 'uint8'], triggerData[0]) as Array<string>;
    // Price is always in 8 decimals
    const price = new Dec(decodedData[2]).div(10 ** 8).toDP(8).toString();
    return {
      price,
      baseTokenAddress: decodedData[0],
      quoteTokenAddress: decodedData[1],
      ratioState: +decodedData[3],
    };
  },
};

export const compoundV2RatioTrigger = {
  encode(owner: EthereumAddress, ratioPercentage: number, ratioState: RatioState) {
    const ratioWei = ratioPercentageToWei(ratioPercentage);
    return [mockedWeb3.eth.abi.encodeParameters(['address', 'uint256', 'uint8'], [owner, ratioWei, ratioState])];
  },
  decode(triggerData: TriggerData): { owner: EthereumAddress, ratioState: RatioState, ratio: string } {
    const decodedData = mockedWeb3.eth.abi.decodeParameters(['address', 'uint256', 'uint8'], triggerData[0]);
    return {
      owner: decodedData[0],
      ratio: new Dec(mockedWeb3.utils.fromWei(decodedData[1])).mul(100).toString(),
      ratioState: +decodedData[2],
    };
  },
};

export const liquityRatioTrigger = {
  encode(owner: EthereumAddress, ratioPercentage: number, ratioState: RatioState) {
    const ratioWei = ratioPercentageToWei(ratioPercentage);
    return [mockedWeb3.eth.abi.encodeParameters(['address', 'uint256', 'uint8'], [owner, ratioWei, ratioState])];
  },
  decode(triggerData: TriggerData): { owner: EthereumAddress, ratioState: RatioState, ratio: number } {
    const decodedData = mockedWeb3.eth.abi.decodeParameters(['address', 'uint256', 'uint8'], triggerData[0]);
    return {
      owner: decodedData[0],
      ratio: new Dec(mockedWeb3.utils.fromWei(decodedData[1])).mul(100).toNumber(),
      ratioState: +decodedData[2],
    };
  },
};

export const liquityDebtInFrontTrigger = {
  encode(owner: EthereumAddress, debtInFrontMin: string) {
    return [mockedWeb3.eth.abi.encodeParameters(['address', 'uint256'], [owner, debtInFrontMin])];
  },
  decode(triggerData: TriggerData): { owner: EthereumAddress, debtInFrontMin: string } {
    const decodedData = mockedWeb3.eth.abi.decodeParameters(['address', 'uint256'], triggerData[0]);
    return {
      owner: decodedData[0],
      debtInFrontMin: decodedData[1],
    };
  },
};

export const aaveV2RatioTrigger = {
  encode(owner: EthereumAddress, market: EthereumAddress, ratioPercentage: number, ratioState: RatioState) {
    const ratioWei = ratioPercentageToWei(ratioPercentage);
    return [mockedWeb3.eth.abi.encodeParameters(['address', 'address', 'uint256', 'uint8'], [owner, market, ratioWei, ratioState])];
  },
  decode(triggerData: TriggerData): { owner: EthereumAddress, market:EthereumAddress, ratioState: RatioState, ratio: string } {
    const decodedData = mockedWeb3.eth.abi.decodeParameters(['address', 'address', 'uint256', 'uint8'], triggerData[0]);
    return {
      owner: decodedData[0],
      market: decodedData[1],
      ratio: new Dec(mockedWeb3.utils.fromWei(decodedData[2])).mul(100).toString(),
      ratioState: +decodedData[3],
    };
  },
};

export const cBondsRebondTrigger = {
  encode(bondId: number | string) {
    return [mockedWeb3.eth.abi.encodeParameters(['uint256'], [bondId])];
  },
  decode(triggerData: TriggerData): { bondId: string } {
    const decodedData = mockedWeb3.eth.abi.decodeParameters(['uint256'], triggerData[0]);
    return { bondId: decodedData[0] };
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
    return [mockedWeb3.eth.abi.encodeParameters(['address', 'address', 'uint256', 'uint8'], [owner, market, ratioWei, ratioState])];
  },
  decode(
    triggerData: TriggerData,
  ): { owner: EthereumAddress, market: EthereumAddress, ratioState: RatioState, ratio: number } {
    const decodedData = mockedWeb3.eth.abi.decodeParameters(['address', 'address', 'uint256', 'uint8'], triggerData[0]);
    return {
      owner: decodedData[0],
      market: decodedData[1],
      ratio: new Dec(mockedWeb3.utils.fromWei(decodedData[2])).mul(100).toNumber(),
      ratioState: +decodedData[3],
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
    return [mockedWeb3.eth.abi.encodeParameters(['uint256', 'uint256'], [timestampWei, intervalWei])];
  },
  decode(
    triggerData: TriggerData,
  ): { timestamp: number, interval: number } {
    const decodedData = mockedWeb3.eth.abi.decodeParameters(['uint256', 'uint256'], triggerData[0]);
    return {
      timestamp: decodedData[0],
      interval: decodedData[1],
    };
  },
};
export const exchangeOffchainPriceTrigger = {
  encode(
    targetPrice: string,
    goodUntil: number,
    fromTokenDecimals: number,
  ) {
    const price = new Dec(targetPrice.toString()).mul(10 ** fromTokenDecimals).floor().toString();
    const goodUntilWei = mockedWeb3.utils.toWei(new Dec(goodUntil).toString());
    return [mockedWeb3.eth.abi.encodeParameters(['uint256', 'uint256'], [price, goodUntilWei])];
  },
  decode(
    triggerData: TriggerData,
    fromTokenDecimals: number,
    toTokenDecimals: number,
  ): { orderType: number; targetPrice: string; goodUntil: any } {
    const decodedData = mockedWeb3.eth.abi.decodeParameters(['uint256', 'uint256', 'uint8'], triggerData[0]);
    const decimals = new Dec(toTokenDecimals).plus(18).minus(fromTokenDecimals).toString();
    const price = new Dec(decodedData[0]).div(new Dec(10).pow(decimals)).toDP(fromTokenDecimals).toString();
    return {
      targetPrice: price,
      goodUntil: decodedData[1],
      orderType: +decodedData[2],
    };
  },
};

export const sparkRatioTrigger = {
  encode(owner: EthereumAddress, market: EthereumAddress, ratioPercentage: number, ratioState: RatioState) {
    const ratioWei = ratioPercentageToWei(ratioPercentage);
    return [mockedWeb3.eth.abi.encodeParameters(['address', 'address', 'uint256', 'uint8'], [owner, market, ratioWei, ratioState])];
  },
  decode(triggerData: TriggerData) {
    const decodedData = mockedWeb3.eth.abi.decodeParameters(['address', 'address', 'uint256', 'uint8'], triggerData[0]) as string[];
    return {
      owner: decodedData[0],
      market: decodedData[1],
      ratio: new Dec(mockedWeb3.utils.fromWei(decodedData[2])).mul(100).toNumber(),
      ratioState: Number(decodedData[3]),
    };
  },
};

export const sparkQuotePriceTrigger = {
  encode(
    baseTokenAddress: EthereumAddress,
    quoteTokenAddress: EthereumAddress,
    price: number,
    ratioState: RatioState,
  ) {
    // Price is always in 8 decimals
    const _price = new Dec(price.toString()).mul(10 ** 8).floor().toString();
    return [mockedWeb3.eth.abi.encodeParameters(['address', 'address', 'uint256', 'uint8'], [baseTokenAddress, quoteTokenAddress, _price, ratioState])];
  },
  decode(
    triggerData: TriggerData,
  ): { baseTokenAddress: EthereumAddress, quoteTokenAddress: EthereumAddress, price: string, ratioState: RatioState } {
    const decodedData = mockedWeb3.eth.abi.decodeParameters(['address', 'address', 'uint256', 'uint8'], triggerData[0]) as Array<string>;
    // Price is always in 8 decimals
    const price = new Dec(decodedData[2]).div(10 ** 8).toDP(8).toString();
    return {
      price,
      baseTokenAddress: decodedData[0],
      quoteTokenAddress: decodedData[1],
      ratioState: +decodedData[3],
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

    return [mockedWeb3.eth.abi.encodeParameters(['address', 'uint256', 'uint8'], [market, rateWei, rateState])];
  },
  decode(
    triggerData: TriggerData,
  ): { market: EthereumAddress, targetRate: string, rateState: RatioState } {
    const decodedData = mockedWeb3.eth.abi.decodeParameters(['address', 'uint256', 'uint8'], triggerData[0]) as Array<string>;
    const rateEth = mockedWeb3.utils.fromWei(decodedData[1]);

    // the form is x = (e**(rate*365*86400))-1 where x*100 is number in %
    const exponentRate = new Dec(rateEth).mul(365).mul(86400);
    const targetRate = new Dec(new Dec(2.718281828459).pow(exponentRate).minus(1)).mul(100)
      .toString();
    return {
      market: decodedData[0],
      targetRate,
      rateState: +decodedData[2],
    };
  },
};

export const curveUsdSoftLiquidationTrigger = {
  encode(
    market: EthereumAddress,
    owner: EthereumAddress,
    percentage: string,
  ) {
    // 100% = 1e18 => 0.01 = 1e16
    const _percentage = new Dec(percentage).mul(10 ** 18).floor().toString();
    return [mockedWeb3.eth.abi.encodeParameters(['address', 'address', 'uint256'], [market, owner, _percentage])];
  },
  decode(
    triggerData: TriggerData,
  ): { market: EthereumAddress, owner: EthereumAddress, percentage: string } {
    const decodedData = mockedWeb3.eth.abi.decodeParameters(['address', 'address', 'uint256'], triggerData[0]) as Array<string>;

    return {
      market: decodedData[0],
      owner: decodedData[1],
      percentage: mockedWeb3.utils.fromWei(decodedData[2]),
    };
  },
};
