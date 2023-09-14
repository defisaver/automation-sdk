import Dec from 'decimal.js';
import * as web3Abi from 'web3-eth-abi';
import { assetAmountInEth, getAssetInfo, getAssetInfoByAddress } from '@defisaver/tokens';
import { otherAddresses } from '@defisaver/sdk';

import type { EthereumAddress, SubData } from '../types';
import { ChainId, RatioState } from '../types/enums';

import { ZERO_ADDRESS } from '../constants';

import { compareAddresses, ratioPercentageToWei, weiToRatioPercentage } from './utils';

export const makerRepayFromSavingsSubData = {
  encode(
    vaultId: number,
    targetRatioPercentage: number,
    chainId: ChainId,
    daiAddr?: EthereumAddress,
    mcdCdpManagerAddr?: EthereumAddress,
  ): SubData {
    const _daiAddr = daiAddr || getAssetInfo('DAI', chainId).address;
    // @ts-ignore // TODO - this requires change in @defisaver/tokens
    const _mcdCdpManagerAddr = mcdCdpManagerAddr || otherAddresses(chainId).McdCdpManager;

    const vaultIdEncoded = web3Abi.encodeParameter('uint256', vaultId.toString());
    const targetRatioWei = ratioPercentageToWei(targetRatioPercentage);
    const targetRatioEncoded = web3Abi.encodeParameter('uint256', targetRatioWei);
    const daiAddrEncoded = web3Abi.encodeParameter('address', _daiAddr);
    const mcdManagerAddrEncoded = web3Abi.encodeParameter('address', _mcdCdpManagerAddr);

    return [vaultIdEncoded, targetRatioEncoded, daiAddrEncoded, mcdManagerAddrEncoded];
  },
  decode(subData: SubData): { vaultId: number, daiAddr: string, mcdManagerAddr: string, targetRatio: number } {
    const vaultId = +web3Abi.decodeParameter('uint256', subData[0])!.toString();

    const weiRatio = web3Abi.decodeParameter('uint256', subData[1]) as any as string;
    const targetRatio = weiToRatioPercentage(weiRatio);

    const daiAddr = web3Abi.decodeParameter('address', subData[2])!.toString();
    const mcdManagerAddr = web3Abi.decodeParameter('address', subData[3])!.toString();

    return {
      vaultId, targetRatio, daiAddr, mcdManagerAddr,
    };
  },
};

export const makerCloseSubData = {
  encode(
    vaultId: number,
    closeToAssetAddr: EthereumAddress,
    chainId: ChainId,
    daiAddr?: EthereumAddress,
    mcdCdpManagerAddr?: EthereumAddress,
  ): SubData {
    const _daiAddr = daiAddr || getAssetInfo('DAI', chainId).address;
    // @ts-ignore // TODO - this requires change in @defisaver/tokens
    const _mcdCdpManagerAddr = mcdCdpManagerAddr || otherAddresses(chainId).McdCdpManager;

    const vaultIdEncoded = web3Abi.encodeParameter('uint256', vaultId.toString());
    const daiAddrEncoded = web3Abi.encodeParameter('address', _daiAddr);
    const mcdManagerAddrEncoded = web3Abi.encodeParameter('address', _mcdCdpManagerAddr);

    if (compareAddresses(closeToAssetAddr, _daiAddr)) {
      // Close to DAI strategy
      return [vaultIdEncoded, daiAddrEncoded, mcdManagerAddrEncoded];
    }
    // Close to collateral strategy
    const collAddrEncoded = web3Abi.encodeParameter('address', closeToAssetAddr);
    return [vaultIdEncoded, collAddrEncoded, daiAddrEncoded, mcdManagerAddrEncoded];
  },
  decode(subData: SubData): { vaultId: number, closeToAssetAddr: EthereumAddress } {
    const vaultId = +web3Abi.decodeParameter('uint256', subData[0])!;
    // if closing to collateral, asset addr will be 2nd param out of 4
    // if closing to DAI, will return 2nd param out of 3, which will be DAI addr
    const closeToAssetAddr = web3Abi.decodeParameter('address', subData[1])!.toString().toLowerCase();

    return {
      vaultId, closeToAssetAddr,
    };
  },
};

