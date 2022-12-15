import Web3 from 'web3';
import Dec from 'decimal.js';

process.mockedWeb3 = new Web3('');

Dec.set({
  rounding: Dec.ROUND_DOWN,
  toExpPos: 9e15,
  toExpNeg: -9e15,
  precision: 100,
});
