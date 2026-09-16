import Web3 from 'web3';
import { expect } from 'chai';

import { ChainId, SubscriptionStatus } from '../../types/enums';
import type { ApiSubscriptionRecord } from '../../types';

import '../../configuration';
import StrategiesAutomation from './StrategiesAutomation';

require('dotenv').config({ path: '.env' });

const Web3_1 = new Web3(process.env.RPC_1!);

describe('Feature: StrategiesAutomation.ts', () => {
  describe('When testing class StrategiesAutomation', async () => {
    const exampleStrategiesAutomation = new StrategiesAutomation({
      chainId:ChainId.Ethereum,
      provider: Web3_1,
      providerFork: null!,
    });

    const examples: Array<[any, any]> = [
      [
        [
        {
          'isEnabled': true,
          'chainId': 1,
          'subHash': '0x7a14b187374b9ab02f6f7c95f275ef547376da010d53c715870cd053199a6aee',
          'blockNumber': 0,
          'positionId': '1-aave__v3',
          'subId': 0,
          'protocol': {
            'id': 'Aave__V3',
            'name': 'Aave',
            'slug': 'aave',
            'version': 'V3',
            'fullName': 'Aave V3'
          },
          'strategy': {
            'isBundle': true,
            'strategyOrBundleId': 0,
            'strategyId': 'leverage-management',
            'protocol': {
              'id': 'Aave__V3',
              'name': 'Aave',
              'slug': 'aave',
              'version': 'V3',
              'fullName': 'Aave V3'
            }
          },
          'strategyData': {
            'encoded': {
              'subData': [
                '0x000000000000000000000000000000000000000000000000120a871cc0020000',
                '0x0000000000000000000000000000000000000000000000000000000000000001',
                '0x0000000000000000000000000000000000000000000000000000000000000001',
                '0x0000000000000000000000000000000000000000000000000000000000000000'
              ]
            },
            'decoded': {
              'triggerData': {
                'market': '0xa97684ead0e402dC232d5A977953DF7ECBaB3CDb',
                'ratio': 120,
                'ratioState': 1
              },
              'subData': {
                'targetRatio': 130
              }
            }
          },
          'specific': {
            'triggerRepayRatio': 120,
            'targetRepayRatio': 130,
            'repayEnabled': true,
            'subId1': 0,
            'mergeWithId': 'boost'
          }
        },
        {
          'isEnabled': false,
          'chainId': 1,
          'subHash': '0x7a14b187374b9ab02f6f7c95f275ef547376da010d53c715870cd053199a6aee',
          'blockNumber': 0,
          'positionId': '1-aave__v3',
          'subId': 1,
          'protocol': {
            'id': 'Aave__V3',
            'name': 'Aave',
            'slug': 'aave',
            'version': 'V3',
            'fullName': 'Aave V3'
          },
          'strategy': {
            'isBundle': true,
            'strategyOrBundleId': 0,
            'strategyId': 'leverage-management',
            'protocol': {
              'id': 'Aave__V3',
              'name': 'Aave',
              'slug': 'aave',
              'version': 'V3',
              'fullName': 'Aave V3'
            }
          },
          'strategyData': {
            'encoded': {
              'subData': [
                '0x000000000000000000000000000000000000000000000000120a871cc0020000',
                '0x0000000000000000000000000000000000000000000000000000000000000001',
                '0x0000000000000000000000000000000000000000000000000000000000000001',
                '0x0000000000000000000000000000000000000000000000000000000000000000'
              ]
            },
            'decoded': {
              'triggerData': {
                'market': '0xa97684ead0e402dC232d5A977953DF7ECBaB3CDb',
                'ratio': 120,
                'ratioState': 1
              },
              'subData': {
                'targetRatio': 130
              }
            }
          },
          'specific': {
            'triggerRepayRatio': 120,
            'targetRepayRatio': 130,
            'repayEnabled': true,
            'subId1': 1,
            'mergeWithId': 'boost'
          }
        },
        {
          'isEnabled': false,
          'chainId': 1,
          'subHash': '0xe55917c42ac3e8f6c080e3780c5e0ea7a0a3da6c05e7ced5fe69fee48133a5eb',
          'blockNumber': 0,
          'positionId': '1-aave__v3',
          'subId': 2,
          'protocol': {
            'id': 'Aave__V3',
            'name': 'Aave',
            'slug': 'aave',
            'version': 'V3',
            'fullName': 'Aave V3'
          },
          'strategy': {
            'isBundle': true,
            'strategyOrBundleId': 0,
            'strategyId': 'leverage-management',
            'protocol': {
              'id': 'Aave__V3',
              'name': 'Aave',
              'slug': 'aave',
              'version': 'V3',
              'fullName': 'Aave V3'
            }
          },
          'strategyData': {
            'encoded': {
              'subData': [
                '0x00000000000000000000000000000000000000000000000014d1120d7b160000',
                '0x0000000000000000000000000000000000000000000000000000000000000001',
                '0x0000000000000000000000000000000000000000000000000000000000000001',
                '0x0000000000000000000000000000000000000000000000000000000000000000'
              ]
            },
            'decoded': {
              'triggerData': {
                'market': '0xa97684ead0e402dC232d5A977953DF7ECBaB3CDb',
                'ratio': 135,
                'ratioState': 1
              },
              'subData': {
                'targetRatio': 150
              }
            }
          },
          'specific': {
            'triggerRepayRatio': 135,
            'targetRepayRatio': 150,
            'repayEnabled': true,
            'subId1': 2,
            'mergeWithId': 'boost'
          }
        },
        {
          'isEnabled': false,
          'chainId': 1,
          'subHash': '0x96d6a5fe8127765a0fa55115621495bf66ebd16029b0883bc097eda1b597ab0b',
          'blockNumber': 0,
          'positionId': '1-aave__v3',
          'subId': 3,
          'protocol': {
            'id': 'Aave__V3',
            'name': 'Aave',
            'slug': 'aave',
            'version': 'V3',
            'fullName': 'Aave V3'
          },
          'strategy': {
            'isBundle': true,
            'strategyOrBundleId': 1,
            'strategyId': 'leverage-management',
            'protocol': {
              'id': 'Aave__V3',
              'name': 'Aave',
              'slug': 'aave',
              'version': 'V3',
              'fullName': 'Aave V3'
            }
          },
          'strategyData': {
            'encoded': {
              'subData': [
                '0x00000000000000000000000000000000000000000000000014d1120d7b160000',
                '0x0000000000000000000000000000000000000000000000000000000000000000',
                '0x0000000000000000000000000000000000000000000000000000000000000001',
                '0x0000000000000000000000000000000000000000000000000000000000000000',
                '0x0000000000000000000000000000000000000000000000000000000000000001'
              ]
            },
            'decoded': {
              'triggerData': {
                'market': '0xa97684ead0e402dC232d5A977953DF7ECBaB3CDb',
                'ratio': 165,
                'ratioState': 0
              },
              'subData': {
                'targetRatio': 150
              }
            }
          },
          'specific': {
            'triggerBoostRatio': 165,
            'targetBoostRatio': 150,
            'boostEnabled': false,
            'subId2': 3,
            'mergeId': 'boost'
          }
        },
        {
          'isEnabled': false,
          'chainId': 1,
          'subHash': '0x96d6a5fe8127765a0fa55115621495bf66ebd16029b0883bc097eda1b597ab0b',
          'blockNumber': 1,
          'positionId': '1-aave__v3',
          'subId': 4,
          'protocol': {
            'id': 'Aave__V3',
            'name': 'Aave',
            'slug': 'aave',
            'version': 'V3',
            'fullName': 'Aave V3'
          },
          'strategy': {
            'isBundle': true,
            'strategyOrBundleId': 1,
            'strategyId': 'leverage-management',
            'protocol': {
              'id': 'Aave__V3',
              'name': 'Aave',
              'slug': 'aave',
              'version': 'V3',
              'fullName': 'Aave V3'
            }
          },
          'strategyData': {
            'encoded': {
              'subData': [
                '0x00000000000000000000000000000000000000000000000014d1120d7b160000',
                '0x0000000000000000000000000000000000000000000000000000000000000000',
                '0x0000000000000000000000000000000000000000000000000000000000000001',
                '0x0000000000000000000000000000000000000000000000000000000000000000',
                '0x0000000000000000000000000000000000000000000000000000000000000001'
              ]
            },
            'decoded': {
              'triggerData': {
                'market': '0xa97684ead0e402dC232d5A977953DF7ECBaB3CDb',
                'ratio': 165,
                'ratioState': 0
              },
              'subData': {
                'targetRatio': 150
              }
            }
          },
          'specific': {
            'triggerBoostRatio': 165,
            'targetBoostRatio': 150,
            'boostEnabled': false,
            'subId2': 4,
            'mergeId': 'boost'
          }
        },
        {
          'isEnabled': false,
          'chainId': 1,
          'subHash': '0x96d6a5fe8127765a0fa55115621495bf66ebd16029b0883bc097eda1b597ab0b',
          'blockNumber': 1,
          'positionId': '1-aave__v3',
          'subId': 5,
          'protocol': {
            'id': 'Aave__V3',
            'name': 'Aave',
            'slug': 'aave',
            'version': 'V3',
            'fullName': 'Aave V3'
          },
          'strategy': {
            'isBundle': true,
            'strategyOrBundleId': 1,
            'strategyId': 'leverage-management',
            'protocol': {
              'id': 'Aave__V3',
              'name': 'Aave',
              'slug': 'aave',
              'version': 'V3',
              'fullName': 'Aave V3'
            }
          },
          'strategyData': {
            'encoded': {
              'subData': [
                '0x00000000000000000000000000000000000000000000000014d1120d7b160000',
                '0x0000000000000000000000000000000000000000000000000000000000000000',
                '0x0000000000000000000000000000000000000000000000000000000000000001',
                '0x0000000000000000000000000000000000000000000000000000000000000000',
                '0x0000000000000000000000000000000000000000000000000000000000000001'
              ]
            },
            'decoded': {
              'triggerData': {
                'market': '0xa97684ead0e402dC232d5A977953DF7ECBaB3CDb',
                'ratio': 165,
                'ratioState': 0
              },
              'subData': {
                'targetRatio': 150
              }
            }
          },
          'specific': {
            'triggerBoostRatio': 165,
            'targetBoostRatio': 150,
            'boostEnabled': false,
            'subId2': 5,
            'mergeId': 'boost'
          }
        },
        {
          'isEnabled': false,
          'chainId': 1,
          'subHash': '0x52cd11186443c2734f027a7175bccf80158c6a45906f4b33b5713b77244aa7f6',
          'blockNumber': 1,
          'positionId': '1-aave__v3',
          'subId': 6,
          'protocol': {
            'id': 'Aave__V3',
            'name': 'Aave',
            'slug': 'aave',
            'version': 'V3',
            'fullName': 'Aave V3'
          },
          'strategy': {
            'isBundle': true,
            'strategyOrBundleId': 0,
            'strategyId': 'leverage-management',
            'protocol': {
              'id': 'Aave__V3',
              'name': 'Aave',
              'slug': 'aave',
              'version': 'V3',
              'fullName': 'Aave V3'
            }
          },
          'strategyData': {
            'encoded': {
              'subData': [
                '0x00000000000000000000000000000000000000000000000012bc29d8eec70000',
                '0x0000000000000000000000000000000000000000000000000000000000000001',
                '0x0000000000000000000000000000000000000000000000000000000000000001',
                '0x0000000000000000000000000000000000000000000000000000000000000000'
              ]
            },
            'decoded': {
              'triggerData': {
                'market': '0xa97684ead0e402dC232d5A977953DF7ECBaB3CDb',
                'ratio': 120,
                'ratioState': 1
              },
              'subData': {
                'targetRatio': 135
              }
            }
          },
          'specific': {
            'triggerRepayRatio': 120,
            'targetRepayRatio': 135,
            'repayEnabled': true,
            'subId1': 6,
            'mergeWithId': 'boost'
          }
        }
      ],[
        {
          'isEnabled': true,
          'chainId': 1,
          'subHash': '0x7a14b187374b9ab02f6f7c95f275ef547376da010d53c715870cd053199a6aee',
          'blockNumber': 0,
          'positionId': '1-aave__v3',
          'subId': 0,
          'protocol': {
            'id': 'Aave__V3',
            'name': 'Aave',
            'slug': 'aave',
            'version': 'V3',
            'fullName': 'Aave V3'
          },
          'strategy': {
            'isBundle': true,
            'strategyOrBundleId': 0,
            'strategyId': 'leverage-management',
            'protocol': {
              'id': 'Aave__V3',
              'name': 'Aave',
              'slug': 'aave',
              'version': 'V3',
              'fullName': 'Aave V3'
            }
          },
          'strategyData': {
            'encoded': {
              'subData': [
                '0x000000000000000000000000000000000000000000000000120a871cc0020000',
                '0x0000000000000000000000000000000000000000000000000000000000000001',
                '0x0000000000000000000000000000000000000000000000000000000000000001',
                '0x0000000000000000000000000000000000000000000000000000000000000000'
              ]
            },
            'decoded': {
              'triggerData': {
                'market': '0xa97684ead0e402dC232d5A977953DF7ECBaB3CDb',
                'ratio': 120,
                'ratioState': 1
              },
              'subData': {
                'targetRatio': 130
              }
            }
          },
          'specific': {
            'triggerBoostRatio': 165,
            'targetBoostRatio': 150,
            'boostEnabled': false,
            'subId2': 3,
            'mergeId': 'boost',
            'triggerRepayRatio': 120,
            'targetRepayRatio': 130,
            'repayEnabled': true,
            'subId1': 0,
            'mergeWithId': 'boost'
          },
          'subIds': [
            0,
            3
          ]
        },
        {
          'isEnabled': false,
          'chainId': 1,
          'subHash': '0x7a14b187374b9ab02f6f7c95f275ef547376da010d53c715870cd053199a6aee',
          'blockNumber': 1,
          'positionId': '1-aave__v3',
          'subId': 1,
          'protocol': {
            'id': 'Aave__V3',
            'name': 'Aave',
            'slug': 'aave',
            'version': 'V3',
            'fullName': 'Aave V3'
          },
          'strategy': {
            'isBundle': true,
            'strategyOrBundleId': 0,
            'strategyId': 'leverage-management',
            'protocol': {
              'id': 'Aave__V3',
              'name': 'Aave',
              'slug': 'aave',
              'version': 'V3',
              'fullName': 'Aave V3'
            }
          },
          'strategyData': {
            'encoded': {
              'subData': [
                '0x000000000000000000000000000000000000000000000000120a871cc0020000',
                '0x0000000000000000000000000000000000000000000000000000000000000001',
                '0x0000000000000000000000000000000000000000000000000000000000000001',
                '0x0000000000000000000000000000000000000000000000000000000000000000'
              ]
            },
            'decoded': {
              'triggerData': {
                'market': '0xa97684ead0e402dC232d5A977953DF7ECBaB3CDb',
                'ratio': 120,
                'ratioState': 1
              },
              'subData': {
                'targetRatio': 130
              }
            }
          },
          'specific': {
            'triggerBoostRatio': 165,
            'targetBoostRatio': 150,
            'boostEnabled': false,
            'subId2': 4,
            'mergeId': 'boost',
            'triggerRepayRatio': 120,
            'targetRepayRatio': 130,
            'repayEnabled': true,
            'subId1': 1,
            'mergeWithId': 'boost'
          },
          'subIds': [
            1,
            4
          ]
        },
        {
          'isEnabled': false,
          'chainId': 1,
          'subHash': '0xe55917c42ac3e8f6c080e3780c5e0ea7a0a3da6c05e7ced5fe69fee48133a5eb',
          'blockNumber': 1,
          'positionId': '1-aave__v3',
          'subId': 2,
          'protocol': {
            'id': 'Aave__V3',
            'name': 'Aave',
            'slug': 'aave',
            'version': 'V3',
            'fullName': 'Aave V3'
          },
          'strategy': {
            'isBundle': true,
            'strategyOrBundleId': 0,
            'strategyId': 'leverage-management',
            'protocol': {
              'id': 'Aave__V3',
              'name': 'Aave',
              'slug': 'aave',
              'version': 'V3',
              'fullName': 'Aave V3'
            }
          },
          'strategyData': {
            'encoded': {
              'subData': [
                '0x00000000000000000000000000000000000000000000000014d1120d7b160000',
                '0x0000000000000000000000000000000000000000000000000000000000000001',
                '0x0000000000000000000000000000000000000000000000000000000000000001',
                '0x0000000000000000000000000000000000000000000000000000000000000000'
              ]
            },
            'decoded': {
              'triggerData': {
                'market': '0xa97684ead0e402dC232d5A977953DF7ECBaB3CDb',
                'ratio': 135,
                'ratioState': 1
              },
              'subData': {
                'targetRatio': 150
              }
            }
          },
          'specific': {
            'triggerBoostRatio': 165,
            'targetBoostRatio': 150,
            'boostEnabled': false,
            'subId2': 5,
            'mergeId': 'boost',
            'triggerRepayRatio': 135,
            'targetRepayRatio': 150,
            'repayEnabled': true,
            'subId1': 2,
            'mergeWithId': 'boost'
          },
          'subIds': [
            2,
            5
          ]
        },
        {
          'isEnabled': false,
          'chainId': 1,
          'subHash': '0x52cd11186443c2734f027a7175bccf80158c6a45906f4b33b5713b77244aa7f6',
          'blockNumber': 1,
          'positionId': '1-aave__v3',
          'subId': 6,
          'protocol': {
            'id': 'Aave__V3',
            'name': 'Aave',
            'slug': 'aave',
            'version': 'V3',
            'fullName': 'Aave V3'
          },
          'strategy': {
            'isBundle': true,
            'strategyOrBundleId': 0,
            'strategyId': 'leverage-management',
            'protocol': {
              'id': 'Aave__V3',
              'name': 'Aave',
              'slug': 'aave',
              'version': 'V3',
              'fullName': 'Aave V3'
            }
          },
          'strategyData': {
            'encoded': {
              'subData': [
                '0x00000000000000000000000000000000000000000000000012bc29d8eec70000',
                '0x0000000000000000000000000000000000000000000000000000000000000001',
                '0x0000000000000000000000000000000000000000000000000000000000000001',
                '0x0000000000000000000000000000000000000000000000000000000000000000'
              ]
            },
            'decoded': {
              'triggerData': {
                'market': '0xa97684ead0e402dC232d5A977953DF7ECBaB3CDb',
                'ratio': 120,
                'ratioState': 1
              },
              'subData': {
                'targetRatio': 135
              }
            }
          },
          'specific': {
            'triggerRepayRatio': 120,
            'targetRepayRatio': 135,
            'repayEnabled': true,
            'subId1': 6,
            'mergeWithId': 'boost'
          },
          'subIds': [
            6
          ]
        }
      ]
      ],
    ];
    examples.forEach(([input, actual]) => {
      it(`Given ${input} should return expected value:`, async () => {
        // @ts-ignore
        const expected = exampleStrategiesAutomation.mergeSubs(input);
        expect(JSON.stringify(actual)).to.equal(JSON.stringify(expected));
      });
    });

    it('Aave V4: pairs repay/boost merge only when trigger spoke matches (no cross-spoke merge)', () => {
      const spoke1 = '0x0000000000000000000000000000000000000a01';
      const spoke2 = '0x0000000000000000000000000000000000000a02';
      const base = {
        isEnabled: true,
        chainId: 1,
        owner: '0x0000000000000000000000000000000000000b01',
        protocol: { id: 'Aave__V4' },
        strategy: { strategyId: 'leverage-management' },
        blockNumber: 0,
        subHash: '0x1',
        positionId: 'test',
      };
      const boostSpoke1 = {
        ...base,
        subId: 1,
        strategyData: { decoded: { triggerData: { spoke: spoke1 }, subData: {} } },
        specific: { mergeId: 'boost', subId2: 1 },
      };
      const repaySpoke2 = {
        ...base,
        subId: 2,
        strategyData: { decoded: { triggerData: { spoke: spoke2 }, subData: {} } },
        specific: { mergeWithId: 'boost', subId1: 2 },
      };
      const boostSpoke2 = {
        ...base,
        subId: 3,
        strategyData: { decoded: { triggerData: { spoke: spoke2 }, subData: {} } },
        specific: { mergeId: 'boost', subId2: 3 },
      };
      // @ts-ignore — mergeSubs is protected; exercised here as in examples above
      const merged = exampleStrategiesAutomation.mergeSubs([boostSpoke1, repaySpoke2, boostSpoke2]);
      expect(merged).to.have.length(2);
      const mergedPair = merged.find((m: { subIds?: number[] }) => m.subIds?.length === 2);
      const loneBoost = merged.find((m: { subIds?: number[] }) => m.subIds?.length === 1);
      expect(mergedPair?.strategyData?.decoded?.triggerData?.spoke).to.equal(spoke2);
      expect(loneBoost?.subId).to.equal(1);
    });
  });

  describe('When testing StrategiesAutomation.parseSubscriptionsFromApi', () => {
    const strategiesAutomation = new StrategiesAutomation({
      chainId: ChainId.Ethereum,
      provider: Web3_1,
      providerFork: null!,
    });

    const owner = '0x9cB7E19861665366011899d74E75d4F2A419aEeD';
    const subData = [
      '0x0000000000000000000000000000000000000000000000001bc16d674ec80000',
      '0x0000000000000000000000000000000000000000000000000000000000000001',
      '0x0000000000000000000000000000000000000000000000000000000000000001',
      '0x0000000000000000000000000000000000000000000000000000000000000000',
    ];
    // Aave V3 leverage management: repay (bundle 8, ratio under) and boost (bundle 9, ratio over) for the same owner and market
    const repay: ApiSubscriptionRecord = {
      id: 379,
      wallet: owner,
      wallet_type: 'safe',
      is_enabled: true,
      invalid: false,
      status: SubscriptionStatus.Active,
      is_bundle: true,
      strategy_or_bundle_id: 8,
      strategy_ids: [34, 35],
      sub_data_hash: '0xafa4d200be62f171b57b1ae0f4e8348d1ac3f6d0812ad6da74a2adae8037dde1',
      trigger_data: ['0000000000000000000000009cb7e19861665366011899d74e75d4f2a419aeed0000000000000000000000002f39d218133afab8f2b819b1066c7e434ad94e9e00000000000000000000000000000000000000000000000019ac8532c27900000000000000000000000000000000000000000000000000000000000000000001'],
      sub_data: subData,
      block_number: 18015756,
      additional_triggers: null,
    };
    const boost: ApiSubscriptionRecord = {
      ...repay,
      id: 380,
      is_enabled: false,
      status: SubscriptionStatus.Disabled,
      strategy_or_bundle_id: 9,
      sub_data_hash: '0x1111111111111111111111111111111111111111111111111111111111111111',
      trigger_data: ['0000000000000000000000009cb7e19861665366011899d74e75d4f2a419aeed0000000000000000000000002f39d218133afab8f2b819b1066c7e434ad94e9e0000000000000000000000000000000000000000000000002386f26fc10000000000000000000000000000000000000000000000000000000000000000000000'],
    };

    it('Given API records should return parsed positions carrying the API status', () => {
      const positions = strategiesAutomation.parseSubscriptionsFromApi([repay, boost]);
      expect(positions).to.have.length(2);
      expect(positions.map((p) => p?.subId)).to.eql([379, 380]);
      expect(positions.map((p) => p?.status)).to.eql([SubscriptionStatus.Active, SubscriptionStatus.Disabled]);
      expect(positions.map((p) => p?.isEnabled)).to.eql([true, false]);
    });

    it('Given mergeSubs option should merge the repay and boost pair and keep the active status', () => {
      const positions = strategiesAutomation.parseSubscriptionsFromApi([repay, boost], { mergeSubs: true });
      expect(positions).to.have.length(1);
      expect(positions[0]?.subIds).to.eql([379, 380]);
      expect(positions[0]?.isEnabled).to.equal(true);
      expect(positions[0]?.status).to.equal(SubscriptionStatus.Active);
    });

    it('Given enabledOnly option should drop disabled records before parsing', () => {
      const positions = strategiesAutomation.parseSubscriptionsFromApi([repay, boost], { enabledOnly: true });
      expect(positions.map((p) => p?.subId)).to.eql([379]);
    });

    it('Given a record of an unknown strategy should return null for it', () => {
      const positions = strategiesAutomation.parseSubscriptionsFromApi([{ ...repay, strategy_or_bundle_id: 9999 }]);
      expect(positions).to.eql([null]);
    });
  });
});
