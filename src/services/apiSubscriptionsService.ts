import type { ApiSubscriptionRecord, ParseData } from '../types';
import type { ChainId } from '../types/enums';

function addHexPrefix(value: string): string {
  return value.startsWith('0x') ? value : `0x${value}`;
}

/**
 * @description Maps a subscription record returned by the automation API to the data
 * the parser expects from Subscribe events and SubStorage (trigger data is stored without 0x prefix)
 */
export function parseDataFromApiSubscription(record: ApiSubscriptionRecord, chainId: ChainId): ParseData {
  return {
    chainId,
    blockNumber: record.block_number,
    subscriptionEventData: {
      subId: record.id.toString(),
      proxy: record.wallet,
      subHash: record.sub_data_hash,
      subStruct: {
        strategyOrBundleId: record.strategy_or_bundle_id.toString(),
        isBundle: record.is_bundle,
        triggerData: record.trigger_data.map(addHexPrefix),
        subData: record.sub_data.map(addHexPrefix),
      },
    },
    strategiesSubsData: {
      userProxy: record.wallet,
      isEnabled: record.is_enabled,
      strategySubHash: record.sub_data_hash,
    },
  };
}
