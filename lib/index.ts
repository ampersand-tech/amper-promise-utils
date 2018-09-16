/**
* Copyright 2017-present Ampersand Technologies, Inc.
*/

type StashOf<T> = {
    [k: string]: T;
};
type Stash = StashOf<any>;

type ErrorType = undefined | null | string | Error;
type ErrDataCB<T> = (err?: ErrorType, data?: T) => void;

function errorToString(err: ErrorType) {
  if (typeof err === 'string') {
    return err;
  }
  if (!err) {
    return '';
  }
  if (err.message) {
    return err.message;
  }
  const errStr = '' + err;
  if (errStr && errStr !== '[object Object]') {
    return errStr;
  }
  return '<unknown>';
}

let domain;

try {
  domain = require('domain');
} catch (_e) {
  domain = undefined;
}


/*
* wrap is used for turning a traditional node cb(err, data) function call into a Promise.
* It wraps the call in a domain (in node.js) to handle async exceptions.
*
* Note that the first parameter to wrapMember is the "this" object for the call; if you don't need one, use wrap instead.
*/

function wrapInternal(obj, cmd, args, handler) {
  return new Promise(function(resolve, reject) {
    const cb = (err, data) => {
      handler(resolve, reject, err, data);
    };

    args.push(cb);

    const applyCmd = () => {
      const ret = cmd.apply(obj, args);
      if (ret instanceof Promise) {
        // whoops, someone wrapped an async function; almost certainly that was an accident
        unwrap(ret, cb);
      }
    };

    // run non-promise code in a domain to catch async exceptions
    if (domain) {
      const d = domain.create();
      d.on('error', reject);
      d.run(applyCmd);
    } else {
      applyCmd();
    }
  });
}

function throwErrHandler(resolve, reject, err, data) {
  if (err) {
    reject(err);
  } else {
    resolve(data);
  }
}

export function wrap<TR>(cmd: (cb: ErrDataCB<TR>) => void): Promise<TR>;
export function wrap<T0, TR>(cmd: (arg0: T0, cb: ErrDataCB<TR>) => void, arg0: T0): Promise<TR>;
export function wrap<T0, T1, TR>(cmd: (arg0: T0, arg1: T1, cb: ErrDataCB<TR>) => void, arg0: T0, arg1: T1): Promise<TR>;
export function wrap<T0, T1, T2, TR>(
  cmd: (arg0: T0, arg1: T1, arg2: T2, cb: ErrDataCB<TR>) => void,
  arg0: T0, arg1: T1, arg2: T2,
): Promise<TR>;
export function wrap<T0, T1, T2, T3, TR>(
  cmd: (arg0: T0, arg1: T1, arg2: T2, arg3: T3, cb: ErrDataCB<TR>) => void,
  arg0: T0, arg1: T1, arg2: T2, arg3: T3,
): Promise<TR>;
export function wrap<T0, T1, T2, T3, T4, TR>(
  cmd: (arg0: T0, arg1: T1, arg2: T2, arg3: T3, arg4: T4, cb: ErrDataCB<TR>) => void,
  arg0: T0, arg1: T1, arg2: T2, arg3: T3, arg4: T4,
): Promise<TR>;
export function wrap<T0, T1, T2, T3, T4, T5, TR>(
  cmd: (arg0: T0, arg1: T1, arg2: T2, arg3: T3, arg4: T4, arg5: T5, cb: ErrDataCB<TR>) => void,
  arg0: T0, arg1: T1, arg2: T2, arg3: T3, arg4: T4, arg5: T5,
): Promise<TR>;
export function wrap<T0, T1, T2, T3, T4, T5, T6, TR>(
  cmd: (arg0: T0, arg1: T1, arg2: T2, arg3: T3, arg4: T4, arg5: T5, arg6: T6, cb: ErrDataCB<TR>) => void,
  arg0: T0, arg1: T1, arg2: T2, arg3: T3, arg4: T4, arg5: T5, arg6: T6,
): Promise<TR>;
export function wrap<T0, T1, T2, T3, T4, T5, T6, T7, TR>(
  cmd: (arg0: T0, arg1: T1, arg2: T2, arg3: T3, arg4: T4, arg5: T5, arg6: T6, arg7: T7, cb: ErrDataCB<TR>) => void,
  arg0: T0, arg1: T1, arg2: T2, arg3: T3, arg4: T4, arg5: T5, arg6: T6, arg7: T7,
): Promise<TR>;
export function wrap(...args) {
  const cmd = args.shift();
  return wrapInternal({}, cmd, args, throwErrHandler);
}

