/**
* Copyright 2017-present Ampersand Technologies, Inc.
*
*/
import { parallelWithErrors, unwrap, unwrapBind, wrap, withError } from '../lib/index';

import * as chai from 'chai';
import * as domain from 'domain';

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

function delayThrow(delay: number, err: string, cb) {
  setTimeout(function() {
    if (err) {
      throw new Error(err);
    }
    cb();
  }, delay);
}

function delayCallback(delay: number, err: string|null, value: any, cb) {
  setTimeout(function() {
    cb(err, value);
  }, delay);
}


describe('promiseUtils', function() {
  describe('wrap', function() {
    it('should convert data to resolved promise', async function() {
      const val = await wrap(delayCallback, 10, null, 'success');
      expect(val).to.equal('success');
    });

    it('should convert err to rejected promise', async function() {
      let err;
      try {
        await wrap(delayCallback, 10, 'fail', null);
      } catch (e) {
        err = e;
      }
      expect(err).to.equal('fail');
    });

    it('should catch domain exceptions', async function() {
      let err;
      try {
        await wrap(delayThrow, 10, 'crashy');
      } catch (e) {
        err = e;
      }
      expect(err).property('message').to.equal('crashy');
    });
  });

  describe('unwrap', function() {
    it('should convert resolved promise to data', function(done) {
      unwrap(delayResolve(10, 'data'), function(err, data) {
        expect(err).to.equal(null);
        expect(data).to.equal('data');
        done();
      });
    });

    it('should convert rejected promise to err', function(done) {
      unwrap(delayReject(10, 'fail'), function(err, data) {
        expect(err).property('message').to.equal('fail');
        expect(data).to.equal(undefined);
        done();
      });
    });

    it('should allow errors after promise completion to be handled by the domain', function(done) {
      this.timeout(50); // tslint:disable-line:no-invalid-this
      const d = domain.create();
      d.on('error', (err) => {
        expect(err).property('message').to.equal('hello');
        done();
      });
      d.run(() => {
        unwrap(delayResolve(10, 'data'), function() {
          throw new Error('hello');
        });
      });
    });
  });

  describe('unwrapBind', function() {
    it('should pass args through', function(done) {
      const func = unwrapBind(delayResolve);
      func(10, 'hi', function(err, data) {
        expect(err).to.equal(null);
        expect(data).to.equal('hi');
        done();
      });
    });

    it('should convert rejected promise to err', function(done) {
      const func = unwrapBind(delayReject);
      func(10, 'bye', function(err, data) {
        expect(err).property('message').to.equal('bye');
        expect(data).to.equal(undefined);
        done();
      });
    });
  });

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
