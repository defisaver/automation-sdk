import Web3 from 'web3';
import { expect } from 'chai';
import { getAssetInfo } from '@defisaver/tokens';
import { PastEventOptions } from 'web3-eth-contract';

import { ChainId } from '../types/enums';
import type { BlockNumber, Multicall } from '../types';
import { Contract } from '../types';
import type { Erc20 } from '../types/contracts/generated';

import '../configuration';
import { getEventsFromContract, multicall, } from './ethereumService';

import { makeErc20Contract } from './contractService';

require('dotenv').config({ path: '.env' });

const Web3_1 = new Web3(process.env.RPC_1!);
const Web3_10 = new Web3(process.env.RPC_10!);
const Web3_42161 = new Web3(process.env.RPC_42161!);

describe('Feature: ethereumService.ts', () => {
  describe('When testing ethereumService.multicall', () => {
    const examples: Array<[
      Multicall.Payload,
      [
        web3: Web3,
        chainId: ChainId,
        calls: Multicall.Calls[],
        block: BlockNumber,
      ]
    ]> = [
      [
        [{ 0: 'Wrapped Ether', '__length__': 1 }, { 0: '18', '__length__': 1 }],
        [
          Web3_1,
          ChainId.Ethereum,
          [
            {
              abiItem: {'constant':true,'inputs':[],'name':'name','outputs':[{'name':'','type':'string'}],'payable':false,'stateMutability':'view','type':'function'},
              target: '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2',
              params: [],
            },
            {
              abiItem: {'constant':true,'inputs':[],'name':'decimals','outputs':[{'name':'','type':'uint8'}],'payable':false,'stateMutability':'view','type':'function'},
              target: '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2',
              params: [],
            }
          ],
          'latest',
        ]
      ],
      [
        [{ 0: 'Wrapped Ether', '__length__': 1 }, { 0: '18', '__length__': 1 }],
        [
          Web3_10,
          ChainId.Optimism,
          [
            {
              abiItem: {'constant':true,'inputs':[],'name':'name','outputs':[{'name':'','type':'string'}],'payable':false,'stateMutability':'view','type':'function'},
              target: '0x4200000000000000000000000000000000000006',
              params: [],
            },
            {
              abiItem: {'constant':true,'inputs':[],'name':'decimals','outputs':[{'name':'','type':'uint8'}],'payable':false,'stateMutability':'view','type':'function'},
              target: '0x4200000000000000000000000000000000000006',
              params: [],
            }
          ],
          'latest',
        ]
      ],
      [
        [{ 0: 'Wrapped Ether', '__length__': 1 }, { 0: '18', '__length__': 1 }],
        [
          Web3_42161,
          ChainId.Arbitrum,
          [
            {
              abiItem: {'constant':true,'inputs':[],'name':'name','outputs':[{'name':'','type':'string'}],'payable':false,'stateMutability':'view','type':'function'},
              target: '0x82af49447d8a07e3bd95bd0d56f35241523fbab1',
              params: [],
            },
            {
              abiItem: {'constant':true,'inputs':[],'name':'decimals','outputs':[{'name':'','type':'uint8'}],'payable':false,'stateMutability':'view','type':'function'},
              target: '0x82af49447d8a07e3bd95bd0d56f35241523fbab1',
              params: [],
            }
          ],
          'latest',
        ]
      ],
    ];

    examples.forEach(([expected, actual]) => {
      it(`Given ${actual} should return expected value: ${JSON.stringify(expected)}`, async () => {
        expect(await multicall(...actual)).to.eql(expected);
      });
    });
  });

  describe('When testing ethereumService.getEventsFromContract', () => {
    const examples: Array<[
      any[],
      [
        contractWithMeta: Contract.WithMeta<Erc20>,
        contractWithMetaFork: Contract.WithMeta<Erc20> | null,
        event: string,
        options?: PastEventOptions,
      ]
    ]> = [
      [
        [
          {
            'address': '0x5f98805A4E8be255a32880FDeC7F6728C6568bA0',
            'blockHash': '0xb92cab2569456dbfbdb853d2c67d72c9a7580543dbcb55d483a77322b40755a4',
            'blockNumber': 15166163,
            'blockTimestamp': '0x62d53ad8',
            'event': 'Transfer',
            'id': 'log_e2258e3a',
            'logIndex': 385,
            'raw': {
              'data': '0x0000000000000000000000000000000000000000000001b58c2186829983fca9',
              'topics': [
                '0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef',
                '0x000000000000000000000000ea57dc30959eb17c506e4da095fa9181f3e0ac6d',
                '0x0000000000000000000000009ccf93089cb14f94baeb8822f8ceffd91bd71649',
              ],
            },
            'removed': false,
            'returnValues': {
              '0': '0xEA57Dc30959eb17c506E4dA095fa9181f3E0Ac6D',
              '1': '0x9cCf93089cb14F94BAeB8822F8CeFfd91Bd71649',
              '2': '8071324659946094853289',
              'from': '0xEA57Dc30959eb17c506E4dA095fa9181f3E0Ac6D',
              'to': '0x9cCf93089cb14F94BAeB8822F8CeFfd91Bd71649',
              'value': '8071324659946094853289',
            },
            'signature': '0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef',
            'transactionHash': '0x95b28d8f71719c219e09b428e6ff781d717088784fbf63681446da13de6b0c4a',
            'transactionIndex': 187,
          },
        ],
        [
          makeErc20Contract(Web3_1, getAssetInfo('LUSD').address, ChainId.Ethereum),
          null,
          'Transfer',
          {
            fromBlock: 15166163,
            toBlock: 15166163,
            filter: {
              from: '0xEA57Dc30959eb17c506E4dA095fa9181f3E0Ac6D',
              to: '0x9cCf93089cb14F94BAeB8822F8CeFfd91Bd71649',
            }
          },
        ]
      ],
      [
        [
          {
            'address': '0xDA10009cBd5D07dd0CeCc66161FC93D7c9000da1',
            'blockHash': '0xacb0213af63b4c17c436f084a96d1ac385641a59a9a4cf014ae3337cbe545aa7',
            'blockNumber': 5353002,
            'event': 'Transfer',
            'id': 'log_f49645b8',
            'logIndex': 1,
            'raw': {
              'data': '0x000000000000000000000000000000000000000000000001158e460913d00000',
              'topics': [
                '0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef',
                '0x000000000000000000000000ea57dc30959eb17c506e4da095fa9181f3e0ac6d',
                '0x00000000000000000000000013a22f1bba428eaaf56960530ec11118da916c11',
              ],
            },
            'removed': false,
            'returnValues': {
              '0': '0xEA57Dc30959eb17c506E4dA095fa9181f3E0Ac6D',
              '1': '0x13A22f1bBa428eaAf56960530Ec11118DA916C11',
              '2': '20000000000000000000',
              'from': '0xEA57Dc30959eb17c506E4dA095fa9181f3E0Ac6D',
              'to': '0x13A22f1bBa428eaAf56960530Ec11118DA916C11',
              'value': '20000000000000000000',
            },
            'signature': '0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef',
            'transactionHash': '0x37c886a97c938747299c0f6b3e4591304bdd47a938df7c8146454d6fee5a6501',
            'transactionIndex': 0,
          },
        ],
        [
          makeErc20Contract(Web3_10, getAssetInfo('DAI', ChainId.Optimism).address, ChainId.Optimism),
          null,
          'Transfer',
          {
            fromBlock: 5353002,
            toBlock: 5353002,
            filter: {
              from: '0xEA57Dc30959eb17c506E4dA095fa9181f3E0Ac6D',
              to: '0x13A22f1bBa428eaAf56960530Ec11118DA916C11',
            }
          },
        ]
      ],
      [
        [
          {
            'address': '0xDA10009cBd5D07dd0CeCc66161FC93D7c9000da1',
            'blockHash': '0xacb0213af63b4c17c436f084a96d1ac385641a59a9a4cf014ae3337cbe545aa7',
            'blockNumber': 5353002,
            'event': 'Transfer',
            'id': 'log_f49645b8',
            'logIndex': 1,
            'raw': {
              'data': '0x000000000000000000000000000000000000000000000001158e460913d00000',
              'topics': [
                '0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef',
                '0x000000000000000000000000ea57dc30959eb17c506e4da095fa9181f3e0ac6d',
                '0x00000000000000000000000013a22f1bba428eaaf56960530ec11118da916c11',
              ],
            },
            'removed': false,
            'returnValues': {
              '0': '0xEA57Dc30959eb17c506E4dA095fa9181f3E0Ac6D',
              '1': '0x13A22f1bBa428eaAf56960530Ec11118DA916C11',
              '2': '20000000000000000000',
              'from': '0xEA57Dc30959eb17c506E4dA095fa9181f3E0Ac6D',
              'to': '0x13A22f1bBa428eaAf56960530Ec11118DA916C11',
              'value': '20000000000000000000',
            },
            'signature': '0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef',
            'transactionHash': '0x37c886a97c938747299c0f6b3e4591304bdd47a938df7c8146454d6fee5a6501',
            'transactionIndex': 0,
          },
        ],
        [
          makeErc20Contract(Web3_10, getAssetInfo('DAI', ChainId.Arbitrum).address, ChainId.Arbitrum),
          null,
          'Transfer',
          {
            fromBlock: 5353002,
            toBlock: 5353002,
            filter: {
              from: '0xEA57Dc30959eb17c506E4dA095fa9181f3E0Ac6D',
              to: '0x13a22f1bba428eaaf56960530ec11118da916c11',
            }
          },
        ]
      ],
    ];

    examples.forEach(([expected, actual]) => {
      it(`Given ${actual} should return expected value: ${JSON.stringify(expected)}`, async () => {
        const data = await getEventsFromContract(...actual);
        console.log(data);
        expect(await getEventsFromContract(...actual)).to.eql(expected);
      });
    });
  });
});
