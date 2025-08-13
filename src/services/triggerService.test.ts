import { expect } from 'chai';
import { getAssetInfo, MAXUINT } from '@defisaver/tokens';
import * as web3Utils from 'web3-utils';

import { ChainId, OrderType, RatioState } from '../types/enums';
import type { EthereumAddress, TriggerData } from '../types';

import '../configuration';
import {
  aaveV2RatioTrigger,
  aaveV3QuotePriceTrigger,
  aaveV3QuotePriceWithMaximumGasPriceTrigger,
  aaveV3RatioTrigger,
  cBondsRebondTrigger,
  chainlinkPriceTrigger,
  compoundV2RatioTrigger,
  compoundV3RatioTrigger,
  compoundV3PriceTrigger,
  curveUsdBorrowRateTrigger,
  curveUsdSoftLiquidationTrigger,
  exchangeOffchainPriceTrigger,
  exchangeTimestampTrigger,
  liquityDebtInFrontTrigger,
  makerRatioTrigger,
  morphoAaveV2RatioTrigger,
  sparkQuotePriceTrigger,
  sparkRatioTrigger,
  trailingStopTrigger,
  liquityDebtInFrontWithLimitTrigger,
  crvUSDRatioTrigger,
  morphoBlueRatioTrigger,
  crvUsdHealthRatioTrigger, liquityV2DebtInFrontTrigger, liquityV2AdjustTimeTrigger,
  compoundV3PriceRangeTrigger,
} from './triggerService';

