import { expect } from 'chai';

import { ProtocolIdentifiers } from '../../types/enums';

import LegacyProtocol from './LegacyProtocol';

describe('Feature: LegacyProtocol.ts', () => {
  describe('When testing class LegacyProtocol', () => {
    const exampleProtocol = new LegacyProtocol({ id: ProtocolIdentifiers.LegacyAutomation.MakerDAO });
    const examples: Array<[string, string]> = [
      [exampleProtocol.id, 'MakerDAO'],
      [exampleProtocol.name, 'MakerDAO'],
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