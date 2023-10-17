import { expect } from 'chai';

import { ProtocolIdentifiers } from '../../types/enums';

import Protocol from './Protocol';

describe('Feature: Protocol.ts', () => {
  describe('When testing class Protocol', () => {
    const exampleProtocol = new Protocol({ id: ProtocolIdentifiers.StrategiesAutomation.AaveV3 });
    const examples: Array<[string, string]> = [
      [exampleProtocol.id, 'Aave__V3'],
      [exampleProtocol.name, 'Aave'],
      [exampleProtocol.slug, 'aave'],
      [exampleProtocol.version, 'V3'],
      [exampleProtocol.fullName, 'Aave V3'],
    ];

    examples.forEach(([expected, actual]) => {
      it(`Given ${actual} should return expected value: ${expected}`, () => {
        expect(actual).to.equal(expected);
      });
    });
  });
});