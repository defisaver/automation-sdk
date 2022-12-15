import type Web3 from 'web3';
import type { AbiItem } from 'web3-utils';
import type {
  BlockNumber, ContractJson, WrappedContract,
} from '../types';

import { ChainId } from '../constants';
import type { BaseContract } from '../types/contracts/generated/types';
import type { Legacy_AuthCheck, SubStorage, UniMulticall } from '../types/contracts/generated';

import { UniMulticallJson, SubStorageJson, AuthCheckJson } from '../abis';

import { isDefined } from './utils';

export function getAbiItem(abi: AbiItem[], itemName: string) {
  const abiItem = abi.find(i => i.name === itemName);
  if (isDefined(abiItem)) {
    return abiItem;
  }
  throw new Error(`Can't find abi item for itemName: ${itemName}`);
}

function makeContract<T extends BaseContract>(
  web3: Web3,
  contractJson: ContractJson,
  chainId: ChainId,
): WrappedContract<T> {
  const { abi } = contractJson;

  let _address = '';
  let _createdBlock: BlockNumber = 'earliest';

  if (contractJson.networks) {
    const { address, createdBlock } = contractJson.networks[chainId];

    _address = address;

    if (isDefined(createdBlock)) {
      _createdBlock = createdBlock;
    }
  }

  return {
    abi,
    address: _address,
    createdBlock: _createdBlock,
    contract: new web3.eth.Contract(abi, _address) as any as T,
  };
}

export function makeUniMulticallContract(web3: Web3, chainId: ChainId) {
  return makeContract<UniMulticall>(web3, UniMulticallJson, chainId);
}

export function makeSubStorageContract(web3: Web3, chainId: ChainId) {
  return makeContract<SubStorage>(web3, SubStorageJson, chainId);
}

export function makeAuthCheckerContract(web3: Web3, chainId: ChainId) {
  return makeContract<Legacy_AuthCheck>(web3, AuthCheckJson, chainId);
}

export function makeLegacySubscriptionContract(web3: Web3, contractJson: ContractJson) {
  return makeContract<UniMulticall>(web3, contractJson, ChainId.Ethereum);
}