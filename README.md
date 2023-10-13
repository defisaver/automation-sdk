# SDK for fetching DeFi Saver strategies data from the blockchain.

Fetch strategies data from the blockchain, and parse it into a readable format.
Use one of the following classes to fetch data for strategies: EthereumStrategies, OptimismStrategies, or ArbitrumStrategies.
Use one of the following classes to fetch data for legacy automation: LegacyMakerAutomation, LegacyAaveAutomation, or LegacyCompoundAutomation.
Various services and constants also available for use.

## Usage

```js
const ethereumStrategies = new EthereumStrategies({
  provider: WEB3_PROVIDER_HERE,
});

const subscriptions = await ethereumStrategies.getSubscriptionsFor(
  // Pass one or multiple owner addresses, or use getSubscriptions method to fetch all subscriptions
  ['0x000000000000000000000000000000000000dEaD'],
  { 
    fromBlock: 0,
    toBlock: 'latest',
  }
);

// Do what you would like with subscriptions
```

## Development - How to add new strategies?

- Add strategy/bundle ID to `./src/types/enums.ts`, and create `Identifiers` if needed
- Add strategy/bundle info to `./src/constants/index.ts`
- Add encoding/decoding to the following files:
  - `./src/services/strategySubService.ts`
  - `./src/services/subDataService.ts`
  - `./src/services/triggerService.ts`
- Write parsing for the strategy in `./src/services/strategeiesService.ts` and add assign it to `const parsingMethodsMapping`
- Write tests for each method
- Run tests with `yarn test`
- Congrats! 🥳