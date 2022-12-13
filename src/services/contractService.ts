import type Web3 from 'web3';
import type { AbiItem } from 'web3-utils';
import type { BlockNumber, ContractJson, MadeContract } from '../types';

import type { ChainId } from '../constants';
import type { BaseContract } from '../types/contracts/generated/types';

import { isDefined } from './utils';

export function makeContract <T extends BaseContract>(
  web3: Web3,
  contractJson: ContractJson,
  chainId: ChainId,
): MadeContract {
  const { abi } = contractJson;

  let _address = '';
  let _createdBlock: BlockNumber = 'earliest';

  if (contractJson.networks) {
    const { address, createdBlock } = contractJson.networks[chainId];

    _address = address;

    if (isDefined(createdBlock)) {
      // @ts-ignore
      _createdBlock = createdBlock;
    }
  }

  return {
    abi,
    address: _address,
    createdBlock: _createdBlock,
    get() {
      return new web3.eth.Contract(abi, _address) as any as T;
    },
  };
}

export function getAbiItem(abi: AbiItem[], itemName: string) {
  return abi.find(abiItem => abiItem.name === itemName);
}