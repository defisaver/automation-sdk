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

    // Track which calls are valid (non-zero target) to map results back correctly
    const validCallsIndices: number[] = [];
    const validCalls = formattedCalls.filter((item, index) => {
      if (item.target !== '0x0') {
        validCallsIndices.push(index);
        return true;
      }
      return false;
    });

    const callResult = await multicallContract.methods.multicall(validCalls).call({}, block);

    // Decode results for this chunk, mapping back to original call indices
    let validCallResultIndex = 0;
    for (let j = 0; j < chunk.length; j++) {
      if (validCallsIndices.includes(j)) {
        // This call was included in the multicall
        const originalCall = chunk[j];
        // @ts-ignore
        const [success, gasUsed, result] = callResult.returnData[validCallResultIndex];
        const formattedRes = (result !== '0x'
          ? AbiCoder.decodeParameters(originalCall.abiItem.outputs!, result)
          : undefined);
        allResults.push(formattedRes);
        validCallResultIndex++;
      } else {
        // This call was filtered out (target was '0x0'), add undefined
        allResults.push(undefined);
      }
    }
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
