"use strict";
/**
* Copyright 2017-present Ampersand Technologies, Inc.
*/
Object.defineProperty(exports, "__esModule", { value: true });
const ErrorUtils = require("amper-utils/dist/errorUtils");
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
function returnErrHandler(resolve, _reject, err, data) {
    resolve({ err, data });
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
function wrapReturnError(...args) {
    const cmd = args.shift();
    return wrapInternal({}, cmd, args, returnErrHandler);
}
exports.wrapReturnError = wrapReturnError;
function wrapMemberReturnError(obj, cmd, ...args) {
    return wrapInternal(obj, cmd, args, returnErrHandler);
}
exports.wrapMemberReturnError = wrapMemberReturnError;
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
    const res = await parallelReturnErrors(promises);
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
async function parallelReturnErrors(promises) {
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
exports.parallelReturnErrors = parallelReturnErrors;
class ParallelQueue {
    constructor() {
        this.queue = [];
        this.results = {};
    }
    add(cmd, ...args) {
        this.queue.push({ cmd, args });
    }
    collate(key, cmd, ...args) {
        this.queue.push({ key, cmd, args });
    }
    async runThread() {
        let entry;
        while (entry = this.queue.shift()) {
            const res = await entry.cmd(...entry.args);
            if (entry.key) {
                this.results[entry.key] = res;
            }
        }
    }
    async run(parallelCount = 20) {
        const ps = [];
        for (let i = 0; i < parallelCount; ++i) {
            ps.push(this.runThread());
        }
        await parallel(ps);
        return this.results;
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
        this.noTimeoutFail = false;
    }
    async timeout() {
        await sleep(this.ms);
        if (!this.noTimeoutFail) {
            this.noTimeoutFail = true;
            if (this.onTimeout) {
                await this.onTimeout();
            }
            throw this.timeoutMsg;
        }
    }
    run(action) {
        const succeed = async () => {
            const result = await action();
            this.noTimeoutFail = true;
            return result;
        };
        return Promise.race([this.timeout(), succeed()]);
    }
    clearTimeout() {
        this.noTimeoutFail = true;
    }
}
exports.ActionTimeout = ActionTimeout;
/*
* ignoreError is used to wrap a promise with another promise that will resolve instead of reject if
* the original promise rejects with an error that matches any of the given error strings
*
* const val = await ignoreError(somePromise, 'not found', 'offline');
*/
function ignoreError(p, ...args) {
    return new Promise(function (resolve, reject) {
        p.then(resolve).catch(function (err) {
            const errStr = ErrorUtils.errorToString(err, false);
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
