import { parallelWithErrors, withError } from '../lib/index';

import * as chai from 'chai';

const expect = chai.expect;

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

describe('promiseUtils', function() {
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
});
