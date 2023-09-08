import { expect } from 'chai';
import { compareAddresses, isAddress, isDefined, isUndefined } from './utils';

describe('Utils: isDefined()', () => {
  const examples = [
    ['true', isDefined('something')],
    ['true', isDefined(NaN)],
    ['true', isDefined(0)],
    // @ts-ignore
    ['false', isDefined()],
    ['false', isDefined(undefined)],
    ['false', isDefined(null)],
  ];

  examples.forEach(([expected, actual]) => {
    it(`Expected value ${expected};`, () => {
      // @ts-ignore
      expect(actual).be[expected];
    });
  });
});

describe('Utils: isUndefined()', () => {
  const examples = [
    ['false', isUndefined('something')],
    ['false', isUndefined(NaN)],
    ['false', isUndefined(0)],
    // @ts-ignore
    ['true', isUndefined()],
    ['true', isUndefined(undefined)],
    ['true', isUndefined(null)],
  ];

  examples.forEach(([expected, actual]) => {
    it(`Expected value ${expected};`, () => {
      // @ts-ignore
      expect(actual).be[expected];
    });
  });
});

describe('Utils: compareAddresses()', () => {
  const examples = [
    ['true', compareAddresses('nesto', 'nesto')],
    ['true', compareAddresses('', '')],
    ['false', compareAddresses('something', 'nesto')],
    ['false', compareAddresses('', 'nesto')],
  ];

  examples.forEach(([expected, actual]) => {
    it(`Expected value ${expected};`, () => {
      // @ts-ignore
      expect(actual).be[expected];
    });
  });
});

describe('Utils: isAddress()', () => {
  const examples = [
    ['true', isAddress('0x996bc83fa1b947cca00e5dcf776c438096549062')],
    ['true', isAddress('0x0000000000000000000000000000000000000000')],
    ['false', isAddress('0x996bc83fa147cca00e5dcf776c438096549062')],
    ['false', isAddress('0x996bc83fa147cca00e5dcf776c438096549062xx')],
    ['false', isAddress('')],
    ['false', isAddress('majmune.eth')],
  ];

  examples.forEach(([expected, actual]) => {
    it(`Expected value ${expected};`, () => {
      // @ts-ignore
      expect(actual).be[expected];
    });
  });
});