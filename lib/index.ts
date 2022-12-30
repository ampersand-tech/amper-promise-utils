/**
* Copyright 2017-present Ampersand Technologies, Inc.
*/

type StashOf<T> = {
    [k: string]: T;
};
type Stash = StashOf<any>;

type ErrorType = undefined | null | string | Error;

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

export async function parallel<T>(promises: Promise<T>[]) {
  const res = await parallelWithErrors(promises);
  if (res.firstErr) {
    throw res.firstErr;
  }
  return res.data as T[];
}

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


export class SerialExecutor {
  private queue = [] as {promise: ResolvablePromise<any>, cmd: any, args: any[]}[];
  private signal: ResolvablePromise<void> | null = null;

  // Overloads for type checking:
  run<TR>(cmd: () => Promise<TR>): Promise<TR>;
  run<TR, T0>(cmd: (arg0: T0) => Promise<TR>, arg0: T0): Promise<TR>;
  run<TR, T0, T1>(cmd: (arg0: T0, arg1: T1) => Promise<TR>, arg0: T0, arg1: T1): Promise<TR>;
  run<TR, T0, T1, T2>(cmd: (arg0: T0, arg1: T1, arg2: T2) => Promise<TR>, arg0: T0, arg1: T1, arg2: T2): Promise<TR>;
  run<TR, T0, T1, T2, T3>(cmd: (arg0: T0, arg1: T1, arg2: T2, arg3: T3) => Promise<TR>, arg0: T0, arg1: T1, arg2: T2, arg3: T3): Promise<TR>;
  run<TR, T0, T1, T2, T3, T4>(
    cmd: (arg0: T0, arg1: T1, arg2: T2, arg3: T3, arg4: T4) => Promise<TR>,
    arg0: T0, arg1: T1, arg2: T2, arg3: T3, arg4: T4,
  ): Promise<TR>;
  run<TR, T0, T1, T2, T3, T4, T5>(
    cmd: (arg0: T0, arg1: T1, arg2: T2, arg3: T3, arg4: T4, arg5: T5) => Promise<TR>,
    arg0: T0, arg1: T1, arg2: T2, arg3: T3, arg4: T4, arg5: T5,
  ): Promise<TR>;
  run<TR, T0, T1, T2, T3, T4, T5, T6>(
    cmd: (arg0: T0, arg1: T1, arg2: T2, arg3: T3, arg4: T4, arg5: T5, arg6: T6) => Promise<TR>,
    arg0: T0, arg1: T1, arg2: T2, arg3: T3, arg4: T4, arg5: T5, arg6: T6,
  ): Promise<TR>;
  run<TR, T0, T1, T2, T3, T4, T5, T6, T7>(
    cmd: (arg0: T0, arg1: T1, arg2: T2, arg3: T3, arg4: T4, arg5: T5, arg6: T6, arg7: T7) => Promise<TR>,
    arg0: T0, arg1: T1, arg2: T2, arg3: T3, arg4: T4, arg5: T5, arg6: T6, arg7: T7,
  ): Promise<TR>;
  run<TR, T0, T1, T2, T3, T4, T5, T6, T7, T8>(
    cmd: (arg0: T0, arg1: T1, arg2: T2, arg3: T3, arg4: T4, arg5: T5, arg6: T6, arg7: T7, arg8: T8) => Promise<TR>,
    arg0: T0, arg1: T1, arg2: T2, arg3: T3, arg4: T4, arg5: T5, arg6: T6, arg7: T7, arg8: T8,
  ): Promise<TR>;

  run(cmd, ...args) {
    const promise = new ResolvablePromise<any>();
    this.queue.push({promise, cmd, args});
    if (this.signal) {
      this.signal.resolve();
    }
    return promise.promise;
  }

  constructor() {
    this.runExecutor().then(() => {
      // noop
    }).catch(err => {
      console.error('SerialExecutor error', err);
    });
  }

  private async runExecutor() {
    let entry;
    while (true) {
      entry = this.queue.shift()
      if (entry) {
        const res = await withError(entry.cmd(...entry.args));
        entry.promise.settle(res.err, res.data);
      } else {
        this.signal = new ResolvablePromise();
        await this.signal.promise;
        this.signal = null;
      }
    }
  }
}

export function forever() {
  return new Promise(function() {
    // never resolves
  });
}

export function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

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

export async function withError<T>(p: Promise<T>): Promise<{ err?: ErrorType, data?: T }> {
  return new Promise(function(resolve) {
    p
      .then(data => resolve({ data }))
      .catch(err => resolve({ err }));
  });
}

export class ResolvablePromise<T> {
  promise: Promise<T>;
  resolve: (value: T | PromiseLike<T>) => void;
  reject: (reason?: any) => void;

  constructor() {
    this.promise = new Promise((resolve, reject) => {
      this.resolve = resolve;
      this.reject = reject;
    });
  }

  settle(err?: ErrorType, data?: T | PromiseLike<T>) {
    if (err) {
      this.reject(err);
    } else {
      this.resolve(data!);
    }
  }
}