export const makerLeverageManagementSubData = {
  // encode: (vaultId:number, repayFrom, boostFrom, boostTo, repayTo, boostEnabled) => [
  //   vaultId,
  //   new Dec(repayFrom).mul(1e16).toString(),
  //   new Dec(boostFrom).mul(1e16).toString(),
  //   new Dec(boostTo).mul(1e16).toString(),
  //   new Dec(repayTo).mul(1e16).toString(),
  //   boostEnabled,
  // ],
  decode: (subData:SubData) => {
    const vaultId = +web3Abi.decodeParameter('uint256', subData[0])!.toString();
    const weiRatio = web3Abi.decodeParameter('uint256', subData[1]) as any as string;
    const targetRatio = weiToRatioPercentage(weiRatio);
    return { vaultId, targetRatio };
  },
};
export const liquityLeverageManagementSubData = {
  decode: (subData:SubData) => {
    const weiRatio = web3Abi.decodeParameter('uint256', subData[1]) as any as string;
    const targetRatio = weiToRatioPercentage(weiRatio);
    return { targetRatio };
  },
};
export const liquityCloseSubData = {
  encode(
    closeToAssetAddr: EthereumAddress,
    chainId: ChainId = ChainId.Ethereum,
    collAddr?: EthereumAddress,
    debtAddr?: EthereumAddress,
  ): SubData {
    const _collAddr = collAddr || getAssetInfo('WETH', chainId).address;
    const _debtAddr = debtAddr || getAssetInfo('LUSD', chainId).address;

    const collAddrEncoded = web3Abi.encodeParameter('address', _collAddr);
    const debtAddrEncoded = web3Abi.encodeParameter('address', _debtAddr);
    // if (compareAddresses(closeToAssetAddr, daiAddr)) { // TODO - Uhm, wth?
    //   // close to LUSD strategy
    //   return [daiAddrEncoded, mcdManagerAddrEncoded];
    // }
    // close to collateral strategy
    return [collAddrEncoded, debtAddrEncoded];
  },
  decode(subData: SubData): { closeToAssetAddr: EthereumAddress, debtAddr: string } {
    const closeToAssetAddr = web3Abi.decodeParameter('address', subData[0])!.toString().toLowerCase();
    const debtAddr = web3Abi.decodeParameter('address', subData[1])!.toString().toLowerCase();

    return { closeToAssetAddr, debtAddr };
  },
};

export const aaveV2LeverageManagementSubData = {
  encode(
    triggerRepayRatio: number,
    triggerBoostRatio: number,
    targetBoostRatio: number,
    targetRepayRatio: number,
    boostEnabled: boolean,
  ): SubData {
    return [
      new Dec(triggerRepayRatio).mul(1e16).toString(),
      new Dec(triggerBoostRatio).mul(1e16).toString(),
      new Dec(targetBoostRatio).mul(1e16).toString(),
      new Dec(targetRepayRatio).mul(1e16).toString(),
      // @ts-ignore // TODO
      boostEnabled,
    ];
  },
  decode(subData: SubData): { targetRatio: number } {
    const ratioWei = web3Abi.decodeParameter('uint256', subData[1]) as any as string;
    const targetRatio = weiToRatioPercentage(ratioWei);

    return { targetRatio };
  },
};

export const aaveV3LeverageManagementSubData = { // TODO encode?
  decode(subData: SubData): { targetRatio: number } {
    const ratioWei = web3Abi.decodeParameter('uint256', subData[0]) as any as string;
    const targetRatio = weiToRatioPercentage(ratioWei);

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
  ): SubData {
    const encodedColl = web3Abi.encodeParameter('address', collAsset);
    const encodedCollId = web3Abi.encodeParameter('uint8', collAssetId);

    const encodedDebt = web3Abi.encodeParameter('address', debtAsset);
    const encodedDebtId = web3Abi.encodeParameter('uint8', debtAssetId);

    const encodedNullAddress = web3Abi.encodeParameter('address', nullAddress);

    return [encodedColl, encodedCollId, encodedDebt, encodedDebtId, encodedNullAddress];
  },
  decode(subData: SubData): { collAsset: EthereumAddress, collAssetId: number, debtAsset: EthereumAddress, debtAssetId: number } {
    const collAsset = web3Abi.decodeParameter('address', subData[0]) as unknown as EthereumAddress;
    const collAssetId = Number(web3Abi.decodeParameter('uint8', subData[1]));

    const debtAsset = web3Abi.decodeParameter('address', subData[2]) as unknown as EthereumAddress;
    const debtAssetId = Number(web3Abi.decodeParameter('uint8', subData[3]));

    return {
      collAsset, collAssetId, debtAsset, debtAssetId,
    };
  },
};

export const compoundV2LeverageManagementSubData = {
  encode(
    triggerRepayRatio: number,
    triggerBoostRatio: number,
    targetBoostRatio: number,
    targetRepayRatio: number,
    boostEnabled: boolean,
  ): SubData {
    return [
      new Dec(triggerRepayRatio).mul(1e16).toString(),
      new Dec(triggerBoostRatio).mul(1e16).toString(),
      new Dec(targetBoostRatio).mul(1e16).toString(),
      new Dec(targetRepayRatio).mul(1e16).toString(),
      // @ts-ignore // TODO
      boostEnabled,
    ];
  },
  decode(subData: SubData): { targetRatio: number } {
    const weiRatio = web3Abi.decodeParameter('uint256', subData[0]) as any as string;
    const targetRatio = weiToRatioPercentage(weiRatio);

    return { targetRatio };
  },
};

