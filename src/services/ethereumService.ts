// @ts-nocheck // TODO - Add types and typings
import type Web3 from 'web3';
import type { AbiItem } from 'web3-utils';

import type { BlockNumber, ContractJson, EthereumAddress } from '../types';
import type { ChainId } from '../constants';

import UniMulticall from '../abis/UniMulticall.json';

import { makeContract } from './contractService';

// kapiram ako si hteo da sve za multicall bude u jednom fajlu, ali nek bude ime fajla bar mutlicallService
export interface FormattedMulticallCalls {
  callData: string,
  target: EthereumAddress,
  gasLimit: number,
}

interface MulticallCalls {
  abiItem: AbiItem,
  target: EthereumAddress,
  gasLimit?: number,
  params: any[],
}

interface FormattedMulticallResult {
  [key: string]: any,
}

export async function multicall(
  web3: Web3,
  chainId: ChainId,
  calls: MulticallCalls[],
  block: BlockNumber = 'latest',
): Promise<FormattedMulticallResult[]> {
  const contractJson = UniMulticall as ContractJson;
  const multicallContract = makeContract(web3, contractJson, chainId).get();

  const formattedCalls: FormattedMulticallCalls[] = calls.map((call) => ({
    callData: web3.eth.abi.encodeFunctionCall(call.abiItem, call.params),
    target: call.target || '0x0',
    gasLimit: call.gasLimit || 1e6,
  }));

  const callResult = await multicallContract.methods.multicall(
    formattedCalls.filter(item => item.target !== '0x0')).call({}, block,
  );

  let formattedResult = [];

  callResult.returnData.forEach(([success, gasUsed, result], i) => {
    const formattedRes = result !== '0x'
      ? web3.eth.abi.decodeParameters(calls[i].abiItem.outputs, result)
      : undefined;
    formattedResult = [...formattedResult, formattedRes];
  });

  return formattedResult;
}
