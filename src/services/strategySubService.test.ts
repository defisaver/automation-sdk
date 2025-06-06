import { expect } from 'chai';
import Dec from 'decimal.js';
import { otherAddresses } from '@defisaver/sdk';
import { getAssetInfo } from '@defisaver/tokens';
import * as web3Utils from 'web3-utils';

import { Bundles, ChainId, OrderType, RatioState, Strategies } from '../types/enums';
import type { EthereumAddress, StrategyOrBundleIds, SubData, TriggerData } from '../types';

import '../configuration';
import {
  aaveV2Encode,
  chickenBondsEncode,
  liquityEncode,
  makerEncode,
  aaveV3Encode,
  compoundV2Encode,
  compoundV3Encode,
  morphoAaveV2Encode,
  exchangeEncode,
  sparkEncode,
  crvUSDEncode, compoundV3L2Encode, morphoBlueEncode,
} from './strategySubService';

describe('Feature: strategySubService.ts', () => {
  describe('When testing strategySubService.makerEncode', () => {
    // @ts-ignore // TODO - this requires change in @defisaver/tokens
    const mcdCdpManagerAddr = otherAddresses(ChainId.Ethereum).McdCdpManager;

    describe('repayFromSavings()', () => {
      const examples: Array<[
        [StrategyOrBundleIds, boolean, TriggerData, SubData],
        [
          bundleId: StrategyOrBundleIds, vaultId: number, triggerRepayRatio: number, targetRepayRatio: number,
          isBundle?: boolean, chainId?: ChainId, daiAddr?: EthereumAddress, mcdCdpManagerAddr?: EthereumAddress,
        ]
      ]> = [
        [
          [
            Bundles.MainnetIds.MAKER_REPAY_FROM_SMART_SAVINGS_RARI,
            true,
            ['0x00000000000000000000000000000000000000000000000000000000000000de000000000000000000000000000000000000000000000000136dcc951d8c00000000000000000000000000000000000000000000000000000000000000000001'],
            [
              '0x00000000000000000000000000000000000000000000000000000000000000de', '0x00000000000000000000000000000000000000000000000018fae27693b40000',
              '0x0000000000000000000000006b175474e89094c44da98b954eedeac495271d0f', '0x0000000000000000000000005ef30b9986345249bc32d8928b7ee64de9435e39',
            ],
          ],
          [
            Bundles.MainnetIds.MAKER_REPAY_FROM_SMART_SAVINGS_RARI,
            222,
            140,
            180,
            true,
            ChainId.Ethereum,
            getAssetInfo('DAI').address,
            mcdCdpManagerAddr,
          ]
        ]
      ];

      examples.forEach(([expected, actual]) => {
        it(`Given ${actual} should return expected value: ${JSON.stringify(expected)}`, () => {
          expect(makerEncode.repayFromSavings(...actual)).to.eql(expected);
        });
      });
    });

    describe('closeOnPrice()', () => {
      const examples: Array<[
        [StrategyOrBundleIds, boolean, TriggerData, SubData],
        [
          vaultId: number, ratioState: RatioState, price: string, closeToAssetAddr: EthereumAddress,
          chainlinkCollAddress: EthereumAddress, chainId?: ChainId, daiAddr?: EthereumAddress, mcdCdpManagerAddr?: EthereumAddress,
        ]
      ]> = [
        [
          [
            Strategies.MainnetIds.MAKER_CLOSE_ON_PRICE_TO_DAI,
            false,
            ['0x0000000000000000000000002260fac5e5542a773aa44fbcfedf7c193bc2c5990000000000000000000000000000000000000000000000000000000002cc9e4c0000000000000000000000000000000000000000000000000000000000000000'],
            [
              '0x0000000000000000000000000000000000000000000000000000000000000078', '0x0000000000000000000000006b175474e89094c44da98b954eedeac495271d0f',
              '0x0000000000000000000000005ef30b9986345249bc32d8928b7ee64de9435e39',
            ],
          ],
          [
            120,
            RatioState.OVER,
            '0.469643',
            getAssetInfo('DAI').address,
            getAssetInfo('WBTC').address,
            ChainId.Ethereum,
          ]
        ]
      ];

      examples.forEach(([expected, actual]) => {
        it(`Given ${actual} should return expected value: ${JSON.stringify(expected)}`, () => {
          expect(makerEncode.closeOnPrice(...actual)).to.eql(expected);
        });
      });
    });

    describe('trailingStop()', () => {
      const examples: Array<[
        [StrategyOrBundleIds, boolean, TriggerData, SubData],
        [
          vaultId: number, triggerPercentage: number, closeToAssetAddr: EthereumAddress, chainlinkCollAddress: EthereumAddress,
          roundId: number, chainId: ChainId, daiAddr?: EthereumAddress, mcdCdpManagerAddr?: EthereumAddress,
        ]
      ]> = [
        [
          [
            Strategies.MainnetIds.MAKER_TRAILING_STOP_LOSS_TO_COLL,
            false,
            ['0x0000000000000000000000002260fac5e5542a773aa44fbcfedf7c193bc2c599000000000000000000000000000000000000000000000000000000055ae82600000000000000000000000000000000000000000000000000000000000000007b'],
            [
              '0x000000000000000000000000000000000000000000000000000000000000096e', '0x0000000000000000000000002260fac5e5542a773aa44fbcfedf7c193bc2c599',
              '0x0000000000000000000000006b175474e89094c44da98b954eedeac495271d0f', '0x0000000000000000000000005ef30b9986345249bc32d8928b7ee64de9435e39',
            ],
          ],
          [
            2414,
            230,
            getAssetInfo('WBTC').address,
            getAssetInfo('WBTC').address,
            123,
            ChainId.Ethereum,
          ]
        ]
      ];

      examples.forEach(([expected, actual]) => {
        it(`Given ${actual} should return expected value: ${JSON.stringify(expected)}`, () => {
          expect(makerEncode.trailingStop(...actual)).to.eql(expected);
        });
      });
    });

    describe('leverageManagement()', () => {
      const examples: Array<[
        [
          vaultId: number, triggerRepayRatio: string, triggerBoostRatio: string, targetBoostRatio: string,
          targetRepayRatio: string, boostEnabled: boolean,
        ],
        [
          vaultId: number, triggerRepayRatio: string, triggerBoostRatio: string, targetBoostRatio: string,
          targetRepayRatio: string, boostEnabled: boolean,
        ]
      ]> = [
        [
          [
            5791,
            new Dec('210').mul(1e16).toString(),
            new Dec('290').mul(1e16).toString(),
            new Dec('240').mul(1e16).toString(),
            new Dec('240').mul(1e16).toString(),
            true,
          ],
          [
            5791, '210', '290', '240', '240', true,
          ]
        ]
      ];

      examples.forEach(([expected, actual]) => {
        it(`Given ${actual} should return expected value: ${JSON.stringify(expected)}`, () => {
          expect(makerEncode.leverageManagement(...actual)).to.eql(expected);
        });
      });
    });
  });

  describe('When testing strategySubService.liquityEncode', () => {
    describe('closeOnPrice()', () => {
      const examples: Array<[
        [StrategyOrBundleIds, boolean, TriggerData, SubData],
        [
          priceOverOrUnder: RatioState, price: string, closeToAssetAddr: EthereumAddress, chainlinkCollAddress: EthereumAddress,
          chainId?: ChainId, collAddr?: EthereumAddress, debtAddr?: EthereumAddress,
        ]
      ]> = [
        [
          [
            Strategies.MainnetIds.LIQUITY_CLOSE_ON_PRICE_TO_COLL,
            false,
            ['0x000000000000000000000000c02aaa39b223fe8d0a0e5c4f27ead9083c756cc20000000000000000000000000000000000000000000000000000001c027053000000000000000000000000000000000000000000000000000000000000000000'],
            [
              '0x000000000000000000000000c02aaa39b223fe8d0a0e5c4f27ead9083c756cc2', '0x0000000000000000000000005f98805a4e8be255a32880fdec7f6728c6568ba0',
            ],
          ],
          [
            RatioState.OVER,
            '1203',
            getAssetInfo('WETH').address,
            getAssetInfo('WETH').address,
          ]
        ]
      ];

      examples.forEach(([expected, actual]) => {
        it(`Given ${actual} should return expected value: ${JSON.stringify(expected)}`, () => {
          expect(liquityEncode.closeOnPrice(...actual)).to.eql(expected);
        });
      });
    });

    describe('trailingStop()', () => {
      const examples: Array<[
        [StrategyOrBundleIds, boolean, TriggerData, SubData],
        [
          triggerPercentage: number, closeToAssetAddr: EthereumAddress, chainlinkCollAddress: EthereumAddress, roundId: number,
          chainId?: ChainId, collAddr?: EthereumAddress, debtAddr?: EthereumAddress,
        ]
      ]> = [
        [
          [
            Strategies.MainnetIds.LIQUITY_TRAILING_STOP_LOSS_TO_COLL,
            false,
            ['0x000000000000000000000000c02aaa39b223fe8d0a0e5c4f27ead9083c756cc2000000000000000000000000000000000000000000000000000000055ae826000000000000000000000000000000000000000000000000000000000000000c97'],
            [
              '0x000000000000000000000000c02aaa39b223fe8d0a0e5c4f27ead9083c756cc2', '0x0000000000000000000000005f98805a4e8be255a32880fdec7f6728c6568ba0',
            ],
          ],
          [
            230,
            getAssetInfo('WETH').address,
            getAssetInfo('WETH').address,
            3223,
          ]
        ]
      ];

      examples.forEach(([expected, actual]) => {
        it(`Given ${actual} should return expected value: ${JSON.stringify(expected)}`, () => {
          expect(liquityEncode.trailingStop(...actual)).to.eql(expected);
        });
      });
    });

    describe('leverageManagement()', () => {
      const examples: Array<[
        [
          triggerRepayRatio: string, triggerBoostRatio: string, targetBoostRatio: string,
          targetRepayRatio: string, boostEnabled: boolean,
        ],
        [
          triggerRepayRatio: string, triggerBoostRatio: string, targetBoostRatio: string,
          targetRepayRatio: string, boostEnabled: boolean,
        ]
      ]> = [
        [
          [
            new Dec('210').mul(1e16).toString(),
            new Dec('290').mul(1e16).toString(),
            new Dec('240').mul(1e16).toString(),
            new Dec('240').mul(1e16).toString(),
            false,
          ],
          [
            '210', '290', '240', '240', false,
          ]
        ]
      ];

      examples.forEach(([expected, actual]) => {
        it(`Given ${actual} should return expected value: ${JSON.stringify(expected)}`, () => {
          expect(liquityEncode.leverageManagement(...actual)).to.eql(expected);
        });
      });
    });

    describe('paybackFromChickenBondStrategySub()', () => {
      const examples: Array<[
        [StrategyOrBundleIds, boolean, TriggerData, SubData],
        [
          proxyAddress: EthereumAddress, ratio: number, sourceId: string, sourceType: number, ratioState: RatioState,
        ]
      ]> = [
        [
          [
            Bundles.MainnetIds.LIQUITY_PAYBACK_USING_CHICKEN_BOND,
            true,
            ['0x0000000000000000000000002439d211133afab8f2b819b1066c7e434ad94e9e0000000000000000000000000000000000000000000000002dcbf4840eca00000000000000000000000000000000000000000000000000000000000000000000'],
            [
              '0x000000000000000000000000000000000000000000000000000000000000007b', '0x0000000000000000000000000000000000000000000000000000000000000000',
              '0x0000000000000000000000005f98805a4e8be255a32880fdec7f6728c6568ba0', '0x000000000000000000000000b9d7dddca9a4ac480991865efef82e01273f79c3',
            ],
          ],
          [
            web3Utils.toChecksumAddress('0x2439d211133AFaB8F2B819B1066c7E434Ad94E9e'),
            330,
            '123',
            0,
            RatioState.OVER
          ]
        ]
      ];

      examples.forEach(([expected, actual]) => {
        it(`Given ${actual} should return expected value: ${JSON.stringify(expected)}`, () => {
          expect(liquityEncode.paybackFromChickenBondStrategySub(...actual)).to.eql(expected);
        });
      });
    });

    describe('dsrPayback()', () => {
      const examples: Array<[
        [StrategyOrBundleIds, boolean, TriggerData, SubData],
        [proxyAddress: EthereumAddress, triggerRatio: number, targetRatio: number],
      ]> = [
        [
          [
            Strategies.MainnetIds.LIQUITY_DSR_PAYBACK,
            false,
            ['0x0000000000000000000000002439d211133afab8f2b819b1066c7e434ad94e9e000000000000000000000000000000000000000000000000250dbeda8e4b00000000000000000000000000000000000000000000000000000000000000000001'],
            [
              '0x0000000000000000000000000000000000000000000000000000000000000001', '0x00000000000000000000000000000000000000000000000029a2241af62c0000',
              '0x0000000000000000000000006b175474e89094c44da98b954eedeac495271d0f', '0x0000000000000000000000005f98805a4e8be255a32880fdec7f6728c6568ba0',
            ],
          ],
          [web3Utils.toChecksumAddress('0x2439d211133AFaB8F2B819B1066c7E434Ad94E9e'), 267, 300]
        ]
      ];

      examples.forEach(([expected, actual]) => {
        it(`Given ${actual} should return expected value: ${JSON.stringify(expected)}`, () => {
          expect(liquityEncode.dsrPayback(...actual)).to.eql(expected);
        });
      });
    });

    describe('debtInFrontRepay()', () => {
      const examples: Array<[
        [StrategyOrBundleIds, boolean, TriggerData, SubData],
        [proxyAddress: EthereumAddress, debtInFrontMin: string, targetRatioIncrease: number],
      ]> = [
        [
          [
            Strategies.MainnetIds.LIQUITY_DEBT_IN_FRONT_REPAY,
            false,
            ['0x000000000000000000000000235d6a8db3c57c3f7b4eba749e1738db6093732a0000000000000000000000000000000000000000019d971e4fe8401e74000000'],
            [
              '0x000000000000000000000000c02aaa39b223fe8d0a0e5c4f27ead9083c756cc2', '0x0000000000000000000000005f98805a4e8be255a32880fdec7f6728c6568ba0',
              '0x000000000000000000000000000000000000000000000000063eb89da4ed0000', '0x0000000000000000000000000000000000000000000000000000000000000001',
              '0x0000000000000000000000000000000000000000000000000000000000000000'
            ],
          ],
          [web3Utils.toChecksumAddress('0x235d6A8DB3C57c3f7b4ebA749E1738Db6093732a'), '500000000', 45]
        ]
      ];

      examples.forEach(([expected, actual]) => {
        it(`Given ${actual} should return expected value: ${JSON.stringify(expected)}`, () => {
          expect(liquityEncode.debtInFrontRepay(...actual)).to.eql(expected);
        });
      });
    });
  });

  describe('When testing strategySubService.chickenBondsEncode', () => {
    describe('rebond()', () => {
      const examples: Array<[
        SubData,
        [bondId: number],
      ]> = [
        [
          ['0x00000000000000000000000000000000000000000000000000000000000005e3'],
          [1507]
        ]
      ];

      examples.forEach(([expected, actual]) => {
        it(`Given ${actual} should return expected value: ${JSON.stringify(expected)}`, () => {
          expect(chickenBondsEncode.rebond(...actual)).to.eql(expected);
        });
      });
    });
  });

  describe('When testing strategySubService.aaveV2Encode', () => {
    describe('leverageManagement()', () => {
      const examples: Array<[
        [string, string, string, string, boolean],
        [triggerRepayRatio: number, triggerBoostRatio: number, targetBoostRatio: number, targetRepayRatio: number, boostEnabled: boolean],
      ]> = [
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
        it(`Given ${actual} should return expected value: ${JSON.stringify(expected)}`, () => {
          expect(aaveV2Encode.leverageManagement(...actual)).to.eql(expected);
        });
      });
    });
  });

  describe('When testing strategySubService.aaveV3Encode', () => {
    describe('leverageManagement()', () => {
      const examples: Array<[
        string,
        [triggerRepayRatio: number, triggerBoostRatio: number, targetBoostRatio: number, targetRepayRatio: number, boostEnabled: boolean],
      ]> = [
        [
          '0x000000000000000016345785d8a0000000000000000000001e87f85809dc0000000000000000000018fae27693b4000000000000000000001a5e27eef13e000001',
          [160, 220, 180, 190, true]
        ],
        [
          '0x000000000000000016345785d8a0000000000000000000001bc16d674ec80000000000000000000018fae27693b4000000000000000000001a5e27eef13e000000',
          [160, 200, 180, 190, false]
        ],
      ];

      examples.forEach(([expected, actual]) => {
        it(`Given ${actual} should return expected value: ${JSON.stringify(expected)}`, () => {
          expect(aaveV3Encode.leverageManagement(...actual)).to.eql(expected);
        });
      });
    });

    describe('closeToAsset()', () => {
      const examples: Array<[
        [StrategyOrBundleIds, boolean, TriggerData, SubData],
        [
          strategyOrBundleId: number,
          isBundle: boolean,
          triggerData: {
            baseTokenAddress: EthereumAddress, quoteTokenAddress: EthereumAddress, price: number, ratioState: RatioState
          },
          subData: {
            collAsset: EthereumAddress, collAssetId: number, debtAsset: EthereumAddress, debtAssetId: number,
          },
        ]
      ]> = [
        [
          [
            Bundles.MainnetIds.AAVE_V3_CLOSE_TO_COLLATERAL,
            true,
            ['0x000000000000000000000000c02aaa39b223fe8d0a0e5c4f27ead9083c756cc20000000000000000000000006b175474e89094c44da98b954eedeac495271d0f00000000000000000000000000000000000000000000000000000026e1f9c6000000000000000000000000000000000000000000000000000000000000000000'],
            [
              '0x000000000000000000000000c02aaa39b223fe8d0a0e5c4f27ead9083c756cc2', '0x0000000000000000000000000000000000000000000000000000000000000015',
              '0x0000000000000000000000006b175474e89094c44da98b954eedeac495271d0f', '0x0000000000000000000000000000000000000000000000000000000000000020',
              '0x0000000000000000000000000000000000000000000000000000000000000000',
            ],
          ],
          [
            Bundles.MainnetIds.AAVE_V3_CLOSE_TO_COLLATERAL,
            true,
            {
              baseTokenAddress: getAssetInfo('WETH').address, quoteTokenAddress: getAssetInfo('DAI').address, price: 1670, ratioState: RatioState.OVER
            },
            {
              collAsset: getAssetInfo('WETH').address, collAssetId: 21, debtAsset: getAssetInfo('DAI').address, debtAssetId: 32,
            },
          ]
        ],
        [
          [
            Bundles.MainnetIds.AAVE_V3_CLOSE_TO_DEBT,
            true,
            ['0x000000000000000000000000514910771af9ca656af840dff83e8264ecf986ca0000000000000000000000006b175474e89094c44da98b954eedeac495271d0f0000000000000000000000000000000000000000000000000000000000084d000000000000000000000000000000000000000000000000000000000000000001'],
            [
              '0x0000000000000000000000006b175474e89094c44da98b954eedeac495271d0f', '0x0000000000000000000000000000000000000000000000000000000000000015',
              '0x000000000000000000000000514910771af9ca656af840dff83e8264ecf986ca', '0x0000000000000000000000000000000000000000000000000000000000000020',
              '0x0000000000000000000000000000000000000000000000000000000000000000',
            ],
          ],
          [
            Bundles.MainnetIds.AAVE_V3_CLOSE_TO_DEBT,
            true,
            {
              baseTokenAddress: getAssetInfo('LINK').address, quoteTokenAddress: getAssetInfo('DAI').address, price: 0.00544, ratioState: RatioState.UNDER
            },
            {
              collAsset: getAssetInfo('DAI').address, collAssetId: 21, debtAsset: getAssetInfo('LINK').address, debtAssetId: 32,
            },
          ]
        ]
      ];

      examples.forEach(([expected, actual]) => {
        it(`Given ${actual} should return expected value: ${JSON.stringify(expected)}`, () => {
          expect(aaveV3Encode.closeToAsset(...actual)).to.eql(expected);
        });
      });
    });

    describe('closeToAssetWithMaximumGasPrice()', () => {
      const examples: Array<[
        [StrategyOrBundleIds, boolean, TriggerData, SubData],
        [
          strategyOrBundleId: number,
          isBundle: boolean,
          triggerData: {
            baseTokenAddress: EthereumAddress, quoteTokenAddress: EthereumAddress, price: number, ratioState: RatioState,  maximumGasPrice: number
          },
          subData: {
            collAsset: EthereumAddress, collAssetId: number, debtAsset: EthereumAddress, debtAssetId: number,
          },
        ]
      ]> = [
        [
          [
            Bundles.MainnetIds.AAVE_V3_CLOSE_TO_COLLATERAL,
            true,
            [
              '0x000000000000000000000000c02aaa39b223fe8d0a0e5c4f27ead9083c756cc20000000000000000000000006b175474e89094c44da98b954eedeac495271d0f00000000000000000000000000000000000000000000000000000026e1f9c6000000000000000000000000000000000000000000000000000000000000000000',
              '0x00000000000000000000000000000000000000000000000000000002cb417800',
            ],
            [
              '0x000000000000000000000000c02aaa39b223fe8d0a0e5c4f27ead9083c756cc2', '0x0000000000000000000000000000000000000000000000000000000000000015',
              '0x0000000000000000000000006b175474e89094c44da98b954eedeac495271d0f', '0x0000000000000000000000000000000000000000000000000000000000000020',
              '0x0000000000000000000000000000000000000000000000000000000000000000',
            ],
          ],
          [
            Bundles.MainnetIds.AAVE_V3_CLOSE_TO_COLLATERAL,
            true,
            {
              baseTokenAddress: getAssetInfo('WETH').address, quoteTokenAddress: getAssetInfo('DAI').address, price: 1670, ratioState: RatioState.OVER, maximumGasPrice: 12,
            },
            {
              collAsset: getAssetInfo('WETH').address, collAssetId: 21, debtAsset: getAssetInfo('DAI').address, debtAssetId: 32,
            },
          ]
        ],
        [
          [
            Bundles.MainnetIds.AAVE_V3_CLOSE_TO_DEBT,
            true,
            [
              '0x000000000000000000000000514910771af9ca656af840dff83e8264ecf986ca0000000000000000000000006b175474e89094c44da98b954eedeac495271d0f0000000000000000000000000000000000000000000000000000000000084d000000000000000000000000000000000000000000000000000000000000000001',
              '0x0000000000000000000000000000000000000000000000000000004a817c8000',
            ],
            [
              '0x0000000000000000000000006b175474e89094c44da98b954eedeac495271d0f', '0x0000000000000000000000000000000000000000000000000000000000000015',
              '0x000000000000000000000000514910771af9ca656af840dff83e8264ecf986ca', '0x0000000000000000000000000000000000000000000000000000000000000020',
              '0x0000000000000000000000000000000000000000000000000000000000000000',
            ],
          ],
          [
            Bundles.MainnetIds.AAVE_V3_CLOSE_TO_DEBT,
            true,
            {
              baseTokenAddress: getAssetInfo('LINK').address, quoteTokenAddress: getAssetInfo('DAI').address, price: 0.00544, ratioState: RatioState.UNDER, maximumGasPrice: 320,
            },
            {
              collAsset: getAssetInfo('DAI').address, collAssetId: 21, debtAsset: getAssetInfo('LINK').address, debtAssetId: 32,
            },
          ]
        ]
      ];

      examples.forEach(([expected, actual]) => {
        it(`Given ${actual} should return expected value: ${JSON.stringify(expected)}`, () => {
          expect(aaveV3Encode.closeToAssetWithMaximumGasPrice(...actual)).to.eql(expected);
        });
      });
    });

    describe('leverageManagementOnPrice()', () => {
      const examples: Array<[
        [StrategyOrBundleIds, boolean, TriggerData, SubData],
        [
          strategyOrBundleId: number,
          isBundle: boolean,
          triggerData: {
            baseTokenAddress: EthereumAddress, quoteTokenAddress: EthereumAddress, price: number, state: RatioState.UNDER
          },
          subData: {
            collAsset: EthereumAddress, collAssetId: number, debtAsset: EthereumAddress, debtAssetId: number, marketAddr: EthereumAddress, targetRatio: number,
          },
        ]
      ]> = [
        [
          [
            Bundles.MainnetIds.AAVE_V3_OPEN_ORDER_FROM_COLLATERAL,
            true,
            ['0x000000000000000000000000c02aaa39b223fe8d0a0e5c4f27ead9083c756cc20000000000000000000000006b175474e89094c44da98b954eedeac495271d0f0000000000000000000000000000000000000000000000000000007acead34980000000000000000000000000000000000000000000000000000000000000001'],
            [
              '0x000000000000000000000000c02aaa39b223fe8d0a0e5c4f27ead9083c756cc2',
              '0x000000000000000000000000000000000000000000000000000000000000000a',
              '0x0000000000000000000000006b175474e89094c44da98b954eedeac495271d0f',
              '0x0000000000000000000000000000000000000000000000000000000000000004',
              '0x0000000000000000000000002f39d218133afab8f2b819b1066c7e434ad94e9e',
              '0x0000000000000000000000000000000000000000000000001bc16d674ec80000',
              '0x0000000000000000000000000000000000000000000000000000000000000000',
            ],
          ],
          [
            Bundles.MainnetIds.AAVE_V3_OPEN_ORDER_FROM_COLLATERAL,
            true,
            {
              baseTokenAddress: getAssetInfo('WETH').address, quoteTokenAddress: getAssetInfo('DAI').address, price: 5274.534678, state: RatioState.UNDER
            },
            {
              collAsset: getAssetInfo('WETH').address,
              collAssetId: 10,
              debtAsset: getAssetInfo('DAI').address,
              debtAssetId: 4,
              marketAddr: '0x2f39d218133afab8f2b819b1066c7e434ad94e9e',
              targetRatio: 200,
            },
          ]
        ],
      ];

      examples.forEach(([expected, actual]) => {
        it(`Given ${actual} should return expected value: ${JSON.stringify(expected)}`, () => {
          expect(aaveV3Encode.leverageManagementOnPrice(...actual)).to.eql(expected);
        });
      });
    });
  });

  describe('When testing strategySubService.compoundV2Encode', () => {
    describe('leverageManagement()', () => {
      const examples: Array<[
        [string, string, string, string, boolean],
        [triggerRepayRatio: number, triggerBoostRatio: number, targetBoostRatio: number, targetRepayRatio: number, boostEnabled: boolean],
      ]> = [
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
        it(`Given ${actual} should return expected value: ${JSON.stringify(expected)}`, () => {
          expect(compoundV2Encode.leverageManagement(...actual)).to.eql(expected);
        });
      });
    });
  });

  describe('When testing strategySubService.compoundV3Encode', () => {
    describe('leverageManagement()', () => {
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
        it(`Given ${actual} should return expected value: ${JSON.stringify(expected)}`, () => {
          expect(compoundV3Encode.leverageManagement(...actual)).to.eql(expected);
        });
      });
    });
  });

  describe('When testing strategySubService.morphoAaveV2Encode', () => {
    describe('leverageManagement()', () => {
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
        it(`Given ${actual} should return expected value: ${JSON.stringify(expected)}`, () => {
          expect(morphoAaveV2Encode.leverageManagement(...actual)).to.eql(expected);
        });
      });
    });
  });

  describe('When testing strategySubService.exchangeEncode', () => {
    describe('dca()', () => {
      const examples: Array<[
        [StrategyOrBundleIds, boolean, TriggerData, SubData],
        [fromToken: EthereumAddress, toToken: EthereumAddress, amount: string, timestamp: number, interval: number, network: ChainId],
      ]> = [
        [
          [
            Strategies.ArbitrumIds.EXCHANGE_DCA,
            false,
            ['0x0000000000000000000000000000000000000000000000000000018b23bd88cd000000000000000000000000000000000000000000000000000000000012d068'],
            [
              '0x000000000000000000000000da10009cbd5d07dd0cecc66161fc93d7c9000da1', '0x000000000000000000000000af88d065e77c8cc2239327c5edb3a432268e5831',
              '0x0000000000000000000000000000000000000000000000000000000000038270', '0x000000000000000000000000000000000000000000000000000000000012d068'
            ],
          ],
          [getAssetInfo('DAI', ChainId.Arbitrum).address, getAssetInfo('USDC', ChainId.Arbitrum).address, '230000', 1697111705805, 1233000, ChainId.Arbitrum]
        ],
        [
          [
            Strategies.MainnetIds.EXCHANGE_DCA,
            false,
            ['0x0000000000000000000000000000000000000000000000000000018b23bd88cd0000000000000000000000000000000000000000000000000000000000067458'],
            [
              '0x0000000000000000000000002260fac5e5542a773aa44fbcfedf7c193bc2c599', '0x000000000000000000000000eeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee',
              '0x0000000000000000000000000000000000000000000000000000000000000015', '0x0000000000000000000000000000000000000000000000000000000000067458',
            ],
          ],
          [getAssetInfo('WBTC').address, getAssetInfo('ETH').address, '21', 1697111705805, 423000, ChainId.Ethereum]
        ],
      ];

      examples.forEach(([expected, actual]) => {
        it(`Given ${actual} should return expected value: ${JSON.stringify(expected)}`, () => {
          expect(exchangeEncode.dca(...actual)).to.eql(expected);
        });
      });
    });

    describe('limitOrder()', () => {
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
        it(`Given ${actual} should return expected value: ${JSON.stringify(expected)}`, () => {
          expect(exchangeEncode.limitOrder(...actual)).to.eql(expected);
        });
      });
    });
  });

  describe('When testing strategySubService.sparkEncode', () => {
    describe('leverageManagement()', () => {
      const examples: Array<[
        string,
        [triggerRepayRatio: number, triggerBoostRatio: number, targetBoostRatio: number, targetRepayRatio: number, boostEnabled: boolean],
      ]> = [
        [
          '0x000000000000000016345785d8a0000000000000000000001e87f85809dc0000000000000000000018fae27693b4000000000000000000001a5e27eef13e000001',
          [160, 220, 180, 190, true]
        ],
        [
          '0x000000000000000016345785d8a0000000000000000000001bc16d674ec80000000000000000000018fae27693b4000000000000000000001a5e27eef13e000000',
          [160, 200, 180, 190, false]
        ],
      ];

      examples.forEach(([expected, actual]) => {
        it(`Given ${actual} should return expected value: ${JSON.stringify(expected)}`, () => {
          expect(sparkEncode.leverageManagement(...actual)).to.eql(expected);
        });
      });
    });

    describe('closeToAsset()', () => {
      const examples: Array<[
        [StrategyOrBundleIds, boolean, TriggerData, SubData],
        [
          strategyOrBundleId: number,
          isBundle: boolean,
          triggerData: {
            baseTokenAddress: EthereumAddress, quoteTokenAddress: EthereumAddress, price: number, ratioState: RatioState
          },
          subData: {
            collAsset: EthereumAddress, collAssetId: number, debtAsset: EthereumAddress, debtAssetId: number,
          },
        ]
      ]> = [
        [
          [
            Bundles.MainnetIds.SPARK_CLOSE_TO_COLLATERAL,
            true,
            ['0x000000000000000000000000c02aaa39b223fe8d0a0e5c4f27ead9083c756cc20000000000000000000000006b175474e89094c44da98b954eedeac495271d0f00000000000000000000000000000000000000000000000000000026e1f9c6000000000000000000000000000000000000000000000000000000000000000000'],
            [
              '0x000000000000000000000000c02aaa39b223fe8d0a0e5c4f27ead9083c756cc2', '0x0000000000000000000000000000000000000000000000000000000000000015',
              '0x0000000000000000000000006b175474e89094c44da98b954eedeac495271d0f', '0x0000000000000000000000000000000000000000000000000000000000000020',
              '0x0000000000000000000000000000000000000000000000000000000000000000',
            ],
          ],
          [
            Bundles.MainnetIds.SPARK_CLOSE_TO_COLLATERAL,
            true,
            {
              baseTokenAddress: getAssetInfo('WETH').address, quoteTokenAddress: getAssetInfo('DAI').address, price: 1670, ratioState: RatioState.OVER
            },
            {
              collAsset: getAssetInfo('WETH').address, collAssetId: 21, debtAsset: getAssetInfo('DAI').address, debtAssetId: 32,
            },
          ]
        ],
        [
          [
            Bundles.MainnetIds.SPARK_CLOSE_TO_DEBT,
            true,
            ['0x000000000000000000000000514910771af9ca656af840dff83e8264ecf986ca0000000000000000000000006b175474e89094c44da98b954eedeac495271d0f0000000000000000000000000000000000000000000000000000000000084d000000000000000000000000000000000000000000000000000000000000000001'],
            [
              '0x0000000000000000000000006b175474e89094c44da98b954eedeac495271d0f', '0x0000000000000000000000000000000000000000000000000000000000000015',
              '0x000000000000000000000000514910771af9ca656af840dff83e8264ecf986ca', '0x0000000000000000000000000000000000000000000000000000000000000020',
              '0x0000000000000000000000000000000000000000000000000000000000000000',
            ],
          ],
          [
            Bundles.MainnetIds.SPARK_CLOSE_TO_DEBT,
            true,
            {
              baseTokenAddress: getAssetInfo('LINK').address, quoteTokenAddress: getAssetInfo('DAI').address, price: 0.00544, ratioState: RatioState.UNDER
            },
            {
              collAsset: getAssetInfo('DAI').address, collAssetId: 21, debtAsset: getAssetInfo('LINK').address, debtAssetId: 32,
            },
          ]
        ]
      ];

      examples.forEach(([expected, actual]) => {
        it(`Given ${actual} should return expected value: ${JSON.stringify(expected)}`, () => {
          expect(sparkEncode.closeToAsset(...actual)).to.eql(expected);
        });
      });
    });
  });

  describe('When testing strategySubService.crvUSDEncode', () => {
    describe('leverageManagement()', () => {
      const examples: Array<[
        [StrategyOrBundleIds, boolean, TriggerData, SubData],
        [owner: EthereumAddress, controllerAddr: EthereumAddress, ratioState: RatioState, targetRatio: number, triggerRatio: number, collTokenAddr: EthereumAddress, crvUSDAddr: EthereumAddress],
      ]> = [
        [
          [
            Bundles.MainnetIds.CRVUSD_REPAY,
            true,
            [
              '0x0000000000000000000000001031d218133afab8c2b819b1366c7e434ad91e9c000000000000000000000000a920de414ea4ab66b97da1bfe9e6eca7d4219635000000000000000000000000000000000000000000000000136dcc951d8c00000000000000000000000000000000000000000000000000000000000000000001',
            ],
            [
              '0x000000000000000000000000a920de414ea4ab66b97da1bfe9e6eca7d4219635',
              '0x0000000000000000000000000000000000000000000000000000000000000001',
              '0x0000000000000000000000000000000000000000000000001a5e27eef13e0000',
              '0x000000000000000000000000c02aaa39b223fe8d0a0e5c4f27ead9083c756cc2',
              '0x000000000000000000000000f939e0a03fb07f59a73314e73794be0e57ac1b4e',
            ],
          ],
          [
            web3Utils.toChecksumAddress('0x1031d218133AFaB8c2B819B1366c7E434Ad91E9c'),
            web3Utils.toChecksumAddress('0xa920de414ea4ab66b97da1bfe9e6eca7d4219635'),
            RatioState.UNDER,
            190,
            140,
            '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',
            '0xf939E0A03FB07F59A73314E73794Be0E57ac1b4E',
          ]
        ],
        [
          [
            Bundles.MainnetIds.CRVUSD_BOOST,
            true,
            [
              '0x0000000000000000000000000043d218133afab8f2b829b106633e434ad94e2c000000000000000000000000a920de414ea4ab66b97da1bfe9e6eca7d42196350000000000000000000000000000000000000000000000001bc16d674ec800000000000000000000000000000000000000000000000000000000000000000000'
            ],
            [
              '0x000000000000000000000000a920de414ea4ab66b97da1bfe9e6eca7d4219635',
              '0x0000000000000000000000000000000000000000000000000000000000000000',
              '0x00000000000000000000000000000000000000000000000016345785d8a00000',
              '0x000000000000000000000000c02aaa39b223fe8d0a0e5c4f27ead9083c756cc2',
              '0x000000000000000000000000f939e0a03fb07f59a73314e73794be0e57ac1b4e',
            ],
          ],
          [
            web3Utils.toChecksumAddress('0x0043d218133AFaB8F2B829B106633E434Ad94E2c'),
            web3Utils.toChecksumAddress('0xa920de414ea4ab66b97da1bfe9e6eca7d4219635'),
            RatioState.OVER,
            160,
            200,
            '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',
            '0xf939E0A03FB07F59A73314E73794Be0E57ac1b4E',
          ]
        ],
      ];

      examples.forEach(([expected, actual]) => {
        it(`Given ${actual} should return expected value: ${JSON.stringify(expected)}`, () => {
          expect(crvUSDEncode.leverageManagement(...actual)).to.eql(expected);
        });
      });
    });
    describe('payback()', () => {
      const examples: Array<[
        [StrategyOrBundleIds, boolean, TriggerData, SubData],
        [owner: EthereumAddress, addressToPullTokensFrom: EthereumAddress, positionOwner: EthereumAddress, paybackAmount: string, crvUSDAddr: EthereumAddress, controllerAddr: EthereumAddress, minHealthRatio: number],
      ]> = [
        [
          [
            Strategies.MainnetIds.CURVEUSD_PAYBACK,
            false,
            [
              '0x0000000000000000000000007a2af22ba3276108cd331c8985ef9528e10a871a000000000000000000000000a920de414ea4ab66b97da1bfe9e6eca7d421963500000000000000000000000000000000000000000000000002c68af0bb140000',
            ],
            [
              '0x000000000000000000000000a920de414ea4ab66b97da1bfe9e6eca7d4219635',
              '0x000000000000000000000000dc0ad7a48088f1aa55d26f8b36f7c1e827ddd280',
              '0x000000000000000000000000dc0ad7a48088f1aa55d26f8b36f7c1e827ddd280',
              '0x00000000000000000000000000000000000000000000043c33c1937564800000',
              '0x000000000000000000000000f939e0a03fb07f59a73314e73794be0e57ac1b4e'
            ],
          ],
          [
            web3Utils.toChecksumAddress('0x7a2af22ba3276108cd331c8985ef9528e10a871a'),
            web3Utils.toChecksumAddress('0xDc0Ad7a48088f1AA55d26f8b36F7C1E827DdD280'),
            web3Utils.toChecksumAddress('0xDc0Ad7a48088f1AA55d26f8b36F7C1E827DdD280'),
            '20000',
            '0xf939E0A03FB07F59A73314E73794Be0E57ac1b4E',
            web3Utils.toChecksumAddress('0xA920De414eA4Ab66b97dA1bFE9e6EcA7d4219635'),
            20,
          ]
        ]
      ];

      examples.forEach(([expected, actual]) => {
        it(`Given ${actual} should return expected value: ${JSON.stringify(expected)}`, () => {
          expect(crvUSDEncode.payback(...actual)).to.eql(expected);
        });
      });
    });
  });
  describe('When testing strategySubService.morphoBlueEncode', () => {
    describe('leverageManagement()', () => {
      const examples: Array<[
        [StrategyOrBundleIds, boolean, TriggerData, SubData],
        [
          marketId: string,
          loanToken: EthereumAddress,
          collToken: EthereumAddress,
          oracle: EthereumAddress,
          irm: EthereumAddress,
          lltv: string,
          ratioState: RatioState,
          targetRatio: number,
          triggerRatio: number,
          user: EthereumAddress,
          isEoa: boolean,
          network: ChainId
        ],
      ]> = [
        [
          [
            Bundles.MainnetIds.MORPHO_BLUE_REPAY,
            true,
            [
              '0xc54d7acf14de29e0e5527cabd7a576506870346a78a11a6762e2cca66322ec410000000000000000000000001031d218133afab8c2b819b1366c7e434ad91e9c00000000000000000000000000000000000000000000000010a741a4627800000000000000000000000000000000000000000000000000000000000000000001',
            ],
            [
              '0x000000000000000000000000c02aaa39b223fe8d0a0e5c4f27ead9083c756cc2',
              '0x0000000000000000000000007f39c581f595b53c5cb19bd0b3f8da6c935e2ca0',
              '0x0000000000000000000000002a01eb9496094da03c4e364def50f5ad1280ad72',
              '0x000000000000000000000000870ac11d48b15db9a138cf899d20f13f79ba00bc',
              '0x0000000000000000000000000000000000000000000000000d1d507e40be8000',
              '0x0000000000000000000000000000000000000000000000000000000000000001',
              '0x000000000000000000000000000000000000000000000000136dcc951d8c0000',
              '0x0000000000000000000000001031d218133afab8c2b819b1366c7e434ad91e9c',
              '0x0000000000000000000000000000000000000000000000000000000000000000',
            ],
          ],
          [
            '0xc54d7acf14de29e0e5527cabd7a576506870346a78a11a6762e2cca66322ec41',
            web3Utils.toChecksumAddress('0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2'),
            web3Utils.toChecksumAddress('0x7f39C581F595B53c5cb19bD0b3f8dA6c935E2Ca0'),
            web3Utils.toChecksumAddress('0x2a01eb9496094da03c4e364def50f5ad1280ad72'),
            web3Utils.toChecksumAddress('0x870aC11D48B15DB9a138Cf899d20F13F79Ba00BC'),
            '945000000000000000',
            RatioState.UNDER,
            140,
            120,
            web3Utils.toChecksumAddress('0x1031d218133AFaB8c2B819B1366c7E434Ad91E9c'),
            false,
            ChainId.Ethereum,
          ]
        ],
        [
          [
            Bundles.MainnetIds.MORPHO_BLUE_BOOST,
            true,
            [
              '0xc54d7acf14de29e0e5527cabd7a576506870346a78a11a6762e2cca66322ec410000000000000000000000001031d218133afab8c2b819b1366c7e434ad91e9c0000000000000000000000000000000000000000000000001bc16d674ec800000000000000000000000000000000000000000000000000000000000000000000'
            ],
            [
              '0x000000000000000000000000c02aaa39b223fe8d0a0e5c4f27ead9083c756cc2',
              '0x0000000000000000000000007f39c581f595b53c5cb19bd0b3f8da6c935e2ca0',
              '0x0000000000000000000000002a01eb9496094da03c4e364def50f5ad1280ad72',
              '0x000000000000000000000000870ac11d48b15db9a138cf899d20f13f79ba00bc',
              '0x0000000000000000000000000000000000000000000000000d1d507e40be8000',
              '0x0000000000000000000000000000000000000000000000000000000000000000',
              '0x00000000000000000000000000000000000000000000000016345785d8a00000',
              '0x0000000000000000000000001031d218133afab8c2b819b1366c7e434ad91e9c',
              '0x0000000000000000000000000000000000000000000000000000000000000000',
            ],
          ],
          [
            '0xc54d7acf14de29e0e5527cabd7a576506870346a78a11a6762e2cca66322ec41',
            web3Utils.toChecksumAddress('0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2'),
            web3Utils.toChecksumAddress('0x7f39C581F595B53c5cb19bD0b3f8dA6c935E2Ca0'),
            web3Utils.toChecksumAddress('0x2a01eb9496094da03c4e364def50f5ad1280ad72'),
            web3Utils.toChecksumAddress('0x870aC11D48B15DB9a138Cf899d20F13F79Ba00BC'),
            '945000000000000000',
            RatioState.OVER,
            160,
            200,
            web3Utils.toChecksumAddress('0x1031d218133AFaB8c2B819B1366c7E434Ad91E9c'),
            false,
            ChainId.Ethereum,
          ]
        ],
      ];

      examples.forEach(([expected, actual]) => {
        it(`Given ${actual} should return expected value: ${JSON.stringify(expected)}`, () => {
          expect(morphoBlueEncode.leverageManagement(...actual)).to.eql(expected);
        });
      });
    });
  });

  describe('When testing strategySubService.compoundV3L2Encode', () => {
    describe('leverageManagement()', () => {
      const examples: Array<[string, [EthereumAddress, EthereumAddress, number, number, number, number, boolean]]> = [
        [
          '0x0313D212133AFab8F2b829B1066c7e43caD94e2c0213D212133AfaB8F2b829B1066C7E43cAD94E2c000000000000000016345785d8a0000000000000000000001e87f85809dc0000000000000000000018fae27693b4000000000000000000001a5e27eef13e000001',
          [
            web3Utils.toChecksumAddress('0x0313d212133AFaB8F2B829B1066c7E43cAd94E2c'),
            web3Utils.toChecksumAddress('0x0213d212133AFaB8F2B829B1066c7E43cAd94E2c'),
            160, 220, 180, 190,
            true
          ],
        ],
        [
          '0x0313D212133AFab8F2b829B1066c7e43caD94e2c0413d212133afAb8F2B829b1066C7e43cAd94e2c000000000000000016345785d8a0000000000000000000001e87f85809dc0000000000000000000018fae27693b4000000000000000000000f43fc2c04ee000000',
          [
            web3Utils.toChecksumAddress('0x0313d212133AFaB8F2B829B1066c7E43cAd94E2c'),
            web3Utils.toChecksumAddress('0x0413d212133AFaB8F2B829B1066c7E43cAd94E2c'),
            160, 220, 180, 110,
            false
          ],
        ],
      ];
      examples.forEach(([expected, actual]) => {
        it(`Given ${actual} should return expected value: ${JSON.stringify(expected)}`, () => {
          expect(compoundV3L2Encode.leverageManagement(...actual)).to.eql(expected);
        });
      });
    });
  });

});
