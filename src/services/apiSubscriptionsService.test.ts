import { expect } from 'chai';

import type { ApiSubscriptionRecord, ParseData } from '../types';
import { ChainId } from '../types/enums';

import '../configuration';
import { parseDataFromApiSubscription } from './apiSubscriptionsService';
import { parseStrategiesAutomatedPosition } from './strategiesService';

describe('Feature: apiSubscriptionsService.ts', () => {
  describe('When testing apiSubscriptionsService.parseDataFromApiSubscription', () => {
    // same subscription as in strategiesService.test.ts, in the shape the automation API returns it
    const record: ApiSubscriptionRecord = {
      id: 379,
      wallet: '0x9cB7E19861665366011899d74E75d4F2A419aEeD',
      wallet_type: 'safe',
      is_enabled: true,
      is_bundle: true,
      strategy_or_bundle_id: 8,
      strategy_ids: [34, 35],
      sub_data_hash: '0xafa4d200be62f171b57b1ae0f4e8348d1ac3f6d0812ad6da74a2adae8037dde1',
      trigger_data: [
        '0000000000000000000000009cb7e19861665366011899d74e75d4f2a419aeed0000000000000000000000002f39d218133afab8f2b819b1066c7e434ad94e9e00000000000000000000000000000000000000000000000019ac8532c27900000000000000000000000000000000000000000000000000000000000000000001',
      ],
      sub_data: [
        '0x0000000000000000000000000000000000000000000000001bc16d674ec80000',
        '0x0000000000000000000000000000000000000000000000000000000000000001',
        '0x0000000000000000000000000000000000000000000000000000000000000001',
        '0x0000000000000000000000000000000000000000000000000000000000000000',
      ],
      block_number: 18015756,
      additional_triggers: null,
    };

    const fromEvents: ParseData = {
      chainId: ChainId.Ethereum,
      blockNumber: 18015756,
      subscriptionEventData: {
        subId: '379',
        proxy: '0x9cB7E19861665366011899d74E75d4F2A419aEeD',
        subHash: '0xafa4d200be62f171b57b1ae0f4e8348d1ac3f6d0812ad6da74a2adae8037dde1',
        subStruct: {
          strategyOrBundleId: '8',
          isBundle: true,
          triggerData: [
            '0x0000000000000000000000009cb7e19861665366011899d74e75d4f2a419aeed0000000000000000000000002f39d218133afab8f2b819b1066c7e434ad94e9e00000000000000000000000000000000000000000000000019ac8532c27900000000000000000000000000000000000000000000000000000000000000000001',
          ],
          subData: record.sub_data,
        },
      },
      strategiesSubsData: {
        userProxy: '0x9cB7E19861665366011899d74E75d4F2A419aEeD',
        isEnabled: true,
        strategySubHash: '0xafa4d200be62f171b57b1ae0f4e8348d1ac3f6d0812ad6da74a2adae8037dde1',
      },
    };

    it('Given an API record should return the same parse data as Subscribe event and SubStorage would', () => {
      expect(parseDataFromApiSubscription(record, ChainId.Ethereum)).to.eql(fromEvents);
    });

    it('Given an API record the parsed position should match the one parsed from events', () => {
      const fromApi = parseStrategiesAutomatedPosition(parseDataFromApiSubscription(record, ChainId.Ethereum));
      expect(fromApi).to.not.equal(null);
      expect(fromApi).to.eql(parseStrategiesAutomatedPosition(fromEvents));
    });

    it('Given a disabled record should keep it disabled', () => {
      const parseData = parseDataFromApiSubscription({ ...record, is_enabled: false }, ChainId.Ethereum);
      expect(parseData.strategiesSubsData.isEnabled).to.equal(false);
    });
  });
});
