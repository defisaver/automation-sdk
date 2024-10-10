import { expect } from 'chai';

import { ProtocolIdentifiers } from '../../types/enums';

import LegacyProtocol from './LegacyProtocol';

describe('Feature: LegacyProtocol.ts', () => {
  
      [exampleProtocol.slug, 'makerdao'],
      [exampleProtocol.version, ''],
      [exampleProtocol.fullName, 'MakerDAO'],
    ];

    examples.forEach(([expected, actual]) => {
      it(`Given ${actual} should return expected value: ${expected}`, () => {
        expect(actual).to.equal(expected);
      });
    });
  });
});