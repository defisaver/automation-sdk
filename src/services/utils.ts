import Dec from 'decimal.js';
import * as web3Utils from 'web3-utils';
import * as web3Abi from 'web3-eth-abi';
import { getAssetInfo, getAssetInfoByAddress } from '@defisaver/tokens';

import type { EthereumAddress } from '../types';
import { ChainId, RatioState } from '../types/enums';

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
  return currentSubHash === web3Utils.keccak256(web3Abi.encodeParameter('(uint64,bool,bytes[],bytes32[])', newSubStructDecoded));
}

export function encodeSubId(subIdDec: string = '0') {
  return new Dec(subIdDec).toHex().slice(2).padStart(8, '0');
}

export function ratioPercentageToWei(ratioPercentage: number) {
  return web3Utils.toWei(new Dec(ratioPercentage).div(100).toString(), 'ether');
}

export function weiToRatioPercentage(ratioWei: string) {
  return new Dec(web3Utils.fromWei(new Dec(ratioWei).mul(100).toString(), 'ether')).toNumber();
}

export function isRatioStateOver(ratioState: RatioState): boolean {
  return ratioState === RatioState.OVER;
}

export function isRatioStateUnder(ratioState: RatioState): boolean {
  return ratioState === RatioState.UNDER;
}

export function isEmptyBytes(string: string) {
  return string === '0x0000000000000000000000000000000000000000';
}

export function requireAddress(address: EthereumAddress): void | never {
  if (typeof address !== 'string') throw new Error('Address is not a string');
  if (address === '') throw new Error('Address is empty string');
  if (address.length < 42) throw new Error(`Address too short (${address.length} instead of 42)`);
  if (isEmptyBytes(address)) throw new Error('Address is empty bytes');
  if (!(new RegExp(/0x[0-9a-fA-F]{40}/).test(address))) throw new Error('Address invalid');
}

export function requireAddresses(addresses: EthereumAddress[]) {
  addresses.forEach((address) => requireAddress(address));
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
    ratioState = isRatioStateOver(currentRatioState)
      ? ratioState = RatioState.UNDER
      : ratioState = RatioState.OVER;
  }
  return { shouldFlip, ratioState };
}