import Dec from 'decimal.js';
import {expect} from 'chai';
import {getAssetInfo} from '@defisaver/tokens';
import * as web3Utils from 'web3-utils';

import {ChainId, OrderType, RatioState} from '../types/enums';
import type {EthereumAddress, SubData} from '../types';

import {
  aaveV2LeverageManagementSubData,
  aaveV3LeverageManagementSubData,
  aaveV3QuotePriceSubData,
  cBondsRebondSubData,
  compoundV2LeverageManagementSubData,
  compoundV3LeverageManagementSubData,
  exchangeDcaSubData,
  exchangeLimitOrderSubData,
  liquityCloseSubData,
  liquityDebtInFrontRepaySubData,
  liquityDsrPaybackSubData,
  liquityDsrSupplySubData,
  liquityLeverageManagementSubData,
  liquityPaybackUsingChickenBondSubData,
  liquityRepayFromSavingsSubData,
  makerCloseSubData,
  makerLeverageManagementSubData,
  makerRepayFromSavingsSubData,
  morphoAaveV2LeverageManagementSubData,
  sparkLeverageManagementSubData,
  sparkQuotePriceSubData,
  crvUSDLeverageManagementSubData,
} from './subDataService';

describe('Feature: subDataService.ts', () => {

  describe('When testing subDataService.makerRepayFromSavingsSubData', () => {
    describe('encode()', () => {
      const examples: Array<[SubData, [vaultId: number, targetRatioPercentage: number, chainId: ChainId, daiAddr?: EthereumAddress, mcdCdpManagerAddr?: EthereumAddress]]> = [
        [
          [
            "0x000000000000000000000000000000000000000000000000000000000000007b", "0x00000000000000000000000000000000000000000000000010a741a462780000",
            "0x0000000000000000000000006b175474e89094c44da98b954eedeac495271d0f", "0x0000000000000000000000002f39d218133afab8f2b819b1066c7e434ad94e9e",
          ],
          [123, 120, ChainId.Ethereum, web3Utils.toChecksumAddress(getAssetInfo('DAI', ChainId.Ethereum).address), web3Utils.toChecksumAddress('0x2f39d218133AFaB8F2B819B1066c7E434Ad94E9e')]
        ],
      ];

      examples.forEach(([expected, actual]) => {
        it(`Given ${actual} should return expected value: ${expected}`, () => {
          expect(makerRepayFromSavingsSubData.encode(...actual)).to.eql(expected);
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
            "0x000000000000000000000000000000000000000000000000000000000000007b", "0x00000000000000000000000000000000000000000000000010a741a462780000",
            "0x0000000000000000000000006b175474e89094c44da98b954eedeac495271d0f", "0x0000000000000000000000002f39d218133afab8f2b819b1066c7e434ad94e9e",
          ],
        ],
      ];

      examples.forEach(([expected, actual]) => {
        it(`Given ${actual} should return expected value: ${JSON.stringify(expected)}`, () => {
          expect(makerRepayFromSavingsSubData.decode(actual)).to.eql(expected);
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
            "0x0000000000000000000000000000000000000000000000000000000000000000", "0x00000000000000000000000000000000000000000000000010a741a462780000",
            "0x0000000000000000000000000000000000000000000000000000000000000000", "0x0000000000000000000000000000000000000000000000000000000000000000",
          ],
        ],
      ];

      examples.forEach(([expected, actual]) => {
        it(`Given ${actual} should return expected value: ${JSON.stringify(expected)}`, () => {
          expect(liquityRepayFromSavingsSubData.decode(actual)).to.eql(expected);
        });
      });
    });
  });

  describe('When testing subDataService.makerCloseSubData', () => {
    describe('encode()', () => {
      const examples: Array<[SubData, [vaultId: number, closeToAssetAddr: EthereumAddress, chainId: ChainId, daiAddr?: EthereumAddress, mcdCdpManagerAddr?: EthereumAddress]]> = [
        [
          [
            "0x0000000000000000000000000000000000000000000000000000000000000141", "0x000000000000000000000000c02aaa39b223fe8d0a0e5c4f27ead9083c756cc2",
            "0x0000000000000000000000006b175474e89094c44da98b954eedeac495271d0f", "0x0000000000000000000000002f39d218133afab8f2b819b1066c7e434ad94e9e",
          ],
          [321, web3Utils.toChecksumAddress(getAssetInfo('WETH', ChainId.Ethereum).address), ChainId.Ethereum, web3Utils.toChecksumAddress(getAssetInfo('DAI', ChainId.Ethereum).address), web3Utils.toChecksumAddress('0x2f39d218133AFaB8F2B819B1066c7E434Ad94E9e')]
        ],
        [
          [
            "0x00000000000000000000000000000000000000000000000000000000000001a4", "0x0000000000000000000000002260fac5e5542a773aa44fbcfedf7c193bc2c599",
            "0x0000000000000000000000006b175474e89094c44da98b954eedeac495271d0f", "0x0000000000000000000000002439d218133afab8f2b819b1066c7e434ad94e9e",
          ],
          [420, web3Utils.toChecksumAddress(getAssetInfo('WBTC', ChainId.Ethereum).address), ChainId.Ethereum, web3Utils.toChecksumAddress(getAssetInfo('DAI', ChainId.Ethereum).address), web3Utils.toChecksumAddress('0x2439d218133AFaB8F2B819B1066c7E434Ad94E9e')]
        ],
      ];

      examples.forEach(([expected, actual]) => {
        it(`Given ${actual} should return expected value: ${expected}`, () => {
          expect(makerCloseSubData.encode(...actual)).to.eql(expected);
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
            "0x0000000000000000000000000000000000000000000000000000000000000141", "0x000000000000000000000000c02aaa39b223fe8d0a0e5c4f27ead9083c756cc2",
            "0x0000000000000000000000006b175474e89094c44da98b954eedeac495271d0f", "0x0000000000000000000000002f39d218133afab8f2b819b1066c7e434ad94e9e",
          ],
        ],
        [
          {
            vaultId: 420,
            closeToAssetAddr: web3Utils.toChecksumAddress(getAssetInfo('WBTC', ChainId.Ethereum).address),
          },
          [
            "0x00000000000000000000000000000000000000000000000000000000000001a4", "0x0000000000000000000000002260fac5e5542a773aa44fbcfedf7c193bc2c599",
            "0x0000000000000000000000006b175474e89094c44da98b954eedeac495271d0f", "0x0000000000000000000000002439d218133afab8f2b819b1066c7e434ad94e9e",
          ],
        ],
      ];

      examples.forEach(([expected, actual]) => {
        it(`Given ${actual} should return expected value: ${JSON.stringify(expected)}`, () => {
          expect(makerCloseSubData.decode(actual)).to.eql(expected);
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
          expect(makerLeverageManagementSubData.decode(actual)).to.eql(expected);
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
          expect(liquityLeverageManagementSubData.decode(actual)).to.eql(expected);
        });
      });
    });
  });

  describe('When testing subDataService.liquityCloseSubData', () => {
    describe('encode()', () => {
      const examples: Array<[SubData, [closeToAssetAddr: EthereumAddress, chainId: ChainId, collAddr?: EthereumAddress, debtAddr?: EthereumAddress]]> = [
        [
          [
            "0x000000000000000000000000c02aaa39b223fe8d0a0e5c4f27ead9083c756cc2", "0x0000000000000000000000005f98805a4e8be255a32880fdec7f6728c6568ba0",
          ],
          [web3Utils.toChecksumAddress(getAssetInfo('LUSD', ChainId.Ethereum).address), ChainId.Ethereum, web3Utils.toChecksumAddress(getAssetInfo('WETH', ChainId.Ethereum).address), web3Utils.toChecksumAddress(getAssetInfo('LUSD', ChainId.Ethereum).address)]
        ],
        [
          [
            "0x000000000000000000000000c02aaa39b223fe8d0a0e5c4f27ead9083c756cc2", "0x0000000000000000000000005f98805a4e8be255a32880fdec7f6728c6568ba0",
          ],
          [web3Utils.toChecksumAddress(getAssetInfo('LUSD', ChainId.Ethereum).address), ChainId.Ethereum]
        ],
      ];

      examples.forEach(([expected, actual]) => {
        it(`Given ${actual} should return expected value: ${expected}`, () => {
          expect(liquityCloseSubData.encode(...actual)).to.eql(expected);
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
            "0x0000000000000000000000005f98805a4e8be255a32880fdec7f6728c6568ba0", "0x0000000000000000000000005f98805a4e8be255a32880fdec7f6728c6568ba0",
          ],
        ],
        [
          {
            closeToAssetAddr: web3Utils.toChecksumAddress(getAssetInfo('WETH', ChainId.Ethereum).address),
            debtAddr: web3Utils.toChecksumAddress(getAssetInfo('LUSD', ChainId.Ethereum).address),
          },
          [
            "0x000000000000000000000000c02aaa39b223fe8d0a0e5c4f27ead9083c756cc2", "0x0000000000000000000000005f98805a4e8be255a32880fdec7f6728c6568ba0",
          ],
        ],
      ];

      examples.forEach(([expected, actual]) => {
        it(`Given ${actual} should return expected value: ${JSON.stringify(expected)}`, () => {
          expect(liquityCloseSubData.decode(actual)).to.eql(expected);
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
          expect(aaveV2LeverageManagementSubData.encode(...actual)).to.eql(expected);
        });
      });
    });

    describe('decode()', () => {
      const examples: Array<[{ targetRatio: number }, SubData]> = [
        [
          { targetRatio: 200 },
          ["0x0000000000000000000000000000000000000000000000000000000000000000", "0x0000000000000000000000000000000000000000000000001bc16d674ec80000"],
        ],
        [
          { targetRatio: 123 },
          ["0x0000000000000000000000000000000000000000000000000000000000000000", "0x0000000000000000000000000000000000000000000000001111d67bb1bb0000"],
        ],
      ];

      examples.forEach(([expected, actual]) => {
        it(`Given ${actual} should return expected value: ${JSON.stringify(expected)}`, () => {
          expect(aaveV2LeverageManagementSubData.decode(actual)).to.eql(expected);
        });
      });
    });
  });

  describe('When testing subDataService.aaveV3LeverageManagementSubData', () => {
    describe('decode()', () => {
      const examples: Array<[{ targetRatio: number }, SubData]> = [
        [
          { targetRatio: 200 },
          ["0x0000000000000000000000000000000000000000000000001bc16d674ec80000"],
        ],
        [
          { targetRatio: 123 },
          ["0x0000000000000000000000000000000000000000000000001111d67bb1bb0000"],
        ],
      ];

      examples.forEach(([expected, actual]) => {
        it(`Given ${actual} should return expected value: ${JSON.stringify(expected)}`, () => {
          expect(aaveV3LeverageManagementSubData.decode(actual)).to.eql(expected);
        });
      });
    });
  });

  describe('When testing subDataService.aaveV3QuotePriceSubData', () => {
    describe('encode()', () => {
      const examples: Array<[SubData, [collAsset: EthereumAddress, collAssetId: number, debtAsset: EthereumAddress, debtAssetId: number, nullAddress?: EthereumAddress]]> = [
        [
          [
            "0x000000000000000000000000c02aaa39b223fe8d0a0e5c4f27ead9083c756cc2", "0x0000000000000000000000000000000000000000000000000000000000000002",
            "0x0000000000000000000000006b175474e89094c44da98b954eedeac495271d0f", "0x0000000000000000000000000000000000000000000000000000000000000004",
            "0x0000000000000000000000000000000000000000000000000000000000000000",
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
            "0x0000000000000000000000005979d7b546e38e414f7e9822514be443a4800529", "0x0000000000000000000000000000000000000000000000000000000000000006",
            "0x000000000000000000000000af88d065e77c8cc2239327c5edb3a432268e5831", "0x0000000000000000000000000000000000000000000000000000000000000002",
            "0x0000000000000000000000000000000000000000000000000000000000000000",
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
          expect(aaveV3QuotePriceSubData.encode(...actual)).to.eql(expected);
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
            "0x000000000000000000000000c02aaa39b223fe8d0a0e5c4f27ead9083c756cc2", "0x0000000000000000000000000000000000000000000000000000000000000002",
            "0x0000000000000000000000006b175474e89094c44da98b954eedeac495271d0f", "0x0000000000000000000000000000000000000000000000000000000000000004",
            "0x0000000000000000000000000000000000000000000000000000000000000000",
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
            "0x0000000000000000000000005979d7b546e38e414f7e9822514be443a4800529", "0x0000000000000000000000000000000000000000000000000000000000000006",
            "0x000000000000000000000000af88d065e77c8cc2239327c5edb3a432268e5831", "0x0000000000000000000000000000000000000000000000000000000000000002",
            "0x0000000000000000000000000000000000000000000000000000000000000000",
          ],
        ],
      ];

      examples.forEach(([expected, actual]) => {
        it(`Given ${actual} should return expected value: ${JSON.stringify(expected)}`, () => {
          expect(aaveV3QuotePriceSubData.decode(actual)).to.eql(expected);
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
          expect(compoundV2LeverageManagementSubData.encode(...actual)).to.eql(expected);
        });
      });
    });

    describe('decode()', () => {
      const examples: Array<[{ targetRatio: number }, SubData]> = [
        [
          { targetRatio: 200 },
          ["0x0000000000000000000000000000000000000000000000001bc16d674ec80000"],
        ],
        [
          { targetRatio: 123 },
          ["0x0000000000000000000000000000000000000000000000001111d67bb1bb0000"],
        ],
      ];

      examples.forEach(([expected, actual]) => {
        it(`Given ${actual} should return expected value: ${JSON.stringify(expected)}`, () => {
          expect(compoundV2LeverageManagementSubData.decode(actual)).to.eql(expected);
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
          expect(compoundV3LeverageManagementSubData.encode(...actual)).to.eql(expected);
        });
      });
    });

    describe('decode()', () => {
      const examples: Array<[{ targetRatio: number }, SubData]> = [
        [
          { targetRatio: 123 },
          [
            "0x0000000000000000000000000000000000000000000000000000000000000000", "0x0000000000000000000000000000000000000000000000000000000000000000",
            "0x0000000000000000000000000000000000000000000000000000000000000000", "0x0000000000000000000000000000000000000000000000001111d67bb1bb0000",
          ],
        ],
        [
          { targetRatio: 200 },
          [
            "0x0000000000000000000000000000000000000000000000000000000000000000", "0x0000000000000000000000000000000000000000000000000000000000000000",
            "0x0000000000000000000000000000000000000000000000000000000000000000", "0x0000000000000000000000000000000000000000000000001bc16d674ec80000",
          ],
        ],
      ];

      examples.forEach(([expected, actual]) => {
        it(`Given ${actual} should return expected value: ${JSON.stringify(expected)}`, () => {
          expect(compoundV3LeverageManagementSubData.decode(actual)).to.eql(expected);
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
          expect(morphoAaveV2LeverageManagementSubData.encode(...actual)).to.eql(expected);
        });
      });
    });

    describe('decode()', () => {
      const examples: Array<[{ targetRatio: number }, SubData]> = [
        [
          { targetRatio: 200 },
          ["0x0000000000000000000000000000000000000000000000000000000000000000", "0x0000000000000000000000000000000000000000000000001bc16d674ec80000"],
        ],
        [
          { targetRatio: 123 },
          ["0x0000000000000000000000000000000000000000000000000000000000000000", "0x0000000000000000000000000000000000000000000000001111d67bb1bb0000"],
        ],
      ];

      examples.forEach(([expected, actual]) => {
        it(`Given ${actual} should return expected value: ${JSON.stringify(expected)}`, () => {
          expect(morphoAaveV2LeverageManagementSubData.decode(actual)).to.eql(expected);
        });
      });
    });
  });

  describe('When testing subDataService.cBondsRebondSubData', () => {
    describe('encode()', () => {
      const examples: Array<[SubData, [bondId: number | string]]> = [
        [
          ["0x00000000000000000000000000000000000000000000000000000000000000c8"],
          [200]
        ],
        [
          ["0x000000000000000000000000000000000000000000000000000000000000a119"],
          [41241]
        ],
      ];

      examples.forEach(([expected, actual]) => {
        it(`Given ${actual} should return expected value: ${expected}`, () => {
          expect(cBondsRebondSubData.encode(...actual)).to.eql(expected);
        });
      });
    });

    describe('decode()', () => {
      const examples: Array<[{ bondId: string }, SubData]> = [
        [
          { bondId: '200' },
          ["0x0000000000000000000000000000000000000000000000000000000000000000", "0x00000000000000000000000000000000000000000000000000000000000000c8"],
        ],
        [
          { bondId: '41241' },
          ["0x0000000000000000000000000000000000000000000000000000000000000000", "0x000000000000000000000000000000000000000000000000000000000000a119"],
        ],
      ];

      examples.forEach(([expected, actual]) => {
        it(`Given ${actual} should return expected value: ${JSON.stringify(expected)}`, () => {
          expect(cBondsRebondSubData.decode(actual)).to.eql(expected);
        });
      });
    });
  });

  describe('When testing subDataService.liquityPaybackUsingChickenBondSubData', () => {
    describe('encode()', () => {
      const examples: Array<[SubData, [sourceId: string, sourceType: number, chainId?: ChainId]]> = [
        [
          [
            "0x0000000000000000000000000000000000000000000000000000000000001076", "0x0000000000000000000000000000000000000000000000000000000000000000",
            "0x0000000000000000000000005f98805a4e8be255a32880fdec7f6728c6568ba0", "0x000000000000000000000000b9d7dddca9a4ac480991865efef82e01273f79c3",
          ],
          ['4214', 0, ChainId.Ethereum]
        ],
        [
          [
            "0x00000000000000000000000000000000000000000000000000000000000002b8", "0x0000000000000000000000000000000000000000000000000000000000000001",
            "0x0000000000000000000000005f98805a4e8be255a32880fdec7f6728c6568ba0", "0x000000000000000000000000b9d7dddca9a4ac480991865efef82e01273f79c3",
          ],
          ['696', 1]
        ],
      ];

      examples.forEach(([expected, actual]) => {
        it(`Given ${actual} should return expected value: ${expected}`, () => {
          expect(liquityPaybackUsingChickenBondSubData.encode(...actual)).to.eql(expected);
        });
      });
    });

    describe('decode()', () => {
      const examples: Array<[{ sourceId: string, sourceType: string }, SubData]> = [
        [
          { sourceId: '4214', sourceType: '0' },
          [
            "0x0000000000000000000000000000000000000000000000000000000000001076", "0x0000000000000000000000000000000000000000000000000000000000000000",
            "0x0000000000000000000000005f98805a4e8be255a32880fdec7f6728c6568ba0", "0x000000000000000000000000b9d7dddca9a4ac480991865efef82e01273f79c3",
          ],
        ],
        [
          { sourceId: '696', sourceType: '1' },
          [
            "0x00000000000000000000000000000000000000000000000000000000000002b8", "0x0000000000000000000000000000000000000000000000000000000000000001",
            "0x0000000000000000000000005f98805a4e8be255a32880fdec7f6728c6568ba0", "0x000000000000000000000000b9d7dddca9a4ac480991865efef82e01273f79c3",
          ],
        ],
      ];

      examples.forEach(([expected, actual]) => {
        it(`Given ${actual} should return expected value: ${JSON.stringify(expected)}`, () => {
          expect(liquityPaybackUsingChickenBondSubData.decode(actual)).to.eql(expected);
        });
      });
    });
  });

  describe('When testing subDataService.exchangeDcaSubData', () => {
    describe('encode()', () => {
      const examples: Array<[SubData, [fromToken: EthereumAddress, toToken: EthereumAddress, amount: string, interval: number]]> = [
        [
          [
            "0x000000000000000000000000c02aaa39b223fe8d0a0e5c4f27ead9083c756cc2", "0x0000000000000000000000006b175474e89094c44da98b954eedeac495271d0f",
            "0x0000000000000000000000000000000000000000000000000000000000000853", "0x0000000000000000000000000000000000000000000000000000000000231860"
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
            "0x0000000000000000000000002f2a2543b76a4166549f7aab2e75bef0aefc5b0f", "0x000000000000000000000000f97f4df75117a78c1a5a0dbb814af92458539fb4",
            "0x00000000000000000000000000000000000000000000000000000000003eddd7", "0x0000000000000000000000000000000000000000000000000000000008f57500"
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
          expect(exchangeDcaSubData.encode(...actual)).to.eql(expected);
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
              "0x000000000000000000000000c02aaa39b223fe8d0a0e5c4f27ead9083c756cc2", "0x0000000000000000000000006b175474e89094c44da98b954eedeac495271d0f",
              "0x0000000000000000000000000000000000000000000000000000000000000853", "0x0000000000000000000000000000000000000000000000000000000000231860"
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
              "0x0000000000000000000000002f2a2543b76a4166549f7aab2e75bef0aefc5b0f", "0x000000000000000000000000f97f4df75117a78c1a5a0dbb814af92458539fb4",
              "0x00000000000000000000000000000000000000000000000000000000003eddd7", "0x0000000000000000000000000000000000000000000000000000000008f57500"
            ],
           ChainId.Arbitrum
          ]
        ],
      ];

      examples.forEach(([expected, actual]) => {
        it(`Given ${actual} should return expected value: ${JSON.stringify(expected)}`, () => {
          expect(exchangeDcaSubData.decode(...actual)).to.eql(expected);
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
          expect(exchangeLimitOrderSubData.encode(...actual)).to.eql(expected);
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
              "0x000000000000000000000000c02aaa39b223fe8d0a0e5c4f27ead9083c756cc2", "0x0000000000000000000000006b175474e89094c44da98b954eedeac495271d0f",
              "0x0000000000000000000000000000000000000000000000000000000000000853", "0x0000000000000000000000000000000000000000000000000000000000231860"
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
              "0x0000000000000000000000002f2a2543b76a4166549f7aab2e75bef0aefc5b0f", "0x000000000000000000000000f97f4df75117a78c1a5a0dbb814af92458539fb4",
              "0x00000000000000000000000000000000000000000000000000000000003eddd7", "0x0000000000000000000000000000000000000000000000000000000008f57500"
            ],
            ChainId.Arbitrum
          ]
        ],
      ];

      examples.forEach(([expected, actual]) => {
        it(`Given ${actual} should return expected value: ${JSON.stringify(expected)}`, () => {
          expect(exchangeLimitOrderSubData.decode(...actual)).to.eql(expected);
        });
      });
    });
  });

  describe('When testing subDataService.sparkLeverageManagementSubData', () => {
    describe('decode()', () => {
      const examples: Array<[{ targetRatio: number }, SubData]> = [
        [
          { targetRatio: 200 },
          ["0x0000000000000000000000000000000000000000000000001bc16d674ec80000"],
        ],
        [
          { targetRatio: 123 },
          ["0x0000000000000000000000000000000000000000000000001111d67bb1bb0000"],
        ],
      ];

      examples.forEach(([expected, actual]) => {
        it(`Given ${actual} should return expected value: ${JSON.stringify(expected)}`, () => {
          expect(sparkLeverageManagementSubData.decode(actual)).to.eql(expected);
        });
      });
    });
  });

  describe('When testing subDataService.sparkQuotePriceSubData', () => {
    describe('encode()', () => {
      const examples: Array<[SubData, [collAsset: EthereumAddress, collAssetId: number, debtAsset: EthereumAddress, debtAssetId: number, nullAddress?: EthereumAddress]]> = [
        [
          [
            "0x000000000000000000000000c02aaa39b223fe8d0a0e5c4f27ead9083c756cc2", "0x0000000000000000000000000000000000000000000000000000000000000002",
            "0x0000000000000000000000006b175474e89094c44da98b954eedeac495271d0f", "0x0000000000000000000000000000000000000000000000000000000000000004",
            "0x0000000000000000000000000000000000000000000000000000000000000000",
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
            "0x0000000000000000000000005979d7b546e38e414f7e9822514be443a4800529", "0x0000000000000000000000000000000000000000000000000000000000000006",
            "0x000000000000000000000000af88d065e77c8cc2239327c5edb3a432268e5831", "0x0000000000000000000000000000000000000000000000000000000000000002",
            "0x0000000000000000000000000000000000000000000000000000000000000000",
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
          expect(sparkQuotePriceSubData.encode(...actual)).to.eql(expected);
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
            "0x000000000000000000000000c02aaa39b223fe8d0a0e5c4f27ead9083c756cc2", "0x0000000000000000000000000000000000000000000000000000000000000002",
            "0x0000000000000000000000006b175474e89094c44da98b954eedeac495271d0f", "0x0000000000000000000000000000000000000000000000000000000000000004",
            "0x0000000000000000000000000000000000000000000000000000000000000000",
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
            "0x0000000000000000000000005979d7b546e38e414f7e9822514be443a4800529", "0x0000000000000000000000000000000000000000000000000000000000000006",
            "0x000000000000000000000000af88d065e77c8cc2239327c5edb3a432268e5831", "0x0000000000000000000000000000000000000000000000000000000000000002",
            "0x0000000000000000000000000000000000000000000000000000000000000000",
          ],
        ],
      ];

      examples.forEach(([expected, actual]) => {
        it(`Given ${actual} should return expected value: ${JSON.stringify(expected)}`, () => {
          expect(sparkQuotePriceSubData.decode(actual)).to.eql(expected);
        });
      });
    });
  });

  describe('When testing subDataService.liquityDsrPaybackSubData', () => {
    describe('encode()', () => {
      const examples: Array<[SubData, [targetRatio: number]]> = [
        [
          [
            "0x0000000000000000000000000000000000000000000000000000000000000001", "0x0000000000000000000000000000000000000000000000001111d67bb1bb0000",
            "0x0000000000000000000000006b175474e89094c44da98b954eedeac495271d0f", "0x0000000000000000000000005f98805a4e8be255a32880fdec7f6728c6568ba0",
          ],
          [123]
        ],
        [
          [
            "0x0000000000000000000000000000000000000000000000000000000000000001", "0x0000000000000000000000000000000000000000000000003a4965bf58a40000",
            "0x0000000000000000000000006b175474e89094c44da98b954eedeac495271d0f", "0x0000000000000000000000005f98805a4e8be255a32880fdec7f6728c6568ba0",
          ],
          [420]
        ],
      ];

      examples.forEach(([expected, actual]) => {
        it(`Given ${actual} should return expected value: ${expected}`, () => {
          expect(liquityDsrPaybackSubData.encode(...actual)).to.eql(expected);
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
            "0x0000000000000000000000000000000000000000000000000000000000000001", "0x0000000000000000000000000000000000000000000000001111d67bb1bb0000",
            "0x0000000000000000000000006b175474e89094c44da98b954eedeac495271d0f", "0x0000000000000000000000005f98805a4e8be255a32880fdec7f6728c6568ba0",
          ],
        ],
        [
          {
            targetRatio: 420,
          },
          [
            "0x0000000000000000000000000000000000000000000000000000000000000001", "0x0000000000000000000000000000000000000000000000003a4965bf58a40000",
            "0x0000000000000000000000006b175474e89094c44da98b954eedeac495271d0f", "0x0000000000000000000000005f98805a4e8be255a32880fdec7f6728c6568ba0",
          ],
        ],
      ];

      examples.forEach(([expected, actual]) => {
        it(`Given ${actual} should return expected value: ${JSON.stringify(expected)}`, () => {
          expect(liquityDsrPaybackSubData.decode(actual)).to.eql(expected);
        });
      });
    });
  });

  describe('When testing subDataService.liquityDsrSupplySubData', () => {
    describe('encode()', () => {
      const examples: Array<[SubData, [targetRatio: number]]> = [
        [
          [
            "0x0000000000000000000000000000000000000000000000000000000000000001", "0x0000000000000000000000000000000000000000000000002c68af0bb1400000",
            "0x0000000000000000000000006b175474e89094c44da98b954eedeac495271d0f", "0x000000000000000000000000c02aaa39b223fe8d0a0e5c4f27ead9083c756cc2",
          ],
          [320]
        ],
        [
          [
            "0x0000000000000000000000000000000000000000000000000000000000000001", "0x0000000000000000000000000000000000000000000000001eab7f4a799d0000",
            "0x0000000000000000000000006b175474e89094c44da98b954eedeac495271d0f", "0x000000000000000000000000c02aaa39b223fe8d0a0e5c4f27ead9083c756cc2",
          ],
          [221]
        ],
      ];

      examples.forEach(([expected, actual]) => {
        it(`Given ${actual} should return expected value: ${expected}`, () => {
          expect(liquityDsrSupplySubData.encode(...actual)).to.eql(expected);
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
            "0x0000000000000000000000000000000000000000000000000000000000000001", "0x0000000000000000000000000000000000000000000000002c68af0bb1400000",
            "0x0000000000000000000000006b175474e89094c44da98b954eedeac495271d0f", "0x000000000000000000000000c02aaa39b223fe8d0a0e5c4f27ead9083c756cc2",
          ],
        ],
        [
          {
            targetRatio: 221,
          },
          [
            "0x0000000000000000000000000000000000000000000000000000000000000001", "0x0000000000000000000000000000000000000000000000001eab7f4a799d0000",
            "0x0000000000000000000000006b175474e89094c44da98b954eedeac495271d0f", "0x000000000000000000000000c02aaa39b223fe8d0a0e5c4f27ead9083c756cc2",
          ],
        ],
      ];

      examples.forEach(([expected, actual]) => {
        it(`Given ${actual} should return expected value: ${JSON.stringify(expected)}`, () => {
          expect(liquityDsrSupplySubData.decode(actual)).to.eql(expected);
        });
      });
    });
  });

  describe('When testing subDataService.liquityDebtInFrontRepaySubData', () => {
    describe('encode()', () => {
      const examples: Array<[SubData, [targetRatioIncrease: number]]> = [
        [
          [
            "0x000000000000000000000000c02aaa39b223fe8d0a0e5c4f27ead9083c756cc2", "0x0000000000000000000000005f98805a4e8be255a32880fdec7f6728c6568ba0",
            "0x000000000000000000000000000000000000000000000000016345785d8a0000", "0x0000000000000000000000000000000000000000000000000000000000000001",
            "0x0000000000000000000000000000000000000000000000000000000000000000",
          ],
          [10]
        ],
        [
          [
            "0x000000000000000000000000c02aaa39b223fe8d0a0e5c4f27ead9083c756cc2", "0x0000000000000000000000005f98805a4e8be255a32880fdec7f6728c6568ba0",
            "0x000000000000000000000000000000000000000000000000063eb89da4ed0000", "0x0000000000000000000000000000000000000000000000000000000000000001",
            "0x0000000000000000000000000000000000000000000000000000000000000000",
          ],
          [45]
        ],
      ];

      examples.forEach(([expected, actual]) => {
        it(`Given ${actual} should return expected value: ${expected}`, () => {
          expect(liquityDebtInFrontRepaySubData.encode(...actual)).to.eql(expected);
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
            "0x000000000000000000000000c02aaa39b223fe8d0a0e5c4f27ead9083c756cc2", "0x0000000000000000000000005f98805a4e8be255a32880fdec7f6728c6568ba0",
            "0x000000000000000000000000000000000000000000000000016345785d8a0000", "0x0000000000000000000000000000000000000000000000000000000000000001",
            "0x0000000000000000000000000000000000000000000000000000000000000000",
          ],
        ],
        [
          {
            targetRatioIncrease: 45,
          },
          [
            "0x000000000000000000000000c02aaa39b223fe8d0a0e5c4f27ead9083c756cc2", "0x0000000000000000000000005f98805a4e8be255a32880fdec7f6728c6568ba0",
            "0x000000000000000000000000000000000000000000000000063eb89da4ed0000", "0x0000000000000000000000000000000000000000000000000000000000000001",
            "0x0000000000000000000000000000000000000000000000000000000000000000",
          ],
       ],
      ];

      examples.forEach(([expected, actual]) => {
        it(`Given ${actual} should return expected value: ${JSON.stringify(expected)}`, () => {
          expect(liquityDebtInFrontRepaySubData.decode(actual)).to.eql(expected);
        });
      });
    });
  });
  describe('When testing subDataService.crvUSDLeverageManagementSubData', () => {
    describe('encode()', () => {

    });
    describe('decode()', () => {
      const examples: Array<[{
        targetRatio: number,
      }, SubData]> = [
        [
          {
            targetRatio: 140,
          },
          ["0x0000000000000000000000000000000000000000000000001bc16d674ec80000", '0x0000000000000000000000000000000000000000000000000000000000000001', '0x000000000000000000000000000000000000000000000000136dcc951d8c0000', '0x000000000000000000000000c02aaa39b223fe8d0a0e5c4f27ead9083c756cc2', '0x000000000000000000000000f939e0a03fb07f59a73314e73794be0e57ac1b4e'],
        ],
        [
          {
            targetRatio: 180,
          },
          ["0x0000000000000000000000000000000000000000000000001111d67bb1bb0000", '0x0000000000000000000000000000000000000000000000000000000000000000', '0x00000000000000000000000000000000000000000000000018fae27693b40000', '0x000000000000000000000000c02aaa39b223fe8d0a0e5c4f27ead9083c756cc2', '0x000000000000000000000000f939e0a03fb07f59a73314e73794be0e57ac1b4e'],
        ],
      ];

      examples.forEach(([expected, actual]) => {
        it(`Given ${actual} should return expected value: ${JSON.stringify(expected)}`, () => {
          expect(crvUSDLeverageManagementSubData.decode(actual)).to.eql(expected);
        });
      });
    });
  });

});
