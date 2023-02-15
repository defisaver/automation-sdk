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
  decode(triggerData: TriggerData): { owner: EthereumAddress, ratioState: RatioState, ratio: string } {
    const decodedData = mockedWeb3.eth.abi.decodeParameters(['address', 'uint256', 'uint8'], triggerData[0]);
    return {
      owner: decodedData[0],
      ratio: new Dec(mockedWeb3.utils.fromWei(decodedData[1])).mul(100).toString(),
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
    const timestampWei = mockedWeb3.utils.toWei(new Dec(timestamp).toString());
    const intervalWei = mockedWeb3.utils.toWei(new Dec(interval).toString());
    return [mockedWeb3.eth.abi.encodeParameters(['uint256', 'uint256'], [timestampWei, intervalWei])];
  },
  decode(
    triggerData: TriggerData,
  ): { timestamp: number, interval: number } {
    const decodedData = mockedWeb3.eth.abi.decodeParameters(['uint256', 'uint256'], triggerData[0]);
    return {
      timestamp: new Dec(mockedWeb3.utils.fromWei(decodedData[0])).toNumber(),
      interval: new Dec(mockedWeb3.utils.fromWei(decodedData[0])).toNumber(),
    };
  },
};
export const exchangeOffchainPriceTrigger = {
  encode(
    targetPrice: string,
    goodUntil: number,
  ) {
    const price = new Dec(targetPrice.toString()).mul(10 ** 8).floor().toString();
    const goodUntilWei = mockedWeb3.utils.toWei(new Dec(goodUntil).toString());
    return [mockedWeb3.eth.abi.encodeParameters(['uint256', 'uint256'], [price, goodUntilWei])];
  },
  decode(
    triggerData: TriggerData,
  ): { targetPrice: string, goodUntil: number } {
    const decodedData = mockedWeb3.eth.abi.decodeParameters(['uint256', 'uint256'], triggerData[0]);
    const price = new Dec(decodedData[2]).div(10 ** 8).toDP(8).toString();
    return {
      targetPrice: price,
      goodUntil: new Dec(mockedWeb3.utils.fromWei(decodedData[0])).toNumber(),
    };
  },
};
