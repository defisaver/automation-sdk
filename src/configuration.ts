import Dec from 'decimal.js';

Dec.set({
  rounding: Dec.ROUND_DOWN,
  toExpPos: 9e15,
  toExpNeg: -9e15,
  precision: 100,
});
