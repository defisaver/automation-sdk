import Dec from 'decimal.js';
import AbiCoder from 'web3-eth-abi';
import { assetAmountInEth, getAssetInfo, getAssetInfoByAddress } from '@defisaver/tokens';
import { otherAddresses } from '@defisaver/sdk';

import type { EthereumAddress, SubData } from '../types';
import type { OrderType } from '../types/enums';
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

    const vaultIdEncoded = AbiCoder.encodeParameter('uint256', vaultId.toString());
    const targetRatioWei = ratioPercentageToWei(targetRatioPercentage);
    const targetRatioEncoded = AbiCoder.encodeParameter('uint256', targetRatioWei);
    const daiAddrEncoded = AbiCoder.encodeParameter('address', _daiAddr);
    const mcdManagerAddrEncoded = AbiCoder.encodeParameter('address', _mcdCdpManagerAddr);

    return [vaultIdEncoded, targetRatioEncoded, daiAddrEncoded, mcdManagerAddrEncoded];
  },
  decode(subData: SubData): { vaultId: number, daiAddr: string, mcdManagerAddr: string, targetRatio: number } {
    const vaultId = +AbiCoder.decodeParameter('uint256', subData[0])!.toString();

    const weiRatio = AbiCoder.decodeParameter('uint256', subData[1]) as any as string;
    const targetRatio = weiToRatioPercentage(weiRatio);

    const daiAddr = AbiCoder.decodeParameter('address', subData[2])!.toString();
    const mcdManagerAddr = AbiCoder.decodeParameter('address', subData[3])!.toString();

    return {
      vaultId, targetRatio, daiAddr, mcdManagerAddr,
    };
  },
};

export const liquityRepayFromSavingsSubData = {
  decode(subData: SubData): { targetRatio: number } {
    const weiRatio = AbiCoder.decodeParameter('uint256', subData[1]) as any as string;
    const targetRatio = weiToRatioPercentage(weiRatio);

    return { targetRatio };
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

    const vaultIdEncoded = AbiCoder.encodeParameter('uint256', vaultId.toString());
    const daiAddrEncoded = AbiCoder.encodeParameter('address', _daiAddr);
    const mcdManagerAddrEncoded = AbiCoder.encodeParameter('address', _mcdCdpManagerAddr);

    if (compareAddresses(closeToAssetAddr, _daiAddr)) {
      // Close to DAI strategy
      return [vaultIdEncoded, daiAddrEncoded, mcdManagerAddrEncoded];
    }
    // Close to collateral strategy
    const collAddrEncoded = AbiCoder.encodeParameter('address', closeToAssetAddr);
    return [vaultIdEncoded, collAddrEncoded, daiAddrEncoded, mcdManagerAddrEncoded];
  },
  decode(subData: SubData): { vaultId: number, closeToAssetAddr: EthereumAddress } {
    const vaultId = +AbiCoder.decodeParameter('uint256', subData[0])!;
    // if closing to collateral, asset addr will be 2nd param out of 4
    // if closing to DAI, will return 2nd param out of 3, which will be DAI addr
    const closeToAssetAddr = AbiCoder.decodeParameter('address', subData[1])!.toString();

    return {
      vaultId, closeToAssetAddr,
    };
  },
};

export const makerLeverageManagementSubData = {
  decode: (subData:SubData) => {
    const vaultId = +AbiCoder.decodeParameter('uint256', subData[0])!.toString();
    const weiRatio = AbiCoder.decodeParameter('uint256', subData[1]) as any as string;
    const targetRatio = weiToRatioPercentage(weiRatio);
    return { vaultId, targetRatio };
  },
};

export const liquityLeverageManagementSubData = {
  decode: (subData:SubData) => {
    const weiRatio = AbiCoder.decodeParameter('uint256', subData[1]) as any as string;
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

    const collAddrEncoded = AbiCoder.encodeParameter('address', _collAddr);
    const debtAddrEncoded = AbiCoder.encodeParameter('address', _debtAddr);
    // if (compareAddresses(closeToAssetAddr, _debtAddr)) { // Closing to debt strategy was not implemented, but it should be in the future
    //   // close to LUSD strategy
    //   return [debtAddrEncoded, collAddrEncoded];
    // }
    // close to collateral strategy
    return [collAddrEncoded, debtAddrEncoded];
  },
  decode(subData: SubData): { closeToAssetAddr: EthereumAddress, debtAddr: string } {
    const closeToAssetAddr = AbiCoder.decodeParameter('address', subData[0])!.toString();
    const debtAddr = AbiCoder.decodeParameter('address', subData[1])!.toString();

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
    const ratioWei = AbiCoder.decodeParameter('uint256', subData[1]) as any as string;
    const targetRatio = weiToRatioPercentage(ratioWei);

    return { targetRatio };
  },
};

