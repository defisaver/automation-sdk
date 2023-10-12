import { expect } from 'chai';
import { otherAddresses } from '@defisaver/sdk';
import { getAssetInfo } from '@defisaver/tokens';

import { Bundles, ChainId, RatioState, Strategies } from '../types/enums';
import type { EthereumAddress, StrategyOrBundleIds, SubData, TriggerData } from '../types';
import { makerEncode, } from './strategySubService';
import Dec from 'decimal.js';

// @ts-ignore // TODO - this requires change in @defisaver/tokens
const mcdCdpManagerAddr = otherAddresses(ChainId.Ethereum).McdCdpManager;

describe('Feature: strategySubService.ts', () => {
  describe('When testing strategySubService.makerEncode', () => {
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

});
