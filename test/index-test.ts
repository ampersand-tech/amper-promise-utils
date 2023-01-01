import { parallelWithErrors, SerialExecutor, sleep, withError } from '../lib/index';

import { expect } from 'chai';
import { describe, it } from 'mocha';

function delayResolve<T>(delay: number, value: T): Promise<T> {
  return new Promise(resolve => {
    setTimeout(function() {
      resolve(value);
    }, delay);
  });
}

function delayReject(delay: number, err: string): Promise<any> {
  return new Promise((_resolve, reject) => {
    setTimeout(function() {
      reject(new Error(err));
    }, delay);
  });
}

describe('parallelWithErrors', function() {
  it('should return all data even if a promise is rejected', async function() {
    const ps = [
      delayResolve(10, 1),
      delayResolve(5, 2),
      delayReject(7, 'rejected'),
    ];

    const res = await parallelWithErrors(ps);
    expect(res.data).to.deep.equal([1, 2, undefined]);
    expect(res.firstErr).property('message').to.equal('rejected');
    expect(res.errs![2]).property('message').to.equal('rejected');
  });
});

describe('withError', function() {
  it('should return data', async function() {
    const { err, data } = await withError(delayResolve(1, 'yay'));
    expect(err).to.equal(undefined);
    expect(data).to.equal('yay');
  });
  it('should return error', async function() {
    const { err, data } = await withError(delayReject(1, 'nay'));
    expect(err).property('message').to.equal('nay');
    expect(data).to.equal(undefined);
  });
});

describe('SerialExecutor', function() {
  it('should execute serially', async function() {
    const res = [] as number[];

    const se = new SerialExecutor();
    expect(se.isBusy()).to.equal(false);

    // run three commands without awaiting
    se.run(async () => {
      await sleep(5);
      res.push(1);
    });
    expect(se.isBusy()).to.equal(true);
    se.run(async () => {
      await sleep(1);
      res.push(2);
    });
    expect(se.isBusy()).to.equal(true);
    se.run(async () => {
      await sleep(10);
      res.push(3);
    });
    expect(se.isBusy()).to.equal(true);

    // flush
    await se.run(async () => {
      await sleep(0);
      res.push(4);
    });
    expect(se.isBusy()).to.equal(false);

    // verify they ran in serial instead of in parallel
    expect(res).to.deep.equal([1, 2, 3, 4]);

    // destroy
    const p = se.destroy();
    expect(se.isBusy()).to.equal(true);
    await p;
    expect(se.isBusy()).to.equal(false);
  });
});
