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

import {
  getRatioStateInfoForAaveCloseStrategy,
  compareSubHashes,
  encodeSubId,
  getCloseStrategyType,
  getCompoundV3LeverageManagementBundleId,
} from './services/utils';

const utils = {
  compareSubHashes,
  encodeSubId,
  getCloseStrategyType,
  getCompoundV3LeverageManagementBundleId,
  getRatioStateInfoForAaveCloseStrategy,
};

export {
  ArbitrumStrategies,
  BaseStrategies,
  EthereumStrategies,
  LegacyAaveAutomation,
  LegacyCompoundAutomation,
  LegacyMakerAutomation,
  OptimismStrategies,
  constants,
  enums,
  strategiesService,
  strategySubService,
  subDataService,
  triggerService,
  utils,
};

export type { types };
