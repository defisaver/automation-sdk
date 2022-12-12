import Dec from 'decimal.js';
import { getAssetInfo } from '@defisaver/tokens';
import { otherAddresses } from '@defisaver/sdk';

import type Web3 from 'web3';
import type { RatioState, ChainId } from '../constants';
import type { EthereumAddress } from '../types';

import { compareAddresses } from './utils';
import { ZERO_ADDRESS } from '../constants';

// TODO - Add types and typings (triggerData, subData, check ratioState and if that is a good name)

export function compareSubHashes(web3: Web3, currentSubHash: string, newSubStructDecoded: object): boolean {
  return currentSubHash === web3.utils.keccak256(web3.eth.abi.encodeParameter('(uint64,bool,bytes[],bytes32[])', newSubStructDecoded));
}

export function encodeSubId(subIdDec = '0') {
  return new Dec(subIdDec).toHex().slice(2).padStart(8, '0');
}

export const makerRatioTriggerData = {
  encode(web3: Web3, vaultId: number, ratio: string, ratioState: RatioState) {
    const _ratio = web3.utils.toWei(new Dec(ratio).div(100).toString());
    return [web3.eth.abi.encodeParameters(['uint256', 'uint256', 'uint8'], [vaultId, _ratio, ratioState])];
  },
  decode(web3: Web3, triggerData: [string]): { vaultId: number, ratioState: number, ratio: string } {
    const decodedData = web3.eth.abi.decodeParameters(['uint256', 'uint256', 'uint8'], triggerData[0]);
    return { vaultId: +decodedData[0], ratio: new Dec(web3.utils.fromWei(decodedData[1])).mul(100).toString(), ratioState: +decodedData[2] };
  },
};

export const makerRepayFromSavingsSubData = {
  encode(
    web3: Web3,
    vaultId: number,
    targetRatio: string,
    chainId: ChainId,
    daiAddr?: EthereumAddress,
    mcdCdpManagerAddr?: EthereumAddress,
  ): [string, string, string, string] {
    const _daiAddr = daiAddr || getAssetInfo('DAI', chainId).address;
    // @ts-ignore // TODO - this requires change in @defisaver/tokens
    const _mcdCdpManagerAddr = mcdCdpManagerAddr || otherAddresses(chainId).McdCdpManager;

    const vaultIdEncoded = web3.eth.abi.encodeParameter('uint256', vaultId.toString());
    const _targetRatio = web3.utils.toWei(new Dec(targetRatio).div(100).toString());
    const targetRatioEncoded = web3.eth.abi.encodeParameter('uint256', _targetRatio);
    const daiAddrEncoded = web3.eth.abi.encodeParameter('address', _daiAddr);
    const mcdManagerAddrEncoded = web3.eth.abi.encodeParameter('address', _mcdCdpManagerAddr);

    return [vaultIdEncoded, targetRatioEncoded, daiAddrEncoded, mcdManagerAddrEncoded];
  },
  decode(web3: Web3, subData: Array<string>): { vaultId: number, daiAddr: string, mcdManagerAddr: string, targetRatio: string } {
    const vaultId = +web3.eth.abi.decodeParameter('uint256', subData[0]).toString();
    // @ts-ignore
    const targetRatio = new Dec(web3.utils.fromWei(web3.eth.abi.decodeParameter('uint256', subData[1]))).mul(100).toString();
    const daiAddr = web3.eth.abi.decodeParameter('address', subData[2]).toString();
    const mcdManagerAddr = web3.eth.abi.decodeParameter('address', subData[3]).toString();

    return {
      vaultId, targetRatio, daiAddr, mcdManagerAddr,
    };
  },
};

export const closeOnPriceTriggerData = {
  encode(web3: Web3, tokenAddr: EthereumAddress, price: string, state: RatioState): [string] {
    const _price = new Dec(price).mul(1e8).floor().toString();
    return [web3.eth.abi.encodeParameters(['address', 'uint256', 'uint8'], [tokenAddr, _price, state])];
  },
  decode(web3: Web3, triggerData: Array<string>): { price: string, state: RatioState, tokenAddr: EthereumAddress } {
    const decodedData = web3.eth.abi.decodeParameters(['address', 'uint256', 'uint8'], triggerData[0]);
    return { tokenAddr: decodedData[0], price: new Dec(decodedData[1]).div(1e8).toString(), state: +decodedData[2] };
  },
};