export const aaveV3LeverageManagementSubData = { // TODO encode?
  decode(subData: SubData): { targetRatio: number } {
    const ratioWei = AbiCoder.decodeParameter('uint256', subData[0]) as any as string;
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
    const encodedColl = AbiCoder.encodeParameter('address', collAsset);
    const encodedCollId = AbiCoder.encodeParameter('uint8', collAssetId);

    const encodedDebt = AbiCoder.encodeParameter('address', debtAsset);
    const encodedDebtId = AbiCoder.encodeParameter('uint8', debtAssetId);

    const encodedNullAddress = AbiCoder.encodeParameter('address', nullAddress);

    return [encodedColl, encodedCollId, encodedDebt, encodedDebtId, encodedNullAddress];
  },
  decode(subData: SubData): { collAsset: EthereumAddress, collAssetId: number, debtAsset: EthereumAddress, debtAssetId: number } {
    const collAsset = AbiCoder.decodeParameter('address', subData[0]) as unknown as EthereumAddress;
    const collAssetId = Number(AbiCoder.decodeParameter('uint8', subData[1]));

    const debtAsset = AbiCoder.decodeParameter('address', subData[2]) as unknown as EthereumAddress;
    const debtAssetId = Number(AbiCoder.decodeParameter('uint8', subData[3]));

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
    const weiRatio = AbiCoder.decodeParameter('uint256', subData[0]) as any as string;
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
    const weiRatio = AbiCoder.decodeParameter('uint256', subData[3]) as any as string;
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
    const ratioWei = AbiCoder.decodeParameter('uint128', subData[1]) as any as string;
    const targetRatio = weiToRatioPercentage(ratioWei);

    return { targetRatio };
  },
};

export const cBondsRebondSubData = {
  encode(bondId: number | string): SubData {
    const bondIdEncoded = AbiCoder.encodeParameter('uint256', bondId);
    return [bondIdEncoded];
  },
  decode(subData: SubData): { bondId: string } {
    const bondId = AbiCoder.decodeParameter('uint256', subData[1])!.toString();
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
    const sourceIdEncoded = AbiCoder.encodeParameter('uint256', sourceId);
    const sourceTypeEncoded = AbiCoder.encodeParameter('uint256', sourceType);
    const lusdAddressEncoded = AbiCoder.encodeParameter('address', getAssetInfo('LUSD', chainId).address);
    const bLusdAddressEncoded = AbiCoder.encodeParameter('address', getAssetInfo('bLUSD', chainId).address);

    return [sourceIdEncoded, sourceTypeEncoded, lusdAddressEncoded, bLusdAddressEncoded];
  },
  decode: (subData: SubData) => {
    const sourceId = AbiCoder.decodeParameter('uint256', subData[0])!.toString();
    const sourceType = AbiCoder.decodeParameter('uint256', subData[1])!.toString();

    return { sourceId, sourceType };
  },
};

export const exchangeDcaSubData = {
  encode: (fromToken: EthereumAddress, toToken: EthereumAddress, amount: string, interval: number) : SubData => {
    const sellTokenEncoded = AbiCoder.encodeParameter('address', fromToken);
    const buyTokenEncoded = AbiCoder.encodeParameter('address', toToken);
    const amountEncoded = AbiCoder.encodeParameter('uint256', amount);
    const intervalEncoded = AbiCoder.encodeParameter('uint256', interval);

    return [sellTokenEncoded, buyTokenEncoded, amountEncoded, intervalEncoded];
  },
  decode: (subData: SubData, chainId: ChainId) => {
    const fromToken = AbiCoder.decodeParameter('address', subData[0])!.toString();
    const toToken = AbiCoder.decodeParameter('address', subData[1])!.toString();
    const amount = assetAmountInEth(AbiCoder.decodeParameter('uint256', subData[2])!.toString(), getAssetInfoByAddress(fromToken, chainId).symbol);
    const interval = AbiCoder.decodeParameter('uint256', subData[3])!.toString();
    return {
      fromToken,
      toToken,
      amount,
      interval,
    };
  },
};

export const exchangeLimitOrderSubData = {
  encode(fromToken: EthereumAddress, toToken: EthereumAddress, amount: string, targetPrice: string, goodUntil: string | number, orderType: OrderType) : SubData {
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
    const fromToken = AbiCoder.decodeParameter('address', subData[0])!.toString();
    const toToken = AbiCoder.decodeParameter('address', subData[1])!.toString();
    const amount = assetAmountInEth(AbiCoder.decodeParameter('uint256', subData[2])!.toString(), getAssetInfoByAddress(fromToken, chainId).symbol);
    return { fromToken, toToken, amount };
  },
};

