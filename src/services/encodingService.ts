import Dec from 'decimal.js';
import { getAssetInfo, getAssetInfoByAddress } from '@defisaver/tokens';
import { otherAddresses } from '@defisaver/sdk';

import type { ChainId } from '../constants';
import type { EthereumAddress } from '../types';

import { compareAddresses } from './utils';
import { ZERO_ADDRESS, RatioState } from '../constants';

const { mockedWeb3 } = process;

// TODO - Add types and typings (triggerData, subData, check ratioState and if that is a good name)

export function getRatioStateInfoForAaveCloseStrategy(currentRatioState: RatioState, collAsset: EthereumAddress, debtAsset: EthereumAddress, chainId: ChainId) {
  // Flip only if stable/volatile to keep human-readable trigger price setting
  const shouldFlip = getAssetInfoByAddress(collAsset, chainId).isStable && !getAssetInfoByAddress(debtAsset, chainId).isStable;
  let ratioState = currentRatioState;
  if (shouldFlip) {
    ratioState = currentRatioState === RatioState.OVER
      ? ratioState = RatioState.UNDER
      : ratioState = RatioState.OVER;
  }
  return { shouldFlip, ratioState };
}

export function compareSubHashes(currentSubHash: string, newSubStructDecoded: object): boolean {
  return currentSubHash === mockedWeb3.utils.keccak256(mockedWeb3.eth.abi.encodeParameter('(uint64,bool,bytes[],bytes32[])', newSubStructDecoded));
}

export function encodeSubId(subIdDec = '0') {
  return new Dec(subIdDec).toHex().slice(2).padStart(8, '0');
}

export const makerRatioTriggerData = {
  encode(vaultId: number, ratio: string, ratioState: RatioState) {
    const _ratio = mockedWeb3.utils.toWei(new Dec(ratio).div(100).toString());
    return [mockedWeb3.eth.abi.encodeParameters(['uint256', 'uint256', 'uint8'], [vaultId, _ratio, ratioState])];
  },
  decode(triggerData: [string]): { vaultId: number, ratioState: number, ratio: string } {
    const decodedData = mockedWeb3.eth.abi.decodeParameters(['uint256', 'uint256', 'uint8'], triggerData[0]);
    return { vaultId: +decodedData[0], ratio: new Dec(mockedWeb3.utils.fromWei(decodedData[1])).mul(100).toString(), ratioState: +decodedData[2] };
  },
};

export const makerRepayFromSavingsSubData = {
  encode(
    vaultId: number,
    targetRatio: string,
    chainId: ChainId,
    daiAddr?: EthereumAddress,
    mcdCdpManagerAddr?: EthereumAddress,
  ): [string, string, string, string] {
    const _daiAddr = daiAddr || getAssetInfo('DAI', chainId).address;
    // @ts-ignore // TODO - this requires change in @defisaver/tokens
    const _mcdCdpManagerAddr = mcdCdpManagerAddr || otherAddresses(chainId).McdCdpManager;

    const vaultIdEncoded = mockedWeb3.eth.abi.encodeParameter('uint256', vaultId.toString());
    const _targetRatio = mockedWeb3.utils.toWei(new Dec(targetRatio).div(100).toString());
    const targetRatioEncoded = mockedWeb3.eth.abi.encodeParameter('uint256', _targetRatio);
    const daiAddrEncoded = mockedWeb3.eth.abi.encodeParameter('address', _daiAddr);
    const mcdManagerAddrEncoded = mockedWeb3.eth.abi.encodeParameter('address', _mcdCdpManagerAddr);

    return [vaultIdEncoded, targetRatioEncoded, daiAddrEncoded, mcdManagerAddrEncoded];
  },
  decode(subData: Array<string>): { vaultId: number, daiAddr: string, mcdManagerAddr: string, targetRatio: string } {
    const vaultId = +mockedWeb3.eth.abi.decodeParameter('uint256', subData[0]).toString();
    // @ts-ignore
    const targetRatio = new Dec(mockedWeb3.utils.fromWei(mockedWeb3.eth.abi.decodeParameter('uint256', subData[1]))).mul(100).toString();
    const daiAddr = mockedWeb3.eth.abi.decodeParameter('address', subData[2]).toString();
    const mcdManagerAddr = mockedWeb3.eth.abi.decodeParameter('address', subData[3]).toString();

    return {
      vaultId, targetRatio, daiAddr, mcdManagerAddr,
    };
  },
};

