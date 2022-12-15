import type Web3 from 'web3';

declare global {
  module NodeJS {
    interface Process {
      mockedWeb3: Web3
    }
  }
}