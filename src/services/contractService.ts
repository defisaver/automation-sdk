import type Web3 from 'web3';
import type { AbiItem } from 'web3-utils';
import type { ContractJson } from '../types';

import type { ChainId } from '../constants';

export function makeContract(
  web3: Web3,
  contractJson: ContractJson,
  chainId: ChainId,
) {
  const { abi } = contractJson;
  const { address, createdBlock } = contractJson.networks[chainId];

  return {
    abi,
    address,
    createdBlock: createdBlock || 'earliest',
    get: () => new web3.eth.Contract(abi, address),
  };
}

export function getAbiItem(abi: AbiItem[], itemName: string) {
  return abi.find(abiItem => abiItem.name === itemName);
}