export const closeOnPriceTriggerData = {
  encode(tokenAddr: EthereumAddress, price: string, state: RatioState): [string] {
    const _price = new Dec(price).mul(1e8).floor().toString();
    return [mockedWeb3.eth.abi.encodeParameters(['address', 'uint256', 'uint8'], [tokenAddr, _price, state])];
  },
  decode(triggerData: Array<string>): { price: string, state: RatioState, tokenAddr: EthereumAddress } {
    const decodedData = mockedWeb3.eth.abi.decodeParameters(['address', 'uint256', 'uint8'], triggerData[0]);
    return { tokenAddr: decodedData[0], price: new Dec(decodedData[1]).div(1e8).toString(), state: +decodedData[2] };
  },
};

export const makerCloseSubData = {
  encode(
    vaultId: number,
    closeToAssetAddr: EthereumAddress,
    chainId: ChainId,
    daiAddr?: EthereumAddress,
    mcdCdpManagerAddr?: EthereumAddress,
  ): [string, string, string] | [string, string, string, string] {
    const _daiAddr = daiAddr || getAssetInfo('DAI', chainId).address;
    // @ts-ignore // TODO - this requires change in @defisaver/tokens
    const _mcdCdpManagerAddr = mcdCdpManagerAddr || otherAddresses(chainId).McdCdpManager;

    const vaultIdEncoded = mockedWeb3.eth.abi.encodeParameter('uint256', vaultId.toString());
    const daiAddrEncoded = mockedWeb3.eth.abi.encodeParameter('address', _daiAddr);
    const mcdManagerAddrEncoded = mockedWeb3.eth.abi.encodeParameter('address', _mcdCdpManagerAddr);
    if (compareAddresses(closeToAssetAddr, _daiAddr)) {
      // Close to DAI strategy
      return [vaultIdEncoded, daiAddrEncoded, mcdManagerAddrEncoded];
    }
    // Close to collateral strategy
    const collAddrEncoded = mockedWeb3.eth.abi.encodeParameter('address', closeToAssetAddr);
    return [vaultIdEncoded, collAddrEncoded, daiAddrEncoded, mcdManagerAddrEncoded];
  },
  decode(subData: Array<string>): { vaultId: number, closeToAssetAddr: EthereumAddress } {
    const vaultId = +mockedWeb3.eth.abi.decodeParameter('uint256', subData[0]);
    // if closing to collateral, asset addr will be 2nd param out of 4
    // if closing to DAI, will return 2nd param out of 3, which will be DAI addr
    const closeToAssetAddr = mockedWeb3.eth.abi.decodeParameter('address', subData[1]).toString().toLowerCase();

    return {
      vaultId, closeToAssetAddr,
    };
  },
};

export const liquityCloseSubData = {
  encode(
    closeToAssetAddr: EthereumAddress,
    chainId: ChainId,
    collAddr?: EthereumAddress,
    debtAddr?: EthereumAddress,
  ): [string, string] {
    const _collAddr = collAddr || getAssetInfo('WETH', chainId).address;
    const _debtAddr = debtAddr || getAssetInfo('LUSD', chainId).address;

    const collAddrEncoded = mockedWeb3.eth.abi.encodeParameter('address', _collAddr);
    const debtAddrEncoded = mockedWeb3.eth.abi.encodeParameter('address', _debtAddr);
    // if (compareAddresses(closeToAssetAddr, daiAddr)) { // TODO - Uhm, wth?
    //   // close to LUSD strategy
    //   return [daiAddrEncoded, mcdManagerAddrEncoded];
    // }
    // close to collateral strategy
    return [collAddrEncoded, debtAddrEncoded];
  },
  decode(subData: Array<string>): { closeToAssetAddr: EthereumAddress, debtAddr: string } {
    const closeToAssetAddr = mockedWeb3.eth.abi.decodeParameter('address', subData[0]).toString().toLowerCase();
    const debtAddr = mockedWeb3.eth.abi.decodeParameter('address', subData[1]).toString().toLowerCase();
    return { closeToAssetAddr, debtAddr };
  },
};

export const trailingStopTriggerData = {
  encode(tokenAddr: EthereumAddress, percentage: number, roundId: number): [string] {
    const _percentage = new Dec(percentage).mul(1e8).toString();
    return [mockedWeb3.eth.abi.encodeParameters(['address', 'uint256', 'uint80'], [tokenAddr, _percentage, roundId])];
  },
  decode(triggerData: Array<string>):{ triggerPercentage: number, tokenAddr: EthereumAddress, roundId: string } {
    const decodedData = mockedWeb3.eth.abi.decodeParameters(['address', 'uint256', 'uint80'], triggerData[0]);
    const triggerPercentage = new Dec(decodedData[1]).div(1e8).toNumber();
    return { tokenAddr: decodedData[0], triggerPercentage, roundId: decodedData[2] };
  },
};

