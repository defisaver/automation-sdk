import { expect } from 'chai';
import * as web3Utils from 'web3-utils';
import AbiCoder from 'web3-eth-abi';
import { getAssetInfo } from '@defisaver/tokens';

import type { EthereumAddress } from '../types';
import { ChainId, ProtocolIdentifiers, RatioState } from '../types/enums';

import { sparkEncode } from './strategySubService';

import {
  addToArrayIf,
  addToObjectIf,
  compareAddresses,
  compareSubHashes,
  encodeSubId,
  ethToWeth,
  getRatioStateInfoForAaveCloseStrategy,
  isAddress,
  isDefined,
  isEmptyBytes,
  isRatioStateOver,
  isRatioStateUnder,
  isUndefined,
  ratioPercentageToWei,
  requireAddress,
  requireAddresses,
  weiToRatioPercentage,
  wethToEth,
  wethToEthByAddress,
  getPositionId,
} from './utils';

describe('Feature: utils.ts', () => {
  describe('When testing utils.isDefined()', () => {
    const examples: Array<[boolean, any]> = [
      [true, 'something'],
      [true, NaN],
      [true, 0],
      [false, undefined],
      [false, null],
    ];

    examples.forEach(([expected, actual]) => {
      it(`Given ${actual} should return expected value: ${expected}`, () => {
        expect(isDefined(actual)).to.equal(expected);
      });
    });
  });

  describe('When testing utils.isUndefined()', () => {
    const examples: Array<[boolean, any]> = [
      [false, 'something'],
      [false, NaN],
      [false, 0],
      [true, undefined],
      [true, null],
    ];

    examples.forEach(([expected, actual]) => {
      it(`Given ${actual} should return expected value: ${expected}`, () => {
        expect(isUndefined(actual)).to.equal(expected);
      });
    });
  });

  describe('When testing utils.compareAddresses()', () => {
    const examples: Array<[boolean, [string, string]]> = [
      [true, ['nesto', 'nesto']],
      [true, ['', '']],
      [false, ['something', 'nesto']],
      [false, ['', 'nesto']],
    ];

    examples.forEach(([expected, actual]) => {
      it(`Given ${actual} should return expected value: ${expected}`, () => {
        expect(compareAddresses(...actual)).to.equal(expected);
      });
    });
  });

  describe('When testing utils.isAddress()', () => {
    const examples: Array<[boolean, string]> = [
      [true, '0x996bc83fa1b947cca00e5dcf776c438096549062'],
      [true, '0x0000000000000000000000000000000000000000'],
      [false, '0x996bc83fa147cca00e5dcf776c438096549062'],
      [false, '0x996bc83fa147cca00e5dcf776c438096549062xx'],
      [false, ''],
      [false, 'majmune.eth'],
    ];

    examples.forEach(([expected, actual]) => {
      it(`Given ${actual} should return expected value: ${expected}`, () => {
        expect(isAddress(actual)).to.equal(expected);
      });
    });
  });

  describe('When testing utils.addToArrayIf()', () => {

    const exampleOne = [1, ...addToArrayIf(true, 2)];
    const actualOne = [1, 2];

    it(`Given ${actualOne.join(', ')} should return expected value: [${exampleOne.join(', ')}]`, () => {
      expect(actualOne).to.eql(exampleOne)
    });

    const exampleTwo = [1, ...addToArrayIf(false, 2)];
    const actualTwo = [1];

    it(`Given ${actualTwo.join(', ')} should return expected value: [${exampleTwo.join(', ')}]`, () => {
      expect(actualTwo).to.eql(exampleTwo)
    });
  });

  describe('When testing utils.addToObjectIf()', () => {

    const exampleOne = {
      a: 1, ...addToObjectIf(true, { b: 2 })
    };
    const actualOne = { a: 1, b: 2 };

    it(`Given ${JSON.stringify(actualOne)} should return expected value: ${JSON.stringify(exampleOne)}`, () => {
      expect(actualOne).to.eql(exampleOne)
    });

    const exampleTwo = {
      a: 1, ...addToObjectIf(false, { b: 2 })
    };
    const actualTwo = { a: 1 };

    it(`Given ${JSON.stringify(actualTwo)} should return expected value: ${JSON.stringify(exampleTwo)}`, () => {
      expect(actualTwo).to.eql(exampleTwo)
    });
  });

  describe('When testing utils.ethToWeth()', () => {

    const examples: Array<[string, string]> = [
      ['WETH', 'ETH'],
      ['rETH', 'rETH'],
      ['ETH.c', 'ETH.c'],
      ['cETHx2', 'cETHx2'],
      ['WETH', 'WETH'],
      ['DAI', 'DAI'],
    ];

    examples.forEach(([expected, actual]) => {
      it(`Given ${actual} should return expected value: ${expected}`, () => {
        expect(ethToWeth(actual)).to.equal(expected);
      });
    });
  });

  describe('When testing utils.wethToEth()', () => {

    const examples: Array<[string, string]> = [
      ['ETH', 'ETH'],
      ['rETH', 'rETH'],
      ['ETH.c', 'ETH.c'],
      ['cETHx2', 'cETHx2'],
      ['ETH', 'WETH'],
      ['DAI', 'DAI'],
    ];

    examples.forEach(([expected, actual]) => {
      it(`Given ${actual} should return expected value: ${expected}`, () => {
        expect(wethToEth(actual)).to.equal(expected);
      });
    });
  });

  describe('When testing utils.wethToEthByAddress()', () => {

    /**
     * @dev wethToEthByAddress will return empty string when asset doesn't exist in assets array of @defisaver/tokens
     *      This is @defisaver/tokens problem, but still seems like a wierd behaviour
     */
    const examples: Array<[string, [string, number]]> = [
      ['0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee', ['0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2', 1]],
      ['0xb3319f5d18bc0d84dd1b4825dcde5d5f7266d407', ['0xb3319f5d18bc0d84dd1b4825dcde5d5f7266d407', 1]],
      ['0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee', ['0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee', 1]],

      ['0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee', ['0x4200000000000000000000000000000000000006', 10]],
      ['0xab7badef82e9fe11f6f33f87bc9bc2aa27f2fcb5', ['0xab7badef82e9fe11f6f33f87bc9bc2aa27f2fcb5', 10]],
      ['0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee', ['0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee', 10]],

      ['0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee', ['0x82aF49447D8a07e3bd95BD0d56f35241523fBab1', 42161]],
      ['0xaf88d065e77c8cC2239327C5EDb3A432268e5831', ['0xaf88d065e77c8cC2239327C5EDb3A432268e5831', 42161]],
      ['0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee', ['0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee', 42161]],

    ];

    examples.forEach(([expected, actual]) => {
      it(`Given ${actual} should return expected value: ${expected}`, () => {
        expect(wethToEthByAddress(...actual)).to.equal(expected);
      });
    });
  });

  describe('When testing utils.compareSubHashes()', () => {

    const subDataToEncodeOne = [
      12,
      false,
      {
        baseTokenAddress: '0xaf88d065e77c8cC2239327C5EDb3A432268e5831',
        quoteTokenAddress: '0xaf88d065e77c8cC2239327C5EDb3A432268e5831',
        price: 100,
        ratioState: 1,
      },
      {
        collAsset: '0xaf88d065e77c8cC2239327C5EDb3A432268e5831',
        collAssetId: 2,
        debtAsset: '0xaf88d065e77c8cC2239327C5EDb3A432268e5831',
        debtAssetId: 3,
      },
    ]

    const subDataToEncodeTwo = [
      13,
      true,
      {
        baseTokenAddress: '0xaf88d065e77c8cC2239327C5EDb3A432268e5831',
        quoteTokenAddress: '0xaf88d065e77c8cC2239327C5EDb3A432268e5831',
        price: 100,
        ratioState: 2,
      },
      {
        collAsset: '0xaf88d065e77c8cC2239327C5EDb3A432268e5831',
        collAssetId: 2,
        debtAsset: '0xaf88d065e77c8cC2239327C5EDb3A432268e5831',
        debtAssetId: 3,
      },
    ]

    // @ts-ignore
    const encodedSubDataOne = sparkEncode.closeToAsset(...subDataToEncodeOne);
    // @ts-ignore
    const encodedSubDataTwo = sparkEncode.closeToAsset(...subDataToEncodeTwo);
    const encodedParams = web3Utils.keccak256(AbiCoder.encodeParameter('(uint64,bool,bytes[],bytes32[])', encodedSubDataOne));

    const examples: Array<[boolean, [string, any[]]]> = [
      [true, [encodedParams, encodedSubDataOne]],
      [false, [encodedParams, encodedSubDataTwo]],
    ];

    examples.forEach(([expected, actual]) => {
      it(`Given ${actual} should return expected value: ${expected}`, () => {
        expect(compareSubHashes(...actual)).to.equal(expected);
      });
    });
  });

  describe('When testing utils.encodeSubId()', () => {
    const examples: Array<[string, string]> = [
      ['00000001', '1'],
      ['00000002', '2'],
      ['0021c503', '2213123']
    ];

    examples.forEach(([expected, actual]) => {
      it(`Given ${actual} should return expected value: ${expected}`, () => {
        expect(encodeSubId(actual)).to.equal(expected);
      });
    });
  });

  describe('When testing utils.ratioPercentageToWei()', () => {
    const examples: Array<[string, number]> = [
      ['1200000000000000000', 120],
      ['2400000000000000000', 240],
      ['870000000000000000', 87],
    ];

    examples.forEach(([expected, actual]) => {
      it(`Given ${actual} should return expected value: ${expected}`, () => {
        expect(ratioPercentageToWei(actual)).to.equal(expected);
      });
    });
  });

  describe('When testing utils.weiToRatioPercentage()', () => {
    const examples: Array<[number, string]> = [
      [120, '1200000000000000000'],
      [240, '2400000000000000000'],
      [87, '870000000000000000'],
    ];

    examples.forEach(([expected, actual]) => {
      it(`Given ${actual} should return expected value: ${expected}`, () => {
        expect(weiToRatioPercentage(actual)).to.equal(expected);
      });
    });
  });

  describe('When testing utils.isRatioStateOver()', () => {
    const examples: Array<[boolean, RatioState]> = [
      [true, RatioState.OVER],
      [false, RatioState.UNDER],
      [false, NaN],
      [false, 3],
      [false, Infinity],
    ];

    examples.forEach(([expected, actual]) => {
      it(`Given ${actual} should return expected value: ${expected}`, () => {
        expect(isRatioStateOver(actual)).to.equal(expected);
      });
    });
  });

  describe('When testing utils.isRatioStateUnder()', () => {
    const examples: Array<[boolean, RatioState]> = [
      [true, RatioState.UNDER],
      [false, RatioState.OVER],
      [false, NaN],
      [false, 3],
      [false, Infinity],
    ];

    examples.forEach(([expected, actual]) => {
      it(`Given ${actual} should return expected value: ${expected}`, () => {
        expect(isRatioStateUnder(actual)).to.equal(expected);
      });
    });
  });

  describe('When testing utils.isEmptyBytes()', () => {
    const examples: Array<[boolean, string]> = [
      [true, '0x0000000000000000000000000000000000000000'],
      [false, '0x0000000000000000000000000000000000000001'],
      [false, '0x00000000000000000000000000000000000000000000'],
      [false, '0x000000000000000000000000000000000000000'],
      [false, ''],
    ];

    examples.forEach(([expected, actual]) => {
      it(`Given ${actual} should return expected value: ${expected}`, () => {
        expect(isEmptyBytes(actual)).to.equal(expected);
      });
    });
  });

  describe('When testing utils.requireAddress()', () => {
    const examples: Array<[boolean, any]> = [
      [true, '0x1e5698681E03326d783215adfB3173acF3Cf2B6'],
      [true, 1312],
      [true, ''],
      [true, '0x0000000000000000000000000000000000000000'],
      [true, '0xZe5698681E03326d783215adfB3173acF3Cf2B6'],
      [true, 'Ze5698681E03326d783215adfB3173acF3Cf2B6'],
      [false, '0x1e5698681E03326d783215adfB3173acF3Cf2B61'],
    ];

    examples.forEach(([expected, actual]) => {
      if (expected) {
        it(`Given ${actual} should throw an error`, () => {
          expect(() => requireAddress(actual)).to.throw(Error);
        });
      } else {
        it(`Given ${actual} should not throw an error`, () => {
          expect(() => requireAddress(actual)).not.to.throw(Error);
        });
      }
    });
  });

  describe('When testing utils.requireAddresses()', () => {
    const examples: Array<[boolean, any]> = [
      [true, '0x1e5698681E03326d783215adfB3173acF3Cf2B6'],
      [true, [1312, '0x1e5698681E03326d783215adfB3173acF3Cf2B61']],
      [true, ['', '0x1e5698681E03326d783215adfB3173acF3Cf2B61']],
      [true, ['0x0000000000000000000000000000000000000000', '0x1e5698481E03326d783215adfB3173acF3Cf2B61']],
      [true, ['0xZe5698681E03326d783215adfB3173acF3Cf2B6', '0x1e5698681E03326d783215adfB3173acF3Cc2B61']],
      [true, ['Ze5698681E03326d783215adfB3173acF3Cf2B6', '', '0x1e5698681E03326d783215adfB3173acF3Cf2B61']],
      [false, ['0x1e5698681E03326d783215adfB3173acF3Cf2B61', '0x2e5698681E03326d783215adfB3173acF3Cf2B61']],
    ];

    examples.forEach(([expected, actual]) => {
      if (expected) {
        it(`Given ${actual} should throw an error`, () => {
          expect(() => requireAddresses(actual)).to.throw(Error);
        });
      } else {
        it(`Given ${actual} should not throw an error`, () => {
          expect(() => requireAddresses(actual)).not.to.throw(Error);
        });
      }
    });
  });

  describe('When testing utils.getRatioStateInfoForAaveCloseStrategy()', () => {
    const examples: Array<[{ shouldFlip: boolean, ratioState: RatioState }, [RatioState, EthereumAddress, EthereumAddress, ChainId]]> = [
      [
        { shouldFlip: true, ratioState: RatioState.UNDER },
        [RatioState.OVER, getAssetInfo('DAI').address, getAssetInfo('ETH').address, ChainId.Ethereum]
      ],
      [
        { shouldFlip: false, ratioState: RatioState.UNDER },
        [RatioState.UNDER, getAssetInfo('DAI').address, getAssetInfo('ETH').address, ChainId.Arbitrum]
      ],
      [
        { shouldFlip: false, ratioState: RatioState.OVER },
        [RatioState.OVER, getAssetInfo('ETH').address, getAssetInfo('ETH').address, ChainId.Optimism]
      ],
    ];

    examples.forEach(([expected, actual]) => {
      it(`Given ${actual} should return expected value: ${JSON.stringify(expected)}`, () => {
        expect(getRatioStateInfoForAaveCloseStrategy(...actual)).to.eql(expected);
      });
    });
  });

  describe('When testing utils.getPositionId()', () => {
    const examples: Array<[string, string]> = [
      [
        '4ff5e5b0a2fe7d72861ce560c2aa71d80c60c11c7ac08a4b396ff95a8e19b9c1',
        `1${ProtocolIdentifiers.StrategiesAutomation.AaveV3}0x9cB7E19861665366011899d74E75d4F2A419aEeD0x2f39d218133AFaB8F2B819B1066c7E434Ad94E9e`
      ],
    ];

    examples.forEach(([expected, actual]) => {
      it(`Given ${actual} should return expected value: ${JSON.stringify(expected)}`, () => {
        expect(getPositionId(actual)).to.eql(expected);
      });
    });
  });
});