// TODO
//  [] Check @ts-ignores and PlaceholderType
//  [] Make possible to use any provider not only web3 (This requires changes throughout the package)
//  [] Write unit tests

import './configuration';

import LegacyMakerAutomation from './automation/public/legacy/LegacyMakerAutomation';
import LegacyAaveAutomation from './automation/public/legacy/LegacyAaveAutomation';
import LegacyCompoundAutomation from './automation/public/legacy/LegacyCompoundAutomation';

import EthereumStrategies from './automation/public/EthereumStrategies';
import OptimismStrategies from './automation/public/OptimismStrategies';
import ArbitrumStrategies from './automation/public/ArbitrumStrategies';

import * as triggerService from './services/triggerService';
import * as subDataService from './services/subDataService';

import type * as types from './types';
import type * as enums from './types/enums';

export {
  LegacyMakerAutomation, LegacyAaveAutomation, LegacyCompoundAutomation,
  EthereumStrategies, OptimismStrategies, ArbitrumStrategies,
  triggerService, subDataService,
};

export type { types, enums };
