// TODO
//  [] Check @ts-ignores and PlaceholderType
//  [] Improve typing for subData, trigger and strategySub services
//  [] Make possible to use any provider not only web3 (This requires changes throughout the package)

import './configuration';

import LegacyMakerAutomation from './automation/public/legacy/LegacyMakerAutomation';
import LegacyAaveAutomation from './automation/public/legacy/LegacyAaveAutomation';
import LegacyCompoundAutomation from './automation/public/legacy/LegacyCompoundAutomation';

import EthereumStrategies from './automation/public/EthereumStrategies';
import OptimismStrategies from './automation/public/OptimismStrategies';
import ArbitrumStrategies from './automation/public/ArbitrumStrategies';
import BaseStrategies from './automation/public/BaseStrategies';

import * as triggerService from './services/triggerService';
import * as subDataService from './services/subDataService';
import * as strategySubService from './services/strategySubService';
import * as strategiesService from './services/strategiesService';
import * as constants from './constants';

import * as enums from './types/enums';
import type * as types from './types';

import { getRatioStateInfoForAaveCloseStrategy, compareSubHashes, encodeSubId } from './services/utils';

const utils = {
  getRatioStateInfoForAaveCloseStrategy, compareSubHashes, encodeSubId,
};

export {
  LegacyMakerAutomation, LegacyAaveAutomation, LegacyCompoundAutomation,
  EthereumStrategies, OptimismStrategies, ArbitrumStrategies, BaseStrategies,
  triggerService, subDataService, strategySubService, utils,
  enums, constants, strategiesService,
};

export type { types };
