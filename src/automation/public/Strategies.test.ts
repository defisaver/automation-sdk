import Web3 from 'web3';
import { expect } from 'chai';

import {ChainId} from '../../types/enums';

import '../../configuration';
import EthereumStrategies from './EthereumStrategies';
import ArbitrumStrategies from './ArbitrumStrategies';
import OptimismStrategies from './OptimismStrategies';
import BaseStrategies from './BaseStrategies';

require('dotenv').config({ path: '.env' });

const Web3_1 = new Web3(process.env.RPC_1!);
const Web3_42161 = new Web3(process.env.RPC_42161!);
const Web3_10 = new Web3(process.env.RPC_10!);
const Web3_8453 = new Web3(process.env.RPC_8453!);

describe('Feature: StrategiesAutomation.ts', () => {
  describe('Fetching subscriptions', () => {
    it('can fetch subscriptions on Mainnet', async function () {
      this.timeout(120000);
      const ethStrategies = new EthereumStrategies({provider: Web3_1});
      const subs = await ethStrategies.getSubscriptions({mergeSubs: true})
      console.log(subs.length);
    });

    it('can fetch subscriptions on Arbitrum', async function () {
      this.timeout(120000);
      const arbiStrategies = new ArbitrumStrategies({provider: Web3_42161});
      const subs = await arbiStrategies.getSubscriptions({mergeSubs: true})
      console.log(subs.length);
    });

    it('can fetch subscriptions on Optimism', async function () {
      this.timeout(120000);
      const optimismStrategies = new OptimismStrategies({provider: Web3_10});
      const subs = await optimismStrategies.getSubscriptions({mergeSubs: true})
      console.log(subs.length);
    });

    it('can fetch subscriptions on Base', async function () {
      this.timeout(120000);
      const baseStrategies = new BaseStrategies({provider: Web3_8453});
      const subs = await baseStrategies.getSubscriptions({mergeSubs: true})
      console.log(subs.length);
    });
  });
});
