"use strict";
/**
* Copyright 2017-present Ampersand Technologies, Inc.
*/
Object.defineProperty(exports, "__esModule", { value: true });
exports.withError = exports.ignoreError = exports.ActionTimeout = exports.sleep = exports.forever = exports.ParallelQueue = exports.parallelWithErrors = exports.parallel = void 0;
function errorToString(err) {
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
exports.ignoreError = ignoreError;
async function withError(p) {
    return new Promise(function (resolve) {
        p
            .then(data => resolve({ data }))
            .catch(err => resolve({ err }));
    });
}
exports.withError = withError;