export const sparkLeverageManagementSubData = { // TODO encode?
  decode(subData: SubData): { targetRatio: number } {
    const ratioWei = AbiCoder.decodeParameter('uint256', subData[0]) as any as string;
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
    const encodedColl = AbiCoder.encodeParameter('address', collAsset);
    const encodedCollId = AbiCoder.encodeParameter('uint8', collAssetId);

    const encodedDebt = AbiCoder.encodeParameter('address', debtAsset);
    const encodedDebtId = AbiCoder.encodeParameter('uint8', debtAssetId);

    const encodedNullAddress = AbiCoder.encodeParameter('address', nullAddress);

    return [encodedColl, encodedCollId, encodedDebt, encodedDebtId, encodedNullAddress];
  },
  decode(subData: SubData): { collAsset: EthereumAddress, collAssetId: number, debtAsset: EthereumAddress, debtAssetId: number } {
    const collAsset = AbiCoder.decodeParameter('address', subData[0]) as unknown as EthereumAddress;
    const collAssetId = Number(AbiCoder.decodeParameter('uint8', subData[1]));

    const debtAsset = AbiCoder.decodeParameter('address', subData[2]) as unknown as EthereumAddress;
    const debtAssetId = Number(AbiCoder.decodeParameter('uint8', subData[3]));

    return {
      collAsset, collAssetId, debtAsset, debtAssetId,
    };
  },
};

export const liquityDsrPaybackSubData = {
  encode: (targetRatio: number) => {
    const daiAddress = getAssetInfo('DAI').address;
    const lusdAddress = getAssetInfo('LUSD').address;

    const ratioStateEncoded = AbiCoder.encodeParameter('uint8', RatioState.UNDER);
    const targetRatioEncoded = AbiCoder.encodeParameter('uint256', ratioPercentageToWei(targetRatio));
    const daiAddressEncoded = AbiCoder.encodeParameter('address', daiAddress);
    const lusdAddressEncoded = AbiCoder.encodeParameter('address', lusdAddress);

    return [ratioStateEncoded, targetRatioEncoded, daiAddressEncoded, lusdAddressEncoded];
  },
  decode: (subData: SubData) => {
    const weiRatio = AbiCoder.decodeParameter('uint256', subData[1]) as any as string;
    const targetRatio = weiToRatioPercentage(weiRatio);
    return { targetRatio };
  },
};

export const liquityDsrSupplySubData = {
  encode: (targetRatio: number) => {
    const daiAddress = getAssetInfo('DAI').address;
    const wethAddress = getAssetInfo('WETH').address;

    const ratioStateEncoded = AbiCoder.encodeParameter('uint8', RatioState.UNDER);
    const targetRatioEncoded = AbiCoder.encodeParameter('uint256', ratioPercentageToWei(targetRatio));
    const daiAddressEncoded = AbiCoder.encodeParameter('address', daiAddress);
    const wethAddressEncoded = AbiCoder.encodeParameter('address', wethAddress);

    return [ratioStateEncoded, targetRatioEncoded, daiAddressEncoded, wethAddressEncoded];
  },
  decode: (subData: SubData) => {
    const weiRatio = AbiCoder.decodeParameter('uint256', subData[1]) as any as string;
    const targetRatio = weiToRatioPercentage(weiRatio);
    return { targetRatio };
  },
};

export const liquityDebtInFrontRepaySubData = {
  encode: (targetRatioIncrease: number) => {
    const wethAddress = getAssetInfo('WETH').address;
    const lusdAddress = getAssetInfo('LUSD').address;

    const wethAddressEncoded = AbiCoder.encodeParameter('address', wethAddress);
    const lusdAddressEncoded = AbiCoder.encodeParameter('address', lusdAddress);
    const targetRatioIncreaseEncoded = AbiCoder.encodeParameter('uint256', ratioPercentageToWei(targetRatioIncrease));
    const withdrawIdEncoded = AbiCoder.encodeParameter('uint8', 1); // withdraw - 1
    const paybackIdEncoded = AbiCoder.encodeParameter('uint8', 0); // payback - 0

    return [wethAddressEncoded, lusdAddressEncoded, targetRatioIncreaseEncoded, withdrawIdEncoded, paybackIdEncoded];
  },
  decode: (subData: SubData) => {
    const weiRatio = AbiCoder.decodeParameter('uint256', subData[2]) as any as string;
    const targetRatioIncrease = weiToRatioPercentage(weiRatio);
    return { targetRatioIncrease };
  },
};

export const crvUSDLeverageManagementSubData = {
  encode: (
    controllerAddr: EthereumAddress,
    ratioState: RatioState,
    targetRatio: number,
    collTokenAddr: EthereumAddress,
    crvUSDAddr: EthereumAddress,
  ) => {
    const controllerAddrEncoded = AbiCoder.encodeParameter('address', controllerAddr);
    const ratioStateEncoded = AbiCoder.encodeParameter('uint8', ratioState);
    const targetRatioEncoded = AbiCoder.encodeParameter('uint256', ratioPercentageToWei(targetRatio));
    const collTokenAddrEncoded = AbiCoder.encodeParameter('address', collTokenAddr);
    const crvUSDAddrEncoded = AbiCoder.encodeParameter('address', crvUSDAddr);
    return [controllerAddrEncoded, ratioStateEncoded, targetRatioEncoded, collTokenAddrEncoded, crvUSDAddrEncoded];
  },
  decode: (subData: SubData) => {
    const controller = AbiCoder.decodeParameter('address', subData[0]) as unknown as EthereumAddress;
    const weiRatio = AbiCoder.decodeParameter('uint256', subData[2]) as any as string;
    const targetRatio = weiToRatioPercentage(weiRatio);

    return { controller, targetRatio };
  },
};
