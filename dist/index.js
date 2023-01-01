"use strict";
/**
* Copyright 2017-present Ampersand Technologies, Inc.
*/
Object.defineProperty(exports, "__esModule", { value: true });
exports.ResolvablePromise = exports.withError = exports.ignoreError = exports.ActionTimeout = exports.sleep = exports.forever = exports.SerialExecutor = exports.ParallelQueue = exports.parallelWithErrors = exports.parallel = void 0;
const errorUtils_1 = require("amper-utils/dist/errorUtils");
async function parallel(promises) {
    const res = await parallelWithErrors(promises);
    if (res.firstErr) {
        throw res.firstErr;
    }
    return res.data;
}
exports.parallel = parallel;
async function parallelWithErrors(promises) {
    const count = promises.length;
    const data = new Array(count);
    const errs = new Array(count);
    let firstErr;
    function onResult(resolve, i, err, val) {
        if (err) {
            errs[i] = err;
            if (!firstErr) {
                firstErr = err;
            }
        }
        data[i] = val;
        resolve();
    }
    const ps = [];
    for (let i = 0; i < count; ++i) {
        const p = new Promise(function (resolve) {
            promises[i].then(onResult.bind(undefined, resolve, i, undefined), onResult.bind(undefined, resolve, i));
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
exports.parallelWithErrors = parallelWithErrors;
class ParallelQueue {
    constructor() {
        this._queue = [];
        this._results = {};
    }
    add(cmd, ...args) {
        this._queue.push({ cmd, args });
    }
    collate(key, cmd, ...args) {
        this._queue.push({ key, cmd, args });
    }
    async runThread() {
        let entry;
        while (entry = this._queue.shift()) {
            const res = await entry.cmd(...entry.args);
            if (entry.key) {
                this._results[entry.key] = res;
            }
        }
    }
    async run(parallelCount = 20) {
        const ps = [];
        for (let i = 0; i < parallelCount; ++i) {
            ps.push(this.runThread());
        }
        await parallel(ps);
        return this._results;
    }
}
exports.ParallelQueue = ParallelQueue;
class SerialExecutor {
    run(cmd, ...args) {
        const promise = new ResolvablePromise();
        this.queue.push({ promise, cmd, args });
        if (this.signal) {
            this.signal.resolve();
        }
        return promise.promise;
    }
    constructor() {
        this.queue = [];
        this.signal = null;
        this.isRunning = true;
        this.runExecutor().then(() => {
            // noop
        }).catch(err => {
            console.error('SerialExecutor error', err);
        });
    }
    async destroy() {
        // flush the queue and set isRunning inside the command callback, so
        // that the signal will not get created and awaited
        await this.run(async () => {
            this.isRunning = false;
        });
    }
    async runExecutor() {
        while (this.isRunning) {
            const entry = this.queue.shift();
            if (entry) {
                const res = await withError(entry.cmd(...entry.args));
                entry.promise.settle(res.err, res.data);
            }
            else {
                this.signal = new ResolvablePromise();
                await this.signal.promise;
                this.signal = null;
            }
        }
    }
    isBusy() {
        return Boolean(this.isRunning && (this.queue.length || !this.signal));
    }
}
exports.SerialExecutor = SerialExecutor;
function forever() {
    return new Promise(function () {
        // never resolves
    });
}
exports.forever = forever;
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}
exports.sleep = sleep;
class ActionTimeout {
    constructor(ms, timeoutMsg = 'timed out', onTimeout) {
        this.ms = ms;
        this.timeoutMsg = timeoutMsg;
        this.onTimeout = onTimeout;
        this._noTimeoutFail = false;
    }
    async timeout() {
        await sleep(this.ms);
        if (!this._noTimeoutFail) {
            this._noTimeoutFail = true;
            if (this.onTimeout) {
                await this.onTimeout();
            }
            throw this.timeoutMsg;
        }
    }
    run(action) {
        const succeed = async () => {
            const result = await action();
            this._noTimeoutFail = true;
            return result;
        };
        return Promise.race([this.timeout(), succeed()]);
    }
    clearTimeout() {
        this._noTimeoutFail = true;
    }
}
exports.ActionTimeout = ActionTimeout;
function ignoreError(p, ...args) {
    return new Promise(function (resolve, reject) {
        p.then(resolve).catch(function (err) {
            const errStr = (0, errorUtils_1.errorToString)(err, false);
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
exports.ignoreError = ignoreError;
async function withError(p) {
    return new Promise(function (resolve) {
        p
            .then(data => resolve({ data }))
            .catch(err => resolve({ err }));
    });
}
exports.withError = withError;
class ResolvablePromise {
    constructor() {
        this.promise = new Promise((resolve, reject) => {
            this.resolve = resolve;
            this.reject = reject;
        });
    }
    settle(err, data) {
        if (err === undefined || err === null) {
            this.resolve(data);
        }
        else {
            this.reject(err);
        }
    }
}
exports.ResolvablePromise = ResolvablePromise;
