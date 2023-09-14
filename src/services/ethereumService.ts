import * as web3Abi from 'web3-eth-abi';

import type Web3 from 'web3';
import type { PastEventOptions } from 'web3-eth-contract';
import type { AbiFunctionFragment } from 'web3-types';
import type {
  BlockNumber, Multicall, Contract, PlaceholderType,
} from '../types';

import { makeUniMulticallContract } from './contractService';
import { addToObjectIf, isDefined } from './utils';
import type { BaseContract } from '../types/contracts/generated/types';
import type { ChainId } from '../types/enums';

export async function multicall(
  web3: Web3,
  chainId: ChainId,
  calls: Multicall.Calls[],
  block: BlockNumber = 'latest',
): Promise<Multicall.Payload> {
  const multicallContract = makeUniMulticallContract(web3, chainId).contract;

  const formattedCalls: Multicall.FormattedCalls[] = calls.map((call) => ({
    callData: web3Abi.encodeFunctionCall(call.abiItem as AbiFunctionFragment, call.params),
    target: call.target || '0x0',
    gasLimit: call.gasLimit || 1e6,
  }));

  const callResult = await multicallContract.methods.multicall(
    formattedCalls.filter(item => item.target !== '0x0'),
  ).call({}, block);

  let formattedResult: Multicall.Payload = [];

  callResult.returnData.forEach(([success, gasUsed, result], i) => {
    const formattedRes = (result !== '0x'
      ? web3Abi.decodeParameters(calls[i].abiItem.outputs!, result)
      : undefined);
    formattedResult = [...formattedResult, formattedRes];
  });

  return formattedResult as Multicall.Payload;
}

export async function getEventsFromContract<T extends BaseContract>(
  contractWithMeta: Contract.WithMeta<T>,
  contractWithMetaFork: Contract.WithMeta<T> | null,
  event: string, options?: PastEventOptions,
) {
  const events = await contractWithMeta.contract.getPastEvents(
    event,
    {
      ...addToObjectIf(isDefined(options), { ...options, fromBlock: contractWithMeta.createdBlock }),
    },
  );

  let eventsFork : PlaceholderType = [];

  if (contractWithMetaFork) {
    eventsFork = await contractWithMetaFork.contract.getPastEvents(
      event,
      {
        ...addToObjectIf(isDefined(options), { ...options, toBlock: 'latest' }),
      },
    );
  }

  return [...events, ...eventsFork];
}