export function wrapMember<TR>(obj: object, cmd: (cb: ErrDataCB<TR>) => void): Promise<TR>;
export function wrapMember<T0, TR>(obj: object, cmd: (arg0: T0, cb: ErrDataCB<TR>) => void, arg0: T0): Promise<TR>;
export function wrapMember<T0, T1, TR>(obj: object, cmd: (arg0: T0, arg1: T1, cb: ErrDataCB<TR>) => void, arg0: T0, arg1: T1): Promise<TR>;
export function wrapMember<T0, T1, T2, TR>(
  obj: object,
  cmd: (arg0: T0, arg1: T1, arg2: T2, cb: ErrDataCB<TR>) => void,
  arg0: T0, arg1: T1, arg2: T2,
): Promise<TR>;
export function wrapMember<T0, T1, T2, T3, TR>(
  obj: object,
  cmd: (arg0: T0, arg1: T1, arg2: T2, arg3: T3, cb: ErrDataCB<TR>) => void,
  arg0: T0, arg1: T1, arg2: T2, arg3: T3,
): Promise<TR>;
export function wrapMember<T0, T1, T2, T3, T4, TR>(
  obj: object,
  cmd: (arg0: T0, arg1: T1, arg2: T2, arg3: T3, arg4: T4, cb: ErrDataCB<TR>) => void,
  arg0: T0, arg1: T1, arg2: T2, arg3: T3, arg4: T4,
): Promise<TR>;
export function wrapMember<T0, T1, T2, T3, T4, T5, TR>(
  obj: object,
  cmd: (arg0: T0, arg1: T1, arg2: T2, arg3: T3, arg4: T4, arg5: T5, cb: ErrDataCB<TR>) => void,
  arg0: T0, arg1: T1, arg2: T2, arg3: T3, arg4: T4, arg5: T5,
): Promise<TR>;
export function wrapMember(obj, cmd, ...args) {
  return wrapInternal(obj, cmd, args, throwErrHandler);
}

/*
* unwrap is used to interface Promise-based code back out to a caller that wants a traditional cb(err, data) callback.
*/
export function unwrap<T>(p: Promise<T>, cb: ErrDataCB<T>) {
  let d;
  if (domain) {
    d = (domain as any).active;
  }

  function onResult(err: any, val?: T) {
    // use setTimeout to escape the Promise exception catching and allow errors in cb() to be caught by the domain error handler
    setTimeout(function() {
      d && d.enter();
      cb(err, val);
      d && d.exit();
    }, 0);
  }

  p.then(onResult.bind(undefined, null), onResult);
}

/*
* unwrapBind is used to bind a Promise-returning function into a function that takes a cb(err, data) callback.
*/

export function unwrapBind<T>(asyncFunc: () => Promise<T>): ((cb: ErrDataCB<T>) => void);
export function unwrapBind<T, T0>(asyncFunc: (arg0: T0) => Promise<T>): ((arg0: T0, cb: ErrDataCB<T>) => void);
export function unwrapBind<T, T0, T1>(asyncFunc: (arg0: T0, arg1: T1) => Promise<T>): ((arg0: T0, arg1: T1, cb: ErrDataCB<T>) => void);
export function unwrapBind<T, T0, T1, T2>(asyncFunc: (arg0: T0, arg1: T1, arg2: T2) => Promise<T>): (
  (arg0: T0, arg1: T1, arg2: T2, cb: ErrDataCB<T>) => void
);
export function unwrapBind<T, T0, T1, T2, T3>(asyncFunc: (arg0: T0, arg1: T1, arg2: T2, arg3: T3) => Promise<T>): (
  (arg0: T0, arg1: T1, arg2: T2, arg3: T3, cb: ErrDataCB<T>) => void
);
export function unwrapBind(asyncFunc) {
  return function(...args) {
    const cb = args.pop();
    const p = asyncFunc.apply(null, args);
    unwrap(p, cb);
  };
}

/*
* waits for all promises passed in to complete or error (unlike Promise.all, which will reject immediately upon first error)
*/
export async function parallel<T>(promises: Promise<T>[]) {
  const res = await parallelWithErrors(promises);
  if (res.firstErr) {
    throw res.firstErr;
  }
  return res.data as T[];
}

