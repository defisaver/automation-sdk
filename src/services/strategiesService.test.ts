import { expect } from 'chai';

import { ProtocolIdentifiers, Strategies } from '../types/enums';
import type { ParseData, Position } from '../types';

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
            mergeWithSameId: true
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
});
