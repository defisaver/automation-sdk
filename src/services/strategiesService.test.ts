import { expect } from 'chai';

import {
  Bundles, CloseStrategyType, CloseToAssetType, ProtocolIdentifiers, Strategies,
} from '../types/enums';
import type { ParseData, Position } from '../types';

import '../configuration';
import { parseStrategiesAutomatedPosition } from './strategiesService';
import { aaveV3Encode } from './strategySubService';

describe('Feature: strategiesService.ts', () => {
  describe('When testing strategiesService.parseStrategiesAutomatedPosition', async () => {
    // TODO: we should probably write this for every strategy?
    const examples: Array<[Position.Automated | null, ParseData]> = [
      [
        {
          isEnabled: true,
          chainId: 1,
          positionId: '1-aave__v3-0x9cb7e19861665366011899d74e75d4f2a419aeed-0x2f39d218133afab8f2b819b1066c7e434ad94e9e',
          subHash: '0xafa4d200be62f171b57b1ae0f4e8348d1ac3f6d0812ad6da74a2adae8037dde1',
          blockNumber: 18015756,
          subId: 379,
          owner: '0x9cb7e19861665366011899d74e75d4f2a419aeed',
          protocol: {
            id: ProtocolIdentifiers.StrategiesAutomation.AaveV3,
            name: 'Aave',
            slug: 'aave',
            version: 'V3',
            fullName: 'Aave V3'
          },
          strategy: {
            isBundle: true,
            strategyOrBundleId: 8,
            strategyId: Strategies.IdOverrides.LeverageManagement,
            protocol: {
              id: ProtocolIdentifiers.StrategiesAutomation.AaveV3,
              name: 'Aave',
              slug: 'aave',
              version: 'V3',
              fullName: 'Aave V3'
            }
          },
          strategyData: {
            encoded: {
              triggerData: [
                '0x0000000000000000000000009cb7e19861665366011899d74e75d4f2a419aeed0000000000000000000000002f39d218133afab8f2b819b1066c7e434ad94e9e00000000000000000000000000000000000000000000000019ac8532c27900000000000000000000000000000000000000000000000000000000000000000001',
              ],
              subData: [
                '0x0000000000000000000000000000000000000000000000001bc16d674ec80000',
                '0x0000000000000000000000000000000000000000000000000000000000000001',
                '0x0000000000000000000000000000000000000000000000000000000000000001',
                '0x0000000000000000000000000000000000000000000000000000000000000000'
              ]
            },
            decoded: {
              triggerData: {
                owner: '0x9cB7E19861665366011899d74E75d4F2A419aEeD',
                market: '0x2f39d218133AFaB8F2B819B1066c7E434Ad94E9e',
                ratio: 185,
                ratioState: 1
              },
              subData: { targetRatio: 200 }
            }
          },
          specific: {
            triggerRepayRatio: 185,
            targetRepayRatio: 200,
            repayEnabled: true,
            subId1: 379,
            mergeWithId: Strategies.Identifiers.Boost,
            subHashRepay: '0xafa4d200be62f171b57b1ae0f4e8348d1ac3f6d0812ad6da74a2adae8037dde1',
          }
        },
        {
          chainId: 1,
          blockNumber: 18015756,
          subscriptionEventData: {
            subId: '379',
            proxy: '0x9cb7e19861665366011899d74e75d4f2a419aeed',
            subHash: '0xafa4d200be62f171b57b1ae0f4e8348d1ac3f6d0812ad6da74a2adae8037dde1',
            // @ts-ignore
            subStruct:
              {
                strategyOrBundleId: '8',
                isBundle: true,
                triggerData: ['0x0000000000000000000000009cb7e19861665366011899d74e75d4f2a419aeed0000000000000000000000002f39d218133afab8f2b819b1066c7e434ad94e9e00000000000000000000000000000000000000000000000019ac8532c27900000000000000000000000000000000000000000000000000000000000000000001'],
                subData: [
                  '0x0000000000000000000000000000000000000000000000001bc16d674ec80000', '0x0000000000000000000000000000000000000000000000000000000000000001',
                  '0x0000000000000000000000000000000000000000000000000000000000000001', '0x0000000000000000000000000000000000000000000000000000000000000000',
                ],
              }
          },
          strategiesSubsData: {
            userProxy: '0x9cb7e19861665366011899d74e75d4f2a419aeed',
            isEnabled: true,
            strategySubHash: '0xafa4d200be62f171b57b1ae0f4e8348d1ac3f6d0812ad6da74a2adae8037dde1'
          }
        },
      ],
    ];

    examples.forEach(([expected, actual]) => {
      it(`Given ${JSON.stringify(actual)} should return expected value: ${JSON.stringify(expected)}`, async () => {
        expect(parseStrategiesAutomatedPosition(actual)).to.eql(expected);
      });
    });
  });

  describe('When parsing Aave V3 instant close bundles', () => {
    const owner = '0x1234567890123456789012345678901234567890';
    const market = '0x2f39d218133AFaB8F2B819B1066c7E434Ad94E9e';
    const weth = '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2';
    const usdc = '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48';

    const bundles: Array<[string, Bundles.MainnetIds, Strategies.Identifiers]> = [
      ['SW', Bundles.MainnetIds.AAVE_V3_SW_INSTANT_CLOSE, Strategies.Identifiers.InstantCloseOnPrice],
      ['EOA', Bundles.MainnetIds.AAVE_V3_EOA_INSTANT_CLOSE, Strategies.Identifiers.EoaInstantCloseOnPrice],
    ];

    bundles.forEach(([walletType, expectedBundleId, expectedStrategyId]) => {
      describe(`${walletType} bundle`, () => {
        const [bundleId, isBundle, triggerData, subData] = aaveV3Encode.instantCloseOnPriceGeneric(
          expectedBundleId,
          weth, 0, usdc, 1, market, owner,
          '1000000000000000000', '10000000000000000',
          1500, CloseToAssetType.DEBT, 5000, CloseToAssetType.COLLATERAL,
        );

        const parseData = {
          chainId: 1,
          blockNumber: 1,
          subscriptionEventData: {
            subId: '1',
            proxy: owner,
            subHash: '0xhash',
            subStruct: {
              strategyOrBundleId: String(bundleId), isBundle, triggerData, subData,
            },
          },
          strategiesSubsData: { userProxy: owner, isEnabled: true, strategySubHash: '0xhash' },
        } as unknown as ParseData;

        const result = parseStrategiesAutomatedPosition(parseData) as Position.Automated;

        it('should identify the strategy as instant close on price', () => {
          expect(result.strategy.strategyOrBundleId).to.equal(expectedBundleId);
          expect(result.strategy.strategyId).to.equal(expectedStrategyId);
          expect(result.protocol.id).to.equal(ProtocolIdentifiers.StrategiesAutomation.AaveV3);
        });

        it('should decode sub data including tsi and slippage', () => {
          expect(result.strategyData.decoded.subData).to.eql({
            collAsset: weth,
            collAssetId: 0,
            debtAsset: usdc,
            debtAssetId: 1,
            closeType: CloseStrategyType.TAKE_PROFIT_IN_COLLATERAL_AND_STOP_LOSS_IN_DEBT,
            marketAddr: market,
            owner,
            tsi: '1000000000000000000',
            slippage: '10000000000000000',
          });
        });

        it('should fill specific with prices and close types', () => {
          expect(result.specific).to.eql({
            collAsset: weth,
            collAssetId: 0,
            debtAsset: usdc,
            debtAssetId: 1,
            baseToken: weth,
            quoteToken: usdc,
            stopLossPrice: '1500',
            takeProfitPrice: '5000',
            stopLossType: CloseToAssetType.DEBT,
            takeProfitType: CloseToAssetType.COLLATERAL,
          });
        });
      });
    });
  });
});