/*
* waits for all promises passed in to complete or error (unlike Promise.all, which will reject immediately upon first error)
* returns errors instead of throwing them, so caller can cleanup anything that succeeded
*/
export async function parallelWithErrors<T>(promises: Promise<T>[]) {
  const count = promises.length;
  const data: (T|undefined)[] = new Array(count);
  const errs: (Error|undefined)[] = new Array(count);
  let firstErr;

  function onResult(resolve, i: number, err: Error|undefined, val: T) {
    if (err) {
      errs[i] = err;
      if (!firstErr) {
        firstErr = err;
      }
    }
    data[i] = val;
    resolve();
  }

  const ps: Promise<any>[] = [];
  for (let i = 0; i < count; ++i) {
    const p = new Promise(function(resolve) {
      promises[i].then(
        onResult.bind(undefined, resolve, i, undefined),
        onResult.bind(undefined, resolve, i),
      );
    });
    ps.push(p);
  }

  await Promise.all(ps);

  return {
    data: data,
    firstErr: firstErr,
    errs: firstErr ? errs : undefined,
  };
}

export class ParallelQueue {
  private _queue = [] as {key?: string, cmd: any, args: any[]}[];
  private _results: Stash = {};

  // Overloads for type checking:
  add<TR>(cmd: () => Promise<TR>);
  add<TR, T0>(cmd: (arg0: T0) => Promise<TR>, arg0: T0);
  add<TR, T0, T1>(cmd: (arg0: T0, arg1: T1) => Promise<TR>, arg0: T0, arg1: T1);
  add<TR, T0, T1, T2>(cmd: (arg0: T0, arg1: T1, arg2: T2) => Promise<TR>, arg0: T0, arg1: T1, arg2: T2);
  add<TR, T0, T1, T2, T3>(cmd: (arg0: T0, arg1: T1, arg2: T2, arg3: T3) => Promise<TR>, arg0: T0, arg1: T1, arg2: T2, arg3: T3);
  add<TR, T0, T1, T2, T3, T4>(
    cmd: (arg0: T0, arg1: T1, arg2: T2, arg3: T3, arg4: T4) => Promise<TR>,
    arg0: T0, arg1: T1, arg2: T2, arg3: T3, arg4: T4,
  );
  add<TR, T0, T1, T2, T3, T4, T5>(
    cmd: (arg0: T0, arg1: T1, arg2: T2, arg3: T3, arg4: T4, arg5: T5) => Promise<TR>,
    arg0: T0, arg1: T1, arg2: T2, arg3: T3, arg4: T4, arg5: T5,
  );
  add<TR, T0, T1, T2, T3, T4, T5, T6>(
    cmd: (arg0: T0, arg1: T1, arg2: T2, arg3: T3, arg4: T4, arg5: T5, arg6: T6) => Promise<TR>,
    arg0: T0, arg1: T1, arg2: T2, arg3: T3, arg4: T4, arg5: T5, arg6: T6,
  );
  add<TR, T0, T1, T2, T3, T4, T5, T6, T7>(
    cmd: (arg0: T0, arg1: T1, arg2: T2, arg3: T3, arg4: T4, arg5: T5, arg6: T6, arg7: T7) => Promise<TR>,
    arg0: T0, arg1: T1, arg2: T2, arg3: T3, arg4: T4, arg5: T5, arg6: T6, arg7: T7,
  );
  add<TR, T0, T1, T2, T3, T4, T5, T6, T7, T8>(
    cmd: (arg0: T0, arg1: T1, arg2: T2, arg3: T3, arg4: T4, arg5: T5, arg6: T6, arg7: T7, arg8: T8) => Promise<TR>,
    arg0: T0, arg1: T1, arg2: T2, arg3: T3, arg4: T4, arg5: T5, arg6: T6, arg7: T7, arg8: T8,
  );

  add(cmd, ...args) {
    this._queue.push({cmd, args});
  }

