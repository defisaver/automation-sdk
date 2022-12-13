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

// zasto nije LegacyAutomation pod jednim objektom, nego 3, kad su ostale po mrezama razvrstane?
// najvise smisla bi imalo LegacyEthereumAutomation, ali i samo LegacyAutomation je okej. consistentcy
export {
  LegacyMakerAutomation, LegacyAaveAutomation, LegacyCompoundAutomation,
  EthereumStrategies, OptimismStrategies, ArbitrumStrategies,
};


// Ovde pisem neke generalne stvari
// Zasto su abi-i odvojeni svaki u svoj fajl kad generalno ne radimo tako?
// Ne svidja mi se sto se kontrakti ne definisu iz centralizovanog mesta nego po fajlovima, zasto si izabrao ovaj nacin
// Web3 nije globalni? neki razlog za ovo? u krajnjem slucaju moze da se na globalnom nivou resolvuje u razne web3-eve ili druge biblioteke ako si tako razmisljao
// mozda ima i nekih biblioteka koje su interfejs za web3+ethers
