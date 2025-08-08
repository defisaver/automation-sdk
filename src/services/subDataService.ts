import Dec from 'decimal.js';
import AbiCoder from 'web3-eth-abi';
import { fromWei, toWei } from 'web3-utils';

import { assetAmountInEth, getAssetInfo, getAssetInfoByAddress } from '@defisaver/tokens';
import { otherAddresses } from '@defisaver/sdk';

import type { SubData, EthereumAddress } from '../types';
import type { CloseStrategyType, OrderType } from '../types/enums';
import {
  ChainId, CollActionType, DebtActionType, RatioState,
} from '../types/enums';

import { AAVE_V3_VARIABLE_BORROW_RATE, ZERO_ADDRESS } from '../constants';

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

export const compoundV3L2LeverageManagementSubData = {
  encode(
    market: EthereumAddress,
    baseToken: EthereumAddress,
    triggerRepayRatio: number,
    triggerBoostRatio: number,
    targetBoostRatio: number,
    targetRepayRatio: number,
    boostEnabled: boolean,
    isEOA: boolean,
  ): string {
    let subInput = '0x';

    subInput = subInput.concat(market.slice(2));
    subInput = subInput.concat(baseToken.slice(2));
    subInput = subInput.concat(new Dec(triggerRepayRatio).mul(1e16).toHex().slice(2)
      .padStart(32, '0'));
    subInput = subInput.concat(new Dec(triggerBoostRatio).mul(1e16).toHex().slice(2)
      .padStart(32, '0'));
    subInput = subInput.concat(new Dec(targetBoostRatio).mul(1e16).toHex().slice(2)
      .padStart(32, '0'));
    subInput = subInput.concat(new Dec(targetRepayRatio).mul(1e16).toHex().slice(2)
      .padStart(32, '0'));
    subInput = subInput.concat(boostEnabled ? '01' : '00');
    subInput = subInput.concat(isEOA ? '01' : '00');

    return subInput;
  },
  decode(subData: SubData): { targetRatio: number } {
    const ratioWei = AbiCoder.decodeParameter('uint256', subData[3]) as any as string;
    const targetRatio = weiToRatioPercentage(ratioWei);

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

export const crvUSDPaybackSubData = {
  encode: (
    controllerAddr: EthereumAddress,
    addressToPullTokensFrom: EthereumAddress,
    positionOwner: EthereumAddress,
    paybackAmount: string,
    crvUSDAddr: EthereumAddress,
  ) => {
    const controllerAddrEncoded = AbiCoder.encodeParameter('address', controllerAddr);
    const addressToPullTokensFromEncoded = AbiCoder.encodeParameter('address', addressToPullTokensFrom);
    const positionOwnerEncoded = AbiCoder.encodeParameter('address', positionOwner);
    const paybackAmountEncoded = AbiCoder.encodeParameter('uint256', toWei(paybackAmount, 'ether'));
    const crvUSDAddrEncoded = AbiCoder.encodeParameter('address', crvUSDAddr);
    return [
      controllerAddrEncoded,
      addressToPullTokensFromEncoded,
      positionOwnerEncoded,
      paybackAmountEncoded,
      crvUSDAddrEncoded,
    ];
  },
  decode: (subData: SubData) => {
    const controller = AbiCoder.decodeParameter('address', subData[0]) as unknown as EthereumAddress;
    const addressToPullTokensFrom = AbiCoder.decodeParameter('address', subData[1]) as any as EthereumAddress;
    const positionOwner = AbiCoder.decodeParameter('address', subData[2]) as any as EthereumAddress;
    const weiPaybackAmount = AbiCoder.decodeParameter('uint256', subData[3]) as any as string;
    const paybackAmount = fromWei(weiPaybackAmount, 'ether');
    return {
      controller,
      addressToPullTokensFrom,
      positionOwner,
      paybackAmount,
    };
  },
};

export const morphoBlueLeverageManagementSubData = {
  encode: (
    loanToken: EthereumAddress,
    collToken: EthereumAddress,
    oracle: EthereumAddress,
    irm: EthereumAddress,
    lltv: string,
    ratioState: RatioState,
    targetRatio: number,
    user: EthereumAddress,
    isEOA: boolean,
  ) => {
    const loanTokenEncoded = AbiCoder.encodeParameter('address', loanToken);
    const collTokenEncoded = AbiCoder.encodeParameter('address', collToken);
    const oracleEncoded = AbiCoder.encodeParameter('address', oracle);
    const irmEncoded = AbiCoder.encodeParameter('address', irm);
    const lltvEncoded = AbiCoder.encodeParameter('uint256', lltv);
    const ratioStateEncoded = AbiCoder.encodeParameter('uint8', ratioState);
    const targetRatioEncoded = AbiCoder.encodeParameter('uint256', ratioPercentageToWei(targetRatio));
    const userEncoded = AbiCoder.encodeParameter('address', user);
    const isEOAEncoded = AbiCoder.encodeParameter('bool', isEOA);
    return [loanTokenEncoded, collTokenEncoded, oracleEncoded, irmEncoded, lltvEncoded, ratioStateEncoded, targetRatioEncoded, userEncoded, isEOAEncoded];
  },
  decode: (subData: SubData) => {
    const loanToken = AbiCoder.decodeParameter('address', subData[0]) as unknown as EthereumAddress;
    const collToken = AbiCoder.decodeParameter('address', subData[1]) as any as EthereumAddress;
    const oracle = AbiCoder.decodeParameter('address', subData[2]) as any as EthereumAddress;
    const irm = AbiCoder.decodeParameter('address', subData[3]) as any as EthereumAddress;
    const lltv = AbiCoder.decodeParameter('uint256', subData[4]) as any as EthereumAddress;
    const weiRatio = AbiCoder.decodeParameter('uint256', subData[6]) as any as EthereumAddress;
    const user = AbiCoder.decodeParameter('address', subData[7]) as any as EthereumAddress;
    const targetRatio = weiToRatioPercentage(weiRatio);

    return {
      loanToken,
      collToken,
      oracle,
      irm,
      lltv,
      user,
      targetRatio,
    };
  },
};

export const aaveV3LeverageManagementOnPriceSubData = {
  encode(
    collAsset: EthereumAddress,
    collAssetId: number,
    debtAsset: EthereumAddress,
    debtAssetId: number,
    marketAddr: EthereumAddress,
    targetRatio: number,
  ): SubData {
    const encodedColl = AbiCoder.encodeParameter('address', collAsset);
    const encodedCollId = AbiCoder.encodeParameter('uint8', collAssetId);
    const encodedDebt = AbiCoder.encodeParameter('address', debtAsset);
    const encodedDebtId = AbiCoder.encodeParameter('uint8', debtAssetId);
    const encodedMarket = AbiCoder.encodeParameter('address', marketAddr);
    const encodedTargetRatio = AbiCoder.encodeParameter('uint256', ratioPercentageToWei(targetRatio));
    const useOnBehalfEncoded = AbiCoder.encodeParameter('bool', false);

    return [
      encodedColl,
      encodedCollId,
      encodedDebt,
      encodedDebtId,
      encodedMarket,
      encodedTargetRatio,
      useOnBehalfEncoded,
    ];
  },
  decode(subData: SubData): {
    collAsset: EthereumAddress,
    collAssetId: number,
    debtAsset: EthereumAddress,
    debtAssetId: number,
    marketAddr: EthereumAddress,
    targetRatio: number,
  } {
    const collAsset = AbiCoder.decodeParameter('address', subData[0]) as unknown as EthereumAddress;
    const collAssetId = Number(AbiCoder.decodeParameter('uint8', subData[1]));
    const debtAsset = AbiCoder.decodeParameter('address', subData[2]) as unknown as EthereumAddress;
    const debtAssetId = Number(AbiCoder.decodeParameter('uint8', subData[3]));
    const marketAddr = AbiCoder.decodeParameter('address', subData[4]) as unknown as EthereumAddress;

    const weiRatio = AbiCoder.decodeParameter('uint256', subData[5]) as any as string;
    const targetRatio = weiToRatioPercentage(weiRatio);

    return {
      collAsset, collAssetId, debtAsset, debtAssetId, marketAddr, targetRatio,
    };
  },
};

export const liquityV2LeverageManagementSubData = {
  encode: (
    market: EthereumAddress,
    troveId: string,
    collToken: EthereumAddress,
    boldToken: EthereumAddress,
    ratioState: RatioState,
    targetRatio: number,
  ) => {
    const marketEncoded = AbiCoder.encodeParameter('address', market);
    const troveIdEncoded = AbiCoder.encodeParameter('uint256', troveId);
    const collTokenEncoded = AbiCoder.encodeParameter('address', collToken);
    const boldTokenEncoded = AbiCoder.encodeParameter('address', boldToken);
    const ratioStateEncoded = AbiCoder.encodeParameter('uint8', ratioState);
    const targetRatioEncoded = AbiCoder.encodeParameter('uint256', ratioPercentageToWei(targetRatio));

    const isRepay = ratioState === RatioState.UNDER;
    const collActionType = isRepay ? CollActionType.WITHDRAW : CollActionType.SUPPLY;
    const debtActionType = isRepay ? DebtActionType.PAYBACK : DebtActionType.BORROW;

    const collActionTypeEncoded = AbiCoder.encodeParameter('uint8', collActionType);
    const debtActionTypeEncoded = AbiCoder.encodeParameter('uint8', debtActionType);

    return [
      marketEncoded,
      troveIdEncoded,
      collTokenEncoded,
      boldTokenEncoded,
      ratioStateEncoded,
      targetRatioEncoded,
      collActionTypeEncoded,
      debtActionTypeEncoded,
    ];
  },
  decode: (subData: SubData) => {
    const market = AbiCoder.decodeParameter('address', subData[0]) as unknown as EthereumAddress;
    const troveId = AbiCoder.decodeParameter('uint256', subData[1]) as any as string;
    const collToken = AbiCoder.decodeParameter('address', subData[2]) as any as EthereumAddress;
    const boldToken = AbiCoder.decodeParameter('address', subData[3]) as any as EthereumAddress;
    const ratioState = AbiCoder.decodeParameter('uint8', subData[4]) as any as RatioState;
    const weiRatio = AbiCoder.decodeParameter('uint256', subData[5]) as any as string;
    const targetRatio = weiToRatioPercentage(weiRatio);

    return {
      market, troveId, collToken, boldToken, ratioState, targetRatio,
    };
  },
};

export const liquityV2CloseSubData = {
  encode(
    market: EthereumAddress,
    troveId: string,
    collToken: EthereumAddress,
    boldToken: EthereumAddress,
    closeType: CloseStrategyType,
  ): SubData {
    const marketEncoded = AbiCoder.encodeParameter('address', market);
    const troveIdEncoded = AbiCoder.encodeParameter('uint256', troveId);
    const collAddrEncoded = AbiCoder.encodeParameter('address', collToken);
    const boldTokenEncoded = AbiCoder.encodeParameter('address', boldToken);
    const wethAddress = getAssetInfo('WETH').address;
    const wethAddressEncoded = AbiCoder.encodeParameter('address', wethAddress);
    const gasCompensation = new Dec('0.0375').mul(1e18).toString();
    const gasCompensationEncoded = AbiCoder.encodeParameter('uint256', gasCompensation);
    const closeTypeEncoded = AbiCoder.encodeParameter('uint8', closeType);

    return [
      marketEncoded,
      troveIdEncoded,
      collAddrEncoded,
      boldTokenEncoded,
      wethAddressEncoded,
      gasCompensationEncoded,
      closeTypeEncoded,
    ];
  },
  decode(subData: SubData): {
    market: EthereumAddress,
    troveId: string,
    collToken: EthereumAddress,
    boldToken: EthereumAddress,
    closeType: CloseStrategyType,
  } {
    const market = AbiCoder.decodeParameter('address', subData[0]) as unknown as EthereumAddress;
    const troveId = AbiCoder.decodeParameter('uint256', subData[1]) as any as string;
    const collToken = AbiCoder.decodeParameter('address', subData[2]) as any as EthereumAddress;
    const boldToken = AbiCoder.decodeParameter('address', subData[3]) as any as EthereumAddress;
    // skip wethAddress and gasCompensation
    const closeType = AbiCoder.decodeParameter('uint8', subData[6]) as any as CloseStrategyType;

    return {
      market, troveId, collToken, boldToken, closeType,
    };
  },
};

export const liquityV2LeverageManagementOnPriceSubData = {
  encode(
    market: EthereumAddress,
    troveId: string,
    collToken: EthereumAddress,
    boldToken: EthereumAddress,
    targetRatio: number,
    isRepayOnPrice: boolean,
  ): SubData {
    const encodedMarket = AbiCoder.encodeParameter('address', market);
    const encodedTroveId = AbiCoder.encodeParameter('uint256', troveId);
    const encodedCollToken = AbiCoder.encodeParameter('address', collToken);
    const encodedBoldToken = AbiCoder.encodeParameter('address', boldToken);
    const encodedTargetRatio = AbiCoder.encodeParameter('uint256', ratioPercentageToWei(targetRatio));

    const collActionType = isRepayOnPrice ? CollActionType.WITHDRAW : CollActionType.SUPPLY;
    const debtActionType = isRepayOnPrice ? DebtActionType.PAYBACK : DebtActionType.BORROW;

    const encodedCollActionType = AbiCoder.encodeParameter('uint8', collActionType);
    const encodedDebtActionType = AbiCoder.encodeParameter('uint8', debtActionType);

    return [
      encodedMarket,
      encodedTroveId,
      encodedCollToken,
      encodedBoldToken,
      encodedTargetRatio,
      encodedCollActionType,
      encodedDebtActionType,
    ];
  },
  decode(subData: SubData): {
    market: EthereumAddress,
    troveId: string,
    collToken: EthereumAddress,
    boldToken: EthereumAddress,
    targetRatio: number,
  } {
    const market = AbiCoder.decodeParameter('address', subData[0]) as unknown as EthereumAddress;
    const troveId = AbiCoder.decodeParameter('uint256', subData[1]) as any as string;
    const collToken = AbiCoder.decodeParameter('address', subData[2]) as unknown as EthereumAddress;
    const boldToken = AbiCoder.decodeParameter('address', subData[3]) as unknown as EthereumAddress;
    const weiRatio = AbiCoder.decodeParameter('uint256', subData[4]) as any as string;
    const targetRatio = weiToRatioPercentage(weiRatio);

    return {
      market, troveId, collToken, boldToken, targetRatio,
    };
  },
};
export const morphoBlueLeverageManagementOnPriceSubData = {
  encode(
    loanToken: EthereumAddress,
    collToken: EthereumAddress,
    oracle: EthereumAddress,
    irm: EthereumAddress,
    lltv: string,
    targetRatio: number,
    user: EthereumAddress,
  ): SubData {
    const loanTokenEncoded = AbiCoder.encodeParameter('address', loanToken);
    const collTokenEncoded = AbiCoder.encodeParameter('address', collToken);
    const oracleEncoded = AbiCoder.encodeParameter('address', oracle);
    const irmEncoded = AbiCoder.encodeParameter('address', irm);
    const lltvEncoded = AbiCoder.encodeParameter('uint256', lltv);
    const targetRatioEncoded = AbiCoder.encodeParameter('uint256', ratioPercentageToWei(targetRatio));
    const userEncoded = AbiCoder.encodeParameter('address', user);
    return [loanTokenEncoded, collTokenEncoded, oracleEncoded, irmEncoded, lltvEncoded, targetRatioEncoded, userEncoded];
  },
  decode(subData: SubData) {
    const loanToken = AbiCoder.decodeParameter('address', subData[0]) as unknown as EthereumAddress;
    const collToken = AbiCoder.decodeParameter('address', subData[1]) as any as EthereumAddress;
    const oracle = AbiCoder.decodeParameter('address', subData[2]) as any as EthereumAddress;
    const irm = AbiCoder.decodeParameter('address', subData[3]) as any as EthereumAddress;
    const lltv = AbiCoder.decodeParameter('uint256', subData[4]) as any as EthereumAddress;
    const weiRatio = AbiCoder.decodeParameter('uint256', subData[5]) as any as EthereumAddress;
    const targetRatio = weiToRatioPercentage(weiRatio);
    const user = AbiCoder.decodeParameter('address', subData[6]) as any as EthereumAddress;

    return {
      loanToken,
      collToken,
      oracle,
      irm,
      lltv,
      targetRatio,
      user,
    };
  },
};

export const liquityV2PaybackSubData = {
  encode: (
    market: EthereumAddress,
    troveId: string,
    boldToken: EthereumAddress,
    targetRatio: number,
    ratioState: RatioState,
  ) => {
    const marketEncoded = AbiCoder.encodeParameter('address', market);
    const troveIdEncoded = AbiCoder.encodeParameter('uint256', troveId);
    const boldTokenEncoded = AbiCoder.encodeParameter('address', boldToken);
    const targetRatioEncoded = AbiCoder.encodeParameter('uint256', ratioPercentageToWei(targetRatio));
    const ratioStateEncoded = AbiCoder.encodeParameter('uint8', ratioState);

    return [
      marketEncoded,
      troveIdEncoded,
      boldTokenEncoded,
      targetRatioEncoded,
      ratioStateEncoded,
    ];
  },
  decode: (subData: SubData) => {
    const market = AbiCoder.decodeParameter('address', subData[0]) as unknown as EthereumAddress;
    const troveId = AbiCoder.decodeParameter('uint256', subData[1]) as any as string;
    const boldToken = AbiCoder.decodeParameter('address', subData[2]) as any as EthereumAddress;
    const weiRatio = AbiCoder.decodeParameter('uint256', subData[3]) as any as string;
    const ratioState = AbiCoder.decodeParameter('uint8', subData[4]) as any as RatioState;
    const targetRatio = weiToRatioPercentage(weiRatio);

    return {
      market, troveId, boldToken, ratioState, targetRatio,
    };
  },
};

export const fluidLeverageManagementSubData = {
  encode: (
    nftId: string,
    vault: EthereumAddress,
    ratioState: RatioState,
    targetRatio: number,
  ) => {
    const nftIdEncoded = AbiCoder.encodeParameter('uint256', nftId);
    const vaultEncoded = AbiCoder.encodeParameter('address', vault);
    const ratioStateEncoded = AbiCoder.encodeParameter('uint8', ratioState);
    const targetRatioEncoded = AbiCoder.encodeParameter('uint256', ratioPercentageToWei(targetRatio));
    const wrapEthEncoded = AbiCoder.encodeParameter('bool', true);

    const isRepay = ratioState === RatioState.UNDER;
    const collActionType = isRepay ? CollActionType.WITHDRAW : CollActionType.SUPPLY;
    const debtActionType = isRepay ? DebtActionType.PAYBACK : DebtActionType.BORROW;

    const collActionTypeEncoded = AbiCoder.encodeParameter('uint8', collActionType);
    const debtActionTypeEncoded = AbiCoder.encodeParameter('uint8', debtActionType);

    return [
      nftIdEncoded,
      vaultEncoded,
      ratioStateEncoded,
      targetRatioEncoded,
      wrapEthEncoded,
      collActionTypeEncoded,
      debtActionTypeEncoded,
    ];
  },
  decode: (subData: SubData) => {
    const nftId = AbiCoder.decodeParameter('uint256', subData[0]) as any as string;
    const vault = AbiCoder.decodeParameter('address', subData[1]) as unknown as EthereumAddress;
    const ratioState = AbiCoder.decodeParameter('uint8', subData[2]) as any as RatioState;
    const weiRatio = AbiCoder.decodeParameter('uint256', subData[3]) as any as string;
    const targetRatio = weiToRatioPercentage(weiRatio);

    return {
      nftId, vault, ratioState, targetRatio,
    };
  },
};

export const compoundV3LeverageManagementOnPriceSubData = {
  encode(
    market: EthereumAddress,
    collToken: EthereumAddress,
    baseToken: EthereumAddress,
    targetRatio: number,
    ratioState: RatioState,
    user: EthereumAddress,
  ): SubData {
    const marketEncoded = AbiCoder.encodeParameter('address', market);
    const collTokenEncoded = AbiCoder.encodeParameter('address', collToken);
    const baseTokenEncoded = AbiCoder.encodeParameter('address', baseToken);
    const targetRatioEncoded = AbiCoder.encodeParameter('uint256', ratioPercentageToWei(targetRatio));
    const ratioStateEncoded = AbiCoder.encodeParameter('uint8', ratioState);
    const userEncoded = AbiCoder.encodeParameter('address', user);

    return [
      marketEncoded,
      collTokenEncoded,
      baseTokenEncoded,
      targetRatioEncoded,
      ratioStateEncoded,
      userEncoded,
    ];
  },
  decode(subData: SubData): {
    market: EthereumAddress,
    collToken: EthereumAddress,
    baseToken: EthereumAddress,
    targetRatio: number,
    ratioState: RatioState,
    user: EthereumAddress,
  } {
    const market = AbiCoder.decodeParameter('address', subData[0]) as unknown as EthereumAddress;
    const collToken = AbiCoder.decodeParameter('address', subData[1]) as unknown as EthereumAddress;
    const baseToken = AbiCoder.decodeParameter('address', subData[2]) as unknown as EthereumAddress;
    const weiRatio = AbiCoder.decodeParameter('uint256', subData[3]) as any as string;
    const targetRatio = weiToRatioPercentage(weiRatio);
    const ratioState = Number(AbiCoder.decodeParameter('uint8', subData[4])) as any as RatioState;
    const user = AbiCoder.decodeParameter('address', subData[5]) as unknown as EthereumAddress;

    return {
      market, collToken, baseToken, targetRatio, ratioState, user,
    };
  },
};

export const compoundV3CloseSubData = {
  encode(
    market: EthereumAddress,
    collToken: EthereumAddress,
    baseToken: EthereumAddress,
    closeType: CloseStrategyType,
    user: EthereumAddress,
  ): SubData {
    const marketEncoded = AbiCoder.encodeParameter('address', market);
    const collTokenEncoded = AbiCoder.encodeParameter('address', collToken);
    const baseTokenEncoded = AbiCoder.encodeParameter('address', baseToken);
    const closeTypeEncoded = AbiCoder.encodeParameter('uint8', closeType);
    const userEncoded = AbiCoder.encodeParameter('address', user);

    return [
      marketEncoded,
      collTokenEncoded,
      baseTokenEncoded,
      closeTypeEncoded,
      userEncoded,
    ];
  },
  decode(subData: SubData): {
    market: EthereumAddress,
    collToken: EthereumAddress,
    baseToken: EthereumAddress,
    closeType: CloseStrategyType,
    user: EthereumAddress,
  } {
    const market = AbiCoder.decodeParameter('address', subData[0]) as unknown as EthereumAddress;
    const collToken = AbiCoder.decodeParameter('address', subData[1]) as unknown as EthereumAddress;
    const baseToken = AbiCoder.decodeParameter('address', subData[2]) as unknown as EthereumAddress;
    const closeType = Number(AbiCoder.decodeParameter('uint8', subData[3])) as CloseStrategyType;
    const user = AbiCoder.decodeParameter('address', subData[4]) as unknown as EthereumAddress;

    return {
      market, collToken, baseToken, closeType, user,
    };
  },
};