  // Overloads for type checking:
  collate<TR>(key: string, cmd: () => Promise<TR>);
  collate<TR, T0>(key: string, cmd: (arg0: T0) => Promise<TR>, arg0: T0);
  collate<TR, T0, T1>(key: string, cmd: (arg0: T0, arg1: T1) => Promise<TR>, arg0: T0, arg1: T1);
  collate<TR, T0, T1, T2>(key: string, cmd: (arg0: T0, arg1: T1, arg2: T2) => Promise<TR>, arg0: T0, arg1: T1, arg2: T2);
  collate<TR, T0, T1, T2, T3>(key: string, cmd: (arg0: T0, arg1: T1, arg2: T2, arg3: T3) => Promise<TR>, arg0: T0, arg1: T1, arg2: T2, arg3: T3);
  collate<TR, T0, T1, T2, T3, T4>(
    key: string,
    cmd: (arg0: T0, arg1: T1, arg2: T2, arg3: T3, arg4: T4) => Promise<TR>,
    arg0: T0, arg1: T1, arg2: T2, arg3: T3, arg4: T4,
  );
  collate<TR, T0, T1, T2, T3, T4, T5>(
    key: string,
    cmd: (arg0: T0, arg1: T1, arg2: T2, arg3: T3, arg4: T4, arg5: T5) => Promise<TR>,
    arg0: T0, arg1: T1, arg2: T2, arg3: T3, arg4: T4, arg5: T5,
  );
  collate<TR, T0, T1, T2, T3, T4, T5, T6>(
    key: string,
    cmd: (arg0: T0, arg1: T1, arg2: T2, arg3: T3, arg4: T4, arg5: T5, arg6: T6) => Promise<TR>,
    arg0: T0, arg1: T1, arg2: T2, arg3: T3, arg4: T4, arg5: T5, arg6: T6,
  );
  collate<TR, T0, T1, T2, T3, T4, T5, T6, T7>(
    key: string,
    cmd: (arg0: T0, arg1: T1, arg2: T2, arg3: T3, arg4: T4, arg5: T5, arg6: T6, arg7: T7) => Promise<TR>,
    arg0: T0, arg1: T1, arg2: T2, arg3: T3, arg4: T4, arg5: T5, arg6: T6, arg7: T7,
  );
  collate<TR, T0, T1, T2, T3, T4, T5, T6, T7, T8>(
    key: string,
    cmd: (arg0: T0, arg1: T1, arg2: T2, arg3: T3, arg4: T4, arg5: T5, arg6: T6, arg7: T7, arg8: T8) => Promise<TR>,
    arg0: T0, arg1: T1, arg2: T2, arg3: T3, arg4: T4, arg5: T5, arg6: T6, arg7: T7, arg8: T8,
  );

  collate(key, cmd, ...args) {
    this._queue.push({key, cmd, args});
  }

  private async runThread() {
    let entry;
    while (entry = this._queue.shift()) {
      const res = await entry.cmd(...entry.args);
      if (entry.key) {
        this._results[entry.key] = res;
      }
    }
  }

  async run(parallelCount = 20) {
    const ps: Promise<any>[] = [];
    for (let i = 0; i < parallelCount; ++i) {
      ps.push(this.runThread());
    }
    await parallel(ps);
    return this._results;
  }
}

/*
* forever returns a Promise that never resolves; used in cases where you want to enter an infinite event-handling loop.
*/
export function forever() {
  return new Promise(function() {
    // never resolves
  });
}

/*
* sleep is a Promise-wrapped version of setTimeout.
*/
export function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/*
* ActionTimeout runs the action but early-out rejects if it takes longer than ms time
*/
export class ActionTimeout {
  private _noTimeoutFail = false;

  constructor(readonly ms: number, readonly timeoutMsg = 'timed out', readonly onTimeout?: () => Promise<void>) {
  }

  private async timeout() {
    await sleep(this.ms);

    if (!this._noTimeoutFail) {
      this._noTimeoutFail = true;
      if (this.onTimeout) {
        await this.onTimeout();
      }
      throw this.timeoutMsg;
    }
  }

  run<T>(action: () => Promise<T>): Promise<T> {
    const succeed = async() => {
      const result = await action();
      this._noTimeoutFail = true;
      return result;
    };
    return Promise.race([this.timeout() as any, succeed()]);
  }

  clearTimeout() {
    this._noTimeoutFail = true;
  }
}

/*
* ignoreError is used to wrap a promise with another promise that will resolve instead of reject if
* the original promise rejects with an error that matches any of the given error strings
*
* const val = await ignoreError(someAsyncFunc(arg0, arg1), 'not found', 'offline');
*/
export function ignoreError<T>(p: Promise<T>, ...args: string[]): Promise<T|undefined> {
  return new Promise(function(resolve, reject) {
    p.then(resolve).catch(function(err) {
      const errStr = errorToString(err);
      for (const arg of args) {
        if (arg === errStr) {
          resolve(undefined);
          return;
        }
      }
      reject(err);
    });
  });
}

/*
* withError is used to wrap an async function such that it returns any error instead of throwing it
*
* const { err, data } = await withError(someAsyncFunc(arg0, arg1));
* if (err) { ... }
*/

export async function withError<T>(p: Promise<T>): Promise<{ err?: ErrorType, data?: T }> {
  return new Promise(function(resolve) {
    p
      .then(data => resolve({ data }))
      .catch(err => resolve({ err }));
  });
}
