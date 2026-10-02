import { expect } from 'chai';

import { ChainId, ProtocolIdentifiers, RatioState, Strategies } from '../types/enums';
import type { ParseData, Position } from '../types';
import { MAINNET_STRATEGIES_INFO } from '../constants';

import '../configuration';
import { parseStrategiesAutomatedPosition } from './strategiesService';

describe('Feature: strategiesService.ts', () => {
  describe('When parsing Aave V3 collateral switch subscriptions', () => {
    const proxy = '0x9cB7E19861665366011899d74E75d4F2A419aEeD';
    const user = '0x1234567890123456789012345678901234567890';
    const fromAsset = '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2';
    const toAsset = '0xcbB7C0000aB88B473b1f5aFd9ef808440eed33Bf';
    const marketAddr = '0x2f39d218133AFaB8F2B819B1066c7E434Ad94E9e';
    const amountToSwitch = '115792089237316195423570985008687907853269984665640564039457584007913129639935';
    const subHash = `0x${'ab'.repeat(32)}`;
    const triggerData = [
      '0x000000000000000000000000c02aaa39b223fe8d0a0e5c4f27ead9083c756cc2'
      + '000000000000000000000000cbb7c0000ab88b473b1f5afd9ef808440eed33bf'
      + '0000000000000000000000000000000000000000000000000000000000989680'
      + '0000000000000000000000000000000000000000000000000000000000000001',
    ];

    function getParseData(strategyId: number, isGeneric: boolean, chainId = ChainId.Ethereum): ParseData {
      const subData = [
        '0x000000000000000000000000c02aaa39b223fe8d0a0e5c4f27ead9083c756cc2',
        isGeneric
          ? '0x0000000000000000000000000000000000000000000000000000000000000100'
          : '0x0000000000000000000000000000000000000000000000000000000000000000',
        '0x000000000000000000000000cbb7c0000ab88b473b1f5afd9ef808440eed33bf',
        isGeneric
          ? '0x000000000000000000000000000000000000000000000000000000000000ffff'
          : '0x0000000000000000000000000000000000000000000000000000000000000007',
        '0x0000000000000000000000002f39d218133afab8f2b819b1066c7e434ad94e9e',
        '0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff',
        isGeneric
          ? '0x0000000000000000000000001234567890123456789012345678901234567890'
          : '0x0000000000000000000000000000000000000000000000000000000000000000',
      ];
      const subStruct = Object.assign(
        [String(strategyId), false, triggerData, subData] as [string, boolean, string[], string[]],
        { strategyOrBundleId: String(strategyId), isBundle: false, triggerData, subData },
      );
      return {
        chainId,
        blockNumber: 18015756,
        subscriptionEventData: {
          subId: '379', proxy, subHash, subStruct,
          0: '379', 1: proxy, 2: subHash, 3: subStruct,
        },
        strategiesSubsData: {
          userProxy: proxy, isEnabled: true, strategySubHash: subHash,
        },
      };
    }

    it('decodes generic collateral switches with the user and uint16 reserve IDs', () => {
      const strategyId = Strategies.MainnetIds.AAVE_V3_COLLATERAL_SWITCH;
      const originalInfo = MAINNET_STRATEGIES_INFO[strategyId];
      const parseData = getParseData(strategyId, true);
      let position: Position.Automated;
      MAINNET_STRATEGIES_INFO[strategyId] = {
        ...originalInfo,
        strategyId: Strategies.Identifiers.EoaCollateralSwitch,
      };
      try {
        position = parseStrategiesAutomatedPosition(parseData)!;
      } finally {
        MAINNET_STRATEGIES_INFO[strategyId] = originalInfo;
      }

      expect(position).not.to.equal(null);
      expect(position.protocol.id).to.equal(ProtocolIdentifiers.StrategiesAutomation.AaveV3);
      expect(position.strategy.strategyId).to.equal(Strategies.Identifiers.EoaCollateralSwitch);
      expect(position.strategy.isBundle).to.equal(false);
      expect(position.strategyData.encoded).to.eql({
        triggerData,
        subData: parseData.subscriptionEventData.subStruct.subData,
      });
      expect(position.strategyData.decoded.triggerData).to.eql({
        baseTokenAddress: fromAsset,
        quoteTokenAddress: toAsset,
        price: '0.1',
        ratioState: RatioState.UNDER,
      });
      expect(position.strategyData.decoded.subData).to.eql({
        fromAsset, fromAssetId: 256, toAsset, toAssetId: 65535, marketAddr, amountToSwitch, user,
      });
      expect(position.owner).to.equal(proxy.toLowerCase());
      expect(position.positionId).to.equal(`1-aave__v3-${proxy.toLowerCase()}-${marketAddr.toLowerCase()}`);
    });

    const legacyStrategies: Array<[ChainId, number]> = [
      [ChainId.Ethereum, Strategies.MainnetIds.AAVE_V3_COLLATERAL_SWITCH],
      [ChainId.Optimism, Strategies.OptimismIds.AAVE_V3_COLLATERAL_SWITCH],
      [ChainId.Arbitrum, Strategies.ArbitrumIds.AAVE_V3_COLLATERAL_SWITCH],
      [ChainId.Base, Strategies.BaseIds.AAVE_V3_COLLATERAL_SWITCH],
    ];
    legacyStrategies.forEach(([chainId, strategyId]) => {
      it(`continues to decode legacy collateral switches on chain ${chainId}`, () => {
        const position = parseStrategiesAutomatedPosition(getParseData(strategyId, false, chainId))!;

        expect(position).not.to.equal(null);
        expect(position.strategy.strategyId).to.equal(Strategies.Identifiers.CollateralSwitch);
        expect(position.strategyData.decoded.subData).to.eql({
          fromAsset, fromAssetId: 0, toAsset, toAssetId: 7, marketAddr, amountToSwitch,
        });
        expect(position.positionId).to.equal(`${chainId}-aave__v3-${proxy.toLowerCase()}-${marketAddr.toLowerCase()}`);
      });
    });
  });

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
});
