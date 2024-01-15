import {expect} from 'chai';

import {ChainId} from '../../types/enums';

import StrategiesAutomation from "./StrategiesAutomation";
import Web3 from "web3";

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
          "isEnabled": true,
          "chainId": 1,
          "subHash": "0x7a14b187374b9ab02f6f7c95f275ef547376da010d53c715870cd053199a6aee",
          "blockNumber": 0,
          "positionId": "1-aave__v3",
          "subId": 0,
          "protocol": {
            "id": "Aave__V3",
            "name": "Aave",
            "slug": "aave",
            "version": "V3",
            "fullName": "Aave V3"
          },
          "strategy": {
            "isBundle": true,
            "strategyOrBundleId": 0,
            "strategyId": "leverage-management",
            "protocol": {
              "id": "Aave__V3",
              "name": "Aave",
              "slug": "aave",
              "version": "V3",
              "fullName": "Aave V3"
            }
          },
          "strategyData": {
            "encoded": {
              "subData": [
                "0x000000000000000000000000000000000000000000000000120a871cc0020000",
                "0x0000000000000000000000000000000000000000000000000000000000000001",
                "0x0000000000000000000000000000000000000000000000000000000000000001",
                "0x0000000000000000000000000000000000000000000000000000000000000000"
              ]
            },
            "decoded": {
              "triggerData": {
                "market": "0xa97684ead0e402dC232d5A977953DF7ECBaB3CDb",
                "ratio": 120,
                "ratioState": 1
              },
              "subData": {
                "targetRatio": 130
              }
            }
          },
          "specific": {
            "triggerRepayRatio": 120,
            "targetRepayRatio": 130,
            "repayEnabled": true,
            "subId1": 0,
            "mergeWithId": "boost"
          }
        },
        {
          "isEnabled": false,
          "chainId": 1,
          "subHash": "0x7a14b187374b9ab02f6f7c95f275ef547376da010d53c715870cd053199a6aee",
          "blockNumber": 0,
          "positionId": "1-aave__v3",
          "subId": 1,
          "protocol": {
            "id": "Aave__V3",
            "name": "Aave",
            "slug": "aave",
            "version": "V3",
            "fullName": "Aave V3"
          },
          "strategy": {
            "isBundle": true,
            "strategyOrBundleId": 0,
            "strategyId": "leverage-management",
            "protocol": {
              "id": "Aave__V3",
              "name": "Aave",
              "slug": "aave",
              "version": "V3",
              "fullName": "Aave V3"
            }
          },
          "strategyData": {
            "encoded": {
              "subData": [
                "0x000000000000000000000000000000000000000000000000120a871cc0020000",
                "0x0000000000000000000000000000000000000000000000000000000000000001",
                "0x0000000000000000000000000000000000000000000000000000000000000001",
                "0x0000000000000000000000000000000000000000000000000000000000000000"
              ]
            },
            "decoded": {
              "triggerData": {
                "market": "0xa97684ead0e402dC232d5A977953DF7ECBaB3CDb",
                "ratio": 120,
                "ratioState": 1
              },
              "subData": {
                "targetRatio": 130
              }
            }
          },
          "specific": {
            "triggerRepayRatio": 120,
            "targetRepayRatio": 130,
            "repayEnabled": true,
            "subId1": 1,
            "mergeWithId": "boost"
          }
        },
        {
          "isEnabled": false,
          "chainId": 1,
          "subHash": "0xe55917c42ac3e8f6c080e3780c5e0ea7a0a3da6c05e7ced5fe69fee48133a5eb",
          "blockNumber": 0,
          "positionId": "1-aave__v3",
          "subId": 2,
          "protocol": {
            "id": "Aave__V3",
            "name": "Aave",
            "slug": "aave",
            "version": "V3",
            "fullName": "Aave V3"
          },
          "strategy": {
            "isBundle": true,
            "strategyOrBundleId": 0,
            "strategyId": "leverage-management",
            "protocol": {
              "id": "Aave__V3",
              "name": "Aave",
              "slug": "aave",
              "version": "V3",
              "fullName": "Aave V3"
            }
          },
          "strategyData": {
            "encoded": {
              "subData": [
                "0x00000000000000000000000000000000000000000000000014d1120d7b160000",
                "0x0000000000000000000000000000000000000000000000000000000000000001",
                "0x0000000000000000000000000000000000000000000000000000000000000001",
                "0x0000000000000000000000000000000000000000000000000000000000000000"
              ]
            },
            "decoded": {
              "triggerData": {
                "market": "0xa97684ead0e402dC232d5A977953DF7ECBaB3CDb",
                "ratio": 135,
                "ratioState": 1
              },
              "subData": {
                "targetRatio": 150
              }
            }
          },
          "specific": {
            "triggerRepayRatio": 135,
            "targetRepayRatio": 150,
            "repayEnabled": true,
            "subId1": 2,
            "mergeWithId": "boost"
          }
        },
        {
          "isEnabled": false,
          "chainId": 1,
          "subHash": "0x96d6a5fe8127765a0fa55115621495bf66ebd16029b0883bc097eda1b597ab0b",
          "blockNumber": 0,
          "positionId": "1-aave__v3",
          "subId": 3,
          "protocol": {
            "id": "Aave__V3",
            "name": "Aave",
            "slug": "aave",
            "version": "V3",
            "fullName": "Aave V3"
          },
          "strategy": {
            "isBundle": true,
            "strategyOrBundleId": 1,
            "strategyId": "leverage-management",
            "protocol": {
              "id": "Aave__V3",
              "name": "Aave",
              "slug": "aave",
              "version": "V3",
              "fullName": "Aave V3"
            }
          },
          "strategyData": {
            "encoded": {
              "subData": [
                "0x00000000000000000000000000000000000000000000000014d1120d7b160000",
                "0x0000000000000000000000000000000000000000000000000000000000000000",
                "0x0000000000000000000000000000000000000000000000000000000000000001",
                "0x0000000000000000000000000000000000000000000000000000000000000000",
                "0x0000000000000000000000000000000000000000000000000000000000000001"
              ]
            },
            "decoded": {
              "triggerData": {
                "market": "0xa97684ead0e402dC232d5A977953DF7ECBaB3CDb",
                "ratio": 165,
                "ratioState": 0
              },
              "subData": {
                "targetRatio": 150
              }
            }
          },
          "specific": {
            "triggerBoostRatio": 165,
            "targetBoostRatio": 150,
            "boostEnabled": false,
            "subId2": 3,
            "mergeId": "boost"
          }
        },
        {
          "isEnabled": false,
          "chainId": 1,
          "subHash": "0x96d6a5fe8127765a0fa55115621495bf66ebd16029b0883bc097eda1b597ab0b",
          "blockNumber": 1,
          "positionId": "1-aave__v3",
          "subId": 4,
          "protocol": {
            "id": "Aave__V3",
            "name": "Aave",
            "slug": "aave",
            "version": "V3",
            "fullName": "Aave V3"
          },
          "strategy": {
            "isBundle": true,
            "strategyOrBundleId": 1,
            "strategyId": "leverage-management",
            "protocol": {
              "id": "Aave__V3",
              "name": "Aave",
              "slug": "aave",
              "version": "V3",
              "fullName": "Aave V3"
            }
          },
          "strategyData": {
            "encoded": {
              "subData": [
                "0x00000000000000000000000000000000000000000000000014d1120d7b160000",
                "0x0000000000000000000000000000000000000000000000000000000000000000",
                "0x0000000000000000000000000000000000000000000000000000000000000001",
                "0x0000000000000000000000000000000000000000000000000000000000000000",
                "0x0000000000000000000000000000000000000000000000000000000000000001"
              ]
            },
            "decoded": {
              "triggerData": {
                "market": "0xa97684ead0e402dC232d5A977953DF7ECBaB3CDb",
                "ratio": 165,
                "ratioState": 0
              },
              "subData": {
                "targetRatio": 150
              }
            }
          },
          "specific": {
            "triggerBoostRatio": 165,
            "targetBoostRatio": 150,
            "boostEnabled": false,
            "subId2": 4,
            "mergeId": "boost"
          }
        },
        {
          "isEnabled": false,
          "chainId": 1,
          "subHash": "0x96d6a5fe8127765a0fa55115621495bf66ebd16029b0883bc097eda1b597ab0b",
          "blockNumber": 1,
          "positionId": "1-aave__v3",
          "subId": 5,
          "protocol": {
            "id": "Aave__V3",
            "name": "Aave",
            "slug": "aave",
            "version": "V3",
            "fullName": "Aave V3"
          },
          "strategy": {
            "isBundle": true,
            "strategyOrBundleId": 1,
            "strategyId": "leverage-management",
            "protocol": {
              "id": "Aave__V3",
              "name": "Aave",
              "slug": "aave",
              "version": "V3",
              "fullName": "Aave V3"
            }
          },
          "strategyData": {
            "encoded": {
              "subData": [
                "0x00000000000000000000000000000000000000000000000014d1120d7b160000",
                "0x0000000000000000000000000000000000000000000000000000000000000000",
                "0x0000000000000000000000000000000000000000000000000000000000000001",
                "0x0000000000000000000000000000000000000000000000000000000000000000",
                "0x0000000000000000000000000000000000000000000000000000000000000001"
              ]
            },
            "decoded": {
              "triggerData": {
                "market": "0xa97684ead0e402dC232d5A977953DF7ECBaB3CDb",
                "ratio": 165,
                "ratioState": 0
              },
              "subData": {
                "targetRatio": 150
              }
            }
          },
          "specific": {
            "triggerBoostRatio": 165,
            "targetBoostRatio": 150,
            "boostEnabled": false,
            "subId2": 5,
            "mergeId": "boost"
          }
        },
        {
          "isEnabled": false,
          "chainId": 1,
          "subHash": "0x52cd11186443c2734f027a7175bccf80158c6a45906f4b33b5713b77244aa7f6",
          "blockNumber": 1,
          "positionId": "1-aave__v3",
          "subId": 6,
          "protocol": {
            "id": "Aave__V3",
            "name": "Aave",
            "slug": "aave",
            "version": "V3",
            "fullName": "Aave V3"
          },
          "strategy": {
            "isBundle": true,
            "strategyOrBundleId": 0,
            "strategyId": "leverage-management",
            "protocol": {
              "id": "Aave__V3",
              "name": "Aave",
              "slug": "aave",
              "version": "V3",
              "fullName": "Aave V3"
            }
          },
          "strategyData": {
            "encoded": {
              "subData": [
                "0x00000000000000000000000000000000000000000000000012bc29d8eec70000",
                "0x0000000000000000000000000000000000000000000000000000000000000001",
                "0x0000000000000000000000000000000000000000000000000000000000000001",
                "0x0000000000000000000000000000000000000000000000000000000000000000"
              ]
            },
            "decoded": {
              "triggerData": {
                "market": "0xa97684ead0e402dC232d5A977953DF7ECBaB3CDb",
                "ratio": 120,
                "ratioState": 1
              },
              "subData": {
                "targetRatio": 135
              }
            }
          },
          "specific": {
            "triggerRepayRatio": 120,
            "targetRepayRatio": 135,
            "repayEnabled": true,
            "subId1": 6,
            "mergeWithId": "boost"
          }
        }
      ],[
        {
          "isEnabled": true,
          "chainId": 1,
          "subHash": "0x7a14b187374b9ab02f6f7c95f275ef547376da010d53c715870cd053199a6aee",
          "blockNumber": 0,
          "positionId": "1-aave__v3",
          "subId": 0,
          "protocol": {
            "id": "Aave__V3",
            "name": "Aave",
            "slug": "aave",
            "version": "V3",
            "fullName": "Aave V3"
          },
          "strategy": {
            "isBundle": true,
            "strategyOrBundleId": 0,
            "strategyId": "leverage-management",
            "protocol": {
              "id": "Aave__V3",
              "name": "Aave",
              "slug": "aave",
              "version": "V3",
              "fullName": "Aave V3"
            }
          },
          "strategyData": {
            "encoded": {
              "subData": [
                "0x000000000000000000000000000000000000000000000000120a871cc0020000",
                "0x0000000000000000000000000000000000000000000000000000000000000001",
                "0x0000000000000000000000000000000000000000000000000000000000000001",
                "0x0000000000000000000000000000000000000000000000000000000000000000"
              ]
            },
            "decoded": {
              "triggerData": {
                "market": "0xa97684ead0e402dC232d5A977953DF7ECBaB3CDb",
                "ratio": 120,
                "ratioState": 1
              },
              "subData": {
                "targetRatio": 130
              }
            }
          },
          "specific": {
            "triggerBoostRatio": 165,
            "targetBoostRatio": 150,
            "boostEnabled": false,
            "subId2": 3,
            "mergeId": "boost",
            "triggerRepayRatio": 120,
            "targetRepayRatio": 130,
            "repayEnabled": true,
            "subId1": 0,
            "mergeWithId": "boost"
          },
          "subIds": [
            0,
            3
          ]
        },
        {
          "isEnabled": false,
          "chainId": 1,
          "subHash": "0x7a14b187374b9ab02f6f7c95f275ef547376da010d53c715870cd053199a6aee",
          "blockNumber": 1,
          "positionId": "1-aave__v3",
          "subId": 1,
          "protocol": {
            "id": "Aave__V3",
            "name": "Aave",
            "slug": "aave",
            "version": "V3",
            "fullName": "Aave V3"
          },
          "strategy": {
            "isBundle": true,
            "strategyOrBundleId": 0,
            "strategyId": "leverage-management",
            "protocol": {
              "id": "Aave__V3",
              "name": "Aave",
              "slug": "aave",
              "version": "V3",
              "fullName": "Aave V3"
            }
          },
          "strategyData": {
            "encoded": {
              "subData": [
                "0x000000000000000000000000000000000000000000000000120a871cc0020000",
                "0x0000000000000000000000000000000000000000000000000000000000000001",
                "0x0000000000000000000000000000000000000000000000000000000000000001",
                "0x0000000000000000000000000000000000000000000000000000000000000000"
              ]
            },
            "decoded": {
              "triggerData": {
                "market": "0xa97684ead0e402dC232d5A977953DF7ECBaB3CDb",
                "ratio": 120,
                "ratioState": 1
              },
              "subData": {
                "targetRatio": 130
              }
            }
          },
          "specific": {
            "triggerBoostRatio": 165,
            "targetBoostRatio": 150,
            "boostEnabled": false,
            "subId2": 4,
            "mergeId": "boost",
            "triggerRepayRatio": 120,
            "targetRepayRatio": 130,
            "repayEnabled": true,
            "subId1": 1,
            "mergeWithId": "boost"
          },
          "subIds": [
            1,
            4
          ]
        },
        {
          "isEnabled": false,
          "chainId": 1,
          "subHash": "0xe55917c42ac3e8f6c080e3780c5e0ea7a0a3da6c05e7ced5fe69fee48133a5eb",
          "blockNumber": 1,
          "positionId": "1-aave__v3",
          "subId": 2,
          "protocol": {
            "id": "Aave__V3",
            "name": "Aave",
            "slug": "aave",
            "version": "V3",
            "fullName": "Aave V3"
          },
          "strategy": {
            "isBundle": true,
            "strategyOrBundleId": 0,
            "strategyId": "leverage-management",
            "protocol": {
              "id": "Aave__V3",
              "name": "Aave",
              "slug": "aave",
              "version": "V3",
              "fullName": "Aave V3"
            }
          },
          "strategyData": {
            "encoded": {
              "subData": [
                "0x00000000000000000000000000000000000000000000000014d1120d7b160000",
                "0x0000000000000000000000000000000000000000000000000000000000000001",
                "0x0000000000000000000000000000000000000000000000000000000000000001",
                "0x0000000000000000000000000000000000000000000000000000000000000000"
              ]
            },
            "decoded": {
              "triggerData": {
                "market": "0xa97684ead0e402dC232d5A977953DF7ECBaB3CDb",
                "ratio": 135,
                "ratioState": 1
              },
              "subData": {
                "targetRatio": 150
              }
            }
          },
          "specific": {
            "triggerBoostRatio": 165,
            "targetBoostRatio": 150,
            "boostEnabled": false,
            "subId2": 5,
            "mergeId": "boost",
            "triggerRepayRatio": 135,
            "targetRepayRatio": 150,
            "repayEnabled": true,
            "subId1": 2,
            "mergeWithId": "boost"
          },
          "subIds": [
            2,
            5
          ]
        },
        {
          "isEnabled": false,
          "chainId": 1,
          "subHash": "0x52cd11186443c2734f027a7175bccf80158c6a45906f4b33b5713b77244aa7f6",
          "blockNumber": 1,
          "positionId": "1-aave__v3",
          "subId": 6,
          "protocol": {
            "id": "Aave__V3",
            "name": "Aave",
            "slug": "aave",
            "version": "V3",
            "fullName": "Aave V3"
          },
          "strategy": {
            "isBundle": true,
            "strategyOrBundleId": 0,
            "strategyId": "leverage-management",
            "protocol": {
              "id": "Aave__V3",
              "name": "Aave",
              "slug": "aave",
              "version": "V3",
              "fullName": "Aave V3"
            }
          },
          "strategyData": {
            "encoded": {
              "subData": [
                "0x00000000000000000000000000000000000000000000000012bc29d8eec70000",
                "0x0000000000000000000000000000000000000000000000000000000000000001",
                "0x0000000000000000000000000000000000000000000000000000000000000001",
                "0x0000000000000000000000000000000000000000000000000000000000000000"
              ]
            },
            "decoded": {
              "triggerData": {
                "market": "0xa97684ead0e402dC232d5A977953DF7ECBaB3CDb",
                "ratio": 120,
                "ratioState": 1
              },
              "subData": {
                "targetRatio": 135
              }
            }
          },
          "specific": {
            "triggerRepayRatio": 120,
            "targetRepayRatio": 135,
            "repayEnabled": true,
            "subId1": 6,
            "mergeWithId": "boost"
          },
          "subIds": [
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
  });
});