export const aaveRatioTriggerData = { // TODO encode?
  decode(triggerData: Array<string>): { market: string, ratioState: RatioState, ratio: string } {
    const decodedData = mockedWeb3.eth.abi.decodeParameters(['address', 'address', 'uint256', 'uint8'], triggerData[0]);
    return { market: decodedData[1], ratio: new Dec(mockedWeb3.utils.fromWei(decodedData[2])).mul(100).toString(), ratioState: +decodedData[3] };
  },
};

export const aaveV3QuotePriceTriggerData = {
  encode(
    baseTokenAddress: EthereumAddress,
    quoteTokenAddress: EthereumAddress,
    price: number,
    ratioState: RatioState,
  ): [string] {
    // Price is always in 8 decimals
    const _price = new Dec(price.toString()).mul(10 ** 8).floor().toString();
    return [mockedWeb3.eth.abi.encodeParameters(['address', 'address', 'uint256', 'uint8'], [baseTokenAddress, quoteTokenAddress, _price, ratioState])];
  },
  decode(

    triggerData: Array<string>,
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

export const aaveLeverageManagementSubData = { // TODO encode?
  decode(subData: Array<string>): { targetRatio: string } {
    // @ts-ignore
    const targetRatio = new Dec(mockedWeb3.utils.fromWei(mockedWeb3.eth.abi.decodeParameter('uint256', subData[0]))).mul(100).toString();
    return { targetRatio };
  },
};

export const aaveV3QuotePriceSubData = {
  encode(

    collAsset: EthereumAddress,
    collAssetId: number,
    debtAsset: EthereumAddress,
    debtAssetId: number,
    nullAddress: EthereumAddress = ZERO_ADDRESS,
  ): [string, string, string, string, string] {
    const encodedColl = mockedWeb3.eth.abi.encodeParameter('address', collAsset);
    const encodedCollId = mockedWeb3.eth.abi.encodeParameter('uint8', collAssetId);
    const encodedDebt = mockedWeb3.eth.abi.encodeParameter('address', debtAsset);
    const encodedDebtId = mockedWeb3.eth.abi.encodeParameter('uint8', debtAssetId);
    const encodedNullAddress = mockedWeb3.eth.abi.encodeParameter('address', nullAddress);

    return [encodedColl, encodedCollId, encodedDebt, encodedDebtId, encodedNullAddress];
  },
  decode(

    subData: Array<string>,
  ): { collAsset: EthereumAddress, collAssetId: number, debtAsset: EthereumAddress, debtAssetId: number } {
    const collAsset = mockedWeb3.eth.abi.decodeParameter('address', subData[0]) as unknown as EthereumAddress;
    const collAssetId = Number(mockedWeb3.eth.abi.decodeParameter('uint8', subData[1]));
    const debtAsset = mockedWeb3.eth.abi.decodeParameter('address', subData[2]) as unknown as EthereumAddress;
    const debtAssetId = Number(mockedWeb3.eth.abi.decodeParameter('uint8', subData[3]));

    return {
      collAsset, collAssetId, debtAsset, debtAssetId,
    };
  },
};

export const compoundV3LeverageManagementSubData = {
  encode(
    market: EthereumAddress,
    baseToken: EthereumAddress,
    repayFrom: number,
    boostFrom: number,
    boostTo: number,
    repayTo: number,
    boostEnabled: boolean,
    isEOA: boolean,
  ): [EthereumAddress, EthereumAddress, string, string, string, string, boolean, boolean] {
    return [
      market,
      baseToken,
      new Dec(repayFrom).mul(1e16).toString(),
      new Dec(boostFrom).mul(1e16).toString(),
      new Dec(boostTo).mul(1e16).toString(),
      new Dec(repayTo).mul(1e16).toString(),
      boostEnabled,
      isEOA,
    ];
  },
  decode(subData: Array<string>): { targetRatio: string } {
    // @ts-ignore
    const targetRatio = new Dec(mockedWeb3.utils.fromWei(mockedWeb3.eth.abi.decodeParameter('uint256', subData[3]))).mul(100).toString();
    return { targetRatio };
  },
};

export const compoundV3RatioTriggerData = {
  encode(

    owner: EthereumAddress,
    market: EthereumAddress,
    ratio: number,
    ratioState: RatioState,
  ): [string] {
    const _ratio = mockedWeb3.utils.toWei(new Dec(ratio).div(100).toString());
    return [mockedWeb3.eth.abi.encodeParameters(['address', 'address', 'uint256', 'uint8'], [owner, market, _ratio, ratioState])];
  },
  decode(

    triggerData: Array<string>,
  ): { owner: EthereumAddress, market: EthereumAddress, ratioState: RatioState, ratio: string } {
    const decodedData = mockedWeb3.eth.abi.decodeParameters(['address', 'address', 'uint256', 'uint8'], triggerData[0]);
    return {
      owner: decodedData[0],
      market: decodedData[1],
      ratio: new Dec(mockedWeb3.utils.fromWei(decodedData[2])).mul(100).toString(),
      ratioState: +decodedData[3],
    };
  },
};

export const compoundV2RatioTriggerData = {
  encode(owner: EthereumAddress, ratio: number, ratioState: RatioState): [string] {
    const _ratio = mockedWeb3.utils.toWei(new Dec(ratio).div(100).toString());
    return [mockedWeb3.eth.abi.encodeParameters(['address', 'uint256', 'uint8'], [owner, _ratio, ratioState])];
  },
  decode(triggerData: Array<string>): { owner: EthereumAddress, ratioState: RatioState, ratio: string } {
    const decodedData = mockedWeb3.eth.abi.decodeParameters(['address', 'uint256', 'uint8'], triggerData[0]);
    return {
      owner: decodedData[0],
      ratio: new Dec(mockedWeb3.utils.fromWei(decodedData[1])).mul(100).toString(),
      ratioState: +decodedData[2],
    };
  },
};

export const liquityRatioTriggerData = {
  encode(owner: EthereumAddress, ratio: number, ratioState: RatioState): [string] {
    const _ratio = mockedWeb3.utils.toWei(new Dec(ratio).div(100).toString());
    return [mockedWeb3.eth.abi.encodeParameters(['address', 'uint256', 'uint8'], [owner, _ratio, ratioState])];
  },
  decode(triggerData: Array<string>): { owner: EthereumAddress, ratioState: RatioState, ratio: string } {
    const decodedData = mockedWeb3.eth.abi.decodeParameters(['address', 'uint256', 'uint8'], triggerData[0]);
    return {
      owner: decodedData[0],
      ratio: new Dec(mockedWeb3.utils.fromWei(decodedData[1])).mul(100).toString(),
      ratioState: +decodedData[2],
    };
  },
};

export const liquityDebtInFrontTriggerData = {
  encode(owner: EthereumAddress, debtInFrontMin: string): [string] {
    return [mockedWeb3.eth.abi.encodeParameters(['address', 'uint256'], [owner, debtInFrontMin])];
  },
  decode(triggerData: Array<string>): { owner: EthereumAddress, debtInFrontMin: string } {
    const decodedData = mockedWeb3.eth.abi.decodeParameters(['address', 'uint256'], triggerData[0]);
    return {
      owner: decodedData[0],
      debtInFrontMin: decodedData[1],
    };
  },
};

export const aaveV2RatioTriggerData = {
  encode(owner: EthereumAddress, market: EthereumAddress, ratio: number, ratioState: RatioState): [string] {
    const _ratio = mockedWeb3.utils.toWei(new Dec(ratio).div(100).toString());
    return [mockedWeb3.eth.abi.encodeParameters(['address', 'address', 'uint256', 'uint8'], [owner, market, _ratio, ratioState])];
  },
  decode(triggerData: Array<string>): { owner: EthereumAddress, market:EthereumAddress, ratioState: RatioState, ratio: string } {
    const decodedData = mockedWeb3.eth.abi.decodeParameters(['address', 'address', 'uint256', 'uint8'], triggerData[0]);
    return {
      owner: decodedData[0],
      market: decodedData[1],
      ratio: new Dec(mockedWeb3.utils.fromWei(decodedData[2])).mul(100).toString(),
      ratioState: +decodedData[3],
    };
  },
};

export const cBondsRebondSubData = {
  encode(bondId: number | string): [string] {
    const bondIdEncoded = mockedWeb3.eth.abi.encodeParameter('uint256', bondId);
    return [bondIdEncoded];
  },
  decode(subData: Array<string>): { bondId: string } {
    const bondId = mockedWeb3.eth.abi.decodeParameter('uint256', subData[1]).toString();
    return { bondId };
  },
};

export const cBondsRebondTriggerData = {
  encode(bondId: number | string): [string] {
    return [mockedWeb3.eth.abi.encodeParameters(['uint256'], [bondId])];
  },
  decode(triggerData: Array<string>): { bondId: string } {
    const decodedData = mockedWeb3.eth.abi.decodeParameters(['uint256'], triggerData[0]);
    return { bondId: decodedData[0] };
  },
};