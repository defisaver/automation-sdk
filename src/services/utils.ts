import { getAssetInfo, getAssetInfoByAddress } from '@defisaver/tokens';
import Dec from 'decimal.js';

import type { EthereumAddress } from '../types';

import { ChainId, RatioState } from '../types/enums';

const { mockedWeb3 } = process;

export function isDefined<T>(value: T): value is NonNullable<T> {
  return value !== undefined && value !== null;
}

export function isUndefined(value: unknown): boolean {
  return !isDefined(value);
}

export function compareAddresses(firstAddress: EthereumAddress, secondAddress: EthereumAddress): boolean {
  return firstAddress.toLowerCase() === secondAddress.toLowerCase();
}

export function isAddress(address: EthereumAddress) {
  return new RegExp(/0x[0-9a-fA-F]{40}/).test(address);
}

export function addToArrayIf(condition: boolean, ...items: any): Array<any> {
  return (condition ? items : []);
}

export function addToObjectIf(condition: boolean, item: any): object {
  return (condition ? item : {});
}

export function ethToWeth(maybeEth: string) {
  return maybeEth?.replace(/^ETH$/, 'WETH');
}

export function wethToEth(maybeWeth: string) {
  return maybeWeth?.replace(/^WETH$/, 'ETH');
}

export function wethToEthByAddress(maybeWethAddr: EthereumAddress, chainId: ChainId = ChainId.Ethereum): EthereumAddress {
  return getAssetInfo(wethToEth(getAssetInfoByAddress(maybeWethAddr, chainId).symbol), chainId).address;
}

export function compareSubHashes(currentSubHash: string, newSubStructDecoded: object): boolean {
  return currentSubHash === mockedWeb3.utils.keccak256(mockedWeb3.eth.abi.encodeParameter('(uint64,bool,bytes[],bytes32[])', newSubStructDecoded));
}

export function encodeSubId(subIdDec: string = '0') {
  return new Dec(subIdDec).toHex().slice(2).padStart(8, '0');
}

export function ratioPercentageToWei(ratioPercentage: number) {
  return mockedWeb3.utils.toWei(new Dec(ratioPercentage).div(100).toString());
}

export function getRatioStateInfoForAaveCloseStrategy(
  currentRatioState: RatioState,
  collAsset: EthereumAddress,
  debtAsset: EthereumAddress,
  chainId: ChainId,
): { shouldFlip: boolean, ratioState: RatioState } {
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