export const makerCloseSubData = {
  encode(
    web3: Web3,
    vaultId: number,
    closeToAssetAddr: EthereumAddress,
    chainId: ChainId,
    daiAddr?: EthereumAddress,
    mcdCdpManagerAddr?: EthereumAddress,
  ): [string, string, string] | [string, string, string, string] {
    const _daiAddr = daiAddr || getAssetInfo('DAI', chainId).address;
    // @ts-ignore // TODO - this requires change in @defisaver/tokens
    const _mcdCdpManagerAddr = mcdCdpManagerAddr || otherAddresses(chainId).McdCdpManager;

    const vaultIdEncoded = web3.eth.abi.encodeParameter('uint256', vaultId.toString());
    const daiAddrEncoded = web3.eth.abi.encodeParameter('address', _daiAddr);
    const mcdManagerAddrEncoded = web3.eth.abi.encodeParameter('address', _mcdCdpManagerAddr);
    if (compareAddresses(closeToAssetAddr, _daiAddr)) {
      // Close to DAI strategy
      return [vaultIdEncoded, daiAddrEncoded, mcdManagerAddrEncoded];
    }
    // Close to collateral strategy
    const collAddrEncoded = web3.eth.abi.encodeParameter('address', closeToAssetAddr);
    return [vaultIdEncoded, collAddrEncoded, daiAddrEncoded, mcdManagerAddrEncoded];
  },
  decode(web3: Web3, subData: Array<string>): { vaultId: number, closeToAssetAddr: EthereumAddress } {
    const vaultId = +web3.eth.abi.decodeParameter('uint256', subData[0]);
    // if closing to collateral, asset addr will be 2nd param out of 4
    // if closing to DAI, will return 2nd param out of 3, which will be DAI addr
    const closeToAssetAddr = web3.eth.abi.decodeParameter('address', subData[1]).toString().toLowerCase();

    return {
      vaultId, closeToAssetAddr,
    };
  },
};

export const liquityCloseSubData = {
  encode(
    web3: Web3,
    closeToAssetAddr: EthereumAddress,
    chainId: ChainId,
    collAddr?: EthereumAddress,
    debtAddr?: EthereumAddress,
  ): [string, string] {
    const _collAddr = collAddr || getAssetInfo('WETH', chainId).address;
    const _debtAddr = debtAddr || getAssetInfo('LUSD', chainId).address;

    const collAddrEncoded = web3.eth.abi.encodeParameter('address', _collAddr);
    const debtAddrEncoded = web3.eth.abi.encodeParameter('address', _debtAddr);
    // if (compareAddresses(closeToAssetAddr, daiAddr)) { // TODO - Uhm, wth?
    //   // close to LUSD strategy
    //   return [daiAddrEncoded, mcdManagerAddrEncoded];
    // }
    // close to collateral strategy
    return [collAddrEncoded, debtAddrEncoded];
  },
  decode(web3: Web3, subData: Array<string>): { closeToAssetAddr: EthereumAddress, debtAddr: string } {
    const closeToAssetAddr = web3.eth.abi.decodeParameter('address', subData[0]).toString().toLowerCase();
    const debtAddr = web3.eth.abi.decodeParameter('address', subData[1]).toString().toLowerCase();
    return { closeToAssetAddr, debtAddr };
  },
};

export const trailingStopTriggerData = {
  encode(web3: Web3, tokenAddr: EthereumAddress, percentage: number, roundId: number): [string] {
    const _percentage = new Dec(percentage).mul(1e8).toString();
    return [web3.eth.abi.encodeParameters(['address', 'uint256', 'uint80'], [tokenAddr, _percentage, roundId])];
  },
  decode(web3: Web3, triggerData: Array<string>):{ triggerPercentage: number, tokenAddr: EthereumAddress, roundId: string } {
    const decodedData = web3.eth.abi.decodeParameters(['address', 'uint256', 'uint80'], triggerData[0]);
    const triggerPercentage = new Dec(decodedData[1]).div(1e8).toNumber();
    return { tokenAddr: decodedData[0], triggerPercentage, roundId: decodedData[2] };
  },
};

