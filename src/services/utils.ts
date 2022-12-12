import type { EthereumAddress } from '../types';

export function isDefined(item: unknown): boolean {
  return item !== undefined;
}

export function isUndefined(item: unknown): boolean {
  return !isDefined(item);
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

