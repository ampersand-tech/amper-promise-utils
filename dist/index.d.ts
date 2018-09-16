/**
* Copyright 2017-present Ampersand Technologies, Inc.
*/
declare type StashOf<T> = {
    [k: string]: T;
};
declare type ErrorType = undefined | null | string | Error;
declare type ErrDataCB<T> = (err?: ErrorType, data?: T) => void;
export declare function wrap<TR>(cmd: (cb: ErrDataCB<TR>) => void): Promise<TR>;
export declare function wrap<T0, TR>(cmd: (arg0: T0, cb: ErrDataCB<TR>) => void, arg0: T0): Promise<TR>;
export declare function wrap<T0, T1, TR>(cmd: (arg0: T0, arg1: T1, cb: ErrDataCB<TR>) => void, arg0: T0, arg1: T1): Promise<TR>;
export declare function wrap<T0, T1, T2, TR>(cmd: (arg0: T0, arg1: T1, arg2: T2, cb: ErrDataCB<TR>) => void, arg0: T0, arg1: T1, arg2: T2): Promise<TR>;
export declare function wrap<T0, T1, T2, T3, TR>(cmd: (arg0: T0, arg1: T1, arg2: T2, arg3: T3, cb: ErrDataCB<TR>) => void, arg0: T0, arg1: T1, arg2: T2, arg3: T3): Promise<TR>;
export declare function wrap<T0, T1, T2, T3, T4, TR>(cmd: (arg0: T0, arg1: T1, arg2: T2, arg3: T3, arg4: T4, cb: ErrDataCB<TR>) => void, arg0: T0, arg1: T1, arg2: T2, arg3: T3, arg4: T4): Promise<TR>;
export declare function wrap<T0, T1, T2, T3, T4, T5, TR>(cmd: (arg0: T0, arg1: T1, arg2: T2, arg3: T3, arg4: T4, arg5: T5, cb: ErrDataCB<TR>) => void, arg0: T0, arg1: T1, arg2: T2, arg3: T3, arg4: T4, arg5: T5): Promise<TR>;
export declare function wrap<T0, T1, T2, T3, T4, T5, T6, TR>(cmd: (arg0: T0, arg1: T1, arg2: T2, arg3: T3, arg4: T4, arg5: T5, arg6: T6, cb: ErrDataCB<TR>) => void, arg0: T0, arg1: T1, arg2: T2, arg3: T3, arg4: T4, arg5: T5, arg6: T6): Promise<TR>;
export declare function wrap<T0, T1, T2, T3, T4, T5, T6, T7, TR>(cmd: (arg0: T0, arg1: T1, arg2: T2, arg3: T3, arg4: T4, arg5: T5, arg6: T6, arg7: T7, cb: ErrDataCB<TR>) => void, arg0: T0, arg1: T1, arg2: T2, arg3: T3, arg4: T4, arg5: T5, arg6: T6, arg7: T7): Promise<TR>;
export declare function wrapMember<TR>(obj: object, cmd: (cb: ErrDataCB<TR>) => void): Promise<TR>;
export declare function wrapMember<T0, TR>(obj: object, cmd: (arg0: T0, cb: ErrDataCB<TR>) => void, arg0: T0): Promise<TR>;
export declare function wrapMember<T0, T1, TR>(obj: object, cmd: (arg0: T0, arg1: T1, cb: ErrDataCB<TR>) => void, arg0: T0, arg1: T1): Promise<TR>;
export declare function wrapMember<T0, T1, T2, TR>(obj: object, cmd: (arg0: T0, arg1: T1, arg2: T2, cb: ErrDataCB<TR>) => void, arg0: T0, arg1: T1, arg2: T2): Promise<TR>;
export declare function wrapMember<T0, T1, T2, T3, TR>(obj: object, cmd: (arg0: T0, arg1: T1, arg2: T2, arg3: T3, cb: ErrDataCB<TR>) => void, arg0: T0, arg1: T1, arg2: T2, arg3: T3): Promise<TR>;
export declare function wrapMember<T0, T1, T2, T3, T4, TR>(obj: object, cmd: (arg0: T0, arg1: T1, arg2: T2, arg3: T3, arg4: T4, cb: ErrDataCB<TR>) => void, arg0: T0, arg1: T1, arg2: T2, arg3: T3, arg4: T4): Promise<TR>;
export declare function wrapMember<T0, T1, T2, T3, T4, T5, TR>(obj: object, cmd: (arg0: T0, arg1: T1, arg2: T2, arg3: T3, arg4: T4, arg5: T5, cb: ErrDataCB<TR>) => void, arg0: T0, arg1: T1, arg2: T2, arg3: T3, arg4: T4, arg5: T5): Promise<TR>;
export declare function unwrap<T>(p: Promise<T>, cb: ErrDataCB<T>): void;
export declare function unwrapBind<T>(asyncFunc: () => Promise<T>): ((cb: ErrDataCB<T>) => void);
export declare function unwrapBind<T, T0>(asyncFunc: (arg0: T0) => Promise<T>): ((arg0: T0, cb: ErrDataCB<T>) => void);
export declare function unwrapBind<T, T0, T1>(asyncFunc: (arg0: T0, arg1: T1) => Promise<T>): ((arg0: T0, arg1: T1, cb: ErrDataCB<T>) => void);
export declare function unwrapBind<T, T0, T1, T2>(asyncFunc: (arg0: T0, arg1: T1, arg2: T2) => Promise<T>): ((arg0: T0, arg1: T1, arg2: T2, cb: ErrDataCB<T>) => void);
export declare function unwrapBind<T, T0, T1, T2, T3>(asyncFunc: (arg0: T0, arg1: T1, arg2: T2, arg3: T3) => Promise<T>): ((arg0: T0, arg1: T1, arg2: T2, arg3: T3, cb: ErrDataCB<T>) => void);
export declare function parallel<T>(promises: Promise<T>[]): Promise<T[]>;
export declare function parallelWithErrors<T>(promises: Promise<T>[]): Promise<{
    data: (T | undefined)[];
    firstErr: any;
    errs: (Error | undefined)[] | undefined;
}>;
export declare class ParallelQueue {
    private _queue;
    private _results;
    add<TR>(cmd: () => Promise<TR>): any;
    add<TR, T0>(cmd: (arg0: T0) => Promise<TR>, arg0: T0): any;
    add<TR, T0, T1>(cmd: (arg0: T0, arg1: T1) => Promise<TR>, arg0: T0, arg1: T1): any;
    add<TR, T0, T1, T2>(cmd: (arg0: T0, arg1: T1, arg2: T2) => Promise<TR>, arg0: T0, arg1: T1, arg2: T2): any;
    add<TR, T0, T1, T2, T3>(cmd: (arg0: T0, arg1: T1, arg2: T2, arg3: T3) => Promise<TR>, arg0: T0, arg1: T1, arg2: T2, arg3: T3): any;
    add<TR, T0, T1, T2, T3, T4>(cmd: (arg0: T0, arg1: T1, arg2: T2, arg3: T3, arg4: T4) => Promise<TR>, arg0: T0, arg1: T1, arg2: T2, arg3: T3, arg4: T4): any;
    add<TR, T0, T1, T2, T3, T4, T5>(cmd: (arg0: T0, arg1: T1, arg2: T2, arg3: T3, arg4: T4, arg5: T5) => Promise<TR>, arg0: T0, arg1: T1, arg2: T2, arg3: T3, arg4: T4, arg5: T5): any;
    add<TR, T0, T1, T2, T3, T4, T5, T6>(cmd: (arg0: T0, arg1: T1, arg2: T2, arg3: T3, arg4: T4, arg5: T5, arg6: T6) => Promise<TR>, arg0: T0, arg1: T1, arg2: T2, arg3: T3, arg4: T4, arg5: T5, arg6: T6): any;
    add<TR, T0, T1, T2, T3, T4, T5, T6, T7>(cmd: (arg0: T0, arg1: T1, arg2: T2, arg3: T3, arg4: T4, arg5: T5, arg6: T6, arg7: T7) => Promise<TR>, arg0: T0, arg1: T1, arg2: T2, arg3: T3, arg4: T4, arg5: T5, arg6: T6, arg7: T7): any;
    add<TR, T0, T1, T2, T3, T4, T5, T6, T7, T8>(cmd: (arg0: T0, arg1: T1, arg2: T2, arg3: T3, arg4: T4, arg5: T5, arg6: T6, arg7: T7, arg8: T8) => Promise<TR>, arg0: T0, arg1: T1, arg2: T2, arg3: T3, arg4: T4, arg5: T5, arg6: T6, arg7: T7, arg8: T8): any;
    collate<TR>(key: string, cmd: () => Promise<TR>): any;
    collate<TR, T0>(key: string, cmd: (arg0: T0) => Promise<TR>, arg0: T0): any;
    collate<TR, T0, T1>(key: string, cmd: (arg0: T0, arg1: T1) => Promise<TR>, arg0: T0, arg1: T1): any;
    collate<TR, T0, T1, T2>(key: string, cmd: (arg0: T0, arg1: T1, arg2: T2) => Promise<TR>, arg0: T0, arg1: T1, arg2: T2): any;
    collate<TR, T0, T1, T2, T3>(key: string, cmd: (arg0: T0, arg1: T1, arg2: T2, arg3: T3) => Promise<TR>, arg0: T0, arg1: T1, arg2: T2, arg3: T3): any;
    collate<TR, T0, T1, T2, T3, T4>(key: string, cmd: (arg0: T0, arg1: T1, arg2: T2, arg3: T3, arg4: T4) => Promise<TR>, arg0: T0, arg1: T1, arg2: T2, arg3: T3, arg4: T4): any;
    collate<TR, T0, T1, T2, T3, T4, T5>(key: string, cmd: (arg0: T0, arg1: T1, arg2: T2, arg3: T3, arg4: T4, arg5: T5) => Promise<TR>, arg0: T0, arg1: T1, arg2: T2, arg3: T3, arg4: T4, arg5: T5): any;
    collate<TR, T0, T1, T2, T3, T4, T5, T6>(key: string, cmd: (arg0: T0, arg1: T1, arg2: T2, arg3: T3, arg4: T4, arg5: T5, arg6: T6) => Promise<TR>, arg0: T0, arg1: T1, arg2: T2, arg3: T3, arg4: T4, arg5: T5, arg6: T6): any;
    collate<TR, T0, T1, T2, T3, T4, T5, T6, T7>(key: string, cmd: (arg0: T0, arg1: T1, arg2: T2, arg3: T3, arg4: T4, arg5: T5, arg6: T6, arg7: T7) => Promise<TR>, arg0: T0, arg1: T1, arg2: T2, arg3: T3, arg4: T4, arg5: T5, arg6: T6, arg7: T7): any;
    collate<TR, T0, T1, T2, T3, T4, T5, T6, T7, T8>(key: string, cmd: (arg0: T0, arg1: T1, arg2: T2, arg3: T3, arg4: T4, arg5: T5, arg6: T6, arg7: T7, arg8: T8) => Promise<TR>, arg0: T0, arg1: T1, arg2: T2, arg3: T3, arg4: T4, arg5: T5, arg6: T6, arg7: T7, arg8: T8): any;
    private runThread;
    run(parallelCount?: number): Promise<StashOf<any>>;
}
export declare function forever(): Promise<{}>;
export declare function sleep(ms: number): Promise<{}>;
export declare class ActionTimeout {
    readonly ms: number;
    readonly timeoutMsg: string;
    readonly onTimeout?: (() => Promise<void>) | undefined;
    private _noTimeoutFail;
    constructor(ms: number, timeoutMsg?: string, onTimeout?: (() => Promise<void>) | undefined);
    private timeout;
    run<T>(action: () => Promise<T>): Promise<T>;
    clearTimeout(): void;
}
export declare function ignoreError<T>(p: Promise<T>, ...args: string[]): Promise<T | undefined>;
export declare function withError<T>(p: Promise<T>): Promise<{
    err?: ErrorType;
    data?: T;
}>;
export {};