export const compoundV3LeverageManagementSubData = {
  encode(
    market: EthereumAddress,
    baseToken: EthereumAddress,
    triggerRepayRatio: number,
    triggerBoostRatio: number,
    targetBoostRatio: number,
    targetRepayRatio: number,
    boostEnabled: boolean,
    isEOA: boolean,
  ): SubData {
    return [
      market,
      baseToken,
      new Dec(triggerRepayRatio).mul(1e16).toString(),
      new Dec(triggerBoostRatio).mul(1e16).toString(),
      new Dec(targetBoostRatio).mul(1e16).toString(),
      new Dec(targetRepayRatio).mul(1e16).toString(),
      // @ts-ignore // TODO
      boostEnabled, isEOA,
    ];
  },
  decode(subData: SubData): { targetRatio: number } {
    const weiRatio = web3Abi.decodeParameter('uint256', subData[3]) as any as string;
    const targetRatio = weiToRatioPercentage(weiRatio);

    return { targetRatio };
  },
};

export const morphoAaveV2LeverageManagementSubData = {
  encode(
    triggerRepayRatio: number,
    triggerBoostRatio: number,
    targetBoostRatio: number,
    targetRepayRatio: number,
    boostEnabled: boolean,
  ): SubData {
    return [
      ratioPercentageToWei(triggerRepayRatio),
      ratioPercentageToWei(triggerBoostRatio),
      ratioPercentageToWei(targetBoostRatio),
      ratioPercentageToWei(targetRepayRatio),
      // @ts-ignore
      boostEnabled,
    ];
  },
  decode(subData: SubData): { targetRatio: number } {
    const ratioWei = web3Abi.decodeParameter('uint128', subData[1]) as any as string;
    const targetRatio = weiToRatioPercentage(ratioWei);

    return { targetRatio };
  },
};

export const cBondsRebondSubData = {
  encode(bondId: number | string): SubData {
    const bondIdEncoded = web3Abi.encodeParameter('uint256', bondId);
    return [bondIdEncoded];
  },
  decode(subData: SubData): { bondId: string } {
    const bondId = web3Abi.decodeParameter('uint256', subData[1])!.toString();
    return { bondId };
  },
};

export const liquityPaybackUsingChickenBondSubData = {
  /**
   * @param sourceId bondId or subId
   * @param sourceType 0 for bond, 1 for subId
   * @param chainId
   */
  encode: (sourceId: string, sourceType: number, chainId: ChainId = ChainId.Ethereum): SubData => {
    const sourceIdEncoded = web3Abi.encodeParameter('uint256', sourceId);
    const sourceTypeEncoded = web3Abi.encodeParameter('uint256', sourceType);
    const lusdAddressEncoded = web3Abi.encodeParameter('address', getAssetInfo('LUSD', chainId).address);
    const bLusdAddressEncoded = web3Abi.encodeParameter('address', getAssetInfo('bLUSD', chainId).address);

    return [sourceIdEncoded, sourceTypeEncoded, lusdAddressEncoded, bLusdAddressEncoded];
  },
  decode: (subData: SubData) => {
    const sourceId = web3Abi.decodeParameter('uint256', subData[0])!.toString();
    const sourceType = web3Abi.decodeParameter('uint256', subData[1])!.toString();

    return { sourceId, sourceType };
  },
};

export const exchangeDcaSubData = {
  encode: (fromToken: EthereumAddress, toToken: EthereumAddress, amount: string, interval: number) : SubData => {
    const sellTokenEncoded = web3Abi.encodeParameter('address', fromToken);
    const buyTokenEncoded = web3Abi.encodeParameter('address', toToken);
    const amountEncoded = web3Abi.encodeParameter('uint256', amount);
    const intervalEncoded = web3Abi.encodeParameter('uint256', interval);

    return [sellTokenEncoded, buyTokenEncoded, amountEncoded, intervalEncoded];
  },
  decode: (subData: SubData, chainId: ChainId) => {
    const fromToken = web3Abi.decodeParameter('address', subData[0])!.toString();
    const toToken = web3Abi.decodeParameter('address', subData[1])!.toString();
    const amount = assetAmountInEth(web3Abi.decodeParameter('uint256', subData[2])!.toString(), getAssetInfoByAddress(fromToken, chainId).symbol);
    const interval = web3Abi.decodeParameter('uint256', subData[3])!.toString();
    return {
      fromToken,
      toToken,
      amount,
      interval,
    };
  },
};

