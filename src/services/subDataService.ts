import Dec from 'decimal.js';
import { getAssetInfo } from '@defisaver/tokens';
import { otherAddresses } from '@defisaver/sdk';

import type { EthereumAddress, SubData } from '../types';
import { ChainId } from '../types/enums';

import { ZERO_ADDRESS } from '../constants';

import { compareAddresses, ratioPercentageToWei, weiToRatioPercentage } from './utils';

const { mockedWeb3 } = process;

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

    const vaultIdEncoded = mockedWeb3.eth.abi.encodeParameter('uint256', vaultId.toString());
    const targetRatioWei = ratioPercentageToWei(targetRatioPercentage);
    const targetRatioEncoded = mockedWeb3.eth.abi.encodeParameter('uint256', targetRatioWei);
    const daiAddrEncoded = mockedWeb3.eth.abi.encodeParameter('address', _daiAddr);
    const mcdManagerAddrEncoded = mockedWeb3.eth.abi.encodeParameter('address', _mcdCdpManagerAddr);

    return [vaultIdEncoded, targetRatioEncoded, daiAddrEncoded, mcdManagerAddrEncoded];
  },
  decode(subData: SubData): { vaultId: number, daiAddr: string, mcdManagerAddr: string, targetRatio: number } {
    const vaultId = +mockedWeb3.eth.abi.decodeParameter('uint256', subData[0]).toString();

    const weiRatio = mockedWeb3.eth.abi.decodeParameter('uint256', subData[1]) as any as string;
    const targetRatio = weiToRatioPercentage(weiRatio);

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
  ): SubData {
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
  decode(subData: SubData): { vaultId: number, closeToAssetAddr: EthereumAddress } {
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
    chainId: ChainId = ChainId.Ethereum,
    collAddr?: EthereumAddress,
    debtAddr?: EthereumAddress,
  ): SubData {
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
  decode(subData: SubData): { closeToAssetAddr: EthereumAddress, debtAddr: string } {
    const closeToAssetAddr = mockedWeb3.eth.abi.decodeParameter('address', subData[0]).toString().toLowerCase();
    const debtAddr = mockedWeb3.eth.abi.decodeParameter('address', subData[1]).toString().toLowerCase();

    return { closeToAssetAddr, debtAddr };
  },
};

export const aaveLeverageManagementSubData = { // TODO encode?
  decode(subData: SubData): { targetRatio: number } {
    const ratioWei = mockedWeb3.eth.abi.decodeParameter('uint256', subData[0]) as any as string;
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
    const encodedColl = mockedWeb3.eth.abi.encodeParameter('address', collAsset);
    const encodedCollId = mockedWeb3.eth.abi.encodeParameter('uint8', collAssetId);

    const encodedDebt = mockedWeb3.eth.abi.encodeParameter('address', debtAsset);
    const encodedDebtId = mockedWeb3.eth.abi.encodeParameter('uint8', debtAssetId);

    const encodedNullAddress = mockedWeb3.eth.abi.encodeParameter('address', nullAddress);

    return [encodedColl, encodedCollId, encodedDebt, encodedDebtId, encodedNullAddress];
  },
  decode(subData: SubData): { collAsset: EthereumAddress, collAssetId: number, debtAsset: EthereumAddress, debtAssetId: number } {
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
    minRatio: number,
    maxRatio: number,
    maxOptimalRatio: number,
    minOptimalRatio: number,
    boostEnabled: boolean,
    isEOA: boolean,
  ): SubData {
    return [
      market,
      baseToken,
      new Dec(minRatio).mul(1e16).toString(),
      new Dec(maxRatio).mul(1e16).toString(),
      new Dec(maxOptimalRatio).mul(1e16).toString(),
      new Dec(minOptimalRatio).mul(1e16).toString(),
      // @ts-ignore // TODO
      boostEnabled, isEOA,
    ];
  },
  decode(subData: SubData): { targetRatio: number } {
    const weiRatio = mockedWeb3.eth.abi.decodeParameter('uint256', subData[3]) as any as string;
    const targetRatio = weiToRatioPercentage(weiRatio);

    return { targetRatio };
  },
};

export const cBondsRebondSubData = {
  encode(bondId: number | string): SubData {
    const bondIdEncoded = mockedWeb3.eth.abi.encodeParameter('uint256', bondId);
    return [bondIdEncoded];
  },
  decode(subData: SubData): { bondId: string } {
    const bondId = mockedWeb3.eth.abi.decodeParameter('uint256', subData[1]).toString();
    return { bondId };
  },
};

export const liquityPaybackUsingChickenBondSubData = {
  /**
   * @param sourceId bondId or subId
   * @param sourceType 0 for bond, 1 for subId
   */
  encode: (sourceId: string, sourceType: number): SubData => {
    const sourceIdEncoded = mockedWeb3.eth.abi.encodeParameter('uint256', sourceId);
    const sourceTypeEncoded = mockedWeb3.eth.abi.encodeParameter('uint256', sourceType);
    const lusdAddressEncoded = mockedWeb3.eth.abi.encodeParameter('address', getAssetInfo('LUSD').address);
    const bLusdAddressEncoded = mockedWeb3.eth.abi.encodeParameter('address', getAssetInfo('bLUSD').address);

    return [sourceIdEncoded, sourceTypeEncoded, lusdAddressEncoded, bLusdAddressEncoded];
  },
  decode: (subData: SubData) => {
    const sourceId = mockedWeb3.eth.abi.decodeParameter('uint256', subData[0]).toString();
    const sourceType = mockedWeb3.eth.abi.decodeParameter('uint256', subData[1]).toString();

    return { sourceId, sourceType };
  },
};