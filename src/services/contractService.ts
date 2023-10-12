import type Web3 from 'web3';
import type { AbiItem } from 'web3-utils';

import type {
  BlockNumber, Contract, EthereumAddress,
} from '../types';
import type { BaseContract } from '../types/contracts/generated/types';
import type {
  Legacy_AuthCheck, SubStorage, UniMulticall, Erc20,
} from '../types/contracts/generated';

import {
  UniMulticallJson, SubStorageJson, AuthCheckJson, Erc20Json,
} from '../abis';

import { isDefined } from './utils';
import { ChainId } from '../types/enums';

export function getAbiItem(abi: AbiItem[], itemName: string) {
  const abiItem = abi.find(i => i.name === itemName);
  if (isDefined(abiItem)) {
    return abiItem;
  }
  throw new Error(`Can't find abi item for itemName: ${itemName}`);
}

function makeContract<T extends BaseContract>(
  web3: Web3,
  contractJson: Contract.Json,
  chainId: ChainId,
): Contract.WithMeta<T> {
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

export function makeLegacySubscriptionContract<T extends BaseContract>(web3: Web3, contractJson: Contract.Json) {
  return makeContract<T>(web3, contractJson, ChainId.Ethereum);
}

export function makeErc20Contract(web3: Web3, tokenAddress: EthereumAddress, chainId: ChainId) {
  return makeContract<Erc20>(web3, {
    ...Erc20Json,
    networks: {
      [chainId]: { address: tokenAddress },
    },
  }, chainId);
}