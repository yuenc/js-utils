
type Func = (...args: any[]) => any;

export interface FuncCacherImpl {
  storage: Map<string, any>;
  makeCache: (target: object, prop: PropertyKey) => boolean;
  makeClear: (target: object, prop: PropertyKey) => boolean;
  unmake: (target: object, prop: PropertyKey) => boolean;
}

interface FuncCacherOptions {
  storage?: Map<string, any>;
}

const NOOP = () => { /** noop */ };
const cacherFuncList: Func[] = [];

function isPromise<T>(obj: any): obj is Promise<T> {
  return obj && obj.then && obj.catch;
}

function redefineDescriptor(
  target: object,
  prop: PropertyKey,
  callback: (descriptor: PropertyDescriptor) => PropertyDescriptor | undefined
): boolean {
  const descriptor = Reflect.getOwnPropertyDescriptor(target, prop);
  if (descriptor) {
    if (typeof descriptor.value === "function") {
      const newDescriptor = callback(descriptor);
      if (newDescriptor) {
        return Reflect.defineProperty(target, prop, newDescriptor);
      }
    } else {
      console.warn(`${prop.toString()} is not a function`)
    }
  } else {
    console.warn(`${prop.toString()} descriptor is undefined`);
  }
  return false;
}

export function createFuncCacher(options: FuncCacherOptions): FuncCacherImpl {
  const storage = options.storage || new Map();
  return {
    storage: storage,
    makeCache(target, prop) {
      return redefineDescriptor(target, prop, (descriptor) => {
        cacherFuncList.push(descriptor.value);
        const id = cacherFuncList.length - 1;
        descriptor.value = (...args: any[]) => {
          let key = id + "#" + JSON.stringify(args);
          if (storage.has(key)) {
            return storage.get(key);
          }
          const result = Reflect.apply(cacherFuncList[id], target, args);
          if (isPromise(result)) {
            return result.then((result: any) => {
              storage.set(key, result);
              return result;
            });
          } else {
            storage.set(key, result);
            return result;
          }
        }
        return descriptor;
      });
    },
    makeClear(target, prop,) {
      return redefineDescriptor(target, prop, (descriptor) => {
        cacherFuncList.push(descriptor.value);
        const id = cacherFuncList.length - 1;
        descriptor.value = (...args: any[]) => {
          storage.clear();
          return Reflect.apply(cacherFuncList[id], target, args);
        }
        return descriptor;
      });
    },
    unmake(target, prop) {
      return redefineDescriptor(target, prop, (descriptor) => {
        const index = cacherFuncList.findIndex(descriptor.value);
        if (index !== -1) {
          descriptor.value = cacherFuncList[index];
          cacherFuncList[index] = NOOP;
          return descriptor;
        }
      });
    }
  }
}
