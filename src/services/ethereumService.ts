import AbiCoder from 'web3-eth-abi';

import type Web3 from 'web3';
import type { PastEventOptions } from 'web3-eth-contract';
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
  const MAX_CALLS_PER_BATCH = 1000;

  const allResults: Multicall.Payload = [];

  // Process each chunk
  for (let i = 0; i < calls.length; i += MAX_CALLS_PER_BATCH) {
    const chunk = calls.slice(i, i + MAX_CALLS_PER_BATCH);
    const formattedCalls: Multicall.FormattedCalls[] = chunk.map((call) => ({
      callData: AbiCoder.encodeFunctionCall(call.abiItem, call.params),
      target: call.target || '0x0',
      gasLimit: call.gasLimit || 1e6,
    }));

    const callResult = await multicallContract.methods.multicall(
      formattedCalls,
    ).call({}, block);

    let formattedResult: Multicall.Payload = [];
    callResult.returnData.forEach(([success,, result], j) => {
      const formattedRes = (success && result !== '0x'
        ? AbiCoder.decodeParameters(chunk[j].abiItem.outputs!, result)
        : undefined);
      formattedResult = [...formattedResult, formattedRes];
    });
    allResults.push(...formattedResult);
  }

  return allResults;
}

export async function getEventsFromContract<T extends BaseContract>(
  contractWithMeta: Contract.WithMeta<T>,
  contractWithMetaFork: Contract.WithMeta<T> | null,
  event: string,
  options?: PastEventOptions,
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
