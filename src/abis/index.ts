import type { Contract } from '../types';

import MakerSubscriptions from './legacy_MakerSubscriptions.json';
import AaveV2Subscriptions from './legacy_AaveV2Subscriptions.json';
import CompoundV2Subscriptions from './legacy_CompoundV2Subscriptions.json';

import Erc20 from './Erc20.json';
import UniMulticall from './UniMulticall.json';
import SubStorage from './SubStorage.json';
import AuthCheck from './legacy_AuthCheck.json';

function castToContractJsonType(json: any) {
  return json as Contract.Json;
}

const MakerSubscriptionsJson = castToContractJsonType(MakerSubscriptions);
const AaveV2SubscriptionsJson = castToContractJsonType(AaveV2Subscriptions);
const CompoundV2SubscriptionsJson = castToContractJsonType(CompoundV2Subscriptions);

const Erc20Json = castToContractJsonType(Erc20);
const UniMulticallJson = castToContractJsonType(UniMulticall);
const SubStorageJson = castToContractJsonType(SubStorage);
const AuthCheckJson = castToContractJsonType(AuthCheck);

export {
  MakerSubscriptionsJson, AaveV2SubscriptionsJson, CompoundV2SubscriptionsJson,
  Erc20Json, UniMulticallJson, SubStorageJson, AuthCheckJson,
};
