"use strict";
/**
* Copyright 2017-present Ampersand Technologies, Inc.
*/
Object.defineProperty(exports, "__esModule", { value: true });
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
let domain;
try {
    domain = require('domain');
}
catch (_e) {
    domain = undefined;
}
/*
* wrap is used for turning a traditional node cb(err, data) function call into a Promise.
* It wraps the call in a domain (in node.js) to handle async exceptions.
*
* Note that the first parameter to wrapMember is the "this" object for the call; if you don't need one, use wrap instead.
*/
function wrapInternal(obj, cmd, args, handler) {
    return new Promise(function (resolve, reject) {
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
        }
        else {
            applyCmd();
        }
    });
}
function throwErrHandler(resolve, reject, err, data) {
    if (err) {
        reject(err);
    }
    else {
        resolve(data);
    }
}
function wrap(...args) {
    const cmd = args.shift();
    return wrapInternal({}, cmd, args, throwErrHandler);
}
exports.wrap = wrap;
function wrapMember(obj, cmd, ...args) {
    return wrapInternal(obj, cmd, args, throwErrHandler);
}
exports.wrapMember = wrapMember;
/*
* unwrap is used to interface Promise-based code back out to a caller that wants a traditional cb(err, data) callback.
*/
function unwrap(p, cb) {
    let d;
    if (domain) {
        d = domain.active;
    }
    function onResult(err, val) {
        // use setTimeout to escape the Promise exception catching and allow errors in cb() to be caught by the domain error handler
        setTimeout(function () {
            d && d.enter();
            cb(err, val);
            d && d.exit();
        }, 0);
    }
    p.then(onResult.bind(undefined, null), onResult);
}
exports.unwrap = unwrap;
function unwrapBind(asyncFunc) {
    return function (...args) {
        const cb = args.pop();
        const p = asyncFunc.apply(null, args);
        unwrap(p, cb);
    };
}
exports.unwrapBind = unwrapBind;
/*
* waits for all promises passed in to complete or error (unlike Promise.all, which will reject immediately upon first error)
*/
async function parallel(promises) {
    const res = await parallelWithErrors(promises);
    if (res.firstErr) {
        throw res.firstErr;
    }
    return res.data;
}
exports.parallel = parallel;
/*
* waits for all promises passed in to complete or error (unlike Promise.all, which will reject immediately upon first error)
* returns errors instead of throwing them, so caller can cleanup anything that succeeded
*/
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
/*
* forever returns a Promise that never resolves; used in cases where you want to enter an infinite event-handling loop.
*/
function forever() {
    return new Promise(function () {
        // never resolves
    });
}
exports.forever = forever;
/*
* sleep is a Promise-wrapped version of setTimeout.
*/
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}
exports.sleep = sleep;
/*
* ActionTimeout runs the action but early-out rejects if it takes longer than ms time
*/
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
/*
* ignoreError is used to wrap a promise with another promise that will resolve instead of reject if
* the original promise rejects with an error that matches any of the given error strings
*
* const val = await ignoreError(someAsyncFunc(arg0, arg1), 'not found', 'offline');
*/
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
/*
* withError is used to wrap an async function such that it returns any error instead of throwing it
*
* const { err, data } = await withError(someAsyncFunc(arg0, arg1));
* if (err) { ... }
*/
async function withError(p) {
    return new Promise(function (resolve) {
        p
            .then(data => resolve({ data }))
            .catch(err => resolve({ err }));
    });
}
exports.withError = withError;
