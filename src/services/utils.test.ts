import { expect } from 'chai';
import * as web3Utils from 'web3-utils';
import * as web3Abi from 'web3-eth-abi';

import {
  compareAddresses,
  isAddress,
  isDefined,
  isUndefined,
  addToArrayIf,
  addToObjectIf,
  ethToWeth,
  wethToEth,
  wethToEthByAddress,
  compareSubHashes,
} from './utils';

import { sparkEncode } from './strategySubService';

describe('When testing utils.isDefined()', () => {
  const examples: Array<[boolean, any]> = [
    [true, 'something'],
    [true, NaN],
    [true, 0],
    [false, undefined],
    [false, null],
  ];

  examples.forEach(([expected, actual]) => {
    it(`Expected value: ${expected};`, () => {
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
    it(`Expected value: ${expected};`, () => {
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
    it(`Expected value: ${expected};`, () => {
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
    it(`Expected value: ${expected};`, () => {
      expect(isAddress(actual)).to.equal(expected);
    });
  });
});

describe('When testing utils.addToArrayIf()', () => {

  const exampleOne = [1, ...addToArrayIf(true, 2)];

  it(`Expected value: [${exampleOne.join(', ')}]`, () => {
    expect([1, 2]).to.eql(exampleOne)
  });

  const exampleTwo = [1, ...addToArrayIf(false, 2)];

  it(`Expected value: [${exampleTwo.join(', ')}]`, () => {
    expect([1]).to.eql(exampleTwo)
  });
});

describe('When testing utils.addToObjectIf()', () => {

  const exampleOne = {
    a: 1, ...addToObjectIf(true, { b: 2 })
  };

  it(`Expected value: ${JSON.stringify(exampleOne)}`, () => {
    expect({ a: 1, b: 2 }).to.eql(exampleOne)
  });

  const exampleTwo = {
    a: 1, ...addToObjectIf(false, { b: 2 })
  };

  it(`Expected value: ${JSON.stringify(exampleTwo)}`, () => {
    expect({ a: 1 }).to.eql(exampleTwo)
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
    it(`Expected value: ${expected};`, () => {
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
    it(`Expected value: ${expected};`, () => {
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
    it(`Expected value: ${expected};`, () => {
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
  const encodedParams = web3Utils.keccak256(web3Abi.encodeParameter('(uint64,bool,bytes[],bytes32[])', encodedSubDataOne));

  const examples: Array<[boolean, [string, any[]]]> = [
    [true, [encodedParams, encodedSubDataOne]],
    [false, [encodedParams, encodedSubDataTwo]],
  ];

  examples.forEach(([expected, actual]) => {
    it(`Expected value: ${expected};`, () => {
      expect(compareSubHashes(...actual)).to.equal(expected);
    });
  });
});