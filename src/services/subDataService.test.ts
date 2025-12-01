import Dec from 'decimal.js';
import { expect } from 'chai';
import { getAssetInfo } from '@defisaver/tokens';
import * as web3Utils from 'web3-utils';
import { MAXUINT } from '@defisaver/tokens';

import { ChainId, CloseStrategyType, OrderType, RatioState } from '../types/enums';
import type { EthereumAddress, SubData } from '../types';

import '../configuration';
import * as subDataService from './subDataService';

describe('Feature: subDataService.ts', () => {

  describe('When testing subDataService.makerRepayFromSavingsSubData', () => {
    describe('encode()', () => {
      const examples: Array<[SubData, [vaultId: number, targetRatioPercentage: number, chainId: ChainId, daiAddr?: EthereumAddress, mcdCdpManagerAddr?: EthereumAddress]]> = [
        [
          [
            '0x000000000000000000000000000000000000000000000000000000000000007b', '0x00000000000000000000000000000000000000000000000010a741a462780000',
            '0x0000000000000000000000006b175474e89094c44da98b954eedeac495271d0f', '0x0000000000000000000000002f39d218133afab8f2b819b1066c7e434ad94e9e',
          ],
          [123, 120, ChainId.Ethereum, web3Utils.toChecksumAddress(getAssetInfo('DAI', ChainId.Ethereum).address), web3Utils.toChecksumAddress('0x2f39d218133AFaB8F2B819B1066c7E434Ad94E9e')]
        ],
      ];

      examples.forEach(([expected, actual]) => {
        it(`Given ${actual} should return expected value: ${expected}`, () => {
          expect(subDataService.makerRepayFromSavingsSubData.encode(...actual)).to.eql(expected);
        });
      });
    });

    describe('decode()', () => {
      const examples: Array<[{ vaultId: number, daiAddr: string, mcdManagerAddr: string, targetRatio: number }, SubData]> = [
        [
          {
            vaultId: 123,
            daiAddr: web3Utils.toChecksumAddress(getAssetInfo('DAI', ChainId.Ethereum).address),
            mcdManagerAddr: web3Utils.toChecksumAddress('0x2f39d218133AFaB8F2B819B1066c7E434Ad94E9e'),
            targetRatio: 120,
          },
          [
            '0x000000000000000000000000000000000000000000000000000000000000007b', '0x00000000000000000000000000000000000000000000000010a741a462780000',
            '0x0000000000000000000000006b175474e89094c44da98b954eedeac495271d0f', '0x0000000000000000000000002f39d218133afab8f2b819b1066c7e434ad94e9e',
          ],
        ],
      ];

      examples.forEach(([expected, actual]) => {
        it(`Given ${actual} should return expected value: ${JSON.stringify(expected)}`, () => {
          expect(subDataService.makerRepayFromSavingsSubData.decode(actual)).to.eql(expected);
        });
      });
    });
  });

  describe('When testing subDataService.liquityRepayFromSavingsSubData', () => {
    describe('decode()', () => {
      const examples: Array<[{ targetRatio: number }, SubData]> = [
        [
          { targetRatio: 120 },
          [
            '0x0000000000000000000000000000000000000000000000000000000000000000', '0x00000000000000000000000000000000000000000000000010a741a462780000',
            '0x0000000000000000000000000000000000000000000000000000000000000000', '0x0000000000000000000000000000000000000000000000000000000000000000',
          ],
        ],
      ];

      examples.forEach(([expected, actual]) => {
        it(`Given ${actual} should return expected value: ${JSON.stringify(expected)}`, () => {
          expect(subDataService.liquityRepayFromSavingsSubData.decode(actual)).to.eql(expected);
        });
      });
    });
  });

  describe('When testing subDataService.makerCloseSubData', () => {
    describe('encode()', () => {
      const examples: Array<[SubData, [vaultId: number, closeToAssetAddr: EthereumAddress, chainId: ChainId, daiAddr?: EthereumAddress, mcdCdpManagerAddr?: EthereumAddress]]> = [
        [
          [
            '0x0000000000000000000000000000000000000000000000000000000000000141', '0x000000000000000000000000c02aaa39b223fe8d0a0e5c4f27ead9083c756cc2',
            '0x0000000000000000000000006b175474e89094c44da98b954eedeac495271d0f', '0x0000000000000000000000002f39d218133afab8f2b819b1066c7e434ad94e9e',
          ],
          [321, web3Utils.toChecksumAddress(getAssetInfo('WETH', ChainId.Ethereum).address), ChainId.Ethereum, web3Utils.toChecksumAddress(getAssetInfo('DAI', ChainId.Ethereum).address), web3Utils.toChecksumAddress('0x2f39d218133AFaB8F2B819B1066c7E434Ad94E9e')]
        ],
        [
          [
            '0x00000000000000000000000000000000000000000000000000000000000001a4', '0x0000000000000000000000002260fac5e5542a773aa44fbcfedf7c193bc2c599',
            '0x0000000000000000000000006b175474e89094c44da98b954eedeac495271d0f', '0x0000000000000000000000002439d218133afab8f2b819b1066c7e434ad94e9e',
          ],
          [420, web3Utils.toChecksumAddress(getAssetInfo('WBTC', ChainId.Ethereum).address), ChainId.Ethereum, web3Utils.toChecksumAddress(getAssetInfo('DAI', ChainId.Ethereum).address), web3Utils.toChecksumAddress('0x2439d218133AFaB8F2B819B1066c7E434Ad94E9e')]
        ],
      ];

      examples.forEach(([expected, actual]) => {
        it(`Given ${actual} should return expected value: ${expected}`, () => {
          expect(subDataService.makerCloseSubData.encode(...actual)).to.eql(expected);
        });
      });
    });

    describe('decode()', () => {
      const examples: Array<[{ vaultId: number, closeToAssetAddr: EthereumAddress }, SubData]> = [
        [
          {
            vaultId: 321,
            closeToAssetAddr: web3Utils.toChecksumAddress(getAssetInfo('WETH', ChainId.Ethereum).address),
          },
          [
            '0x0000000000000000000000000000000000000000000000000000000000000141', '0x000000000000000000000000c02aaa39b223fe8d0a0e5c4f27ead9083c756cc2',
            '0x0000000000000000000000006b175474e89094c44da98b954eedeac495271d0f', '0x0000000000000000000000002f39d218133afab8f2b819b1066c7e434ad94e9e',
          ],
        ],
        [
          {
            vaultId: 420,
            closeToAssetAddr: web3Utils.toChecksumAddress(getAssetInfo('WBTC', ChainId.Ethereum).address),
          },
          [
            '0x00000000000000000000000000000000000000000000000000000000000001a4', '0x0000000000000000000000002260fac5e5542a773aa44fbcfedf7c193bc2c599',
            '0x0000000000000000000000006b175474e89094c44da98b954eedeac495271d0f', '0x0000000000000000000000002439d218133afab8f2b819b1066c7e434ad94e9e',
          ],
        ],
      ];

      examples.forEach(([expected, actual]) => {
        it(`Given ${actual} should return expected value: ${JSON.stringify(expected)}`, () => {
          expect(subDataService.makerCloseSubData.decode(actual)).to.eql(expected);
        });
      });
    });
  });

  describe('When testing subDataService.makerLeverageManagementSubData', () => {
    describe('decode()', () => {
      const examples: Array<[{ vaultId: number, targetRatio: number }, SubData]> = [
        [
          { vaultId: 321, targetRatio: 200 },
          [
            '0x0000000000000000000000000000000000000000000000000000000000000141', '0x0000000000000000000000000000000000000000000000001bc16d674ec80000',
            '0x0000000000000000000000000000000000000000000000000000000000000000', '0x0000000000000000000000000000000000000000000000000000000000000000',
          ],
        ],
      ];

      examples.forEach(([expected, actual]) => {
        it(`Given ${actual} should return expected value: ${JSON.stringify(expected)}`, () => {
          expect(subDataService.makerLeverageManagementSubData.decode(actual)).to.eql(expected);
        });
      });
    });
  });

  describe('When testing subDataService.liquityLeverageManagementSubData', () => {
    describe('decode()', () => {
      const examples: Array<[{ targetRatio: number }, SubData]> = [
        [
          { targetRatio: 200 },
          [
            '0x0000000000000000000000000000000000000000000000000000000000000000', '0x0000000000000000000000000000000000000000000000001bc16d674ec80000',
            '0x0000000000000000000000000000000000000000000000000000000000000000', '0x0000000000000000000000000000000000000000000000000000000000000000',
          ],
        ],
      ];

      examples.forEach(([expected, actual]) => {
        it(`Given ${actual} should return expected value: ${JSON.stringify(expected)}`, () => {
          expect(subDataService.liquityLeverageManagementSubData.decode(actual)).to.eql(expected);
        });
      });
    });
  });

  describe('When testing subDataService.liquityCloseSubData', () => {
    describe('encode()', () => {
      const examples: Array<[SubData, [closeToAssetAddr: EthereumAddress, chainId: ChainId, collAddr?: EthereumAddress, debtAddr?: EthereumAddress]]> = [
        [
          [
            '0x000000000000000000000000c02aaa39b223fe8d0a0e5c4f27ead9083c756cc2', '0x0000000000000000000000005f98805a4e8be255a32880fdec7f6728c6568ba0',
          ],
          [web3Utils.toChecksumAddress(getAssetInfo('LUSD', ChainId.Ethereum).address), ChainId.Ethereum, web3Utils.toChecksumAddress(getAssetInfo('WETH', ChainId.Ethereum).address), web3Utils.toChecksumAddress(getAssetInfo('LUSD', ChainId.Ethereum).address)]
        ],
        [
          [
            '0x000000000000000000000000c02aaa39b223fe8d0a0e5c4f27ead9083c756cc2', '0x0000000000000000000000005f98805a4e8be255a32880fdec7f6728c6568ba0',
          ],
          [web3Utils.toChecksumAddress(getAssetInfo('LUSD', ChainId.Ethereum).address), ChainId.Ethereum]
        ],
      ];

      examples.forEach(([expected, actual]) => {
        it(`Given ${actual} should return expected value: ${expected}`, () => {
          expect(subDataService.liquityCloseSubData.encode(...actual)).to.eql(expected);
        });
      });
    });

    describe('decode()', () => {
      const examples: Array<[{ closeToAssetAddr: EthereumAddress, debtAddr: string }, SubData]> = [
        [
          {
            closeToAssetAddr: web3Utils.toChecksumAddress(getAssetInfo('LUSD', ChainId.Ethereum).address),
            debtAddr: web3Utils.toChecksumAddress(getAssetInfo('LUSD', ChainId.Ethereum).address),
          },
          [
            '0x0000000000000000000000005f98805a4e8be255a32880fdec7f6728c6568ba0', '0x0000000000000000000000005f98805a4e8be255a32880fdec7f6728c6568ba0',
          ],
        ],
        [
          {
            closeToAssetAddr: web3Utils.toChecksumAddress(getAssetInfo('WETH', ChainId.Ethereum).address),
            debtAddr: web3Utils.toChecksumAddress(getAssetInfo('LUSD', ChainId.Ethereum).address),
          },
          [
            '0x000000000000000000000000c02aaa39b223fe8d0a0e5c4f27ead9083c756cc2', '0x0000000000000000000000005f98805a4e8be255a32880fdec7f6728c6568ba0',
          ],
        ],
      ];

      examples.forEach(([expected, actual]) => {
        it(`Given ${actual} should return expected value: ${JSON.stringify(expected)}`, () => {
          expect(subDataService.liquityCloseSubData.decode(actual)).to.eql(expected);
        });
      });
    });
  });

  describe('When testing subDataService.aaveV2LeverageManagementSubData', () => {
    describe('encode()', () => {
      const examples: Array<[[string, string, string, string, boolean], [triggerRepayRatio: number, triggerBoostRatio: number, targetBoostRatio: number, targetRepayRatio: number, boostEnabled: boolean]]> = [
        [
          [new Dec(160).mul(1e16).toString(), new Dec(220).mul(1e16).toString(), new Dec(180).mul(1e16).toString(), new Dec(190).mul(1e16).toString(), true],
          [160, 220, 180, 190, true]
        ],
        [
          [new Dec(160).mul(1e16).toString(), new Dec(200).mul(1e16).toString(), new Dec(180).mul(1e16).toString(), new Dec(190).mul(1e16).toString(), false],
          [160, 200, 180, 190, false]
        ],
      ];

      examples.forEach(([expected, actual]) => {
        it(`Given ${actual} should return expected value: ${expected}`, () => {
          expect(subDataService.aaveV2LeverageManagementSubData.encode(...actual)).to.eql(expected);
        });
      });
    });

    describe('decode()', () => {
      const examples: Array<[{ targetRatio: number }, SubData]> = [
        [
          { targetRatio: 200 },
          ['0x0000000000000000000000000000000000000000000000000000000000000000', '0x0000000000000000000000000000000000000000000000001bc16d674ec80000'],
        ],
        [
          { targetRatio: 123 },
          ['0x0000000000000000000000000000000000000000000000000000000000000000', '0x0000000000000000000000000000000000000000000000001111d67bb1bb0000'],
        ],
      ];

      examples.forEach(([expected, actual]) => {
        it(`Given ${actual} should return expected value: ${JSON.stringify(expected)}`, () => {
          expect(subDataService.aaveV2LeverageManagementSubData.decode(actual)).to.eql(expected);
        });
      });
    });
  });

  describe('When testing subDataService.aaveV3LeverageManagementSubData', () => {
    describe('decode()', () => {
      const examples: Array<[{ targetRatio: number }, SubData]> = [
        [
          { targetRatio: 200 },
          ['0x0000000000000000000000000000000000000000000000001bc16d674ec80000'],
        ],
        [
          { targetRatio: 123 },
          ['0x0000000000000000000000000000000000000000000000001111d67bb1bb0000'],
        ],
      ];

      examples.forEach(([expected, actual]) => {
        it(`Given ${actual} should return expected value: ${JSON.stringify(expected)}`, () => {
          expect(subDataService.aaveV3LeverageManagementSubData.decode(actual)).to.eql(expected);
        });
      });
    });
  });

  describe('When testing subDataService.aaveV3QuotePriceSubData', () => {
    describe('encode()', () => {
      const examples: Array<[SubData, [collAsset: EthereumAddress, collAssetId: number, debtAsset: EthereumAddress, debtAssetId: number, nullAddress?: EthereumAddress]]> = [
        [
          [
            '0x000000000000000000000000c02aaa39b223fe8d0a0e5c4f27ead9083c756cc2', '0x0000000000000000000000000000000000000000000000000000000000000002',
            '0x0000000000000000000000006b175474e89094c44da98b954eedeac495271d0f', '0x0000000000000000000000000000000000000000000000000000000000000004',
            '0x0000000000000000000000000000000000000000000000000000000000000000',
          ],
          [
            web3Utils.toChecksumAddress(getAssetInfo('WETH', ChainId.Ethereum).address),
            2,
            web3Utils.toChecksumAddress(getAssetInfo('DAI', ChainId.Ethereum).address),
            4,
          ]
        ],
        [
          [
            '0x0000000000000000000000005979d7b546e38e414f7e9822514be443a4800529', '0x0000000000000000000000000000000000000000000000000000000000000006',
            '0x000000000000000000000000af88d065e77c8cc2239327c5edb3a432268e5831', '0x0000000000000000000000000000000000000000000000000000000000000002',
            '0x0000000000000000000000000000000000000000000000000000000000000000',
          ],
          [
            web3Utils.toChecksumAddress(getAssetInfo('wstETH', ChainId.Arbitrum).address),
            6,
            web3Utils.toChecksumAddress(getAssetInfo('USDC', ChainId.Arbitrum).address),
            2,
          ]
        ],
      ];

      examples.forEach(([expected, actual]) => {
        it(`Given ${actual} should return expected value: ${expected}`, () => {
          expect(subDataService.aaveV3QuotePriceSubData.encode(...actual)).to.eql(expected);
        });
      });
    });

    describe('decode()', () => {
      const examples: Array<[{ collAsset: EthereumAddress, collAssetId: number, debtAsset: EthereumAddress, debtAssetId: number }, SubData]> = [
        [
          {
            collAsset: web3Utils.toChecksumAddress(getAssetInfo('WETH', ChainId.Ethereum).address),
            collAssetId: 2,
            debtAsset: web3Utils.toChecksumAddress(getAssetInfo('DAI', ChainId.Ethereum).address),
            debtAssetId: 4,
          },
          [
            '0x000000000000000000000000c02aaa39b223fe8d0a0e5c4f27ead9083c756cc2', '0x0000000000000000000000000000000000000000000000000000000000000002',
            '0x0000000000000000000000006b175474e89094c44da98b954eedeac495271d0f', '0x0000000000000000000000000000000000000000000000000000000000000004',
            '0x0000000000000000000000000000000000000000000000000000000000000000',
          ],
        ],
        [
          {
            collAsset: web3Utils.toChecksumAddress(getAssetInfo('wstETH', ChainId.Arbitrum).address),
            collAssetId: 6,
            debtAsset: web3Utils.toChecksumAddress(getAssetInfo('USDC', ChainId.Arbitrum).address),
            debtAssetId: 2,
          },
          [
            '0x0000000000000000000000005979d7b546e38e414f7e9822514be443a4800529', '0x0000000000000000000000000000000000000000000000000000000000000006',
            '0x000000000000000000000000af88d065e77c8cc2239327c5edb3a432268e5831', '0x0000000000000000000000000000000000000000000000000000000000000002',
            '0x0000000000000000000000000000000000000000000000000000000000000000',
          ],
        ],
      ];

      examples.forEach(([expected, actual]) => {
        it(`Given ${actual} should return expected value: ${JSON.stringify(expected)}`, () => {
          expect(subDataService.aaveV3QuotePriceSubData.decode(actual)).to.eql(expected);
        });
      });
    });
  });

  describe('When testing subDataService.aaveV3CollateralSwitchSubData', () => {
    describe('encode()', () => {
      const examples: Array<[SubData, [fromAsset: EthereumAddress, fromAssetId: number, toAsset: EthereumAddress, toAssetId: number, marketAddr: EthereumAddress, amountToSwitch: string, useOnBehalf?: boolean]]> = [
        // WETH -> USDC
        [
          [
            '0x000000000000000000000000c02aaa39b223fe8d0a0e5c4f27ead9083c756cc2',
            '0x0000000000000000000000000000000000000000000000000000000000000000',
            '0x000000000000000000000000a0b86991c6218b36c1d19d4a2e9eb0ce3606eb48',
            '0x0000000000000000000000000000000000000000000000000000000000000001',
            '0x00000000000000000000000087870bca3f3fd6335c3f4ce8392d69d0b4161d39',
            '0x0000000000000000000000000000000000000000000000008ac7230489e80000',
            '0x0000000000000000000000000000000000000000000000000000000000000000',
          ],
          [
            web3Utils.toChecksumAddress(getAssetInfo('WETH', ChainId.Ethereum).address),
            0,
            web3Utils.toChecksumAddress(getAssetInfo('USDC', ChainId.Ethereum).address),
            1,
            web3Utils.toChecksumAddress('0x87870Bca3F3fD6335C3F4ce8392D69d0B4161d39'),
            '10000000000000000000', // 10 WETH
            false,
          ]
        ],
        // USDC -> WETH (MaxUint256)
        [
          [
            '0x000000000000000000000000a0b86991c6218b36c1d19d4a2e9eb0ce3606eb48',
            '0x0000000000000000000000000000000000000000000000000000000000000001',
            '0x000000000000000000000000c02aaa39b223fe8d0a0e5c4f27ead9083c756cc2',
            '0x0000000000000000000000000000000000000000000000000000000000000000',
            '0x00000000000000000000000087870bca3f3fd6335c3f4ce8392d69d0b4161d39',
            '0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff',
            '0x0000000000000000000000000000000000000000000000000000000000000000',
          ],
          [
            web3Utils.toChecksumAddress(getAssetInfo('USDC', ChainId.Ethereum).address),
            1,
            web3Utils.toChecksumAddress(getAssetInfo('WETH', ChainId.Ethereum).address),
            0,
            web3Utils.toChecksumAddress('0x87870Bca3F3fD6335C3F4ce8392D69d0B4161d39'),
            MAXUINT, // MaxUint256
          ]
        ],
        // WETH -> WBTC
        [
          [
            '0x000000000000000000000000c02aaa39b223fe8d0a0e5c4f27ead9083c756cc2',
            '0x0000000000000000000000000000000000000000000000000000000000000000',
            '0x0000000000000000000000002260fac5e5542a773aa44fbcfedf7c193bc2c599',
            '0x0000000000000000000000000000000000000000000000000000000000000002',
            '0x00000000000000000000000087870bca3f3fd6335c3f4ce8392d69d0b4161d39',
            '0x0000000000000000000000000000000000000000000000004563918244f40000',
            '0x0000000000000000000000000000000000000000000000000000000000000000',
          ],
          [
            web3Utils.toChecksumAddress(getAssetInfo('WETH', ChainId.Ethereum).address),
            0,
            web3Utils.toChecksumAddress(getAssetInfo('WBTC', ChainId.Ethereum).address),
            2,
            web3Utils.toChecksumAddress('0x87870Bca3F3fD6335C3F4ce8392D69d0B4161d39'),
            '5000000000000000000', // 5 WETH
          ]
        ],
      ];

      examples.forEach(([expected, actual]) => {
        it(`Given ${JSON.stringify(actual)} should return expected value: ${JSON.stringify(expected)}`, () => {
          expect(subDataService.aaveV3CollateralSwitchSubData.encode(...actual)).to.eql(expected);
        });
      });
    });

    describe('decode()', () => {
      const examples: Array<[{ fromAsset: EthereumAddress, fromAssetId: number, toAsset: EthereumAddress, toAssetId: number, marketAddr: EthereumAddress, amountToSwitch: string }, SubData]> = [
        // WETH -> USDC
        [
          {
            fromAsset: web3Utils.toChecksumAddress(getAssetInfo('WETH', ChainId.Ethereum).address),
            fromAssetId: 0,
            toAsset: web3Utils.toChecksumAddress(getAssetInfo('USDC', ChainId.Ethereum).address),
            toAssetId: 1,
            marketAddr: web3Utils.toChecksumAddress('0x87870Bca3F3fD6335C3F4ce8392D69d0B4161d39'),
            amountToSwitch: '10000000000000000000',
          },
          [
            '0x000000000000000000000000c02aaa39b223fe8d0a0e5c4f27ead9083c756cc2',
            '0x0000000000000000000000000000000000000000000000000000000000000000',
            '0x000000000000000000000000a0b86991c6218b36c1d19d4a2e9eb0ce3606eb48',
            '0x0000000000000000000000000000000000000000000000000000000000000001',
            '0x00000000000000000000000087870bca3f3fd6335c3f4ce8392d69d0b4161d39',
            '0x0000000000000000000000000000000000000000000000008ac7230489e80000',
            '0x0000000000000000000000000000000000000000000000000000000000000000',
          ],
        ],
        // USDC -> WETH (MaxUint256)
        [
          {
            fromAsset: web3Utils.toChecksumAddress(getAssetInfo('USDC', ChainId.Ethereum).address),
            fromAssetId: 1,
            toAsset: web3Utils.toChecksumAddress(getAssetInfo('WETH', ChainId.Ethereum).address),
            toAssetId: 0,
            marketAddr: web3Utils.toChecksumAddress('0x87870Bca3F3fD6335C3F4ce8392D69d0B4161d39'),
            amountToSwitch: MAXUINT,
          },
          [
            '0x000000000000000000000000a0b86991c6218b36c1d19d4a2e9eb0ce3606eb48',
            '0x0000000000000000000000000000000000000000000000000000000000000001',
            '0x000000000000000000000000c02aaa39b223fe8d0a0e5c4f27ead9083c756cc2',
            '0x0000000000000000000000000000000000000000000000000000000000000000',
            '0x00000000000000000000000087870bca3f3fd6335c3f4ce8392d69d0b4161d39',
            '0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff',
            '0x0000000000000000000000000000000000000000000000000000000000000000',
          ],
        ],
        // WETH -> WBTC
        [
          {
            fromAsset: web3Utils.toChecksumAddress(getAssetInfo('WETH', ChainId.Ethereum).address),
            fromAssetId: 0,
            toAsset: web3Utils.toChecksumAddress(getAssetInfo('WBTC', ChainId.Ethereum).address),
            toAssetId: 2,
            marketAddr: web3Utils.toChecksumAddress('0x87870Bca3F3fD6335C3F4ce8392D69d0B4161d39'),
            amountToSwitch: '5000000000000000000',
          },
          [
            '0x000000000000000000000000c02aaa39b223fe8d0a0e5c4f27ead9083c756cc2',
            '0x0000000000000000000000000000000000000000000000000000000000000000',
            '0x0000000000000000000000002260fac5e5542a773aa44fbcfedf7c193bc2c599',
            '0x0000000000000000000000000000000000000000000000000000000000000002',
            '0x00000000000000000000000087870bca3f3fd6335c3f4ce8392d69d0b4161d39',
            '0x0000000000000000000000000000000000000000000000004563918244f40000',
            '0x0000000000000000000000000000000000000000000000000000000000000000',
          ],
        ],
      ];

      examples.forEach(([expected, actual]) => {
        it(`Given ${JSON.stringify(actual)} should return expected value: ${JSON.stringify(expected)}`, () => {
          expect(subDataService.aaveV3CollateralSwitchSubData.decode(actual)).to.eql(expected);
        });
      });
    });
  });

  describe('When testing subDataService.compoundV2LeverageManagementSubData', () => {
    describe('encode()', () => {
      const examples: Array<[[string, string, string, string, boolean], [triggerRepayRatio: number, triggerBoostRatio: number, targetBoostRatio: number, targetRepayRatio: number, boostEnabled: boolean]]> = [
        [
          [new Dec(160).mul(1e16).toString(), new Dec(220).mul(1e16).toString(), new Dec(180).mul(1e16).toString(), new Dec(190).mul(1e16).toString(), true],
          [160, 220, 180, 190, true]
        ],
        [
          [new Dec(160).mul(1e16).toString(), new Dec(200).mul(1e16).toString(), new Dec(180).mul(1e16).toString(), new Dec(190).mul(1e16).toString(), false],
          [160, 200, 180, 190, false]
        ],
      ];

      examples.forEach(([expected, actual]) => {
        it(`Given ${actual} should return expected value: ${expected}`, () => {
          expect(subDataService.compoundV2LeverageManagementSubData.encode(...actual)).to.eql(expected);
        });
      });
    });

    describe('decode()', () => {
      const examples: Array<[{ targetRatio: number }, SubData]> = [
        [
          { targetRatio: 200 },
          ['0x0000000000000000000000000000000000000000000000001bc16d674ec80000'],
        ],
        [
          { targetRatio: 123 },
          ['0x0000000000000000000000000000000000000000000000001111d67bb1bb0000'],
        ],
      ];

      examples.forEach(([expected, actual]) => {
        it(`Given ${actual} should return expected value: ${JSON.stringify(expected)}`, () => {
          expect(subDataService.compoundV2LeverageManagementSubData.decode(actual)).to.eql(expected);
        });
      });
    });
  });

  describe('When testing subDataService.compoundV3LeverageManagementSubData', () => {
    describe('encode()', () => {
      const examples: Array<[[EthereumAddress, EthereumAddress, string, string, string, string, boolean, boolean], [market: EthereumAddress, baseToken: EthereumAddress, triggerRepayRatio: number, triggerBoostRatio: number, targetBoostRatio: number, targetRepayRatio: number, boostEnabled: boolean, isEOA: boolean]]> = [
        [
          [
            web3Utils.toChecksumAddress('0x1C0F620155e85491f8D35440eb17538Ca5c55212'),
            web3Utils.toChecksumAddress(getAssetInfo('USDC', ChainId.Ethereum).address),
            new Dec(160).mul(1e16).toString(),
            new Dec(220).mul(1e16).toString(),
            new Dec(180).mul(1e16).toString(),
            new Dec(190).mul(1e16).toString(),
            true, false,
          ],
          [
            web3Utils.toChecksumAddress('0x1C0F620155e85491f8D35440eb17538Ca5c55212'),
            web3Utils.toChecksumAddress(getAssetInfo('USDC', ChainId.Ethereum).address),
            160, 220, 180, 190,
            true, false,
          ]
        ],
        [
          [
            web3Utils.toChecksumAddress('0xaC0F620155e85491f8D35440eb17538Ca5c55212'),
            web3Utils.toChecksumAddress(getAssetInfo('WETH', ChainId.Ethereum).address),
            new Dec(160).mul(1e16).toString(),
            new Dec(210).mul(1e16).toString(),
            new Dec(180).mul(1e16).toString(),
            new Dec(190).mul(1e16).toString(),
            false, true,
          ],
          [
            web3Utils.toChecksumAddress('0xaC0F620155e85491f8D35440eb17538Ca5c55212'),
            web3Utils.toChecksumAddress(getAssetInfo('WETH', ChainId.Ethereum).address),
            160, 210, 180, 190,
            false, true,
          ]
        ],
      ];

      examples.forEach(([expected, actual]) => {
        it(`Given ${actual} should return expected value: ${expected}`, () => {
          expect(subDataService.compoundV3LeverageManagementSubData.encode(...actual)).to.eql(expected);
        });
      });
    });

    describe('decode()', () => {
      const examples: Array<[{ targetRatio: number }, SubData]> = [
        [
          { targetRatio: 123 },
          [
            '0x0000000000000000000000000000000000000000000000000000000000000000', '0x0000000000000000000000000000000000000000000000000000000000000000',
            '0x0000000000000000000000000000000000000000000000000000000000000000', '0x0000000000000000000000000000000000000000000000001111d67bb1bb0000',
          ],
        ],
        [
          { targetRatio: 200 },
          [
            '0x0000000000000000000000000000000000000000000000000000000000000000', '0x0000000000000000000000000000000000000000000000000000000000000000',
            '0x0000000000000000000000000000000000000000000000000000000000000000', '0x0000000000000000000000000000000000000000000000001bc16d674ec80000',
          ],
        ],
      ];

      examples.forEach(([expected, actual]) => {
        it(`Given ${actual} should return expected value: ${JSON.stringify(expected)}`, () => {
          expect(subDataService.compoundV3LeverageManagementSubData.decode(actual)).to.eql(expected);
        });
      });
    });
  });

  describe('When testing subDataService.morphoAaveV2LeverageManagementSubData', () => {
    describe('encode()', () => {
      const examples: Array<[[string, string, string, string, boolean], [triggerRepayRatio: number, triggerBoostRatio: number, targetBoostRatio: number, targetRepayRatio: number, boostEnabled: boolean]]> = [
        [
          [new Dec(160).mul(1e16).toString(), new Dec(220).mul(1e16).toString(), new Dec(180).mul(1e16).toString(), new Dec(190).mul(1e16).toString(), true],
          [160, 220, 180, 190, true]
        ],
        [
          [new Dec(160).mul(1e16).toString(), new Dec(200).mul(1e16).toString(), new Dec(180).mul(1e16).toString(), new Dec(190).mul(1e16).toString(), false],
          [160, 200, 180, 190, false]
        ],
      ];

      examples.forEach(([expected, actual]) => {
        it(`Given ${actual} should return expected value: ${expected}`, () => {
          expect(subDataService.morphoAaveV2LeverageManagementSubData.encode(...actual)).to.eql(expected);
        });
      });
    });

    describe('decode()', () => {
      const examples: Array<[{ targetRatio: number }, SubData]> = [
        [
          { targetRatio: 200 },
          ['0x0000000000000000000000000000000000000000000000000000000000000000', '0x0000000000000000000000000000000000000000000000001bc16d674ec80000'],
        ],
        [
          { targetRatio: 123 },
          ['0x0000000000000000000000000000000000000000000000000000000000000000', '0x0000000000000000000000000000000000000000000000001111d67bb1bb0000'],
        ],
      ];

      examples.forEach(([expected, actual]) => {
        it(`Given ${actual} should return expected value: ${JSON.stringify(expected)}`, () => {
          expect(subDataService.morphoAaveV2LeverageManagementSubData.decode(actual)).to.eql(expected);
        });
      });
    });
  });

  describe('When testing subDataService.cBondsRebondSubData', () => {
    describe('encode()', () => {
      const examples: Array<[SubData, [bondId: number | string]]> = [
        [
          ['0x00000000000000000000000000000000000000000000000000000000000000c8'],
          [200]
        ],
        [
          ['0x000000000000000000000000000000000000000000000000000000000000a119'],
          [41241]
        ],
      ];

      examples.forEach(([expected, actual]) => {
        it(`Given ${actual} should return expected value: ${expected}`, () => {
          expect(subDataService.cBondsRebondSubData.encode(...actual)).to.eql(expected);
        });
      });
    });

    describe('decode()', () => {
      const examples: Array<[{ bondId: string }, SubData]> = [
        [
          { bondId: '200' },
          ['0x0000000000000000000000000000000000000000000000000000000000000000', '0x00000000000000000000000000000000000000000000000000000000000000c8'],
        ],
        [
          { bondId: '41241' },
          ['0x0000000000000000000000000000000000000000000000000000000000000000', '0x000000000000000000000000000000000000000000000000000000000000a119'],
        ],
      ];

      examples.forEach(([expected, actual]) => {
        it(`Given ${actual} should return expected value: ${JSON.stringify(expected)}`, () => {
          expect(subDataService.cBondsRebondSubData.decode(actual)).to.eql(expected);
        });
      });
    });
  });

  describe('When testing subDataService.liquityPaybackUsingChickenBondSubData', () => {
    describe('encode()', () => {
      const examples: Array<[SubData, [sourceId: string, sourceType: number, chainId?: ChainId]]> = [
        [
          [
            '0x0000000000000000000000000000000000000000000000000000000000001076', '0x0000000000000000000000000000000000000000000000000000000000000000',
            '0x0000000000000000000000005f98805a4e8be255a32880fdec7f6728c6568ba0', '0x000000000000000000000000b9d7dddca9a4ac480991865efef82e01273f79c3',
          ],
          ['4214', 0, ChainId.Ethereum]
        ],
        [
          [
            '0x00000000000000000000000000000000000000000000000000000000000002b8', '0x0000000000000000000000000000000000000000000000000000000000000001',
            '0x0000000000000000000000005f98805a4e8be255a32880fdec7f6728c6568ba0', '0x000000000000000000000000b9d7dddca9a4ac480991865efef82e01273f79c3',
          ],
          ['696', 1]
        ],
      ];

      examples.forEach(([expected, actual]) => {
        it(`Given ${actual} should return expected value: ${expected}`, () => {
          expect(subDataService.liquityPaybackUsingChickenBondSubData.encode(...actual)).to.eql(expected);
        });
      });
    });

    describe('decode()', () => {
      const examples: Array<[{ sourceId: string, sourceType: string }, SubData]> = [
        [
          { sourceId: '4214', sourceType: '0' },
          [
            '0x0000000000000000000000000000000000000000000000000000000000001076', '0x0000000000000000000000000000000000000000000000000000000000000000',
            '0x0000000000000000000000005f98805a4e8be255a32880fdec7f6728c6568ba0', '0x000000000000000000000000b9d7dddca9a4ac480991865efef82e01273f79c3',
          ],
        ],
        [
          { sourceId: '696', sourceType: '1' },
          [
            '0x00000000000000000000000000000000000000000000000000000000000002b8', '0x0000000000000000000000000000000000000000000000000000000000000001',
            '0x0000000000000000000000005f98805a4e8be255a32880fdec7f6728c6568ba0', '0x000000000000000000000000b9d7dddca9a4ac480991865efef82e01273f79c3',
          ],
        ],
      ];

      examples.forEach(([expected, actual]) => {
        it(`Given ${actual} should return expected value: ${JSON.stringify(expected)}`, () => {
          expect(subDataService.liquityPaybackUsingChickenBondSubData.decode(actual)).to.eql(expected);
        });
      });
    });
  });

  describe('When testing subDataService.exchangeDcaSubData', () => {
    describe('encode()', () => {
      const examples: Array<[SubData, [fromToken: EthereumAddress, toToken: EthereumAddress, amount: string, interval: number]]> = [
        [
          [
            '0x000000000000000000000000c02aaa39b223fe8d0a0e5c4f27ead9083c756cc2', '0x0000000000000000000000006b175474e89094c44da98b954eedeac495271d0f',
            '0x0000000000000000000000000000000000000000000000000000000000000853', '0x0000000000000000000000000000000000000000000000000000000000231860'
          ],
          [
            web3Utils.toChecksumAddress(getAssetInfo('WETH', ChainId.Ethereum).address),
            web3Utils.toChecksumAddress(getAssetInfo('DAI', ChainId.Ethereum).address),
            '2131',
            2300000,
          ]
        ],
        [
          [
            '0x0000000000000000000000002f2a2543b76a4166549f7aab2e75bef0aefc5b0f', '0x000000000000000000000000f97f4df75117a78c1a5a0dbb814af92458539fb4',
            '0x00000000000000000000000000000000000000000000000000000000003eddd7', '0x0000000000000000000000000000000000000000000000000000000008f57500'
          ],
          [
            web3Utils.toChecksumAddress(getAssetInfo('WBTC', ChainId.Arbitrum).address),
            web3Utils.toChecksumAddress(getAssetInfo('LINK', ChainId.Arbitrum).address),
            '4120023',
            150304000,
          ]
        ],
      ];

      examples.forEach(([expected, actual]) => {
        it(`Given ${actual} should return expected value: ${expected}`, () => {
          expect(subDataService.exchangeDcaSubData.encode(...actual)).to.eql(expected);
        });
      });
    });

    describe('decode()', () => {
      const examples: Array<[{ fromToken: EthereumAddress, toToken: EthereumAddress, amount: string, interval: string }, [SubData, ChainId]]> = [
        [
          {
            fromToken: web3Utils.toChecksumAddress(getAssetInfo('WETH', ChainId.Ethereum).address),
            toToken: web3Utils.toChecksumAddress(getAssetInfo('DAI', ChainId.Ethereum).address),
            amount: '0.000000000000002131',
            interval: '2300000',
          },
          [
            [
              '0x000000000000000000000000c02aaa39b223fe8d0a0e5c4f27ead9083c756cc2', '0x0000000000000000000000006b175474e89094c44da98b954eedeac495271d0f',
              '0x0000000000000000000000000000000000000000000000000000000000000853', '0x0000000000000000000000000000000000000000000000000000000000231860'
            ],
            ChainId.Ethereum
          ],
        ],
        [
          {
            fromToken: web3Utils.toChecksumAddress(getAssetInfo('WBTC', ChainId.Arbitrum).address),
            toToken: web3Utils.toChecksumAddress(getAssetInfo('LINK', ChainId.Arbitrum).address),
            amount: '0.04120023',
            interval: '150304000',
          },
          [
            [
              '0x0000000000000000000000002f2a2543b76a4166549f7aab2e75bef0aefc5b0f', '0x000000000000000000000000f97f4df75117a78c1a5a0dbb814af92458539fb4',
              '0x00000000000000000000000000000000000000000000000000000000003eddd7', '0x0000000000000000000000000000000000000000000000000000000008f57500'
            ],
           ChainId.Arbitrum
          ]
        ],
      ];

      examples.forEach(([expected, actual]) => {
        it(`Given ${actual} should return expected value: ${JSON.stringify(expected)}`, () => {
          expect(subDataService.exchangeDcaSubData.decode(...actual)).to.eql(expected);
        });
      });
    });
  });

  describe('When testing subDataService.exchangeLimitOrderSubData', () => {
    describe('encode()', () => {
      const examples: Array<[[EthereumAddress, EthereumAddress, string, string, string, string], [fromToken: EthereumAddress, toToken: EthereumAddress, amount: string, targetPrice: string, goodUntil: string | number, orderType: OrderType]]> = [
        [
          [
            web3Utils.toChecksumAddress(getAssetInfo('WETH', ChainId.Ethereum).address),
            web3Utils.toChecksumAddress(getAssetInfo('DAI', ChainId.Ethereum).address),
            '2131',
            '0.53123',
            '1696590921159',
            `${OrderType.STOP_LOSS}`
          ],
          [
            web3Utils.toChecksumAddress(getAssetInfo('WETH', ChainId.Ethereum).address),
            web3Utils.toChecksumAddress(getAssetInfo('DAI', ChainId.Ethereum).address),
            '2131',
            '0.53123',
            1696590921159,
            OrderType.STOP_LOSS
          ]
        ],
        [
          [
            web3Utils.toChecksumAddress(getAssetInfo('LINK', ChainId.Arbitrum).address),
            web3Utils.toChecksumAddress(getAssetInfo('USDC', ChainId.Arbitrum).address),
            '2131',
            '0.43123',
            '1646590921159',
            `${OrderType.TAKE_PROFIT}`
          ],
          [
            web3Utils.toChecksumAddress(getAssetInfo('LINK', ChainId.Arbitrum).address),
            web3Utils.toChecksumAddress(getAssetInfo('USDC', ChainId.Arbitrum).address),
            '2131',
            '0.43123',
            1646590921159,
            OrderType.TAKE_PROFIT
          ]
        ],
      ];

      examples.forEach(([expected, actual]) => {
        it(`Given ${actual} should return expected value: ${expected}`, () => {
          expect(subDataService.exchangeLimitOrderSubData.encode(...actual)).to.eql(expected);
        });
      });
    });

    describe('decode()', () => {
      const examples: Array<[{ fromToken: EthereumAddress, toToken: EthereumAddress, amount: string }, [SubData, ChainId]]> = [
        [
          {
            fromToken: web3Utils.toChecksumAddress(getAssetInfo('WETH', ChainId.Ethereum).address),
            toToken: web3Utils.toChecksumAddress(getAssetInfo('DAI', ChainId.Ethereum).address),
            amount: '0.000000000000002131',
          },
          [
            [
              '0x000000000000000000000000c02aaa39b223fe8d0a0e5c4f27ead9083c756cc2', '0x0000000000000000000000006b175474e89094c44da98b954eedeac495271d0f',
              '0x0000000000000000000000000000000000000000000000000000000000000853', '0x0000000000000000000000000000000000000000000000000000000000231860'
            ],
            ChainId.Ethereum
          ],
        ],
        [
          {
            fromToken: web3Utils.toChecksumAddress(getAssetInfo('WBTC', ChainId.Arbitrum).address),
            toToken: web3Utils.toChecksumAddress(getAssetInfo('LINK', ChainId.Arbitrum).address),
            amount: '0.04120023',
          },
          [
            [
              '0x0000000000000000000000002f2a2543b76a4166549f7aab2e75bef0aefc5b0f', '0x000000000000000000000000f97f4df75117a78c1a5a0dbb814af92458539fb4',
              '0x00000000000000000000000000000000000000000000000000000000003eddd7', '0x0000000000000000000000000000000000000000000000000000000008f57500'
            ],
            ChainId.Arbitrum
          ]
        ],
      ];

      examples.forEach(([expected, actual]) => {
        it(`Given ${actual} should return expected value: ${JSON.stringify(expected)}`, () => {
          expect(subDataService.exchangeLimitOrderSubData.decode(...actual)).to.eql(expected);
        });
      });
    });
  });

  describe('When testing subDataService.sparkLeverageManagementSubData', () => {
    describe('decode()', () => {
      const examples: Array<[{ targetRatio: number }, SubData]> = [
        [
          { targetRatio: 200 },
          ['0x0000000000000000000000000000000000000000000000001bc16d674ec80000'],
        ],
        [
          { targetRatio: 123 },
          ['0x0000000000000000000000000000000000000000000000001111d67bb1bb0000'],
        ],
      ];

      examples.forEach(([expected, actual]) => {
        it(`Given ${actual} should return expected value: ${JSON.stringify(expected)}`, () => {
          expect(subDataService.sparkLeverageManagementSubData.decode(actual)).to.eql(expected);
        });
      });
    });
  });

  describe('When testing subDataService.liquityDsrPaybackSubData', () => {
    describe('encode()', () => {
      const examples: Array<[SubData, [targetRatio: number]]> = [
        [
          [
            '0x0000000000000000000000000000000000000000000000000000000000000001', '0x0000000000000000000000000000000000000000000000001111d67bb1bb0000',
            '0x0000000000000000000000006b175474e89094c44da98b954eedeac495271d0f', '0x0000000000000000000000005f98805a4e8be255a32880fdec7f6728c6568ba0',
          ],
          [123]
        ],
        [
          [
            '0x0000000000000000000000000000000000000000000000000000000000000001', '0x0000000000000000000000000000000000000000000000003a4965bf58a40000',
            '0x0000000000000000000000006b175474e89094c44da98b954eedeac495271d0f', '0x0000000000000000000000005f98805a4e8be255a32880fdec7f6728c6568ba0',
          ],
          [420]
        ],
      ];

      examples.forEach(([expected, actual]) => {
        it(`Given ${actual} should return expected value: ${expected}`, () => {
          expect(subDataService.liquityDsrPaybackSubData.encode(...actual)).to.eql(expected);
        });
      });
    });

    describe('decode()', () => {
      const examples: Array<[{ targetRatio: number }, SubData]> = [
        [
          {
            targetRatio: 123,
          },
          [
            '0x0000000000000000000000000000000000000000000000000000000000000001', '0x0000000000000000000000000000000000000000000000001111d67bb1bb0000',
            '0x0000000000000000000000006b175474e89094c44da98b954eedeac495271d0f', '0x0000000000000000000000005f98805a4e8be255a32880fdec7f6728c6568ba0',
          ],
        ],
        [
          {
            targetRatio: 420,
          },
          [
            '0x0000000000000000000000000000000000000000000000000000000000000001', '0x0000000000000000000000000000000000000000000000003a4965bf58a40000',
            '0x0000000000000000000000006b175474e89094c44da98b954eedeac495271d0f', '0x0000000000000000000000005f98805a4e8be255a32880fdec7f6728c6568ba0',
          ],
        ],
      ];

      examples.forEach(([expected, actual]) => {
        it(`Given ${actual} should return expected value: ${JSON.stringify(expected)}`, () => {
          expect(subDataService.liquityDsrPaybackSubData.decode(actual)).to.eql(expected);
        });
      });
    });
  });

  describe('When testing subDataService.liquityDsrSupplySubData', () => {
    describe('encode()', () => {
      const examples: Array<[SubData, [targetRatio: number]]> = [
        [
          [
            '0x0000000000000000000000000000000000000000000000000000000000000001', '0x0000000000000000000000000000000000000000000000002c68af0bb1400000',
            '0x0000000000000000000000006b175474e89094c44da98b954eedeac495271d0f', '0x000000000000000000000000c02aaa39b223fe8d0a0e5c4f27ead9083c756cc2',
          ],
          [320]
        ],
        [
          [
            '0x0000000000000000000000000000000000000000000000000000000000000001', '0x0000000000000000000000000000000000000000000000001eab7f4a799d0000',
            '0x0000000000000000000000006b175474e89094c44da98b954eedeac495271d0f', '0x000000000000000000000000c02aaa39b223fe8d0a0e5c4f27ead9083c756cc2',
          ],
          [221]
        ],
      ];

      examples.forEach(([expected, actual]) => {
        it(`Given ${actual} should return expected value: ${expected}`, () => {
          expect(subDataService.liquityDsrSupplySubData.encode(...actual)).to.eql(expected);
        });
      });
    });

    describe('decode()', () => {
      const examples: Array<[{ targetRatio: number }, SubData]> = [
        [
          {
            targetRatio: 320,
          },
          [
            '0x0000000000000000000000000000000000000000000000000000000000000001', '0x0000000000000000000000000000000000000000000000002c68af0bb1400000',
            '0x0000000000000000000000006b175474e89094c44da98b954eedeac495271d0f', '0x000000000000000000000000c02aaa39b223fe8d0a0e5c4f27ead9083c756cc2',
          ],
        ],
        [
          {
            targetRatio: 221,
          },
          [
            '0x0000000000000000000000000000000000000000000000000000000000000001', '0x0000000000000000000000000000000000000000000000001eab7f4a799d0000',
            '0x0000000000000000000000006b175474e89094c44da98b954eedeac495271d0f', '0x000000000000000000000000c02aaa39b223fe8d0a0e5c4f27ead9083c756cc2',
          ],
        ],
      ];

      examples.forEach(([expected, actual]) => {
        it(`Given ${actual} should return expected value: ${JSON.stringify(expected)}`, () => {
          expect(subDataService.liquityDsrSupplySubData.decode(actual)).to.eql(expected);
        });
      });
    });
  });

  describe('When testing subDataService.liquityDebtInFrontRepaySubData', () => {
    describe('encode()', () => {
      const examples: Array<[SubData, [targetRatioIncrease: number]]> = [
        [
          [
            '0x000000000000000000000000c02aaa39b223fe8d0a0e5c4f27ead9083c756cc2', '0x0000000000000000000000005f98805a4e8be255a32880fdec7f6728c6568ba0',
            '0x000000000000000000000000000000000000000000000000016345785d8a0000', '0x0000000000000000000000000000000000000000000000000000000000000001',
            '0x0000000000000000000000000000000000000000000000000000000000000000',
          ],
          [10]
        ],
        [
          [
            '0x000000000000000000000000c02aaa39b223fe8d0a0e5c4f27ead9083c756cc2', '0x0000000000000000000000005f98805a4e8be255a32880fdec7f6728c6568ba0',
            '0x000000000000000000000000000000000000000000000000063eb89da4ed0000', '0x0000000000000000000000000000000000000000000000000000000000000001',
            '0x0000000000000000000000000000000000000000000000000000000000000000',
          ],
          [45]
        ],
      ];

      examples.forEach(([expected, actual]) => {
        it(`Given ${actual} should return expected value: ${expected}`, () => {
          expect(subDataService.liquityDebtInFrontRepaySubData.encode(...actual)).to.eql(expected);
        });
      });
    });

    describe('decode()', () => {
      const examples: Array<[{ targetRatioIncrease: number }, SubData]> = [
        [
          {
            targetRatioIncrease: 10,
          },
          [
            '0x000000000000000000000000c02aaa39b223fe8d0a0e5c4f27ead9083c756cc2', '0x0000000000000000000000005f98805a4e8be255a32880fdec7f6728c6568ba0',
            '0x000000000000000000000000000000000000000000000000016345785d8a0000', '0x0000000000000000000000000000000000000000000000000000000000000001',
            '0x0000000000000000000000000000000000000000000000000000000000000000',
          ],
        ],
        [
          {
            targetRatioIncrease: 45,
          },
          [
            '0x000000000000000000000000c02aaa39b223fe8d0a0e5c4f27ead9083c756cc2', '0x0000000000000000000000005f98805a4e8be255a32880fdec7f6728c6568ba0',
            '0x000000000000000000000000000000000000000000000000063eb89da4ed0000', '0x0000000000000000000000000000000000000000000000000000000000000001',
            '0x0000000000000000000000000000000000000000000000000000000000000000',
          ],
       ],
      ];

      examples.forEach(([expected, actual]) => {
        it(`Given ${actual} should return expected value: ${JSON.stringify(expected)}`, () => {
          expect(subDataService.liquityDebtInFrontRepaySubData.decode(actual)).to.eql(expected);
        });
      });
    });
  });

  describe('When testing subDataService.crvUSDLeverageManagementSubData', () => {
    describe('encode()', () => {
      const examples: Array<[SubData, [controller: EthereumAddress, ratioState: RatioState, targetRatio: number, collToken: EthereumAddress, crvUSD: EthereumAddress]]> = [
        [
          [
            '0x000000000000000000000000a920de414ea4ab66b97da1bfe9e6eca7d4219635',
            '0x0000000000000000000000000000000000000000000000000000000000000001',
            '0x00000000000000000000000000000000000000000000000010a741a462780000',
            '0x000000000000000000000000c02aaa39b223fe8d0a0e5c4f27ead9083c756cc2',
            '0x000000000000000000000000f939e0a03fb07f59a73314e73794be0e57ac1b4e',
          ],
          ['0xa920de414ea4ab66b97da1bfe9e6eca7d4219635', RatioState.UNDER, 120, '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2', '0xf939E0A03FB07F59A73314E73794Be0E57ac1b4E'],
        ],
        [
          [
            '0x000000000000000000000000a920de414ea4ab66b97da1bfe9e6eca7d4219635',
            '0x0000000000000000000000000000000000000000000000000000000000000000',
            '0x00000000000000000000000000000000000000000000000018fae27693b40000',
            '0x000000000000000000000000c02aaa39b223fe8d0a0e5c4f27ead9083c756cc2',
            '0x000000000000000000000000f939e0a03fb07f59a73314e73794be0e57ac1b4e',
          ],
          ['0xa920de414ea4ab66b97da1bfe9e6eca7d4219635', RatioState.OVER, 180, '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2', '0xf939E0A03FB07F59A73314E73794Be0E57ac1b4E']
        ],
      ];
      examples.forEach(([expected, actual]) => {
        it(`Given ${actual} should return expected value: ${expected}`, () => {
          expect(subDataService.crvUSDLeverageManagementSubData.encode(...actual)).to.eql(expected);
        });
      });
    });
    describe('decode()', () => {
      const examples: Array<[{
        controller: EthereumAddress,
        targetRatio: number,
      }, SubData]> = [
        [
          {
            controller: '0xA920De414eA4Ab66b97dA1bFE9e6EcA7d4219635',
            targetRatio: 120,
          },
          ['0x000000000000000000000000a920de414ea4ab66b97da1bfe9e6eca7d4219635', '0x0000000000000000000000000000000000000000000000000000000000000001', '0x00000000000000000000000000000000000000000000000010a741a462780000', '0x000000000000000000000000c02aaa39b223fe8d0a0e5c4f27ead9083c756cc2', '0x000000000000000000000000f939e0a03fb07f59a73314e73794be0e57ac1b4e',],
        ],
        [
          {
            controller: '0xA920De414eA4Ab66b97dA1bFE9e6EcA7d4219635',
            targetRatio: 180,
          },
          ['0x000000000000000000000000a920de414ea4ab66b97da1bfe9e6eca7d4219635', '0x0000000000000000000000000000000000000000000000000000000000000000', '0x00000000000000000000000000000000000000000000000018fae27693b40000', '0x000000000000000000000000c02aaa39b223fe8d0a0e5c4f27ead9083c756cc2', '0x000000000000000000000000f939e0a03fb07f59a73314e73794be0e57ac1b4e',],
        ],
      ];

      examples.forEach(([expected, actual]) => {
        it(`Given ${actual} should return expected value: ${JSON.stringify(expected)}`, () => {
          expect(subDataService.crvUSDLeverageManagementSubData.decode(actual)).to.eql(expected);
        });
      });
    });
  });

  describe('When testing subDataService.crvUSDPaybackSubData', () => {
    describe('encode()', () => {
      const examples: Array<[SubData, [controller: EthereumAddress, addressToPullTokensFrom: EthereumAddress, positionOwner: EthereumAddress, paybackAmount: string, crvUSDAddr: EthereumAddress]]> = [
        [
          [
            '0x000000000000000000000000a920de414ea4ab66b97da1bfe9e6eca7d4219635',
            '0x000000000000000000000000dc0ad7a48088f1aa55d26f8b36f7c1e827ddd280',
            '0x000000000000000000000000dc0ad7a48088f1aa55d26f8b36f7c1e827ddd280',
            '0x00000000000000000000000000000000000000000000043c33c1937564800000',
            '0x000000000000000000000000f939e0a03fb07f59a73314e73794be0e57ac1b4e',
          ],
          ['0xa920de414ea4ab66b97da1bfe9e6eca7d4219635', '0xDc0Ad7a48088f1AA55d26f8b36F7C1E827DdD280', '0xDc0Ad7a48088f1AA55d26f8b36F7C1E827DdD280', '20000', '0xf939E0A03FB07F59A73314E73794Be0E57ac1b4E'],
        ]
      ];
      examples.forEach(([expected, actual]) => {
        it(`Given ${actual} should return expected value: ${expected}`, () => {
          expect(subDataService.crvUSDPaybackSubData.encode(...actual)).to.eql(expected);
        });
      });
    });
    describe('decode()', () => {
      const examples: Array<[{
        controller: EthereumAddress,
        addressToPullTokensFrom: EthereumAddress,
        positionOwner: EthereumAddress,
        paybackAmount: string,
      }, SubData]> = [
        [
          {
            controller: '0xA920De414eA4Ab66b97dA1bFE9e6EcA7d4219635',
            addressToPullTokensFrom: '0xDc0Ad7a48088f1AA55d26f8b36F7C1E827DdD280',
            positionOwner: '0xDc0Ad7a48088f1AA55d26f8b36F7C1E827DdD280',
            paybackAmount: '20000'
          },
          [
            '0x000000000000000000000000a920de414ea4ab66b97da1bfe9e6eca7d4219635',
            '0x000000000000000000000000dc0ad7a48088f1aa55d26f8b36f7c1e827ddd280',
            '0x000000000000000000000000dc0ad7a48088f1aa55d26f8b36f7c1e827ddd280',
            '0x00000000000000000000000000000000000000000000043c33c1937564800000',
            '0x000000000000000000000000f939e0a03fb07f59a73314e73794be0e57ac1b4e',
          ]
        ]
      ];

      examples.forEach(([expected, actual]) => {
        it(`Given ${actual} should return expected value: ${JSON.stringify(expected)}`, () => {
          expect(subDataService.crvUSDPaybackSubData.decode(actual)).to.eql(expected);
        });
      });
    });
  });

  describe('When testing subDataService.compoundV3L2LeverageManagementSubData', () => {
    describe('encode()', () => {
      const examples: Array<[
        string,
        [market: EthereumAddress, baseToken: EthereumAddress, triggerRepayRatio: number, triggerBoostRatio: number, targetBoostRatio: number, targetRepayRatio: number, boostEnabled: boolean, isEOA: boolean],
      ]> = [
        [
          '0x0313D212133AFab8F2b829B1066c7e43caD94e2c0213D212133AfaB8F2b829B1066C7E43cAD94E2c000000000000000016345785d8a0000000000000000000001e87f85809dc0000000000000000000018fae27693b4000000000000000000001a5e27eef13e00000100',
          [web3Utils.toChecksumAddress('0x0313d212133AFaB8F2B829B1066c7E43cAd94E2c'), web3Utils.toChecksumAddress('0x0213d212133AFaB8F2B829B1066c7E43cAd94E2c'), 160, 220, 180, 190, true, false]
        ],
        [
          '0x0313D212133AFab8F2b829B1066c7e43caD94e2c0413d212133afAb8F2B829b1066C7e43cAd94e2c000000000000000016345785d8a0000000000000000000001e87f85809dc0000000000000000000018fae27693b4000000000000000000000f43fc2c04ee00000000',
          [web3Utils.toChecksumAddress('0x0313d212133AFaB8F2B829B1066c7E43cAd94E2c'), web3Utils.toChecksumAddress('0x0413d212133AFaB8F2B829B1066c7E43cAd94E2c'), 160, 220, 180, 110, false, false]
        ],
      ];

      examples.forEach(([expected, actual]) => {
        it(`Given ${actual} should return expected value: ${expected}`, () => {
          expect(subDataService.compoundV3L2LeverageManagementSubData.encode(...actual)).to.eql(expected);
        });
      });
    });
    describe('decode()', () => {
      const examples: Array<[{ targetRatio: number }, SubData]> = [
        [
          { targetRatio: 200 },
          [
            '0x0000000000000000000000000313d212133AFaB8F2B829B1066c7E43cAd94E2c', '0x0000000000000000000000000213d212133AFaB8F2B829B1066c7E43cAd94E2c',
           '0x0000000000000000000000000000000000000000000000000000000000000001', '0x0000000000000000000000000000000000000000000000001bc16d674ec80000',
          ],
        ],
        [
          { targetRatio: 123 },
          [
            '0x0000000000000000000000000313d212133AFaB8F2B829B1066c7E43cAd94E2c', '0x0000000000000000000000000413d212133AFaB8F2B829B1066c7E43cAd94E2c',
            '0x0000000000000000000000000000000000000000000000000000000000000000', '0x0000000000000000000000000000000000000000000000001111d67bb1bb0000',
          ],
        ],
      ];

      examples.forEach(([expected, actual]) => {
        it(`Given ${actual} should return expected value: ${JSON.stringify(expected)}`, () => {
          expect(subDataService.compoundV3L2LeverageManagementSubData.decode(actual)).to.eql(expected);
        });
      });
    });
  });

  describe('When testing subDataService.morphoBlueLeverageManagementSubData', () => {
    describe('encode()', () => {
      const examples: Array<[
        SubData,
        [loanToken: EthereumAddress, collToken: EthereumAddress, oracle: EthereumAddress, irm: EthereumAddress, lltv: string, ratioState: RatioState, targetRatio: number, user: EthereumAddress, isEOA: boolean],
      ]> = [
        [
          [
            '0x000000000000000000000000c02aaa39b223fe8d0a0e5c4f27ead9083c756cc2',
            '0x0000000000000000000000007f39c581f595b53c5cb19bd0b3f8da6c935e2ca0',
            '0x0000000000000000000000002a01eb9496094da03c4e364def50f5ad1280ad72',
            '0x000000000000000000000000870ac11d48b15db9a138cf899d20f13f79ba00bc',
            '0x0000000000000000000000000000000000000000000000000d1d507e40be8000',
            '0x0000000000000000000000000000000000000000000000000000000000000001',
            '0x00000000000000000000000000000000000000000000000010a741a462780000',
            '0x0000000000000000000000001031d218133afab8c2b819b1366c7e434ad91e9c',
            '0x0000000000000000000000000000000000000000000000000000000000000000',
          ],
          [web3Utils.toChecksumAddress('0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2'), web3Utils.toChecksumAddress('0x7f39C581F595B53c5cb19bD0b3f8dA6c935E2Ca0'), web3Utils.toChecksumAddress('0x2a01eb9496094da03c4e364def50f5ad1280ad72'), web3Utils.toChecksumAddress('0x870aC11D48B15DB9a138Cf899d20F13F79Ba00BC'), '945000000000000000', RatioState.UNDER, 120, web3Utils.toChecksumAddress('0x1031d218133AFaB8c2B819B1366c7E434Ad91E9c'), false]
        ],
        [
          [
            '0x000000000000000000000000a0b86991c6218b36c1d19d4a2e9eb0ce3606eb48',
            '0x0000000000000000000000007f39c581f595b53c5cb19bd0b3f8da6c935e2ca0',
            '0x00000000000000000000000048f7e36eb6b826b2df4b2e630b62cd25e89e40e2',
            '0x000000000000000000000000870ac11d48b15db9a138cf899d20f13f79ba00bc',
            '0x0000000000000000000000000000000000000000000000000bef55718ad60000',
            '0x0000000000000000000000000000000000000000000000000000000000000000',
            '0x0000000000000000000000000000000000000000000000001bc16d674ec80000',
            '0x0000000000000000000000000043d218133afab8f2b829b106633e434ad94e2c',
            '0x0000000000000000000000000000000000000000000000000000000000000000',
          ],
          [web3Utils.toChecksumAddress('0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48'), web3Utils.toChecksumAddress('0x7f39C581F595B53c5cb19bD0b3f8dA6c935E2Ca0'), web3Utils.toChecksumAddress('0x48F7E36EB6B826B2dF4B2E630B62Cd25e89E40e2'), web3Utils.toChecksumAddress('0x870aC11D48B15DB9a138Cf899d20F13F79Ba00BC'), '860000000000000000', RatioState.OVER, 200, web3Utils.toChecksumAddress('0x0043d218133AFaB8F2B829B106633E434Ad94E2c'), false]
        ],
      ];

      examples.forEach(([expected, actual]) => {
        it(`Given ${actual} should return expected value: ${expected}`, () => {
          expect(subDataService.morphoBlueLeverageManagementSubData.encode(...actual)).to.eql(expected);
        });
      });
    });

    describe('decode()', () => {
      const examples: Array<[{ collToken: EthereumAddress, loanToken: EthereumAddress, oracle: EthereumAddress, irm: EthereumAddress, lltv: string, targetRatio: number, user: EthereumAddress }, SubData]> = [
        [
          {
            'collToken': '0x7f39C581F595B53c5cb19bD0b3f8dA6c935E2Ca0',
            'irm': '0x870aC11D48B15DB9a138Cf899d20F13F79Ba00BC',
            'lltv': '945000000000000000',
            'loanToken': '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',
            'oracle': '0x2a01EB9496094dA03c4E364Def50f5aD1280AD72',
            'targetRatio': 120,
            'user': '0x1031d218133AFaB8C2B819B1366c7e434Ad91e9c',
          },
          [
            '0x000000000000000000000000c02aaa39b223fe8d0a0e5c4f27ead9083c756cc2',
            '0x0000000000000000000000007f39c581f595b53c5cb19bd0b3f8da6c935e2ca0',
            '0x0000000000000000000000002a01eb9496094da03c4e364def50f5ad1280ad72',
            '0x000000000000000000000000870ac11d48b15db9a138cf899d20f13f79ba00bc',
            '0x0000000000000000000000000000000000000000000000000d1d507e40be8000',
            '0x0000000000000000000000000000000000000000000000000000000000000001',
            '0x00000000000000000000000000000000000000000000000010a741a462780000',
            '0x0000000000000000000000001031d218133afab8c2b819b1366c7e434ad91e9c',
          ],
        ],
        [
          {
            'collToken': '0x7f39C581F595B53c5cb19bD0b3f8dA6c935E2Ca0',
            'irm': '0x870aC11D48B15DB9a138Cf899d20F13F79Ba00BC',
            'lltv': '860000000000000000',
            'loanToken': '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
            'oracle': '0x48F7E36EB6B826B2dF4B2E630B62Cd25e89E40e2',
            'targetRatio': 200,
            'user': '0x0043d218133aFaB8F2b829B106633E434aD94e2C',
          },
          [
            '0x000000000000000000000000a0b86991c6218b36c1d19d4a2e9eb0ce3606eb48',
            '0x0000000000000000000000007f39c581f595b53c5cb19bd0b3f8da6c935e2ca0',
            '0x00000000000000000000000048f7e36eb6b826b2df4b2e630b62cd25e89e40e2',
            '0x000000000000000000000000870ac11d48b15db9a138cf899d20f13f79ba00bc',
            '0x0000000000000000000000000000000000000000000000000bef55718ad60000',
            '0x0000000000000000000000000000000000000000000000000000000000000000',
            '0x0000000000000000000000000000000000000000000000001bc16d674ec80000',
            '0x0000000000000000000000000043d218133afab8f2b829b106633e434ad94e2c',
          ],
        ],
      ];

      examples.forEach(([expected, actual]) => {
        it(`Given ${actual} should return expected value: ${JSON.stringify(expected)}`, () => {
          expect(subDataService.morphoBlueLeverageManagementSubData.decode(actual)).to.eql(expected);
        });
      });
    });
  });

  describe('When testing subDataService.aaveV3LeverageManagementOnPriceSubData', () => {
    describe('encode()', () => {
      const examples: Array<[SubData, [collAsset: EthereumAddress, collAssetId: number, debtAsset: EthereumAddress, debtAssetId: number, marketAddr: EthereumAddress, targetRatio: number]]> = [
        [
          [
            '0x000000000000000000000000c02aaa39b223fe8d0a0e5c4f27ead9083c756cc2',
            '0x0000000000000000000000000000000000000000000000000000000000000000',
            '0x0000000000000000000000006b175474e89094c44da98b954eedeac495271d0f',
            '0x0000000000000000000000000000000000000000000000000000000000000004',
            '0x0000000000000000000000002f39d218133afab8f2b819b1066c7e434ad94e9e',
            '0x0000000000000000000000000000000000000000000000001bc16d674ec80000',
            '0x0000000000000000000000000000000000000000000000000000000000000000',
          ],
          [
            web3Utils.toChecksumAddress(getAssetInfo('WETH', ChainId.Ethereum).address),
            0,
            web3Utils.toChecksumAddress(getAssetInfo('DAI', ChainId.Ethereum).address),
            4,
            web3Utils.toChecksumAddress('0x2f39d218133afab8f2b819b1066c7e434ad94e9e'),
            200,
          ]
        ],
      ];

      examples.forEach(([expected, actual]) => {
        it(`Given ${actual} should return expected value: ${expected}`, () => {
          expect(subDataService.aaveV3LeverageManagementOnPriceSubData.encode(...actual)).to.eql(expected);
        });
      });
    });

    describe('decode()', () => {
      const examples: Array<[{ collAsset: EthereumAddress, collAssetId: number, debtAsset: EthereumAddress, debtAssetId: number, marketAddr: EthereumAddress, targetRatio: number}, SubData]> = [
        [
          {
            collAsset: web3Utils.toChecksumAddress(getAssetInfo('WETH', ChainId.Ethereum).address),
            collAssetId: 0,
            debtAsset: web3Utils.toChecksumAddress(getAssetInfo('DAI', ChainId.Ethereum).address),
            debtAssetId: 4,
            marketAddr: web3Utils.toChecksumAddress('0x2f39d218133afab8f2b819b1066c7e434ad94e9e'),
            targetRatio: 200,
          },
          [
            '0x000000000000000000000000c02aaa39b223fe8d0a0e5c4f27ead9083c756cc2',
            '0x0000000000000000000000000000000000000000000000000000000000000000',
            '0x0000000000000000000000006b175474e89094c44da98b954eedeac495271d0f',
            '0x0000000000000000000000000000000000000000000000000000000000000004',
            '0x0000000000000000000000002f39d218133afab8f2b819b1066c7e434ad94e9e',
            '0x0000000000000000000000000000000000000000000000001bc16d674ec80000',
          ],
        ],
      ];

      examples.forEach(([expected, actual]) => {
        it(`Given ${actual} should return expected value: ${JSON.stringify(expected)}`, () => {
          expect(subDataService.aaveV3LeverageManagementOnPriceSubData.decode(actual)).to.eql(expected);
        });
      });
    });
  });

  describe('When testing subDataService.compoundV3LeverageManagementOnPriceSubData', () => {
    describe('encode()', () => {
      const examples: Array<[string[], [market: EthereumAddress, collToken: EthereumAddress, baseToken: EthereumAddress, targetRatio: number, ratioState: RatioState, user: EthereumAddress]]> = [
        [
          [
            '0x000000000000000000000000c3d688b66703497daa19211eedff47f25384cdc3',
            '0x000000000000000000000000c02aaa39b223fe8d0a0e5c4f27ead9083c756cc2',
            '0x000000000000000000000000a0b86991c6218b36c1d19d4a2e9eb0ce3606eb48',
            '0x0000000000000000000000000000000000000000000000001bc16d674ec80000',
            '0x0000000000000000000000000000000000000000000000000000000000000001',
            '0x0000000000000000000000001031d218133afab8c2b819b1366c7e434ad91e9c'
          ],
          [
            web3Utils.toChecksumAddress('0xc3d688B66703497DAA19211EEdff47f25384cdc3'),
            web3Utils.toChecksumAddress('0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2'),
            web3Utils.toChecksumAddress('0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48'),
            200,
            RatioState.UNDER,
            web3Utils.toChecksumAddress('0x1031d218133afab8c2b819b1366c7e434ad91e9c')
          ]
        ],
        [
          [
            '0x000000000000000000000000c3d688b66703497daa19211eedff47f25384cdc3',
            '0x000000000000000000000000c02aaa39b223fe8d0a0e5c4f27ead9083c756cc2',
            '0x000000000000000000000000a0b86991c6218b36c1d19d4a2e9eb0ce3606eb48',
            '0x0000000000000000000000000000000000000000000000001a5e27eef13e0000',
            '0x0000000000000000000000000000000000000000000000000000000000000000',
            '0x0000000000000000000000000043d218133afab8f2b829b106633e434ad94e2c'
          ],
          [
            web3Utils.toChecksumAddress('0xc3d688B66703497DAA19211EEdff47f25384cdc3'),
            web3Utils.toChecksumAddress('0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2'),
            web3Utils.toChecksumAddress('0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48'),
            190,
            RatioState.OVER,
            web3Utils.toChecksumAddress('0x0043d218133afab8f2b829b106633e434ad94e2c')
          ]
        ],
      ];

      examples.forEach(([expected, actual]) => {
        it(`Given ${actual} should return expected value: ${JSON.stringify(expected)}`, () => {
          expect(subDataService.compoundV3LeverageManagementOnPriceSubData.encode(...actual)).to.eql(expected);
        });
      });
    });

    describe('decode()', () => {
      const examples: Array<[{ market: EthereumAddress, collToken: EthereumAddress, baseToken: EthereumAddress, targetRatio: number, ratioState: RatioState, owner: EthereumAddress }, string[]]> = [
        [
          {
            market: web3Utils.toChecksumAddress('0xc3d688B66703497DAA19211EEdff47f25384cdc3'),
            collToken: web3Utils.toChecksumAddress('0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2'),
            baseToken: web3Utils.toChecksumAddress('0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48'),
            targetRatio: 200,
            ratioState: RatioState.UNDER,
            owner: web3Utils.toChecksumAddress('0x1031d218133afab8c2b819b1366c7e434ad91e9c')
          },
          [
            '0x000000000000000000000000c3d688b66703497daa19211eedff47f25384cdc3',
            '0x000000000000000000000000c02aaa39b223fe8d0a0e5c4f27ead9083c756cc2',
            '0x000000000000000000000000a0b86991c6218b36c1d19d4a2e9eb0ce3606eb48',
            '0x0000000000000000000000000000000000000000000000001bc16d674ec80000',
            '0x0000000000000000000000000000000000000000000000000000000000000001',
            '0x0000000000000000000000001031d218133afab8c2b819b1366c7e434ad91e9c'
          ]
        ],
        [
          {
            market: web3Utils.toChecksumAddress('0xc3d688B66703497DAA19211EEdff47f25384cdc3'),
            collToken: web3Utils.toChecksumAddress('0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2'),
            baseToken: web3Utils.toChecksumAddress('0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48'),
            targetRatio: 190,
            ratioState: RatioState.OVER,
            owner: web3Utils.toChecksumAddress('0x0043d218133afab8f2b829b106633e434ad94e2c')
          },
          [
            '0x000000000000000000000000c3d688b66703497daa19211eedff47f25384cdc3',
            '0x000000000000000000000000c02aaa39b223fe8d0a0e5c4f27ead9083c756cc2',
            '0x000000000000000000000000a0b86991c6218b36c1d19d4a2e9eb0ce3606eb48',
            '0x0000000000000000000000000000000000000000000000001a5e27eef13e0000',
            '0x0000000000000000000000000000000000000000000000000000000000000000',
            '0x0000000000000000000000000043d218133afab8f2b829b106633e434ad94e2c'
          ]
        ],
      ];

      examples.forEach(([expected, actual]) => {
        it(`Given ${actual} should return expected value: ${JSON.stringify(expected)}`, () => {
          expect(subDataService.compoundV3LeverageManagementOnPriceSubData.decode(actual)).to.eql(expected);
        });
      });
    });
  });

  describe('When testing subDataService.compoundV3CloseSubData', () => {
    describe('encode()', () => {
      const examples: Array<[string[], [market: EthereumAddress, collToken: EthereumAddress, baseToken: EthereumAddress, closeType: CloseStrategyType, user: EthereumAddress]]> = [
        [
          [
            '0x000000000000000000000000c3d688b66703497daa19211eedff47f25384cdc3',
            '0x000000000000000000000000c02aaa39b223fe8d0a0e5c4f27ead9083c756cc2',
            '0x000000000000000000000000a0b86991c6218b36c1d19d4a2e9eb0ce3606eb48',
            '0x0000000000000000000000000000000000000000000000000000000000000006',
            '0x0000000000000000000000001031d218133afab8c2b819b1366c7e434ad91e9c',
          ],
          [
            web3Utils.toChecksumAddress('0xc3d688B66703497DAA19211EEdff47f25384cdc3'),
            web3Utils.toChecksumAddress(getAssetInfo('WETH', ChainId.Ethereum).address),
            web3Utils.toChecksumAddress(getAssetInfo('USDC', ChainId.Ethereum).address),
            CloseStrategyType.TAKE_PROFIT_AND_STOP_LOSS_IN_DEBT,
            web3Utils.toChecksumAddress('0x1031d218133afab8c2b819b1366c7e434ad91e9c'),
          ]
        ],
        [
          [
            '0x000000000000000000000000c3d688b66703497daa19211eedff47f25384cdc3',
            '0x000000000000000000000000c02aaa39b223fe8d0a0e5c4f27ead9083c756cc2',
            '0x000000000000000000000000a0b86991c6218b36c1d19d4a2e9eb0ce3606eb48',
            '0x0000000000000000000000000000000000000000000000000000000000000000',
            '0x0000000000000000000000001031d218133afab8c2b819b1366c7e434ad91e9c',
          ],
          [
            web3Utils.toChecksumAddress('0xc3d688B66703497DAA19211EEdff47f25384cdc3'),
            web3Utils.toChecksumAddress(getAssetInfo('WETH', ChainId.Ethereum).address),
            web3Utils.toChecksumAddress(getAssetInfo('USDC', ChainId.Ethereum).address),
            CloseStrategyType.TAKE_PROFIT_IN_COLLATERAL,
            web3Utils.toChecksumAddress('0x1031d218133afab8c2b819b1366c7e434ad91e9c'),
          ]
        ],
      ];

      examples.forEach(([expected, actual]) => {
        it(`Given ${actual} should return expected value: ${JSON.stringify(expected)}`, () => {
          expect(subDataService.compoundV3CloseSubData.encode(...actual)).to.eql(expected);
        });
      });
    });

    describe('decode()', () => {
      const examples: Array<[{ market: EthereumAddress, collToken: EthereumAddress, baseToken: EthereumAddress, closeType: CloseStrategyType, owner: EthereumAddress }, string[]]> = [
        [
          {
            market: web3Utils.toChecksumAddress('0xc3d688B66703497DAA19211EEdff47f25384cdc3'),
            collToken: web3Utils.toChecksumAddress('0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2'),
            baseToken: web3Utils.toChecksumAddress('0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48'),
            closeType: CloseStrategyType.TAKE_PROFIT_AND_STOP_LOSS_IN_DEBT,
            owner: web3Utils.toChecksumAddress('0x1031d218133afab8c2b819b1366c7e434ad91e9c')
          },
          [
            '0x000000000000000000000000c3d688b66703497daa19211eedff47f25384cdc3',
            '0x000000000000000000000000c02aaa39b223fe8d0a0e5c4f27ead9083c756cc2',
            '0x000000000000000000000000a0b86991c6218b36c1d19d4a2e9eb0ce3606eb48',
            '0x0000000000000000000000000000000000000000000000000000000000000006',
            '0x0000000000000000000000001031d218133afab8c2b819b1366c7e434ad91e9c'
          ]
        ],
        [
          {
            market: web3Utils.toChecksumAddress('0xc3d688B66703497DAA19211EEdff47f25384cdc3'),
            collToken: web3Utils.toChecksumAddress('0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2'),
            baseToken: web3Utils.toChecksumAddress('0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48'),
            closeType: CloseStrategyType.TAKE_PROFIT_IN_COLLATERAL,
            owner: web3Utils.toChecksumAddress('0x1031d218133afab8c2b819b1366c7e434ad91e9c')
          },
          [
            '0x000000000000000000000000c3d688b66703497daa19211eedff47f25384cdc3',
            '0x000000000000000000000000c02aaa39b223fe8d0a0e5c4f27ead9083c756cc2',
            '0x000000000000000000000000a0b86991c6218b36c1d19d4a2e9eb0ce3606eb48',
            '0x0000000000000000000000000000000000000000000000000000000000000000',
            '0x0000000000000000000000001031d218133afab8c2b819b1366c7e434ad91e9c'
          ]
        ],
      ];

      examples.forEach(([expected, actual]) => {
        it(`Given ${actual} should return expected value: ${JSON.stringify(expected)}`, () => {
          expect(subDataService.compoundV3CloseSubData.decode(actual)).to.eql(expected);
        });
      });
    });
  });

  describe("When testing subDataService.aaveV3LeverageManagementOnPriceGeneric", () => {
    describe("encode()", () => {
      const examples: Array<
        [
          string[],
          [
            collAsset: EthereumAddress,
            collAssetId: number,
            debtAsset: EthereumAddress,
            debtAssetId: number,
            marketAddr: EthereumAddress,
            targetRatio: number,
            owner: EthereumAddress
          ]
        ]
      > = [
        [
          [
            '0x000000000000000000000000c02aaa39b223fe8d0a0e5c4f27ead9083c756cc2',
            '0x0000000000000000000000000000000000000000000000000000000000000000',
            '0x000000000000000000000000a0b86991c6218b36c1d19d4a2e9eb0ce3606eb48',
            '0x0000000000000000000000000000000000000000000000000000000000000001',
            '0x00000000000000000000000087870bca3f3fd6335c3f4ce8392d69d0b4161d39',
            '0x0000000000000000000000000000000000000000000000001bc16d674ec80000',
            '0x0000000000000000000000000000000000000000000000000000000000000000',
          ],
          [
            web3Utils.toChecksumAddress(getAssetInfo('WETH', ChainId.Ethereum).address),
            0,
            web3Utils.toChecksumAddress(getAssetInfo('USDC', ChainId.Ethereum).address),
            1,
            web3Utils.toChecksumAddress('0x87870Bca3F3fD6335C3F4ce8392D69d0B4161d39'),
            200,
            web3Utils.toChecksumAddress('0x0000000000000000000000000000000000000000'),
          ]
        ],
        [
          [
            '0x0000000000000000000000002260fac5e5542a773aa44fbcfedf7c193bc2c599',
            '0x0000000000000000000000000000000000000000000000000000000000000002',
            '0x000000000000000000000000a0b86991c6218b36c1d19d4a2e9eb0ce3606eb48',
            '0x0000000000000000000000000000000000000000000000000000000000000001',
            '0x00000000000000000000000087870bca3f3fd6335c3f4ce8392d69d0b4161d39',
            '0x0000000000000000000000000000000000000000000000001bc16d674ec80000',
            '0x0000000000000000000000001234567890123456789012345678901234567890',
          ],
          [
            web3Utils.toChecksumAddress(getAssetInfo('WBTC', ChainId.Ethereum).address),
            2,
            web3Utils.toChecksumAddress(getAssetInfo('USDC', ChainId.Ethereum).address),
            1,
            web3Utils.toChecksumAddress('0x87870Bca3F3fD6335C3F4ce8392D69d0B4161d39'),
            200,
            web3Utils.toChecksumAddress('0x1234567890123456789012345678901234567890'),
          ]
        ],
      ];

      examples.forEach(([expected, actual]) => {
        it(`Given ${JSON.stringify(
          actual
        )} should return expected value: ${JSON.stringify(expected)}`, () => {
          expect(
            subDataService.aaveV3LeverageManagementOnPriceGeneric.encode(...actual)
          ).to.eql(expected);
        });
      });
    });

    describe("decode()", () => {
      const examples: Array<
        [
          {
            collAsset: EthereumAddress,
            collAssetId: number,
            debtAsset: EthereumAddress,
            debtAssetId: number,
            marketAddr: EthereumAddress,
            targetRatio: number,
            owner: EthereumAddress,
          },
          string[]
        ]
      > = [
        [
          {
            collAsset: web3Utils.toChecksumAddress(getAssetInfo('WETH', ChainId.Ethereum).address),
            collAssetId: 0,
            debtAsset: web3Utils.toChecksumAddress(getAssetInfo('USDC', ChainId.Ethereum).address),
            debtAssetId: 1,
            marketAddr: web3Utils.toChecksumAddress('0x87870Bca3F3fD6335C3F4ce8392D69d0B4161d39'),
            targetRatio: 200,
            owner: web3Utils.toChecksumAddress('0x0000000000000000000000000000000000000000'),
          },
          [
            '0x000000000000000000000000c02aaa39b223fe8d0a0e5c4f27ead9083c756cc2',
            '0x0000000000000000000000000000000000000000000000000000000000000000',
            '0x000000000000000000000000a0b86991c6218b36c1d19d4a2e9eb0ce3606eb48',
            '0x0000000000000000000000000000000000000000000000000000000000000001',
            '0x00000000000000000000000087870bca3f3fd6335c3f4ce8392d69d0b4161d39',
            '0x0000000000000000000000000000000000000000000000001bc16d674ec80000',
            '0x0000000000000000000000000000000000000000000000000000000000000000',
          ]
        ],
        [
          {
            collAsset: web3Utils.toChecksumAddress(getAssetInfo('WBTC', ChainId.Ethereum).address),
            collAssetId: 2,
            debtAsset: web3Utils.toChecksumAddress(getAssetInfo('USDC', ChainId.Ethereum).address),
            debtAssetId: 1,
            marketAddr: web3Utils.toChecksumAddress('0x87870Bca3F3fD6335C3F4ce8392D69d0B4161d39'),
            targetRatio: 200,
            owner: web3Utils.toChecksumAddress('0x1234567890123456789012345678901234567890'),
          },
          [
            '0x0000000000000000000000002260fac5e5542a773aa44fbcfedf7c193bc2c599',
            '0x0000000000000000000000000000000000000000000000000000000000000002',
            '0x000000000000000000000000a0b86991c6218b36c1d19d4a2e9eb0ce3606eb48',
            '0x0000000000000000000000000000000000000000000000000000000000000001',
            '0x00000000000000000000000087870bca3f3fd6335c3f4ce8392d69d0b4161d39',
            '0x0000000000000000000000000000000000000000000000001bc16d674ec80000',
            '0x0000000000000000000000001234567890123456789012345678901234567890',
          ]
        ],
      ];

      examples.forEach(([expected, actual]) => {
        it(`Given ${JSON.stringify(
          actual
        )} should return expected value: ${JSON.stringify(expected)}`, () => {
          expect(
            subDataService.aaveV3LeverageManagementOnPriceGeneric.decode(actual)
          ).to.eql(expected);
        });
      });
    });
  });

  describe("When testing subDataService.aaveV3CloseGenericSubData", () => {
    describe("encode()", () => {
      const examples: Array<
        [
          string[],
          [
            collAsset: EthereumAddress,
            collAssetId: number,
            debtAsset: EthereumAddress,
            debtAssetId: number,
            closeType: CloseStrategyType,
            marketAddr: EthereumAddress,
            owner: EthereumAddress
          ]
        ]
      > = [
        // TAKE_PROFIT_IN_COLLATERAL
        [
          [
            '0x000000000000000000000000c02aaa39b223fe8d0a0e5c4f27ead9083c756cc2',
            '0x0000000000000000000000000000000000000000000000000000000000000000',
            '0x000000000000000000000000a0b86991c6218b36c1d19d4a2e9eb0ce3606eb48',
            '0x0000000000000000000000000000000000000000000000000000000000000001',
            '0x0000000000000000000000000000000000000000000000000000000000000000',
            '0x00000000000000000000000087870bca3f3fd6335c3f4ce8392d69d0b4161d39',
            '0x0000000000000000000000000000000000000000000000000000000000000000',
          ],
          [
            web3Utils.toChecksumAddress(getAssetInfo('WETH', ChainId.Ethereum).address),
            0,
            web3Utils.toChecksumAddress(getAssetInfo('USDC', ChainId.Ethereum).address),
            1,
            CloseStrategyType.TAKE_PROFIT_IN_COLLATERAL,
            web3Utils.toChecksumAddress('0x87870Bca3F3fD6335C3F4ce8392D69d0B4161d39'),
            web3Utils.toChecksumAddress('0x0000000000000000000000000000000000000000'),
          ]
        ],
        // STOP_LOSS_IN_COLLATERAL
        [
          [
            '0x000000000000000000000000c02aaa39b223fe8d0a0e5c4f27ead9083c756cc2',
            '0x0000000000000000000000000000000000000000000000000000000000000000',
            '0x000000000000000000000000a0b86991c6218b36c1d19d4a2e9eb0ce3606eb48',
            '0x0000000000000000000000000000000000000000000000000000000000000001',
            '0x0000000000000000000000000000000000000000000000000000000000000001',
            '0x00000000000000000000000087870bca3f3fd6335c3f4ce8392d69d0b4161d39',
            '0x0000000000000000000000000000000000000000000000000000000000000000',
          ],
          [
            web3Utils.toChecksumAddress(getAssetInfo('WETH', ChainId.Ethereum).address),
            0,
            web3Utils.toChecksumAddress(getAssetInfo('USDC', ChainId.Ethereum).address),
            1,
            CloseStrategyType.STOP_LOSS_IN_COLLATERAL,
            web3Utils.toChecksumAddress('0x87870Bca3F3fD6335C3F4ce8392D69d0B4161d39'),
            web3Utils.toChecksumAddress('0x0000000000000000000000000000000000000000'),
          ]
        ],
        // TAKE_PROFIT_IN_DEBT
        [
          [
            '0x000000000000000000000000c02aaa39b223fe8d0a0e5c4f27ead9083c756cc2',
            '0x0000000000000000000000000000000000000000000000000000000000000000',
            '0x000000000000000000000000a0b86991c6218b36c1d19d4a2e9eb0ce3606eb48',
            '0x0000000000000000000000000000000000000000000000000000000000000001',
            '0x0000000000000000000000000000000000000000000000000000000000000002',
            '0x00000000000000000000000087870bca3f3fd6335c3f4ce8392d69d0b4161d39',
            '0x0000000000000000000000000000000000000000000000000000000000000000',
          ],
          [
            web3Utils.toChecksumAddress(getAssetInfo('WETH', ChainId.Ethereum).address),
            0,
            web3Utils.toChecksumAddress(getAssetInfo('USDC', ChainId.Ethereum).address),
            1,
            CloseStrategyType.TAKE_PROFIT_IN_DEBT,
            web3Utils.toChecksumAddress('0x87870Bca3F3fD6335C3F4ce8392D69d0B4161d39'),
            web3Utils.toChecksumAddress('0x0000000000000000000000000000000000000000'),
          ]
        ],
        // STOP_LOSS_IN_DEBT
        [
          [
            '0x000000000000000000000000c02aaa39b223fe8d0a0e5c4f27ead9083c756cc2',
            '0x0000000000000000000000000000000000000000000000000000000000000000',
            '0x000000000000000000000000a0b86991c6218b36c1d19d4a2e9eb0ce3606eb48',
            '0x0000000000000000000000000000000000000000000000000000000000000001',
            '0x0000000000000000000000000000000000000000000000000000000000000003',
            '0x00000000000000000000000087870bca3f3fd6335c3f4ce8392d69d0b4161d39',
            '0x0000000000000000000000000000000000000000000000000000000000000000',
          ],
          [
            web3Utils.toChecksumAddress(getAssetInfo('WETH', ChainId.Ethereum).address),
            0,
            web3Utils.toChecksumAddress(getAssetInfo('USDC', ChainId.Ethereum).address),
            1,
            CloseStrategyType.STOP_LOSS_IN_DEBT,
            web3Utils.toChecksumAddress('0x87870Bca3F3fD6335C3F4ce8392D69d0B4161d39'),
            web3Utils.toChecksumAddress('0x0000000000000000000000000000000000000000'),
          ]
        ],
        // TAKE_PROFIT_AND_STOP_LOSS_IN_COLLATERAL
        [
          [
            '0x000000000000000000000000c02aaa39b223fe8d0a0e5c4f27ead9083c756cc2',
            '0x0000000000000000000000000000000000000000000000000000000000000000',
            '0x000000000000000000000000a0b86991c6218b36c1d19d4a2e9eb0ce3606eb48',
            '0x0000000000000000000000000000000000000000000000000000000000000001',
            '0x0000000000000000000000000000000000000000000000000000000000000004',
            '0x00000000000000000000000087870bca3f3fd6335c3f4ce8392d69d0b4161d39',
            '0x0000000000000000000000001234567890123456789012345678901234567890',
          ],
          [
            web3Utils.toChecksumAddress(getAssetInfo('WETH', ChainId.Ethereum).address),
            0,
            web3Utils.toChecksumAddress(getAssetInfo('USDC', ChainId.Ethereum).address),
            1,
            CloseStrategyType.TAKE_PROFIT_AND_STOP_LOSS_IN_COLLATERAL,
            web3Utils.toChecksumAddress('0x87870Bca3F3fD6335C3F4ce8392D69d0B4161d39'),
            web3Utils.toChecksumAddress('0x1234567890123456789012345678901234567890'),
          ]
        ],
        // TAKE_PROFIT_IN_COLLATERAL_AND_STOP_LOSS_IN_DEBT
        [
          [
            '0x0000000000000000000000002260fac5e5542a773aa44fbcfedf7c193bc2c599',
            '0x0000000000000000000000000000000000000000000000000000000000000002',
            '0x000000000000000000000000a0b86991c6218b36c1d19d4a2e9eb0ce3606eb48',
            '0x0000000000000000000000000000000000000000000000000000000000000001',
            '0x0000000000000000000000000000000000000000000000000000000000000005',
            '0x00000000000000000000000087870bca3f3fd6335c3f4ce8392d69d0b4161d39',
            '0x0000000000000000000000000000000000000000000000000000000000000000',
          ],
          [
            web3Utils.toChecksumAddress(getAssetInfo('WBTC', ChainId.Ethereum).address),
            2,
            web3Utils.toChecksumAddress(getAssetInfo('USDC', ChainId.Ethereum).address),
            1,
            CloseStrategyType.TAKE_PROFIT_IN_COLLATERAL_AND_STOP_LOSS_IN_DEBT,
            web3Utils.toChecksumAddress('0x87870Bca3F3fD6335C3F4ce8392D69d0B4161d39'),
            web3Utils.toChecksumAddress('0x0000000000000000000000000000000000000000'),
          ]
        ],
        // TAKE_PROFIT_AND_STOP_LOSS_IN_DEBT
        [
          [
            '0x0000000000000000000000002260fac5e5542a773aa44fbcfedf7c193bc2c599',
            '0x0000000000000000000000000000000000000000000000000000000000000002',
            '0x000000000000000000000000a0b86991c6218b36c1d19d4a2e9eb0ce3606eb48',
            '0x0000000000000000000000000000000000000000000000000000000000000001',
            '0x0000000000000000000000000000000000000000000000000000000000000006',
            '0x00000000000000000000000087870bca3f3fd6335c3f4ce8392d69d0b4161d39',
            '0x0000000000000000000000000000000000000000000000000000000000000000',
          ],
          [
            web3Utils.toChecksumAddress(getAssetInfo('WBTC', ChainId.Ethereum).address),
            2,
            web3Utils.toChecksumAddress(getAssetInfo('USDC', ChainId.Ethereum).address),
            1,
            CloseStrategyType.TAKE_PROFIT_AND_STOP_LOSS_IN_DEBT,
            web3Utils.toChecksumAddress('0x87870Bca3F3fD6335C3F4ce8392D69d0B4161d39'),
            web3Utils.toChecksumAddress('0x0000000000000000000000000000000000000000'),
          ]
        ],
        // TAKE_PROFIT_IN_DEBT_AND_STOP_LOSS_IN_COLLATERAL
        [
          [
            '0x0000000000000000000000002260fac5e5542a773aa44fbcfedf7c193bc2c599',
            '0x0000000000000000000000000000000000000000000000000000000000000002',
            '0x000000000000000000000000a0b86991c6218b36c1d19d4a2e9eb0ce3606eb48',
            '0x0000000000000000000000000000000000000000000000000000000000000001',
            '0x0000000000000000000000000000000000000000000000000000000000000007',
            '0x00000000000000000000000087870bca3f3fd6335c3f4ce8392d69d0b4161d39',
            '0x0000000000000000000000000000000000000000000000000000000000000000',
          ],
          [
            web3Utils.toChecksumAddress(getAssetInfo('WBTC', ChainId.Ethereum).address),
            2,
            web3Utils.toChecksumAddress(getAssetInfo('USDC', ChainId.Ethereum).address),
            1,
            CloseStrategyType.TAKE_PROFIT_IN_DEBT_AND_STOP_LOSS_IN_COLLATERAL,
            web3Utils.toChecksumAddress('0x87870Bca3F3fD6335C3F4ce8392D69d0B4161d39'),
            web3Utils.toChecksumAddress('0x0000000000000000000000000000000000000000'),
          ]
        ],
      ];

      examples.forEach(([expected, actual]) => {
        it(`Given ${JSON.stringify(
          actual
        )} should return expected value: ${JSON.stringify(expected)}`, () => {
          expect(
            subDataService.aaveV3CloseGenericSubData.encode(...actual)
          ).to.eql(expected);
        });
      });
    });

    describe("decode()", () => {
      const examples: Array<
        [
          {
            collAsset: EthereumAddress,
            collAssetId: number,
            debtAsset: EthereumAddress,
            debtAssetId: number,
            closeType: CloseStrategyType,
            marketAddr: EthereumAddress,
            owner: EthereumAddress,
          },
          string[]
        ]
      > = [
        // TAKE_PROFIT_IN_COLLATERAL
        [
          {
            collAsset: web3Utils.toChecksumAddress(getAssetInfo('WETH', ChainId.Ethereum).address),
            collAssetId: 0,
            debtAsset: web3Utils.toChecksumAddress(getAssetInfo('USDC', ChainId.Ethereum).address),
            debtAssetId: 1,
            closeType: CloseStrategyType.TAKE_PROFIT_IN_COLLATERAL,
            marketAddr: web3Utils.toChecksumAddress('0x87870Bca3F3fD6335C3F4ce8392D69d0B4161d39'),
            owner: web3Utils.toChecksumAddress('0x0000000000000000000000000000000000000000'),
          },
          [
            '0x000000000000000000000000c02aaa39b223fe8d0a0e5c4f27ead9083c756cc2',
            '0x0000000000000000000000000000000000000000000000000000000000000000',
            '0x000000000000000000000000a0b86991c6218b36c1d19d4a2e9eb0ce3606eb48',
            '0x0000000000000000000000000000000000000000000000000000000000000001',
            '0x0000000000000000000000000000000000000000000000000000000000000000',
            '0x00000000000000000000000087870bca3f3fd6335c3f4ce8392d69d0b4161d39',
            '0x0000000000000000000000000000000000000000000000000000000000000000',
          ]
        ],
        // STOP_LOSS_IN_COLLATERAL
        [
          {
            collAsset: web3Utils.toChecksumAddress(getAssetInfo('WETH', ChainId.Ethereum).address),
            collAssetId: 0,
            debtAsset: web3Utils.toChecksumAddress(getAssetInfo('USDC', ChainId.Ethereum).address),
            debtAssetId: 1,
            closeType: CloseStrategyType.STOP_LOSS_IN_COLLATERAL,
            marketAddr: web3Utils.toChecksumAddress('0x87870Bca3F3fD6335C3F4ce8392D69d0B4161d39'),
            owner: web3Utils.toChecksumAddress('0x0000000000000000000000000000000000000000'),
          },
          [
            '0x000000000000000000000000c02aaa39b223fe8d0a0e5c4f27ead9083c756cc2',
            '0x0000000000000000000000000000000000000000000000000000000000000000',
            '0x000000000000000000000000a0b86991c6218b36c1d19d4a2e9eb0ce3606eb48',
            '0x0000000000000000000000000000000000000000000000000000000000000001',
            '0x0000000000000000000000000000000000000000000000000000000000000001',
            '0x00000000000000000000000087870bca3f3fd6335c3f4ce8392d69d0b4161d39',
            '0x0000000000000000000000000000000000000000000000000000000000000000',
          ]
        ],
        // TAKE_PROFIT_IN_DEBT
        [
          {
            collAsset: web3Utils.toChecksumAddress(getAssetInfo('WETH', ChainId.Ethereum).address),
            collAssetId: 0,
            debtAsset: web3Utils.toChecksumAddress(getAssetInfo('USDC', ChainId.Ethereum).address),
            debtAssetId: 1,
            closeType: CloseStrategyType.TAKE_PROFIT_IN_DEBT,
            marketAddr: web3Utils.toChecksumAddress('0x87870Bca3F3fD6335C3F4ce8392D69d0B4161d39'),
            owner: web3Utils.toChecksumAddress('0x0000000000000000000000000000000000000000'),
          },
          [
            '0x000000000000000000000000c02aaa39b223fe8d0a0e5c4f27ead9083c756cc2',
            '0x0000000000000000000000000000000000000000000000000000000000000000',
            '0x000000000000000000000000a0b86991c6218b36c1d19d4a2e9eb0ce3606eb48',
            '0x0000000000000000000000000000000000000000000000000000000000000001',
            '0x0000000000000000000000000000000000000000000000000000000000000002',
            '0x00000000000000000000000087870bca3f3fd6335c3f4ce8392d69d0b4161d39',
            '0x0000000000000000000000000000000000000000000000000000000000000000',
          ]
        ],
        // STOP_LOSS_IN_DEBT
        [
          {
            collAsset: web3Utils.toChecksumAddress(getAssetInfo('WETH', ChainId.Ethereum).address),
            collAssetId: 0,
            debtAsset: web3Utils.toChecksumAddress(getAssetInfo('USDC', ChainId.Ethereum).address),
            debtAssetId: 1,
            closeType: CloseStrategyType.STOP_LOSS_IN_DEBT,
            marketAddr: web3Utils.toChecksumAddress('0x87870Bca3F3fD6335C3F4ce8392D69d0B4161d39'),
            owner: web3Utils.toChecksumAddress('0x0000000000000000000000000000000000000000'),
          },
          [
            '0x000000000000000000000000c02aaa39b223fe8d0a0e5c4f27ead9083c756cc2',
            '0x0000000000000000000000000000000000000000000000000000000000000000',
            '0x000000000000000000000000a0b86991c6218b36c1d19d4a2e9eb0ce3606eb48',
            '0x0000000000000000000000000000000000000000000000000000000000000001',
            '0x0000000000000000000000000000000000000000000000000000000000000003',
            '0x00000000000000000000000087870bca3f3fd6335c3f4ce8392d69d0b4161d39',
            '0x0000000000000000000000000000000000000000000000000000000000000000',
          ]
        ],
        // TAKE_PROFIT_AND_STOP_LOSS_IN_COLLATERAL
        [
          {
            collAsset: web3Utils.toChecksumAddress(getAssetInfo('WETH', ChainId.Ethereum).address),
            collAssetId: 0,
            debtAsset: web3Utils.toChecksumAddress(getAssetInfo('USDC', ChainId.Ethereum).address),
            debtAssetId: 1,
            closeType: CloseStrategyType.TAKE_PROFIT_AND_STOP_LOSS_IN_COLLATERAL,
            marketAddr: web3Utils.toChecksumAddress('0x87870Bca3F3fD6335C3F4ce8392D69d0B4161d39'),
            owner: web3Utils.toChecksumAddress('0x1234567890123456789012345678901234567890'),
          },
          [
            '0x000000000000000000000000c02aaa39b223fe8d0a0e5c4f27ead9083c756cc2',
            '0x0000000000000000000000000000000000000000000000000000000000000000',
            '0x000000000000000000000000a0b86991c6218b36c1d19d4a2e9eb0ce3606eb48',
            '0x0000000000000000000000000000000000000000000000000000000000000001',
            '0x0000000000000000000000000000000000000000000000000000000000000004',
            '0x00000000000000000000000087870bca3f3fd6335c3f4ce8392d69d0b4161d39',
            '0x0000000000000000000000001234567890123456789012345678901234567890',
          ]
        ],
        // TAKE_PROFIT_IN_COLLATERAL_AND_STOP_LOSS_IN_DEBT
        [
          {
            collAsset: web3Utils.toChecksumAddress(getAssetInfo('WBTC', ChainId.Ethereum).address),
            collAssetId: 2,
            debtAsset: web3Utils.toChecksumAddress(getAssetInfo('USDC', ChainId.Ethereum).address),
            debtAssetId: 1,
            closeType: CloseStrategyType.TAKE_PROFIT_IN_COLLATERAL_AND_STOP_LOSS_IN_DEBT,
            marketAddr: web3Utils.toChecksumAddress('0x87870Bca3F3fD6335C3F4ce8392D69d0B4161d39'),
            owner: web3Utils.toChecksumAddress('0x0000000000000000000000000000000000000000'),
          },
          [
            '0x0000000000000000000000002260fac5e5542a773aa44fbcfedf7c193bc2c599',
            '0x0000000000000000000000000000000000000000000000000000000000000002',
            '0x000000000000000000000000a0b86991c6218b36c1d19d4a2e9eb0ce3606eb48',
            '0x0000000000000000000000000000000000000000000000000000000000000001',
            '0x0000000000000000000000000000000000000000000000000000000000000005',
            '0x00000000000000000000000087870bca3f3fd6335c3f4ce8392d69d0b4161d39',
            '0x0000000000000000000000000000000000000000000000000000000000000000',
          ]
        ],
        // TAKE_PROFIT_AND_STOP_LOSS_IN_DEBT
        [
          {
            collAsset: web3Utils.toChecksumAddress(getAssetInfo('WBTC', ChainId.Ethereum).address),
            collAssetId: 2,
            debtAsset: web3Utils.toChecksumAddress(getAssetInfo('USDC', ChainId.Ethereum).address),
            debtAssetId: 1,
            closeType: CloseStrategyType.TAKE_PROFIT_AND_STOP_LOSS_IN_DEBT,
            marketAddr: web3Utils.toChecksumAddress('0x87870Bca3F3fD6335C3F4ce8392D69d0B4161d39'),
            owner: web3Utils.toChecksumAddress('0x0000000000000000000000000000000000000000'),
          },
          [
            '0x0000000000000000000000002260fac5e5542a773aa44fbcfedf7c193bc2c599',
            '0x0000000000000000000000000000000000000000000000000000000000000002',
            '0x000000000000000000000000a0b86991c6218b36c1d19d4a2e9eb0ce3606eb48',
            '0x0000000000000000000000000000000000000000000000000000000000000001',
            '0x0000000000000000000000000000000000000000000000000000000000000006',
            '0x00000000000000000000000087870bca3f3fd6335c3f4ce8392d69d0b4161d39',
            '0x0000000000000000000000000000000000000000000000000000000000000000',
          ]
        ],
        // TAKE_PROFIT_IN_DEBT_AND_STOP_LOSS_IN_COLLATERAL
        [
          {
            collAsset: web3Utils.toChecksumAddress(getAssetInfo('WBTC', ChainId.Ethereum).address),
            collAssetId: 2,
            debtAsset: web3Utils.toChecksumAddress(getAssetInfo('USDC', ChainId.Ethereum).address),
            debtAssetId: 1,
            closeType: CloseStrategyType.TAKE_PROFIT_IN_DEBT_AND_STOP_LOSS_IN_COLLATERAL,
            marketAddr: web3Utils.toChecksumAddress('0x87870Bca3F3fD6335C3F4ce8392D69d0B4161d39'),
            owner: web3Utils.toChecksumAddress('0x0000000000000000000000000000000000000000'),
          },
          [
            '0x0000000000000000000000002260fac5e5542a773aa44fbcfedf7c193bc2c599',
            '0x0000000000000000000000000000000000000000000000000000000000000002',
            '0x000000000000000000000000a0b86991c6218b36c1d19d4a2e9eb0ce3606eb48',
            '0x0000000000000000000000000000000000000000000000000000000000000001',
            '0x0000000000000000000000000000000000000000000000000000000000000007',
            '0x00000000000000000000000087870bca3f3fd6335c3f4ce8392d69d0b4161d39',
            '0x0000000000000000000000000000000000000000000000000000000000000000',
          ]
        ],
      ];

      examples.forEach(([expected, actual]) => {
        it(`Given ${JSON.stringify(
          actual
        )} should return expected value: ${JSON.stringify(expected)}`, () => {
          expect(
            subDataService.aaveV3CloseGenericSubData.decode(actual)
          ).to.eql(expected);
        });
      });
    });
  });
});
