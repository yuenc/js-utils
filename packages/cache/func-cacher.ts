
export interface FuncCacherImpl {
  storage: Map<string, Promise<any>>;
  makeCache: <T extends any[], R>(func: (...args: T) => Promise<R>) => (...args: T) => Promise<R>;
  makeClear: <T extends any[], R>(func: (...args: T) => Promise<R>) => (...args: T) => Promise<R>;
}

interface FuncCacherOptions {
  storage?: Map<string, Promise<any>>;
}

let incrementId = 0;

export function createFuncCacher(options: FuncCacherOptions): FuncCacherImpl {
  const storage: Map<string, Promise<any>> = options.storage || new Map();
  return {
    storage: storage,
    makeCache<T extends any[], R>(func: (...args: T) => Promise<R>) {
      incrementId++;
      const id = incrementId;
      return async (...args: T) => {
        const key = id + "#" + JSON.stringify(args);
        let result: Promise<R> | undefined = storage.get(key);
        if (!result) {
          result = func(...args);
          storage.set(key, result);
        }
        return result;
      };
    },
    makeClear<T extends any[], R>(func: (...args: T) => Promise<R>) {
      return (...args: T) => {
        storage.clear();
        return func(...args);
      };
    },
  }
}
