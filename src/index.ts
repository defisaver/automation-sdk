// TODO
//  [] Check other TODOs, add missing types, figure out how to use generated types from contracts
//  [] Check @ts-ignores
//  [] Split types to multiple files?
//  [] Type for numbers, string, bns etc? Use uint type from sdk?
//  [] Make possible to use any provider not only web3 (This requires changes throughout the package)

import './configuration';

import LegacyMakerAutomation from './automation/public/legacy/LegacyMakerAutomation';
import LegacyAaveAutomation from './automation/public/legacy/LegacyAaveAutomation';
import LegacyCompoundAutomation from './automation/public/legacy/LegacyCompoundAutomation';

import EthereumStrategies from './automation/public/EthereumStrategies';
import OptimismStrategies from './automation/public/OptimismStrategies';
import ArbitrumStrategies from './automation/public/ArbitrumStrategies';

export {
  LegacyMakerAutomation, LegacyAaveAutomation, LegacyCompoundAutomation,
  EthereumStrategies, OptimismStrategies, ArbitrumStrategies,
};
