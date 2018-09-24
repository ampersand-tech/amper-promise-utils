// @flow
declare module "amper-promise-utils" {
  declare type StashOf<T> = {
      [k: string]: T;
  };
  declare type ErrorType = void | null | string | Error;
  declare function parallel<T>(promises: Promise<T>[]): Promise<T[]>;
  declare function parallelWithErrors<T>(promises: Promise<T>[]): Promise<{
      data: (T | void)[];
      firstErr: any;
      errs: (Error | void)[] | void;
  }>;
  declare class ParallelQueue {
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
  declare function forever(): Promise<{}>;
  declare function sleep(ms: number): Promise<{}>;
  declare class ActionTimeout {
      readonly ms: number;
      readonly timeoutMsg: string;
      readonly onTimeout?: (() => Promise<void>) | void;
      private _noTimeoutFail;
      constructor(ms: number, timeoutMsg?: string, onTimeout?: (() => Promise<void>) | void);
      private timeout;
      run<T>(action: () => Promise<T>): Promise<T>;
      clearTimeout(): void;
  }
  declare function ignoreError<T>(p: Promise<T>, ...args: string[]): Promise<T | void>;
  declare function withError<T>(p: Promise<T>): Promise<{
      err?: ErrorType;
      value?: T;
  }>;
}
