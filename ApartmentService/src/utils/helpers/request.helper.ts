import { AsyncLocalStorage } from 'node:async_hooks';

type AsyncLocalStorageType = {
  correlationId: string;
}
export const asyncLocalStorage = new AsyncLocalStorage<AsyncLocalStorageType>()

export const getCorrelationId =()=>{
  const asyncStore= asyncLocalStorage.getStore();
  return asyncStore?.correlationId || "unknown-correlation-id";
}