export const aaveRatioTriggerData = { // TODO encode?
  decode(web3: Web3, triggerData: Array<string>): { market: string, ratioState: RatioState, ratio: string } {
    const decodedData = web3.eth.abi.decodeParameters(['address', 'address', 'uint256', 'uint8'], triggerData[0]);
    return { market: decodedData[1], ratio: new Dec(web3.utils.fromWei(decodedData[2])).mul(100).toString(), ratioState: +decodedData[3] };
  },
};

export const aaveV3QuotePriceTriggerData = {
  encode(
    web3: Web3,
    baseTokenAddress: EthereumAddress,
    quoteTokenAddress: EthereumAddress,
    price: number,
    ratioState: RatioState,
  ): [string] {
    // Price is always in 8 decimals
    const _price = new Dec(price.toString()).mul(10 ** 8).floor().toString();
    return [web3.eth.abi.encodeParameters(['address', 'address', 'uint256', 'uint8'], [baseTokenAddress, quoteTokenAddress, _price, ratioState])];
  },
  decode(
    web3: Web3,
    triggerData: Array<string>,
  ): { baseTokenAddress: EthereumAddress, quoteTokenAddress: EthereumAddress, price: string, ratioState: RatioState } {
    const decodedData = web3.eth.abi.decodeParameters(['address', 'address', 'uint256', 'uint8'], triggerData[0]) as Array<string>;
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
  decode(web3: Web3, subData: Array<string>): { targetRatio: string } {
    // @ts-ignore
    const targetRatio = new Dec(web3.utils.fromWei(web3.eth.abi.decodeParameter('uint256', subData[0]))).mul(100).toString();
    return { targetRatio };
  },
};

export const aaveV3QuotePriceSubData = {
  encode(
    web3: Web3,
    collAsset: EthereumAddress,
    collAssetId: number,
    debtAsset: EthereumAddress,
    debtAssetId: number,
    nullAddress: EthereumAddress = ZERO_ADDRESS,
  ): [string, string, string, string, string] {
    const encodedColl = web3.eth.abi.encodeParameter('address', collAsset);
    const encodedCollId = web3.eth.abi.encodeParameter('uint8', collAssetId);
    const encodedDebt = web3.eth.abi.encodeParameter('address', debtAsset);
    const encodedDebtId = web3.eth.abi.encodeParameter('uint8', debtAssetId);
    const encodedNullAddress = web3.eth.abi.encodeParameter('address', nullAddress);

    return [encodedColl, encodedCollId, encodedDebt, encodedDebtId, encodedNullAddress];
  },
  decode(
    web3: Web3,
    subData: Array<string>,
  ): { collAsset: EthereumAddress, collAssetId: number, debtAsset: EthereumAddress, debtAssetId: number } {
    const collAsset = web3.eth.abi.decodeParameter('address', subData[0]) as unknown as EthereumAddress;
    const collAssetId = Number(web3.eth.abi.decodeParameter('uint8', subData[1]));
    const debtAsset = web3.eth.abi.decodeParameter('address', subData[2]) as unknown as EthereumAddress;
    const debtAssetId = Number(web3.eth.abi.decodeParameter('uint8', subData[3]));

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
  decode(web3: Web3, subData: Array<string>): { targetRatio: string } {
    // @ts-ignore
    const targetRatio = new Dec(web3.utils.fromWei(web3.eth.abi.decodeParameter('uint256', subData[3]))).mul(100).toString();
    return { targetRatio };
  },
};

export const compoundV3RatioTriggerData = {
  encode(
    web3: Web3,
    owner: EthereumAddress,
    market: EthereumAddress,
    ratio: number,
    ratioState: RatioState,
  ): [string] {
    const _ratio = web3.utils.toWei(new Dec(ratio).div(100).toString());
    return [web3.eth.abi.encodeParameters(['address', 'address', 'uint256', 'uint8'], [owner, market, _ratio, ratioState])];
  },
  decode(
    web3: Web3,
    triggerData: Array<string>,
  ): { owner: EthereumAddress, market: EthereumAddress, ratioState: RatioState, ratio: string } {
    const decodedData = web3.eth.abi.decodeParameters(['address', 'address', 'uint256', 'uint8'], triggerData[0]);
    return {
      owner: decodedData[0],
      market: decodedData[1],
      ratio: new Dec(web3.utils.fromWei(decodedData[2])).mul(100).toString(),
      ratioState: +decodedData[3],
    };
  },
};

export const compoundV2RatioTriggerData = {
  encode(web3: Web3, owner: EthereumAddress, ratio: number, ratioState: RatioState): [string] {
    const _ratio = web3.utils.toWei(new Dec(ratio).div(100).toString());
    return [web3.eth.abi.encodeParameters(['address', 'uint256', 'uint8'], [owner, _ratio, ratioState])];
  },
  decode(web3: Web3, triggerData: Array<string>): { owner: EthereumAddress, ratioState: RatioState, ratio: string } {
    const decodedData = web3.eth.abi.decodeParameters(['address', 'uint256', 'uint8'], triggerData[0]);
    return {
      owner: decodedData[0],
      ratio: new Dec(web3.utils.fromWei(decodedData[1])).mul(100).toString(),
      ratioState: +decodedData[2],
    };
  },
};

export const liquityRatioTriggerData = {
  encode(web3: Web3, owner: EthereumAddress, ratio: number, ratioState: RatioState): [string] {
    const _ratio = web3.utils.toWei(new Dec(ratio).div(100).toString());
    return [web3.eth.abi.encodeParameters(['address', 'uint256', 'uint8'], [owner, _ratio, ratioState])];
  },
  decode(web3: Web3, triggerData: Array<string>): { owner: EthereumAddress, ratioState: RatioState, ratio: string } {
    const decodedData = web3.eth.abi.decodeParameters(['address', 'uint256', 'uint8'], triggerData[0]);
    return {
      owner: decodedData[0],
      ratio: new Dec(web3.utils.fromWei(decodedData[1])).mul(100).toString(),
      ratioState: +decodedData[2],
    };
  },
};

export const liquityDebtInFrontTriggerData = {
  encode(web3: Web3, owner: EthereumAddress, debtInFrontMin: string): [string] {
    return [web3.eth.abi.encodeParameters(['address', 'uint256'], [owner, debtInFrontMin])];
  },
  decode(web3: Web3, triggerData: Array<string>): { owner: EthereumAddress, debtInFrontMin: string } {
    const decodedData = web3.eth.abi.decodeParameters(['address', 'uint256'], triggerData[0]);
    return {
      owner: decodedData[0],
      debtInFrontMin: decodedData[1],
    };
  },
};

export const aaveV2RatioTriggerData = {
  encode(web3: Web3, owner: EthereumAddress, market: EthereumAddress, ratio: number, ratioState: RatioState): [string] {
    const _ratio = web3.utils.toWei(new Dec(ratio).div(100).toString());
    return [web3.eth.abi.encodeParameters(['address', 'address', 'uint256', 'uint8'], [owner, market, _ratio, ratioState])];
  },
  decode(web3: Web3, triggerData: Array<string>): { owner: EthereumAddress, market:EthereumAddress, ratioState: RatioState, ratio: string } {
    const decodedData = web3.eth.abi.decodeParameters(['address', 'address', 'uint256', 'uint8'], triggerData[0]);
    return {
      owner: decodedData[0],
      market: decodedData[1],
      ratio: new Dec(web3.utils.fromWei(decodedData[2])).mul(100).toString(),
      ratioState: +decodedData[3],
    };
  },
};

export const cBondsRebondSubData = {
  encode(web3: Web3, bondId: number | string): [string] {
    const bondIdEncoded = web3.eth.abi.encodeParameter('uint256', bondId);
    return [bondIdEncoded];
  },
  decode(web3: Web3, subData: Array<string>): { bondId: string } {
    const bondId = web3.eth.abi.decodeParameter('uint256', subData[1]).toString();
    return { bondId };
  },
};

export const cBondsRebondTriggerData = {
  encode(web3: Web3, bondId: number | string): [string] {
    return [web3.eth.abi.encodeParameters(['uint256'], [bondId])];
  },
  decode(web3: Web3, triggerData: Array<string>): { bondId: string } {
    const decodedData = web3.eth.abi.decodeParameters(['uint256'], triggerData[0]);
    return { bondId: decodedData[0] };
  },
};