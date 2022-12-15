import type Web3 from 'web3';
import type { EventData, PastEventOptions } from 'web3-eth-contract';
import type {
  BlockNumber, Multicall, PlaceholderType, WrappedContract,
} from '../types';
import type { ChainId } from '../constants';

import { makeUniMulticallContract } from './contractService';
import { addToObjectIf, isDefined } from './utils';

const { mockedWeb3 } = process;

export async function multicall(
  web3: Web3,
  chainId: ChainId,
  calls: Multicall.Calls[],
  block: BlockNumber = 'latest',
): Promise<Multicall.Payload[]> {
  const multicallContract = makeUniMulticallContract(web3, chainId).contract;

  const formattedCalls: Multicall.FormattedCalls[] = calls.map((call) => ({
    callData: mockedWeb3.eth.abi.encodeFunctionCall(call.abiItem, call.params),
    target: call.target || '0x0',
    gasLimit: call.gasLimit || 1e6,
  }));

  const callResult = await multicallContract.methods.multicall(
    formattedCalls.filter(item => item.target !== '0x0'),
  ).call({}, block);

  let formattedResult: Multicall.Payload[] = [];

  callResult.returnData.forEach(([success, gasUsed, result], i) => {
    const formattedRes = (result !== '0x'
      ? mockedWeb3.eth.abi.decodeParameters(calls[i].abiItem.outputs!, result)
      : undefined) as Multicall.Payload;
    formattedResult = [...formattedResult, formattedRes];
  });

  return formattedResult;
}

export function getEventsFromContract(
  wrappedContract: WrappedContract<PlaceholderType>,
  event: string, options?: PastEventOptions,
): Promise<EventData[]> {
  return wrappedContract.contract.getPastEvents(
    event,
    {
      ...addToObjectIf(isDefined(options), options),
      fromBlock: wrappedContract.createdBlock,
    },
  );
}