import { expect } from 'chai';

import {
  Bundles, ChainId, ProtocolIdentifiers, RatioState, Strategies,
} from '../types/enums';
import type { ParseData, Position } from '../types';

import '../configuration';
import { parseStrategiesAutomatedPosition } from './strategiesService';

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

    it('parses ftDnmm repay and boost as one account-wide leverage-management pair', () => {
      const owner = '0x0031d218133afab8f2b819b1066c7e434ad94e9c';
      const makeParseData = (
        bundleId: Bundles.MainnetIds,
        ratioState: RatioState,
        subId: string,
      ): ParseData => ({
        chainId: ChainId.Ethereum,
        blockNumber: 1,
        subscriptionEventData: {
          subId,
          proxy: owner,
          subHash: `0x${subId.padStart(64, '0')}`,
          // @ts-ignore generated event tuple typing requires numeric aliases
          subStruct: {
            strategyOrBundleId: bundleId.toString(),
            isBundle: true,
            triggerData: [
              `0x000000000000000000000000${owner.slice(2)}00000000000000000000000000000000000000000000000010a741a462780000000000000000000000000000000000000000000000000000000000000000000${ratioState}`,
            ],
            subData: [
              '0x000000000000000000000000000000000000000000000000136dcc951d8c0000',
              `0x${ratioState.toString(16).padStart(64, '0')}`,
              `0x000000000000000000000000${owner.slice(2)}`,
            ],
          },
        },
        strategiesSubsData: {
          userProxy: owner,
          isEnabled: true,
          strategySubHash: `0x${subId.padStart(64, '0')}`,
        },
      });

      const repay = parseStrategiesAutomatedPosition(
        makeParseData(Bundles.MainnetIds.FT_DNMM_REPAY, RatioState.UNDER, '1'),
      );
      const boost = parseStrategiesAutomatedPosition(
        makeParseData(Bundles.MainnetIds.FT_DNMM_BOOST, RatioState.OVER, '2'),
      );

      expect(repay?.positionId).to.equal(`1-ftdnmm-${owner}`);
      expect(boost?.positionId).to.equal(repay?.positionId);
      expect(repay?.strategy.strategyId).to.equal(Strategies.IdOverrides.LeverageManagement);
      expect(boost?.strategy.strategyId).to.equal(Strategies.IdOverrides.LeverageManagement);
      expect(repay?.specific).to.include({
        triggerRepayRatio: 120,
        targetRepayRatio: 140,
        mergeWithId: Strategies.Identifiers.Boost,
      });
      expect(boost?.specific).to.include({
        triggerBoostRatio: 120,
        targetBoostRatio: 140,
        mergeId: Strategies.Identifiers.Boost,
      });
    });
  });
});
