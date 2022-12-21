import Dec from 'decimal.js';
import { getAssetInfo } from '@defisaver/tokens';
import { otherAddresses } from '@defisaver/sdk';

import { ZERO_ADDRESS } from '../constants';
import type { EthereumAddress } from '../types';

import { compareAddresses, ratioPercentageToWei } from './utils';
import type { ChainId } from '../types/enums';

const { mockedWeb3 } = process;

export const makerRepayFromSavingsSubData = {
  encode(
    vaultId: number,
    targetRatioPercentage: number,
    chainId: ChainId,
    daiAddr?: EthereumAddress,
    mcdCdpManagerAddr?: EthereumAddress,
  ): [string, string, string, string] {
    const _daiAddr = daiAddr || getAssetInfo('DAI', chainId).address;
    // @ts-ignore // TODO - this requires change in @defisaver/tokens
    const _mcdCdpManagerAddr = mcdCdpManagerAddr || otherAddresses(chainId).McdCdpManager;

    const vaultIdEncoded = mockedWeb3.eth.abi.encodeParameter('uint256', vaultId.toString());
    const targetRatioWei = ratioPercentageToWei(targetRatioPercentage);
    const targetRatioEncoded = mockedWeb3.eth.abi.encodeParameter('uint256', targetRatioWei);
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