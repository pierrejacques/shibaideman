/**
 * 柯里化的 pick 功能
 */
export const pick = <K extends readonly string[]>(keys: K) => <S extends Record<K[number], any>>(source: S) => {
  const result: Partial<S> = {};
  keys.forEach(key => {
    result[key] = source[key];
  });
  return result as Pick<S, K[number]>;
};

/**
 * 旁通函数
 */
export const bypass = () => { };

/**
 * 函数单入口化
 */
export const unarify = <T extends (first: any, ...params: any[]) => any>(f: T) => (
  first: Parameters<T>[0]
): ReturnType<T> => f(first);

/**
 * 函数无入口化
 */
export const zerofy = <T extends (...params: any[]) => any>(f: T) => (): ReturnType<T> => f();

/**
 * props
 */
export const props = (source: any, keys: (string | number)[]) => {
  return keys.reduce((current, key) => current && current[key], source);
};

export const uniqueId = () => Math.random().toString(16).slice(2);

/**
 * util function to get the latest date str
 */
export function getDateString() {
  return new Date().toISOString().slice(0, 10);
}


/**
 * util function return a promise to wait for ms seconds
 */
export function timeout(ms: number) {
  return new Promise<void>(resolve => {
    setTimeout(resolve, ms);
  })
}

export function compareKeys<T>(keys: (keyof T)[]) {
  return (a: T, b: T) => {
    return keys.every(key => Object.is(a[key], b[key]));
  }
};

export function last<T>(arr: T[]): T {
  return arr[arr.length - 1];
}

export function assign(root: Record<string, any>, path: string, value: any) {
  if (value == null) return;

  const dirs = path.split('.');
  const field = dirs.pop();

  let target = root;

  for (const dir of dirs) {
    if (!target[dir]) {
      target[dir] = {};
    }
    target = target[dir]
  }

  target[field] = value;
}

export function get(root: any, path: string) {
  if (!path) return root;

  const dirs = path.split('.');

  let current = root;
  for (let i = 0; i < dirs.length; i++) {
    const dir = dirs[i];

    if (dir === '*') {

      if (Array.isArray(current)) {
        return current.map(
          item => {
            const subPath = dirs.slice(i + 1).join('.');
            return get(item, subPath)
          }
        )
      }
    } else {
      current = current?.[dir]
    }
  }

  return current;
}

export function isString(input: any): input is String {
  return typeof input === 'string';
};

export interface Resolvable<T> {
  resolve(value?: T): void;
  reject(error: Error): void;
  readonly resolved: boolean;
  readonly rejected: boolean;
  readonly resolveValue: T;
  readonly error: Error;
  readonly promise: Promise<T>;
}

export const createResolvable = <T = void>(): Resolvable<T> => {
  let resolve: Resolvable<T>["resolve"];
  let reject: Resolvable<T>['reject'];
  let resolved = false;
  let rejected = false;
  let resolveValue: T;
  let error: Error;
  const promise = new Promise<T>((res, rej) => {
    resolve = res;
    reject = rej;
  });
  return {
    resolve: (value) => {
      if (!resolved && !rejected) {
        resolved = true;
        resolveValue = value;
        resolve(value);
      }
    },
    reject: (err) => {
      if (!resolved && !rejected) {
        rejected = true;
        error = err;
        reject(err);
      }
    },
    get resolved() {
      return resolved;
    },
    get rejected() {
      return rejected;
    },
    get resolveValue() {
      return resolveValue;
    },
    get error() {
      return error;
    },
    get promise() {
      return promise;
    },
  };
};

export const catchRuntimeError = () => {
  // could have error
  const runtimeError = chrome.runtime.lastError;
};