export const exchangeLimitOrderSubData = {
  encode(fromToken: EthereumAddress, toToken: EthereumAddress, amount: string, targetPrice: string, goodUntil: string | number, orderType: number) : SubData {
    return [
      fromToken,
      toToken,
      amount,
      targetPrice,
      new Dec(goodUntil).toString(),
      new Dec(orderType).toString(),
    ];
  },
  decode: (subData: SubData, chainId: ChainId) => {
    const fromToken = web3Abi.decodeParameter('address', subData[0])!.toString();
    const toToken = web3Abi.decodeParameter('address', subData[1])!.toString();
    const amount = assetAmountInEth(web3Abi.decodeParameter('uint256', subData[2])!.toString(), getAssetInfoByAddress(fromToken, chainId).symbol);
    return { fromToken, toToken, amount };
  },
};

export const sparkLeverageManagementSubData = { // TODO encode?
  decode(subData: SubData): { targetRatio: number } {
    const ratioWei = web3Abi.decodeParameter('uint256', subData[0]) as any as string;
    const targetRatio = weiToRatioPercentage(ratioWei);

    return { targetRatio };
  },
};

export const sparkQuotePriceSubData = {
  encode(
    collAsset: EthereumAddress,
    collAssetId: number,
    debtAsset: EthereumAddress,
    debtAssetId: number,
    nullAddress: EthereumAddress = ZERO_ADDRESS,
  ): SubData {
    const encodedColl = web3Abi.encodeParameter('address', collAsset);
    const encodedCollId = web3Abi.encodeParameter('uint8', collAssetId);

    const encodedDebt = web3Abi.encodeParameter('address', debtAsset);
    const encodedDebtId = web3Abi.encodeParameter('uint8', debtAssetId);

    const encodedNullAddress = web3Abi.encodeParameter('address', nullAddress);

    return [encodedColl, encodedCollId, encodedDebt, encodedDebtId, encodedNullAddress];
  },
  decode(subData: SubData): { collAsset: EthereumAddress, collAssetId: number, debtAsset: EthereumAddress, debtAssetId: number } {
    const collAsset = web3Abi.decodeParameter('address', subData[0]) as unknown as EthereumAddress;
    const collAssetId = Number(web3Abi.decodeParameter('uint8', subData[1]));

    const debtAsset = web3Abi.decodeParameter('address', subData[2]) as unknown as EthereumAddress;
    const debtAssetId = Number(web3Abi.decodeParameter('uint8', subData[3]));

    return {
      collAsset, collAssetId, debtAsset, debtAssetId,
    };
  },
};

export const liquityDsrPaybackSubData = {
  encode: (targetRatio: number) => {
    const daiAddress = getAssetInfo('DAI').address;
    const lusdAddress = getAssetInfo('LUSD').address;

    const ratioStateEncoded = mockedWeb3.eth.abi.encodeParameter('uint8', RatioState.UNDER);
    const targetRatioEncoded = mockedWeb3.eth.abi.encodeParameter('uint256', ratioPercentageToWei(targetRatio));
    const daiAddressEncoded = mockedWeb3.eth.abi.encodeParameter('address', daiAddress);
    const lusdAddressEncoded = mockedWeb3.eth.abi.encodeParameter('address', lusdAddress);

    return [ratioStateEncoded, targetRatioEncoded, daiAddressEncoded, lusdAddressEncoded];
  },
  decode: (subData: SubData) => {
    const weiRatio = mockedWeb3.eth.abi.decodeParameter('uint256', subData[1]) as any as string;
    const targetRatio = weiToRatioPercentage(weiRatio);
    return { targetRatio };
  },
};

export const liquityDsrSupplySubData = {
  encode: (targetRatio: number) => {
    const daiAddress = getAssetInfo('DAI').address;
    const wethAddress = getAssetInfo('WETH').address;

    const ratioStateEncoded = mockedWeb3.eth.abi.encodeParameter('uint8', RatioState.UNDER);
    const targetRatioEncoded = mockedWeb3.eth.abi.encodeParameter('uint256', ratioPercentageToWei(targetRatio));
    const daiAddressEncoded = mockedWeb3.eth.abi.encodeParameter('address', daiAddress);
    const wethAddressEncoded = mockedWeb3.eth.abi.encodeParameter('address', wethAddress);

    return [ratioStateEncoded, targetRatioEncoded, daiAddressEncoded, wethAddressEncoded];
  },
  decode: (subData: SubData) => {
    const weiRatio = mockedWeb3.eth.abi.decodeParameter('uint256', subData[1]) as any as string;
    const targetRatio = weiToRatioPercentage(weiRatio);
    return { targetRatio };
  },
};