describe('Feature: triggerService.ts', () => {

  describe('When testing triggerService.chainlinkPriceTrigger', () => {
    describe('encode()', () => {
      const examples: Array<[[string], [EthereumAddress, string, RatioState]]> = [
        [
          ['0x000000000000000000000000c02aaa39b223fe8d0a0e5c4f27ead9083c756cc20000000000000000000000000000000000000000000000000000002794ca24000000000000000000000000000000000000000000000000000000000000000000'],
          [getAssetInfo('WETH', ChainId.Ethereum).address, '1700', RatioState.OVER]
        ],
        [
          ['0x000000000000000000000000c02aaa39b223fe8d0a0e5c4f27ead9083c756cc20000000000000000000000000000000000000000000000000000002c3ce1ec000000000000000000000000000000000000000000000000000000000000000001'],
          [getAssetInfo('WETH', ChainId.Ethereum).address, '1900', RatioState.UNDER]
        ],
      ];

      examples.forEach(([expected, actual]) => {
        it(`Given ${actual} should return expected value: ${expected}`, () => {
          expect(chainlinkPriceTrigger.encode(...actual)).to.eql(expected);
        });
      });
    });

    describe('decode()', () => {
      const examples: Array<[{ tokenAddr: EthereumAddress, price: string, state: RatioState}, TriggerData]> = [
        [
          { tokenAddr: getAssetInfo('WETH', ChainId.Ethereum).address, price: '1700', state: RatioState.OVER },
          ['0x000000000000000000000000c02aaa39b223fe8d0a0e5c4f27ead9083c756cc20000000000000000000000000000000000000000000000000000002794ca24000000000000000000000000000000000000000000000000000000000000000000'],
        ],
        [
          { tokenAddr: getAssetInfo('WETH', ChainId.Ethereum).address, price: '1900', state: RatioState.UNDER },
          ['0x000000000000000000000000c02aaa39b223fe8d0a0e5c4f27ead9083c756cc20000000000000000000000000000000000000000000000000000002c3ce1ec000000000000000000000000000000000000000000000000000000000000000001'],
        ],
      ];

      examples.forEach(([expected, actual]) => {
        it(`Given ${actual} should return expected value: ${JSON.stringify(expected)}`, () => {
          expect(chainlinkPriceTrigger.decode(actual)).to.eql(expected);
        });
      });
    });
  });

  describe('When testing triggerService.trailingStopTrigger', () => {
    describe('encode()', () => {
      const examples: Array<[[string], [EthereumAddress, number, number]]> = [
        [
          ['0x000000000000000000000000c02aaa39b223fe8d0a0e5c4f27ead9083c756cc200000000000000000000000000000000000000000000000000000002cb417800000000000000000000000000000000000000000000000000000000000000000a'],
          [getAssetInfo('WETH', ChainId.Ethereum).address, 120, 10]
        ],
        [
          ['0x0000000000000000000000006b175474e89094c44da98b954eedeac495271d0f00000000000000000000000000000000000000000000000000000002cb417800000000000000000000000000000000000000000000000000000000000000000c'],
          [getAssetInfo('DAI', ChainId.Ethereum).address, 120, 12]
        ],
      ];

      examples.forEach(([expected, actual]) => {
        it(`Given ${actual} should return expected value: ${expected}`, () => {
          expect(trailingStopTrigger.encode(...actual)).to.eql(expected);
        });
      });
    });

    describe('decode()', () => {
      const examples: Array<[{ triggerPercentage: number, tokenAddr: EthereumAddress, roundId: string }, TriggerData]> = [
        [
          { tokenAddr: getAssetInfo('WETH', ChainId.Ethereum).address, triggerPercentage: 120, roundId: '10' },
          ['0x000000000000000000000000c02aaa39b223fe8d0a0e5c4f27ead9083c756cc200000000000000000000000000000000000000000000000000000002cb417800000000000000000000000000000000000000000000000000000000000000000a'],
        ],
        [
          { tokenAddr: web3Utils.toChecksumAddress(getAssetInfo('DAI', ChainId.Ethereum).address), triggerPercentage: 120, roundId: '12' },
          ['0x0000000000000000000000006b175474e89094c44da98b954eedeac495271d0f00000000000000000000000000000000000000000000000000000002cb417800000000000000000000000000000000000000000000000000000000000000000c'],
        ],
      ];

      examples.forEach(([expected, actual]) => {
        it(`Given ${actual} should return expected value: ${JSON.stringify(expected)}`, () => {
          expect(trailingStopTrigger.decode(actual)).to.eql(expected);
        });
      });
    });
  });

  describe('When testing triggerService.makerRatioTrigger', () => {
    describe('encode()', () => {
      const examples: Array<[[string], [number, number, RatioState]]> = [
        [
          ['0x0000000000000000000000000000000000000000000000000000000000000520000000000000000000000000000000000000000000000000122e0e0f2fc300000000000000000000000000000000000000000000000000000000000000000001'],
          [1312, 131, RatioState.UNDER]
        ],
        [
          ['0x000000000000000000000000000000000000000000000000000000000000a455000000000000000000000000000000000000000000000000200ec4c2d72700000000000000000000000000000000000000000000000000000000000000000000'],
          [42069, 231, RatioState.OVER]
        ],
      ];

      examples.forEach(([expected, actual]) => {
        it(`Given ${actual} should return expected value: ${expected}`, () => {
          expect(makerRatioTrigger.encode(...actual)).to.eql(expected);
        });
      });
    });

    describe('decode()', () => {
      const examples: Array<[{ vaultId: number, ratioState: number, ratio: number }, TriggerData]> = [
        [
          { vaultId: 1312, ratioState: RatioState.UNDER, ratio: 131 },
          ['0x0000000000000000000000000000000000000000000000000000000000000520000000000000000000000000000000000000000000000000122e0e0f2fc300000000000000000000000000000000000000000000000000000000000000000001'],
        ],
        [
          { vaultId: 42069, ratioState: RatioState.OVER, ratio: 231 },
          ['0x000000000000000000000000000000000000000000000000000000000000a455000000000000000000000000000000000000000000000000200ec4c2d72700000000000000000000000000000000000000000000000000000000000000000000'],
        ],
      ];

      examples.forEach(([expected, actual]) => {
        it(`Given ${actual} should return expected value: ${JSON.stringify(expected)}`, () => {
          expect(makerRatioTrigger.decode(actual)).to.eql(expected);
        });
      });
    });
  });

  describe('When testing triggerService.aaveV3RatioTrigger', () => {
    describe('encode()', () => {
      const examples: Array<[[string], [owner: EthereumAddress, market: EthereumAddress, ratioPercentage: number, ratioState: RatioState]]> = [
        [
          ['0x0000000000000000000000000039d218133afab8f2b819b1066c7e434ad94e9c0000000000000000000000002f39d218133afab8f2b819b1066c7e434ad94e9e00000000000000000000000000000000000000000000000010a741a4627800000000000000000000000000000000000000000000000000000000000000000000'],
          [web3Utils.toChecksumAddress('0x0039d218133AFaB8F2B819B1066c7E434Ad94E9c'), '0x2f39d218133AFaB8F2B819B1066c7E434Ad94E9e', 120, RatioState.OVER]
        ],
        [
          ['0x0000000000000000000000000039d218ff3afab8f2b819b1066c7e434ad94e9f000000000000000000000000a97684ead0e402dc232d5a977953df7ecbab3cdb0000000000000000000000000000000000000000000000002c8c35fe210100000000000000000000000000000000000000000000000000000000000000000001'],
          [web3Utils.toChecksumAddress('0x0039d218ff3AFaB8F2B819B1066c7E434Ad94E9f'), '0xa97684ead0e402dC232d5A977953DF7ECBaB3CDb', 321, RatioState.UNDER]
        ],
      ];

      examples.forEach(([expected, actual]) => {
        it(`Given ${actual} should return expected value: ${expected}`, () => {
          expect(aaveV3RatioTrigger.encode(...actual)).to.eql(expected);
        });
      });
    });

    describe('decode()', () => {
      const examples: Array<[{ owner: EthereumAddress, market: EthereumAddress, ratio: number, ratioState: RatioState }, TriggerData]> = [
        [
          { owner: web3Utils.toChecksumAddress('0x0039d218133AFaB8F2B819B1066c7E434Ad94E9c'), market: '0x2f39d218133AFaB8F2B819B1066c7E434Ad94E9e', ratio: 120, ratioState: RatioState.OVER },
          ['0x0000000000000000000000000039d218133afab8f2b819b1066c7e434ad94e9c0000000000000000000000002f39d218133afab8f2b819b1066c7e434ad94e9e00000000000000000000000000000000000000000000000010a741a4627800000000000000000000000000000000000000000000000000000000000000000000'],
        ],
        [
          { owner: web3Utils.toChecksumAddress('0x0039d218ff3AFaB8F2B819B1066c7E434Ad94E9f'), market: '0xa97684ead0e402dC232d5A977953DF7ECBaB3CDb', ratio: 321, ratioState: RatioState.UNDER },
          ['0x0000000000000000000000000039d218ff3afab8f2b819b1066c7e434ad94e9f000000000000000000000000a97684ead0e402dc232d5a977953df7ecbab3cdb0000000000000000000000000000000000000000000000002c8c35fe210100000000000000000000000000000000000000000000000000000000000000000001'],
        ],
      ];

      examples.forEach(([expected, actual]) => {
        it(`Given ${actual} should return expected value: ${JSON.stringify(expected)}`, () => {
          expect(aaveV3RatioTrigger.decode(actual)).to.eql(expected);
        });
      });
    });
  });

  describe('When testing triggerService.morphoAaveV2RatioTrigger', () => {
    describe('encode()', () => {
      const examples: Array<[[string], [owner: EthereumAddress, ratioPercentage: number, ratioState: RatioState]]> = [
        [
          ['0x0000000000000000000000000039d218133afab8f2b819b1066c7e434ad94e2c0000000000000000000000000000000000000000000000001eab7f4a799d00000000000000000000000000000000000000000000000000000000000000000001'],
          [web3Utils.toChecksumAddress('0x0039d218133AFaB8F2B819B1066c7E434Ad94E2c'), 221, RatioState.UNDER]
        ],
        [
          ['0x0000000000000000000000000032d218133afab8f2b819b1066c7e434ad94e2c0000000000000000000000000000000000000000000000003d3377a2837900000000000000000000000000000000000000000000000000000000000000000000'],
          [web3Utils.toChecksumAddress('0x0032d218133AFaB8F2B819B1066c7E434Ad94E2c'), 441, RatioState.OVER]
        ],
      ];

      examples.forEach(([expected, actual]) => {
        it(`Given ${actual} should return expected value: ${expected}`, () => {
          expect(morphoAaveV2RatioTrigger.encode(...actual)).to.eql(expected);
        });
      });
    });

    describe('decode()', () => {
      const examples: Array<[{ owner: EthereumAddress, ratio: number, ratioState: RatioState }, TriggerData]> = [
        [
          { owner: web3Utils.toChecksumAddress('0x0039d218133AFaB8F2B819B1066c7E434Ad94E2c'), ratio: 221, ratioState: RatioState.UNDER },
          ['0x0000000000000000000000000039d218133afab8f2b819b1066c7e434ad94e2c0000000000000000000000000000000000000000000000001eab7f4a799d00000000000000000000000000000000000000000000000000000000000000000001'],
        ],
        [
          { owner: web3Utils.toChecksumAddress('0x0032d218133AFaB8F2B819B1066c7E434Ad94E2c'), ratio: 441, ratioState: RatioState.OVER },
          ['0x0000000000000000000000000032d218133afab8f2b819b1066c7e434ad94e2c0000000000000000000000000000000000000000000000003d3377a2837900000000000000000000000000000000000000000000000000000000000000000000'],
        ],
      ];

      examples.forEach(([expected, actual]) => {
        it(`Given ${actual} should return expected value: ${JSON.stringify(expected)}`, () => {
          expect(morphoAaveV2RatioTrigger.decode(actual)).to.eql(expected);
        });
      });
    });
  });

  describe('When testing triggerService.aaveV3QuotePriceTrigger', () => {
    describe('encode()', () => {
      const examples: Array<[[string], [baseTokenAddress: EthereumAddress, quoteTokenAddress: EthereumAddress, price: number, ratioState: RatioState]]> = [
        [
          ['0x0000000000000000000000006b175474e89094c44da98b954eedeac495271d0f000000000000000000000000c02aaa39b223fe8d0a0e5c4f27ead9083c756cc20000000000000000000000000000000000000000000000000000000000009c400000000000000000000000000000000000000000000000000000000000000001'],
          [getAssetInfo('DAI', ChainId.Ethereum).address, getAssetInfo('WETH', ChainId.Ethereum).address, 0.0004, RatioState.UNDER]
        ],
        [
          ['0x0000000000000000000000002f2a2543b76a4166549f7aab2e75bef0aefc5b0f000000000000000000000000fd086bc7cd5c481dcc9c85ebe478a1c0b69fcbb900000000000000000000000000000000000000000000000000000000000000170000000000000000000000000000000000000000000000000000000000000000'],
          [getAssetInfo('WBTC', ChainId.Arbitrum).address, getAssetInfo('USDT', ChainId.Arbitrum).address, 0.00000023, RatioState.OVER]
        ],
      ];

      examples.forEach(([expected, actual]) => {
        it(`Given ${actual} should return expected value: ${expected}`, () => {
          expect(aaveV3QuotePriceTrigger.encode(...actual)).to.eql(expected);
        });
      });
    });

    describe('decode()', () => {
      const examples: Array<[{ baseTokenAddress: EthereumAddress, quoteTokenAddress: EthereumAddress, price: string, ratioState: RatioState }, TriggerData]> = [
        [
          {
            baseTokenAddress: web3Utils.toChecksumAddress(getAssetInfo('DAI', ChainId.Ethereum).address),
            quoteTokenAddress: web3Utils.toChecksumAddress(getAssetInfo('WETH', ChainId.Ethereum).address),
            price: '0.0004',
            ratioState: RatioState.UNDER,
          },
          ['0x0000000000000000000000006b175474e89094c44da98b954eedeac495271d0f000000000000000000000000c02aaa39b223fe8d0a0e5c4f27ead9083c756cc20000000000000000000000000000000000000000000000000000000000009c400000000000000000000000000000000000000000000000000000000000000001'],
        ],
        [
          {
            baseTokenAddress: web3Utils.toChecksumAddress(getAssetInfo('WBTC', ChainId.Arbitrum).address),
            quoteTokenAddress: web3Utils.toChecksumAddress(getAssetInfo('USDT', ChainId.Arbitrum).address),
            price: '0.00000023',
            ratioState: RatioState.OVER,
          },
          ['0x0000000000000000000000002f2a2543b76a4166549f7aab2e75bef0aefc5b0f000000000000000000000000fd086bc7cd5c481dcc9c85ebe478a1c0b69fcbb900000000000000000000000000000000000000000000000000000000000000170000000000000000000000000000000000000000000000000000000000000000'],
        ]
      ];

      examples.forEach(([expected, actual]) => {
        it(`Given ${actual} should return expected value: ${JSON.stringify(expected)}`, () => {
          expect(aaveV3QuotePriceTrigger.decode(actual)).to.eql(expected);
        });
      });
    });
  });

  describe('When testing triggerService.aaveV3QuotePriceWithMaximumGasPriceTrigger', () => {
    describe('encode()', () => {
      const examples: Array<[TriggerData, [baseTokenAddress: EthereumAddress, quoteTokenAddress: EthereumAddress, price: number, ratioState: RatioState, maximumGasPriceInGwei?: number]]> = [
        [
          [
            '0x0000000000000000000000006b175474e89094c44da98b954eedeac495271d0f000000000000000000000000c02aaa39b223fe8d0a0e5c4f27ead9083c756cc20000000000000000000000000000000000000000000000000000000000009c400000000000000000000000000000000000000000000000000000000000000001',
            '0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff',
          ],
          [getAssetInfo('DAI', ChainId.Ethereum).address, getAssetInfo('WETH', ChainId.Ethereum).address, 0.0004, RatioState.UNDER]
        ],
        [
          [
            '0x0000000000000000000000002260fac5e5542a773aa44fbcfedf7c193bc2c599000000000000000000000000dac17f958d2ee523a2206206994597c13d831ec700000000000000000000000000000000000000000000000000000000000000170000000000000000000000000000000000000000000000000000000000000000',
            '0x00000000000000000000000000000000000000000000000000000002cb417800',
          ],
          [getAssetInfo('WBTC', ChainId.Ethereum).address, getAssetInfo('USDT', ChainId.Ethereum).address, 0.00000023, RatioState.OVER, 12]
        ],
      ];

      examples.forEach(([expected, actual]) => {
        it(`Given ${actual} should return expected value: ${JSON.stringify(expected)}`, () => {
          expect(aaveV3QuotePriceWithMaximumGasPriceTrigger.encode(...actual)).to.eql(expected);
        });
      });
    });

    describe('decode()', () => {
      const examples: Array<[{ baseTokenAddress: EthereumAddress, quoteTokenAddress: EthereumAddress, price: string, ratioState: RatioState, maximumGasPrice: string }, TriggerData]> = [
        [
          {
            baseTokenAddress: web3Utils.toChecksumAddress(getAssetInfo('DAI', ChainId.Ethereum).address),
            quoteTokenAddress: web3Utils.toChecksumAddress(getAssetInfo('WETH', ChainId.Ethereum).address),
            price: '0.0004',
            ratioState: RatioState.UNDER,
            maximumGasPrice: web3Utils.fromWei(MAXUINT, 'gwei')
          },
          [
            '0x0000000000000000000000006b175474e89094c44da98b954eedeac495271d0f000000000000000000000000c02aaa39b223fe8d0a0e5c4f27ead9083c756cc20000000000000000000000000000000000000000000000000000000000009c400000000000000000000000000000000000000000000000000000000000000001',
            '0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff',
          ],
        ],
        [
          {
            baseTokenAddress: web3Utils.toChecksumAddress(getAssetInfo('WBTC', ChainId.Ethereum).address),
            quoteTokenAddress: web3Utils.toChecksumAddress(getAssetInfo('USDT', ChainId.Ethereum).address),
            price: '0.00000023',
            ratioState: RatioState.OVER,
            maximumGasPrice: '12',
          },
          [
            '0x0000000000000000000000002260fac5e5542a773aa44fbcfedf7c193bc2c599000000000000000000000000dac17f958d2ee523a2206206994597c13d831ec700000000000000000000000000000000000000000000000000000000000000170000000000000000000000000000000000000000000000000000000000000000',
            '0x00000000000000000000000000000000000000000000000000000002cb417800',
          ],
        ]
      ];

      examples.forEach(([expected, actual]) => {
        it(`Given ${actual} should return expected value: ${JSON.stringify(expected)}`, () => {
          expect(aaveV3QuotePriceWithMaximumGasPriceTrigger.decode(actual)).to.eql(expected);
        });
      });
    });
  });

  describe('When testing triggerService.liquityRatioTrigger', () => {
    describe('encode()', () => {
      const examples: Array<[[string], [owner: EthereumAddress, ratioPercentage: number, ratioState: RatioState]]> = [
        [
          ['0x0000000000000000000000000039d218133afab8f2b819b1066c7e434ad94e2c00000000000000000000000000000000000000000000000029c5ab0d65ed00000000000000000000000000000000000000000000000000000000000000000001'],
          [web3Utils.toChecksumAddress('0x0039d218133AFaB8F2B819B1066c7E434Ad94E2c'), 301, RatioState.UNDER]
        ],
        [
          ['0x0000000000000000000000000039d218133afab832b819b1066c7e434ad94e2c000000000000000000000000000000000000000000000000122e0e0f2fc300000000000000000000000000000000000000000000000000000000000000000000'],
          [web3Utils.toChecksumAddress('0x0039d218133AFaB832B819B1066c7E434Ad94E2c'), 131, RatioState.OVER]
        ],
      ];

      examples.forEach(([expected, actual]) => {
        it(`Given ${actual} should return expected value: ${expected}`, () => {
          expect(compoundV2RatioTrigger.encode(...actual)).to.eql(expected);
        });
      });
    });

    describe('decode()', () => {
      const examples: Array<[{ owner: EthereumAddress, ratioState: RatioState, ratio: number }, TriggerData]> = [
        [
          {
            owner: web3Utils.toChecksumAddress('0x0039d218133AFaB8F2B819B1066c7E434Ad94E2c'),
            ratio: 301,
            ratioState: RatioState.UNDER,
          },
          ['0x0000000000000000000000000039d218133afab8f2b819b1066c7e434ad94e2c00000000000000000000000000000000000000000000000029c5ab0d65ed00000000000000000000000000000000000000000000000000000000000000000001'],
        ],
        [
          {
            owner: web3Utils.toChecksumAddress('0x0039d218133AFaB832B819B1066c7E434Ad94E2c'),
            ratio: 131,
            ratioState: RatioState.OVER,
          },
          ['0x0000000000000000000000000039d218133afab832b819b1066c7e434ad94e2c000000000000000000000000000000000000000000000000122e0e0f2fc300000000000000000000000000000000000000000000000000000000000000000000'],
        ],
      ];

      examples.forEach(([expected, actual]) => {
        it(`Given ${actual} should return expected value: ${JSON.stringify(expected)}`, () => {
          expect(compoundV2RatioTrigger.decode(actual)).to.eql(expected);
        });
      });
    });
  });

  describe('When testing triggerService.liquityDebtInFrontTrigger', () => {
    describe('encode()', () => {
      const examples: Array<[[string], [owner: EthereumAddress, debtInFrontMin: string]]> = [
        [
          ['0x0000000000000000000000000049d218133afab8f2b829b1066c7e434ad94e2c00000000000000000000000000000000000000000000006e0be8c4995af80000'],
          [web3Utils.toChecksumAddress('0x0049d218133AFaB8F2B829B1066c7E434Ad94E2c'), '2030']
        ],
        [
          ['0x0000000000000000000000000049d218133afab8f2b829b1066c7e434a192e2c000000000000000000000000000000000000000000004697f83e6356dd440000'],
          [web3Utils.toChecksumAddress('0x0049d218133AFaB8F2B829B1066c7E434A192E2c'), '333369']
        ],
        [
          ['0x00000000000000000000000030462ad9d8f01a20a2ec7e7f1a8f1b303662aebf000000000000000000000000000000000000000000084595161401484a000000'],
          [web3Utils.toChecksumAddress('0x30462AD9D8F01A20A2EC7E7F1A8F1B303662AEBF'), '10000000']
        ],
        [
          ['0x00000000000000000000000030462ad9d8f01a20a2ec7e7f1a8f1b303662aebf0000000000000000000000000000000000000000000000000000000000989680'],
          [web3Utils.toChecksumAddress('0x30462AD9D8F01A20A2EC7E7F1A8F1B303662AEBF'), '0.00000000001']
        ],
        [
          ['0x000000000000000000000000235d6a8db3c57c3f7b4eba749e1738db6093732a0000000000000000000000000000000000000000019d971e4fe8401e74000000'],
          [web3Utils.toChecksumAddress('0x235d6A8DB3C57c3f7b4ebA749E1738Db6093732a'), '500000000']
        ],
        [
          ['0x000000000000000000000000235d6a8db3c57c3f7b4eba749e1738db6093732a00000000000000000000000000000000000000000001a784379d99db42000000'],
          [web3Utils.toChecksumAddress('0x235d6A8DB3C57c3f7b4ebA749E1738Db6093732a'), '2000000']
        ],
      ];

      examples.forEach(([expected, actual]) => {
        it(`Given ${actual} should return expected value: ${expected}`, () => {
          expect(liquityDebtInFrontTrigger.encode(...actual)).to.eql(expected);
          expect(liquityDebtInFrontWithLimitTrigger.encode(...actual)).to.eql(expected);
        });
      });
    });

    describe('decode()', () => {
      const examples: Array<[{ owner: EthereumAddress, debtInFrontMin: string }, TriggerData]> = [
        [
          {
            owner: web3Utils.toChecksumAddress('0x0049d218133AFaB8F2B829B1066c7E434Ad94E2c'),
            debtInFrontMin: '2030',
          },
          ['0x0000000000000000000000000049d218133afab8f2b829b1066c7e434ad94e2c00000000000000000000000000000000000000000000006e0be8c4995af80000'],
        ],
        [
          {
            owner: web3Utils.toChecksumAddress('0x0049d218133AFaB8F2B829B1066c7E434A192E2c'),
            debtInFrontMin: '333369',
          },
          ['0x0000000000000000000000000049d218133afab8f2b829b1066c7e434a192e2c000000000000000000000000000000000000000000004697f83e6356dd440000'],
        ],
        [
          {
            owner: web3Utils.toChecksumAddress('0x30462AD9D8F01A20A2EC7E7F1A8F1B303662AEBF'),
            debtInFrontMin: '10000000',
          },
          ['0x00000000000000000000000030462ad9d8f01a20a2ec7e7f1a8f1b303662aebf000000000000000000000000000000000000000000084595161401484a000000'],
        ],
        [
          {
            owner: web3Utils.toChecksumAddress('0x30462AD9D8F01A20A2EC7E7F1A8F1B303662AEBF'),
            debtInFrontMin: '0.00000000001',
          },
          ['0x00000000000000000000000030462ad9d8f01a20a2ec7e7f1a8f1b303662aebf0000000000000000000000000000000000000000000000000000000000989680'],
        ],
        [
          {
            owner: web3Utils.toChecksumAddress('0x235d6A8DB3C57c3f7b4ebA749E1738Db6093732a'),
            debtInFrontMin: '500000000',
          },
          ['0x000000000000000000000000235d6a8db3c57c3f7b4eba749e1738db6093732a0000000000000000000000000000000000000000019d971e4fe8401e74000000'],
        ],
        [
          {
            owner: web3Utils.toChecksumAddress('0x235d6A8DB3C57c3f7b4ebA749E1738Db6093732a'),
            debtInFrontMin: '2000000',
          },
          ['0x000000000000000000000000235d6a8db3c57c3f7b4eba749e1738db6093732a00000000000000000000000000000000000000000001a784379d99db42000000'],
        ],
      ];

      examples.forEach(([expected, actual]) => {
        it(`Given ${actual} should return expected value: ${JSON.stringify(expected)}`, () => {
          expect(liquityDebtInFrontTrigger.decode(actual)).to.eql(expected);
          expect(liquityDebtInFrontWithLimitTrigger.decode(actual)).to.eql(expected);
        });
      });
    });
  });

  describe('When testing triggerService.liquityV2DebtInFrontTrigger', () => {
    describe('encode()', () => {
      const examples: Array<[[string], [market: EthereumAddress, troveId: string, debtInFrontMin: string]]> = [
        [
          ['0x0000000000000000000000000049d218133afab8f2b829b1066c7e434ad94e2c00000000000000000000000000000000000000000000000000000000075bcd1500000000000000000000000000000000000000000000006e0be8c4995af80000'],
          [web3Utils.toChecksumAddress('0x0049d218133AFaB8F2B829B1066c7E434Ad94E2c'), '123456789', '2030']
        ],
        [
          ['0x0000000000000000000000000049d218133afab8f2b829b1066c7e434a192e2c000000000000000000000000000000000000000000000000000000003ade68b1000000000000000000000000000000000000000000004697f83e6356dd440000'],
          [web3Utils.toChecksumAddress('0x0049d218133AFaB8F2B829B1066c7E434A192E2c'), '987654321', '333369']
        ],
        [
          ['0x00000000000000000000000030462ad9d8f01a20a2ec7e7f1a8f1b303662aebf00000000000000000000000000000000000000000000000000000000075bd924000000000000000000000000000000000000000000084595161401484a000000'],
          [web3Utils.toChecksumAddress('0x30462AD9D8F01A20A2EC7E7F1A8F1B303662AEBF'), '123459876', '10000000']
        ],
        [
          ['0x00000000000000000000000030462ad9d8f01a20a2ec7e7f1a8f1b303662aebf000000000000000000000000000000000000000000000000000000002060d4950000000000000000000000000000000000000000000000000000000000989680'],
          [web3Utils.toChecksumAddress('0x30462AD9D8F01A20A2EC7E7F1A8F1B303662AEBF'), '543216789', '0.00000000001']
        ],
        [
          ['0x000000000000000000000000235d6a8db3c57c3f7b4eba749e1738db6093732a000000000000000000000000000000000000000000000000000000003ade5ca20000000000000000000000000000000000000000019d971e4fe8401e74000000'],
          [web3Utils.toChecksumAddress('0x235d6A8DB3C57c3f7b4ebA749E1738Db6093732a'), '987651234', '500000000']
        ],
      ];

      examples.forEach(([expected, actual]) => {
        it(`Given ${actual} should return expected value: ${expected}`, () => {
          expect(liquityV2DebtInFrontTrigger.encode(...actual)).to.eql(expected);
        });
      });
    });

    describe('decode()', () => {
      const examples: Array<[{ market: EthereumAddress, troveId: string, debtInFrontMin: string }, TriggerData]> = [
        [
          {
            market: web3Utils.toChecksumAddress('0x0049d218133AFaB8F2B829B1066c7E434Ad94E2c'),
            troveId: '123456789',
            debtInFrontMin: '2030',
          },
          ['0x0000000000000000000000000049d218133afab8f2b829b1066c7e434ad94e2c00000000000000000000000000000000000000000000000000000000075bcd1500000000000000000000000000000000000000000000006e0be8c4995af80000'],
        ],
        [
          {
            market: web3Utils.toChecksumAddress('0x0049d218133AFaB8F2B829B1066c7E434A192E2c'),
            troveId: '987654321',
            debtInFrontMin: '333369',
          },
          ['0x0000000000000000000000000049d218133afab8f2b829b1066c7e434a192e2c000000000000000000000000000000000000000000000000000000003ade68b1000000000000000000000000000000000000000000004697f83e6356dd440000'],
        ], [
          {
            market: web3Utils.toChecksumAddress('0x30462AD9D8F01A20A2EC7E7F1A8F1B303662AEBF'),
            troveId: '123459876',
            debtInFrontMin: '10000000',
          },
          ['0x00000000000000000000000030462ad9d8f01a20a2ec7e7f1a8f1b303662aebf00000000000000000000000000000000000000000000000000000000075bd924000000000000000000000000000000000000000000084595161401484a000000'],
        ], [
          {
            market: web3Utils.toChecksumAddress('0x30462AD9D8F01A20A2EC7E7F1A8F1B303662AEBF'),
            troveId: '543216789',
            debtInFrontMin: '0.00000000001',
          },
          ['0x00000000000000000000000030462ad9d8f01a20a2ec7e7f1a8f1b303662aebf000000000000000000000000000000000000000000000000000000002060d4950000000000000000000000000000000000000000000000000000000000989680'],
        ], [
          {
            market: web3Utils.toChecksumAddress('0x235d6A8DB3C57c3f7b4ebA749E1738Db6093732a'),
            troveId: '987651234',
            debtInFrontMin: '500000000',
          },
          ['0x000000000000000000000000235d6a8db3c57c3f7b4eba749e1738db6093732a000000000000000000000000000000000000000000000000000000003ade5ca20000000000000000000000000000000000000000019d971e4fe8401e74000000'],
        ]
      ];

      examples.forEach(([expected, actual]) => {
        it(`Given ${actual} should return expected value: ${JSON.stringify(expected)}`, () => {
          expect(liquityV2DebtInFrontTrigger.decode(actual)).to.eql(expected);
        });
      });
    });
  });

  describe('When testing triggerService.liquityV2AdjustTimeTrigger', () => {
    describe('encode()', () => {
      const examples: Array<[[string], [market: EthereumAddress, troveId: string]]> = [
        [
          ['0x0000000000000000000000000049d218133afab8f2b829b1066c7e434ad94e2c00000000000000000000000000000000000000000000000000000000075bcd15'],
          [web3Utils.toChecksumAddress('0x0049d218133AFaB8F2B829B1066c7E434Ad94E2c'), '123456789']
        ],
        [
          ['0x0000000000000000000000000049d218133afab8f2b829b1066c7e434a192e2c000000000000000000000000000000000000000000000000000000003ade68b1'],
          [web3Utils.toChecksumAddress('0x0049d218133AFaB8F2B829B1066c7E434A192E2c'), '987654321']
        ],
      ];

      examples.forEach(([expected, actual]) => {
        it(`Given ${actual} should return expected value: ${expected}`, () => {
          expect(liquityV2AdjustTimeTrigger.encode(...actual)).to.eql(expected);
        });
      });
    });

    describe('decode()', () => {
      const examples: Array<[{ market: EthereumAddress, troveId: string }, TriggerData]> = [
        [
          {
            market: web3Utils.toChecksumAddress('0x0049d218133AFaB8F2B829B1066c7E434Ad94E2c'),
            troveId: '123456789',
          },
          ['0x0000000000000000000000000049d218133afab8f2b829b1066c7e434ad94e2c00000000000000000000000000000000000000000000000000000000075bcd15'],
        ],
        [
          {
            market: web3Utils.toChecksumAddress('0x0049d218133AFaB8F2B829B1066c7E434A192E2c'),
            troveId: '987654321',
          },
          ['0x0000000000000000000000000049d218133afab8f2b829b1066c7e434a192e2c000000000000000000000000000000000000000000000000000000003ade68b1'],
        ]
      ];

      examples.forEach(([expected, actual]) => {
        it(`Given ${actual} should return expected value: ${JSON.stringify(expected)}`, () => {
          expect(liquityV2AdjustTimeTrigger.decode(actual)).to.eql(expected);
        });
      });
    });
  });
  describe('When testing triggerService.aaveV2RatioTrigger', () => {
    describe('encode()', () => {
      const examples: Array<[[string], [owner: EthereumAddress, market: EthereumAddress, ratioPercentage: number, ratioState: RatioState]]> = [
        [
          ['0x0000000000000000000000000049d218133afab8f2b829b1066c7e434ad94e2c0000000000000000000000000249d218133afab8f2b829b1066c7e434ad94e2c00000000000000000000000000000000000000000000000010a741a4627800000000000000000000000000000000000000000000000000000000000000000000'],
          [web3Utils.toChecksumAddress('0x0049d218133AFaB8F2B829B1066c7E434Ad94E2c'), web3Utils.toChecksumAddress('0x0249d218133AFaB8F2B829B1066c7E434Ad94E2c'), 120, RatioState.OVER]
        ],
      ];

      examples.forEach(([expected, actual]) => {
        it(`Given ${actual} should return expected value: ${expected}`, () => {
          expect(aaveV2RatioTrigger.encode(...actual)).to.eql(expected);
        });
      });
    });

    describe('decode()', () => {
      const examples: Array<[{ owner: EthereumAddress, market: EthereumAddress, ratioState: RatioState, ratio: number }, TriggerData]> = [
        [
          {
            owner: web3Utils.toChecksumAddress('0x0049d218133AFaB8F2B829B1066c7E434Ad94E2c'),
            market: web3Utils.toChecksumAddress('0x0249d218133AFaB8F2B829B1066c7E434Ad94E2c'),
            ratio: 120,
            ratioState: RatioState.OVER,
          },
          ['0x0000000000000000000000000049d218133afab8f2b829b1066c7e434ad94e2c0000000000000000000000000249d218133afab8f2b829b1066c7e434ad94e2c00000000000000000000000000000000000000000000000010a741a4627800000000000000000000000000000000000000000000000000000000000000000000'],
        ],
      ];

      examples.forEach(([expected, actual]) => {
        it(`Given ${actual} should return expected value: ${JSON.stringify(expected)}`, () => {
          expect(aaveV2RatioTrigger.decode(actual)).to.eql(expected);
        });
      });
    });
  });

  describe('When testing triggerService.cBondsRebondTrigger', () => {
    describe('encode()', () => {
      const examples: Array<[[string], [bondId: number | string]]> = [
        [
          ['0x0000000000000000000000000000000000000000000000000000000000000141'],
          [321]
        ],
        [
          ['0x000000000000000000000000000000000000000000000000000000000000002c'],
          [44]
        ],
      ];

      examples.forEach(([expected, actual]) => {
        it(`Given ${actual} should return expected value: ${expected}`, () => {
          expect(cBondsRebondTrigger.encode(...actual)).to.eql(expected);
        });
      });
    });

    describe('decode()', () => {
      const examples: Array<[{ bondId: string }, TriggerData]> = [
        [
          { bondId: '321' },
          ['0x0000000000000000000000000000000000000000000000000000000000000141'],
        ],
        [
          { bondId: '44' },
          ['0x000000000000000000000000000000000000000000000000000000000000002c'],
        ],
      ];

      examples.forEach(([expected, actual]) => {
        it(`Given ${actual} should return expected value: ${JSON.stringify(expected)}`, () => {
          expect(cBondsRebondTrigger.decode(actual)).to.eql(expected);
        });
      });
    });
  });

  describe('When testing triggerService.compoundV3RatioTrigger', () => {
    describe('encode()', () => {
      const examples: Array<[[string], [owner: EthereumAddress, market: EthereumAddress, ratioPercentage: number, ratioState: RatioState]]> = [
        [
          ['0x0000000000000000000000000049d218133afab8f2b829b106633e434ad94e2c0000000000000000000000000213d218133afab8f2b829b1066c7e43cad94e2c000000000000000000000000000000000000000000000000245c1c1e5f8600000000000000000000000000000000000000000000000000000000000000000000'],
          [web3Utils.toChecksumAddress('0x0049d218133AFaB8F2B829B106633E434Ad94E2c'), web3Utils.toChecksumAddress('0x0213d218133AFaB8F2B829B1066c7E43cAd94E2c'), 262, RatioState.OVER]
        ],
        [
          ['0x0000000000000000000000000043d218133afab8f2b829b106633e434ad94e2c0000000000000000000000000213d212133afab8f2b829b1066c7e43cad94e2c0000000000000000000000000000000000000000000000002def7b767e8b00000000000000000000000000000000000000000000000000000000000000000001'],
          [web3Utils.toChecksumAddress('0x0043d218133AFaB8F2B829B106633E434Ad94E2c'), web3Utils.toChecksumAddress('0x0213d212133AFaB8F2B829B1066c7E43cAd94E2c'), 331, RatioState.UNDER]
        ],
      ];

      examples.forEach(([expected, actual]) => {
        it(`Given ${actual} should return expected value: ${expected}`, () => {
          expect(compoundV3RatioTrigger.encode(...actual)).to.eql(expected);
        });
      });
    });

    describe('decode()', () => {
      const examples: Array<[{ owner: EthereumAddress, market: EthereumAddress, ratioState: RatioState, ratio: number }, TriggerData]> = [
        [
          {
            owner: web3Utils.toChecksumAddress('0x0049d218133AFaB8F2B829B106633E434Ad94E2c'),
            market: web3Utils.toChecksumAddress('0x0213d218133AFaB8F2B829B1066c7E43cAd94E2c'),
            ratio: 262,
            ratioState: RatioState.OVER,
          },
          ['0x0000000000000000000000000049d218133afab8f2b829b106633e434ad94e2c0000000000000000000000000213d218133afab8f2b829b1066c7e43cad94e2c000000000000000000000000000000000000000000000000245c1c1e5f8600000000000000000000000000000000000000000000000000000000000000000000'],
        ],
        [
          {
            owner: web3Utils.toChecksumAddress('0x0043d218133AFaB8F2B829B106633E434Ad94E2c'),
            market: web3Utils.toChecksumAddress('0x0213d212133AFaB8F2B829B1066c7E43cAd94E2c'),
            ratio: 331,
            ratioState: RatioState.UNDER,
          },
          ['0x0000000000000000000000000043d218133afab8f2b829b106633e434ad94e2c0000000000000000000000000213d212133afab8f2b829b1066c7e43cad94e2c0000000000000000000000000000000000000000000000002def7b767e8b00000000000000000000000000000000000000000000000000000000000000000001'],
        ],
      ];

      examples.forEach(([expected, actual]) => {
        it(`Given ${actual} should return expected value: ${JSON.stringify(expected)}`, () => {
          expect(compoundV3RatioTrigger.decode(actual)).to.eql(expected);
        });
      });
    });
  });

  describe('When testing triggerService.exchangeTimestampTrigger', () => {
    describe('encode()', () => {
      const examples: Array<[[string], [timestamp: number, interval: number]]> = [
        [
          ['0x0000000000000000000000000000000000000000000000000000018adbcdf3c10000000000000000000000000000000000000000000000000000000077359fb8'],
          [1695904822209, 2000003000]
        ],
        [
          ['0x00000000000000000000000000000000000000000000000000000189ed59a4010000000000000000000000000000000000000000000000000000000011e378b8'],
          [1691904222209, 300120248]
        ],
      ];

      examples.forEach(([expected, actual]) => {
        it(`Given ${actual} should return expected value: ${expected}`, () => {
          expect(exchangeTimestampTrigger.encode(...actual)).to.eql(expected);
        });
      });
    });

    describe('decode()', () => {
      const examples: Array<[{ timestamp: number, interval: number }, TriggerData]> = [
        [
          {
            timestamp: 1695904822209, interval: 2000003000,
          },
          ['0x0000000000000000000000000000000000000000000000000000018adbcdf3c10000000000000000000000000000000000000000000000000000000077359fb8'],
        ],
        [
          {
            timestamp: 1691904222209, interval: 300120248,
          },
          ['0x00000000000000000000000000000000000000000000000000000189ed59a4010000000000000000000000000000000000000000000000000000000011e378b8'],
        ],
      ];

      examples.forEach(([expected, actual]) => {
        it(`Given ${actual} should return expected value: ${JSON.stringify(expected)}`, () => {
          expect(exchangeTimestampTrigger.decode(actual)).to.eql(expected);
        });
      });
    });
  });

  describe('When testing triggerService.exchangeOffchainPriceTrigger', () => {
    describe('encode()', () => {
      const examples: Array<[[string], [targetPrice: string, goodUntil: number, orderType: OrderType, fromTokenDecimals: number, toTokenDecimals: number]]> = [
        [
          ['0x00000000000000000000000000000000000000000000000001b4fbd92b5f80000000000000000000000000000000000000000000000000000000018adbcdf3c10000000000000000000000000000000000000000000000000000000000000000'],
          ['0.123', 1695904822209, OrderType.TAKE_PROFIT, 12, 12]
        ],
        [
          ['0x00000000000000000000000000000000000000000000000000000000003432120000000000000000000000000000000000000000000000000000018adbbead990000000000000000000000000000000000000000000000000000000000000001'],
          ['3.42069', 1695903821209, OrderType.STOP_LOSS, 18, 6]
        ],
      ];

      examples.forEach(([expected, actual]) => {
        it(`Given ${actual} should return expected value: ${expected}`, () => {
          expect(exchangeOffchainPriceTrigger.encode(...actual)).to.eql(expected);
        });
      });
    });

    describe('decode()', () => {
      const examples: Array<[{ orderType: OrderType; targetPrice: string; goodUntil: any }, [TriggerData, number, number]]> = [
        [
          {
            orderType: OrderType.TAKE_PROFIT, targetPrice: '0.123', goodUntil: 1695904822209,
          },
          [
            ['0x00000000000000000000000000000000000000000000000001b4fbd92b5f80000000000000000000000000000000000000000000000000000000018adbcdf3c10000000000000000000000000000000000000000000000000000000000000000'],
            12,
            12,
          ],
        ],
        [
          {
            orderType: OrderType.STOP_LOSS, targetPrice: '3.42069', goodUntil: 1695903821209,
          },
          [
            ['0x00000000000000000000000000000000000000000000000000000000003432120000000000000000000000000000000000000000000000000000018adbbead990000000000000000000000000000000000000000000000000000000000000001'],
            18,
            6,
          ],
        ],
      ];

      examples.forEach(([expected, actual]) => {
        it(`Given ${actual} should return expected value: ${JSON.stringify(expected)}`, () => {
          expect(exchangeOffchainPriceTrigger.decode(...actual)).to.eql(expected);
        });
      });
    });
  });

  describe('When testing triggerService.sparkRatioTrigger', () => {
    describe('encode()', () => {
      const examples: Array<[[string], [owner: EthereumAddress, market: EthereumAddress, ratioPercentage: number, ratioState: RatioState]]> = [
        [
          ['0x0000000000000000000000000031d218133afab8f2b819b1066c7e434ad94e9c0000000000000000000000001131d218133afab8f2b819b1066c7e434ad94e9c00000000000000000000000000000000000000000000000010a741a4627800000000000000000000000000000000000000000000000000000000000000000001'],
          [web3Utils.toChecksumAddress('0x0031d218133AFaB8F2B819B1066c7E434Ad94E9c'), web3Utils.toChecksumAddress('0x1131d218133AFaB8F2B819B1066c7E434Ad94E9c'), 120, RatioState.UNDER]
        ],
        [
          ['0x0000000000000000000000000231d218133afab8f2b819b1066c7e434ad94e9c0000000000000000000000000131d218133afab8f2b819b1066c7e434ad94e9c000000000000000000000000000000000000000000000000200ec4c2d72700000000000000000000000000000000000000000000000000000000000000000000'],
          [web3Utils.toChecksumAddress('0x0231d218133AFaB8F2B819B1066c7E434Ad94E9c'), web3Utils.toChecksumAddress('0x0131d218133AFaB8F2B819B1066c7E434Ad94E9c'), 231, RatioState.OVER]
        ],
      ];

      examples.forEach(([expected, actual]) => {
        it(`Given ${actual} should return expected value: ${expected}`, () => {
          expect(sparkRatioTrigger.encode(...actual)).to.eql(expected);
        });
      });
    });

    describe('decode()', () => {
      const examples: Array<[{ owner: EthereumAddress, market: EthereumAddress, ratio: number, ratioState: RatioState }, TriggerData]> = [
        [
          { owner: web3Utils.toChecksumAddress('0x0031d218133AFaB8F2B819B1066c7E434Ad94E9c'), market: web3Utils.toChecksumAddress('0x1131d218133AFaB8F2B819B1066c7E434Ad94E9c'), ratio: 120, ratioState: RatioState.UNDER },
          ['0x0000000000000000000000000031d218133afab8f2b819b1066c7e434ad94e9c0000000000000000000000001131d218133afab8f2b819b1066c7e434ad94e9c00000000000000000000000000000000000000000000000010a741a4627800000000000000000000000000000000000000000000000000000000000000000001'],
        ],
        [
          { owner: web3Utils.toChecksumAddress('0x0231d218133AFaB8F2B819B1066c7E434Ad94E9c'), market: web3Utils.toChecksumAddress('0x0131d218133AFaB8F2B819B1066c7E434Ad94E9c'), ratio: 231, ratioState: RatioState.OVER },
          ['0x0000000000000000000000000231d218133afab8f2b819b1066c7e434ad94e9c0000000000000000000000000131d218133afab8f2b819b1066c7e434ad94e9c000000000000000000000000000000000000000000000000200ec4c2d72700000000000000000000000000000000000000000000000000000000000000000000'],
        ],
      ];

      examples.forEach(([expected, actual]) => {
        it(`Given ${actual} should return expected value: ${JSON.stringify(expected)}`, () => {
          expect(sparkRatioTrigger.decode(actual)).to.eql(expected);
        });
      });
    });
  });

  describe('When testing triggerService.sparkQuotePriceTrigger', () => {
    describe('encode()', () => {
      const examples: Array<[[string], [baseTokenAddress: EthereumAddress, quoteTokenAddress: EthereumAddress, price: number, ratioState: RatioState]]> = [
        [
          ['0x0000000000000000000000006b175474e89094c44da98b954eedeac495271d0f0000000000000000000000007f39c581f595b53c5cb19bd0b3f8da6c935e2ca0000000000000000000000000000000000000000000000000000000000000a8ca0000000000000000000000000000000000000000000000000000000000000001'],
          [getAssetInfo('DAI', ChainId.Ethereum).address, getAssetInfo('wstETH', ChainId.Ethereum).address, 0.0004321, RatioState.UNDER]
        ],
        [
          ['0x0000000000000000000000002f2a2543b76a4166549f7aab2e75bef0aefc5b0f000000000000000000000000af88d065e77c8cc2239327c5edb3a432268e583100000000000000000000000000000000000000000000000000000000000186b70000000000000000000000000000000000000000000000000000000000000000'],
          [getAssetInfo('WBTC', ChainId.Arbitrum).address, getAssetInfo('USDC', ChainId.Arbitrum).address, 0.00100023, RatioState.OVER]
        ],
      ];

      examples.forEach(([expected, actual]) => {
        it(`Given ${actual} should return expected value: ${expected}`, () => {
          expect(sparkQuotePriceTrigger.encode(...actual)).to.eql(expected);
        });
      });
    });

    describe('decode()', () => {
      const examples: Array<[{ baseTokenAddress: EthereumAddress, quoteTokenAddress: EthereumAddress, price: string, ratioState: RatioState }, TriggerData]> = [
        [
          {
            baseTokenAddress: web3Utils.toChecksumAddress(getAssetInfo('DAI', ChainId.Ethereum).address),
            quoteTokenAddress: web3Utils.toChecksumAddress(getAssetInfo('wstETH', ChainId.Ethereum).address),
            price: '0.0004321',
            ratioState: RatioState.UNDER,
          },
          ['0x0000000000000000000000006b175474e89094c44da98b954eedeac495271d0f0000000000000000000000007f39c581f595b53c5cb19bd0b3f8da6c935e2ca0000000000000000000000000000000000000000000000000000000000000a8ca0000000000000000000000000000000000000000000000000000000000000001'],
        ],
        [
          {
            baseTokenAddress: web3Utils.toChecksumAddress(getAssetInfo('WBTC', ChainId.Arbitrum).address),
            quoteTokenAddress: web3Utils.toChecksumAddress(getAssetInfo('USDC', ChainId.Arbitrum).address),
            price: '0.00100023',
            ratioState: RatioState.OVER,
          },
          ['0x0000000000000000000000002f2a2543b76a4166549f7aab2e75bef0aefc5b0f000000000000000000000000af88d065e77c8cc2239327c5edb3a432268e583100000000000000000000000000000000000000000000000000000000000186b70000000000000000000000000000000000000000000000000000000000000000'],
        ]
      ];

      examples.forEach(([expected, actual]) => {
        it(`Given ${actual} should return expected value: ${JSON.stringify(expected)}`, () => {
          expect(sparkQuotePriceTrigger.decode(actual)).to.eql(expected);
        });
      });
    });
  });

  describe('When testing triggerService.curveUsdBorrowRateTrigger', () => {
    describe('encode()', () => {
      const examples: Array<[[string], [market: EthereumAddress, targetRate: string, rateState: RatioState]]> = [
        [
          ['0x0000000000000000000000000031d218133afab8c2b819b1066c7e434ad91e9c000000000000000000000000000000000000000000000000000000005c3744c40000000000000000000000000000000000000000000000000000000000000001'],
          [web3Utils.toChecksumAddress('0x0031d218133AFaB8c2B819B1066c7E434Ad91E9c'), '5', RatioState.UNDER]
        ],
        [
          ['0x0000000000000000000000000031d318133afab8c2b819b1066c7e434ad91e9c0000000000000000000000000000000000000000000000000000000037de1dae0000000000000000000000000000000000000000000000000000000000000000'],
          [web3Utils.toChecksumAddress('0x0031d318133AFaB8c2B819B1066c7E434Ad91E9c'), '3', RatioState.OVER]
        ],
      ];

      examples.forEach(([expected, actual]) => {
        it(`Given ${actual} should return expected value: ${expected}`, () => {
          expect(curveUsdBorrowRateTrigger.encode(...actual)).to.eql(expected);
        });
      });
    });

    describe('decode()', () => {
      const examples: Array<[{ market: EthereumAddress, targetRate: string, rateState: RatioState }, TriggerData]> = [
        [
          {
            market: web3Utils.toChecksumAddress('0x0031d218133AFaB8c2B819B1066c7E434Ad91E9c'),
            // Because of precision of reverse engineered rate we can't get exact number
            targetRate: '4.9999999977932344260462314517997495470601974794180145018256513213117735079327887085499910715825462',
            rateState: RatioState.UNDER,
          },
          ['0x0000000000000000000000000031d218133afab8c2b819b1066c7e434ad91e9c000000000000000000000000000000000000000000000000000000005c3744c40000000000000000000000000000000000000000000000000000000000000001'],
        ],
        [
          {
            market: web3Utils.toChecksumAddress('0x0031d318133AFaB8c2B819B1066c7E434Ad91E9c'),
            // Because of precision of reverse engineered rate we can't get exact number
            targetRate: '2.999999998802635853596007720123861222767915626254160712723033189270277420764438661596057080730334',
            rateState: RatioState.OVER,
          },
          ['0x0000000000000000000000000031d318133afab8c2b819b1066c7e434ad91e9c0000000000000000000000000000000000000000000000000000000037de1dae0000000000000000000000000000000000000000000000000000000000000000'],
        ],
      ];

      examples.forEach(([expected, actual]) => {
        it(`Given ${actual} should return expected value: ${JSON.stringify(expected)}`, () => {
          expect(curveUsdBorrowRateTrigger.decode(actual)).to.eql(expected);
        });
      });
    });
  });

  describe('When testing triggerService.curveUsdSoftLiquidationTrigger', () => {
    describe('encode()', () => {
      const examples: Array<[[string], [market: EthereumAddress, market: EthereumAddress, percentage: string]]> = [
        [
          ['0x0000000000000000000000000031d218133afab8c2a819b1066c7e434ad91e9c0000000000000000000000001031d218133afab8c2b819b1366c7e434ad91e9c00000000000000000000000000000000000000000000000000b1a2bc2ec50000'],
          [web3Utils.toChecksumAddress('0x0031d218133AFaB8c2a819B1066c7E434Ad91E9c'), web3Utils.toChecksumAddress('0x1031d218133AFaB8c2B819B1366c7E434Ad91E9c'), '5']
        ],
        [
          ['0x0000000000000000000000000031d218233afab8c2a819b1066c7e434ad91e9c0000000000000000000000001031d218133afab8c2b819b1366c7e434ad91e9c0000000000000000000000000000000000000000000000001298a2e67f060000'],
          [web3Utils.toChecksumAddress('0x0031d218233AFaB8c2a819B1066c7E434Ad91E9c'), web3Utils.toChecksumAddress('0x1031d218133AFaB8c2B819B1366c7E434Ad91E9c'), '134']
        ],
      ];

      examples.forEach(([expected, actual]) => {
        it(`Given ${actual} should return expected value: ${expected}`, () => {
          expect(curveUsdSoftLiquidationTrigger.encode(...actual)).to.eql(expected);
        });
      });
    });

    describe('decode()', () => {
      const examples: Array<[{ market: EthereumAddress, owner: EthereumAddress, percentage: string }, TriggerData]> = [
        [
          {
            market: web3Utils.toChecksumAddress('0x0031d218133AFaB8c2a819B1066c7E434Ad91E9c'),
            owner: web3Utils.toChecksumAddress('0x1031d218133AFaB8c2B819B1366c7E434Ad91E9c'),
            percentage: '5',
          },
          ['0x0000000000000000000000000031d218133afab8c2a819b1066c7e434ad91e9c0000000000000000000000001031d218133afab8c2b819b1366c7e434ad91e9c00000000000000000000000000000000000000000000000000b1a2bc2ec50000'],
        ],
        [
          {
            market: web3Utils.toChecksumAddress('0x0031d218233AFaB8c2a819B1066c7E434Ad91E9c'),
            owner: web3Utils.toChecksumAddress('0x1031d218133AFaB8c2B819B1366c7E434Ad91E9c'),
            percentage: '134',
          },
          ['0x0000000000000000000000000031d218233afab8c2a819b1066c7e434ad91e9c0000000000000000000000001031d218133afab8c2b819b1366c7e434ad91e9c0000000000000000000000000000000000000000000000001298a2e67f060000'],
        ],
      ];

      examples.forEach(([expected, actual]) => {
        it(`Given ${actual} should return expected value: ${JSON.stringify(expected)}`, () => {
          expect(curveUsdSoftLiquidationTrigger.decode(actual)).to.eql(expected);
        });
      });
    });
  });
  describe('When testing triggerService.crvUSDRatioTrigger', () => {
    describe('encode()', () => {
      const examples: Array<[[string], [owner: EthereumAddress, controller: EthereumAddress, ratioPercentage: number, ratioState: RatioState]]> = [
        [
          ['0x0000000000000000000000001031d218133afab8c2b819b1366c7e434ad91e9c000000000000000000000000a920de414ea4ab66b97da1bfe9e6eca7d421963500000000000000000000000000000000000000000000000010a741a4627800000000000000000000000000000000000000000000000000000000000000000001'],
          [web3Utils.toChecksumAddress('0x1031d218133AFaB8c2B819B1366c7E434Ad91E9c'), web3Utils.toChecksumAddress('0xa920de414ea4ab66b97da1bfe9e6eca7d4219635'), 120, RatioState.UNDER]
        ],
        [
          ['0x0000000000000000000000000043d218133afab8f2b829b106633e434ad94e2c000000000000000000000000a920de414ea4ab66b97da1bfe9e6eca7d42196350000000000000000000000000000000000000000000000001bc16d674ec800000000000000000000000000000000000000000000000000000000000000000000'],
          [web3Utils.toChecksumAddress('0x0043d218133AFaB8F2B829B106633E434Ad94E2c'), web3Utils.toChecksumAddress('0xa920de414ea4ab66b97da1bfe9e6eca7d4219635'), 200, RatioState.OVER]
        ],
      ];
      examples.forEach(([expected, actual]) => {
        it(`Given ${actual} should return expected value: ${JSON.stringify(expected)}`, () => {
          expect(crvUSDRatioTrigger.encode(...actual)).to.eql(expected);
        });
      });
    });
    describe('decode()', () => {
      const examples: Array<[{ owner: EthereumAddress, controller: EthereumAddress, ratio: number, ratioState: RatioState }, TriggerData]> = [
        [
          { owner: web3Utils.toChecksumAddress('0x1031d218133AFaB8c2B819B1366c7E434Ad91E9c'), controller: web3Utils.toChecksumAddress('0xa920de414ea4ab66b97da1bfe9e6eca7d4219635'), ratio: 120, ratioState: RatioState.UNDER },
          ['0x0000000000000000000000001031d218133afab8c2b819b1366c7e434ad91e9c000000000000000000000000a920de414ea4ab66b97da1bfe9e6eca7d421963500000000000000000000000000000000000000000000000010a741a4627800000000000000000000000000000000000000000000000000000000000000000001'],
        ],
        [
          { owner: web3Utils.toChecksumAddress('0x0043d218133AFaB8F2B829B106633E434Ad94E2c'), controller: web3Utils.toChecksumAddress('0xa920de414ea4ab66b97da1bfe9e6eca7d4219635'), ratio: 200, ratioState: RatioState.OVER },
          ['0x0000000000000000000000000043d218133afab8f2b829b106633e434ad94e2c000000000000000000000000a920de414ea4ab66b97da1bfe9e6eca7d42196350000000000000000000000000000000000000000000000001bc16d674ec800000000000000000000000000000000000000000000000000000000000000000000'],
        ],
      ];

      examples.forEach(([expected, actual]) => {
        it(`Given ${actual} should return expected value: ${JSON.stringify(expected)}`, () => {
          expect(crvUSDRatioTrigger.decode(actual)).to.eql(expected);
        });
      });
    });
  });

  describe('When testing triggerService.crvUsdHealthRatioTrigger', () => {
    describe('encode()', () => {
      const examples: Array<[[string], [owner: EthereumAddress, controller: EthereumAddress, ratioPercentage: number]]> = [
        [
          ['0x0000000000000000000000007a2af22ba3276108cd331c8985ef9528e10a871a000000000000000000000000a920de414ea4ab66b97da1bfe9e6eca7d421963500000000000000000000000000000000000000000000000002c68af0bb140000'],
          [web3Utils.toChecksumAddress('0x7a2af22ba3276108cd331c8985ef9528e10a871a'), web3Utils.toChecksumAddress('0xa920de414ea4ab66b97da1bfe9e6eca7d4219635'), 20]
        ]
      ];
      examples.forEach(([expected, actual]) => {
        it(`Given ${actual} should return expected value: ${JSON.stringify(expected)}`, () => {
          expect(crvUsdHealthRatioTrigger.encode(...actual)).to.eql(expected);
        });
      });
    });
    describe('decode()', () => {
      const examples: Array<[{ owner: EthereumAddress, controller: EthereumAddress, ratio: number }, TriggerData]> = [
        [
          { owner: web3Utils.toChecksumAddress('0x7a2af22ba3276108cd331c8985ef9528e10a871a'), controller: web3Utils.toChecksumAddress('0xa920de414ea4ab66b97da1bfe9e6eca7d4219635'), ratio: 20 },
          ['0x0000000000000000000000007a2af22ba3276108cd331c8985ef9528e10a871a000000000000000000000000a920de414ea4ab66b97da1bfe9e6eca7d421963500000000000000000000000000000000000000000000000002c68af0bb140000'],
        ],
      ];
      examples.forEach(([expected, actual]) => {
        it(`Given ${actual} should return expected value: ${JSON.stringify(expected)}`, () => {
          expect(crvUsdHealthRatioTrigger.decode(actual)).to.eql(expected);
        });
      });
    });
  });

  describe('When testing triggerService.morphoBlueRatioTrigger', () => {
    describe('encode()', () => {
      const examples: Array<[[string], [marketId: string, owner: EthereumAddress, ratioPercentage: number, ratioState: RatioState]]> = [
        [
          ['0xc54d7acf14de29e0e5527cabd7a576506870346a78a11a6762e2cca66322ec410000000000000000000000001031d218133afab8c2b819b1366c7e434ad91e9c00000000000000000000000000000000000000000000000010a741a4627800000000000000000000000000000000000000000000000000000000000000000001'],
          ['0xc54d7acf14de29e0e5527cabd7a576506870346a78a11a6762e2cca66322ec41', web3Utils.toChecksumAddress('0x1031d218133AFaB8c2B819B1366c7E434Ad91E9c'), 120, RatioState.UNDER]
        ],
        [
          ['0xb323495f7e4148be5643a4ea4a8221eef163e4bccfdedc2a6f4696baacbc86cc0000000000000000000000000043d218133afab8f2b829b106633e434ad94e2c0000000000000000000000000000000000000000000000001bc16d674ec800000000000000000000000000000000000000000000000000000000000000000000'],
          ['0xb323495f7e4148be5643a4ea4a8221eef163e4bccfdedc2a6f4696baacbc86cc', web3Utils.toChecksumAddress('0x0043d218133AFaB8F2B829B106633E434Ad94E2c'), 200, RatioState.OVER]
        ],
      ];
      examples.forEach(([expected, actual]) => {
        it(`Given ${actual} should return expected value: ${JSON.stringify(expected)}`, () => {
          expect(morphoBlueRatioTrigger.encode(...actual)).to.eql(expected);
        });
      });
    });
    describe('decode()', () => {
      const examples: Array<[{ marketId: string, owner: EthereumAddress, ratio: number, ratioState: RatioState }, TriggerData]> = [
        [
          { marketId: '0xc54d7acf14de29e0e5527cabd7a576506870346a78a11a6762e2cca66322ec41', owner: web3Utils.toChecksumAddress('0x1031d218133AFaB8c2B819B1366c7E434Ad91E9c'), ratio: 120, ratioState: RatioState.UNDER },
          ['0xc54d7acf14de29e0e5527cabd7a576506870346a78a11a6762e2cca66322ec410000000000000000000000001031d218133afab8c2b819b1366c7e434ad91e9c00000000000000000000000000000000000000000000000010a741a4627800000000000000000000000000000000000000000000000000000000000000000001'],
        ],
        [
          { marketId: '0xb323495f7e4148be5643a4ea4a8221eef163e4bccfdedc2a6f4696baacbc86cc', owner: web3Utils.toChecksumAddress('0x0043d218133AFaB8F2B829B106633E434Ad94E2c'), ratio: 200, ratioState: RatioState.OVER },
          ['0xb323495f7e4148be5643a4ea4a8221eef163e4bccfdedc2a6f4696baacbc86cc0000000000000000000000000043d218133afab8f2b829b106633e434ad94e2c0000000000000000000000000000000000000000000000001bc16d674ec800000000000000000000000000000000000000000000000000000000000000000000'],
        ],
      ];

      examples.forEach(([expected, actual]) => {
        it(`Given ${actual} should return expected value: ${JSON.stringify(expected)}`, () => {
          expect(morphoBlueRatioTrigger.decode(actual)).to.eql(expected);
        });
      });
    });
  });

  describe('When testing triggerService.compoundV3PriceTrigger', () => {
    describe('encode()', () => {
      const examples: Array<[[string], [market: EthereumAddress, collToken: EthereumAddress, user: EthereumAddress, price: number, priceState: RatioState]]> = [
        [
          ['0x000000000000000000000000c3d688b66703497daa19211eedff47f25384cdc3000000000000000000000000c02aaa39b223fe8d0a0e5c4f27ead9083c756cc20000000000000000000000009a959b9ee2847a66a5a3d43fd1ec38a4f07775030000000000000000000000000000000000000000000000000000002e90edd0000000000000000000000000000000000000000000000000000000000000000001'],
          [web3Utils.toChecksumAddress('0xc3d688B66703497DAA19211EEdff47f25384cdc3'), web3Utils.toChecksumAddress('0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2'), web3Utils.toChecksumAddress('0x9a959B9ee2847a66A5A3d43Fd1Ec38a4f0777503'), 2000, RatioState.UNDER]
        ],
        [
          ['0x000000000000000000000000c3d688b66703497daa19211eedff47f25384cdc3000000000000000000000000c02aaa39b223fe8d0a0e5c4f27ead9083c756cc20000000000000000000000009a959b9ee2847a66a5a3d43fd1ec38a4f077750300000000000000000000000000000000000000000000000000000045d964b8000000000000000000000000000000000000000000000000000000000000000000'],
          [web3Utils.toChecksumAddress('0xc3d688B66703497DAA19211EEdff47f25384cdc3'), web3Utils.toChecksumAddress('0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2'), web3Utils.toChecksumAddress('0x9a959B9ee2847a66A5A3d43Fd1Ec38a4f0777503'), 3000, RatioState.OVER]
        ],
      ];

      examples.forEach(([expected, actual]) => {
        it(`Given ${actual} should return expected value: ${expected}`, () => {
          expect(compoundV3PriceTrigger.encode(...actual)).to.eql(expected);
        });
      });
    });

    describe('decode()', () => {
      const examples: Array<[{ market: EthereumAddress, collToken: EthereumAddress, user: EthereumAddress, price: string, priceState: RatioState }, TriggerData]> = [
        [
          {
            market: web3Utils.toChecksumAddress('0xc3d688B66703497DAA19211EEdff47f25384cdc3'),
            collToken: web3Utils.toChecksumAddress('0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2'),
            user: web3Utils.toChecksumAddress('0x9a959B9ee2847a66A5A3d43Fd1Ec38a4f0777503'),
            price: '2000',
            priceState: RatioState.UNDER,
          },
          ['0x000000000000000000000000c3d688b66703497daa19211eedff47f25384cdc3000000000000000000000000c02aaa39b223fe8d0a0e5c4f27ead9083c756cc20000000000000000000000009a959b9ee2847a66a5a3d43fd1ec38a4f07775030000000000000000000000000000000000000000000000000000002e90edd0000000000000000000000000000000000000000000000000000000000000000001'],
        ],
        [
          {
            market: web3Utils.toChecksumAddress('0xc3d688B66703497DAA19211EEdff47f25384cdc3'),
            collToken: web3Utils.toChecksumAddress('0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2'),
            user: web3Utils.toChecksumAddress('0x9a959B9ee2847a66A5A3d43Fd1Ec38a4f0777503'),
            price: '3000',
            priceState: RatioState.OVER,
          },
          ['0x000000000000000000000000c3d688b66703497daa19211eedff47f25384cdc3000000000000000000000000c02aaa39b223fe8d0a0e5c4f27ead9083c756cc20000000000000000000000009a959b9ee2847a66a5a3d43fd1ec38a4f077750300000000000000000000000000000000000000000000000000000045d964b8000000000000000000000000000000000000000000000000000000000000000000'],
        ],
      ];

      examples.forEach(([expected, actual]) => {
        it(`Given ${actual} should return expected value: ${JSON.stringify(expected)}`, () => {
          expect(compoundV3PriceTrigger.decode(actual)).to.eql(expected);
        });
      });
    });
  });

  describe('When testing triggerService.compoundV3PriceRangeTrigger', () => {
    describe('encode()', () => {
      const examples: Array<[[string], [market: EthereumAddress, collToken: EthereumAddress, lowerPrice: number, upperPrice: number]]> = [
        [
          ['0x000000000000000000000000c3d688b66703497daa19211eedff47f25384cdc3000000000000000000000000c02aaa39b223fe8d0a0e5c4f27ead9083c756cc200000000000000000000000000000000000000000000000000000022ecb25c000000000000000000000000000000000000000000000000000000005d21dba000'],
          [web3Utils.toChecksumAddress('0xc3d688B66703497DAA19211EEdff47f25384cdc3'), web3Utils.toChecksumAddress('0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2'), 1500, 4000]
        ],
        [
          ['0x000000000000000000000000c3d688b66703497daa19211eedff47f25384cdc3000000000000000000000000c02aaa39b223fe8d0a0e5c4f27ead9083c756cc20000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000746a528800'],
          [web3Utils.toChecksumAddress('0xc3d688B66703497DAA19211EEdff47f25384cdc3'), web3Utils.toChecksumAddress('0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2'), 0, 5000]
        ],
      ];

      examples.forEach(([expected, actual]) => {
        it(`Given ${actual} should return expected value: ${expected}`, () => {
          expect(compoundV3PriceRangeTrigger.encode(...actual)).to.eql(expected);
        });
      });
    });

    describe('decode()', () => {
      const examples: Array<[{ market: EthereumAddress, collToken: EthereumAddress, lowerPrice: string, upperPrice: string }, TriggerData]> = [
        [
          {
            market: web3Utils.toChecksumAddress('0xc3d688B66703497DAA19211EEdff47f25384cdc3'),
            collToken: web3Utils.toChecksumAddress('0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2'),
            lowerPrice: '1500',
            upperPrice: '4000',
          },
          ['0x000000000000000000000000c3d688b66703497daa19211eedff47f25384cdc3000000000000000000000000c02aaa39b223fe8d0a0e5c4f27ead9083c756cc200000000000000000000000000000000000000000000000000000022ecb25c000000000000000000000000000000000000000000000000000000005d21dba000'],
        ],
        [
          {
            market: web3Utils.toChecksumAddress('0xc3d688B66703497DAA19211EEdff47f25384cdc3'),
            collToken: web3Utils.toChecksumAddress('0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2'),
            lowerPrice: '0',
            upperPrice: '5000',
          },
          ['0x000000000000000000000000c3d688b66703497daa19211eedff47f25384cdc3000000000000000000000000c02aaa39b223fe8d0a0e5c4f27ead9083c756cc20000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000746a528800'],
        ],
      ];

      examples.forEach(([expected, actual]) => {
        it(`Given ${actual} should return expected value: ${JSON.stringify(expected)}`, () => {
          expect(compoundV3PriceRangeTrigger.decode(actual)).to.eql(expected);
        });
      });
    });
  });
});
