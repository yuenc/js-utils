
type AsyncFunc = (...args: any[]) => Promise<any>;

export interface AsyncFuncCacherImpl {
  storage: Map<string, any>;
  makeCache: (target: object, prop: PropertyKey) => void;
  makeClear: (target: object, prop: PropertyKey) => void;
  unmake: (target: object, prop: PropertyKey) => void;
}

interface AsyncFuncCacherOptions {
  storage?: Map<string, any>;
}

const asyncNoop = async () => { /** noop */ };
const globalAsyncFuncList: AsyncFunc[] = [];

export function createAsyncFuncCacher(options: AsyncFuncCacherOptions): AsyncFuncCacherImpl {
  const storage = options.storage || new Map();
  return {
    storage: storage,
    makeCache(target, prop) {
      const descriptor = Reflect.getOwnPropertyDescriptor(target, prop);
      if (!descriptor) {
        console.warn(`${prop.toString()} descriptor is undefined`);
        return;
      }
      globalAsyncFuncList.push(descriptor.value);
      const id = globalAsyncFuncList.length - 1;
      descriptor.value = (...args: any[]) => {
        let key = id + "#" + JSON.stringify(args);
        if (storage.has(key)) {
          return storage.get(key);
        }
        const cacheResult = (result: any) => {
          storage.set(key, result);
          return result;
        }
        return (Reflect.apply(globalAsyncFuncList[id], target, args) as Promise<any>).then(cacheResult);
      }
      return Reflect.defineProperty(target, prop, descriptor);
    },
    makeClear(target, prop,) {
      const descriptor = Reflect.getOwnPropertyDescriptor(target, prop);
      if (!descriptor) {
        console.warn(`${prop.toString()} descriptor is undefined`);
        return;
      }
      globalAsyncFuncList.push(descriptor.value);
      const id = globalAsyncFuncList.length - 1;
      descriptor.value = (...args: any[]) => {
        storage.clear();
        return Reflect.apply(globalAsyncFuncList[id], target, args);
      }
      return Reflect.defineProperty(target, prop, descriptor);
    },
    unmake(target, prop) {
      const descriptor = Reflect.getOwnPropertyDescriptor(target, prop);
      if (!descriptor) {
        console.warn(`${prop.toString()} descriptor is undefined`);
        return;
      }
      const index = globalAsyncFuncList.findIndex(descriptor.value);
      if (index !== -1) {
        descriptor.value = globalAsyncFuncList[index];
        Reflect.defineProperty(target, prop, descriptor);
        globalAsyncFuncList[index] = asyncNoop;
      }
    }
  }
}
