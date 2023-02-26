import type Web3 from 'web3';
import type { PastEventOptions } from 'web3-eth-contract';
import type {
  BlockNumber, Multicall, Contract, PlaceholderType,
} from '../types';

import { makeUniMulticallContract } from './contractService';
import { addToObjectIf, isDefined } from './utils';
import type { BaseContract } from '../types/contracts/generated/types';
import type { ChainId } from '../types/enums';

const { mockedWeb3 } = process;

export async function multicall(
  web3: Web3,
  chainId: ChainId,
  calls: Multicall.Calls[],
  block: BlockNumber = 'latest',
): Promise<Multicall.Payload> {
  const multicallContract = makeUniMulticallContract(web3, chainId).contract;

  const formattedCalls: Multicall.FormattedCalls[] = calls.map((call) => ({
    callData: mockedWeb3.eth.abi.encodeFunctionCall(call.abiItem, call.params),
    target: call.target || '0x0',
    gasLimit: call.gasLimit || 1e6,
  }));

  const callResult = await multicallContract.methods.multicall(
    formattedCalls.filter(item => item.target !== '0x0'),
  ).call({}, block);

  let formattedResult: Multicall.Payload = [];

  callResult.returnData.forEach(([success, gasUsed, result], i) => {
    const formattedRes = (result !== '0x'
      ? mockedWeb3.eth.abi.decodeParameters(calls[i].abiItem.outputs!, result)
      : undefined) as Multicall.Payload;
    formattedResult = [...formattedResult, formattedRes];
  });

  return formattedResult;
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